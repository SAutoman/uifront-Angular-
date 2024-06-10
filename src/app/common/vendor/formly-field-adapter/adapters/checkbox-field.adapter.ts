/**
 * global
 */

import { FormlyFieldConfig } from '@ngx-formly/core';

/**
 * project
 */
import { ErrorMessageGenerator, ErrorMessageTypeEnum } from '@wfm/common/error-message-generator';
import { FieldRenderTypeEnum } from '@wfm/service-layer';

/**
 * local
 */
import { FormVariableDto } from '../form-variable.dto';
import { FormlyFieldAdapterTypeEnum } from '../formly-field-adapter-type.enum';
import { FormlyFieldAdapter } from '../formly-field.adapter';

export class CheckboxFieldAdapter extends FormlyFieldAdapter<boolean> {
  constructor(formVariable: FormVariableDto) {
    super(formVariable, FormlyFieldAdapterTypeEnum.checkbox);
  }

  getConfig(): FormlyFieldConfig {
    const formVariable = this.formVariable;
    // check the rendertype

    let renderType = FormlyFieldAdapterTypeEnum.checkbox;
    let options;
    if (formVariable.renderType === FieldRenderTypeEnum.radio || formVariable.valueInfo?.renderType === FieldRenderTypeEnum.radio) {
      renderType = FormlyFieldAdapterTypeEnum.radio;
      options = [
        {
          value: true,
          label: 'Yes'
        },
        {
          value: false,
          label: 'No'
        }
      ];
    }

    return {
      key: formVariable.name,
      type: renderType,
      // WFM-2871 - setting it to "false" as a default results in wrong evaluation in schema functions
      // defaultValue: formVariable.value || false,
      defaultValue: formVariable.value,
      validation: {
        messages: {
          required: ErrorMessageGenerator.get(ErrorMessageTypeEnum.required)
        }
      },
      templateOptions: {
        options: options,
        label: formVariable.label,
        required: formVariable.required,
        readonly: formVariable.readonly,
        disabled: formVariable.disabled || formVariable.readonly,
        isHighlighted: formVariable.isHighlighted,
        highlightColor: formVariable.highlightColor,
        readonlySetExplicitly: formVariable.readonly
      }
    };
  }

  /**
   * @override
   */
  // getValue(): KeyValue<string, boolean> {
  //   const formVariable = this.formVariable;

  //   return {
  //     key: formVariable.name,
  //     value: !!Value.parse(formVariable.value)
  //   };
  // }
}
