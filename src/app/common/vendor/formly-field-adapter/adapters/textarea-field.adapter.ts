/**
 * global
 */
import { AbstractControl } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
/**
 * project
 */
import { ErrorMessageGenerator, ErrorMessageTypeEnum } from '@wfm/common/error-message-generator';

/**
 * local
 */
import { FormVariableDto } from '../form-variable.dto';
import { FormlyFieldAdapterTypeEnum } from '../formly-field-adapter-type.enum';
import { FormlyFieldAdapter } from '../formly-field.adapter';

export class TextareaFieldAdapter extends FormlyFieldAdapter<string> {
  constructor(formVariable: FormVariableDto) {
    super(formVariable, FormlyFieldAdapterTypeEnum.input);
  }

  getConfig(): FormlyFieldConfig {
    const formVariable = this.formVariable;
    const validators = {};
    const templateOptions = {
      label: formVariable.label,
      required: formVariable.required,
      readonly: formVariable.readonly,
      disabled: formVariable.disabled || formVariable.readonly,
      rows: 5,
      isHighlighted: formVariable.isHighlighted,
      highlightColor: formVariable.highlightColor,
      readonlySetExplicitly: formVariable.readonly
    };

    if (formVariable.regEx) {
      templateOptions['pattern'] = formVariable.regEx;
    }

    const minValue = this.safeNumber(formVariable.min);
    if (minValue !== null) {
      validators['min'] = (control: AbstractControl) => !control?.value || minValue <= control.value?.length;
      // templateOptions['minLength'] = minValue;
    }

    const maxValue = this.safeNumber(formVariable.max);
    if (maxValue !== null) {
      validators['max'] = (control: AbstractControl) => !control.value || control.value?.length <= maxValue;
      // templateOptions['maxLength'] = maxValue;
    }

    return {
      key: formVariable.name,
      type: 'textarea',
      validators: validators,
      validation: {
        messages: {
          required: ErrorMessageGenerator.get(ErrorMessageTypeEnum.required),
          min: ErrorMessageGenerator.get(ErrorMessageTypeEnum.minLength, formVariable.min),
          max: ErrorMessageGenerator.get(ErrorMessageTypeEnum.maxLength, formVariable.max),
          pattern: ErrorMessageGenerator.get(ErrorMessageTypeEnum.pattern, formVariable.regEx)
        }
      },
      templateOptions: templateOptions,
      defaultValue: formVariable.value
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
