import { cloneDeep } from 'lodash-core';

import { EnumConverter } from './enum-converter';
import { IKeyValueView, KeyValueView } from './i-key-value-view';

export enum ConditionEnum {
  and = 'and',
  or = 'or'
}

export const ConditionsMap: {
  get: (type: ConditionEnum | string) => IKeyValueView<string, ConditionEnum>;
  has: (type: ConditionEnum | string) => boolean;
  getAll: () => IKeyValueView<string, ConditionEnum>[];
} = (() => {
  const map = new Map<ConditionEnum, IKeyValueView<string, ConditionEnum>>();
  const converter = new EnumConverter(ConditionEnum);
  const setItem = (type: ConditionEnum, viewValue: string) => {
    const kv = converter.getKeyValue(type);
    map.set(kv.value, new KeyValueView(kv.key, kv.value, viewValue));
  };

  setItem(ConditionEnum.and, 'And');
  setItem(ConditionEnum.or, 'Or');

  const has = (type: ConditionEnum | string) => {
    const kv = converter.getKeyValue(type);
    if (!kv) {
      return false;
    }
    return map.has(kv.value);
  };
  const getKv = (type: ConditionEnum | string) => {
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
