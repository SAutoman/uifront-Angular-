// Used in Backend
/**
 * global
 */
import { cloneDeep } from 'lodash-core';

/**
 * project
 */
import { EnumConverter, IKeyValueView, KeyValueView } from '@wfm/common/models';
import { IFieldSettingsConfig } from '@wfm/forms-flow-struct/interface/expression/expressionModelUI';

/**
 * local
 */
import { Roles } from './user-profile';

export enum RuleCustomOperatorEnum {
  Equal = 0,
  NotEqual = 1,
  MoreThan = 2,
  MoreThanOrEqual = 3,
  LessThan = 4,
  LessThanOrEqual = 5,
  Regex = 6,
  // Not implemented
  Contains = 7,
  Like = 8,
  In = 9,
  NotIn = 10,
  IsEmpty = 11,
  IsNotEmpty = 12
}

export enum PropertyPathTypeEnum {
  Unknown = 0,
  Internal = 1,
  ProcessStepPath = 2,
  CasePath = 3,
  RawDataPath = 4,
  CommentPath = 5
}

export interface PropertyPath {
  path: string[];
  pathType?: PropertyPathTypeEnum;
}

export interface ProcessStepPath extends PropertyPath {
  processStepRefName: string;
}

export interface RawDataPath extends PropertyPath {
  rawDataFieldName: string;
}

export interface CommentPath extends PropertyPath {
  commentFieldName: string;
}

export interface ActionSettings {
  config?: IFieldSettingsConfig;
  fieldPath: PropertyPath;
}

export interface Rule {
  operator: RuleCustomOperatorEnum;
  value: any;
}

export interface CustomRule extends Rule {
  propertyPath: PropertyPath;
}

export enum RuleSetCustomCondition {
  And = 0,
  Or = 1
}

export interface RuleSetCustom {
  condition: RuleSetCustomCondition;
  rules?: CustomRule[];
  systemRules?: CustomRule[];
}

export interface ExpressionDef {
  ruleSet?: RuleSetCustom;
  userRoles?: Roles[];
  /**
   * role that is not specified in this array
   */
  notInUserRoles?: Roles[];
  userGroups?: string[];
}

export interface OverrideExpression extends ExpressionDef {
  stepResolutions?: RuleSetCustom;
  statuses?: string[];
}

export interface Expression extends ExpressionDef {
  forBackend?: boolean;
  name?: string;
  actionSettings?: ActionSettings[];
}

export const RuleSetCustomConditionsMap: {
  get: (type: RuleSetCustomCondition | string) => IKeyValueView<string, RuleSetCustomCondition>;
  has: (type: RuleSetCustomCondition | string) => boolean;
  getAll: () => IKeyValueView<string, RuleSetCustomCondition>[];
} = (() => {
  const map = new Map<RuleSetCustomCondition, IKeyValueView<string, RuleSetCustomCondition>>();
  const converter = new EnumConverter(RuleSetCustomCondition);
  const setItem = (type: RuleSetCustomCondition, viewValue: string) => {
    const kv = converter.getKeyValue(type);
    map.set(kv.value, new KeyValueView(kv.key, kv.value, viewValue));
  };

  setItem(RuleSetCustomCondition.And, 'And');
  setItem(RuleSetCustomCondition.Or, 'Or');

  const has = (type: RuleSetCustomCondition | string) => {
    const kv = converter.getKeyValue(type);
    if (!kv) {
      return false;
    }
    return map.has(kv.value);
  };
  const getKv = (type: RuleSetCustomCondition | string) => {
    if (!has(type)) {
      return null;
    }
    const kv = converter.getKeyValue(type);
    return { ...map.get(kv.value) };
  };

  return {
    get: getKv,
    has,
    getAll: () => cloneDeep(Array.from(map.values()))
  };
})();

export const RuleCustomOperatorMap: {
  get: (type: RuleCustomOperatorEnum | string) => IKeyValueView<string, RuleCustomOperatorEnum>;
  has: (type: RuleCustomOperatorEnum | string) => boolean;
  getAll: () => IKeyValueView<string, RuleCustomOperatorEnum>[];
} = (() => {
  const map = new Map<RuleCustomOperatorEnum, IKeyValueView<string, RuleCustomOperatorEnum>>();
  const converter = new EnumConverter(RuleCustomOperatorEnum);

  const setItem = (type: RuleCustomOperatorEnum, viewValue: string) => {
    const kv = converter.getKeyValue(type);
    map.set(kv.value, new KeyValueView(kv.key, kv.value, viewValue));
  };
  setItem(RuleCustomOperatorEnum.Equal, 'Is equal to');
  setItem(RuleCustomOperatorEnum.NotEqual, 'Is not equal to');

  setItem(RuleCustomOperatorEnum.MoreThan, 'Is more than');
  setItem(RuleCustomOperatorEnum.MoreThanOrEqual, 'Is more than or equal');
  setItem(RuleCustomOperatorEnum.LessThan, 'Is less than');
  setItem(RuleCustomOperatorEnum.LessThanOrEqual, 'Is less than  or equal');

  setItem(RuleCustomOperatorEnum.Contains, 'Contains');
  setItem(RuleCustomOperatorEnum.Like, 'Like');
  setItem(RuleCustomOperatorEnum.In, 'Included in the list');
  setItem(RuleCustomOperatorEnum.NotIn, 'Not included in the list');
  setItem(RuleCustomOperatorEnum.IsEmpty, 'Is empty');
  setItem(RuleCustomOperatorEnum.IsNotEmpty, 'Has any value');

  const has = (type: RuleCustomOperatorEnum | string) => {
    const kv = converter.getKeyValue(type);
    if (!kv) {
      return false;
    }
    return map.has(kv.value);
  };
  const getKv = (type: RuleCustomOperatorEnum | string) => {
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
