import { cloneDeep } from 'lodash-core';

import { EnumConverter } from './enum-converter';
import { IKeyValueView, KeyValueView } from './i-key-value-view';

export enum OperatorEnum {
  equal = '=',
  notEqual = '!=',
  moreThan = '>',
  moreThanOrEqual = '>=',
  lessThan = '<',
  lessThanOrEqual = '<=',
  // TODO Not implemented yet
  contains = 'contains',
  like = 'like',
  in = 'in',
  notIn = 'not in'
}

export const OperatorMap: {
  get: (type: OperatorEnum | string) => IKeyValueView<string, OperatorEnum>;
  has: (type: OperatorEnum | string) => boolean;
  getAll: () => IKeyValueView<string, OperatorEnum>[];
} = (() => {
  const map = new Map<OperatorEnum, IKeyValueView<string, OperatorEnum>>();
  const converter = new EnumConverter(OperatorEnum);

  const setItem = (type: OperatorEnum, viewValue: string) => {
    const kv = converter.getKeyValue(type);
    map.set(kv.value, new KeyValueView(kv.key, kv.value, viewValue));
  };
  setItem(OperatorEnum.equal, 'Is equal to');
  setItem(OperatorEnum.notEqual, 'Is not equal to');

  setItem(OperatorEnum.moreThan, 'Is more than');
  setItem(OperatorEnum.moreThanOrEqual, 'Is more than or equal');
  setItem(OperatorEnum.lessThan, 'Is less than');
  setItem(OperatorEnum.lessThanOrEqual, 'Is less than  or equal');

  setItem(OperatorEnum.contains, 'Contains');
  setItem(OperatorEnum.like, 'Like');
  setItem(OperatorEnum.in, 'In');
  setItem(OperatorEnum.notIn, 'Not in');

  const has = (type: OperatorEnum | string) => {
    const kv = converter.getKeyValue(type);
    if (!kv) {
      return false;
    }
    return map.has(kv.value);
  };
  const getKv = (type: OperatorEnum | string) => {
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
