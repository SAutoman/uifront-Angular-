import { IKeyValueView, EnumConverter, KeyValueView } from '@wfm/common/models';
import { AggregationEnumBackend, AggregationEnumBackendExtended } from './model';

export enum AggregateTypesEnum {
  SUM = 'sum',
  COUNT = 'count',
  MIN = 'min',
  MAX = 'max',
  AVERAGE = 'average'
}

export const AggregateTypeNameMap: {
  get: (type: AggregationEnumBackendExtended | AggregationEnumBackend) => IKeyValueView<string, AggregationEnumBackendExtended>;
  has: (type: AggregationEnumBackendExtended) => boolean;
} = (() => {
  const map = new Map<AggregationEnumBackendExtended, IKeyValueView<string, AggregationEnumBackendExtended>>();
  const converter = new EnumConverter(AggregationEnumBackendExtended);

  const setItem = (type: AggregationEnumBackendExtended, viewValue: string) => {
    const kv = converter.getKeyValue(type);
    map.set(kv.value, new KeyValueView(kv.key, kv.value, viewValue));
  };

  setItem(AggregationEnumBackendExtended.Min, 'Min');
  setItem(AggregationEnumBackendExtended.Max, 'Max');
  setItem(AggregationEnumBackendExtended.Avg, 'Average');
  setItem(AggregationEnumBackendExtended.Count, 'Count');
  setItem(AggregationEnumBackendExtended.Sum, 'Sum');
  setItem(AggregationEnumBackendExtended.Group, 'Group By');

  const has = (type: AggregationEnumBackendExtended) => {
    const kv = converter.getKeyValue(type);
    if (!kv) {
      return false;
    }
    return map.has(kv.value);
  };
  const getKv = (type: AggregationEnumBackendExtended) => {
    const kv = converter.getKeyValue(type);
    return { ...map.get(kv.value) };
  };

  return {
    get: getKv,
    has
  };
})();
