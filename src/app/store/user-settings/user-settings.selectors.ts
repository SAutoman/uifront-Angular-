import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserSettingsState } from './user-settings.reducer';
import {
  Settings,
  appCaseSearchProfile,
  appRawDataSearchProfile,
  appReportSearchProfile,
  dynamicGridSettingsKey
} from '@wfm/service-layer';

const getUserSettingsState = createFeatureSelector<UserSettingsState>('userSettingsState');
export const sharedSettingsPerGroup = createSelector(getUserSettingsState, (state) => state.sharedSettingsPerGroup);

//GROUP SEARCH PROFILES
export const sharedSearchProfilesPerGroupSelector = createSelector(getUserSettingsState, (state) => {
  let data: { [key: string]: Settings[] } = {};
  for (const groupId in state.sharedSettingsPerGroup) {
    if (Object.prototype.hasOwnProperty.call(state.sharedSettingsPerGroup, groupId)) {
      const settings = state.sharedSettingsPerGroup[groupId];
      data[groupId] = settings?.filter(
        (sett) => sett.key === appCaseSearchProfile || sett.key === appRawDataSearchProfile || sett.key === appReportSearchProfile
      );
    }
  }

  return data;
});

//GROUP LAYOUTS
export const sharedLayoutsPerGroupSelector = createSelector(getUserSettingsState, (state) => {
  let data: { [key: string]: Settings[] } = {};
  for (const groupId in state.sharedSettingsPerGroup) {
    if (Object.prototype.hasOwnProperty.call(state.sharedSettingsPerGroup, groupId)) {
      const settings = state.sharedSettingsPerGroup[groupId];
      data[groupId] = settings?.filter((sett) => sett.key.includes(`${dynamicGridSettingsKey}`));
    }
  }
  return data;
});

//ROLE SEARCH PROFILES
export const sharedSearchProfilesPerRoleSelector = createSelector(getUserSettingsState, (state) => {
  let data: { [key: string]: Settings[] } = {};
  for (const role in state.sharedSettingsPerRole) {
    if (Object.prototype.hasOwnProperty.call(state.sharedSettingsPerRole, role)) {
      const settings = state.sharedSettingsPerRole[role];
      data[role] = settings?.filter(
        (sett) => sett.key === appCaseSearchProfile || sett.key === appRawDataSearchProfile || sett.key === appReportSearchProfile
      );
    }
  }
  return data;
});

//ROLE LAYOUTS
export const sharedLayoutsPerRoleSelector = createSelector(getUserSettingsState, (state) => {
  let data: { [key: string]: Settings[] } = {};
  for (const role in state.sharedSettingsPerRole) {
    if (Object.prototype.hasOwnProperty.call(state.sharedSettingsPerRole, role)) {
      const settings = state.sharedSettingsPerRole[role];
      data[role] = settings?.filter((sett) => sett.key.includes(`${dynamicGridSettingsKey}`));
    }
  }
  return data;
});
