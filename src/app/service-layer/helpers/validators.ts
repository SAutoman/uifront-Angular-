import { AbstractControl, ValidatorFn, Validators } from '@angular/forms';
import { ErrorMessageTypeEnum } from '@wfm/common/error-message-generator';

export const emptyStringValidatorAsRequiredFn: () => ValidatorFn = () => {
  return (ctrl: AbstractControl) => {
    const required = Validators.required(ctrl);
    if (required) {
      return required;
    }
    if (!(ctrl.value || '').trim()) {
      return {
        required: true
      };
    }
    return null;
  };
};

/**
 *
 * @param names
 * @param allowLen 0 | 1; default is 1;  if 0 should not to be in names, if 1 allow 1 item with eq name
 */
export const uniqNameValidator: (names: string[], allowLen?: 0 | 1) => ValidatorFn = (names: string[], allowLen = 1) => {
  return (ctrl: AbstractControl) => {
    if (!names?.length) {
      return null;
    }
    const val = ((ctrl.value || '') as string).trim().toLowerCase();
    if (!val) {
      return null;
    }

    const invariantCollection = names.map((x) => x.toLowerCase());
    const items = invariantCollection.filter((x) => x === val);
    if (items.length > allowLen) {
      return {
        [ErrorMessageTypeEnum.uniqueName]: true
      };
    }

    return null;
  };
};

export const isIntegerValidator: () => ValidatorFn = () => {
  return (control: AbstractControl): { [key: string]: any } | null =>
    !control.value || Number.isInteger(control.value) ? null : { isInteger: true };
};
