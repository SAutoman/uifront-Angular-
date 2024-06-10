/**
 * project
 */

import { EnumConverter } from '@wfm/common/models';
import { IKeyValueView, KeyValueView } from '@wfm/common/models/i-key-value-view';

/**
 * local
 */
import { FieldTypeIds } from './FieldTypeIds';

export interface IValidatorDto {
  validatorType: ValidatorType;
}

export interface IRequiredValidatorDto extends IValidatorDto {
  required: boolean;
}

export interface IMinMaxValidatorDto<T> extends IValidatorDto {
  min: T;
  max: T;
  fieldType: FieldTypeIds;
}

export interface IMinValidatorDto<T> extends IValidatorDto {
  min: T;
  fieldType: FieldTypeIds;
}

export interface IAllowedTypesValidatorDto extends IValidatorDto {
  allowedFileTypes: string[];
}

export interface IRegExValidatorDto extends IValidatorDto {
  regEx: string;
}

export interface IEmailValidatorDto extends IValidatorDto {
  enabled: boolean;
}

export interface IListValidatorDto extends IValidatorDto {
  allowedListItemIds: string[];
}

export type ValidatorDtoType =
  | IValidatorDto
  | IRequiredValidatorDto
  | IMinMaxValidatorDto<number>
  | IMinMaxValidatorDto<string>
  | IMinValidatorDto<Date>
  | IAllowedTypesValidatorDto
  | IRegExValidatorDto
  | IEmailValidatorDto
  | IListValidatorDto;

export interface IFieldValidatorUi extends IValidatorDto {
  isValid?: boolean;
}

export interface IRequiredValidatorUi extends IFieldValidatorUi, IRequiredValidatorDto {}

export interface IMinMaxValidatorUi<T> extends IFieldValidatorUi, IMinMaxValidatorDto<T> {}

export interface IAllowedTypesValidatorUi extends IFieldValidatorUi, IAllowedTypesValidatorDto {}

export interface IRegExValidatorUi extends IFieldValidatorUi, IRegExValidatorDto {}

export interface IEmailValidatorUi extends IFieldValidatorUi, IEmailValidatorDto {}

export interface IListValidatorUi extends IFieldValidatorUi, IListValidatorDto {}

export interface IMinMaxNumberValidator extends IFieldValidatorUi, IMinMaxValidatorUi<number> {}

export interface MinMaxDateValidator extends IFieldValidatorUi, IMinMaxValidatorUi<Date> {}

export interface MinDateValidator extends IFieldValidatorUi, IMinValidatorDto<Date> {}

export interface MinTimeValidator extends IMinValidatorDto<string> {}

export interface MinMaxStringValidator extends IMinMaxValidatorUi<string> {}

export interface MinMaxTimeValidator extends IFieldValidatorUi, IMinMaxValidatorUi<string> {}

export interface FileExtensionsType {
  name: string;
  extension: string;
}

export interface AllowedFileType {
  id: string;
  displayName: string;
  extensions: FileExtensionsType[];
}

export type ValidatorModelUi =
  | IFieldValidatorUi
  | IRequiredValidatorUi
  | IAllowedTypesValidatorUi
  | IRegExValidatorUi
  | IEmailValidatorUi
  | IListValidatorUi
  | IMinMaxNumberValidator
  | MinMaxDateValidator
  | MinMaxStringValidator
  | MinMaxTimeValidator
  | MinDateValidator;

export enum ValidatorType {
  Unknown = 0,
  Required,
  MinMax,
  RegEx,
  AllowedTypes,
  Email,
  List,
  // new Types add it to server
  Time,
  Date,
  DateTime,
  Min,
  Max,
  Integer,
  Decimal
}

export const ValidatorTypeMap: {
  get: (type: ValidatorType | string) => IKeyValueView<string, ValidatorType>;
  has: (type: ValidatorType | string) => boolean;
} = (() => {
  const map = new Map<ValidatorType, IKeyValueView<string, ValidatorType>>();
  const types = [
    ValidatorType.Unknown,
    ValidatorType.Required,
    ValidatorType.MinMax,
    ValidatorType.RegEx,
    ValidatorType.AllowedTypes,
    ValidatorType.Email,
    ValidatorType.List,
    ValidatorType.Time,
    ValidatorType.Date,
    ValidatorType.DateTime,
    ValidatorType.Min,
    ValidatorType.Max,
    ValidatorType.Integer,
    ValidatorType.Decimal
  ];

  types.forEach((x) => {
    map.set(x, new KeyValueView<string, ValidatorType>(ValidatorType[x], x));
  });

  const converter = new EnumConverter(ValidatorType);

  const hasValidator: (type: ValidatorType) => boolean = (type: ValidatorType) => {
    const kv = converter.getKeyValue(type);
    if (!kv) {
      return false;
    }
    if (kv.value === ValidatorType.Unknown) {
      return false;
    }
    return map.has(kv.value as any);
  };
  const getKV = (type: ValidatorType) => {
    const kv = converter.getKeyValue(type);
    if (!hasValidator(kv.value as any)) {
      return { ...map.get(ValidatorType.Unknown) };
    }
    return { ...map.get(kv.value as any) };
  };

  return {
    get: getKV,
    has: hasValidator
  };
})();
