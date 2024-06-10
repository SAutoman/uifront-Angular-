import { IConfigurableListItem } from '@wfm/common/models';
import { FormVariableDto } from '@wfm/common/vendor';

export function builderViewToFormVariableDto(field: IConfigurableListItem): FormVariableDto {
  let label = field.configuration.label;
  if (typeof label !== 'string') {
    label = field.name;
  }
  const variableDto: FormVariableDto = {
    name: field.name,
    type: field.type,

    placeholder: field.configuration.placeholder || undefined,
    required: field.configuration.required,
    readonly: field.configuration.readonly,
    label: label,
    value: field.configuration.value,
    valueInfo: field.configuration
  };
  return variableDto;
}
