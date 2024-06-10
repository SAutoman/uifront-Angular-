import { ApiClientsList } from '@wfm/service-layer/models/api-clients';
import { ApiClientsActions, ApiClientsActionTypes } from './api-clients-actions';

export interface ApiClientState {
  loading: boolean;
  apiClientsList: ApiClientsList[];
  apiClientOperationMessage: string;
}

export const initialApiClientState: ApiClientState = {
  loading: false,
  apiClientsList: null,
  apiClientOperationMessage: null
};

export function apiClientReducer(state = initialApiClientState, action: ApiClientsActions): ApiClientState {
  switch (action.type) {
    case ApiClientsActionTypes.GetApiClients:
      return {
        ...state,
        loading: true
      };
    case ApiClientsActionTypes.GetApiClientsSuccess:
      return {
        ...state,
        loading: false,
        apiClientsList: action.payload.data
      };
    case ApiClientsActionTypes.GetApiClientsFailed:
      return {
        ...state,
        loading: false,
        apiClientOperationMessage: action.payload.error
      };
    case ApiClientsActionTypes.AddApiClient:
      return {
        ...state,
        loading: true
      };
    case ApiClientsActionTypes.AddApiClientSuccess:
      return {
        ...state,
        loading: false,
        apiClientOperationMessage: 'API Client Added Successfully'
      };
    case ApiClientsActionTypes.AddApiClientFailed:
      return {
        ...state,
        loading: false,
        apiClientOperationMessage: 'Fail' + action.payload.error
      };
    case ApiClientsActionTypes.ResetApiClientOperationMsg:
      return {
        ...state,
        apiClientOperationMessage: null
      };
    case ApiClientsActionTypes.DeleteApiClient:
      return {
        ...state,
        loading: true
      };
    case ApiClientsActionTypes.DeleteApiClientSuccess:
      return {
        ...state,
        loading: false,
        apiClientOperationMessage: action.payload.msg
      };
    case ApiClientsActionTypes.DeleteApiClientFailed:
      return {
        ...state,
        loading: false,
        apiClientOperationMessage: action.payload.error
      };
    default:
      return state;
  }
}
