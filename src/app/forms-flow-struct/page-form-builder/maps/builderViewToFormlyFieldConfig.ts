import { FormlyFieldConfig } from '@ngx-formly/core';
import { IConfigurableListItem } from '@wfm/common/models';
/**
 * local
 */
import { builderViewToFormVariableDto } from './builderViewToFormVariableDto';
import { mapVariableToFormlyConfig } from './mapVariableToFormlyConfig';

export function builderViewToFormlyFieldConfig(field: IConfigurableListItem): FormlyFieldConfig {
  const cfg = builderViewToFormVariableDto(field);
  return mapVariableToFormlyConfig(cfg);
}
