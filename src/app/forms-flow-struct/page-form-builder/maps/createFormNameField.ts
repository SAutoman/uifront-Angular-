import { IConfigurableListItem } from '@wfm/common/models';
import { FieldTypeIds } from '@wfm/service-layer';

export function createFormNameField(formId: string, formValue: string, label: string = 'Preview form name'): IConfigurableListItem {
  const field: IConfigurableListItem = {
    id: formId,
    name: formId,
    isChanged: false,
    isSystem: false,
    isCustom: false,
    type: FieldTypeIds.StringField,
    configuration: {
      position: 0,
      readonly: true,
      value: formValue,
      label: label
    }
  };
  return field;
}
