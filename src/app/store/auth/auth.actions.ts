/**
 * global
 */
import { Action } from '@ngrx/store';
import { User } from 'oidc-client';

/**
 * project
 */
import { UserProfileResponse, TenantProfile, SettingsUI, Settings, UserGroupsDto } from '@wfm/service-layer';
import { ChildrenItems } from '@wfm/shared/menu-items/menu-items';
import { User as UserDto } from '../../service-layer';

/**
 * local
 */

import { TenantSystem, MenuType } from './auth.reducer';

export interface ITypedAction<T> extends Action {
  payload: T;
}

export enum AuthActionTypes {
  LoginAction = '[Login] Action',
  LogoutAction = '[Logout] Action',
  OAuthLoginAction = '[OAuth] Action',
  OAuthCheckAction = '[OAuthCheck] Action',
  OAuthSuccessAction = '[OAuthSuccess] Action',
  OAuthWaitAction = '[OAuthWait] Action',
  GetUserInfo = '[GetUserInfo] Action',
  GetUserInfoSuccess = '[GetUserInfoSuccess] Action',
  GetUseInfoError = '[GetUserInfoError] Action',
  SetUserTenantAction = '[SetUserTenant] Action',
  SetTenantSettingsAction = '[SetTenantSettings] Action',
  SetUserSettingsByKeyAction = '[SetUserSettingsByKeyAction] Action',
  SetUserErrorMessage = '[SetUserErrorMessage] Action',
  BeginSession = '[BeginSession] Action',
  SetSession = '[SetSession] Action',

  FetchTenantSettings = '[FetchTenantSettings] Action',
  FetchTenantSettingsError = '[FetchTenantSettingsError] Action',

  // FetchUserSettings = '[FetchUserSettings] Action',
  SwitchTenantSystemAction = '[SwitchTenantSystem] Action',

  ChangeMenuAction = '[ChangeMenu] Action',

  RegistrationAction = '[Registration] Action',
  PatchTenantSettingsSection = '[PatchTenantSettingsSection] Action',

  SetOpenedChildMenu = '[SetOpenedChildMenu] Action',

  SetSelectedSearchProfile = '[Set Search Profile] Action',

  FetchWorkflowMenuData = '[Workflow menu data] Fetch Data Action',
  FetchWorkflowMenuDataSuccess = '[Workflow menu data] Fetch Data Action Success',

  SetShowRawDataMenuOption = '[Set Raw Data Menu] Action',
  SetUserInfoNotNeededState = '[SetUserInfoNotNeededState] Action',
  GetGroupsOfUser = '[Get UserGroups] Get Groups Of User',
  GetGroupsOfUserSuccess = '[Get UserGroups] Get Groups Of User Success',

  GetTenantUserGroups = '[UserGroup] Get User Groups Of Tenant',
  GetTenantUserGroupsSuccess = '[UserGroup] Get User Groups Of Tenant Success',

  UpdateUserProfile = '[User] Update user profile',
  UpdateUserProfileSuccess = '[User] Update user profile Success',
  UpdateUserProfileFailed = '[User] Update user profile Failed',

  LoadUserSettings = '[User] Load',
  LoadUserSettingsSuccess = '[User] Load Success',
  LoadUserSettingsFail = '[User] Load Fail',

  SetTranslationLoadedFlag = '[Auth] Set Translation Loaded Flag'
}

export class SetOpenedChildMenuAction implements Action {
  readonly type = AuthActionTypes.SetOpenedChildMenu;
  constructor(public payload: { itemName: string }) {}
}

export class ChangeMenuAction implements Action {
  readonly type = AuthActionTypes.ChangeMenuAction;
  constructor(public payload: { menuType: MenuType }) {}
}

export class BeginSessionAction implements Action {
  readonly type = AuthActionTypes.BeginSession;
}

export class SetSessionAction implements Action {
  readonly type = AuthActionTypes.SetSession;
  constructor(public payload: { sessionId: string }) {}
}

export class SetUserTenantAction implements Action {
  readonly type = AuthActionTypes.SetUserTenantAction;
  constructor(public payload: { tenantSystem: TenantSystem }) {}
}

export class SetTenantSettingsAction implements Action {
  readonly type = AuthActionTypes.SetTenantSettingsAction;
  constructor(public payload: { tenantSettings: SettingsUI[] }) {}
}

export class SetUserSettingsByKeyAction implements Action {
  readonly type = AuthActionTypes.SetUserSettingsByKeyAction;
  constructor(public payload: { userSettings: { [key: string]: SettingsUI } }) {}
}

export class SwitchTenantSystemAction implements Action {
  readonly type = AuthActionTypes.SwitchTenantSystemAction;
  constructor(public payload: { selectedTenantSystem: TenantSystem }) {}
}

export class OAuthCheckAction implements ITypedAction<string> {
  payload: string;
  readonly type = AuthActionTypes.OAuthCheckAction;
  constructor(backUrl: string) {
    this.payload = backUrl;
  }
}

export class OAuthSuccessAction implements Action {
  readonly type = AuthActionTypes.OAuthSuccessAction;

  constructor(public payload: { user: User; backUrl: string }) {}
}
export class OAuthWaitAction implements Action {
  readonly type = AuthActionTypes.OAuthWaitAction;
}

export class GetUserInfoAction implements Action {
  readonly type = AuthActionTypes.GetUserInfo;
  constructor(public payload: { user: User; backUrl: string }) {}
}

export class SetUserErrorMessageAction implements Action {
  readonly type = AuthActionTypes.SetUserErrorMessage;
  constructor(public payload: string) {}
}

export class GetUseInfoSuccessAction implements Action {
  readonly type = AuthActionTypes.GetUserInfoSuccess;
  constructor(
    public payload: {
      userProfile: UserProfileResponse;
      userSettings: { [key: string]: SettingsUI };
      // tenantSettings: SettingsUI[];
    }
  ) {}
}

export class GetUserInfoErrorAction implements Action {
  payload: string;
  readonly type = AuthActionTypes.GetUseInfoError;
  constructor(backUrl: string) {
    this.payload = backUrl;
  }
}

export class Login implements Action {
  readonly type = AuthActionTypes.LoginAction;

  constructor(public payload: { user: User }) {}
}

export class OAuthLogin implements ITypedAction<string> {
  payload: string;

  readonly type = AuthActionTypes.OAuthLoginAction;

  constructor(payload: string) {
    this.payload = payload;
  }
}

export class Logout implements Action {
  readonly type = AuthActionTypes.LogoutAction;
}

export class FetchTenantSettingsAction implements Action {
  readonly type = AuthActionTypes.FetchTenantSettings;
  constructor(public payload: { tenant: TenantProfile; userId: string }) {}
}

export class FetchTenantSettingsErrorAction implements Action {
  readonly type = AuthActionTypes.FetchTenantSettingsError;
  constructor(public payload: string) {}
}
export class PatchTenantSettingsSection implements Action {
  readonly type = AuthActionTypes.PatchTenantSettingsSection;
  constructor(public payload: SettingsUI) {}
}

// export class FetchUserSettingsAction implements Action {
//   readonly type = AuthActionTypes.FetchUserSettings;
//   constructor(public payload: { tenantId: string; userId: string }) {}
// }

export class RegistrationAction implements Action {
  readonly type = AuthActionTypes.RegistrationAction;
}

export class SetSelectedSearchProfile implements Action {
  readonly type = AuthActionTypes.SetSelectedSearchProfile;
  constructor(public payload: { profile: Settings; type: string }) {}
}

export class FetchWorkflowMenuData implements Action {
  readonly type = AuthActionTypes.FetchWorkflowMenuData;
  constructor(public payload: { tenantId: string; userId: string }) {}
}

export class FetchWorkflowMenuDataSuccess implements Action {
  readonly type = AuthActionTypes.FetchWorkflowMenuDataSuccess;
  constructor(
    public payload: {
      searchProfiles: Settings[];
      rawDataItems: ChildrenItems[];
      workflowItems: ChildrenItems[];
      searchMenuItems: ChildrenItems[];
      reportItems: ChildrenItems[];
    }
  ) {}
}

export class SetRawDataMenuOption implements Action {
  readonly type = AuthActionTypes.SetShowRawDataMenuOption;
  constructor(public payload: { showRawData: boolean }) {}
}

export class SetUserInfoNotNeededState implements Action {
  readonly type = AuthActionTypes.SetUserInfoNotNeededState;
  constructor() {}
}

export class GetGroupsOfUser implements Action {
  readonly type = AuthActionTypes.GetGroupsOfUser;
  constructor(
    public payload: {
      tenantId: string;
      userId: string;
    }
  ) {}
}

export class GetGroupsOfUserSuccess implements Action {
  readonly type = AuthActionTypes.GetGroupsOfUserSuccess;
  constructor(
    public payload: {
      groups: UserGroupsDto[];
    }
  ) {}
}

export class GetTenantUserGroups implements Action {
  readonly type = AuthActionTypes.GetTenantUserGroups;
  constructor(public payload: { tenantId: string; skip?: number; take?: number }) {}
}

export class GetTenantUserGroupsSuccess implements Action {
  readonly type = AuthActionTypes.GetTenantUserGroupsSuccess;
  constructor(public groups: UserGroupsDto[]) {}
}

export class UpdateUserProfile implements Action {
  readonly type = AuthActionTypes.UpdateUserProfile;
  constructor(public payload: { user: UserDto; companyId: string }) {}
}

export class UpdateUserProfileSuccess implements Action {
  readonly type = AuthActionTypes.UpdateUserProfileSuccess;
  constructor(public user: UserDto) {}
}

export class LoadUserSettings implements Action {
  readonly type = AuthActionTypes.LoadUserSettings;
  constructor(public payload: { tenantId: string; userId: string }) {}
}

export class LoadUserSettingsSuccess implements Action {
  readonly type = AuthActionTypes.LoadUserSettingsSuccess;
  constructor(public payload: { userSettings: Settings[] }) {}
}

export class LoadUserSettingsFail implements Action {
  readonly type = AuthActionTypes.LoadUserSettingsFail;
  constructor(public payload: { error: string }) {}
}

export class SetTranslationLoadedFlag implements Action {
  readonly type = AuthActionTypes.SetTranslationLoadedFlag;
  constructor(public flag: boolean) {}
}

export type AuthActions =
  | Login
  | Logout
  | OAuthLogin
  | OAuthCheckAction
  | SetUserTenantAction
  | SetTenantSettingsAction
  | BeginSessionAction
  | SetSessionAction
  | OAuthSuccessAction
  | OAuthWaitAction
  | GetUseInfoSuccessAction
  | GetUserInfoErrorAction
  | SetUserErrorMessageAction
  | FetchTenantSettingsAction
  | FetchTenantSettingsErrorAction
  | SetUserSettingsByKeyAction
  // | FetchUserSettingsAction
  | SwitchTenantSystemAction
  | ChangeMenuAction
  | RegistrationAction
  | PatchTenantSettingsSection
  | SetOpenedChildMenuAction
  | SetSelectedSearchProfile
  | FetchWorkflowMenuData
  | FetchWorkflowMenuDataSuccess
  | SetRawDataMenuOption
  | SetUserInfoNotNeededState
  | GetGroupsOfUser
  | GetGroupsOfUserSuccess
  | GetTenantUserGroups
  | GetTenantUserGroupsSuccess
  | UpdateUserProfile
  | UpdateUserProfileSuccess
  | LoadUserSettings
  | LoadUserSettingsSuccess
  | LoadUserSettingsFail
  | SetTranslationLoadedFlag;
