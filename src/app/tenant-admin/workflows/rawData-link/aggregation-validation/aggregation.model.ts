import { EnumConverter, IKeyValueView, KeyValueView } from '@wfm/common/models';
import { FieldTypeIds } from '@wfm/service-layer';
import { WorkflowActionEventDto } from '@wfm/service-layer/models/actionDto';
import { RuleSetCustomCondition, PropertyPath, RuleCustomOperatorEnum, RuleSetCustom } from '@wfm/service-layer/models/expressionModel';
import { cloneDeep } from 'lodash-core';

export interface ValidationRuleSet {
  condition: RuleSetCustomCondition;
  validations: AggregationExpression[];
}

export enum FieldAggregationTypesEnum {
  InnerJoin = 1,
  Min,
  Max,
  Count,
  Sum,
  Avg,
  Concat
}

export const FieldAggregationMap: {
  get: (type: FieldAggregationTypesEnum | string) => IKeyValueView<string, FieldAggregationTypesEnum>;
  has: (type: FieldAggregationTypesEnum | string) => boolean;
  getAll: () => IKeyValueView<string, FieldAggregationTypesEnum>[];
} = (() => {
  const map = new Map<FieldAggregationTypesEnum, IKeyValueView<string, FieldAggregationTypesEnum>>();
  const converter = new EnumConverter(FieldAggregationTypesEnum);

  const setItem = (type: FieldAggregationTypesEnum, viewValue: string) => {
    const kv = converter.getKeyValue(type);
    map.set(kv.value, new KeyValueView(kv.key, kv.value, viewValue));
  };
  setItem(FieldAggregationTypesEnum.Avg, 'Get Average');
  setItem(FieldAggregationTypesEnum.Sum, 'Sum Up');
  setItem(FieldAggregationTypesEnum.Max, 'Take Maximum');
  setItem(FieldAggregationTypesEnum.Min, 'Take Minimum');
  setItem(FieldAggregationTypesEnum.Count, 'Take Count ');
  setItem(FieldAggregationTypesEnum.InnerJoin, 'Look For Common Value');

  setItem(FieldAggregationTypesEnum.Concat, 'Concatenate Strings');

  const has = (type: FieldAggregationTypesEnum | string) => {
    const kv = converter.getKeyValue(type);
    if (!kv) {
      return false;
    }
    return map.has(kv.value);
  };
  const getKv = (type: FieldAggregationTypesEnum | string) => {
    if (!has(type)) {
      return null;
    }
    const kv = converter.getKeyValue(type);
    return { ...map.get(kv.value) };
  };

  return {
    get: (x) => getKv(x),
    has,
    getAll: () => cloneDeep(Array.from(map.values()))
  };
})();

export const FieldTypeAggregationMap: {
  has: (type: FieldTypeIds) => boolean;
  get: (type: FieldTypeIds) => FieldAggregationTypesEnum[];
} = (() => {
  const map = new Map<FieldTypeIds, FieldAggregationTypesEnum[]>();
  const hasValidators = (type: FieldTypeIds) => {
    return map.has(type) && !!map.get(type).length;
  };
  const getValidators = (type: FieldTypeIds) => {
    if (!hasValidators(type)) {
      return [];
    }
    return [...map.get(type)];
  };
  map.set(FieldTypeIds.BoolField, [FieldAggregationTypesEnum.InnerJoin]);
  map.set(FieldTypeIds.IntField, [
    FieldAggregationTypesEnum.InnerJoin,
    FieldAggregationTypesEnum.Avg,
    FieldAggregationTypesEnum.Min,
    FieldAggregationTypesEnum.Max,
    FieldAggregationTypesEnum.Sum,
    FieldAggregationTypesEnum.Count
  ]);
  map.set(FieldTypeIds.DecimalField, [
    FieldAggregationTypesEnum.InnerJoin,
    FieldAggregationTypesEnum.Avg,
    FieldAggregationTypesEnum.Min,
    FieldAggregationTypesEnum.Max,
    FieldAggregationTypesEnum.Sum,
    FieldAggregationTypesEnum.Count
  ]);

  // string
  map.set(FieldTypeIds.StringField, [
    FieldAggregationTypesEnum.InnerJoin,
    FieldAggregationTypesEnum.Concat,
    FieldAggregationTypesEnum.Count
  ]);
  map.set(FieldTypeIds.TextareaField, [
    FieldAggregationTypesEnum.InnerJoin,
    FieldAggregationTypesEnum.Concat,
    FieldAggregationTypesEnum.Count
  ]);

  // date
  map.set(FieldTypeIds.DateField, [
    FieldAggregationTypesEnum.InnerJoin,
    FieldAggregationTypesEnum.Min,
    FieldAggregationTypesEnum.Max,
    FieldAggregationTypesEnum.Count
  ]);
  map.set(FieldTypeIds.TimeField, [
    FieldAggregationTypesEnum.InnerJoin,
    FieldAggregationTypesEnum.Min,
    FieldAggregationTypesEnum.Max,
    FieldAggregationTypesEnum.Count
  ]);
  map.set(FieldTypeIds.DateTimeField, [
    FieldAggregationTypesEnum.InnerJoin,
    FieldAggregationTypesEnum.Min,
    FieldAggregationTypesEnum.Max,
    FieldAggregationTypesEnum.Count
  ]);

  map.set(FieldTypeIds.FileField, [FieldAggregationTypesEnum.InnerJoin, FieldAggregationTypesEnum.Count]);

  map.set(FieldTypeIds.ListField, [FieldAggregationTypesEnum.InnerJoin, FieldAggregationTypesEnum.Count]);
  map.set(FieldTypeIds.MultiselectListField, [FieldAggregationTypesEnum.InnerJoin, FieldAggregationTypesEnum.Count]);
  // map.set(FieldTypeIds.ListOfLinksField, [FieldAggregationTypesEnum.InnerJoin]);
  map.set(FieldTypeIds.ConnectorField, [FieldAggregationTypesEnum.InnerJoin]);

  return {
    get: getValidators,
    has: hasValidators
  };
})();

export enum RangeTypeEnum {
  Date = 1,
  DateTime,
  Time,
  Integer,
  Decimal
}

export enum JoinUnit {
  Year = 1,
  Month,
  Day,
  Hour,
  Minute
}

export const RangeTypeAndJoinUnitMap: {
  has: (type: RangeTypeEnum) => boolean;
  get: (type: RangeTypeEnum) => JoinUnit[];
} = (() => {
  const map = new Map<RangeTypeEnum, JoinUnit[]>();
  const hasValidators = (type: RangeTypeEnum) => {
    return map.has(type) && !!map.get(type).length;
  };
  const getValidators = (type: RangeTypeEnum) => {
    if (!hasValidators(type)) {
      return [];
    }
    return [...map.get(type)];
  };
  map.set(RangeTypeEnum.Date, [JoinUnit.Day, JoinUnit.Month, JoinUnit.Year]);
  map.set(RangeTypeEnum.DateTime, [JoinUnit.Minute, JoinUnit.Hour, JoinUnit.Day, JoinUnit.Month, JoinUnit.Year]);
  map.set(RangeTypeEnum.Time, [JoinUnit.Minute, JoinUnit.Hour]);

  return {
    get: getValidators,
    has: hasValidators
  };
})();

export interface FieldPreProcessConfig {
  aggregationType: FieldAggregationTypesEnum;
  concatSymbol?: string;
}

export enum RangeFieldAggregationTypesEnum {
  InnerJoin = 1,
  FullJoin
}

export const RangeFieldAggregationMap: {
  get: (type: RangeFieldAggregationTypesEnum | string) => IKeyValueView<string, RangeFieldAggregationTypesEnum>;
  has: (type: RangeFieldAggregationTypesEnum | string) => boolean;
  getAll: () => IKeyValueView<string, RangeFieldAggregationTypesEnum>[];
} = (() => {
  const map = new Map<RangeFieldAggregationTypesEnum, IKeyValueView<string, RangeFieldAggregationTypesEnum>>();
  const converter = new EnumConverter(RangeFieldAggregationTypesEnum);

  const setItem = (type: RangeFieldAggregationTypesEnum, viewValue: string) => {
    const kv = converter.getKeyValue(type);
    map.set(kv.value, new KeyValueView(kv.key, kv.value, viewValue));
  };
  setItem(RangeFieldAggregationTypesEnum.InnerJoin, 'Get Common Range');
  setItem(RangeFieldAggregationTypesEnum.FullJoin, 'Join Ranges');

  const has = (type: RangeFieldAggregationTypesEnum | string) => {
    const kv = converter.getKeyValue(type);
    if (!kv) {
      return false;
    }
    return map.has(kv.value);
  };
  const getKv = (type: RangeFieldAggregationTypesEnum | string) => {
    if (!has(type)) {
      return null;
    }
    const kv = converter.getKeyValue(type);
    return { ...map.get(kv.value) };
  };

  return {
    get: (x) => getKv(x),
    has,
    getAll: () => cloneDeep(Array.from(map.values()))
  };
})();

export interface RangeFieldPreProcessConfig {
  aggregationType: RangeFieldAggregationTypesEnum;
  joinUnit?: JoinUnit;
}

export interface AggregationExpression {
  name: string;
  field?: {
    fieldsPath: PropertyPath[];
    preProcess: FieldPreProcessConfig;
  };
  rangeField?: {
    fromToFieldsPath: RangePropertyPath[];
    rangeType: RangeTypeEnum;
    preProcess: RangeFieldPreProcessConfig;
  };
  operator: RuleCustomOperatorEnum;
  value?: any;
}

export interface AggregationActionDto extends WorkflowActionEventDto {
  filterItemsExpression: FilterExpression[];
  rangeGroup?: {
    rangeFieldSource: {
      fromToFieldsPath: RangePropertyPath[];

      rangeType: RangeTypeEnum;
      preProcess: RangeFieldPreProcessConfig;
    };
    rangeFieldDestination: {
      fromFieldPath: PropertyPath;
      toFieldPath: PropertyPath;
      rangeType: RangeTypeEnum.Date;
    };
  };
  singleGroup?: {
    fieldSource: {
      fieldsPath: PropertyPath[];
      preProcess: FieldPreProcessConfig;
    };
    fieldDestination: PropertyPath;
  };
}

export interface RangePropertyPath {
  fromFieldPath: PropertyPath;
  toFieldPath: PropertyPath;
}

export enum AggregationEventType {
  Unknown = 0,
  RawDataToCase = 1,
  RawDataToStep = 2,
  StepToCase = 3
}

export const AggregationEventNameMap: {
  get: (type: AggregationEventType) => IKeyValueView<string, AggregationEventType>;
  has: (type: AggregationEventType) => boolean;
} = (() => {
  const map = new Map<AggregationEventType, IKeyValueView<string, AggregationEventType>>();
  const converter = new EnumConverter(AggregationEventType);

  const setItem = (type: AggregationEventType, viewValue: string) => {
    const kv = converter.getKeyValue(type);
    map.set(kv.value, new KeyValueView(kv.key, kv.value, viewValue));
  };
  setItem(AggregationEventType.Unknown, 'Unknown');
  setItem(AggregationEventType.RawDataToCase, 'Aggregate RawData Items  And Set In Case');
  setItem(AggregationEventType.RawDataToStep, 'Aggregate Steps And Set In Case');
  setItem(AggregationEventType.StepToCase, 'Aggregate RawData Items And Set In Step');

  const has = (type: AggregationEventType) => {
    const kv = converter.getKeyValue(type);
    if (!kv) {
      return false;
    }
    return map.has(kv.value);
  };
  const getKv = (type: AggregationEventType) => {
    if (!has(type)) {
      return { ...map.get(AggregationEventType.Unknown) };
    }
    const kv = converter.getKeyValue(type);
    return { ...map.get(kv.value) };
  };

  return {
    get: getKv,
    has
  };
})();

// in one FilterExpression user can set either ruleSet or comparison
export interface FilterExpression {
  /**
   * filter out the items not meeting the conditions
   */
  ruleSet?: RuleSetCustom;
  comparison?: ComparisonDto[];
}

export interface ComparisonDto {
  /**
   * filter out the items not meeting min/max comparison
   */
  type: CompareOperatorEnum;
  propertyPath: PropertyPath;
}

export enum CompareOperatorEnum {
  MIN = 0,
  MAX
}
