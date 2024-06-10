import { DataEntity, FieldTypeIds, ListItemDto } from '@wfm/service-layer';

export interface IFormFieldModelDto<T = any> extends DataEntity {
  name: string;
  type: FieldTypeIds;
  required: boolean;
  listItems?: ListItemDto[];
  sourceDataRef?: T;
}
