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

export class YoutubeEmbedFieldAdapter extends FormlyFieldAdapter<string> {
  constructor(formVariable: FormVariableDto) {
    super(formVariable, FormlyFieldAdapterTypeEnum.youtubeEmbed);
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
      readonlySetExplicitly: formVariable.readonly
    };

    const youtubeRegEx = new RegExp(
      /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})?$/
    );
    validators['pattern'] = (control: AbstractControl) => {
      return !control.value || youtubeRegEx.test(control.value);
    };

    return {
      key: formVariable.name,
      type: FormlyFieldAdapterTypeEnum.youtubeEmbed,
      validators: validators,
      validation: {
        messages: {
          required: ErrorMessageGenerator.get(ErrorMessageTypeEnum.required),
          pattern: ErrorMessageGenerator.get(ErrorMessageTypeEnum.invalidYoutubeUrl)
        }
      },
      templateOptions: templateOptions,
      defaultValue: formVariable.value
    };
  }
}
