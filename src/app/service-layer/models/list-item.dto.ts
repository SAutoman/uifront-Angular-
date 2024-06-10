import { EnumConverter, IKeyValueView, KeyValueView } from '@wfm/common/models';
import { DataEntity } from './model';

export interface ListItemDto extends DataEntity {
  /**
   * related collection for this option of list
   */
  listId: string;
  /**
   * value of the option
   */
  item: string;
  /**
   * key of the option
   */
  key?: string;
  /**
   * related parent listItem id
   */
  parentListItemId: string;
  position: number;
  /**
   * if true, disable the list option
   */
  isDisabled?: boolean;
  /**
   * for UI only
   */
  valid?: boolean;
  uiId?: string;
}

export enum ListItemDisplayEnum {
  Value = 0,
  Key,
  KeyValue,
  None
}

export const ListItemDisplayOptions = [
  ListItemDisplayEnum.Value,
  ListItemDisplayEnum.Key,
  ListItemDisplayEnum.KeyValue,
  ListItemDisplayEnum.None
];

export const ListItemDisplayMap: {
  get: (type: ListItemDisplayEnum) => IKeyValueView<string, ListItemDisplayEnum>;
  has: (type: ListItemDisplayEnum) => boolean;
} = (() => {
  const map = new Map<ListItemDisplayEnum, IKeyValueView<string, ListItemDisplayEnum>>();
  const converter = new EnumConverter(ListItemDisplayEnum);

  const setItem = (type: ListItemDisplayEnum, viewValue: string) => {
    const kv = converter.getKeyValue(type);
    map.set(kv.value, new KeyValueView(kv.key, kv.value, viewValue));
  };
  setItem(ListItemDisplayEnum.Value, 'Value');
  setItem(ListItemDisplayEnum.Key, 'Key');
  setItem(ListItemDisplayEnum.KeyValue, 'Key/Value');
  setItem(ListItemDisplayEnum.None, 'No Setting');

  const has = (type: ListItemDisplayEnum) => {
    const kv = converter.getKeyValue(type);
    if (!kv) {
      return false;
    }
    return map.has(kv.value);
  };
  const getKv = (type: ListItemDisplayEnum) => {
    if (!has(type)) {
      return null;
    }
    const kv = converter.getKeyValue(type);
    return { ...map.get(kv.value) };
  };

  return {
    get: getKv,
    has
  };
})();
