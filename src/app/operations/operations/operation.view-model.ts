import { OperationStatus } from '../../service-layer/models/operation';
import { SortDescriptor, State } from '@progress/kendo-data-query';
import { GridDataResultEx } from '../../shared/kendo-util';

export class OperationViewModel {
  id: string;
  targetId: string;
  status: OperationStatus;
  actor: string;
  errorMsg: string;
  validationResult: string;
}

export class OperationListPageViewModel {
  paging: State;
  gridData: GridDataResultEx<OperationViewModel>;
  sort: SortDescriptor[];
  displayDeleteConfirmation: boolean;
}
