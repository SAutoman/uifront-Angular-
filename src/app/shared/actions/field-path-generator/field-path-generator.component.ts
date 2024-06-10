/**
 * global
 */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { Store } from '@ngrx/store';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { cloneDeep } from 'lodash-core';
import { from, Observable } from 'rxjs';
import { switchMap, map, takeUntil, debounceTime, startWith } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

/**
 * project
 */
import { IFormlyView, KeyValueView } from '@wfm/common/models';
import { FormlyFieldAdapterFactory } from '@wfm/common/vendor';
import {
  AreaTypeEnum,
  AreaTypeMap,
  FieldTypeIds,
  FieldTypeNameMap,
  ProcessStepEntityDto,
  SchemaDto,
  SchemaFieldDto,
  WorkflowDto
} from '@wfm/service-layer';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { TreeLikeNodes, TreeNodeAdditionalData } from '@wfm/shared/tree-selectbox/checklist-database.service';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { PropertyPathTypeEnum, ProcessStepPath, RawDataPath } from '@wfm/service-layer/models/expressionModel';

import { FieldPathInput, FieldPathOutput, PropertyPathExtended } from './FieldPathModels';
import { TreeNodeOutput } from '@wfm/shared/tree-selectbox/tree-selectbox.component';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';

interface StepDataWithRefName extends ProcessStepEntityDto {
  refName: string;
}

interface IView {
  formly: IFormlyView<IFields>;
  tenantId: string;
}

interface IFields {
  entityType: AreaTypeEnum;
  entity: string;
  fieldPath: string[]; //it is an array to support nested fields
}

interface ReferenceField extends SchemaFieldDto {
  label: string;
  path: string[];
  schema: SchemaDto;
}

export const pathSeparator = '-|-';
const entityFieldControlKey = 'entityFieldControl';
const fieldTypeControlKey = 'fieldType';
const fieldControlKey = 'field';

@Component({
  selector: 'app-field-path-generator',
  templateUrl: './field-path-generator.component.html',
  styleUrls: ['./field-path-generator.component.scss'],
  providers: [{ provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } }]
})
export class FieldPathGeneratorComponent extends TenantComponent implements OnInit {
  @Input() workflow: WorkflowDto;
  @Input() fieldPathInput: FieldPathInput;
  @Input() steps: StepDataWithRefName[];
  @Input() allowedFieldTypes: FieldTypeIds[];
  @Input() includeFieldRefInOutput: boolean = false;
  @Input() isChildRefAllowed: boolean = false;
  @Output() fieldPathEmitter: EventEmitter<FieldPathOutput> = new EventEmitter();
  view$: Observable<IView>;
  _view: IView;
  model: IFields;
  fieldsTreeNodes: TreeLikeNodes = null;
  selectedFieldForTree: string[];
  hasFields: boolean = true;
  schemaFields: SchemaFieldDto[];
  rawDataRefFields: ReferenceField[] = [];

  fieldLabel: string;
  isFirstLoadDone: boolean = false;
  constructor(
    store: Store<ApplicationState>,
    private adminSchemasService: AdminSchemasService,
    private ts: TranslateService,
    private errorHandler: ErrorHandlerService
  ) {
    super(store);
  }

  async ngOnInit(): Promise<void> {
    const area = this.fieldPathInput.allowedAreaTypes ? this.fieldPathInput.allowedAreaTypes[0] : null;
    this.model = {
      entityType: area,
      entity: this.fieldPathInput?.entityRefName || '',
      fieldPath: null
    };
    if (area === AreaTypeEnum.case) {
      this.model.entity = this.workflow.name;
    }
    if (this.fieldPathInput.allowedAreaTypes.includes(AreaTypeEnum.rawData)) {
      const caseSchema = await this.adminSchemasService.getSchema(this.workflow.tenantId, AreaTypeEnum.case, this.workflow.caseSchemaId);
      await this.getRawDataReferences(caseSchema, this.rawDataRefFields, [], '');
    }
    if (this.fieldPathInput?.fieldPaths?.length) {
      this.setModelValuesOnUpdate();
    }
    this.view$ = this.createFormlyView();
  }

  async getRawDataReferences(
    schema: SchemaDto,
    rawDataReferences: ReferenceField[],
    parentPath: string[],
    parentName: string
  ): Promise<void> {
    try {
      for (const field of schema.fields) {
        if (field.type === FieldTypeIds.ListOfLinksField && field.configuration.schemaAreaType === AreaTypeEnum.rawData) {
          const refSchema = await this.adminSchemasService.getSchema(
            this.tenant,
            field.configuration.schemaAreaType,
            field.configuration.schemaId
          );
          const fieldWithPath: ReferenceField = {
            ...field,
            schema: refSchema,
            path: [...parentPath, field.fieldName],
            label: parentName ? `${field.displayName} (child reference in ${parentName})` : `${field.displayName}`
          };
          rawDataReferences.push(fieldWithPath);
          if (this.isChildRefAllowed) {
            await this.getRawDataReferences(refSchema, rawDataReferences, fieldWithPath.path, fieldWithPath.label);
          }
        }
      }
    } catch (error) {
      this.errorHandler.getAndShowErrorMsg(error);
    }
  }

  createFormlyView(): Observable<IView> {
    return this.tenant$.pipe(
      map((tenantId) => {
        const view: IView = {
          formly: this.populateFields(),
          tenantId
        };
        return view;
      }),
      map((view) => {
        this._view = view;
        this._view.formly.form.valueChanges.pipe(debounceTime(100)).subscribe((x) => {
          this.fieldLabel = this.getFieldLabel();
          this.fieldPathEmitter.emit(this.populateOutput(this._view));
        });
        return view;
      })
    );
  }

  populateFields(): IFormlyView<IFields> {
    const options = (this.fieldPathInput.allowedAreaTypes || [AreaTypeEnum.case, AreaTypeEnum.stepForm]).map((areaType) =>
      AreaTypeMap.get(areaType)
    );
    const entityTypeSelector = FormlyFieldAdapterFactory.createAdapter({
      name: 'entityType',
      type: FieldTypeIds.ListField,
      label: this.ts.instant('Entity Type'),
      required: true,
      valueInfo: {
        options
      },
      value: this.model.entityType
    }).getConfig();

    entityTypeSelector.templateOptions.labelProp = 'viewValue';
    entityTypeSelector.templateOptions.disabled = options.length === 1;

    const entitySelector = FormlyFieldAdapterFactory.createAdapter({
      name: 'entity',
      type: FieldTypeIds.ListField,
      label: this.ts.instant('Select Entity'),
      required: true,
      valueInfo: {
        options: []
      },
      value: this.model.entity
    }).getConfig();

    entitySelector.templateOptions.labelProp = 'viewValue';
    entitySelector.templateOptions.valueProp = 'key';
    entitySelector.hooks = {
      onInit: (field: FormlyFieldConfig) => {
        field.templateOptions.disabled = this.fieldPathInput.disableEntitySelector || false;
        field.templateOptions.options = field.form.get('entityType').valueChanges.pipe(
          takeUntil(this.destroyed$),
          startWith(this.model.entityType),
          switchMap((areaType: AreaTypeEnum) => {
            if (areaType) {
              if (field.form.get('entityType').touched || this.isFirstLoadDone) {
                // isFirstLoadDone : To deal with control's tocuhed value showing
                // false on first selection from the UI

                // when parent control's value changes, the child control shall be reset
                field.formControl.reset();
                field.form.get(entityFieldControlKey).reset();
                this.selectedFieldForTree = [];
              }
              this.fieldsTreeNodes = null;
              if (!this.isFirstLoadDone) {
                this.isFirstLoadDone = true;
              }
              return this.getEntities(areaType);
            }
          })
        );

        field.formControl.valueChanges
          .pipe(takeUntil(this.destroyed$), startWith(this.model.entity))
          .subscribe(async (entityRefName: string) => {
            if (field.formControl.touched) {
              field.form.get(entityFieldControlKey).reset();
            }
            this.fieldsTreeNodes = null;
            if (entityRefName) {
              await this.populateFieldsTree(field.form.get('entityType').value, entityRefName);
            }
          });
      }
    };

    const fields = [entityTypeSelector, entitySelector];
    fields.forEach((x) => {
      x.className = 'col px-2';
    });

    const view: IFormlyView<IFields> = {
      form: new FormGroup({
        [entityFieldControlKey]: new FormControl(this.model.fieldPath)
      }),
      fields,
      model: this.model
    };
    return view;
  }

  setModelValuesOnUpdate(): void {
    let pathSplits = [...this.fieldPathInput.fieldPaths[0].path];
    this.model.entityType = this.fieldPathInput.entityType;
    if (this.fieldPathInput.entityType === AreaTypeEnum.stepForm) {
      this.model.entity = (<ProcessStepPath>this.fieldPathInput.fieldPaths[0]).processStepRefName;
      this.model.fieldPath = pathSplits;
      this.selectedFieldForTree = [pathSplits.join(pathSeparator)];
    } else if (this.fieldPathInput.entityType === AreaTypeEnum.case) {
      // this.model.entity = this.workflow.name;
      this.model.fieldPath = pathSplits;
      this.selectedFieldForTree = [pathSplits.join(pathSeparator)];
    } else if (this.fieldPathInput.entityType === AreaTypeEnum.rawData) {
      if (this.fieldPathInput.entityRefName) {
        this.model.entity = this.fieldPathInput.entityRefName;
      } else if ((<RawDataPath>this.fieldPathInput.fieldPaths[0]).rawDataFieldName) {
        this.model.entity = (<RawDataPath>this.fieldPathInput.fieldPaths[0]).rawDataFieldName;
      } else if (this.rawDataRefFields?.length === 1) {
        // backward compatibilty for existing postactions in workflows with single RawDataReference
        const firstRawDataRefName = this.rawDataRefFields[0].path.join(pathSeparator);
        this.model.entity = firstRawDataRefName;
      }
      this.model.fieldPath = pathSplits;
      this.selectedFieldForTree = [pathSplits.join(pathSeparator)];
    }
  }

  /**
   * get entities of workflow based on the areatype
   */

  getEntities(entityType: AreaTypeEnum): Observable<KeyValueView<string, StepDataWithRefName | WorkflowDto>[]> {
    switch (entityType) {
      case AreaTypeEnum.case:
        return from([[new KeyValueView(this.workflow.name, this.workflow, this.workflow.name)]]);
      case AreaTypeEnum.stepForm:
        return from([
          this.steps?.map((step) => {
            return new KeyValueView(step.refName, step, step.name);
          })
        ]);
      case AreaTypeEnum.rawData:
        const items = [];
        this.rawDataRefFields.forEach((field) => {
          items.push(new KeyValueView(field.path.join(pathSeparator), field.schema, field.label));
        });

        return from([items]);

      default:
        from([]);
    }
  }

  async getSchemaFields(id: string, tenantId: string, area: AreaTypeEnum): Promise<SchemaFieldDto[]> {
    let schema = await this.adminSchemasService.getSchema(tenantId, area, id);
    const schemaFields = schema.fields?.filter((x) => x.type !== FieldTypeIds.ListOfLinksField);
    return cloneDeep(schemaFields);
  }

  populateOutput(view: IView): FieldPathOutput {
    const formValues = view.formly?.form?.getRawValue();
    let data: FieldPathOutput;
    if (formValues) {
      data = {
        fieldKey: this.fieldPathInput.fieldKey,
        fieldPaths: [
          <PropertyPathExtended>{
            path: null,
            type: null,
            pathType: null
          }
        ],
        isValid: false,
        entityType: formValues.entityType
      };
      const fieldPath = data.fieldPaths[0];

      switch (formValues.entityType) {
        case AreaTypeEnum.stepForm:
          if (formValues.entity && formValues[entityFieldControlKey]) {
            fieldPath.pathType = PropertyPathTypeEnum.ProcessStepPath;
            (<ProcessStepPath>fieldPath).processStepRefName = formValues.entity;
            fieldPath.path = [...formValues[entityFieldControlKey]];
            data.isValid = true;
            if (formValues?.fieldType) {
              fieldPath.type = formValues.fieldType;
            }
            if (this.includeFieldRefInOutput && formValues?.field) {
              fieldPath.field = formValues.field;
            }
          } else {
            data.fieldPaths = null;
          }
          break;
        case AreaTypeEnum.case:
          if (formValues[entityFieldControlKey]) {
            fieldPath.pathType = PropertyPathTypeEnum.CasePath;
            fieldPath.path = formValues[entityFieldControlKey];
            data.isValid = true;
            if (formValues?.fieldType) {
              fieldPath.type = formValues.fieldType;
            }
            if (this.includeFieldRefInOutput && formValues?.field) {
              fieldPath.field = formValues.field;
            }
          } else {
            data.fieldPaths = null;
          }
          break;
        case AreaTypeEnum.rawData:
          if (formValues[entityFieldControlKey]) {
            fieldPath.pathType = PropertyPathTypeEnum.RawDataPath;

            fieldPath.path = formValues[entityFieldControlKey];
            // for childRef rawDatas, entityName is the stringified path starting from parent refName

            const rawDataPath: string[] = formValues.entity ? cloneDeep(formValues.entity?.split(pathSeparator)) : [];
            if (rawDataPath.length) {
              const name = rawDataPath?.splice(0, 1);
              // store the parentRefName, cause it's in the level of caseFields
              (<RawDataPath>fieldPath).rawDataFieldName = name[0];
              // the rest of childRawDataRef path is to be part of the selected fieldPath
              fieldPath.path.unshift(...rawDataPath);
            }

            data.isValid = true;
            if (formValues?.fieldType) {
              fieldPath.type = formValues.fieldType;
            }
            if (this.includeFieldRefInOutput && formValues?.field) {
              fieldPath.field = formValues.field;
            }
          } else {
            data.fieldPaths = null;
          }
          break;
        default:
          break;
      }
    }
    return data;
  }

  async populateFieldsTree(entityType: AreaTypeEnum, entityRefName: string): Promise<void> {
    const fieldsTree = {};
    this.schemaFields = [];
    switch (entityType) {
      case AreaTypeEnum.case:
        this.schemaFields = await this.getSchemaFields(this.workflow.caseSchemaId, this.workflow.tenantId, entityType);
        break;
      case AreaTypeEnum.stepForm:
        const step = this.steps?.find((step) => step.refName === entityRefName);
        this.schemaFields = await this.getSchemaFields(step?.schemaId, this.workflow.tenantId, entityType);
        break;
      case AreaTypeEnum.rawData:
        const selectedSchema = this.rawDataRefFields.find((field) => field.path.join(pathSeparator) === entityRefName)?.schema;
        this.schemaFields = selectedSchema?.fields?.filter((x) => x.type !== FieldTypeIds.ListOfLinksField);
        break;
      default:
        break;
    }

    this.buildFieldsTree(this.schemaFields, fieldsTree);
    setTimeout(() => {
      this.fieldsTreeNodes = fieldsTree;
      this.hasFields = !Object.keys(this.fieldsTreeNodes).length ? false : true;
    });
  }

  /**
   * recursively build each level of the tree
   */
  buildFieldsTree(fields: SchemaFieldDto[], treeObject: TreeLikeNodes, parentRawValue?: string): void {
    if (this.allowedFieldTypes?.length > 0) {
      fields = this.filterFields(fields);
    }

    fields.forEach((field) => {
      if (!treeObject[field.fieldName]) {
        const additionalData: TreeNodeAdditionalData = {
          fieldType: field.type
        };
        if (this.includeFieldRefInOutput) {
          additionalData.field = cloneDeep(field);
        }
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
  }

  filterFields(fields: SchemaFieldDto[]): SchemaFieldDto[] {
    const filteredFields = [];
    fields.forEach((field) => {
      if (this.allowedFieldTypes.includes(field.type)) {
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

  fieldSelectionEmitted(selection: TreeNodeOutput[]): void {
    const fieldPath = selection[0]?.value.split(pathSeparator);
    this._view.formly.form.get(entityFieldControlKey).setValue(fieldPath, { emitEvent: true });
    if (selection[0]?.additionalData) {
      if (!this._view.formly.form.controls?.fieldType) {
        this._view.formly.form.addControl(fieldTypeControlKey, new FormControl(selection[0]?.additionalData?.fieldType));
      } else {
        this._view.formly.form.controls[fieldTypeControlKey].patchValue(selection[0].additionalData?.fieldType);
      }

      if (this.includeFieldRefInOutput) {
        if (!this._view.formly.form.controls?.field) {
          this._view.formly.form.addControl(fieldControlKey, new FormControl(selection[0]?.additionalData?.field));
        } else {
          this._view.formly.form.controls[fieldControlKey].patchValue(selection[0].additionalData?.field);
        }
      }
    }
  }

  getFieldLabel(): string {
    const label = 'Select Field';
    const fieldPath = this._view.formly.form.get(entityFieldControlKey)?.value;
    const fieldType = this._view.formly.form.get(fieldTypeControlKey)?.value;
    let fieldTitle: string = fieldPath ? 'Field: ' + fieldPath[fieldPath?.length - 1] : this.ts.instant(label);
    if (fieldType) {
      fieldTitle += ` (${this.getFieldTypeLabel(fieldType)})`;
    }

    return fieldTitle;
  }

  getFieldTypeLabel(type: FieldTypeIds): string {
    return FieldTypeNameMap.get(type).viewValue;
  }
}
