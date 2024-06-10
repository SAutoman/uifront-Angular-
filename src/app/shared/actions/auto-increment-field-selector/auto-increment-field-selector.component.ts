/**
 * Project
 */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { KeyValue } from '@angular/common';
import { Store } from '@ngrx/store';
import { cloneDeep } from 'lodash-core';
/**
 * Project
 */
import { AreaTypeEnum, FieldTypeIds, SchemaFieldDto } from '@wfm/service-layer';
import { TreeLikeNodes, TreeNodeAdditionalData } from '@wfm/shared/tree-selectbox/checklist-database.service';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store';
import { PropertyPath } from '@wfm/service-layer/models/expressionModel';
/**
 * Local
 */
import { pathSeparator } from '../field-path-generator/field-path-generator.component';

@Component({
  selector: 'app-auto-increment-field-selector',
  templateUrl: './auto-increment-field-selector.component.html',
  styleUrls: ['./auto-increment-field-selector.component.scss']
})
export class AutoIncrementFieldSelectorComponent extends TenantComponent implements OnInit {
  @Input() schemaId: string;
  @Input() areaType: AreaTypeEnum;
  @Input() selectedFieldsForTree: string[];
  @Input() title?: string;

  @Output() fieldsEmitter: EventEmitter<PropertyPath[]> = new EventEmitter();

  fieldsTreeNodes: TreeLikeNodes = null;
  hasFields: boolean;

  allowedFieldTypes: FieldTypeIds[] = [FieldTypeIds.IntField, FieldTypeIds.DecimalField];
  autoIncrementFields: SchemaFieldDto[];

  constructor(store: Store<ApplicationState>, private adminSchemasService: AdminSchemasService) {
    super(store);
  }

  ngOnInit(): void {
    if (this.schemaId) {
      this.populateFieldsTree(this.areaType, this.schemaId);
    }
  }

  async populateFieldsTree(entityType: AreaTypeEnum, schemaId: string): Promise<void> {
    const fieldsTree = {};
    this.autoIncrementFields = [];
    let schemaFields: SchemaFieldDto[] = [];
    schemaFields = await this.getSchemaFields(schemaId, entityType);

    this.autoIncrementFields = this.buildFieldsTree(schemaFields, fieldsTree);
    setTimeout(() => {
      this.fieldsTreeNodes = fieldsTree;
      this.hasFields = !Object.keys(this.fieldsTreeNodes).length ? false : true;
    });
  }

  /**
   * recursively build each level of the tree
   */
  buildFieldsTree(fields: SchemaFieldDto[], treeObject: TreeLikeNodes, parentRawValue?: string): SchemaFieldDto[] {
    if (this.allowedFieldTypes?.length > 0) {
      fields = this.filterFields(fields);
    }
    fields.forEach((field) => {
      if (!treeObject[field.fieldName]) {
        const additionalData: TreeNodeAdditionalData = {
          fieldType: field.type
        };
        treeObject[field.fieldName] = {
          rawValue: parentRawValue ? `${parentRawValue}${pathSeparator}${field.fieldName}` : field.fieldName,
          children: {},
          additionalData: additionalData
        };
      }
      if (field.type == FieldTypeIds.EmbededField && field.fields?.length) {
        const nestedTreeObj = treeObject[field.fieldName].children;
        this.buildFieldsTree(field.fields, nestedTreeObj, treeObject[field.fieldName].rawValue);
      }
    });
    return fields;
  }

  filterFields(fields: SchemaFieldDto[]): SchemaFieldDto[] {
    const filteredFields = [];
    fields.forEach((field) => {
      if (this.allowedFieldTypes.includes(field.type) && field?.configuration?.isAutoIncremented) {
        filteredFields.push(field);
      } else if (field.type === FieldTypeIds.EmbededField) {
        field.fields = this.filterFields(field.fields);
        if (field.fields.length) {
          filteredFields.push(field);
        }
      }
    });
    return filteredFields;
  }

  async getSchemaFields(id: string, area: AreaTypeEnum): Promise<SchemaFieldDto[]> {
    let schema = await this.adminSchemasService.getSchema(this.tenant, area, id);
    const schemaFields = schema.fields?.filter(
      (x) => x.type === FieldTypeIds.IntField || x.type === FieldTypeIds.DecimalField || x.type === FieldTypeIds.EmbededField
    );
    return cloneDeep(schemaFields);
  }

  onFieldSelect(event: KeyValue<string, string>[]): void {
    let fieldsPropertyPath: PropertyPath[] = [];
    event?.forEach((x) => {
      fieldsPropertyPath.push({
        path: x.value?.split(pathSeparator)
      });
    });
    this.emitToParent(fieldsPropertyPath);
  }

  emitToParent(data: PropertyPath[]): void {
    this.fieldsEmitter.emit(data);
  }
}
