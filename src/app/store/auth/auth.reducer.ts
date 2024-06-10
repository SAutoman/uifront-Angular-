import { cloneDeep } from 'lodash';
import { SettingsUI, Settings, Profile, TenantProfile, UserGroupsDto } from '@wfm/service-layer';
import { ChildrenItems } from '@wfm/shared/menu-items/menu-items';

import { AuthActions, AuthActionTypes } from './auth.actions';
export enum LoginState {
  None,
  WaitingIdSrv,
  IdSrvUser,
  NoUserInfo,
  UserInfo,
  RedirectToRegister,
  UserInfoNotNeeded
}

export enum MenuType {
  None,
  UserMenu,
  AdminMenu,
  UserMenuActivated,
  AdminMenuActivated
}

export interface SelectedSearchProfiles {
  rawData: Settings;
  case: Settings;
  report: Settings;
}

export interface TenantSystem {
  tenant: TenantProfile;
  tenantSettings: SettingsUI[];
  searchProfiles: Settings[];
  searchMenuItems: ChildrenItems[];
  workflowMenuItems: ChildrenItems[];
  rawDataMenuItems: ChildrenItems[];
  reportMenuItems: ChildrenItems[];
  loading: boolean;
  currentUsersGroups?: UserGroupsDto[];
  allUserGroups?: UserGroupsDto[];
}

export interface AuthState {
  profile: Profile;
  tenantSystems: Map<string, TenantSystem>;
  state: LoginState;
  backUrl: string;
  access_token: string;
  isAdmin: boolean;
  errorMessage: string;
  rolesPerTenant: TenantProfile[];
  sessionId: string;
  userSettingsMap: { [key: string]: SettingsUI };
  currentTenantSystem: TenantSystem;
  menuType: MenuType;
  user?: any;
  selectedSearchProfiles: SelectedSearchProfiles;
  showRawDataMenu: boolean;
  allUserSettings: Settings[];
  newTranslationLoaded: { isLoaded: boolean };
}

export const initialAuthState: AuthState = <any>{
  state: LoginState.None,
  backUrl: '',
  access_token: undefined,
  isAdmin: false,
  errorMessage: undefined,
  sessionId: null,
  userSettingsMap: {},
  currentTenantSystem: null,
  tenantSystems: new Map(),
  menuType: MenuType.UserMenu,
  selectedSearchProfiles: {
    rawData: undefined,
    case: undefined,
    report: undefined
  },
  showRawDataMenu: true,
  newTranslationLoaded: null
};

export function cloneMap(source: Map<string, TenantSystem>): Map<string, TenantSystem> {
  const map = new Map();

  for (const i of source.keys()) {
    map.set(i, source.get(i));
  }

  return map;
}

export function authReducer(state = initialAuthState, action: AuthActions): AuthState {
  switch (action.type) {
    case AuthActionTypes.SetOpenedChildMenu:
      const ten = cloneDeep(state.currentTenantSystem);
      ten?.searchMenuItems.forEach((menu) => {
        delete menu.isOpened;
        if (menu.name === action.payload.itemName) {
          menu.isOpened = true;
        }
      });
      return <any>{
        ...state,
        currentTenantSystem: ten
      };
    case AuthActionTypes.SetSelectedSearchProfile:
      let newSelectedSearchProfiles = { ...state.selectedSearchProfiles };
      if (action.payload.type === 'rawData') {
        newSelectedSearchProfiles.rawData = action.payload.profile;
      } else if (action.payload.type === 'case') {
        newSelectedSearchProfiles.case = action.payload.profile;
      } else if (action.payload.type === 'report') {
        newSelectedSearchProfiles.report = action.payload.profile;
      }
      return {
        ...state,
        selectedSearchProfiles: newSelectedSearchProfiles
      };

    case AuthActionTypes.SetUserTenantAction:
      const tempCopy = cloneMap(state.tenantSystems);
      return <any>{
        ...state,
        currentTenantSystem: action.payload.tenantSystem,
        tenantSystems: tempCopy.set(action.payload.tenantSystem.tenant.tenantId, action.payload.tenantSystem)
      };
    case AuthActionTypes.SetTenantSettingsAction:
      return <AuthState>{
        ...state,
        currentTenantSystem: {
          ...state.currentTenantSystem,
          tenantSettings: action.payload.tenantSettings
        }
      };
    case AuthActionTypes.GetUserInfoSuccess:
      return <any>{
        ...state,
        state: LoginState.UserInfo,
        profile: action.payload.userProfile.profile,
        rolesPerTenant: action.payload.userProfile.rolesPerTenant,
        userSettingsMap: action.payload.userSettings
      };

    case AuthActionTypes.GetUseInfoError:
      return <any>{
        ...state,
        state: LoginState.NoUserInfo
      };

    case AuthActionTypes.GetGroupsOfUserSuccess:
      return <AuthState>{
        ...state,
        currentTenantSystem: {
          ...state.currentTenantSystem,
          currentUsersGroups: action.payload.groups
        }
      };

    case AuthActionTypes.OAuthLoginAction:
      return <any>{
        ...state,
        backUrl: action.payload,
        state: LoginState.WaitingIdSrv
      };

    case AuthActionTypes.OAuthSuccessAction:
      return <any>{
        ...state,
        user: action.payload,
        state: LoginState.IdSrvUser
      };

    case AuthActionTypes.SetUserErrorMessage:
      return <any>{
        ...state,
        errorMessage: action.payload
      };

    case AuthActionTypes.SetSession:
      return <any>{
        ...state,
        sessionId: action.payload.sessionId
      };
    case AuthActionTypes.SetUserSettingsByKeyAction:
      return <any>{
        ...state,
        userSettingsMap: {
          ...state.userSettingsMap,
          ...action.payload.userSettings
        }
      };

    case AuthActionTypes.LogoutAction:
      return <any>{
        loggedIn: false,
        user: undefined,
        currentTenantSystem: undefined
      };

    case AuthActionTypes.ChangeMenuAction:
      if (state.menuType !== action.payload.menuType) {
        return <any>{
          ...state,
          menuType: action.payload.menuType
        };
      }
      return state;
    case AuthActionTypes.RegistrationAction:
      return <any>{
        ...state,
        state: LoginState.RedirectToRegister
      };
    case AuthActionTypes.FetchWorkflowMenuDataSuccess:
      return {
        ...state,
        currentTenantSystem: {
          ...state.currentTenantSystem,
          searchProfiles: action.payload.searchProfiles,
          rawDataMenuItems: action.payload.rawDataItems,
          workflowMenuItems: action.payload.workflowItems,
          searchMenuItems: action.payload.searchMenuItems,
          reportMenuItems: action.payload.reportItems
        }
      };
    case AuthActionTypes.SetShowRawDataMenuOption:
      return {
        ...state,
        showRawDataMenu: action.payload.showRawData
      };
    case AuthActionTypes.SetUserInfoNotNeededState:
      return {
        ...state,
        state: LoginState.UserInfoNotNeeded
      };
    case AuthActionTypes.GetTenantUserGroupsSuccess:
      return {
        ...state,
        currentTenantSystem: {
          ...state.currentTenantSystem,
          allUserGroups: action.groups
        }
      };
    case AuthActionTypes.UpdateUserProfile:
      return {
        ...state,
        profile: { ...action.payload.user, companyPublicId: action.payload.companyId }
      };
    case AuthActionTypes.LoadUserSettingsSuccess:
      return {
        ...state,
        allUserSettings: action.payload.userSettings
      };
    case AuthActionTypes.LoadUserSettingsFail:
      return {
        ...state,
        errorMessage: 'Failed Loading User Settings'
      };
    case AuthActionTypes.SetTranslationLoadedFlag:
      return {
        ...state,
        newTranslationLoaded: { isLoaded: action.flag }
      };
    default:
      return state;
  }
}
