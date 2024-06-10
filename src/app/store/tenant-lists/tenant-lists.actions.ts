import { Action } from '@ngrx/store';
import { IConfigurableListItem } from '@wfm/common/models';
import { SearchFieldModel } from '@wfm/service-layer/models/dynamic-entity-models';

import { PagedData, Paging, Sorting } from '@wfm/service-layer';

export enum TenantListsActionTypes {
  GetTenantLists = '[TenantListsActionTypes] GetTenantLists',
  GetTenantListsSuccess = '[TenantListsActionTypes] GetTenantListsSuccess',
  TenantListsError = '[TenantListsActionTypes] TenantListsError',

  RemoveTenantList = '[TenantListsActionTypes] RemoveTenantList',
  RemoveTenantListSuccess = '[TenantListsActionTypes] RemoveTenantListSuccess',

  AddOrUpdateTenantList = '[TenantListsActionTypes] AddOrUpdateTenantList',
  AddOrUpdateTenantListSuccess = '[TenantListsActionTypes] AddOrUpdateTenantListSuccess'
}

export class GetTenantLists implements Action {
  readonly type = TenantListsActionTypes.GetTenantLists;
  constructor(
    public payload: {
      paging?: Paging;
      sorting?: Sorting[];
      filters?: SearchFieldModel[];
    } = {}
  ) {}
}

export class GetTenantListsSuccess implements Action {
  readonly type = TenantListsActionTypes.GetTenantListsSuccess;
  constructor(public payload: PagedData<IConfigurableListItem>) {}
}

export class RemoveTenantList implements Action {
  readonly type = TenantListsActionTypes.RemoveTenantList;
  constructor(public payload: { id: string }) {}
}
export class RemoveTenantListSuccess implements Action {
  readonly type = TenantListsActionTypes.RemoveTenantListSuccess;
  constructor(public payload: { id: string }) {}
}

export class TenantListsError implements Action {
  readonly type = TenantListsActionTypes.TenantListsError;
  constructor(public payload: { error: string }) {
    console.error('TenantListsError', payload);
  }
}
export class AddOrUpdateTenantList implements Action {
  readonly type = TenantListsActionTypes.AddOrUpdateTenantList;
  isUpdate?: boolean;
  constructor(
    public payload: {
      item: IConfigurableListItem;
      refresh?: boolean;
    }
  ) {}
}
export class AddOrUpdateTenantListSuccess implements Action {
  readonly type = TenantListsActionTypes.AddOrUpdateTenantListSuccess;
  constructor(
    public payload: {
      item: IConfigurableListItem;
      isUpdate: boolean;
    }
  ) {}
}

export type TenantFieldsActions =
  | GetTenantLists
  | GetTenantListsSuccess
  | TenantListsError
  | RemoveTenantList
  | RemoveTenantListSuccess
  | AddOrUpdateTenantList
  | AddOrUpdateTenantListSuccess;
