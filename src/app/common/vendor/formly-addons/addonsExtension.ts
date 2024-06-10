import { FormlyFieldConfig } from '@ngx-formly/core';
import { uniq } from 'lodash-core';
import { ADDON_NAMES } from './addonNames';

export function addonsExtension(field: FormlyFieldConfig): void {
  if (!field.templateOptions) {
    return;
  }

  ADDON_NAMES.forEach((x) => {
    if (field.wrappers && field.wrappers.indexOf(x) !== -1) {
      return;
    }
    if (field.templateOptions[x]) {
      field.wrappers = uniq([...(field.wrappers || []), x]);
    }
  });
}
