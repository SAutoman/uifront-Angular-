/**
 * global
 */
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';

/**
 * project
 */

import { Tenant } from '../../service-layer';

/**
 * local
 */

import {
  FetchTenantsPayload,
  FetchTenantsSuccessPayload,
  CreateTenantPayload,
  LoadTenantByIdPayload,
  FetchTenantsFailPayload,
  LoadTenantsByIdSuccessPayload
} from './payload-models';
import { TenantsSearchQuery } from './tenants.reducer';

export enum TenantsActionTypes {
  CreateTenants = '[Tenants] Create',
  CreateTenantsSuccess = '[Tenants] Insert Success',
  CreateTenantsFail = '[Tenants] Insert Fail',

  FetchTenants = '[Tenants] Fetch',
  FetchTenantsSuccess = '[Tenants] Fetch Success',
  FetchTenantsFail = '[Tenants] Fetch Fail',

  LoadTenantsById = '[Tenants] Load By ID',
  LoadTenantsByIdSuccess = '[Tenants] Load Success',
  LoadTenantsByIdFail = '[Tenants] Load Fail',

  UpdateTenants = '[Tenants] Update',
  UpdateTenantsSuccess = '[Tenants] Update Success',
  UpdateTenantsFail = '[Tenants] Update Fail',

  DeleteTenantsById = '[Tenants] Delete By ID',
  DeleteTenantsByIdSuccess = '[Tenants] Delete Success',
  DeleteTenantsByIdFail = '[Tenants] Delete Fail',

  SetSearchQuery = '[Tenants] Set Search Query',
  SelectTenantsById = '[Tenants] Select By ID',

  ResetLoadedTenant = '[Tenants] Reset loaded tenant',
  ResetOperationMsg = '[Tenants] Reset Operation Msg',
  ResetTenantListPageViewModel = '[Tenants] Reset Tenant List Page View Model',

  CopyTenantData = '[Tenants] Copy Tenant Data',
  CopyTenantDataSuccess = '[Tenants] Copy Tenant Data Success',
  CopyTenantDataFailed = '[Tenants] Copy Tenant Data Failed'
}

// base action
class BaseAction<TPayload> implements Action {
  constructor(public type: string, public payload: TPayload) {}
}

// ========================================= CREATE
export class CreateTenants extends BaseAction<CreateTenantPayload> {
  constructor(payload: CreateTenantPayload, public copiedTenantId: string) {
    super(TenantsActionTypes.CreateTenants, payload);
  }
}

export class CreateTenantsSuccess implements Action {
  readonly type = TenantsActionTypes.CreateTenantsSuccess;
  constructor(public payload: { result: Tenant; msg: string }) {}
}

export class CreateTenantsFail implements Action {
  readonly type = TenantsActionTypes.CreateTenantsFail;
  constructor(public payload: { error: string }) {}
}

// ========================================= FETCH TENANTS
export class FetchTenants extends BaseAction<FetchTenantsPayload> {
  constructor(payload: FetchTenantsPayload) {
    super(TenantsActionTypes.FetchTenants, payload);
  }
}

export class FetchTenantsSuccess extends BaseAction<FetchTenantsSuccessPayload> {
  constructor(payload: FetchTenantsSuccessPayload) {
    super(TenantsActionTypes.FetchTenantsSuccess, payload);
  }
}

export class FetchTenantsFail extends BaseAction<FetchTenantsFailPayload> {
  constructor(payload: FetchTenantsFailPayload) {
    super(TenantsActionTypes.FetchTenantsFail, payload);
  }
}

// ========================================= LOAD BY ID
export class LoadTenantsById extends BaseAction<LoadTenantByIdPayload> {
  constructor(payload: LoadTenantByIdPayload) {
    super(TenantsActionTypes.LoadTenantsById, payload);
  }
}

export class LoadTenantsByIdSuccess extends BaseAction<LoadTenantsByIdSuccessPayload> {
  constructor(payload: LoadTenantsByIdSuccessPayload) {
    super(TenantsActionTypes.LoadTenantsByIdSuccess, payload);
  }
}

export class LoadTenantsByIdFail implements Action {
  readonly type = TenantsActionTypes.LoadTenantsByIdFail;
  constructor(public payload: { error: string }) {}
}

// ========================================= UPDATE

export class UpdateTenants implements Action {
  readonly type = TenantsActionTypes.UpdateTenants;
  constructor(public payload: { tenants: Tenant }) {}
}

export class UpdateTenantsSuccess implements Action {
  readonly type = TenantsActionTypes.UpdateTenantsSuccess;
  constructor(public payload: { update: Update<Tenant>; msg: string }) {}
}

export class UpdateTenantsFail implements Action {
  readonly type = TenantsActionTypes.UpdateTenantsFail;
  constructor(public payload: { error: string }) {}
}

// ========================================= DELETE

export class DeleteTenantsById implements Action {
  readonly type = TenantsActionTypes.DeleteTenantsById;
  constructor(public payload: { id: string }) {}
}

export class DeleteTenantsByIdSuccess implements Action {
  readonly type = TenantsActionTypes.DeleteTenantsByIdSuccess;
  constructor(public payload: { id: string; msg: string }) {}
}

export class DeleteTenantsByIdFail implements Action {
  readonly type = TenantsActionTypes.DeleteTenantsByIdFail;
  constructor(public payload: { error: string }) {}
}

// ========================================= QUERY

export class SetTenantsSearchQuery implements Action {
  readonly type = TenantsActionTypes.SetSearchQuery;
  constructor(public payload: Partial<TenantsSearchQuery>) {}
}

// ========================================= SELECTED ID

export class SelectTenantsById implements Action {
  readonly type = TenantsActionTypes.SelectTenantsById;
  constructor(public payload: { id: string }) {}
}

// Reset loaded tenant

export class ResetLoadedTenant implements Action {
  readonly type = TenantsActionTypes.ResetLoadedTenant;
  constructor() {}
}

export class ResetTenantOperationMsg implements Action {
  readonly type = TenantsActionTypes.ResetOperationMsg;
  constructor() {}
}

export class ResetTenantListPageViewModel implements Action {
  readonly type = TenantsActionTypes.ResetTenantListPageViewModel;
  constructor() {}
}

export class CopyTenantData implements Action {
  readonly type = TenantsActionTypes.CopyTenantData;
  constructor(public newTenantId: string, public copiedTenantId: string) {}
}

export class CopyTenantDataSuccess implements Action {
  readonly type = TenantsActionTypes.CopyTenantDataSuccess;
  constructor(public payload: { msg: string }) {}
}

export class CopyTenantDataFailed implements Action {
  readonly type = TenantsActionTypes.CopyTenantDataFailed;
  constructor(public payload: { error: string }) {}
}

export type TenantsActions =
  | CreateTenants
  | CreateTenantsSuccess
  | CreateTenantsFail
  | FetchTenants
  | FetchTenantsSuccess
  | FetchTenantsFail
  | LoadTenantsById
  | LoadTenantsByIdSuccess
  | LoadTenantsByIdFail
  | UpdateTenants
  | UpdateTenantsSuccess
  | UpdateTenantsFail
  | DeleteTenantsById
  | DeleteTenantsByIdSuccess
  | DeleteTenantsByIdFail
  | SetTenantsSearchQuery
  | SelectTenantsById
  | ResetLoadedTenant
  | ResetTenantOperationMsg
  | ResetTenantListPageViewModel
  | CopyTenantData
  | CopyTenantDataSuccess
  | CopyTenantDataFailed;
