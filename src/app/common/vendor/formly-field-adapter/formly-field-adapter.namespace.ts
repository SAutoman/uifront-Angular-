/**
 * global
 */
import { FormlyFieldConfig } from '@ngx-formly/core';

/**
 * local
 */
import { FormVariableDto } from './form-variable.dto';
import { FormlyFieldAdapterFactory } from './formly-field-adapter.factory';

export namespace FormlyFieldAdapterNamespace {
  /**
   * Angular Formly field data
   */
  interface FormlyDefinition {
    fields: FormlyFieldConfig[];
    model: Object & any;
  }

  /**
   * Converting field data from server to field model for Angular Formly
   *
   * @param formVariables Description of the field from the server
   */
  export function toFormlyDefinition(formVariables: FormVariableDto[]): FormlyDefinition {
    const fields: FormlyFieldConfig[] = [];
    const model = {};

    formVariables.forEach((formVariable: FormVariableDto) => {
      const adapter = FormlyFieldAdapterFactory.createAdapter(formVariable);

      const fieldConfig = adapter.getConfig();
      const fieldValue = adapter.getValue();

      fields.push(fieldConfig);
      model[fieldValue.key] = fieldValue.value;
    });

    return {
      fields: fields,
      model: model
    };
  }
}
