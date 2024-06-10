import { Action } from '@ngrx/store';
import { IConfigurableListItem } from '@wfm/common/models';

import { IUpdateTenantFieldDto, PagedData } from '@wfm/service-layer';

export enum TenantFieldsActionTypes {
  GetTenantFields = '[TenantFieldsActionTypes] GetTenantFields',
  GetTenantFieldsSuccess = '[TenantFieldsActionTypes] GetTenantFieldsSuccess',
  TenantFieldsError = '[TenantFieldsActionTypes] TenantFieldsError',

  RemoveTenantField = '[TenantFieldsActionTypes] RemoveTenantField',
  RemoveTenantFieldSuccess = '[TenantFieldsActionTypes] RemoveTenantField Success',
  RemoveTenantFieldFailure = '[TenantFieldsActionTypes] RemoveTenantField Failure',

  AddOrUpdateTenantField = '[TenantFieldsActionTypes] AddOrUpdateTenantField',

  UpdateManyTenantFields = '[TenantFieldsActionTypes] UpdateManyTenantFields',
  UpdateManyTenantFieldsSuccess = '[TenantFieldsActionTypes] UpdateManyTenantFieldsSuccess',
  UpdateManyTenantFieldsError = '[TenantFieldsActionTypes] UpdateManyTenantFieldsError',

  ResetTfOperationMsg = '[TenantFieldsActionTypes] Reset Operation msg'
}

export class GetTenantFields implements Action {
  readonly type = TenantFieldsActionTypes.GetTenantFields;
  constructor(public payload: { tenantId: string; msg?: string }) {}
}

export class GetTenantFieldsSuccess implements Action {
  readonly type = TenantFieldsActionTypes.GetTenantFieldsSuccess;
  constructor(public payload: PagedData<IConfigurableListItem>) {}
}

export class RemoveTenantField implements Action {
  readonly type = TenantFieldsActionTypes.RemoveTenantField;
  constructor(public payload: { id: string; tenantId: string }) {}
}

export class RemoveTenantFieldSuccess implements Action {
  readonly type = TenantFieldsActionTypes.RemoveTenantFieldSuccess;
  constructor(public payload: { msg: string }) {}
}

export class RemoveTenantFieldFailure implements Action {
  readonly type = TenantFieldsActionTypes.RemoveTenantFieldFailure;
  constructor(public payload: { msg: string }) {}
}

export class TenantFieldsError implements Action {
  readonly type = TenantFieldsActionTypes.TenantFieldsError;
  constructor(public payload: { error: string }) {}
}
export class AddOrUpdateTenantField implements Action {
  readonly type = TenantFieldsActionTypes.AddOrUpdateTenantField;
  isUpdate?: boolean;
  constructor(
    public payload: {
      item: IConfigurableListItem;
      tenantId: string;
    }
  ) {}
}

export class UpdateManyTenantFields implements Action {
  readonly type = TenantFieldsActionTypes.UpdateManyTenantFields;
  constructor(
    public payload: {
      tenantId: string;
      changedItems: IUpdateTenantFieldDto[];
    }
  ) {}
}

export class UpdateManyTenantFieldsSuccess implements Action {
  readonly type = TenantFieldsActionTypes.UpdateManyTenantFieldsSuccess;
  constructor(public msg: string) {}
}

export class UpdateManyTenantFieldsError implements Action {
  readonly type = TenantFieldsActionTypes.UpdateManyTenantFieldsError;
  constructor(public error: string) {}
}

export class ResetTfOperationMsg implements Action {
  readonly type = TenantFieldsActionTypes.ResetTfOperationMsg;
  constructor() {}
}

export type TenantFieldsActions =
  | GetTenantFields
  | GetTenantFieldsSuccess
  | TenantFieldsError
  | RemoveTenantField
  | RemoveTenantFieldSuccess
  | RemoveTenantFieldFailure
  | AddOrUpdateTenantField
  | UpdateManyTenantFields
  | UpdateManyTenantFieldsSuccess
  | UpdateManyTenantFieldsError
  | ResetTfOperationMsg;
