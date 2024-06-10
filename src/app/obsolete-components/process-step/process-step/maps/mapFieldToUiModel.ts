import { SelectType, UIProcessStepFieldModel } from '@wfm/obsolete-components/process-step/models';
import { FieldTypeLists, IFieldBaseDto } from '@wfm/service-layer';
import { mapFieldToUiModelCommon } from './mapFieldToUiModelCommon';

export function mapFieldToUiModel(x: IFieldBaseDto): UIProcessStepFieldModel {
  if (FieldTypeLists.includes(x.type)) {
    const lists = mapFieldToUiModelCommon(x, SelectType.Lists);
    lists.field.listPublicId = x.id;
  } else {
    const fields = mapFieldToUiModelCommon(x, SelectType.Fields);
    fields.field.fieldPublicId = x.id;
    return fields;
  }
}
