/**
 * global
 */
import { cloneDeep } from 'lodash-core';

/**
 * project
 */
import { Settings } from '../../service-layer';
import { UserSettingsActionTypes, UserSettingsActions } from './user-settings.actions';

/**
 * local
 */

export interface UserSettingsState {
  sharedSettingsPerGroup: { [key: string]: Settings[] };
  sharedSettingsPerRole: { [key: string]: Settings[] };
}

export const initialUserSettingsState: UserSettingsState = <UserSettingsState>{
  sharedSettingsPerGroup: {},
  sharedSettingsPerRole: {}
};

export function userSettingsReducer(state = initialUserSettingsState, action: UserSettingsActions) {
  switch (action.type) {
    case UserSettingsActionTypes.GetSharedUserSettingsPerGroupActionSuccess:
      return <UserSettingsState>{
        ...state,
        sharedSettingsPerGroup: {
          ...state.sharedSettingsPerGroup,
          [action.payload.groupId]: action.payload.settings
        }
      };
    case UserSettingsActionTypes.GetSharedUserSettingsPerRolesSuccess:
      const settPerRoles = cloneDeep(state.sharedSettingsPerRole);
      action.payload.forEach((groupSettings) => {
        settPerRoles[groupSettings.groupId] = groupSettings.settings;
      });
      return <UserSettingsState>{
        ...state,
        sharedSettingsPerRole: settPerRoles
      };
    case UserSettingsActionTypes.ResetSharedUserSettingsAction:
      return <UserSettingsState>{
        ...state,
        sharedSettingsPerGroup: {},
        sharedSettingsPerRole: {}
      };
    default:
      return state;
  }
}
