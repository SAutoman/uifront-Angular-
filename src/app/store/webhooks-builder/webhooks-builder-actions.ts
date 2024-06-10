import { Action } from '@ngrx/store';
import { Paging, Sorting } from '@wfm/service-layer';
import { WebHook, WebHookData } from '@wfm/service-layer/models/webHooks';

export enum WebHookBuilderActionTypes {
  GetWebHookDetailsById = '[WebHookBuilder] Get WebHook Details',
  GetWebHookDetailsByIdSuccess = '[WebHookBuilder] Get WebHook Details Success',
  GetWebHookDetailsByIdFailed = '[WebHookBuilder] Get WebHook Details Failed',

  GetWebHooks = '[WebHookBuilder] Get WebHooks List',
  GetWebHooksSuccess = '[WebHookBuilder] Get WebHooks List Success',
  GetWebHooksFailed = '[WebHookBuilder] Get WebHooks List Failed',

  AddWebHook = '[WebHookBuilder] Add WebHook',
  AddWebHookSuccess = '[WebHookBuilder] Add WebHook Success',
  AddWebHookFailed = '[WebHookBuilder] Add WebHook Failed',

  ResetWebHookOperationMsg = '[WebHookBuilder] WebHook Builder Reset Operation Message',

  DeleteWebHook = '[WebHookBuilder] Delete WebHook',
  DeleteWebHookSuccess = '[WebHookBuilder] Delete WebHook Success',
  DeleteWebHookFailed = '[WebHookBuilder] Delete WebHook Failed',

  UpdateWebHook = '[WebHookBuilder] Update WebHook',
  UpdateWebHookSuccess = '[WebHookBuilder] Update WebHook Success',
  UpdateWebHookFailed = '[WebHookBuilder] Update WebHook Failed',

  ResetWebHookDetails = '[WebHookBuilder] Reset WebHook Detail By Id',

  GetWebHookFields = '[WebHookBuilder] Get WebHook Fields',
  GetWebHookFieldsSuccess = '[WebHookBuilder] Get WebHook Fields Success',
  GetWebHookFieldsFailure = '[WebHookBuilder] Get WebHook Fields Failure'
}

export class GetWebHookDetailsById implements Action {
  readonly type = WebHookBuilderActionTypes.GetWebHookDetailsById;
  constructor(public payload: { data: { id: string } }) {}
}

export class GetWebHookDetailsByIdSuccess implements Action {
  readonly type = WebHookBuilderActionTypes.GetWebHookDetailsByIdSuccess;
  constructor(public payload: { data: WebHookData }) {}
}

export class GetWebHookDetailsByIdFailed implements Action {
  readonly type = WebHookBuilderActionTypes.GetWebHookDetailsByIdFailed;
  constructor(public payload: { error: string }) {}
}

export class GetWebHooks implements Action {
  readonly type = WebHookBuilderActionTypes.GetWebHooks;
  constructor(public payload: { data: { paging: Paging; sorting?: Sorting[] } }) {}
}

export class GetWebHooksSuccess implements Action {
  readonly type = WebHookBuilderActionTypes.GetWebHooksSuccess;
  constructor(public payload: { data: WebHookData[] }) {}
}

export class GetWebHooksFailed implements Action {
  readonly type = WebHookBuilderActionTypes.GetWebHooksFailed;
  constructor(public payload: { error: string }) {}
}

export class AddWebHook implements Action {
  readonly type = WebHookBuilderActionTypes.AddWebHook;
  constructor(public payload: { data: WebHook }) {}
}

export class AddWebHookSuccess implements Action {
  readonly type = WebHookBuilderActionTypes.AddWebHookSuccess;
  constructor() {}
}

export class AddWebHookFailed implements Action {
  readonly type = WebHookBuilderActionTypes.AddWebHookFailed;
  constructor(public payload: { error: string }) {}
}

export class ResetWebHookOperationMsg implements Action {
  readonly type = WebHookBuilderActionTypes.ResetWebHookOperationMsg;
  constructor() {}
}

export class DeleteWebHook implements Action {
  readonly type = WebHookBuilderActionTypes.DeleteWebHook;
  constructor(public payload: { id: string }) {}
}

export class DeleteWebHookSuccess implements Action {
  readonly type = WebHookBuilderActionTypes.DeleteWebHookSuccess;
  constructor(public payload: { msg: string }) {}
}

export class DeleteWebHookFailed implements Action {
  readonly type = WebHookBuilderActionTypes.DeleteWebHookFailed;
  constructor(public payload: { error: string }) {}
}

export class UpdateWebHook implements Action {
  readonly type = WebHookBuilderActionTypes.UpdateWebHook;
  constructor(public payload: { data: WebHook; webHookId: string }) {}
}

export class UpdateWebHookSuccess implements Action {
  readonly type = WebHookBuilderActionTypes.UpdateWebHookSuccess;
  constructor(public payload: { msg: string }) {}
}

export class UpdateWebHookFailed implements Action {
  readonly type = WebHookBuilderActionTypes.UpdateWebHookFailed;
  constructor(public payload: { error: string }) {}
}

export class ResetWebHookDetails implements Action {
  readonly type = WebHookBuilderActionTypes.ResetWebHookDetails;
  constructor() {}
}

export class GetWebHookFields implements Action {
  readonly type = WebHookBuilderActionTypes.GetWebHookFields;
  constructor(public payload: { workflowSchemaId: string }) {}
}

export class GetWebHookFieldsSuccess implements Action {
  readonly type = WebHookBuilderActionTypes.GetWebHookFieldsSuccess;
  constructor(public payload: { data: string[] }) {}
}

export class GetWebHookFieldsFailure implements Action {
  readonly type = WebHookBuilderActionTypes.GetWebHookFieldsFailure;
  constructor(public payload: { error: string }) {}
}

export type WebhookBuilderActions =
  | GetWebHookDetailsById
  | GetWebHookDetailsByIdSuccess
  | GetWebHookDetailsByIdFailed
  | GetWebHooks
  | GetWebHooksSuccess
  | GetWebHooksFailed
  | AddWebHook
  | AddWebHookSuccess
  | AddWebHookFailed
  | ResetWebHookOperationMsg
  | DeleteWebHook
  | DeleteWebHookSuccess
  | DeleteWebHookFailed
  | UpdateWebHook
  | UpdateWebHookSuccess
  | UpdateWebHookFailed
  | ResetWebHookDetails
  | GetWebHookFields
  | GetWebHookFieldsSuccess
  | GetWebHookFieldsFailure;
