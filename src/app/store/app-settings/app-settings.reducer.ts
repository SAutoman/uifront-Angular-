/**
 * global
 */
import { EntityAdapter, createEntityAdapter } from '@ngrx/entity';

/**
 * project
 */
import { SettingsUI } from '../../service-layer';
import { AppSettingsActions, AppSettingsActionTypes } from './app-settings.actions';

/**
 * local
 */

export interface AppSettingsState {
  loading: boolean;
  operationMsg: string;
  settings: SettingsUI[];
}

export const appSettingsAdapter: EntityAdapter<AppSettingsState> = createEntityAdapter<AppSettingsState>({});

export const initialAppSettingsState: AppSettingsState = {
  loading: false,
  operationMsg: null,
  settings: null
};

export function appSettingsReducer(state = initialAppSettingsState, action: AppSettingsActions): AppSettingsState {
  switch (action.type) {
    case AppSettingsActionTypes.SearchAppSettings:
      return {
        ...state,
        loading: true
      };
    case AppSettingsActionTypes.SearchAppSettingsSuccess:
      return {
        ...state,
        loading: false,
        settings: action.data
      };
    case AppSettingsActionTypes.SearchAppSettingsFailed:
      return {
        ...state,
        loading: false,
        operationMsg: 'Fail' + action.msg
      };
    case AppSettingsActionTypes.CreateAppSetting:
      return {
        ...state,
        loading: true
      };
    case AppSettingsActionTypes.CreateAppSettingSuccess:
      return {
        ...state,
        loading: false,
        operationMsg: action.msg
      };
    case AppSettingsActionTypes.CreateAppSettingFailure:
      return {
        ...state,
        loading: false,
        operationMsg: 'Fail' + action.msg
      };
    case AppSettingsActionTypes.UpdateAppSetting:
      return {
        ...state,
        loading: true
      };
    case AppSettingsActionTypes.UpdateAppSettingSuccess:
      return {
        ...state,
        loading: false,
        operationMsg: action.msg
      };
    case AppSettingsActionTypes.UpdateAppSettingFailure:
      return {
        ...state,
        loading: false,
        operationMsg: 'Fail' + action.msg
      };
    case AppSettingsActionTypes.DeleteAppSetting:
      return {
        ...state,
        loading: true
      };
    case AppSettingsActionTypes.DeleteAppSettingSuccess:
      return {
        ...state,
        loading: false,
        operationMsg: action.msg
      };
    case AppSettingsActionTypes.DeleteAppSettingFailure:
      return {
        ...state,
        loading: false,
        operationMsg: 'Fail' + action.msg
      };
    case AppSettingsActionTypes.ResetAppSettingOperationMsg:
      return {
        ...state,
        operationMsg: null
      };
    default:
      return state;
  }
}
