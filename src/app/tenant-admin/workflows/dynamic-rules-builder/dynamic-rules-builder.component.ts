import { KeyValue } from '@angular/common';
import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';
import { ExpressionHelperService } from '@wfm/common/form-builder-components/expression-helper.service';
import { IConfigurableListItem, IFormlyView, IObjectMap, KeyValueView } from '@wfm/common/models';
import { IFormlyRightButtonAddonConfig, Addons, FormlyFieldAdapterFactory, FormVariableDto } from '@wfm/common/vendor';
import { KeyValueGroup } from '@wfm/forms-flow-struct/form-function-item/form-function-item.component';
import {
  DynamicRuleSet,
  DynamicValueEnum,
  FieldTypeComplexFields,
  FieldTypeIds,
  FieldTypeOperationMap,
  SchemaFieldDto
} from '@wfm/service-layer';
import { adapterToConfig, createConditionField } from '@wfm/forms-flow-struct/form-rule-builder/fields';
import { ColorEnum } from '@wfm/service-layer/models/color.enum';
import { RuleCustomOperatorEnum, RuleCustomOperatorMap, RuleSetCustomCondition } from '@wfm/service-layer/models/expressionModel';
import { pathSeparator } from '@wfm/shared/actions/field-path-generator/field-path-generator.component';
import { BaseComponent } from '@wfm/shared/base.component';
import { cloneDeep, remove } from 'lodash-core';
import { distinctUntilChanged, filter, take, takeUntil } from 'rxjs/operators';

const ruleKey = 'rule';
const conditionKey = 'condition';
const fieldKey = 'currentFieldPathString';
const operatorKey = 'operator';
const valueKey = 'value';

export interface DynamicRuleOutput {
  data: DynamicRuleSet;
  isValid: boolean;
}

export interface IDynamicRule {
  currentFieldPathString: string;
  operator: RuleCustomOperatorEnum;
  valueFieldPathString?: string;
  value?: string | DynamicValueEnum;
  isValid: boolean;
}

interface IView {
  condition?: IFormlyView<IObjectMap<RuleSetCustomCondition>>;
  rules?: IFormlyView<DynamicRuleForm>[];
}
interface DynamicRuleForm {
  rule: IDynamicRule;
}

@Component({
  selector: 'app-dynamic-rules-builder',
  templateUrl: './dynamic-rules-builder.component.html',
  styleUrls: ['./dynamic-rules-builder.component.scss']
})
export class DynamicRulesBuilderComponent extends BaseComponent implements OnInit {
  @Input() validatorRuleSet: DynamicRuleSet;
  @Input() currentSchemaFields: IConfigurableListItem[];
  @Input() currentSchemaName: string;
  @Input() valueSchemaName: string;
  @Input() valueSchemaFields: IConfigurableListItem[];
  @Input() addDefaultRule: boolean;

  @Output() emitter: EventEmitter<DynamicRuleOutput> = new EventEmitter();

  currentFieldOptions: KeyValue<string, IConfigurableListItem>[] = [];
  valueFieldOptions: KeyValue<string, IConfigurableListItem>[] = [];
  dynamicValueOptions: KeyValueView<FieldTypeIds, DynamicValueEnum>[];
  view: IView;

  constructor(private fb: FormBuilder, private expressionHelper: ExpressionHelperService, private ts: TranslateService) {
    super();
  }

  ngOnInit(): void {
    this.dynamicValueOptions = [
      {
        key: FieldTypeIds.DateField,
        value: DynamicValueEnum.currentDate,
        viewValue: this.ts.instant('Current Date')
      },
      {
        key: FieldTypeIds.TimeField,
        value: DynamicValueEnum.currentTime,
        viewValue: this.ts.instant('Current Time')
      },
      {
        key: FieldTypeIds.DateTimeField,
        value: DynamicValueEnum.currentDateTime,
        viewValue: this.ts.instant('Current Date And Time')
      }
    ];
    this.populateFieldOptions();
    this.initView(this.validatorRuleSet);
  }

  populateFieldOptions(): void {
    this.currentSchemaFields.forEach((field) => {
      let retrieved = this.expressionHelper.retrieveNestedFieldsHelper(field);
      this.currentFieldOptions.push(...retrieved);
    });

    this.valueSchemaFields.forEach((field) => {
      let retrieved = this.expressionHelper.retrieveNestedFieldsHelper(field);
      this.valueFieldOptions.push(...retrieved);
    });

    this.currentFieldOptions.forEach((f) => {
      f.value.fieldPath = this.getPath(f.value);
    });

    this.valueFieldOptions.forEach((f) => {
      f.value.fieldPath = this.getPath(f.value);
    });
  }

  initView(existingRule?: DynamicRuleSet): void {
    const ruleSet: DynamicRuleSet = cloneDeep(existingRule || {});
    if (!ruleSet.condition) {
      ruleSet.condition = RuleSetCustomCondition.And;
    }
    if (!ruleSet.rules) {
      ruleSet.rules = [];
    }

    this.view = {};

    this.view.condition = {
      fields: [createConditionField(conditionKey, ruleSet.condition)],
      form: this.fb.group({}),
      model: {
        [conditionKey]: ruleSet.condition
      }
    };

    this.view.rules = ruleSet.rules.map((rule, index) => {
      let ruleValue;
      if (rule?.valueFieldPath) {
        ruleValue = rule.valueFieldPath.join(pathSeparator);
      } else if (rule?.dynamicValue) {
        ruleValue = rule.dynamicValue;
      }
      const iRule: IDynamicRule = {
        currentFieldPathString: rule?.currentFieldPath?.join(pathSeparator),
        value: ruleValue,
        operator: rule?.operator,
        valueFieldPathString: rule.valueFieldPath ? rule.valueFieldPath.join(pathSeparator) : null,
        isValid: true
      };

      return this.createRuleFormlyView(iRule, index);
    });

    if (ruleSet.rules.length === 0 && this.addDefaultRule) {
      this.addRule();
    }

    this.view.condition.form.valueChanges
      .pipe(
        filter((formValue) => !!formValue),
        distinctUntilChanged(),
        takeUntil(this.destroyed$)
      )
      .subscribe(() => {
        this.notify();
      });

    this.checkConditionVisibility();
  }

  checkConditionVisibility(): void {
    this.view.condition.fields[0].hide = this.view?.rules?.length > 1 ? false : true;
  }

  private createRuleFormlyView(rule: IDynamicRule, ruleIndex: number): IFormlyView<DynamicRuleForm> {
    const ruleConfig = this.ruleToFormlyConfig(rule, ruleIndex);
    const ruleFormlyView = {
      fields: [ruleConfig],
      form: this.fb.group({}),
      model: { rule }
    };

    ruleFormlyView.form.valueChanges
      .pipe(
        filter((formValue) => !!formValue),
        distinctUntilChanged(),
        takeUntil(this.destroyed$)
      )
      .subscribe(() => {
        ruleFormlyView.model.rule.isValid = ruleFormlyView.form.valid;
        this.notify();
      });

    return ruleFormlyView;
  }

  private ruleToFormlyConfig(iRule: IDynamicRule, ruleIndex: number): FormlyFieldConfig {
    let selectedField: IConfigurableListItem;
    if (iRule.currentFieldPathString) {
      selectedField = this.currentFieldOptions.find((x) => x.value.fieldPath.join(pathSeparator) === iRule.currentFieldPathString)?.value;
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
    const fieldSelector = this.createFieldSelector(iRule, ruleIndex);
    const operatorField = this.createOperatorField(operatorKey, iRule.operator, selectedField?.type);
    operatorField.className = 'col-lg-12';

    const value = iRule.value;
    const valueField = this.createValueField(value, selectedField);
    valueField.className = 'col-lg-12';

    valueField.hideExpression = (model) => {
      if (
        !model[fieldKey] ||
        model[operatorKey] === RuleCustomOperatorEnum.IsEmpty ||
        model[operatorKey] === RuleCustomOperatorEnum.IsNotEmpty
      ) {
        // when rule is IsEmpty or isNotEmpty, reset the rule value
        model[valueKey] = null;
        return true;
      }
      return false;
    };

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

  createOperatorField(
    key: string,
    value: RuleCustomOperatorEnum,
    fieldType?: FieldTypeIds,
    cssClass: string = 'col-lg-4'
  ): FormlyFieldConfig {
    let operatorOptions = [];
    if (fieldType) {
      operatorOptions = FieldTypeOperationMap.get(fieldType)
        // .filter((op: RuleCustomOperatorEnum) => {
        //   return op !== RuleCustomOperatorEnum.IsEmpty && op !== RuleCustomOperatorEnum.IsNotEmpty;
        // })
        .map((operation) => {
          return RuleCustomOperatorMap.get(operation);
        });
    }

    const dto: FormVariableDto = {
      label: 'Operator',
      name: key,
      type: FieldTypeIds.ListField,
      valueInfo: {
        options: operatorOptions
      },
      value: value || undefined,
      required: true,
      disabled: !fieldType
    };
    const cfg = FormlyFieldAdapterFactory.createAdapter(dto).getConfig();
    cfg.className = cssClass;
    cfg.templateOptions.labelProp = 'viewValue';

    return cfg;
  }

  createFieldSelector(rule: IDynamicRule, ruleIndex: number): FormlyFieldConfig {
    const fieldOptions = this.currentFieldOptions
      .filter((f) => !FieldTypeComplexFields.includes(f.value.type))
      .map((x) => {
        return {
          key: x.key,
          value: x.value.fieldPath.join(pathSeparator),
          viewValue: x.key
        };
      });

    const selectFieldAdapter = FormlyFieldAdapterFactory.createAdapter({
      label: `${this.ts.instant('Select Field From')} ${this.currentSchemaName ? this.currentSchemaName : 'The Current Schema'}`,
      name: fieldKey,
      type: FieldTypeIds.ListField,
      valueInfo: {
        options: fieldOptions
      },
      value: rule.currentFieldPathString || undefined,
      required: true
    });

    const selectFieldCfg = adapterToConfig(selectFieldAdapter, 'col-lg-12');
    selectFieldCfg.templateOptions.labelProp = 'viewValue';

    selectFieldCfg.hooks = {
      onInit: (field: FormlyFieldConfig) => {
        field.formControl.valueChanges
          .pipe(
            filter((fieldPathString) => !!fieldPathString),
            take(1)
          )
          .subscribe((fieldPathString) => {
            const newRuleFormlyView = this.createRuleFormlyView(
              { currentFieldPathString: fieldPathString, value: null, isValid: false, operator: null },
              ruleIndex
            );

            // replace the old rule with the new one with new field
            this.view.rules[ruleIndex] = newRuleFormlyView;
          });
      }
    };
    return selectFieldCfg;
  }

  createValueField(value: string | DynamicValueEnum, currentField?: IConfigurableListItem): FormlyFieldConfig {
    const valueFieldOptions: KeyValueGroup<string, string | DynamicValueEnum>[] = this.valueFieldOptions
      .filter((f) => f.value.type === currentField?.type)
      .map((x) => {
        return {
          key: x.key,
          value: x.value.fieldPath.join(pathSeparator),
          viewValue: x.key,
          group: `Schema Fields From '${this.valueSchemaName}'`
        };
      });

    const dynamicValueOptions: KeyValueGroup<string, string | DynamicValueEnum>[] = this.dynamicValueOptions
      .filter((f) => f.key === currentField?.type)
      .map((x) => {
        return {
          key: x.viewValue,
          value: x.value,
          viewValue: x.viewValue,
          group: 'Dynamic Value'
        };
      });

    const allOptions = [...valueFieldOptions, ...dynamicValueOptions];

    const valueFieldAdapter = FormlyFieldAdapterFactory.createAdapter({
      label: `${this.ts.instant('Select Dynamic Value')}`,
      name: valueKey,
      type: FieldTypeIds.ListField,
      valueInfo: {
        options: allOptions
      },
      value: value || undefined,
      required: true
    });

    const valueFieldCfg = adapterToConfig(valueFieldAdapter, 'col-lg-12');
    valueFieldCfg.templateOptions.labelProp = 'viewValue';
    return valueFieldCfg;
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

  addRule(): void {
    const ruleDef: IDynamicRule = {
      currentFieldPathString: undefined,
      operator: RuleCustomOperatorEnum.Equal,
      value: undefined,
      isValid: false
    };
    const ruleFormlyView = this.createRuleFormlyView(ruleDef, this.view.rules.length);
    this.view.rules.push(ruleFormlyView);
    this.checkConditionVisibility();
  }

  private removeRule(ruleFormlyView: IFormlyView<DynamicRuleForm>): void {
    remove(this.view.rules, (x) => x === ruleFormlyView);
    this.checkConditionVisibility();
    this.notify();
  }

  notify(): void {
    let dataIsValid = true;
    const output: DynamicRuleOutput = {
      isValid: false,
      data: {
        condition: this.view.condition.model.condition,
        rules: this.view.rules.map((r) => {
          const rule = r.model.rule;
          if (!rule.isValid) {
            dataIsValid = false;
          }
          const data = {
            currentFieldPath: rule?.currentFieldPathString?.split(pathSeparator),
            operator: rule?.operator
          };
          if (typeof rule.value === 'string') {
            data['valueFieldPath'] = rule?.value?.split(pathSeparator);
          } else if (typeof rule.value === 'number') {
            data['dynamicValue'] = rule?.value;
          }
          return data;
        })
      }
    };
    output.isValid = dataIsValid;
    this.emitter.emit(output);
  }
}
