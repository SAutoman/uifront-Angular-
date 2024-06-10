import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { filter, takeUntil } from 'rxjs/operators';
import { cloneDeep } from 'lodash-core';
import { DateTime } from 'luxon';
import { TranslateService } from '@ngx-translate/core';

import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState, loggedInState, tenantSettingsSelector, TenantSystem } from '@wfm/store';
import jsPDF from 'jspdf';
import * as htmlToImage from 'html-to-image';

import {
  AreaTypeEnum,
  DocumentUploadService,
  DynamicEntitiesService,
  DynamicEntityDto,
  FieldTypeIds,
  FileInfo,
  keyForSchemaTitleSettings,
  PrintPreviewSettingValues,
  PrintSettingField,
  SchemaDto,
  SchemaFieldDto,
  SettingsUI,
  UiAreasEnum,
  VirtualFieldValueDto,
  WorkflowDto,
  WorkflowStateUI,
  WorkflowStatusDto
} from '@wfm/service-layer';
import { BaseFieldValueType } from '@wfm/service-layer/models/FieldValueDto';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import DateTimeFormatHelper from '@wfm/shared/dateTimeFormatHelper';

import { FilePreviewOverlayService } from '@wfm/common/vendor/formly-file/file-preview/file-preview-overlay.service';
import { GetWorkflowStateById, workflowStateSelector } from '@wfm/store/workflow';
import { LinkedRawDataDetails } from '../workflow-state-case-step/workflow-state-case-step.component';
import { DynamicGridUiService } from '@wfm/service-layer/services/dynamic-grid-ui.service';
import { FilePreviewOverlayRef } from '@wfm/common/vendor/formly-file/file-preview/file-preview-overlay-ref';
import { TitleSettingsHelperService } from '@wfm/service-layer/services/title-settings-helper-service';
import { SystemFieldsTitleFormatter, GridSystemFieldsEnum } from '@wfm/shared/dynamic-entity-grid/dynamic-grid-system-fields';
import { casePrintPeviewSettingsKey } from '@wfm/tenants/print-preview-setting/print-preview-setting.component';
import { pathSeparator } from '@wfm/shared/actions/field-path-generator/field-path-generator.component';
import { CommentPath, ProcessStepPath, PropertyPath, RawDataPath } from '@wfm/service-layer/models/expressionModel';

interface ValueMap {
  [key: string]: any;
}

interface Attachment extends FileInfo {
  fileType: string;
  url: string;
}

interface StepData extends DynamicEntityData {
  name: string;
  rawData: LinkedRawDataDetails;
}

interface DynamicEntityData {
  title?: string;
  fields: SchemaFieldDto[];
}

@Component({
  selector: 'app-case-print-preview',
  templateUrl: './case-print-preview.component.html',
  styleUrls: ['./case-print-preview.component.scss']
})
export class CasePrintPreviewComponent extends TenantComponent implements OnInit {
  @ViewChild('casePreview') casePreview;
  @ViewChild('iframePrint') iframe;
  @ViewChild('printContainer') printContainer;

  @Input() workflowStateId: string;
  @Input() workflowSchema: WorkflowDto;
  @Input() autoLaunchPrintDialogue: boolean;
  workflowState: WorkflowStateUI;
  caseItem: DynamicEntityData;
  steps: StepData[] = [];
  rawDataItems: DynamicEntityData[] = [];
  paginatedRawDataItems: DynamicEntityData[] = [];
  commentItems: DynamicEntityData[] = [];
  currentUrl: string = '';
  currentStatus: WorkflowStatusDto;
  showAttachments: boolean = true;
  rawDatasFields: SchemaFieldDto[];
  attachments: Attachment[] = [];
  allArticleVisible: boolean = false;
  tenantDetails: TenantSystem;
  currentDate = '';
  sessionId: string = '';
  initiatePrint: boolean;
  isMultiColumn: boolean = false;

  get fieldTypes() {
    return FieldTypeIds;
  }
  allTenantSettings: SettingsUI[];

  rawDataComponentTitle: string;
  printPreviewVisbilitySettings: PrintPreviewSettingValues;
  showRawDataAreaHeader: boolean;
  showCaseAreaHeader: boolean;

  constructor(
    private store: Store<ApplicationState>,
    private fileService: DocumentUploadService,
    private dynamicEntityService: DynamicEntitiesService,
    private adminSchemaService: AdminSchemasService,
    private dynamicGridUiService: DynamicGridUiService,
    private previewDialog: FilePreviewOverlayService,
    private ts: TranslateService,
    private titleSettingsHelperService: TitleSettingsHelperService
  ) {
    super(store);
    this.store.pipe(takeUntil(this.destroyed$), select(loggedInState)).subscribe((x) => {
      this.tenantDetails = x.currentTenantSystem;
      this.sessionId = x.sessionId;
    });
    this.store
      .select(tenantSettingsSelector)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((tenantSettings) => {
        this.allTenantSettings = tenantSettings || [];
      });
    this.currentUrl = location.href;
  }

  async ngOnInit() {
    this.rawDataComponentTitle = this.ts.instant('Raw Data in this Case');
    this.currentDate = DateTimeFormatHelper.formatDateTime(DateTime.now().toJSDate());
    await this.populateAllData();
  }

  async populateAllData(): Promise<void> {
    this.getWorkflowState();

    this.store
      .select(workflowStateSelector)
      .pipe(
        filter((wfState) => !!wfState),
        takeUntil(this.destroyed$)
      )
      .subscribe(async (wfState) => {
        this.workflowState = cloneDeep(wfState);
        this.currentStatus = this.workflowState.currentStatus;
        const printSettings = this.allTenantSettings.find((x) => x.key === `${casePrintPeviewSettingsKey}_${wfState.workflowId}`);
        this.printPreviewVisbilitySettings = printSettings?.value;
        try {
          await this.getCase();
          await Promise.all([this.getRawDataItems(), this.getCommentItems(), this.populateSteps()]);
          if (this.autoLaunchPrintDialogue) {
            setTimeout(() => this.printElement());
          }
        } catch (error) {
          console.log(error);
        }
      });
  }

  async getCase(): Promise<void> {
    const schema = await this.getSchema(this.workflowSchema.caseSchemaId, AreaTypeEnum.case);
    const deItem = await this.dynamicEntityService.getById(this.tenant, this.workflowStateId, schema.id, AreaTypeEnum.case);
    let deMap = await this.getDynamicEntityMap(deItem?.fields || [], schema);
    const allowedCaseFields = this.getAllowedFields(AreaTypeEnum.case);

    if (this.printPreviewVisbilitySettings && !allowedCaseFields.length) {
      schema.fields = [];
    } else {
      schema.fields = await this.populateSchemaFieldValues(schema.fields, deMap, deItem, allowedCaseFields);
    }
    const systemFields = await this.populateSystemFields(deItem, null, allowedCaseFields);
    const allFields = [...schema.fields, ...systemFields];
    this.caseItem = {
      title: `${await this.populateCaseTitle(schema, deItem)}`,

      fields: allFields
    };
    this.isMultiColumn = this.isMultiFieldColumns(this.caseItem.title);
  }

  async populateCaseTitle(schema: SchemaDto, deItem: DynamicEntityDto): Promise<string> {
    const allTitleSettings = this.allTenantSettings.filter((x) => x.key.includes(keyForSchemaTitleSettings));
    let titleSettings = this.titleSettingsHelperService.findApplicableTitleSettings(
      schema.id,
      allTitleSettings,
      UiAreasEnum.caseDetailTitle
    );
    if (titleSettings) {
      let titleFields = this.titleSettingsHelperService.populateTitleFields(deItem.fields, titleSettings, this.getSystemFields(deItem));
      let title = await this.titleSettingsHelperService.populateDynamicEntityTitle(titleFields, titleSettings, schema);
      return title;
    }
    return '';
  }

  getSystemFields(de: DynamicEntityDto): SystemFieldsTitleFormatter[] {
    const statusField = {
      id: GridSystemFieldsEnum.STATUS,
      type: FieldTypeIds.StringField,
      value: de.statusId
    };
    const createdAt = {
      id: GridSystemFieldsEnum.CREATED_AT,
      type: FieldTypeIds.DateTimeField,
      value: DateTimeFormatHelper.formatDateTime(de.createdAt)
    };
    const updatedAt = {
      id: GridSystemFieldsEnum.UPDATED_AT,
      type: FieldTypeIds.DateTimeField,
      value: DateTimeFormatHelper.formatDateTime(de.updatedAt)
    };
    return [statusField, createdAt, updatedAt];
  }

  async getRawDataItems(): Promise<void> {
    await this.getRawDataRefFields(this.workflowSchema.caseSchemaId);

    if (this.rawDatasFields?.length) {
      for (const rawDatasField of this.rawDatasFields) {
        const schema = await this.getSchema(rawDatasField.configuration.schemaId, AreaTypeEnum.rawData, rawDatasField.fieldName);

        const rawDataIds = this.workflowState.case?.fields?.find(
          (x) => x.type === FieldTypeIds.ListOfLinksField && x.id === rawDatasField.fieldName
        )?.value as string[];
        if (rawDataIds) {
          for (const rawDataId of rawDataIds) {
            const clonedSchema = cloneDeep(schema);
            const deItem = await this.dynamicEntityService.getById(this.tenant, rawDataId, schema.id, AreaTypeEnum.rawData);
            let deMap = await this.getDynamicEntityMap(deItem?.fields || [], clonedSchema);

            const allowedRawDataFields = this.getAllowedFields(AreaTypeEnum.rawData);

            if (this.printPreviewVisbilitySettings && !allowedRawDataFields.length) {
              clonedSchema.fields = [];
            } else clonedSchema.fields = await this.populateSchemaFieldValues(clonedSchema.fields, deMap, deItem, allowedRawDataFields);

            const systemFields = await this.populateSystemFields(deItem, rawDatasField.fieldName, allowedRawDataFields);
            const rawData = {
              fields: [...clonedSchema.fields, ...systemFields]
            };

            if (rawData.fields.length) {
              this.rawDataItems.push(rawData);
            }
          }
        }
      }

      this.handleArticles();
    }
    this.showRawDataAreaHeader = this.rawDataItems.some((x) => x.fields.length);
  }

  async getCommentItems(): Promise<void> {
    const caseSchema = await this.getSchema(this.workflowSchema.caseSchemaId, AreaTypeEnum.case);

    const commentsField = caseSchema.fields.find((field) => {
      return field.type === FieldTypeIds.ListOfLinksField && field.configuration?.schemaAreaType === AreaTypeEnum.comment;
    });

    if (commentsField) {
      const schema = await this.getSchema(commentsField.configuration.schemaId, AreaTypeEnum.comment, commentsField.fieldName);

      const commentIds = this.workflowState.case?.fields?.find(
        (x) => x.type === FieldTypeIds.ListOfLinksField && x.id === commentsField.fieldName
      )?.value as string[];
      if (commentIds?.length) {
        for (const commentId of commentIds) {
          const clonedSchema = cloneDeep(schema);
          const deItem = await this.dynamicEntityService.getById(this.tenant, commentId, schema.id, AreaTypeEnum.comment);
          let deMap = await this.getDynamicEntityMap(deItem?.fields || [], clonedSchema);

          const allowedCommentFields = this.getAllowedFields(AreaTypeEnum.comment);

          if (this.printPreviewVisbilitySettings && !allowedCommentFields.length) {
            clonedSchema.fields = [];
          } else {
            clonedSchema.fields = await this.populateSchemaFieldValues(clonedSchema.fields, deMap, deItem, allowedCommentFields);
          }
          const systemFields = await this.populateSystemFields(deItem, commentsField.fieldName, allowedCommentFields);

          const comment = {
            fields: [...clonedSchema.fields, ...systemFields]
          };
          if (comment.fields.length) {
            this.commentItems.push(comment);
          }
        }
      }
    }
  }

  async populateSteps(): Promise<void> {
    for (let caseStep of this.workflowState.caseSteps) {
      const schema = await this.getSchema(caseStep.schemaId, AreaTypeEnum.stepForm, caseStep.refName);
      for (const stepItem of caseStep.stepDynamicEntities) {
        let deItem;
        const schemaCopy = cloneDeep(schema);
        if (stepItem?.dynamicEntityId) {
          deItem = await this.dynamicEntityService.getById(
            this.tenant,
            stepItem?.dynamicEntityId,
            caseStep.schemaId,
            AreaTypeEnum.stepForm
          );
          let deMap = await this.getDynamicEntityMap(deItem?.fields || [], schema);
          const allowedStepFields = this.getAllowedFields(AreaTypeEnum.stepForm);
          if (this.printPreviewVisbilitySettings && !allowedStepFields.length) {
            schemaCopy.fields = [];
          } else {
            schemaCopy.fields = await this.populateSchemaFieldValues(schemaCopy.fields, deMap, deItem, allowedStepFields);
          }
          const stepPrint = {
            title: caseStep.title,
            name: caseStep.name,
            fields: schemaCopy.fields,
            rawData: null
          };
          // if the step is repeatable, populate the linked rawData details to generate the rawData title
          if (this.rawDatasFields[0] && stepItem.rawDataItemId && caseStep.linkedRawDataFields) {
            stepPrint.rawData = <LinkedRawDataDetails>{
              id: stepItem.rawDataItemId,
              item: stepItem.rawDataItem,
              tenantId: this.tenant,
              schemaId: caseStep.rawDataSchemaId,
              fieldPaths: caseStep.linkedRawDataFields
            };
          }
          if (stepPrint.fields.length) {
            this.steps.push(stepPrint);
          }
        }
      }
    }
    this.showCaseAreaHeader = this.steps.some((x) => x.fields.length);
  }

  getWorkflowState(): void {
    this.store.dispatch(new GetWorkflowStateById({ id: this.workflowStateId, schemaId: this.workflowSchema.id }));
  }

  async getSchema(id: string, areaType: AreaTypeEnum, schemaRefName?: string): Promise<SchemaDto> {
    try {
      const schema = await this.adminSchemaService.getSchema(this.tenant, areaType, id);
      this.addPathString(schema.fields, schemaRefName ? [schemaRefName] : []);
      return schema;
    } catch (error) {
      console.log(error);
    }
  }

  isMultiFieldColumns(caseName: String): boolean {
    let subStr = '<br>';
    if (caseName.indexOf(subStr) !== -1) {
      const multiObject = caseName.split(subStr);
      return multiObject.length > 1;
    }
    return false;
  }

  showHideArticles(): void {
    this.allArticleVisible = !this.allArticleVisible;
    this.handleArticles();
  }

  handleArticles(): void {
    this.paginatedRawDataItems = cloneDeep(this.rawDataItems);
    if (!this.allArticleVisible) {
      this.paginatedRawDataItems = this.rawDataItems.slice(0, 2);
    }
  }

  /**
   * get raw data schema id from case schema
   */

  async getRawDataRefFields(caseSchemaId: string): Promise<void> {
    const caseSchema = await this.getSchema(caseSchemaId, AreaTypeEnum.case);

    this.rawDatasFields = caseSchema.fields.filter((field) => {
      return field.type === FieldTypeIds.ListOfLinksField && field.configuration?.schemaAreaType === AreaTypeEnum.rawData;
    });
  }

  private getUrl(fileId: string): string {
    const url = this.fileService.buildImage(fileId, this.sessionId);
    return url;
  }

  /**
   * create a map of {fieldName: BaseFieldValueType} pairs form dynamicEntityFields (recursion: consider the nested fields)
   * @param de
   * @returns
   */

  private async getDynamicEntityMap(dynamicEntityFields: BaseFieldValueType[], schema: SchemaDto): Promise<ValueMap> {
    let fieldMap = {};
    for (const field of dynamicEntityFields) {
      const schemaField = schema.fields.find((f) => f.fieldName === field.id);
      if (schemaField) {
        if (field.type !== FieldTypeIds.EmbededField) {
          field.value = await this.dynamicGridUiService.getFormattedValue(field, schema);
          fieldMap[field.id] = { ...field };
        } else {
          const nestedFieldsValues = await this.getDynamicEntityMap(<BaseFieldValueType[]>field.value, schemaField as unknown as SchemaDto);
          fieldMap[field.id] = { ...nestedFieldsValues };
        }
      }
    }
    return fieldMap;
  }

  showPreview(file: string, type: string): void {
    const data = {
      url: file,
      type
    };
    let dialogRef: FilePreviewOverlayRef = this.previewDialog.open({
      file: data
    });
  }

  /**
   * Recursively add values to schema fields (values get from dynamic entity)
   * values added to field.configuration
   * @param fields
   * @param values
   * @returns
   */

  async populateSchemaFieldValues(
    fields: SchemaFieldDto[],
    valuesMap?: ValueMap,
    de?: DynamicEntityDto,
    allowedFields?: PrintSettingField[]
  ): Promise<SchemaFieldDto[]> {
    let printableFields = fields.filter((f) => {
      if (allowedFields) {
        return allowedFields.find((field) => {
          const stringPath = this.getPathString(field.propertyPath);
          return stringPath === f.pathString || (f.type === FieldTypeIds.EmbededField && stringPath.includes(f.pathString));
        });
      }
      return f.type !== FieldTypeIds.ListOfLinksField;
    });

    if (valuesMap) {
      for (const field of printableFields) {
        if (field.type !== FieldTypeIds.EmbededField) {
          if (field.type === FieldTypeIds.FileField) {
            if (valuesMap[field.fieldName]?.value) {
              valuesMap[field.fieldName].value = valuesMap[field.fieldName]?.value.map((x, i) => {
                let finalFileData: Attachment = { ...x.fileInfo, url: this.getUrl(x.id), fileType: x.fileType };
                this.attachments.push(finalFileData);
                return finalFileData;
              });
              field.configuration.value = valuesMap[field.fieldName]?.value;
            }
          } else {
            field.configuration.value = valuesMap[field.fieldName]?.value;
            if (field.type === FieldTypeIds.ConnectorField && de && de.virtualFields) {
              const data = de.virtualFields.find((f) => f.fieldName === field.fieldName);
              if (data) {
                field.configuration.exposedData = await this.populateExposedFields(data);
              }
            }
          }
        } else {
          field.fields = await this.populateSchemaFieldValues(field.fields, valuesMap[field.fieldName], null, allowedFields);
        }
      }
    }
    // order based on the configuration.position
    let orderedFields = printableFields.sort((a, b) => a.configuration?.position - b.configuration?.position);
    return orderedFields;
  }

  printElement(): void {
    this.initiatePrint = true;

    this.toggleVisibility('none');
    const htmlWidth = this.printContainer.nativeElement.offsetWidth;
    const htmlHeight = this.printContainer.nativeElement.offsetHeight;
    const margin = 15;
    const PDF_Width = htmlWidth + margin * 2;
    const PDF_Height = PDF_Width * 1.5 + margin * 2;
    const totalPDFPages = Math.ceil(htmlHeight / PDF_Height) - 1;

    htmlToImage
      .toCanvas(this.printContainer.nativeElement, { backgroundColor: '#fff' })
      .then((canvas) => {
        this.toggleVisibility('flex');
        canvas.getContext('2d');
        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdf = new jsPDF('p', 'px', [PDF_Width, PDF_Height]);
        pdf.addImage(imgData, 'PNG', margin, margin, htmlWidth, htmlHeight);
        let nextYPosition = -PDF_Height + margin;
        for (let i = 1; i <= totalPDFPages; i++) {
          pdf.addPage([PDF_Width, PDF_Height], 'p');
          pdf.addImage(imgData, 'PNG', margin, nextYPosition, htmlWidth, htmlHeight);
          nextYPosition -= PDF_Height;
        }
        // pdf.save(`${this.caseName}.pdf`);
        this.initiatePrint = false;
        const oHiddFrame = this.iframe.nativeElement;
        oHiddFrame.onload = function () {
          oHiddFrame.contentWindow.focus(); // Required for IE
          oHiddFrame.contentWindow.print();
        };
        oHiddFrame.src = pdf.output('bloburl');
      })
      .catch(function (error) {
        console.error('oops, something went wrong!', error);
      });
  }

  /**
   *
   * show/hide the action buttons/checkboxes in the component
   */
  toggleVisibility(display: string): void {
    const elements: any = document.getElementsByClassName('printAction');
    for (const e of elements) {
      e.style.display = display;
    }
  }

  async populateSystemFields(
    deItem: DynamicEntityDto,
    schemaRefName: string,
    allowedFields?: PrintSettingField[]
  ): Promise<SchemaFieldDto[]> {
    const fields = [];

    const createdAt = {
      id: null,
      fieldName: GridSystemFieldsEnum.CREATED_AT,
      displayName: 'CreatedAt',
      type: FieldTypeIds.StringField,
      configuration: {
        value: this.getFormattedDate(deItem.createdAt) || '-'
      },
      schemaFieldConfiguration: { position: 0 },
      pathString: schemaRefName ? [schemaRefName, GridSystemFieldsEnum.CREATED_AT].join(pathSeparator) : GridSystemFieldsEnum.CREATED_AT
    };
    const updatedAt = {
      id: null,
      fieldName: GridSystemFieldsEnum.UPDATED_AT,
      displayName: 'UpdatedAt',
      type: FieldTypeIds.StringField,
      configuration: {
        value: this.getFormattedDate(deItem.updatedAt) || '-'
      },
      schemaFieldConfiguration: { position: 0 },
      pathString: schemaRefName ? [schemaRefName, GridSystemFieldsEnum.UPDATED_AT].join(pathSeparator) : GridSystemFieldsEnum.UPDATED_AT
    };

    fields.push(createdAt);
    fields.push(updatedAt);

    if (deItem.suppliers?.length) {
      const suppliers = {
        id: null,
        fieldName: GridSystemFieldsEnum.SUPPLIERS,
        displayName: 'Suppliers',
        type: FieldTypeIds.StringField,
        configuration: {
          value: (await this.dynamicGridUiService.getSupplierAuditorCompanies(deItem.suppliers)).toString()
        },
        schemaFieldConfiguration: { position: 0 },
        pathString: schemaRefName ? [schemaRefName, GridSystemFieldsEnum.SUPPLIERS].join(pathSeparator) : GridSystemFieldsEnum.SUPPLIERS
      };
      fields.push(suppliers);
    }

    if (deItem.auditors?.length) {
      const auditors = {
        id: null,
        fieldName: GridSystemFieldsEnum.AUDITORS,
        displayName: 'Auditors',
        type: FieldTypeIds.StringField,
        configuration: {
          value: (await this.dynamicGridUiService.getSupplierAuditorCompanies(deItem.auditors)).toString() || '-'
        },
        schemaFieldConfiguration: { position: 0 },
        pathString: schemaRefName ? [schemaRefName, GridSystemFieldsEnum.AUDITORS].join(pathSeparator) : GridSystemFieldsEnum.AUDITORS
      };
      fields.push(auditors);
    }

    return fields.filter((field) => {
      if (allowedFields) {
        return allowedFields.find((f) => {
          const stringPath = this.getPathString(f.propertyPath);
          return stringPath === field.pathString;
        });
      }
      return true;
    });
  }

  getFormattedDate(date: Date): string {
    return DateTimeFormatHelper.formatDateTime(date);
  }

  async populateExposedFields(data: VirtualFieldValueDto<BaseFieldValueType>): Promise<VirtualFieldValueDto<SchemaFieldDto>> {
    const schema = await this.adminSchemaService.getSchema(data.tenantId, AreaTypeEnum.case, data.caseSchemaId);
    const fields = [];
    for (const exposedField of data.fields) {
      let processedValue = await this.dynamicGridUiService.getFormattedValue(exposedField, schema);

      // file field value to be adapted to the template
      if (exposedField.type === FieldTypeIds.FileField) {
        processedValue = processedValue.map((x, i) => {
          let finalFileData: Attachment = { ...x.fileInfo, url: this.getUrl(x.id), fileType: x.fileType };
          // shall we include these exposed files in all attachments?
          this.attachments.push(finalFileData);
          return finalFileData;
        });
      }

      const d = {
        id: null,
        fieldName: exposedField.id,
        type: exposedField.type,
        displayName: schema.fields.find((f) => f.fieldName === exposedField.id)?.displayName,
        name: exposedField.id,
        configuration: {
          position: 1,
          value: processedValue
        }
      };
      fields.push(d);
    }
    return {
      ...data,
      fields: fields
    };
  }

  getAllowedFields(areaType: AreaTypeEnum): PrintSettingField[] {
    if (!this.printPreviewVisbilitySettings) {
      return null;
    }
    switch (areaType) {
      case AreaTypeEnum.case:
        return this.printPreviewVisbilitySettings.caseSchemaFields || [];
      case AreaTypeEnum.stepForm:
        return this.printPreviewVisbilitySettings.processStepSchemaFields || [];
      case AreaTypeEnum.rawData:
        return this.printPreviewVisbilitySettings.rawDataSchemaFields || [];
      case AreaTypeEnum.comment:
        return this.printPreviewVisbilitySettings.commentSchemaFields || [];
      default:
        return [];
    }
  }

  getPathString(propertyPath: PropertyPath | ProcessStepPath | RawDataPath | CommentPath): string {
    if (!propertyPath) {
      return '';
    }
    const finalPath = [...propertyPath.path];

    const refName =
      (<ProcessStepPath>propertyPath).processStepRefName ||
      (<RawDataPath>propertyPath).rawDataFieldName ||
      (<CommentPath>propertyPath).commentFieldName ||
      '';
    if (refName) {
      finalPath.unshift(refName);
    }

    return finalPath.join(pathSeparator);
  }

  addPathString(fields, parentPath: string[]): void {
    fields.forEach((field) => {
      const path = [...parentPath, field.fieldName];
      field.pathString = path.join(pathSeparator);

      if (field.type == FieldTypeIds.EmbededField) {
        this.addPathString(field.fields, path);
      }
    });
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    // this.portalHost?.detach();
  }
}
