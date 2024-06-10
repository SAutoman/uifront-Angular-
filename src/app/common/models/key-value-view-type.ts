import { KeyValue } from '@angular/common';
import { AreaTypeEnum } from '@wfm/service-layer';
import { FieldTypeIds, FieldTypeNameMap } from '@wfm/service-layer/models/FieldTypeIds';

export interface IKeyValueView<TKey, TValue> extends KeyValue<TKey, TValue> {
  viewValue: string;
}

// used to show the field type along it's viewname
export class KeyValueViewType<TKey, TValue> implements IKeyValueView<TKey, TValue> {
  viewValue: string;
  constructor(public key: TKey, public value: TValue, viewValue?: string) {
    if (!viewValue && typeof key === 'string') {
      this.viewValue = key;
    } else {
      const field = FieldTypeNameMap.get(value['type']);
      let typeLabel = field.viewValue;
      if (value['type'] === FieldTypeIds.SchemaField) {
        typeLabel = `${AreaTypeEnum[value['area']]} schema`;
      }
      this.viewValue = `${viewValue} (${typeLabel})`;
    }
  }
}
