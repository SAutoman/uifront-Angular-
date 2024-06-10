import { FieldTypeIds } from '@wfm/service-layer/models/FieldTypeIds';

import { DataEntity, IFieldValidatorUi, RenderType } from '@wfm/service-layer/models';

export interface ProcessStepFieldModel extends DataEntity {
  fieldPublicId: string;
  listPublicId: string;
  validators: IFieldValidatorUi[];
  position: number;
  typeField: FieldTypeIds;
  fieldName: string;
  dbFieldName: string;
  isCustom: boolean;
  renderType: RenderType;
}
