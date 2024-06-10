import { WebHookData } from '@wfm/service-layer/models/webHooks';
import { WebhookBuilderActions, WebHookBuilderActionTypes } from './webhooks-builder-actions';

export interface WebHookBuilderState {
  loading: boolean;
  webHookDetailById: WebHookData;
  webHooksList: WebHookData[];
  webHooksOperationMessage: string;
  webHookFields: string[];
}

export const initialWebHookBuilderState: WebHookBuilderState = {
  loading: false,
  webHookDetailById: null,
  webHooksList: null,
  webHooksOperationMessage: null,
  webHookFields: null
};

export function webHooksBuilderReducer(state = initialWebHookBuilderState, action: WebhookBuilderActions): WebHookBuilderState {
  switch (action.type) {
    case WebHookBuilderActionTypes.GetWebHookDetailsById:
      return {
        ...state,
        loading: true
      };
    case WebHookBuilderActionTypes.GetWebHookDetailsByIdSuccess:
      return {
        ...state,
        loading: false,
        webHookDetailById: action.payload.data
      };
    case WebHookBuilderActionTypes.GetWebHookDetailsByIdFailed:
      return {
        ...state,
        loading: false,
        webHooksOperationMessage: 'Fail' + action.payload.error
      };
    case WebHookBuilderActionTypes.GetWebHooks:
      return {
        ...state,
        loading: true
      };
    case WebHookBuilderActionTypes.GetWebHooksSuccess:
      return {
        ...state,
        loading: false,
        webHooksList: action.payload.data
      };
    case WebHookBuilderActionTypes.GetWebHooksFailed:
      return {
        ...state,
        loading: false,
        webHooksOperationMessage: 'Fail' + action.payload.error
      };
    case WebHookBuilderActionTypes.AddWebHook:
      return {
        ...state,
        loading: true
      };
    case WebHookBuilderActionTypes.AddWebHookSuccess:
      return {
        ...state,
        loading: false
      };
    case WebHookBuilderActionTypes.AddWebHookFailed:
      return {
        ...state,
        loading: false,
        webHooksOperationMessage: 'Fail' + action.payload.error
      };
    case WebHookBuilderActionTypes.ResetWebHookOperationMsg:
      return {
        ...state,
        webHooksOperationMessage: null
      };
    case WebHookBuilderActionTypes.DeleteWebHook:
      return {
        ...state,
        loading: true
      };
    case WebHookBuilderActionTypes.DeleteWebHookSuccess:
      return {
        ...state,
        loading: false,
        webHooksOperationMessage: action.payload.msg
      };
    case WebHookBuilderActionTypes.DeleteWebHookFailed:
      return {
        ...state,
        loading: false,
        webHooksOperationMessage: 'Fail' + action.payload.error
      };
    case WebHookBuilderActionTypes.UpdateWebHook:
      return {
        ...state,
        loading: true
      };
    case WebHookBuilderActionTypes.UpdateWebHookSuccess:
      return {
        ...state,
        loading: false,
        webHooksOperationMessage: action.payload.msg
      };
    case WebHookBuilderActionTypes.UpdateWebHookFailed:
      return {
        ...state,
        loading: false,
        webHooksOperationMessage: 'Fail' + action.payload.error
      };
    case WebHookBuilderActionTypes.ResetWebHookDetails:
      return {
        ...state,
        webHookDetailById: null
      };
    case WebHookBuilderActionTypes.GetWebHookFieldsSuccess:
      return {
        ...state,
        webHookFields: action.payload.data
      };
    case WebHookBuilderActionTypes.GetWebHookFieldsFailure:
      return {
        ...state,
        webHooksOperationMessage: 'Fail' + action.payload.error
      };
    default:
      return state;
  }
}
