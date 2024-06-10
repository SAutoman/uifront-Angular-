import { Action } from '@ngrx/store';
import { ApiClientsList, CreateApiClient } from '@wfm/service-layer/models/api-clients';

export enum ApiClientsActionTypes {
  GetApiClients = '[API Clients] Get ApiClients List',
  GetApiClientsSuccess = '[API Clients] Get ApiClients List Success',
  GetApiClientsFailed = '[API Clients] Get ApiClients List Failed',

  AddApiClient = '[API Clients] Add Api Client',
  AddApiClientSuccess = '[API Clients] Add Api Client Success',
  AddApiClientFailed = '[API Clients] Add Api Client Failed',

  ResetApiClientOperationMsg = '[API Clients] API Client Reset Operation Message',

  DeleteApiClient = '[API Clients] Delete ApiClient',
  DeleteApiClientSuccess = '[API Clients] Delete ApiClient Success',
  DeleteApiClientFailed = '[API Clients] Delete ApiClient Failed'
}

export class GetApiClients implements Action {
  readonly type = ApiClientsActionTypes.GetApiClients;
  constructor() {}
}

export class GetApiClientsSuccess implements Action {
  readonly type = ApiClientsActionTypes.GetApiClientsSuccess;
  constructor(public payload: { data: ApiClientsList[] }) {}
}

export class GetApiClientsFailed implements Action {
  readonly type = ApiClientsActionTypes.GetApiClientsFailed;
  constructor(public payload: { error: string }) {}
}

export class AddApiClient implements Action {
  readonly type = ApiClientsActionTypes.AddApiClient;
  constructor(public payload: { data: CreateApiClient }) {}
}

export class AddApiClientsuccess implements Action {
  readonly type = ApiClientsActionTypes.AddApiClientSuccess;
  constructor() {}
}

export class AddApiClientFailed implements Action {
  readonly type = ApiClientsActionTypes.AddApiClientFailed;
  constructor(public payload: { error: string }) {}
}

export class ResetApiClientOperationMsg implements Action {
  readonly type = ApiClientsActionTypes.ResetApiClientOperationMsg;
  constructor() {}
}

export class DeleteApiClient implements Action {
  readonly type = ApiClientsActionTypes.DeleteApiClient;
  constructor(public payload: { id: string }) {}
}

export class DeleteApiClientsuccess implements Action {
  readonly type = ApiClientsActionTypes.DeleteApiClientSuccess;
  constructor(public payload: { msg: string }) {}
}

export class DeleteApiClientFailed implements Action {
  readonly type = ApiClientsActionTypes.DeleteApiClientFailed;
  constructor(public payload: { error: string }) {}
}

export type ApiClientsActions =
  | GetApiClients
  | GetApiClientsSuccess
  | GetApiClientsFailed
  | AddApiClient
  | AddApiClientsuccess
  | AddApiClientFailed
  | ResetApiClientOperationMsg
  | DeleteApiClient
  | DeleteApiClientsuccess
  | DeleteApiClientFailed;
