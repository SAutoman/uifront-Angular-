/**
 * global
 */
import { KeyValue } from '@angular/common';
import { AbstractControl } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
/**
 * project
 */
import { ErrorMessageGenerator, ErrorMessageTypeEnum } from '@wfm/common/error-message-generator';
import { FieldTypeIds } from '@wfm/service-layer';
/**
 * local
 */
import { FormVariableDto } from '../form-variable.dto';
import { FormlyFieldAdapterTypeEnum } from '../formly-field-adapter-type.enum';
import { FormlyFieldAdapter } from '../formly-field.adapter';

export class NumberFieldAdapter extends FormlyFieldAdapter<number> {
  validNumberRegex = new RegExp(/^[-]?[0-9]*\.?[0-9]+$/);

  constructor(formVariable: FormVariableDto) {
    super(formVariable, FormlyFieldAdapterTypeEnum.number);
  }

  getConfig(): FormlyFieldConfig {
    const formVariable = this.formVariable;

    const validators = {
      invalidNumber: (control: AbstractControl) => (control.value ? !control.dirty || this.validNumberRegex.test(control.value) : true),
      numberMaxLength: (control: AbstractControl) => {
        const value: string = control?.value?.toString();
        if (value?.length && !isNaN(+value) && value.length > 50) {
          return false;
        }
        return true;
      }
    };
    const templateOptions = {
      label: formVariable.label,
      type: 'number',
      required: formVariable.required,
      readonly: formVariable.readonly,
      disabled: formVariable.disabled || formVariable.readonly,
      isHighlighted: formVariable.isHighlighted,
      highlightColor: formVariable.highlightColor,
      readonlySetExplicitly: formVariable.readonly
    };
    // validator added by default
    if (formVariable.type === FieldTypeIds.IntField) {
      validators['integer'] = (control: AbstractControl) => !control.value || Number.isInteger(control.value);
      templateOptions['integer'] = true;
    }

    const minValue = this.safeNumber(formVariable.min);
    if (minValue !== null) {
      validators['min'] = (control: AbstractControl) => !control.value || minValue <= +control.value;
      templateOptions['min'] = minValue;
    }

    const maxValue = this.safeNumber(formVariable.max);
    if (maxValue !== null) {
      validators['max'] = (control: AbstractControl) => !control.value || +control.value <= maxValue;
      templateOptions['max'] = maxValue;
    }

    if (formVariable.type === FieldTypeIds.DecimalField) {
      validators['decimalLimitExceeded'] = (control: AbstractControl) => {
        const value: string = control?.value?.toString()?.split('.');
        if (value && value[1] && value[1].length > 2) {
          return false;
        }
        return true;
      };
    }

    return {
      key: formVariable.name,
      type: FormlyFieldAdapterTypeEnum.number,
      validators: validators,
      validation: {
        messages: {
          required: ErrorMessageGenerator.get(ErrorMessageTypeEnum.required),
          min: ErrorMessageGenerator.get(ErrorMessageTypeEnum.min, minValue),
          max: ErrorMessageGenerator.get(ErrorMessageTypeEnum.max, maxValue),
          integer: ErrorMessageGenerator.get(ErrorMessageTypeEnum.integer),
          invalidNumber: ErrorMessageGenerator.get(ErrorMessageTypeEnum.invalidNumber),
          numberMaxLength: ErrorMessageGenerator.get(ErrorMessageTypeEnum.numberMaxLength, 50),
          decimalLimitExceeded: ErrorMessageGenerator.get(ErrorMessageTypeEnum.decimalLimitExceeded)
          // decimal: ErrorMessageGenerator.get(ErrorMessageTypeEnum.decimal)
        }
      },
      templateOptions: templateOptions,
      defaultValue: formVariable.value
    };
  }

  /**
   * @override
   */
  getValue(): KeyValue<string, number> {
    const formVariable = this.formVariable;
    const value = parseFloat(formVariable.value);

    return {
      key: formVariable.name,
      value: Number.isNaN(value) ? null : value
    };
  }

  private safeNumber(value: number): number | null {
    if (typeof value === 'number') {
      return value;
    }

    const out = Number.parseFloat(value);

    return Number.isNaN(out) ? null : out;
  }
}
