import { IConfigurableListItem } from '@wfm/common/models';
import { FieldTypeIds, ValidatorType } from '@wfm/service-layer';

import { IValidatorFieldAdapter, ValidatorFieldAdapter } from './validator-field-adapter';

describe('ValidatorFieldAdapter', () => {
  const createFakeTypeField: (type: FieldTypeIds) => IConfigurableListItem = (type: FieldTypeIds) => {
    const field: IConfigurableListItem = { type } as any;
    return field;
  };
  const createFakeValidator: (type: FieldTypeIds, validatorType: ValidatorType) => IValidatorFieldAdapter = (
    type: FieldTypeIds,
    validatorType: ValidatorType
  ) => {
    const field = createFakeTypeField(type);
    return new ValidatorFieldAdapter(validatorType, field);
  };
  const supportedTypes = [
    FieldTypeIds.IntField,
    FieldTypeIds.StringField,
    FieldTypeIds.DecimalField,
    FieldTypeIds.BoolField,
    FieldTypeIds.ListField,
    FieldTypeIds.MultiselectListField,
    FieldTypeIds.DateField,
    FieldTypeIds.FileField,
    FieldTypeIds.TextareaField,
    FieldTypeIds.TimeField,
    FieldTypeIds.DateTimeField,
    FieldTypeIds.Radio
  ];
  const supportedValidators = [
    ValidatorType.Required,
    ValidatorType.MinMax,
    ValidatorType.Min,
    ValidatorType.Max,
    ValidatorType.RegEx,
    ValidatorType.Email,
    ValidatorType.List,
    ValidatorType.Time,
    ValidatorType.Date,
    ValidatorType.DateTime,

    ValidatorType.Integer,
    ValidatorType.Decimal
  ];

  it('all:should create (fieldType,validatorType)', () => {
    supportedValidators.forEach((validatorType) => {
      supportedTypes.forEach((fieldType) => {
        const validator = createFakeValidator(fieldType, validatorType);
        expect(() => validator.getConfig()).toBeTruthy();
      });
    });
  });
});
