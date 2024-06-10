/**
 * global
 */
import { SortDescriptor } from '@progress/kendo-data-query';
import { GridDataResult } from '@progress/kendo-angular-grid';

/**
 * project
 */
import { SortDirection, SortDirectionValue } from '../service-layer';

/**
 * local
 */

export function toApiSort(sort: SortDescriptor): SortDirection {
  if (sort.dir === SortDirectionValue.asc) {
    return SortDirection.asc;
  }

  if (sort.dir === SortDirectionValue.desc) {
    return SortDirection.desc;
  }

  if ((sort.dir as any) === '') {
    return SortDirection.invalid;
  }
}

export interface GridDataResultEx<T> extends GridDataResult {
  data: T[];
}
