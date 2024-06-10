import { DataEntity, FieldTypeIds, ListItemDto } from '@wfm/service-layer';

export interface IFieldDto extends DataEntity {
  name: string;
  type: FieldTypeIds;
  required?: boolean;
  listItems?: ListItemDto[];
}
