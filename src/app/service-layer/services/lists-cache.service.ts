import { Injectable } from '@angular/core';
import { ListDto, ListItemDto } from '../models';
import { CacheService } from './cache.service';

export interface ListFullData {
  list: ListDto;
  items: ListItemDto[];
  parentList?: ListFullData;
}

@Injectable({
  providedIn: 'root'
})
export class ListsCacheService extends CacheService<ListFullData> {}
