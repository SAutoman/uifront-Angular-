import { Injectable } from '@angular/core';
import { ReportGridColumnItem } from '@wfm/report/report-datasource.model';
import { AreaTypeEnum, FieldTypeIds, IFieldBaseDto, SchemaDto, SchemaFieldDto } from '@wfm/service-layer';
import { CustomSearchType, SearchType } from '@wfm/service-layer/models/dynamic-entity-models';
import { GridSystemFieldsEnum } from '../dynamic-entity-grid/dynamic-grid-system-fields';

@Injectable()
export class FilterFieldsService {
  allowedFiltersPerFieldType = {
    [FieldTypeIds.StringField.toString()]: [SearchType.Like],
    [FieldTypeIds.TextareaField.toString()]: [SearchType.Like],
    [FieldTypeIds.IntField.toString()]: [SearchType.Range, SearchType.EqualTo],
    [FieldTypeIds.DecimalField.toString()]: [SearchType.Range, SearchType.EqualTo],
    [FieldTypeIds.BoolField.toString()]: [SearchType.EqualTo],
    [FieldTypeIds.DateField.toString()]: [SearchType.Range, SearchType.EqualTo],
    [FieldTypeIds.TimeField.toString()]: [SearchType.Range, SearchType.EqualTo],
    [FieldTypeIds.DateTimeField.toString()]: [SearchType.Range, SearchType.EqualTo],
    [FieldTypeIds.MultiselectListField.toString()]: [SearchType.List],
    [FieldTypeIds.ListField.toString()]: [SearchType.List],
    [FieldTypeIds.ConnectorField.toString()]: [SearchType.Custom]
  };

  allowedFieldTypes: FieldTypeIds[] = [
    FieldTypeIds.IntField,
    FieldTypeIds.StringField,
    FieldTypeIds.DecimalField,
    FieldTypeIds.BoolField,
    FieldTypeIds.DateField,
    FieldTypeIds.TextareaField,
    FieldTypeIds.DateTimeField,
    FieldTypeIds.ListField,
    FieldTypeIds.TimeField,
    FieldTypeIds.MultiselectListField,
    FieldTypeIds.ConnectorField
  ];

  /**
   * populate the schema fields that will be shown in the filters selectbox
   * schemaFields+ systemFields
   */
  prepareSearchFieldsForSchema(schema: SchemaDto, addSuppliersAuditorsFilters?: boolean): IFieldBaseDto[] {
    try {
      let fields = schema.fields
        .filter((f) => this.allowedFieldTypes.includes(f.type))
        .map((d) => {
          const ui = <SchemaFieldDto>d;
          ui.allowedSearchTypes = this.allowedFiltersPerFieldType[d.type];
          return ui;
        });
      fields = this.addSystemFields(schema.areaType, fields, addSuppliersAuditorsFilters);

      return fields;
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * populate the schema fields that will be shown in the filters selectbox
   * schemaFields, NO systemFields
   */
  prepareSearchFieldsForNestedSchema(schema: SchemaDto): IFieldBaseDto[] {
    try {
      let fields = schema.fields
        .filter((f) => this.allowedFieldTypes.includes(f.type))
        .map((d) => {
          const ui = <SchemaFieldDto>d;

          ui.allowedSearchTypes = this.allowedFiltersPerFieldType[d.type];
          return ui;
        });

      return fields;
    } catch (error) {
      console.log(error);
    }
  }

  prepareSearchFieldsForDatasource(datasourceFields: ReportGridColumnItem[]): IFieldBaseDto[] {
    try {
      let fields = [];
      datasourceFields.forEach((f) => {
        if (this.allowedFieldTypes.includes(f.type) && !f.isSystemField) {
          const ui = <IFieldBaseDto>f;
          ui.allowedSearchTypes = this.allowedFiltersPerFieldType[f.type];
          fields.push(ui);
        } else if (f.isSystemField) {
          const sysField = this.getSystemField(f.fieldName);
          fields.push(sysField);
        }
      });
      return fields;
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * add system fields in searchable fields list: createdAt, updatedAt, status
   */
  addSystemFields(areaType: AreaTypeEnum, fields: IFieldBaseDto[], addSuppliersAuditorsFilters?: boolean): SchemaFieldDto[] {
    let systemFields: SchemaFieldDto[] = [
      this.getSystemField(GridSystemFieldsEnum.CREATED_AT),
      this.getSystemField(GridSystemFieldsEnum.UPDATED_AT)
    ];
    if (areaType === AreaTypeEnum.rawData || areaType === AreaTypeEnum.case) {
      systemFields.unshift(this.getSystemField(GridSystemFieldsEnum.STATUS));
    }

    if (addSuppliersAuditorsFilters) {
      systemFields.unshift(this.getSystemField(GridSystemFieldsEnum.SUPPLIERS));
      systemFields.unshift(this.getSystemField(GridSystemFieldsEnum.AUDITORS));
    }
    fields.push(...systemFields);
    return fields as SchemaFieldDto[];
  }

  getSystemField(key: string): SchemaFieldDto {
    let field;
    switch (key) {
      case GridSystemFieldsEnum.STATUS:
      case GridSystemFieldsEnum.STATUS_ID:
        field = {
          id: undefined,
          type: FieldTypeIds.StringField,
          name: 'Status',
          // if you need to change fieldName value, update the respective checking in dynamic-entity-field (createModel)
          fieldName: GridSystemFieldsEnum.STATUS_ID,
          displayName: 'Status',
          isSystem: true,
          configuration: { position: 0 },
          schemaFieldConfiguration: { position: 0 },
          allowedSearchTypes: [SearchType.Custom],
          customSearchType: CustomSearchType.Status
        };
        break;
      case GridSystemFieldsEnum.CREATED_AT:
        field = {
          id: undefined,
          type: FieldTypeIds.DateTimeField,
          name: 'Created At',
          fieldName: GridSystemFieldsEnum.CREATED_AT,
          displayName: 'Created At',
          isSystem: true,
          configuration: { position: 1 },
          schemaFieldConfiguration: { position: 1 },
          allowedSearchTypes: this.allowedFiltersPerFieldType[FieldTypeIds.DateTimeField]
        };
        break;
      case GridSystemFieldsEnum.UPDATED_AT:
        field = {
          id: undefined,
          type: FieldTypeIds.DateTimeField,
          name: 'Updated At',
          fieldName: GridSystemFieldsEnum.UPDATED_AT,
          displayName: 'Updated At',
          isSystem: true,
          configuration: { position: 2 },
          schemaFieldConfiguration: { position: 2 },
          allowedSearchTypes: this.allowedFiltersPerFieldType[FieldTypeIds.DateTimeField]
        };
        break;
      case GridSystemFieldsEnum.SUPPLIERS:
        field = {
          id: undefined,
          type: FieldTypeIds.ListField,
          name: 'Suppliers',
          fieldName: GridSystemFieldsEnum.SUPPLIERS,
          displayName: 'Suppliers',
          isSystem: true,
          configuration: { position: 0 },
          schemaFieldConfiguration: { position: 0 },
          allowedSearchTypes: [SearchType.Custom],
          customSearchType: CustomSearchType.SupplierIds
        };
        break;
      case GridSystemFieldsEnum.AUDITORS:
        field = {
          id: undefined,
          type: FieldTypeIds.ListField,
          name: 'Auditors',
          fieldName: GridSystemFieldsEnum.AUDITORS,
          displayName: 'Auditors',
          isSystem: true,
          configuration: { position: 0 },
          schemaFieldConfiguration: { position: 0 },
          allowedSearchTypes: [SearchType.Custom],
          customSearchType: CustomSearchType.AuditorIds
        };
        break;

      default:
        break;
    }
    return field;
  }
}
