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
import { MappingListPageViewModel } from '@wfm/mappings/mappings/mapping-list-page.view-model';

/**
 * local
 */
import { MappingActions as MappingsActions, MappingTypes } from './mappings.actions';
import { EditMappingSuccessPayload } from './mappings-payload-models';
import { MappingDto } from '@wfm/service-layer/models/mappings';

export interface MappingsState {
  mappingListPageViewModel: MappingListPageViewModel;
  editMappingViewModel: MappingDto;
  operationMsg: string;
}

export const initialMappingsState = <MappingsState>{
  mappingListPageViewModel: <MappingListPageViewModel>{
    sort: <SortDescriptor[]>[
      {
        field: '',
        dir: SortDirectionValue.asc
      }
    ],
    gridData: <GridDataResultEx<MappingDto>>{},
    paging: <Paging>{
      skip: 0,
      take: 10
    }
  },
  editMappingViewModel: null,
  operationMsg: null
};

function onDeleteUpdateGrid(payload: any): MappingListPageViewModel {
  const result = { ...initialMappingsState.mappingListPageViewModel };
  result.gridData.data = result.gridData.data.filter((x) => x.id !== payload?.operation.targetId);
  return result;
}

function loadGridData(data: any): MappingListPageViewModel {
  const result = cloneDeep(initialMappingsState.mappingListPageViewModel);
  result.gridData.data = data.result.items;
  result.gridData.total = data.result.total || 0;
  return result;
}

function loadMapping(payload: any): MappingDto {
  return payload.mapping;
}

function updateMapping(payload: any, state: any): MappingListPageViewModel {
  const currentState = <MappingsState>{ ...state };
  const mappingListPageViewModelClone = <MappingListPageViewModel>cloneDeep(currentState.mappingListPageViewModel);
  return mappingListPageViewModelClone;
}

export function mappingsReducer(state = initialMappingsState, action: MappingsActions): MappingsState {
  switch (action.type) {
    case MappingTypes.LoadSuppliersSuccess:
      return {
        ...state,
        mappingListPageViewModel: loadGridData(action.payload)
      };
    case MappingTypes.DeleteSupplierSuccess:
      return {
        ...state,
        operationMsg: action.payload.msg
      };
    case MappingTypes.DeleteSupplierFail:
      return {
        ...state,
        operationMsg: 'Fail' + action.payload.error
      };
    case MappingTypes.LoadSupplierSuccess:
      return {
        ...state,
        editMappingViewModel: loadMapping(action.payload)
      };
    case MappingTypes.EditSupplierSuccess:
      const supplierPayload = <EditMappingSuccessPayload>action.payload;
      return <MappingsState>{
        ...state,
        mappingListPageViewModel: updateMapping(supplierPayload, state)
      };
    case MappingTypes.LoadAuditorsSuccess:
      return {
        ...state,
        mappingListPageViewModel: loadGridData(action.payload)
      };
    case MappingTypes.LoadAuditorSuccess:
      return {
        ...state,
        editMappingViewModel: loadMapping(action.payload)
      };
    case MappingTypes.EditAuditorSuccess:
      const auditorPayload = <EditMappingSuccessPayload>action.payload;
      return <MappingsState>{
        ...state,
        mappingListPageViewModel: updateMapping(auditorPayload, state)
      };
    case MappingTypes.DeleteAuditorSuccess:
      return {
        ...state,
        operationMsg: action.payload.msg
      };
    case MappingTypes.DeleteAuditorFail:
      return {
        ...state,
        operationMsg: 'Fail' + action.payload.error
      };
    case MappingTypes.ClearEditMappingViewModel:
      return Object.assign({}, { ...state, editMappingViewModel: null });
    case MappingTypes.ResetMappingsOperationMsg:
      return {
        ...state,
        operationMsg: null
      };
    case MappingTypes.LoadSuppliers:
      return {
        ...state,
        mappingListPageViewModel: {
          ...state.mappingListPageViewModel,
          gridData: { total: 0, data: [] }
        }
      };
    case MappingTypes.LoadAuditors:
      return {
        ...state,
        mappingListPageViewModel: {
          ...state.mappingListPageViewModel,
          gridData: { total: 0, data: [] }
        }
      };
    case MappingTypes.ApplyMappingManual:
      return {
        ...state,
        operationMsg: null
      };
    case MappingTypes.ApplyMappingManualSuccess:
      return {
        ...state,
        operationMsg: action.payload.msg
      };
    case MappingTypes.ApplyMappingManualFail:
      return {
        ...state,
        operationMsg: 'Fail' + action.payload.error
      };
    case MappingTypes.ReapplyAllMappingsSuppliersSuccess:
      return {
        ...state,
        operationMsg: action.payload.msg
      };
    case MappingTypes.ReapplyAllMappingsSuppliersFail:
      return {
        ...state,
        operationMsg: 'Fail' + action.payload.error
      };
    case MappingTypes.ReapplyAllMappingsAuditorsSuccess:
      return {
        ...state,
        operationMsg: action.payload.msg
      };
    case MappingTypes.ReapplyAllMappingsAuditorsFail:
      return {
        ...state,
        operationMsg: 'Fail' + action.payload.error
      };
    default:
      return state;
  }
}
