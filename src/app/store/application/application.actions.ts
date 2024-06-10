import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';

import { PagedData, WfmApplication } from '../../service-layer';
import { ApplicationSearchQuery } from './application.reducer';

export enum ApplicationActionTypes {
  CreateApplication = '[Application] Create',
  CreateApplicationSuccess = '[Application] Insert Success',
  CreateApplicationFail = '[Application] Insert Fail',

  SearchAllApplicationEntities = '[Application] Search',
  SearchAllApplicationEntitiesSuccess = '[Application] Search Success',
  SearchAllApplicationEntitiesFail = '[Application] Search Fail',

  LoadApplicationById = '[Application] Load By ID',
  LoadApplicationByIdSuccess = '[Application] Load Success',
  LoadApplicationByIdFail = '[Application] Load Fail',

  UpdateApplication = '[Application] Update',
  UpdateApplicationSuccess = '[Application] Update Success',
  UpdateApplicationFail = '[Application] Update Fail',

  DeleteApplicationById = '[Application] Delete By ID',
  DeleteApplicationByIdSuccess = '[Application] Delete Success',
  DeleteApplicationByIdFail = '[Application] Delete Fail',

  SetSearchQuery = '[Application] Set Search Query',
  SelectApplicationById = '[Application] Select By ID'
}

// ========================================= CREATE

export class CreateApplication implements Action {
  readonly type = ApplicationActionTypes.CreateApplication;
  constructor(public payload: { application: WfmApplication }) {}
}

export class CreateApplicationSuccess implements Action {
  readonly type = ApplicationActionTypes.CreateApplicationSuccess;
  constructor(public payload: { result: WfmApplication }) {}
}

export class CreateApplicationFail implements Action {
  readonly type = ApplicationActionTypes.CreateApplicationFail;
  constructor(public payload: { error: string }) {}
}

// ========================================= SEARCH

export class SearchAllApplicationEntities implements Action {
  readonly type = ApplicationActionTypes.SearchAllApplicationEntities;
}

export class SearchAllApplicationEntitiesSuccess implements Action {
  readonly type = ApplicationActionTypes.SearchAllApplicationEntitiesSuccess;
  constructor(public payload: { result: PagedData<WfmApplication> }) {}
}

export class SearchAllApplicationEntitiesFail implements Action {
  readonly type = ApplicationActionTypes.SearchAllApplicationEntitiesFail;
  constructor(public payload: { error: string }) {}
}

// ========================================= LOAD BY ID
export class LoadApplicationById implements Action {
  readonly type = ApplicationActionTypes.LoadApplicationById;
  constructor(public payload: { id: string }) {}
}

export class LoadApplicationByIdSuccess implements Action {
  readonly type = ApplicationActionTypes.LoadApplicationByIdSuccess;
  constructor(public payload: { result: WfmApplication }) {}
}

export class LoadApplicationByIdFail implements Action {
  readonly type = ApplicationActionTypes.LoadApplicationByIdFail;
  constructor(public payload: { error: string }) {}
}

// ========================================= UPDATE

export class UpdateApplication implements Action {
  readonly type = ApplicationActionTypes.UpdateApplication;
  constructor(public payload: { application: WfmApplication }) {}
}

export class UpdateApplicationSuccess implements Action {
  readonly type = ApplicationActionTypes.UpdateApplicationSuccess;
  constructor(public payload: { update: Update<WfmApplication> }) {}
}

export class UpdateApplicationFail implements Action {
  readonly type = ApplicationActionTypes.UpdateApplicationFail;
  constructor(public payload: { error: string }) {}
}

// ========================================= DELETE

export class DeleteApplicationById implements Action {
  readonly type = ApplicationActionTypes.DeleteApplicationById;
  constructor(public payload: { id: string }) {}
}

export class DeleteApplicationByIdSuccess implements Action {
  readonly type = ApplicationActionTypes.DeleteApplicationByIdSuccess;
  constructor(public payload: { id: string }) {}
}

export class DeleteApplicationByIdFail implements Action {
  readonly type = ApplicationActionTypes.DeleteApplicationByIdFail;
  constructor(public payload: { error: string }) {}
}

// ========================================= QUERY

export class SetApplicationSearchQuery implements Action {
  readonly type = ApplicationActionTypes.SetSearchQuery;
  constructor(public payload: Partial<ApplicationSearchQuery>) {}
}

// ========================================= SELECTED ID

export class SelectApplicationById implements Action {
  readonly type = ApplicationActionTypes.SelectApplicationById;
  constructor(public payload: { id: string }) {}
}

export type ApplicationActions =
  | CreateApplication
  | CreateApplicationSuccess
  | CreateApplicationFail
  | SearchAllApplicationEntities
  | SearchAllApplicationEntitiesSuccess
  | SearchAllApplicationEntitiesFail
  | LoadApplicationById
  | LoadApplicationByIdSuccess
  | LoadApplicationByIdFail
  | UpdateApplication
  | UpdateApplicationSuccess
  | UpdateApplicationFail
  | DeleteApplicationById
  | DeleteApplicationByIdSuccess
  | DeleteApplicationByIdFail
  | SetApplicationSearchQuery
  | SelectApplicationById;
