/**
 * global
 */
import { MatTableDataSource } from '@angular/material/table';

/**
 * project
 */
import { ListItemDto, ListDto } from '../../service-layer';

/**
 * local
 */

export interface ListUI {
  list: ListDto;
  dataSource: MatTableDataSource<any>;
  parentItems: ListItemDto[];
  selectedParentListItem: ListItemDto;
}
