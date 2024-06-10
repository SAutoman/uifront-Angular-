import { AbstractControl } from '@angular/forms';

export function ValidateMaxLength(control: AbstractControl) {
  const value: string = control?.value?.toString();
  if (value && value?.length > 50) {
    return { maxLength: true };
  }
  return null;
}

export function DecimalValidation(control: AbstractControl) {
  const value: string = control?.value?.toString()?.split('.');
  if (value && value[1] && value[1].length > 2) {
    return { decimalPlacesLengthExceed: true };
  }
  return null;
}
