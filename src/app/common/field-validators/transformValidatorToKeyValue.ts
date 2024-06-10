/**
 * global
 */
import { KeyValue } from '@angular/common';

/**
 * project
 */
import { FieldTypeIds, ValidatorType, ValidatorTypeMap } from '@wfm/service-layer';
import { IMinMax } from '@wfm/common/models';
import DateTimeFormatHelper from '@wfm/shared/dateTimeFormatHelper';

export function transformValidatorToKeyValue(fieldType: FieldTypeIds, key: string, val: any): KeyValue<ValidatorType, any> {
  const validatorEnum = ValidatorTypeMap.get(key);
  switch (fieldType) {
    case FieldTypeIds.DateField:
    case FieldTypeIds.DateTimeField:
      switch (validatorEnum.value) {
        case ValidatorType.Max:
        case ValidatorType.Min:
          return {
            key: validatorEnum.value,
            value: DateTimeFormatHelper.parseToLuxon(val)?.toUTC().toISO()
          };
        case ValidatorType.MinMax:
          const value: IMinMax = val || {};
          return {
            key: validatorEnum.value,
            value: {
              min: DateTimeFormatHelper.parseToLuxon(value.min)?.toUTC().toISO(),
              max: DateTimeFormatHelper.parseToLuxon(value.max)?.toUTC().toISO()
            }
          };
      }
    default:
      return {
        key: validatorEnum.value,
        value: val
      };
  }
}
