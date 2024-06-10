import { createSelector, createFeatureSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';
import { CurrentUserData } from '@wfm/forms-flow-struct/form-function-builder/system-fields';
import {
  appCaseSearchProfile,
  appDateFormatKey,
  appRawDataSearchProfile,
  appReportSearchProfile,
  Company,
  Roles,
  UserGroupsDto,
  WorkflowStatusDto
} from '@wfm/service-layer';
import { tenantRelatedCompaniesSelector } from '..';
import { ChildrenItems, SubChildren } from '@wfm/shared/menu-items/menu-items';
import { cloneDeep } from 'lodash-core';
import { workflowStatusesSelector } from '../workflow';
export interface SystemFieldsOptions {
  groups: UserGroupsDto[];
  companies: Company[];
  roles: Roles[];
  statuses: WorkflowStatusDto[];
}

export interface WorkflowMenuData {
  workflowMenuItems: ChildrenItems[];
  rawDataMenuItems: ChildrenItems[];
  reportMenuItems: ChildrenItems[];
}

const getAuthState = createFeatureSelector<AuthState>('auth');

export const loggedInState = createSelector(getAuthState, (auth) => auth);

export const rolesSelector = createSelector(getAuthState, (auth) => auth.rolesPerTenant);

export const currentTenantSelector = createSelector(getAuthState, (auth) =>
  auth.currentTenantSystem ? auth.currentTenantSystem.tenant.tenantId : null
);

export const currentSelectedRole = createSelector(getAuthState, (auth) => auth.currentTenantSystem?.tenant.role);

export const currentSelectedRoleNum = createSelector(getAuthState, (auth) => auth.currentTenantSystem?.tenant.roleNum);

export const currentTenantName = createSelector(getAuthState, (auth) => auth.currentTenantSystem?.tenant.tenantName);

export const currentErrorMessage = createSelector(getAuthState, (auth) => auth.errorMessage);

export const currentTenantSystem = createSelector(getAuthState, (auth: AuthState, props: { tenantId: string }) => {
  return auth.tenantSystems.get(props.tenantId);
});

export const currentSearchProfiles = createSelector(getAuthState, (auth) => auth.currentTenantSystem?.searchProfiles);

export const currentMenuType = createSelector(getAuthState, (auth) => auth.menuType);

export const authUserProfileSelector = createSelector(getAuthState, (auth) => auth.profile);

export const tenantSettingsSelector = createSelector(getAuthState, (auth) => auth.currentTenantSystem?.tenantSettings);

export const selectedSearchProfiles = createSelector(getAuthState, (auth) => auth.selectedSearchProfiles);

export const showRawDataMenuSelector = createSelector(getAuthState, (auth) => auth.showRawDataMenu);

export const workflowMenuItemsSelector = createSelector(getAuthState, (auth) => auth.currentTenantSystem?.workflowMenuItems);

export const rawDataMenuItemsSelector = createSelector(getAuthState, (auth) => auth.currentTenantSystem?.rawDataMenuItems);

export const reportMenuItemsSelector = createSelector(getAuthState, (auth) => auth.currentTenantSystem?.reportMenuItems);

export const currentTenantSearchMenuItems = createSelector(getAuthState, (auth) =>
  auth.currentTenantSystem ? auth.currentTenantSystem.searchMenuItems : null
);

export const isSuperAdminSelector = createSelector(getAuthState, (auth) => auth.profile.isAdmin);

export const groupsOfUserSelector = createSelector(getAuthState, (auth) => auth.currentTenantSystem.currentUsersGroups);

export const userGroupsSelector = createSelector(getAuthState, (auth) => auth.currentTenantSystem.allUserGroups);

export const getAllUserSettingsSelector = createSelector(getAuthState, (auth) => auth.allUserSettings);

export const newTranslationLoadedSelector = createSelector(getAuthState, (auth) => auth.newTranslationLoaded);

export const userSystemDataSelector = createSelector(getAuthState, (auth) => {
  return <CurrentUserData>{
    userGroups: (auth.currentTenantSystem?.currentUsersGroups || []).map((g) => g.id),
    companyId: auth.profile.companyPublicId,
    role: auth.currentTenantSystem.tenant.roleNum
  };
});
export const systemFieldOptionsSelector = createSelector(
  userGroupsSelector,
  tenantRelatedCompaniesSelector,
  workflowStatusesSelector,
  (groups, companies, statuses) => {
    if (groups && companies) {
      return <SystemFieldsOptions>{
        groups,
        companies,
        roles: Object.values(Roles).filter((roleValue) => typeof roleValue !== 'string'),
        statuses: Object.values(statuses)
      };
    }
  }
);

export const dateFormatSettingsSelector = createSelector(getAuthState, (auth) => {
  return auth.userSettingsMap && auth.userSettingsMap[appDateFormatKey];
});

export const userSettingsMapSelector = createSelector(getAuthState, (auth) => {
  return auth.userSettingsMap;
});

export const tenantTimezoneSelector = createSelector(getAuthState, (auth) => {
  return auth.currentTenantSystem?.tenant?.tenantTimeZone || '';
});

export const workflowMenuDataSelector = createSelector(
  workflowMenuItemsSelector,
  rawDataMenuItemsSelector,
  reportMenuItemsSelector,
  currentTenantSearchMenuItems,
  (workflowSchemas, rawDataSchemas, reportItems, searchProfiles) => {
    if (workflowSchemas && rawDataSchemas && reportItems && searchProfiles) {
      const workflowMenuItems = cloneDeep(workflowSchemas);

      workflowMenuItems.forEach((p) => {
        p.child = [];
        const profiles: SubChildren[] = searchProfiles
          .filter((x) => {
            return (
              x.setting.key === appCaseSearchProfile && x.setting.value?.schemaId && x.setting.value?.schemaId === p.setting?.caseSchemaId
            );
          })
          .map(
            (x) =>
              <SubChildren>{
                name: x.name,
                state: appCaseSearchProfile,
                // state: x.setting.id,
                type: x.setting.type,
                // type: appCaseSearchProfile,
                setting: x.setting
              }
          );
        profiles.forEach((child) => {
          p.child.push(child);
        });
      });

      const rawDataMenuItems = cloneDeep(rawDataSchemas);

      rawDataMenuItems.forEach((rawDataSchemaMenuItem) => {
        const searchProfileMenuItemsPerSchema: SubChildren[] = searchProfiles
          .filter((x) => x.setting?.value?.schemaId === rawDataSchemaMenuItem.setting?.id)
          .map((searchMenuItem) => {
            return {
              state: appRawDataSearchProfile,
              name: searchMenuItem.name,
              type: searchMenuItem.setting.type,
              setting: searchMenuItem.setting,
              isOpened: searchMenuItem.isOpened
            };
          });
        rawDataSchemaMenuItem.child = searchProfileMenuItemsPerSchema;
      });

      const reportMenuItems = cloneDeep(reportItems);

      reportMenuItems.forEach((p) => {
        p.child = [];
        const profiles: SubChildren[] = searchProfiles
          .filter((x) => {
            return x.setting.key === appReportSearchProfile && x.setting.value?.schemaId && x.setting.value?.schemaId === p.setting?.id;
          })
          .map(
            (x) =>
              <SubChildren>{
                name: x.name,
                state: appReportSearchProfile,
                type: x.setting.type,
                setting: x.setting,
                isOpened: x.isOpened
              }
          );
        profiles.forEach((child) => {
          p.child.push(child);
        });
      });

      return <WorkflowMenuData>{
        workflowMenuItems,
        rawDataMenuItems,
        reportMenuItems
      };
    }
  }
);
