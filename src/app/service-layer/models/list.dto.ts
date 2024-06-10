import { ListItemDto } from './list-item.dto';
import { DataEntity } from './model';

export interface ListDto extends DataEntity {
  tenantPublicId: string;
  name: string;
  parentListId: string;
  inUse: boolean;
  listItemKeyEnabled?: boolean;
}

export interface CreateListDto {
  name: string;
  parentListId: string;
  listItemKeyEnabled?: boolean;
  listItems: ListItemDto[];
}
