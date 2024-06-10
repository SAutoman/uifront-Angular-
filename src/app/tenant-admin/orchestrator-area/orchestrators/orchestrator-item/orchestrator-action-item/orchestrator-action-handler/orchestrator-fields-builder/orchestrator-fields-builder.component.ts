/**
 * Global
 */
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';
import { isArray, cloneDeep } from 'lodash-core';

/**
 * Project
 */
import { FormlyModel, IFormlyView } from '@wfm/common/models';
import { IConfigurableListItem } from '@wfm/common/models/field/i-configurable-list-item';
import { FormlyFieldAdapterFactory, FormVariableDto, KeyValueDisabled } from '@wfm/common/vendor';
import { adapterToConfig } from '@wfm/forms-flow-struct/form-rule-builder/fields';
import { AreaTypeEnum, DynamicEntitiesService, SchemaDto, SchemaFieldDto } from '@wfm/service-layer';
import { BaseFieldConverter } from '@wfm/service-layer/helpers';
import { FieldTypeIds, FieldTypeNameMap } from '@wfm/service-layer/models/FieldTypeIds';
import { BaseFieldValueType, EmbededFieldValueDto, ListValue } from '@wfm/service-layer/models/FieldValueDto';
import { ConnectorSide, WorkflowSchemaConnectorEntity, WorkflowSchemaItem } from '@wfm/service-layer/models/orchestrator';
import { WorkflowsConnectorService } from '@wfm/service-layer/services/workflows-connector.service';
import { pathSeparator } from '@wfm/shared/actions/field-path-generator/field-path-generator.component';
import { TreeLikeNodes, TreeNodeAdditionalData } from '@wfm/shared/tree-selectbox/checklist-database.service';
import { TreeNodeOutput } from '@wfm/shared/tree-selectbox/tree-selectbox.component';
import { isUndefinedOrNull } from '@wfm/shared/utils';
import { ExpressionHelperService } from '@wfm/common/form-builder-components/expression-helper.service';
import { PropertyPath } from '@wfm/service-layer/models/expressionModel';
import { SourceToDestinationWithPath } from '@wfm/service-layer/models/actionDto';
import { FieldPathInput, FieldPathOutput } from '@wfm/shared/actions/field-path-generator/FieldPathModels';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { Store } from '@ngrx/store';
import { ApplicationState } from '@wfm/store/application/application.reducer';

/**
 * Local
 */
export interface FieldSetterGroup {
  fieldPath: PropertyPath;
  value: any;
  field: IConfigurableListItem;
}

interface SourceToDestinationFieldPathInputs {
  source: FieldPathInput;
  destination: FieldPathInput;
}

export interface FieldsBuilderOutput {
  copyFields: SourceToDestinationWithPath[];
  addOrUpdateFields: BaseFieldValueType[];
}
@Component({
  selector: 'app-orchestrator-fields-builder',
  templateUrl: './orchestrator-fields-builder.component.html',
  styleUrls: ['./orchestrator-fields-builder.component.scss']
})
export class OrchestratorFieldsBuilderComponent extends TenantComponent implements OnInit {
  @Input() showCopyFieldsTab: boolean;
  @Input() fieldsDto?: BaseFieldValueType[];
  @Input() schema: SchemaDto;
  @Input() connector: WorkflowSchemaConnectorEntity;
  @Input() allowDynamicConnectorFieldValue: boolean;
  @Input() copyFieldsDto: SourceToDestinationWithPath[];
  @Input() caseUpdateSide: ConnectorSide;
  fieldsTreeNodes: TreeLikeNodes = null;

  view: IFormlyView;
  form: FormGroup;
  unsupportedFieldypes: FieldTypeIds[] = [FieldTypeIds.ListOfLinksField];
  model: FormlyModel;
  sourceTitle: string;
  destinationTitle: string;

  copySourceWorkflow: WorkflowSchemaItem;
  copyDestinationWorkflow: WorkflowSchemaItem;

  sourceToDestinationFieldPathInputs: SourceToDestinationFieldPathInputs[] = [];
  sourceToDestinationFieldPathOutputs: SourceToDestinationWithPath[] = [];

  get dynamicFields(): FormArray {
    return this.form?.get('dynamicFields') as FormArray;
  }
  constructor(
    private fb: FormBuilder,
    private ts: TranslateService,
    private dialog: MatDialogRef<OrchestratorFieldsBuilderComponent>,
    private connectorService: WorkflowsConnectorService,
    private expressionHelper: ExpressionHelperService,
    private dynamicEntitiesService: DynamicEntitiesService,
    private snackbar: MatSnackBar,
    private store: Store<ApplicationState>
  ) {
    super(store);
  }

  async ngOnInit() {
    this.model = this.populateModel(this.fieldsDto, {});
    this.populateFieldsTree();
    this.form = this.fb.group({
      dynamicFields: this.fb.array([])
    });
    if (!this.fieldsDto?.length) {
      // add an empty fieldGroup
      this.addDynamicFieldGroup();
    } else {
      this.recursivelyPopulateGroups(this.fieldsDto, this.schema, []);
    }

    if (this.copyFieldsDto?.length) {
      this.copyFieldsDto.forEach((copyGroup) => {
        this.addNewSourceToDestination(copyGroup);
      });
    }

    this.populateCopyWorkflows();
  }

  /**
   * recursion
   */
  recursivelyPopulateGroups(baseFieldValues: BaseFieldValueType[], schema: SchemaDto, path: string[]): void {
    baseFieldValues.forEach((fieldValueData) => {
      const newPath = cloneDeep(path);
      newPath.push(fieldValueData.id);

      const schemaField = schema.fields.find((s) => s.fieldName === fieldValueData.id);
      if (schemaField && schemaField.type !== FieldTypeIds.EmbededField) {
        const group = {
          fieldPath: { path: newPath },
          value: fieldValueData.value,
          field: BaseFieldConverter.toUi(schemaField)
        };
        this.addDynamicFieldGroup(group);
      } else {
        let nestedSchema = schemaField as unknown as SchemaDto;
        const nestedFieldsValueData = (<EmbededFieldValueDto>fieldValueData).value;
        this.recursivelyPopulateGroups(nestedFieldsValueData, nestedSchema, newPath);
      }
    });
  }

  /**
   * recursion
   */
  buildFieldsTree(fields: SchemaFieldDto[], treeObject: TreeLikeNodes, parentRawValue?: string): void {
    fields.forEach((field) => {
      if (this.unsupportedFieldypes.includes(field.type)) {
        return;
      }
      if (!treeObject[field.fieldName]) {
        treeObject[field.fieldName] = {
          rawValue: parentRawValue ? `${parentRawValue}${pathSeparator}${field.fieldName}` : field.fieldName,
          children: {},
          additionalData: <TreeNodeAdditionalData>{
            fieldType: field.type,
            field: BaseFieldConverter.toUi(field)
          }
        };
      }
      if (field.type == FieldTypeIds.EmbededField && field.fields?.length) {
        const nestedTreeObj = treeObject[field.fieldName].children;
        this.buildFieldsTree(field.fields, nestedTreeObj, treeObject[field.fieldName].rawValue);
      }
    });
  }

  async addDynamicFieldGroup(group?: FieldSetterGroup): Promise<void> {
    this.dynamicFields.push(await this.newDynamicFieldGroup(group));
  }

  removeDynamicFieldGroup(i: number): void {
    this.dynamicFields.removeAt(i);
  }

  async newDynamicFieldGroup(group?: FieldSetterGroup): Promise<FormGroup> {
    if (group) {
      const sampleValueField = await this.createValueFieldConfig('value', group.value, group.field);

      return this.fb.group({
        selectedFieldForTree: new Array(group.fieldPath?.path?.join(pathSeparator)),
        field: group.field,
        fieldPath: group.fieldPath,
        valueForm: {
          fields: [sampleValueField],
          form: this.fb.group({}),
          model: {}
        }
      });
    } else {
      return this.fb.group({
        field: null,
        fieldPath: null,
        valueForm: null
      });
    }
  }

  getFieldTypeLabel(type: FieldTypeIds): string {
    return FieldTypeNameMap.get(type).viewValue;
  }

  async fieldSelected(selection: TreeNodeOutput[], groupIndex: number): Promise<void> {
    if (selection.length) {
      if (this.validateDuplication(selection, groupIndex)) {
        return;
      }
      const group = this.dynamicFields.controls[groupIndex] as FormGroup;
      const path = selection[0]?.value.split(pathSeparator);
      const field = this.getFieldFromPath(path, this.schema.fields);
      const existingValue = this.model ? this.getValueFromModel(this.model, path) : null;

      const sampleValueField = await this.createValueFieldConfig('value', existingValue, field);
      group.controls['field'].setValue(field);
      group.controls['fieldPath'].setValue({ path });
      group.controls['valueForm'].setValue({
        fields: [sampleValueField],
        form: this.fb.group({}),
        model: {}
      });
    }
  }

  /**
   * recursion
   */

  getValueFromModel(model: FormlyModel, path: string[]): any {
    const clonedPath = cloneDeep(path);
    if (clonedPath.length === 1) {
      return model[clonedPath[0]];
    } else {
      const pathItem = clonedPath.shift();
      return this.getValueFromModel(model[pathItem], clonedPath);
    }
  }

  validateDuplication(selection: TreeNodeOutput[], selectionIndex: number): boolean {
    let selectedFields = this.dynamicFields.value;
    for (let index = 0; index < selectedFields.length; index++) {
      const sel = selectedFields[index];
      if (selectionIndex != index && sel.fieldPath?.path?.join(pathSeparator) === selection[0].value) {
        alert(this.ts.instant('duplication'));
        return true;
      }
    }

    return false;
  }

  getFieldFromPath(path: string[], fields: SchemaFieldDto[]): IConfigurableListItem {
    const uiFields = fields.map((f) => BaseFieldConverter.toUi(f));
    return this.expressionHelper.getFieldByPath(path, uiFields);
  }

  async createValueFieldConfig(
    key: string,
    value: any,
    field: IConfigurableListItem,
    cssClass: string = 'col-11 mx-auto'
  ): Promise<FormlyFieldConfig> {
    const dto: FormVariableDto = {
      label: this.ts.instant('Field Value'),
      name: key,
      type: field.type || FieldTypeIds.StringField,
      value: value || undefined,
      required: false,
      disabled: !field.type,
      valueInfo: field.configuration
    };

    if (field.type === FieldTypeIds.ConnectorField) {
      dto.valueInfo.options = await this.populateConnectorFieldOptions(field);
    }

    return adapterToConfig(FormlyFieldAdapterFactory.createAdapter(dto), cssClass);
  }

  getFieldLabel(group: FormGroup): string {
    const fieldPath = group?.controls['fieldPath']?.value?.path;
    let fieldTitle: string = fieldPath ? 'Field: ' + fieldPath[fieldPath?.length - 1] : this.ts.instant('Select Field');

    if (group?.controls['field']?.value) {
      fieldTitle += ` (${this.getFieldTypeLabel(group.controls['field'].value.type)})`;
    }
    return fieldTitle;
  }

  async populateConnectorFieldOptions(field: IConfigurableListItem): Promise<Array<KeyValueDisabled>> {
    let options = await this.connectorService.getConnectorFieldOptions(field.id);
    const selectOptions = options.map((option) => {
      return <KeyValueDisabled>{
        key: option.label,
        value: option.dynamicEntityId,
        disabled: !option.enabled,
        areaType: option.areaType
      };
    });
    if (this.allowDynamicConnectorFieldValue) {
      const connectorConfig = field.configuration?.connectorFieldConfiguration?.entitySource;
      // allow storing dynamic value - the current case id
      if (connectorConfig?.connectorId && this.connector.id === connectorConfig.connectorId) {
        const side = connectorConfig.workflowConnectorSide;

        const workflowName =
          side === ConnectorSide.Destination ? this.connector.workflowSchemaDestination.name : this.connector.workflowSchemaSource.name;

        selectOptions.unshift(<KeyValueDisabled>{
          key: `Current Case From '${workflowName}' Workflow`,
          value: connectorConfig.workflowConnectorSide
        });
      }
    }

    return selectOptions;
  }

  populateValues(): void {
    if (this.checkCopyDataValidity()) {
      const dto: FieldsBuilderOutput = {
        addOrUpdateFields: this.populateDtoForSetField(),
        copyFields: this.getCopyFieldsDto()
      };
      this.dialog.close(dto);
    }
  }

  populateDtoForSetField(): BaseFieldValueType[] {
    const formValue = this.form.value;
    let fieldData: BaseFieldValueType[] = [];
    if (formValue.dynamicFields.length) {
      formValue.dynamicFields.forEach((dynamicField) => {
        if (dynamicField?.valueForm && dynamicField.fieldPath && dynamicField.field) {
          const value = !isUndefinedOrNull(dynamicField.valueForm.model['value']) ? dynamicField.valueForm.model['value'] : null;
          const baseFieldTypeData = this.populateBaseFieldValue(
            cloneDeep(dynamicField.fieldPath?.path),
            dynamicField.field.type,
            value,
            fieldData
          );
          if (fieldData.find((baseValue) => baseValue.id === baseFieldTypeData.id)) {
            // if already added, skip
            // when more than 1 nested field from the same nested schema is selected
            return;
          }
          fieldData.push(baseFieldTypeData);
        }
      });
    }

    return fieldData;
  }

  /**
   * recursion
   */
  populateBaseFieldValue(path: string[], type: FieldTypeIds, value: any, fieldData: BaseFieldValueType[]): BaseFieldValueType {
    if (path?.length === 1) {
      return {
        id: path[0],
        type: type,
        value: this.dynamicEntitiesService.mapFieldTypeToBaseFieldValue(type, value)
      };
    } else {
      const schemaFieldName = path.shift();
      const existingModel = fieldData.find((baseValue) => baseValue.id === schemaFieldName);
      if (existingModel) {
        const embeddedFieldValues = (<EmbededFieldValueDto>existingModel).value;
        embeddedFieldValues.push(this.populateBaseFieldValue(path, type, value, [existingModel]));
        return existingModel;
      } else {
        return {
          id: schemaFieldName,
          type: FieldTypeIds.EmbededField,
          value: [this.populateBaseFieldValue(path, type, value, fieldData)]
        };
      }
    }
  }

  populateModel(fields: BaseFieldValueType[], model: FormlyModel): FormlyModel {
    if (!fields || !fields.length) {
      return null;
    }
    fields.forEach((field) => {
      const key = field.id;
      if (field.type === FieldTypeIds.EmbededField) {
        model[key] = {};
        this.populateModel(<BaseFieldValueType[]>field.value, model[key]);
      } else if (field.type === FieldTypeIds.ListField) {
        model[key] = (<ListValue>field.value)?.listItemId ? (<ListValue>field.value).listItemId : field.value;
      } else if (field.type === FieldTypeIds.ConnectorField) {
        if (!isUndefinedOrNull(field.value)) {
          model[key] = isArray(field.value) ? field.value : [field.value];
        } else {
          model[key] = null;
        }
      } else {
        model[key] = !isUndefinedOrNull(field.value) ? field.value : null;
      }
    });
    return model;
  }

  /**
   * copyFields methods
   */
  populateFieldsTree(): void {
    let fieldTree = {};
    this.buildFieldsTree(this.schema.fields, fieldTree);
    setTimeout(() => {
      this.fieldsTreeNodes = fieldTree;
    });
  }

  addNewSourceToDestination(existingSourceToDestination?: SourceToDestinationWithPath): void {
    let sourceType = AreaTypeEnum.case;
    let destinationType = AreaTypeEnum.case;

    let sourceField: FieldPathInput = {
      fieldKey: `source${this.sourceToDestinationFieldPathInputs.length + 1}`,
      allowedAreaTypes: [sourceType]
    };
    let destinationField: FieldPathInput = {
      fieldKey: `destination${this.sourceToDestinationFieldPathInputs.length + 1}`,
      allowedAreaTypes: [destinationType]
    };

    if (existingSourceToDestination) {
      sourceField = {
        ...sourceField,
        entityType: sourceType,
        fieldPaths: [cloneDeep(existingSourceToDestination.source)]
      };

      destinationField = {
        ...destinationField,
        entityType: destinationType,
        fieldPaths: [cloneDeep(existingSourceToDestination.destination)]
      };
    }

    this.sourceToDestinationFieldPathInputs.push({
      source: sourceField,
      destination: destinationField
    });
  }

  removeSourceToDestination(index: number): void {
    this.sourceToDestinationFieldPathInputs.splice(index, 1);
    this.sourceToDestinationFieldPathOutputs.splice(index, 1);
  }

  populateCopyWorkflows(): void {
    switch (this.caseUpdateSide) {
      case ConnectorSide.Source:
        this.copyDestinationWorkflow = this.connector.workflowSchemaSource;
        this.copySourceWorkflow = this.connector.workflowSchemaDestination;
        break;
      case ConnectorSide.Destination:
        this.copyDestinationWorkflow = this.connector.workflowSchemaDestination;
        this.copySourceWorkflow = this.connector.workflowSchemaSource;
        break;
      default:
        break;
    }
    this.sourceTitle = this.ts.instant('Select Source Field From') + ` ${this.copySourceWorkflow?.name}`;
    this.destinationTitle = this.ts.instant('Select Destination Field In') + ` ${this.copyDestinationWorkflow?.name}`;
  }

  sourcePathUpdated(data: FieldPathOutput, groupIndex: number): void {
    if (!this.sourceToDestinationFieldPathOutputs[groupIndex]) {
      this.sourceToDestinationFieldPathOutputs[groupIndex] = {
        source: null,
        destination: null
      };
    }

    this.sourceToDestinationFieldPathOutputs[groupIndex].source = data.fieldPaths && data.fieldPaths[0];
  }

  destinationPathUpdated(data: FieldPathOutput, groupIndex: number): void {
    if (!this.sourceToDestinationFieldPathOutputs[groupIndex]) {
      this.sourceToDestinationFieldPathOutputs[groupIndex] = {
        source: null,
        destination: null
      };
    }
    this.sourceToDestinationFieldPathOutputs[groupIndex].destination = data.fieldPaths && data.fieldPaths[0];
  }

  getCopyFieldsDto(): SourceToDestinationWithPath[] {
    if (this.sourceToDestinationFieldPathOutputs.length) {
      const data = this.clearExtraData(this.sourceToDestinationFieldPathOutputs);
      return data;
    } else {
      return this.copyFieldsDto;
    }
  }

  clearExtraData(data: SourceToDestinationWithPath[]): SourceToDestinationWithPath[] {
    if (data?.length > 0) {
      data.forEach((group) => {
        if (group?.source?.type && group?.destination?.type) {
          delete group.source.type;
          delete group.source.field;
          delete group.destination.type;
          delete group.destination.field;
        }
      });
    }
    return data;
  }

  checkCopyDataValidity(): boolean {
    let isValid = true;
    if (this.sourceToDestinationFieldPathOutputs.length > 0) {
      for (let index = 0; index < this.sourceToDestinationFieldPathOutputs.length; index++) {
        const currentGroup = this.sourceToDestinationFieldPathOutputs[index];

        //check for fieldTypes compatibilty
        if (currentGroup.source && currentGroup.destination) {
          if (currentGroup.source.type && currentGroup.destination.type && currentGroup.source.type !== currentGroup.destination.type) {
            isValid = false;
            this.snackbar.open(this.ts.instant('Source and Destination should have a same field type'), 'Ok', { duration: 3000 });
            break;
          }
          // check fot connectorField entitySource compatibility
          if (currentGroup.source.type === FieldTypeIds.ConnectorField) {
            const sourceWorkflowSchemaId =
              currentGroup.source.field?.configuration?.connectorFieldConfiguration?.entitySource?.workflowSchemaId;
            const destinationWorkflowSchemaId =
              currentGroup.destination.field?.configuration?.connectorFieldConfiguration?.entitySource?.workflowSchemaId;

            if (sourceWorkflowSchemaId !== destinationWorkflowSchemaId) {
              isValid = false;
              this.snackbar.open(this.ts.instant('Source and Destination Connector Fields should be pointing to the same Workflow'), 'Ok', {
                duration: 5000
              });
              break;
            }
          }
        } else {
          isValid = false;
        }
      }
    }

    return isValid;
  }
}
