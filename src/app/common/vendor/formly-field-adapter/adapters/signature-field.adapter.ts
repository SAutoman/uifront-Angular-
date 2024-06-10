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

export class SignatureFieldAdapter extends FormlyFieldAdapter<string> {
  constructor(formVariable: FormVariableDto) {
    super(formVariable, FormlyFieldAdapterTypeEnum.signatureInput);
  }

  getConfig(): FormlyFieldConfig {
    const formVariable = this.formVariable;
    const validators = {};
    const templateOptions = {
      label: formVariable.label,
      required: formVariable.required,
      readonly: formVariable.readonly,
      disabled: formVariable.disabled || formVariable.readonly,
      isHighlighted: formVariable.isHighlighted,
      highlightColor: formVariable.highlightColor,
      readonlySetExplicitly: formVariable.readonly,
      disableButtons: formVariable.disableButtons
    };

    return {
      key: formVariable.name,
      type: FormlyFieldAdapterTypeEnum.signatureInput,
      validators: validators,
      validation: {
        messages: {
          required: ErrorMessageGenerator.get(ErrorMessageTypeEnum.required)
        }
      },
      templateOptions: templateOptions,
      defaultValue: formVariable.value
    };
  }
}
