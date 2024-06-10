import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyFieldAdapterFactory, FormVariableDto } from '@wfm/common/vendor';

export function mapVariableToFormlyConfig(dto: FormVariableDto): FormlyFieldConfig {
  const adapter = FormlyFieldAdapterFactory.createAdapter(dto);
  return adapter.getConfig();
}
