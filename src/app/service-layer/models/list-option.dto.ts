import { KeyValue } from '@angular/common';
import { ListItemDto } from './list-item.dto';

export interface ListOptionDto extends KeyValue<string, ListItemDto[]> {}
