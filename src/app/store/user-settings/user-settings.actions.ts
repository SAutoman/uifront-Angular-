/**
 * global
 */
import { Action } from '@ngrx/store';

/**
 * project
 */
import { SettingsPerGroup } from '@wfm/service-layer';

/**
 * local
 */

export enum UserSettingsActionTypes {
  GetSharedUserSettingsPerGroupAction = '[Tenant Settings] Get Shared UserSettings Per Group Action',
  GetSharedUserSettingsPerGroupActionSuccess = '[Tenant Settings] Get Shared UserSettings Per Group Action Success',
  GetSharedUserSettingsPerGroupActionFail = '[Tenant Settings] Get Shared UserSettings Per Group Action Fail',

  GetSharedUserSettingsPerRoles = '[Tenant Settings] Get Shared UserSettings Per Roles Action',
  GetSharedUserSettingsPerRolesSuccess = '[Tenant Settings] Get Shared UserSettings Per Roles Action Success',
  GetSharedUserSettingsPerRolesFail = '[Tenant Settings] Get Shared UserSettings Per Roles Action Fail',

  ResetSharedUserSettingsAction = '[Tenant Settings] Reset Shared User Settings Action'
}

export class GetSharedUserSettingsPerGroupAction implements Action {
  readonly type = UserSettingsActionTypes.GetSharedUserSettingsPerGroupAction;
  constructor(
    public payload: {
      tenantId: string;
      groupId: string;
    }
  ) {}
}

export class GetSharedUserSettingsPerGroupActionSuccess implements Action {
  readonly type = UserSettingsActionTypes.GetSharedUserSettingsPerGroupActionSuccess;
  constructor(public payload: SettingsPerGroup) {}
}

export class GetSharedUserSettingsPerGroupActionFail implements Action {
  readonly type = UserSettingsActionTypes.GetSharedUserSettingsPerGroupActionFail;
  constructor(public payload: { error: string }) {}
}

export class GetSharedUserSettingsPerRoles implements Action {
  readonly type = UserSettingsActionTypes.GetSharedUserSettingsPerRoles;
  constructor(
    public payload: {
      tenantId: string;
    }
  ) {}
}

export class GetSharedUserSettingsPerRolesSuccess implements Action {
  readonly type = UserSettingsActionTypes.GetSharedUserSettingsPerRolesSuccess;
  constructor(public payload: SettingsPerGroup[]) {}
}

export class GetSharedUserSettingsPerRolesFail implements Action {
  readonly type = UserSettingsActionTypes.GetSharedUserSettingsPerRolesFail;
  constructor(public payload: { error: string }) {}
}

export class ResetSharedUserSettingsAction implements Action {
  readonly type = UserSettingsActionTypes.ResetSharedUserSettingsAction;
  constructor() {}
}

export type UserSettingsActions =
  | GetSharedUserSettingsPerGroupAction
  | GetSharedUserSettingsPerGroupActionSuccess
  | GetSharedUserSettingsPerGroupActionFail
  | GetSharedUserSettingsPerRoles
  | GetSharedUserSettingsPerRolesSuccess
  | GetSharedUserSettingsPerRolesFail
  | ResetSharedUserSettingsAction;
