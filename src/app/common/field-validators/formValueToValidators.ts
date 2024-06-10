/**
 * global
 */
import { KeyValue } from '@angular/common';
import { lowerFirst } from 'lodash-core';

/**
 * project
 */
import { AllowedFileType, FieldTypeIds, IFieldValidatorUi, ValidatorModelUi, ValidatorType, ValidatorTypeMap } from '@wfm/service-layer';

/**
 * local
 */
import { ValidatorValue } from './validator-value.type';

export function formValueToValidators(value: ValidatorValue, fieldType: FieldTypeIds): KeyValue<string, IFieldValidatorUi>[] {
  const validators = [];

  if (!fieldType) {
    return validators;
  }
  const keys = Object.keys(value || {});
  keys
    .filter((x) => ValidatorTypeMap.has(x))
    .forEach((key) => {
      const typeInfo = ValidatorTypeMap.get(key);
      if (!typeInfo || !typeInfo.value) {
        // next
        return;
      }
      const validator: ValidatorModelUi = {
        isValid: true,
        validatorType: typeInfo.value,
        fieldType: fieldType
      };
      const validatorKey = lowerFirst(typeInfo.key);
      switch (typeInfo.value) {
        case ValidatorType.Required:
        case ValidatorType.Integer:
        case ValidatorType.Decimal:
          validators.push({
            key: validatorKey,
            value: Object.assign(validator, {
              [validatorKey]: true
            })
          });
          break;
        case ValidatorType.MinMax:
          // done for backend, it expects a value - {min, max} and not {minMax:{min, max}}
          validators.push({
            key: validatorKey,
            value: Object.assign(validator, {
              min: value[typeInfo.key]['min'],
              max: value[typeInfo.key]['max'],
              [validatorKey]: value[typeInfo.key]
            })
          });
          break;
        case ValidatorType.RegEx:
        case ValidatorType.Min:
        case ValidatorType.Max:
        case ValidatorType.Date:
        case ValidatorType.Time:
        case ValidatorType.DateTime:
          validators.push({
            key: validatorKey,
            value: Object.assign(validator, {
              [validatorKey]: value[typeInfo.key]
            })
          });
          break;
        case ValidatorType.Email:
          validators.push({
            key: validatorKey,
            value: Object.assign(validator, {
              [validatorKey]: true,
              enabled: true
            })
          });
          break;
        case ValidatorType.AllowedTypes:
          let allowedTypesValidator = {
            key: validatorKey,
            value: Object.assign(validator, {
              allowedFileTypes: value[typeInfo.key]
            })
          };

          validators.push(allowedTypesValidator);
          break;
        case ValidatorType.List:
          // todo not implemented
          // validators.push({
          //   key: 'list',
          //   value: Object.assign(validator, {
          //     list: value[typeInfo.key]
          //   })
          // });
          break;

        default:
          break;
      }
    });

  return validators;
}
