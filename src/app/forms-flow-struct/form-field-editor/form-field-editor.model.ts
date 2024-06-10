import { KeyValue } from '@angular/common';

import { IFieldValidatorUi, ValidatorType } from '@wfm/service-layer';
import { ValidatorValue } from '@wfm/common/field-validators';

export interface FormFieldEditorFormModel {
  name: string;
  type: string;
  fieldValidators: ValidatorValue;
  selectValidator?: ValidatorType;
}
export interface FormFieldEditorOutputModel {
  fieldId: string;
  validators: KeyValue<string, IFieldValidatorUi>[];
  isValid: boolean;
}
