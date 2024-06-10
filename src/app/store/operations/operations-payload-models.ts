/**
 * global
 */

/**
 * project
 */
import { Paging, PagedData } from '../../service-layer/models/model';
import { OperationViewModel } from '../../operations/operations/operation.view-model';

/**
 * local
 */
export interface LoadOperationsPayload {
  paging: Paging;
  actor: string;
  status: string;
}

export interface LoadOperationsFailPayload {
  error: string;
}

export interface LoadOperationsSuccessPayload {
  result: PagedData<OperationViewModel>;
  actor: string;
  status: string;
}
