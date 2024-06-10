import { UIProcessStepFieldModel } from '@wfm/obsolete-components/process-step/models';
import { UIFormFieldModelEx } from '../models';

export function mapProcessStepFieldToUIFormField(x: UIProcessStepFieldModel): UIFormFieldModelEx {
  return <UIFormFieldModelEx>{
    ref: x,
    model: x.field,
    id: x.id,
    name: x.field.fieldName,
    listItems: x.listItems,
    type: x.type
  };
}
