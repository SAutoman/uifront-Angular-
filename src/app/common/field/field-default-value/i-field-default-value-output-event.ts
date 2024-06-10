import {
  ComputedValueTriggerEventEnum,
  DefaultValueTypeEnum,
  DynamicValueTypeEnum,
  SystemEventTypes,
  SystemValueTypeEnum
} from './FieldDefaultValues';

export interface IFieldDefaultValueOutput {
  // static value
  value?: any;
  // static/dynamic/system
  defaultValueType: DefaultValueTypeEnum;
  dynamicValueType?: DynamicValueTypeEnum;
  systemValueType?: SystemValueTypeEnum;
  systemEventType?: SystemEventTypes;
  computeDefaultValueFormula?: string;
  computeTriggerEvent?: ComputedValueTriggerEventEnum;
  dirty?: boolean;
  valid: boolean;
}
