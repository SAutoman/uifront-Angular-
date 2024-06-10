/**
 * global
 */
import { BehaviorSubject } from 'rxjs';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { GridComponent, GridDataResult } from '@progress/kendo-angular-grid';
import { cloneDeep } from 'lodash-core';
import { filter, take } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';
import { formatNumber } from '@angular/common';
import { DateTime } from 'luxon';

/**
 * project
 */
import { SearchFieldModel } from '@wfm/service-layer/models/dynamic-entity-models';
import {
  AreaTypeEnum,
  BaseDynamicEntityDto,
  ColumnSettings,
  DynamicEntitiesService,
  DynamicEntityDto,
  FieldTypeIds,
  GridSettings,
  Paging,
  SchemaFieldDto,
  Sorting,
  ListItemDto,
  SchemaDto,
  DocumentUploadService,
  WorkflowStatusDto,
  AllowedColumnSettings,
  CompanyService,
  SharedService,
  ShortenerUrlService,
  FileInfoExtDto,
  AggregationConfig
} from '@wfm/service-layer';

import {
  BaseFieldValueType,
  DecimalFieldValueDto,
  IntFieldValueDto,
  FileFieldValueDto,
  EmbededFieldValueDto,
  ConnectorFieldValueDto
} from '@wfm/service-layer/models/FieldValueDto';
import DateTimeFormatHelper from '@wfm/shared/dateTimeFormatHelper';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { AuthState, loggedInState } from '@wfm/store';
import { workflowStatusesSelector } from '@wfm/store/workflow';
import { getHyperlinkUrl } from '@wfm/shared/utils';
import { GridSystemFieldsEnum } from '@wfm/shared/dynamic-entity-grid/dynamic-grid-system-fields';

/**
 * local
 */
import { CompaniesCacheService } from './companies-cache.service';
import { populateListOptionValue } from '../helpers/list-item-display.helper';
import { DocumentCacheService } from './document.cache.service';
import { FormulaConfig } from '../models/formula';
import { FormulaEngineService } from './formula-engine';
import { ConditionalFormatting } from '../models/conditional-formatting';
import { ReportGridColumnItem } from '@wfm/report/report-datasource.model';
import { HyperLinkVisibiltySettingEnum } from '@wfm/common/field/field-hyperlink-settings/field-hyperlink-settings.component';
import { GridDataWithAggregation } from '@wfm/shared/dynamic-entity-grid/dynamic-entity-grid.component';

export const hyperLinkDataKey: string = '-hyperLinkData';

interface Row {
  [key: string]: any;
  publicId?: string;
  status?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  suppliers?: string;
  auditors?: string;
  statusConfig?: {
    color?: string;
    statusInfo?: {
      name: string;
      id: string;
    };
    currentStatusId?: string;
  };
}

export enum QueryingArea {
  DynamicEntityGrid = 'deGrid',
  CasePrintPreview = 'casePrint',
  CaseComments = 'caseComments'
}

export const virtualFieldsSeparator = '_$_';

@Injectable({
  providedIn: 'root'
})
export class DynamicGridUiService extends BehaviorSubject<GridDataResult> {
  private userDateFormat: string;
  private userDateTimeFormat: string;
  private currentSchema: SchemaDto;
  private auth: AuthState;

  statusesMap: { [key: string]: WorkflowStatusDto };
  constructor(
    private dynamicEntitiesService: DynamicEntitiesService,
    private adminSchemaService: AdminSchemasService,
    private fileService: DocumentUploadService,
    private store: Store<ApplicationState>,
    private companyService: CompanyService,
    private companiesCacheService: CompaniesCacheService,
    @Inject(LOCALE_ID) public locale: string,
    private documentCache: DocumentCacheService,
    private formulaEngine: FormulaEngineService,
    private shortenerUrlService: ShortenerUrlService,
    private sharedService: SharedService
  ) {
    super(null);
    this.store
      .pipe(
        filter((x) => !!x),
        take(1),
        select(loggedInState)
      )
      .subscribe((auth) => {
        this.auth = auth;
      });

    this.loadStatusMap();
  }

  dy: DynamicEntityDto[];

  get dynamicEntities() {
    return this.dy;
  }

  loadStatusMap(): void {
    this.store
      .pipe(
        select(workflowStatusesSelector),
        filter((x) => !!x),
        take(1)
      )
      .subscribe((statusMap) => {
        this.statusesMap = statusMap;
      });
  }

  async query(
    areaType: AreaTypeEnum,
    tenantId: string,
    schemaId: string,
    paging?: Paging,
    filters?: SearchFieldModel[],
    sortArr?: Sorting[],
    queryingArea?: QueryingArea,
    aggregates?: AggregationConfig[]
  ): Promise<void> {
    this.populateDateFormats();

    this.currentSchema = await this.adminSchemaService.getSchema(tenantId, areaType, schemaId);
    const data = await this.dynamicEntitiesService.search(areaType, tenantId, schemaId, paging, sortArr, filters, aggregates);
    this.dy = data.items.map((item) => {
      return {
        ...item,
        schemaId: schemaId
      };
    });
    const pageData = await this.mapFields(data.items, queryingArea);
    super.next(<GridDataWithAggregation>{
      total: data.total,
      data: pageData,
      schemaData: this.currentSchema,
      aggregationResult: data.aggregationResult
    });
  }

  quickSearch(term: string, data: BaseDynamicEntityDto[]): BaseDynamicEntityDto[] {
    if (data) {
      const filteredData = [];
      data.forEach((it) => {
        // prevent from searc in publicId
        const item = cloneDeep(it);
        if (item.hasOwnProperty('publicId')) delete item.publicId;

        let propValueList = Object.values(item);
        for (let i = 0; i < propValueList.length; i++) {
          if (propValueList[i]) {
            if (propValueList[i].toString().toLowerCase().indexOf(term.toLowerCase()) > -1) {
              filteredData.push(it);
              break;
            }
          }
        }
      });
      // super.next(<GridDataResult>{ total: filteredData.length, data: filteredData });
      return filteredData;
    }
  }

  async queryMany(
    areaType: AreaTypeEnum,
    tenantId: string,
    schemaId: string,
    entities: string[],
    paging?: Paging,
    filters?: SearchFieldModel[],
    sortArr?: Sorting[],
    queryingArea?: QueryingArea
  ): Promise<void> {
    if (entities?.length) {
      this.populateDateFormats();

      this.currentSchema = await this.adminSchemaService.getSchema(tenantId, areaType, schemaId);
      const data = await this.dynamicEntitiesService.getMany(tenantId, areaType, schemaId, entities, paging, sortArr, filters);
      this.dy = data.items.map((item) => {
        return {
          ...item,
          schemaId: schemaId
        };
      });
      const pageData = await this.mapFields(data.items, queryingArea);
      super.next(<GridDataResult>{ total: data.total, data: pageData });
    } else {
      super.next(<GridDataResult>{ total: 0, data: [] });
    }
  }

  private async mapFields(dynamicEntities: DynamicEntityDto[], queryingArea?: QueryingArea): Promise<BaseDynamicEntityDto[]> {
    let data = [];
    this.loadStatusMap();
    for (const deItem of dynamicEntities) {
      const id = deItem.id;
      let row: Row = <Row>{};
      if (queryingArea && (queryingArea === QueryingArea.DynamicEntityGrid || queryingArea === QueryingArea.CasePrintPreview)) {
        row.publicId = id;
        const status = this.statusesMap[deItem.statusId] || {
          name: 'Unassigned',
          configuration: { color: 'gray' }
        };
        row.status = status.name;
        row.statusConfig = {
          ...status?.configuration,
          currentStatusId: deItem.statusId,
          statusInfo: { name: status.name, id: deItem.statusId }
        };
        row.statusConfig.color = row.statusConfig.color ? row.statusConfig.color : 'gray';
        if (deItem[GridSystemFieldsEnum.CREATED_AT]) {
          row.createdAt =
            queryingArea === QueryingArea.DynamicEntityGrid
              ? DateTimeFormatHelper.parseToLuxon(deItem[GridSystemFieldsEnum.CREATED_AT]).toJSDate()
              : DateTimeFormatHelper.formatDateTime(deItem[GridSystemFieldsEnum.CREATED_AT]);
        }
        if (deItem[GridSystemFieldsEnum.UPDATED_AT]) {
          row.updatedAt =
            queryingArea === QueryingArea.DynamicEntityGrid
              ? DateTimeFormatHelper.parseToLuxon(deItem[GridSystemFieldsEnum.UPDATED_AT]).toJSDate()
              : DateTimeFormatHelper.formatDateTime(deItem[GridSystemFieldsEnum.UPDATED_AT]);
        }
        if (deItem[GridSystemFieldsEnum.SUPPLIERS]) {
          const suppliers = await this.getSupplierAuditorCompanies(deItem[GridSystemFieldsEnum.SUPPLIERS]);
          row.suppliers = suppliers.join(', ');
        }
        if (deItem[GridSystemFieldsEnum.AUDITORS]) {
          const auditors = await this.getSupplierAuditorCompanies(deItem[GridSystemFieldsEnum.AUDITORS]);
          row.auditors = auditors.join(', ');
        }
        if (deItem[GridSystemFieldsEnum.EMAIL_COUNT] || deItem[GridSystemFieldsEnum.EMAIL_COUNT] === 0) {
          row.emailCount = deItem[GridSystemFieldsEnum.EMAIL_COUNT];
        }
      } else if (queryingArea === QueryingArea.CaseComments) {
        row.id = deItem.id;
        if (deItem[GridSystemFieldsEnum.CREATED_AT]) {
          row.createdAt = deItem[GridSystemFieldsEnum.CREATED_AT];
        }
      }
      for (const field of deItem.fields) {
        if (field) {
          let convertedField: BaseFieldValueType = this.dynamicEntitiesService.getDynamicFieldValue(field);
          if (convertedField) {
            if (queryingArea && queryingArea === QueryingArea.DynamicEntityGrid) {
              row[field.id] = await this.formatGridCell(convertedField, this.currentSchema);
            } else {
              row[field.id] = await this.getFormattedValue(convertedField, this.currentSchema);
            }
          }
        }
      }

      if (queryingArea && queryingArea === QueryingArea.DynamicEntityGrid) {
        await this.processVirtualFields(deItem, row);
      }
      if (this.currentSchema?.schemaConfiguration?.conditionalFormattings) {
        const deFieldsAndSystemFields = this.addSystemFields(deItem);
        this.checkForConditionalFormatting(row, this.currentSchema, deFieldsAndSystemFields);
      }

      const hyperlinkFieldsInSchema = this.currentSchema.fields.filter((x) => x.configuration.isHyperlink);

      if (hyperlinkFieldsInSchema?.length) {
        hyperlinkFieldsInSchema.forEach((field) => {
          const value = row[field.fieldName];
          if (value) row[`${field.fieldName}${hyperLinkDataKey}`] = this.populateHyperlinkDetails(field, value);
        });
      }
      data.push(row);
    }
    return data;
  }

  checkForConditionalFormatting(row: Row, schema: SchemaDto, fieldValues: BaseFieldValueType[]): Row {
    try {
      schema.schemaConfiguration?.conditionalFormattings?.forEach((formattingConfig: ConditionalFormatting) => {
        if (!formattingConfig.isDisabled && formattingConfig.conditionFormula && formattingConfig.formatting) {
          const formula: FormulaConfig = JSON.parse(formattingConfig.conditionFormula);
          const formulaFieldValues = {};
          formula.fields?.forEach((field) => {
            const path = field.fieldPath?.path;
            formulaFieldValues[field.key] = this.getValueByPath(fieldValues, path);
          });

          const conditionResult = this.formulaEngine.evaluateFormula(formula, formulaFieldValues, FieldTypeIds.BoolField);

          if (conditionResult === true) {
            row.meetsConditionalFormatting = true;
            row.conditionalFormattingClassName = formattingConfig.formatting.className || '';
            row.conditionalFormattingAreas = formattingConfig.formatting.types;
          }
        }
      });
    } catch (error) {
      console.log(error);
    } finally {
      return row;
    }
  }

  async getSupplierAuditorCompanies(companyIds: string[]): Promise<string[]> {
    try {
      const companyNames = [];
      if (companyIds?.length > 0) {
        for (const id of companyIds) {
          const company = await this.companiesCacheService.get(id, 60, async () => await this.companyService.getById(id));
          if (company) {
            companyNames.push(company.name);
          }
        }
      }
      return companyNames;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  /**
   * format all the formattable fields (number, date, list, file, bool)
   * used in other-than-grid areas
   */
  async getFormattedValue(field: BaseFieldValueType, schema: SchemaDto, useShortUrl?: boolean): Promise<any> {
    this.populateDateFormats();
    let value;
    const schemaField = schema?.fields.find((schemaField: SchemaFieldDto) => {
      return schemaField.fieldName === field.id;
    });
    if (schemaField) {
      switch (field.type) {
        case FieldTypeIds.DateField:
          // using the user's preferred date format
          const dateLuxon = DateTimeFormatHelper.parseToLuxon(<Date>field.value);
          value = this.userDateFormat ? dateLuxon?.toFormat(this.userDateFormat) : dateLuxon.toFormat('D');
          break;
        case FieldTypeIds.DateTimeField:
          // using the user's preferred date format + time
          const dateTimeLuxon = DateTimeFormatHelper.parseToLuxon(<Date>field.value);

          value = this.userDateTimeFormat
            ? dateTimeLuxon?.toFormat(this.userDateTimeFormat)
            : dateTimeLuxon?.toLocaleString(DateTime.DATETIME_SHORT);
          break;
        case FieldTypeIds.ListField:
          const newFieldValue = field?.value['listItemId'] ? field?.value['listItemId'] : field.value;
          const selection = schemaField?.configuration?.listOptions?.find((option: ListItemDto) => option.id === newFieldValue);
          if (selection) {
            value = populateListOptionValue(selection, schemaField.configuration?.listItemDisplaySetting);
          }
          break;
        case FieldTypeIds.MultiselectListField:
          value = this.populateMultiSelectValues(field, schemaField);
          break;
        case FieldTypeIds.FileField:
          value = await this.populateFileFieldDetails(<FileFieldValueDto>field, schemaField);
          break;

        case FieldTypeIds.DecimalField:
          const decimalFormatSettings = schemaField?.configuration?.numberFormatting;

          if (decimalFormatSettings) {
            let digitsInfo = `${decimalFormatSettings.minIntegerDigits || 1}.${decimalFormatSettings.minFractionDigits || 0}-${
              decimalFormatSettings.maxFractionDigits || 0
            }`;
            value = formatNumber((<DecimalFieldValueDto>field).value, this.locale, digitsInfo);
          } else {
            value = field.value;
          }
          break;
        case FieldTypeIds.IntField:
          const numberFormatSettings = schemaField?.configuration?.numberFormatting;
          if (numberFormatSettings) {
            let digitsInfo = `${numberFormatSettings.minIntegerDigits || 1}.${numberFormatSettings.minFractionDigits || 0}-${
              numberFormatSettings.maxFractionDigits || 0
            }`;
            value = formatNumber((<IntFieldValueDto>field).value, this.locale, digitsInfo);
          } else {
            value = field.value;
          }
          break;
        case FieldTypeIds.EmbededField:
          const fieldsValues = field.value as BaseFieldValueType[];
          const mappedValues = {};
          fieldsValues.forEach(async (deNestedField: BaseFieldValueType) => {
            if (deNestedField.type !== FieldTypeIds.ListOfLinksField) {
              mappedValues[deNestedField.id] = await this.getFormattedValue(
                deNestedField,
                schemaField as unknown as SchemaDto,
                useShortUrl
              );
            }
          });
          value = mappedValues;
          break;
        case FieldTypeIds.BoolField:
          value = field.value === true ? 'Yes' : field.value === false ? 'No' : '';
          break;
        case FieldTypeIds.ConnectorField:
          value = this.populateConnectorFieldValue(field, schemaField);

          break;
        default:
          value = field.value;
          break;
      }
      if (schemaField?.configuration?.isHyperlink && schemaField.configuration.hyperlinkTemplate && field?.value) {
        value = await this.populateHyperlink(schemaField, field.value.toString(), useShortUrl);
        value = this.sharedService.extractUrlFromString(value);
      }
    }
    return value;
  }

  /**
   * formatting only List fields and File fields, the rest to be formatted by Grid not to loose originalvalue types (needed for correct aggregations)
   */
  async formatGridCell(field: BaseFieldValueType, schema: SchemaDto): Promise<any> {
    let value;
    const schemaField = schema?.fields?.find((schemaField: SchemaFieldDto) => {
      return schemaField.fieldName === field.id;
    });
    if (!schemaField) {
      return;
    }
    switch (field.type) {
      case FieldTypeIds.ListField:
        const newFieldValue = field?.value['listItemId'] ? field?.value['listItemId'] : field.value;
        const selection = schemaField?.configuration?.listOptions?.find((option: ListItemDto) => option.id === newFieldValue);
        if (selection) {
          value = populateListOptionValue(selection, schemaField.configuration?.listItemDisplaySetting);
        }
        break;
      case FieldTypeIds.MultiselectListField:
        value = this.populateMultiSelectValues(field, schemaField);
        break;
      case FieldTypeIds.FileField:
        value = await this.populateFileFieldDetails(<FileFieldValueDto>field, schemaField);
        break;
      case FieldTypeIds.EmbededField:
        const fieldsValues = field.value as BaseFieldValueType[];
        const mappedValues = {};
        fieldsValues.forEach(async (deNestedField: BaseFieldValueType) => {
          const nestedSchema = schema.fields.find((f) => f.fieldName === deNestedField.id) as unknown as SchemaDto;
          if (nestedSchema) {
            mappedValues[deNestedField.id] = await this.formatGridCell(deNestedField, nestedSchema);
          }
        });
        value = mappedValues;
        break;
      case FieldTypeIds.DateField:
      case FieldTypeIds.DateTimeField:
        value = DateTimeFormatHelper.parseToLuxon(field.value as Date).toJSDate();
        break;
      case FieldTypeIds.ConnectorField:
        value = this.populateConnectorFieldValue(field, schemaField);
        break;
      default:
        value = field.value;
        break;
    }
    return value;
  }

  populateMultiSelectValues(field: BaseFieldValueType, schemaField: SchemaFieldDto): string {
    const fieldValue: string[] = field?.value as string[];
    let gridMultiSelectValues: string[] = [];
    if (fieldValue?.length) {
      fieldValue.forEach((f) => {
        const selectedValue = schemaField?.configuration?.listOptions?.find((option: ListItemDto) => option.id === f);
        if (selectedValue) {
          const finalValue = populateListOptionValue(selectedValue, schemaField.configuration?.listItemDisplaySetting);
          gridMultiSelectValues.push(finalValue);
        }
      });
      return gridMultiSelectValues?.length ? gridMultiSelectValues.join(', ') : null;
    }
    return null;
  }

  /**
   *
   * connectorField value is different in different endpoints
   * in search endpoint the value is an array of "{id}<?>{label}"-s
   * in other endpoints: getById, bulkGet, the value is an array of "{id}"-s
   *
   */

  populateConnectorFieldValue(field: BaseFieldValueType, schemaField: SchemaFieldDto): string[] {
    if ((<ConnectorFieldValueDto>field)?.value?.length) {
      return (<ConnectorFieldValueDto>field).value?.map((valueItem) => {
        //separator coming from backend
        const splits = valueItem.split('<?>');
        // if there is a label, return it, otherwise return the id
        return splits[1] || splits[0];
      });
    }
    return [];
  }

  async populateHyperlink(schemaField: SchemaFieldDto, fieldValue: string, useShortUrl: boolean): Promise<string> {
    const hyperlink = getHyperlinkUrl(schemaField.configuration?.hyperlinkTemplate, fieldValue);
    if (useShortUrl) {
      try {
        const result = await this.shortenerUrlService.getShortUrl(hyperlink);
        return result ? result.shortUrl : hyperlink;
      } catch (error) {
        console.error('Error generating short URL:', error);
        return hyperlink;
      }
    } else return hyperlink;
  }

  populateHyperlinkDetails(schemaField: SchemaFieldDto, fieldValue: string): { link: string; linkLabel: string } {
    const hyperlink = getHyperlinkUrl(schemaField.configuration?.hyperlinkTemplate, fieldValue);
    const linkSetting = schemaField.configuration.hyperLinkVisibility;
    return {
      link: hyperlink,
      linkLabel:
        linkSetting === HyperLinkVisibiltySettingEnum.hyperLinkWithValue
          ? hyperlink
          : linkSetting === HyperLinkVisibiltySettingEnum.onlyValue
          ? fieldValue
          : linkSetting === HyperLinkVisibiltySettingEnum.custom
          ? schemaField.configuration?.customHyperLinkLabel
          : hyperlink
    };
  }

  getGridSettingsFromGridComponent(grid: GridComponent): GridSettings {
    let columns = grid.columns.toArray().map((item) => {
      // think of better alternative of setting this prop
      if (!item['field'] && item.title) {
        item['isActionType'] = true;
      }

      return Object.keys(item)
        .filter((propName) => {
          return AllowedColumnSettings.indexOf(propName) >= 0;
        })
        .reduce((acc, curr) => ({ ...acc, ...{ [curr]: item[curr] } }), <ColumnSettings>{});
    });
    return {
      state: { sort: grid.sort },
      columnsConfig: columns?.sort((a, b) => a.orderIndex - b.orderIndex)
    };
  }

  mapGridSettings(settings: GridSettings, gridColumnFields: SchemaFieldDto[] | ReportGridColumnItem[]): GridSettings {
    if (!settings) {
      return null;
    }
    try {
      const state = settings.state;
      // To support previously saved layouts
      if (!settings?.state?.skip && !settings?.state?.take) {
        state.skip = 0;
        state.take = 50;
      }
      const settingsColumnsConfig = cloneDeep(settings?.columnsConfig);
      const columnsConfig = settingsColumnsConfig?.sort((a, b) => a.orderIndex - b.orderIndex);
      const cols = this.updateColsBasedOnSchemaFields(columnsConfig, gridColumnFields);
      return {
        state,
        columnsConfig: cols
      };
    } catch (e) {
      console.error(e);
      return;
    }
  }

  mapGridSettingsNonSchema(settings: string): GridSettings {
    if (!settings) {
      return null;
    }
    let gridSettings;
    try {
      gridSettings = JSON.parse(<any>settings);
    } catch (e) {
      console.error(e);
      return;
    }

    const state = gridSettings.state;

    return {
      state,
      columnsConfig: gridSettings?.columnsConfig?.sort((a, b) => a.orderIndex - b.orderIndex),
      groups: gridSettings?.groups,
      aggregates: gridSettings?.aggregates
    };
  }

  /**
   * updating our stored layout settings to be up to date
   * with schema fields (which can be added/removed/renamed)
   * @param cols
   * @param fields
   * @returns
   */

  updateColsBasedOnSchemaFields(cols: ColumnSettings[], fields: Array<SchemaFieldDto | ReportGridColumnItem>): ColumnSettings[] {
    let colMap: { [key: string]: ColumnSettings } = {};
    let fieldMap: { [key: string]: SchemaFieldDto | ReportGridColumnItem } = {};
    cols.forEach((col) => {
      if (col.title && col.field) {
        colMap[col.field] = col;
      }
    });

    fields
      .filter((field) => {
        return field.type !== FieldTypeIds.ListOfLinksField && field.type !== FieldTypeIds.EmbededField;
      })
      .forEach((field) => {
        fieldMap[field.fieldName] = field;
      });

    let toBeRemoved: string[] = [];
    let toBeAdded: ColumnSettings[] = [];

    for (const key in fieldMap) {
      if (fieldMap.hasOwnProperty(key)) {
        const field = fieldMap[key];
        if (colMap[key]) {
          // update the col titles just in case the schema field displayNames have been changed
          colMap[key].title = field.displayName;
        } else {
          // new fields added in schema, push it to the end of the columns
          toBeAdded.push(<ColumnSettings>{
            title: field.displayName,
            field: field.fieldName,
            type: field.type,
            _width: 190,
            isSortable: true,
            resizable: true,
            reorderable: true
          });
        }
      }
    }
    for (const key in colMap) {
      if (colMap.hasOwnProperty(key)) {
        // if the field has been removed from schema, and it is not "isSystem" field (like "Actions" "Info") remove it from columnsConfig
        if (!fieldMap[key]) {
          if (key === GridSystemFieldsEnum.CREATED_AT || key === GridSystemFieldsEnum.UPDATED_AT || key === GridSystemFieldsEnum.STATUS) {
            toBeRemoved.push(key);
          } else if (!colMap[key].isSystem) {
            toBeRemoved.push(key);
          }
        }
      }
    }
    const newCols = cols.filter((item) => {
      return !item.field || toBeRemoved.indexOf(item.field) < 0;
    });
    newCols.push(...toBeAdded);
    return newCols;
  }

  async populateFileFieldDetails(field: FileFieldValueDto, schemaField?: SchemaFieldDto): Promise<FileInfoExtDto[]> {
    let filesData = [];
    for (const fileItem of field.value) {
      try {
        const fileId = fileItem.documentId;
        const uploadInfo = await this.documentCache.get(fileId, 60, async () => await this.fileService.getDocumentInfo(fileId).toPromise());
        let url = this.getUrl(fileId);
        filesData.push({
          ...uploadInfo,
          url,
          fileType: this.sharedService.getFileType(uploadInfo),
          thumbnailEnabled: schemaField?.configuration?.thumbnailEnabled,
          imageMaxSize: schemaField?.configuration?.imageMaxSize,
          fileNameSetting: schemaField?.configuration?.fileNameSetting
        });
      } catch (error) {
        continue;
      }
    }
    return filesData;
  }

  private getUrl(fileId: string): string {
    return this.fileService.buildImage(fileId, this.auth.sessionId);
  }

  populateDateFormats(): void {
    this.userDateFormat = DateTimeFormatHelper.getDateFormatConfig()?.display?.dateInput;
    this.userDateTimeFormat = DateTimeFormatHelper.getDateTimeFormatConfig()?.display?.dateInput;
  }

  getValueByPath(fieldValues: BaseFieldValueType[], path: Array<string>): any {
    const copyPath = [...path];
    let pathItem = copyPath.splice(0, 1)[0];
    for (let i = 0; i < fieldValues.length; i++) {
      const field = fieldValues[i];
      if (field.id === pathItem) {
        if (copyPath.length === 0) {
          return field.value;
        } else if (field.type === FieldTypeIds.EmbededField) {
          return this.getValueByPath((<EmbededFieldValueDto>field).value, copyPath);
        }
      }
    }
  }

  async processVirtualFields(deItem: DynamicEntityDto, row: Row): Promise<void> {
    if (deItem.virtualFields?.length) {
      for (const fieldData of deItem.virtualFields) {
        if (fieldData.fieldName && fieldData.caseSchemaId && fieldData.tenantId && fieldData.fields?.length) {
          const connectorSchema = await this.adminSchemaService.getSchema(fieldData.tenantId, AreaTypeEnum.case, fieldData.caseSchemaId);
          for (const field of fieldData.fields) {
            let convertedField: BaseFieldValueType = this.dynamicEntitiesService.getDynamicFieldValue(field);
            if (convertedField) {
              // the prop name structure will be something like this: "connectorFieldName_$_fieldName"
              const propKey = `${fieldData.fieldName}${virtualFieldsSeparator}${field.id}`;
              row[propKey] = await this.formatGridCell(convertedField, connectorSchema);
            }
          }
        }
      }
    }
  }

  addSystemFields(deItem: DynamicEntityDto): BaseFieldValueType[] {
    return [
      ...deItem.fields,
      {
        value: deItem[GridSystemFieldsEnum.CREATED_AT],
        id: GridSystemFieldsEnum.CREATED_AT,
        type: FieldTypeIds.DateTimeField
      },
      {
        value: deItem[GridSystemFieldsEnum.UPDATED_AT],
        id: GridSystemFieldsEnum.UPDATED_AT,
        type: FieldTypeIds.DateTimeField
      }
    ];
  }
}
