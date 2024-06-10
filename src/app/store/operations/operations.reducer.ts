/**
 * global
 */
import { SortDescriptor } from '@progress/kendo-data-query';
import { cloneDeep } from 'lodash-core';

/**
 * project
 */
import { GridDataResultEx } from '@wfm/shared/kendo-util';
import { Paging, SortDirectionValue } from '@wfm/service-layer';
import { OperationListPageViewModel, OperationViewModel } from '@wfm/operations/operations/operation.view-model';

/**
 * local
 */
import { OperationsActions, OperationsTypes } from './operations.actions';

export interface OperationsState {
  operationListPageViewModel: OperationListPageViewModel;
  selectedUser: string;
  selectedStatus: string;
}

export const initialOperationsState = <OperationsState>{
  operationListPageViewModel: <OperationListPageViewModel>{
    sort: <SortDescriptor[]>[
      {
        field: 'createdAt',
        dir: SortDirectionValue.desc
      }
    ],
    gridData: <GridDataResultEx<OperationViewModel>>{},
    paging: <Paging>{
      skip: 0,
      take: 10
    }
  },
  selectedStatus: '',
  selectedUser: ''
};

function loadGridData(data: any): OperationListPageViewModel {
  const result = cloneDeep(initialOperationsState.operationListPageViewModel);
  result.gridData.data = data.result.items;
  result.gridData.total = data.result.total;
  return result;
}

function updateStatus(data: any): string {
  return data.status;
}

function updateUser(data: any): string {
  return data.actor;
}

export function operationsReducer(state = initialOperationsState, action: OperationsActions): OperationsState {
  switch (action.type) {
    case OperationsTypes.LoadOperationsSuccess:
      return {
        ...state,
        operationListPageViewModel: loadGridData(action.payload),
        selectedStatus: updateStatus(action.payload),
        selectedUser: updateUser(action.payload)
      };
    default:
      return state;
  }
}
