import { KeyValue } from '@angular/common';

export interface IKeyValueView<TKey, TValue> extends KeyValue<TKey, TValue> {
  viewValue: string;
}
export class KeyValueView<TKey, TValue> implements IKeyValueView<TKey, TValue> {
  viewValue: string;
  constructor(public key: TKey, public value: TValue, viewValue?: string) {
    if (!viewValue && typeof key === 'string') {
      this.viewValue = key;
    } else {
      this.viewValue = viewValue;
    }
  }
}
