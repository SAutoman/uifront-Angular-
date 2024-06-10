import { GridComponent } from '@progress/kendo-angular-grid';

import { Paging } from '@wfm/service-layer';

export interface IGridComponent {
  gridPaging: Paging;
  grid: GridComponent;
}
