/**
 * global
 */

import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, filter, map, take, takeUntil, tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';

/**
 * project
 */
import { IConfigurableListItem, IFormlyView, KeyValueView } from '@wfm/common/models';
import { FieldTypeIds, ListsService } from '@wfm/service-layer';
import { createValueField } from '@wfm/forms-flow-struct/form-rule-builder/fields';
import { FormlyFieldAdapterFactory } from '@wfm/common/vendor';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store/application/application.reducer';

/**
 * local
 */
import { IFieldDefaultValueOutput } from './i-field-default-value-output-event';
import {
  ComputedValueTriggerEventEnum,
  DefaultValueTypeEnum,
  FieldTypeDefaultValueTypeMap,
  FieldTypeToDynamicValueTypeMap,
  FieldTypeToSystemValueTypeMap,
  SystemEventTypes
} from './FieldDefaultValues';
import { MatDialog } from '@angular/material/dialog';
import { BaseFieldConverter } from '@wfm/service-layer/helpers';
import { FormulaGeneratorComponent } from '@wfm/shared/formula-generator/formula-generator.component';
import { getSelectedSchemaSelector } from '@wfm/store';
import { FormulaConfig } from '@wfm/service-layer/models/formula';
import { TranslateService } from '@ngx-translate/core';

type Key = keyof IConfigurableListItem & string;
const defaultValueKey: Key = 'defaultValueType';
const staticValueKey: Key = 'staticValueField';
const dynamicValueKey: Key = 'dynamicValueType';
const systemDefaultValue: Key = 'systemDefaultValueType';
const systemEvent: Key = 'systemEventType';
const computedEvent: Key = 'computedEventType';

@Component({
  selector: 'app-field-default-value',
  templateUrl: './field-default-value.component.html',
  styleUrls: ['./field-default-value.component.scss']
})
export class FieldDefaultValueComponent extends TenantComponent implements OnInit {
  @Input() fieldType$: Observable<FieldTypeIds>;
  @Input() listId$: Observable<string>;
  @Input() field?: IConfigurableListItem;
  @Input() hideComputeValueOption: boolean;
  @Output() update = new EventEmitter<IFieldDefaultValueOutput>();
  // view$: Observable<IFormlyView<any>>;
  localFieldCopy: IConfigurableListItem;

  systemEventTypes = [
    {
      key: SystemEventTypes.Create,
      label: 'Create'
    },
    {
      key: SystemEventTypes.Update,
      label: 'Update'
    },
    {
      key: SystemEventTypes.Both,
      label: 'Create and Update'
    }
  ];

  computedValueEvents = [
    {
      key: ComputedValueTriggerEventEnum.Always,
      label: 'Constantly'
    },
    {
      key: ComputedValueTriggerEventEnum.OnSubmit,
      label: 'On Submitting The Form'
    }
  ];
  view: IFormlyView<any>;
  computedFormula: FormulaConfig;

  get defaultValueType() {
    return DefaultValueTypeEnum;
  }
  constructor(
    private fb: FormBuilder,
    private listService: ListsService,
    private store: Store<ApplicationState>,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef,
    private ts: TranslateService
  ) {
    super(store);
  }

  ngOnInit() {
    this.localFieldCopy = { ...this.field };
    this.localFieldCopy.configuration = this.localFieldCopy.configuration || {
      position: 0
    };
    if (this.localFieldCopy.configuration.defaultValueType === DefaultValueTypeEnum.computed) {
      try {
        this.computedFormula = JSON.parse(this.localFieldCopy.configuration.computeDefaultValueFormula);
      } catch (error) {
        console.log(error);
      }
    }
    this.populateFormlyView();
  }

  populateFormlyView(): void {
    this.fieldType$
      .pipe(
        filter((x) => !!x),
        map((fieldType) => {
          if (this.localFieldCopy) {
            this.localFieldCopy.type = fieldType;
            this.localFieldCopy.configuration = { ...this.field?.configuration } || {
              position: 0
            };
          }

          this.view = this.createView();
          // setTimeout(() => {
          this.addExpressions();
          // });
        }),
        tap(() => {
          this.view.form.valueChanges.pipe(debounceTime(100)).subscribe(() => {
            if (this.view.model[defaultValueKey] !== DefaultValueTypeEnum.computed) {
              this.computedFormula = null;
            } else {
              if (!this.computedFormula) {
                // new
                this.openFormulaBuilder();
              }
            }
            this.update.next(this.createOutputEvent());
          });
          // when a list is selected we want to populate its options in default value selectbox
          this.listId$
            .pipe(
              takeUntil(this.destroyed$),
              filter((x) => !!x)
            )
            .subscribe((listId: string) => {
              this.view.fields.forEach(async (field) => {
                if (field.key === staticValueKey) {
                  let result = await this.listService.getListItems(this.tenant, listId);
                  field.templateOptions.options = of(
                    result.items?.map((option) => {
                      return {
                        key: option.item,
                        value: option.id
                      };
                    }) || []
                  );
                  this.view.model[staticValueKey] = '';
                }
              });
              // }
            });
        })
      )
      .subscribe();
  }

  /**
   * based on selected default value type option hide and reset the value for the non active value formfields
   */

  addExpressions(): void {
    this.view.fields.forEach((field) => {
      switch (field.key) {
        case staticValueKey:
          field.hideExpression = (model) => {
            if (model[defaultValueKey] !== DefaultValueTypeEnum.static) {
              model[staticValueKey] = null;
              return true;
            }
            return false;
          };
          break;
        case dynamicValueKey:
          field.hideExpression = (model) => {
            if (model[defaultValueKey] !== DefaultValueTypeEnum.dynamic) {
              model[dynamicValueKey] = null;
              return true;
            }
            return false;
          };
          break;
        case systemDefaultValue:
          field.hideExpression = (model) => {
            if (model[defaultValueKey] !== DefaultValueTypeEnum.system) {
              model[systemDefaultValue] = null;
              return true;
            }
            return false;
          };
          break;
        case systemEvent:
          field.hideExpression = (model) => {
            if (model[defaultValueKey] !== DefaultValueTypeEnum.system) {
              model[systemEvent] = null;
              return true;
            }
            return false;
          };
          break;
        case computedEvent:
          field.hideExpression = (model) => {
            if (model[defaultValueKey] !== DefaultValueTypeEnum.computed) {
              model[computedEvent] = null;
              return true;
            }
            return false;
          };
          break;
      }
    });
  }

  // populate the saved values for each field
  private createView(): IFormlyView<any> {
    const model = {};
    let fieldTypeDefaultValueTypes = FieldTypeDefaultValueTypeMap.get(this.localFieldCopy.type).map((option) => {
      return new KeyValueView(option.key, option.value, this.ts.instant(option.label));
    });
    if (this.hideComputeValueOption) {
      fieldTypeDefaultValueTypes = fieldTypeDefaultValueTypes.filter((x) => x.value !== DefaultValueTypeEnum.computed);
    }
    const valueTypeAdapter = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('Default value type'),
      name: defaultValueKey,
      type: FieldTypeIds.ListField,
      readonly: false,
      value: this.localFieldCopy?.configuration?.defaultValueType || '',
      valueInfo: {
        options: [...fieldTypeDefaultValueTypes],
        labelProp: 'label',
        valueProp: 'value'
      }
    });
    const valueTypeField = valueTypeAdapter.getConfig();
    valueTypeField.templateOptions.labelProp = 'viewValue';
    valueTypeField.className = 'col-12';
    // static value based on type
    const staticValueField = createValueField(staticValueKey, this.localFieldCopy?.configuration?.value, this.localFieldCopy);
    staticValueField.expressionProperties = {
      'templateOptions.required': (model) => {
        return model[defaultValueKey] === DefaultValueTypeEnum.static;
      }
    };
    // dynamic value type selector
    const currentValueAdapter = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('Dynamic value type'),
      name: dynamicValueKey,
      type: FieldTypeIds.ListField,
      readonly: false,
      value: this.localFieldCopy?.configuration?.dynamicValue || undefined,
      valueInfo: {
        options: [
          ...FieldTypeToDynamicValueTypeMap.get(this.localFieldCopy.type).map((option) => {
            return new KeyValueView(option.key, option.value, this.ts.instant(option.label));
          })
        ],
        labelProp: 'label',
        valueProp: 'value'
      }
    });
    const currentValueField = currentValueAdapter.getConfig();
    currentValueField.templateOptions.labelProp = 'viewValue';
    currentValueField.className = 'col-11 mx-auto';
    currentValueField.expressionProperties = {
      'templateOptions.required': (model) => {
        return model[defaultValueKey] === DefaultValueTypeEnum.dynamic;
      }
    };

    // system value type selector
    const systemValueAdapter = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('System default value type'),
      name: systemDefaultValue,
      type: FieldTypeIds.ListField,
      readonly: false,
      value: this.localFieldCopy?.configuration?.systemDefaultType || undefined,
      valueInfo: {
        options: [
          ...FieldTypeToSystemValueTypeMap.get(this.localFieldCopy.type).map((option) => {
            return new KeyValueView(option.key, option.value, this.ts.instant(option.label));
          })
        ],
        labelProp: 'label',
        valueProp: 'value'
      }
    });
    const systemDefaultField = systemValueAdapter.getConfig();
    systemDefaultField.templateOptions.labelProp = 'viewValue';
    systemDefaultField.className = 'col-11 mx-auto';

    systemDefaultField.expressionProperties = {
      'templateOptions.required': (model) => {
        return model[defaultValueKey] === DefaultValueTypeEnum.system;
      }
    };
    //system event that will trigger system value population
    const systemEventTypeConfig = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('System event type'),
      name: systemEvent,
      type: FieldTypeIds.ListField,
      readonly: false,
      value: this.localFieldCopy?.configuration?.systemDefaultEvent || undefined,
      valueInfo: {
        options: [
          ...this.systemEventTypes.map((option) => {
            return new KeyValueView(option.label.toLowerCase(), option.key, this.ts.instant(option.label));
          })
        ],
        labelProp: 'label',
        valueProp: 'value'
      }
    });
    const systemEventField = systemEventTypeConfig.getConfig();
    systemEventField.templateOptions.labelProp = 'viewValue';
    systemEventField.className = 'col-11 mx-auto';
    systemEventField.expressionProperties = {
      'templateOptions.required': (model) => {
        return model[defaultValueKey] === DefaultValueTypeEnum.system;
      }
    };

    const computedEventTypeConfig = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('When to trigger computation'),
      name: computedEvent,
      type: FieldTypeIds.ListField,
      readonly: false,
      value: this.localFieldCopy?.configuration?.computeTriggerEvent || undefined,
      valueInfo: {
        options: [
          ...this.computedValueEvents.map((option) => {
            return new KeyValueView(option.label.toLowerCase(), option.key, this.ts.instant(option.label));
          })
        ],
        labelProp: 'label',
        valueProp: 'value'
      }
    });
    const computeEventField = computedEventTypeConfig.getConfig();
    computeEventField.templateOptions.labelProp = 'viewValue';
    computeEventField.className = 'col-11 mx-auto';
    computeEventField.expressionProperties = {
      'templateOptions.required': (model) => {
        return model[defaultValueKey] === DefaultValueTypeEnum.computed;
      }
    };
    const fields = [valueTypeField, staticValueField, currentValueField, systemDefaultField, systemEventField, computeEventField];

    const view: IFormlyView<any> = {
      fields,
      form: this.fb.group({}),
      model
    };
    return view;
  }

  /**
   * passes the default value type and value to the parent component: field-editor.component
   */
  createOutputEvent(): IFieldDefaultValueOutput {
    if (this.view && this.view.model) {
      const valueType = this.view.model[defaultValueKey];

      let output: IFieldDefaultValueOutput = {
        defaultValueType: valueType,
        dirty: this.view.form.dirty,
        valid: this.view.form.valid
      };
      switch (valueType) {
        case DefaultValueTypeEnum.static:
          output.value = this.view.model[staticValueKey];
          break;
        case DefaultValueTypeEnum.dynamic:
          output.dynamicValueType = this.view.model[dynamicValueKey];
          break;
        case DefaultValueTypeEnum.system:
          output.systemValueType = this.view.model[systemDefaultValue];
          output.systemEventType = this.view.model[systemEvent];
          break;
        case DefaultValueTypeEnum.computed:
          output.computeDefaultValueFormula = JSON.stringify(this.computedFormula);
          output.computeTriggerEvent = this.view.model[computedEvent];
          break;
        default:
          break;
      }
      return output;
    }
  }

  openFormulaBuilder(): void {
    this.store
      .select(getSelectedSchemaSelector)
      .pipe(
        filter((x) => !!x),
        take(1)
      )
      .subscribe((schema) => {
        const dialogRef = this.dialog.open(FormulaGeneratorComponent, { width: '600px' });
        dialogRef.componentInstance.fields = schema.fields.map((f) => BaseFieldConverter.toUi(f));
        dialogRef.componentInstance.targetFieldType = this.localFieldCopy.type;
        if (this.computedFormula) {
          dialogRef.componentInstance.formulaDto = this.computedFormula;
        }
        return dialogRef.afterClosed().subscribe((result) => {
          if (result?.data) {
            this.computedFormula = result.data;
            this.update.next(this.createOutputEvent());
            this.cd.detectChanges();
          }
        });
      });
  }
}
