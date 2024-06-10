import { KeyValue } from '@angular/common';

export class EnumConverter<TEnum> {
  constructor(private enumType: TEnum) {}

  getKeyValue(type: string | number): KeyValue<string, any> {
    if (typeof type === 'number') {
      if (!this.enumType[type]) {
        return null;
      }
      return {
        key: this.enumType[type] as any,
        value: type as any
      };
    } else if (typeof type === 'string') {
      const isNumber = /^'\d+'$/.test(type);
      if (isNumber) {
        return this.getKeyValue(+type);
      }

      const keys = Object.keys(this.enumType);
      const invariantType = type.toLowerCase();
      const key = keys.find((x) => x.toLowerCase() === invariantType);
      const enumValue = this.enumType[key];

      if (!enumValue) {
        // try find by value for string enums
        let kv: KeyValue<string, any>;
        keys.forEach((enumKey) => {
          if (this.enumType[enumKey] === type) {
            kv = {
              key: enumKey,
              value: type
            };
            return false;
          }
        });
        return kv;
      }
      return {
        key: key,
        value: enumValue
      };
    }
    return null;
  }
}
