/**
 * global
 */
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { cloneDeep, remove } from 'lodash-core';
import { filter, take, takeUntil } from 'rxjs/operators';
import { DateTime } from 'luxon';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

/**
 * project
 */
import { IFormlyView, IConfigurableListItem } from '@wfm/common/models';
import { FormlyFieldAdapterFactory, IFormlyRightButtonAddonConfig } from '@wfm/common/vendor';
import { FieldTypeIds, SchemaFieldDto } from '@wfm/service-layer';
import { IObjectMap } from '@wfm/common/models/i-object-map';
import { Addons } from '@wfm/common/vendor/formly-addons/addonNames';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { RuleCustomOperatorEnum, RuleSetCustomCondition } from '@wfm/service-layer/models/expressionModel';
import { SchemaFunctionsState, schemaFunctionsStateSelector } from '@wfm/store';
import { ColorEnum } from '@wfm/service-layer/models/color.enum';

/**
 * local
 */
import { adapterToConfig, createConditionField, createOperatorField, createValueField } from './fields';
import { IFunctionItemModel, ISchemaFieldRule, IRuleSet } from '../interface/expression/expressionModelUI';
import { KeyValueGroup } from '../form-function-item/form-function-item.component';

interface IRuleForm {
  rule: ISchemaFieldRule;
}

interface IView {
  condition: IFormlyView<IObjectMap<RuleSetCustomCondition>>;
  rules: IFormlyView<IRuleForm>[];
}

const ruleKey = 'rule';
const conditionKey = 'condition';
const itemIdKey = 'itemId';
const operatorKey = 'operator';
const valueKey = 'value';

@Component({
  selector: 'app-form-rule-builder',
  templateUrl: './form-rule-builder.component.html',
  styleUrls: ['./form-rule-builder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
/**
 * TODO relocate it to global module later
 */
export class FormRuleBuilderComponent extends TenantComponent implements OnInit, AfterViewInit {
  @Input() readonly listOptions: KeyValueGroup<string, IConfigurableListItem<any>>[];
  @Input() readonly modelRef?: IFunctionItemModel;
  @Input() readonly addDefaultRuleIfEmpty?: boolean;
  @Input() readonly expressionId?: string;
  @Output() update = new EventEmitter<IRuleSet>();

  view: IView;
  /**
   * the field selected as the target of the subject expression
   */
  selectedTargetFields: string[] = [];
  @Output() conditionFormChanges = new EventEmitter<boolean>();

  constructor(
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private store: Store<ApplicationState>,
    private ts: TranslateService
  ) {
    super(store);
  }

  ngOnInit(): void {
    const ruleSet: IRuleSet = cloneDeep(this.modelRef?.ruleSet || {});
    if (!ruleSet.condition) {
      ruleSet.condition = RuleSetCustomCondition.And;
    }
    if (!ruleSet.rules) {
      ruleSet.rules = [];
    }

    this.view = {
      condition: {
        fields: [createConditionField(conditionKey, ruleSet.condition)],
        form: this.fb.group({}),
        model: {
          [conditionKey]: ruleSet.condition
        }
      },
      rules: ruleSet.rules.map((rule, index) => {
        return this.createRuleFormlyView(rule, index);
      })
    };
    this.checkConditionVisibility();
    this.view.condition.form.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.notify();
    });

    this.initFunctionStateSubs();
  }

  ngAfterViewInit(): void {
    if (!this.view.rules.length && this.addDefaultRuleIfEmpty) {
      this.addRule();
    }
    this.notify();
  }

  initFunctionStateSubs(): void {
    this.store
      .select(schemaFunctionsStateSelector)
      .pipe(
        filter((state: SchemaFunctionsState) => !!state),
        takeUntil(this.destroyed$)
      )
      .subscribe((functionsState: SchemaFunctionsState) => {
        this.selectedTargetFields = [];
        for (const key in functionsState) {
          if (functionsState.hasOwnProperty(key) && key === this.expressionId) {
            const funcState = functionsState[key];
            this.selectedTargetFields = funcState.selectedFieldIds;
            this.view?.rules?.forEach((rule: IFormlyView<IRuleForm>) => {
              const control = rule.form?.get(ruleKey)?.get(itemIdKey);
              if (control && control.value) {
                // re-run the validations for each rule's field selector
                control.updateValueAndValidity({ emitEvent: false });
                control.markAsTouched();
                control.markAsDirty();
              }
            });
          }
        }
      });
  }

  checkConditionVisibility(): void {
    this.view.condition.fields[0].hide = this.view?.rules?.length > 1 ? false : true;
  }

  /**
   * create an empty rule formly view and add to the existing ones (if any)
   */
  addRule(): void {
    // const rules = this.view.rules;
    const ruleDef: ISchemaFieldRule = {
      itemId: undefined,
      operator: RuleCustomOperatorEnum.Equal,
      value: undefined,
      propertyPath: { path: [] }
    };
    const ruleFormlyView = this.createRuleFormlyView(ruleDef, this.view.rules.length);
    this.view.rules.push(ruleFormlyView);
    this.checkConditionVisibility();
    this.notify();
  }

  private removeRule(ruleFormlyView: IFormlyView<IRuleForm>): void {
    remove(this.view.rules, (x) => x === ruleFormlyView);
    this.checkConditionVisibility();

    this.notify();
  }

  /**
   *
   * @param fieldKey: key of the selector
   * @param rule
   * @param nestedField: the nested field for which a new selectbox is to be created
   * create a field selectbox formly config to be included in rule formly view
   */
  createFieldSelector(fieldKey: string, rule: ISchemaFieldRule, ruleIndex: number): FormlyFieldConfig {
    const fieldOptions = this.listOptions.map((x) => {
      return {
        key: x.key,
        value: x.value.id,
        group: x.group,
        viewValue: x.key
      };
    });

    const selectFieldAdapter = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('Select Field'),
      name: fieldKey,
      type: FieldTypeIds.ListField,
      valueInfo: {
        options: fieldOptions
      },
      value: rule.fieldRef?.id || undefined,
      required: true
    });

    const selectFieldCfg = adapterToConfig(selectFieldAdapter, 'col-lg-12');
    selectFieldCfg.templateOptions.labelProp = 'viewValue';
    selectFieldCfg.templateOptions.groupProp = 'group';
    selectFieldCfg.validators = {
      alreadyUsedAsTarget: {
        expression: (control) => {
          return !this.selectedTargetFields?.includes(control?.value);
        },
        message: (error, field: FormlyFieldConfig) => this.ts.instant(`The field is selected as target!`)
      }
    };

    selectFieldCfg.hooks = {
      onInit: (field: FormlyFieldConfig) => {
        field.formControl.valueChanges
          .pipe(
            filter((itemId) => !!itemId),
            take(1)
          )
          .subscribe((itemId) => {
            const selectedField = this.listOptions.find((x) => x.value.id === itemId).value;
            const newRuleFormlyView = this.createRuleFormlyView({ [itemIdKey]: itemId, fieldRef: selectedField }, ruleIndex);

            newRuleFormlyView.model.rule.propertyPath = {
              path: this.getPath(selectedField)
            };
            // replace the old rule with the new one with new field
            this.view.rules[ruleIndex] = newRuleFormlyView;
            setTimeout(() => {
              this.notify();
            });
          });
      }
    };
    return selectFieldCfg;
  }

  /**
   *
   * @param r
   * create a formly fieldGroup from rule
   */

  private ruleToFormlyConfig(r: ISchemaFieldRule, ruleIndex: number): FormlyFieldConfig {
    let selectedField: IConfigurableListItem<any>;
    if (r.fieldRef?.id) {
      selectedField = this.listOptions.find((x) => x.value.id === r.fieldRef.id)?.value;
    }

    const removeBtnConfig: IFormlyRightButtonAddonConfig = {
      icon: 'trash',
      color: ColorEnum.red,
      isFormGroup: true,
      onClick: () => {
        const rule = this.view.rules.find((x) => x.fields[0] === ruleFieldConfig);
        if (rule) {
          this.removeRule(rule);
        }
      }
    };
    const fieldSelector = this.createFieldSelector(itemIdKey, r, ruleIndex);
    const operatorField = createOperatorField(operatorKey, r.operator, selectedField?.type);
    const valueField = createValueField(valueKey, r.value, selectedField);

    // when expressionProperty is added in afterViewInit,
    //  the expression is not getting evaluated on model init
    // valueField.hooks = {
    //   afterViewInit: (valueField: FormlyFieldConfig) => {
    valueField.hideExpression = (model) => {
      if (model[operatorKey] === RuleCustomOperatorEnum.IsEmpty || model[operatorKey] === RuleCustomOperatorEnum.IsNotEmpty) {
        // when rule is IsEmpty or isNotEmpty, reset the rule value
        model[valueKey] = null;
        return true;
      }
      return false;
    };
    //   }
    // };

    const ruleFieldConfig: FormlyFieldConfig = {
      key: ruleKey,
      fieldGroupClassName: 'row',
      fieldGroup: [fieldSelector, operatorField, valueField],
      templateOptions: {
        [Addons.formlyRightBtn]: removeBtnConfig
      }
    };

    return ruleFieldConfig;
  }

  /**
   * method  with recursion recreating
   * @param rule
   */
  private createRuleFormlyView(rule: ISchemaFieldRule, ruleIndex: number): IFormlyView<IRuleForm> {
    const ruleConfig = this.ruleToFormlyConfig(rule, ruleIndex);
    const ruleFormlyView = {
      fields: [ruleConfig],
      form: this.fb.group({}),
      model: { rule }
    };

    ruleFormlyView.form.valueChanges
      .pipe(
        filter((formValue) => !!formValue),
        takeUntil(this.destroyed$)
      )
      .subscribe(() => {
        ruleFormlyView.model.rule.valid = ruleFormlyView.form.valid;
        this.notify();
      });

    return ruleFormlyView;
  }

  private getPath(field: SchemaFieldDto | IConfigurableListItem): Array<string> {
    let finalPath = [];
    finalPath.unshift(`${field.fieldName || field.name}`);

    if (field.parentField) {
      const parentFieldName = this.getPath(field.parentField);
      finalPath.unshift(...parentFieldName);
    }
    return finalPath;
  }

  private notify(): void {
    const view = this.view;

    const rules = view.rules
      .map((x) => x.model.rule)
      .map((x) => {
        const rule: ISchemaFieldRule = {
          fieldRef: x.fieldRef,
          itemId: x.itemId,
          operator: x.operator,
          valid: !!x.valid,
          value: DateTime.isDateTime(x.value) ? x.value.toUTC().toISO() : x.value,
          propertyPath: x.propertyPath
        };
        return rule;
      });

    const output: IRuleSet = {
      condition: view.condition.model[conditionKey],
      rules: rules,
      valid: rules.map((x) => x.valid).every((x) => !!x)
      //  && !!view.condition.model[conditionKey]
    };
    this.update.next(output);
  }

  onModelChange(): void {
    this.conditionFormChanges.emit(true);
  }
}
