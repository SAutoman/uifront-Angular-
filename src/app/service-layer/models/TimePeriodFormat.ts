import { EnumConverter, IKeyValueView, KeyValueView } from '@wfm/common/models';
import { cloneDeep } from 'lodash-core';

export enum TimePeriodFormat {
  Custom = 1,
  Day = 2,
  Week = 3,
  Month = 4,
  Year = 5
}

export const TimePeriods = [
  TimePeriodFormat.Custom,
  TimePeriodFormat.Day,
  TimePeriodFormat.Week,
  TimePeriodFormat.Month,
  TimePeriodFormat.Year
];

export const TimePeriodNameMap: {
  get: (type: TimePeriodFormat | string) => IKeyValueView<string, TimePeriodFormat>;
  has: (type: TimePeriodFormat | string) => boolean;
  getAll: () => IKeyValueView<string, TimePeriodFormat>[];
} = (() => {
  const map = new Map<TimePeriodFormat, IKeyValueView<string, TimePeriodFormat>>();
  const converter = new EnumConverter(TimePeriodFormat);

  const setItem = (type: TimePeriodFormat, viewValue: string) => {
    const kv = converter.getKeyValue(type);
    map.set(kv.value, new KeyValueView(kv.key, kv.value, viewValue));
  };
  setItem(TimePeriodFormat.Custom, 'Custom Range');
  setItem(TimePeriodFormat.Day, 'One Day');
  setItem(TimePeriodFormat.Week, 'One Week');
  setItem(TimePeriodFormat.Month, 'One Month');
  setItem(TimePeriodFormat.Year, 'One Year');

  const has = (type: TimePeriodFormat | string) => {
    const kv = converter.getKeyValue(type);
    if (!kv) {
      return false;
    }
    return map.has(kv.value);
  };
  const getKv = (type: TimePeriodFormat | string) => {
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
