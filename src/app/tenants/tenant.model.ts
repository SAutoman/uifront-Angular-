import { State, SortDescriptor } from '@progress/kendo-data-query';
import { UsersUiGrid } from '@wfm/service-layer/models/wfm-application';

import { GridDataResultEx } from '../shared/kendo-util';

export class TenantViewModel {
  id: string;
  name: string;
  companyName?: string;
  company?: UsersUiGrid;
  timeZone?: string;
}

export class TenantListPageViewModel {
  paging: State;
  gridData: GridDataResultEx<TenantViewModel>;
  sort: SortDescriptor[];
  displayDeleteConfirmation: boolean;
}
