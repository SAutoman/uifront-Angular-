import { IConfigurableListItem } from '@wfm/common/models';

import { TenantFieldsActionTypes, TenantFieldsActions } from './tenant-fields.actions';

import { PagedData } from '@wfm/service-layer';

export interface TenantFieldsState {
  page?: PagedData<IConfigurableListItem>;
  loading?: boolean;
  silent?: boolean;
  error?: string | any;
  operationMsg?: string;
}

export const initialFieldsState: TenantFieldsState = {
  loading: false,
  error: null,
  operationMsg: null
};

export function tenantFieldsReducer(state: TenantFieldsState = initialFieldsState, action: TenantFieldsActions): TenantFieldsState {
  switch (action.type) {
    case TenantFieldsActionTypes.GetTenantFields:
      return {
        ...state,
        loading: true,
        error: undefined,
        operationMsg: action.payload?.msg ? action.payload.msg : null
      };
    case TenantFieldsActionTypes.TenantFieldsError:
      return {
        ...state,
        loading: false,
        error: 'Failed to get tenant fields'
        //action.payload.error
      };
    case TenantFieldsActionTypes.GetTenantFieldsSuccess:
      return {
        ...state,
        page: action.payload,
        loading: false,
        error: undefined
      };
    case TenantFieldsActionTypes.RemoveTenantField:
      return {
        ...state,
        loading: true,
        error: undefined
      };
    case TenantFieldsActionTypes.RemoveTenantFieldSuccess:
      return {
        ...state,
        loading: false,
        operationMsg: action.payload.msg
      };
    case TenantFieldsActionTypes.RemoveTenantFieldFailure:
      return {
        ...state,
        loading: false,
        operationMsg: action.payload.msg
      };
    case TenantFieldsActionTypes.ResetTfOperationMsg:
      return {
        ...state,
        operationMsg: null
      };
    case TenantFieldsActionTypes.AddOrUpdateTenantField:
      return {
        ...state,
        loading: true,
        error: undefined
      };
    case TenantFieldsActionTypes.UpdateManyTenantFields:
      return {
        ...state,
        loading: true
      };
    case TenantFieldsActionTypes.UpdateManyTenantFieldsSuccess:
      return {
        ...state,
        loading: false
      };
    case TenantFieldsActionTypes.UpdateManyTenantFieldsError:
      return {
        ...state,
        loading: false,
        operationMsg: 'Fail' + action.error
      };
    default:
      return state;
  }
}
