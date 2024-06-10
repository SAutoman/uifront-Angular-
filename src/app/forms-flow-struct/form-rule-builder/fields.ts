import { FormlyFieldConfig } from '@ngx-formly/core';
import { IConfigurableListItem } from '@wfm/common/models';
import { FormlyFieldAdapter, FormlyFieldAdapterFactory, FormVariableDto } from '@wfm/common/vendor';
import { FieldTypeIds, FieldTypeOperationMap } from '@wfm/service-layer';
import {
  RuleCustomOperatorEnum,
  RuleSetCustomCondition,
  RuleSetCustomConditionsMap,
  RuleCustomOperatorMap
} from '@wfm/service-layer/models/expressionModel';

export function adapterToConfig(adapter: FormlyFieldAdapter<any>, cssClass: string = ''): FormlyFieldConfig {
  const cfg = adapter.getConfig();
  cfg.className = cssClass;
  return cfg;
}

/**
 *
 * @param key
 * @param value
 * @param fieldType
 * @param cssClass
 * create a formly field config:
 * a selectbox with the available operators for the subject field type
 */

export function createOperatorField(
  key: string,
  value: RuleCustomOperatorEnum,
  fieldType?: FieldTypeIds,
  cssClass: string = 'col-lg-4',
  hideEmptyOperator?: boolean
): FormlyFieldConfig {
  let operatorOptions = [];
  if (fieldType) {
    operatorOptions = FieldTypeOperationMap.get(fieldType).map((operation) => {
      return RuleCustomOperatorMap.get(operation);
    });
    if (hideEmptyOperator) {
      operatorOptions = operatorOptions.filter((operatorOption) => operatorOption.value !== RuleCustomOperatorEnum.IsEmpty);
    }
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

/**
 *
 * @param key
 * @param value
 * @param fieldType
 * @param cssClass
 * create a formly field to enter the rule value of the selected field:
 * based on the field tyoe the subject formly field will be different: number, text, datetime picker, etc
 */
export function createValueField(
  key: string,
  value: any,
  field: IConfigurableListItem,
  cssClass: string = 'col-11 mx-auto'
): FormlyFieldConfig {
  const dto: FormVariableDto = {
    label: 'Enter Value',
    name: key,
    type: field?.type || FieldTypeIds.StringField,
    value: value || undefined,
    required: true,
    disabled: !field?.type,
    valueInfo: field?.configuration
  };

  return adapterToConfig(FormlyFieldAdapterFactory.createAdapter(dto), cssClass);
}

/**
 *
 * @param key
 * @param condition
 * @param cssClass
 * create a selector for condition: And/Or
 */

export function createConditionField(key: string, condition: RuleSetCustomCondition, cssClass: string = 'w-100'): FormlyFieldConfig {
  const conditionAdapter = FormlyFieldAdapterFactory.createAdapter({
    label: 'Condition',
    name: key,
    type: FieldTypeIds.ListField,
    valueInfo: {
      options: RuleSetCustomConditionsMap.getAll()
    },
    value: condition || undefined,
    required: true
  });
  const config = adapterToConfig(conditionAdapter, cssClass);
  config.templateOptions.labelProp = 'viewValue';

  return config;
}
