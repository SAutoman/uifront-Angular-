/**
 * global
 */
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

export class ListOfEntitiesAdapter extends FormlyFieldAdapter<string[]> {
  constructor(formVariable: FormVariableDto) {
    super(formVariable, FormlyFieldAdapterTypeEnum.listOfLinks);
  }

  getConfig(): FormlyFieldConfig {
    const formVariable = this.formVariable;
    return {
      key: formVariable.name,
      type: FormlyFieldAdapterTypeEnum.listOfLinks,
      validation: {
        messages: {
          required: ErrorMessageGenerator.get(ErrorMessageTypeEnum.required)
        }
      },
      templateOptions: {
        hidden: true,
        label: formVariable.label,
        required: formVariable.required,
        readonly: formVariable.readonly,
        attributes: formVariable.valueInfo,
        schemaFields: formVariable.fields ? [...formVariable.fields] : [],
        isHighlighted: formVariable.isHighlighted,
        highlightColor: formVariable.highlightColor
      },
      defaultValue: formVariable.value
    };
  }
}
