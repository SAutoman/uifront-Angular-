/**
 * global
 */
import { Update } from '@ngrx/entity';
import { Action } from '@ngrx/store';

/**
 * project
 */
import { UserSettingsDto, GridSettings, CardSettings } from '../../service-layer';

/**
 * local
 */

export enum GridLayoutsTypes {
  ApplyGridLayoutAction = '[ApplyGridLayoutAction] Action',

  GetGridLayoutAction = '[GetGridLayoutAction] Action',
  GetGridLayoutActionSuccess = '[GetGridLayoutActionSuccess] Action',
  GetGridLayoutActionFail = '[GetGridLayoutActionFail] Action',

  CreateGridLayoutAction = '[CreateGridLayoutAction] Action',
  CreateGridLayoutActionSuccess = '[CreateGridLayoutActionSuccess] Action',
  CreateGridLayoutActionFail = '[CreateGridLayoutActionFail] Action',

  UpdateGridLayoutAction = '[UpdateGridLayoutAction] Action',
  UpdateGridLayoutActionSuccess = '[UpdateGridLayoutActionSuccess] Action',
  UpdateGridLayoutActionFail = '[UpdateGridLayoutActionFail] Action',

  DeleteGridLayoutAction = '[DeleteGridLayoutAction] Action',
  DeleteGridLayoutActionSuccess = '[DeleteGridLayoutActionSuccess] Action',
  DeleteGridLayoutActionFail = '[DeleteGridLayoutActionFail] Action',

  ClearLayoutsAndSelectedId = '[GridLayouts] ClearLayouts Action',

  ApplyChildGridLayoutAction = '[GridLayouts] Apply Child Grid Layout Action',
  RemoveChildGridLayoutAction = '[GridLayout] Remove Child Grid Layout Action'
}

export class ApplyGridLayoutAction implements Action {
  readonly type = GridLayoutsTypes.ApplyGridLayoutAction;
  constructor(
    public payload: {
      gridConfig?: GridSettings;
      cardConfig?: CardSettings;
      reportGridConfig?: GridSettings;
      settingId?: string;
    }
  ) {}
}

export class ApplyChildGridLayoutAction implements Action {
  readonly type = GridLayoutsTypes.ApplyChildGridLayoutAction;
  constructor(
    public payload: {
      schemaId?: string;
      gridConfig?: GridSettings;
      clearLayouts?: boolean;
    }
  ) {}
}

export class GetGridLayoutAction implements Action {
  readonly type = GridLayoutsTypes.GetGridLayoutAction;
  constructor(
    public payload: {
      tenantId: string;
      userId: string;
      settingName: string;
      refreshList?: boolean;
      isChildGrid?: boolean;
    }
  ) {}
}

export class GetGridLayoutActionSuccess implements Action {
  readonly type = GridLayoutsTypes.GetGridLayoutActionSuccess;
  constructor(public payload: { userSettings: UserSettingsDto; settingKey: string; isChildGrid?: boolean }) {}
}

export class GetGridLayoutActionFail implements Action {
  readonly type = GridLayoutsTypes.GetGridLayoutActionFail;
  constructor(public payload: { error: string }) {}
}

export class CreateGridLayoutAction implements Action {
  readonly type = GridLayoutsTypes.CreateGridLayoutAction;
  constructor(public payload: { tenantId: string; grid: UserSettingsDto }) {}
}

export class CreateGridLayoutActionSuccess implements Action {
  readonly type = GridLayoutsTypes.CreateGridLayoutActionSuccess;
  constructor(public payload: { result: UserSettingsDto }) {}
}

export class CreateGridLayoutActionFail implements Action {
  readonly type = GridLayoutsTypes.CreateGridLayoutActionFail;
  constructor(public payload: { error: string }) {}
}

export class UpdateGridLayoutAction implements Action {
  readonly type = GridLayoutsTypes.UpdateGridLayoutAction;
  constructor(public payload: { tenantId: string; layout: UserSettingsDto }) {}
}

export class UpdateGridLayoutActionSuccess implements Action {
  readonly type = GridLayoutsTypes.UpdateGridLayoutActionSuccess;
  constructor(public payload: { update: Update<UserSettingsDto> }) {}
}

export class UpdateGridLayoutActionFail implements Action {
  readonly type = GridLayoutsTypes.UpdateGridLayoutActionFail;
  constructor(public payload: { error: string }) {}
}

export class DeleteGridLayoutAction implements Action {
  readonly type = GridLayoutsTypes.DeleteGridLayoutAction;
  constructor(public payload: { tenantId: string; settingId: string }) {}
}

export class DeleteGridLayoutActionSuccess implements Action {
  readonly type = GridLayoutsTypes.DeleteGridLayoutActionSuccess;
  constructor(public payload: { id: string }) {}
}

export class DeleteGridLayoutActionFail implements Action {
  readonly type = GridLayoutsTypes.DeleteGridLayoutActionFail;
  constructor(public payload: { error: string }) {}
}

export class ClearLayoutsAndSelectedId implements Action {
  readonly type = GridLayoutsTypes.ClearLayoutsAndSelectedId;
  constructor() {}
}

// Action called when child grid gets destroyed
export class RemoveChildGridLayoutAction implements Action {
  readonly type = GridLayoutsTypes.RemoveChildGridLayoutAction;
  constructor(
    public payload: {
      settingName: string;
      schemaId: string;
    }
  ) {}
}

export type GridLayoutActions =
  | ApplyGridLayoutAction
  | GetGridLayoutAction
  | GetGridLayoutActionSuccess
  | GetGridLayoutActionFail
  | CreateGridLayoutAction
  | CreateGridLayoutActionSuccess
  | CreateGridLayoutActionFail
  | UpdateGridLayoutAction
  | UpdateGridLayoutActionSuccess
  | UpdateGridLayoutActionFail
  | DeleteGridLayoutAction
  | DeleteGridLayoutActionSuccess
  | DeleteGridLayoutActionFail
  | ClearLayoutsAndSelectedId
  | ApplyChildGridLayoutAction
  | RemoveChildGridLayoutAction;
