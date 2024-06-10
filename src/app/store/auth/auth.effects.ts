/**
 * global
 */
import { Injectable, Inject } from '@angular/core';
import { Router } from '@angular/router';

import { tap, switchMap, map, exhaustMap, withLatestFrom } from 'rxjs/operators';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
/**
 * project
 */

import {
  UserProfileService,
  UsersService,
  SettingsUI,
  SettingsKeys,
  AppConfigService,
  appRawDataSearchProfile,
  TenantProfile,
  AuthenticationService,
  TenantsService,
  StatePersistingService,
  TenantSettingsService,
  AreaTypeEnum,
  SchemaDto,
  WorkflowService,
  appCaseSearchProfile,
  FieldTypeIds,
  UserGroupsService,
  TranslationService,
  WorkflowSimplifiedDto,
  appReportSearchProfile,
  SchemaFieldDto
} from '@wfm/service-layer';

import { roleConverter } from '@wfm/shared/utils';
import { callbackUnsubscribeRoute, unknownUserRoute } from '@wfm/app.route.static';
import { ChildrenItems } from '@wfm/shared/menu-items/menu-items';
import { cleanupSearchProfiles } from '@wfm/service-layer/helpers';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import {
  AuthActionTypes,
  OAuthLogin,
  OAuthSuccessAction,
  OAuthWaitAction,
  GetUserInfoErrorAction,
  GetUserInfoAction,
  GetUseInfoSuccessAction,
  SetUserTenantAction,
  SetUserErrorMessageAction,
  BeginSessionAction,
  SetSessionAction,
  FetchTenantSettingsAction,
  FetchTenantSettingsErrorAction,
  SwitchTenantSystemAction,
  ChangeMenuAction,
  Logout,
  RegistrationAction,
  FetchWorkflowMenuData,
  FetchWorkflowMenuDataSuccess,
  SetTenantSettingsAction,
  GetGroupsOfUser,
  GetGroupsOfUserSuccess,
  GetTenantUserGroups,
  GetTenantUserGroupsSuccess,
  SetUserInfoNotNeededState,
  LoadUserSettings,
  LoadUserSettingsFail,
  LoadUserSettingsSuccess,
  UpdateUserProfile,
  UpdateUserProfileSuccess
} from './auth.actions';
import { TenantSystem, MenuType } from './auth.reducer';

import { getAllUserSettingsSelector } from '.';
import { DataSourceDto, DataSourceSimplified } from '@wfm/report/report-datasource.model';
import { DataSourceService } from '@wfm/service-layer/services/datasource.service';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';
/**
 * local
 */

export const tenantIdKey = 'tenantId';
export const tenantRoleKey = 'role';
export const tenantNameKey = 'tenantName';

const filterEmptyKey = (x?: { key?: string }): boolean => {
  if (!x) {
    return false;
  }
  return !!x.key;
};

const getValueByKey = (item: { key: string; value?: { [key: string]: any } }): any => {
  if (!item.value) {
    return undefined;
  }
  if (!item.value[item.key] && item.value[item.key] !== 0) {
    return item.value;
  }
  return item.value[item.key];
};

export interface RefSchemasByAreas {
  [key: string]: { referencedInRawData: boolean; referencedInCase: boolean };
}

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private store: Store<any>,
    private userProfileService: UserProfileService,
    @Inject('AuthenticationService') private authService: AuthenticationService,
    private router: Router,
    private tenantSettingsService: TenantSettingsService,
    private tenantService: TenantsService,
    private usersService: UsersService,
    private appConfig: AppConfigService,
    private statePersistingService: StatePersistingService,
    private adminSchemaService: AdminSchemasService,
    private wfService: WorkflowService,
    private userGroupsService: UserGroupsService,
    private translationService: TranslationService,
    private dataSourceService: DataSourceService,
    private errorHandlerService: ErrorHandlerService
  ) {}

  oAuth$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<OAuthLogin>(AuthActionTypes.OAuthLoginAction),
        tap(async (action) => {
          if (action.payload.includes('auth_callback')) {
            const hash = window.location.hash.substr(1);
            const result = hash
              .substring(hash.indexOf('?') + 1)
              .split('&')
              .reduce((r: any, item: string) => {
                const parts = item.split('=');
                r[parts[0]] = parts[1];
                return r;
              }, {});
            if (!result.error) {
              const accessTokenObj = this.parseJwt(result.access_token);
              if (!!accessTokenObj['ccx.emailDomain'] && !!accessTokenObj['ccx.tenant'] && !!accessTokenObj['ccx.userRole']) {
                const { identityConfig } = this.appConfig.config;
                window.localStorage.setItem(
                  'oidc.' + identityConfig.state,
                  JSON.stringify({
                    id: identityConfig.state,
                    nonce: identityConfig.nonce,
                    authority: identityConfig.identityEndpoint,
                    client_id: identityConfig.clientId,
                    response_mode: null,
                    scope: identityConfig.requiredScopes
                  })
                );
              }
              await this.authService.completeAuthentication().then(() => {
                this.store.dispatch(
                  new OAuthSuccessAction({
                    user: this.authService.getUser(),
                    backUrl: action.payload
                  })
                );
              });
            }
          } else if (action.payload.includes(callbackUnsubscribeRoute)) {
            this.store.dispatch(new SetUserInfoNotNeededState());
          } else {
            const isLoggedIn = await this.authService.isLoggedIn();
            if (!isLoggedIn) {
              // removing the current user in case user is expired
              this.authService.clear();
              window.localStorage.setItem('backUrl', action.payload);
              this.authService.startAuthentication();
              this.store.dispatch(new OAuthWaitAction());
            } else {
              this.store.dispatch(new OAuthSuccessAction({ user: this.authService.getUser(), backUrl: action.payload }));
            }
          }
        })
      ),
    {
      dispatch: false
    }
  );

  oAuthSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<OAuthSuccessAction>(AuthActionTypes.OAuthSuccessAction),
        map((a) => {
          return new GetUserInfoAction({ user: a.payload.user, backUrl: a.payload.backUrl });
        })
      ),
    { dispatch: true }
  );

  getUserInfo$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<GetUserInfoAction>(AuthActionTypes.GetUserInfo),
        switchMap(async (a) => {
          try {
            const response = await this.userProfileService.getProfile();
            if (!response?.rolesPerTenant?.length) {
              this.store.dispatch(new SetUserErrorMessageAction("You don't have any roles."));
            } else {
              let activeTenant: TenantProfile;
              this.userProfileService.userProfile = { ...response };
              let tenantId = await this.authService.getTenantIdFromClaims();
              activeTenant = response.rolesPerTenant.find((t) => t.tenantId === tenantId);
              if (!tenantId || activeTenant) {
                tenantId = this.tenantService.getFromStorage(tenantIdKey);
                activeTenant = response.rolesPerTenant.find((t) => t.tenantId === tenantId);
                if (!tenantId || !activeTenant) {
                  activeTenant = response.rolesPerTenant[0];
                  tenantId = activeTenant.tenantId;
                }
              }
              if (activeTenant) {
                this.tenantService.setInStorage(tenantIdKey, activeTenant.tenantId);
                this.tenantService.setInStorage(tenantRoleKey, activeTenant.role);
                this.tenantService.setInStorage(tenantNameKey, activeTenant.tenantName);
              }
              const userSettings = await this.usersService.getUserSettings(tenantId, response.profile.id);

              const menuType = this.tenantService.getFromStorage('menuType');
              const userSettingsMap: { [key: string]: SettingsUI } = {};

              userSettings.settings.filter(filterEmptyKey).forEach((x) => {
                const setting: SettingsUI = { key: x.key, value: getValueByKey(x), id: x.id || x.key };
                userSettingsMap[x.key] = setting;
              });

              this.store.dispatch(new LoadUserSettingsSuccess({ userSettings: userSettings.settings }));

              this.store.dispatch(
                new GetUseInfoSuccessAction({
                  userProfile: response,
                  userSettings: userSettingsMap
                })
              );

              this.store.dispatch(new BeginSessionAction());
              this.store.dispatch(new ChangeMenuAction({ menuType: Number(menuType) || MenuType.UserMenu }));
            }
          } catch (error) {
            console.log('error loading user info', error);
            this.store.dispatch(new GetUserInfoErrorAction(a.payload.backUrl));
          }
        })
      ),
    { dispatch: false }
  );

  beginSession$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<BeginSessionAction>(AuthActionTypes.BeginSession),
        switchMap((a) => {
          return this.userProfileService.beginSession().pipe(
            map((response) => {
              this.store.dispatch(new SetSessionAction({ sessionId: response }));
            })
          );
        })
      ),
    { dispatch: false }
  );

  getUserInfoSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<GetUseInfoSuccessAction>(AuthActionTypes.GetUserInfoSuccess),
        tap(async (a) => {
          const rolesPerTenant = a.payload.userProfile.rolesPerTenant;

          // tenant details stored in localsorage
          const tenantId = this.tenantService.getFromStorage(tenantIdKey);
          const tenantRole = this.tenantService.getFromStorage(tenantRoleKey);
          const tenantName = this.tenantService.getFromStorage(tenantNameKey);
          const userId = a.payload.userProfile.profile.id;
          this.store.dispatch(
            new GetGroupsOfUser({
              tenantId: tenantId,
              userId: userId
            })
          );

          this.translationService.setTranslationsByTenant(tenantName, userId, this.authService.getLanguageFromClaims());
          const tenantTimeZone =
            rolesPerTenant?.find((role) => {
              return role.tenantId === tenantId;
            })?.tenantTimeZone || '';

          this.store.dispatch(
            new SetUserTenantAction({
              tenantSystem: <TenantSystem>{
                tenant: <TenantProfile>{
                  tenantId: tenantId,
                  role: tenantRole,
                  tenantName: tenantName,
                  roleNum: roleConverter(tenantRole),
                  tenantTimeZone: tenantTimeZone
                },
                tenantSettings: []
              }
            })
          );

          this.store.dispatch(
            new FetchTenantSettingsAction({
              tenant: <TenantProfile>{
                tenantId: tenantId,
                role: tenantRole,
                tenantName: tenantName,
                roleNum: roleConverter(tenantRole)
              },

              userId: a.payload.userProfile.profile.id
            })
          );

          if (JSON.parse(localStorage.getItem('isRegistrationRequest')) && this.authService.isEmailDomainAndUserRoleInClaims()) {
            this.store.dispatch(new RegistrationAction());
          }
        })
      ),
    { dispatch: false }
  );

  loadUserSettings$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<LoadUserSettings>(AuthActionTypes.LoadUserSettings),
        switchMap(async (action) => {
          try {
            const result = await this.usersService.getUserSettings(action.payload.tenantId, action.payload.userId);
            this.store.dispatch(new LoadUserSettingsSuccess({ userSettings: result.settings }));
          } catch (error) {
            this.store.dispatch(new LoadUserSettingsFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) }));
          }
        })
      ),
    { dispatch: false }
  );

  switchTenantSystem$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<SwitchTenantSystemAction>(AuthActionTypes.SwitchTenantSystemAction),
        switchMap(async (a) => {
          try {
            this.tenantService.setInStorage(tenantIdKey, a.payload.selectedTenantSystem.tenant.tenantId);
            this.tenantService.setInStorage(tenantRoleKey, a.payload.selectedTenantSystem.tenant.role);
            this.tenantService.setInStorage(tenantNameKey, a.payload.selectedTenantSystem.tenant.tenantName);
            setTimeout(() => {
              window.location.href = '/';
            });
          } catch (error) {
            console.log('Error swithing tenant system', error);
          }
        })
      ),
    { dispatch: false }
  );

  fetchTenantSettings$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<FetchTenantSettingsAction>(AuthActionTypes.FetchTenantSettings),
        switchMap(async (a) => {
          try {
            const tenantSettings = await this.tenantSettingsService.getByTenant(a.payload.tenant.tenantId);
            const tenantSettingsMapped: SettingsUI[] = [];

            tenantSettings.settings.filter(filterEmptyKey).forEach((x) => {
              const settings: SettingsUI = { key: x.key, value: getValueByKey(x), id: x.id || x.key };
              tenantSettingsMapped.push(settings);
            });

            this.store.dispatch(
              new SetTenantSettingsAction({
                tenantSettings: tenantSettingsMapped
              })
            );
            this.store.dispatch(
              new FetchWorkflowMenuData({
                tenantId: a.payload.tenant.tenantId,
                userId: a.payload.userId
              })
            );
          } catch (error) {
            this.store.dispatch(new FetchTenantSettingsErrorAction(this.errorHandlerService.getAndShowErrorMsg(error)));
          }
        })
      ),
    { dispatch: false }
  );

  getGroupsOfUser$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<GetGroupsOfUser>(AuthActionTypes.GetGroupsOfUser),
        switchMap(async (a) => {
          try {
            const userGroups = await this.userGroupsService.getUserGroupsByUserIn(a.payload.tenantId, a.payload.userId);
            this.store.dispatch(new GetGroupsOfUserSuccess({ groups: userGroups.items }));
          } catch (error) {
            console.log('Error getting user groups: ', error);
          }
        })
      ),
    { dispatch: false }
  );

  changeMenuAdminAction$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<ChangeMenuAction>(AuthActionTypes.ChangeMenuAction),
        switchMap(async (a) => {
          this.tenantService.setInStorage('menuType', a.payload.menuType.toString());
        })
      ),
    { dispatch: false }
  );

  getUserInfoError$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<GetUserInfoErrorAction>(AuthActionTypes.GetUseInfoError),
        tap(() => {
          if (!this.authService.isEmailDomainAndUserRoleInClaims()) {
            this.authService.clear();
          }
          // this.router.navigateByUrl(unknownUserRoute);
        })
      ),
    { dispatch: false }
  );

  getUserInfoErrorMessage$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<SetUserErrorMessageAction>(AuthActionTypes.SetUserErrorMessage),
        tap(() => {
          this.router.navigateByUrl(unknownUserRoute);
        })
      ),
    { dispatch: false }
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<Logout>(AuthActionTypes.LogoutAction),
        tap(() => {
          try {
            this.statePersistingService.remove(tenantRoleKey);
            this.statePersistingService.remove('menuType');
            this.statePersistingService.remove(tenantIdKey);
            this.statePersistingService.remove(tenantNameKey);
            this.statePersistingService.remove('isRegistrationRequest');
            this.statePersistingService.removeItemsByKey('lastSearchFields');
            this.authService.logout();
          } catch (error) {
            console.log('Error on user logout.', error);
          }
        })
      ),
    { dispatch: false }
  );

  /**
   * collect sidebard workflow menu data - rawData and case, report menus and their subitems
   */

  FetchWorkflowMenuData = createEffect(
    () =>
      this.actions$.pipe(
        ofType<FetchWorkflowMenuData>(AuthActionTypes.FetchWorkflowMenuData),
        withLatestFrom(this.store.select(getAllUserSettingsSelector)),
        switchMap(async ([a, settings]) => {
          try {
            // getting searchProfiles by key also to get shared ones
            const searchProfileKey = <SettingsKeys>{
              keys: [appRawDataSearchProfile, appCaseSearchProfile, appReportSearchProfile],
              isExclusive: false
            };
            const searchProfiles = await this.usersService.getUserSettingsByKeys(a.payload.tenantId, a.payload.userId, searchProfileKey);

            let filteredSearchProfiles = cleanupSearchProfiles(searchProfiles.settings);
            const workflows = await this.wfService.searchSimplified(a.payload.tenantId, { skip: 0, take: 999 });
            const workflowItems = workflows.map((x) => this.mapUserWorkflows(x));
            const activeRawDataSchemas: SchemaDto[] = [];
            /**
             * allRefSchemas -> all referenced schemas used inside cases and raw data area
             */
            let allRefSchemas: RefSchemasByAreas = {};
            for (const workflowMenuItem of workflowItems) {
              if (workflowMenuItem.setting.caseSchema) {
                const rawDataSchemas = await this.getRawDataSchemasUsedInCaseSchema(
                  workflowMenuItem.setting.caseSchema,
                  a.payload.tenantId,
                  allRefSchemas
                );
                if (rawDataSchemas?.length) {
                  rawDataSchemas.forEach((rawDataSchema) => {
                    // populate rawData menu schemas used in some workflow
                    if (!activeRawDataSchemas?.find((x) => x.id === rawDataSchema?.id)) {
                      activeRawDataSchemas.push(rawDataSchema);
                    }
                  });
                }
              }
            }
            /**
             * Compare activeRawDataSchemas to allRefSchemas.
             */
            for (const key in allRefSchemas) {
              const schema = allRefSchemas[key];
              /**
               * If any referenced schema is used in case & raw data areas,
               * then it shall be visible in the side menu.
               * For referenced schema visibility set isChildRef -> false
               */
              if (schema.referencedInCase && schema.referencedInRawData) {
                const activeRawDataSchema = activeRawDataSchemas?.find((x) => x.id === key);
                if (activeRawDataSchema) {
                  activeRawDataSchema['isChildRef'] = false;
                }
              }
            }

            const rawDataItems = activeRawDataSchemas.map((x) => this.mapRawDataSchemas(x));
            const reports = await this.dataSourceService.getAllSimplified(a.payload.tenantId);
            const reportItems = reports.map((x) => this.mapReports(x));
            this.store.dispatch(
              new FetchWorkflowMenuDataSuccess({
                searchProfiles: filteredSearchProfiles,
                rawDataItems,
                workflowItems,
                searchMenuItems: filteredSearchProfiles.map((x) => this.mapUserSearchProfiles(x)),
                reportItems
              })
            );
          } catch (error) {
            console.log('Error getting WorkflowMenuData', error);
          }
        })
      ),
    { dispatch: false }
  );

  /**
   * get all userGroups of the tenant
   */
  GetTenantUserGroups = createEffect(() =>
    this.actions$.pipe(
      ofType<GetTenantUserGroups>(AuthActionTypes.GetTenantUserGroups),
      switchMap(async (action) => {
        try {
          const groupsPaged = await this.userGroupsService.getUserGroups(action.payload.tenantId);
          return new GetTenantUserGroupsSuccess(groupsPaged.items);
        } catch (error) {
          console.log(error);
        }
      })
    )
  );

  UpdateUserProfile = createEffect(() =>
    this.actions$.pipe(
      ofType<UpdateUserProfile>(AuthActionTypes.UpdateUserProfile),
      exhaustMap(async (action) => {
        try {
          const users = await this.usersService.update(action.payload.user);
          return new UpdateUserProfileSuccess(users);
        } catch (error) {
          console.log(error);
        }
      })
    )
  );

  private parseJwt(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
  }

  private mapUserSearchProfiles(x: SettingsUI): ChildrenItems {
    return <ChildrenItems>{
      name: x.value.name,
      type: 'search',
      setting: x
    };
  }

  private mapRawDataSchemas(x: SchemaDto): ChildrenItems {
    return <ChildrenItems>{
      name: x.name,
      type: 'schema',
      setting: x
    };
  }

  private mapUserWorkflows(x: WorkflowSimplifiedDto): ChildrenItems {
    return <ChildrenItems>{
      name: x.name,
      type: 'workflow',
      setting: x
    };
  }

  private mapReports(x: DataSourceSimplified): ChildrenItems {
    return <ChildrenItems>{
      name: x.name,
      type: 'report',
      setting: x
    };
  }

  async getCachedSchema(id: string, area: AreaTypeEnum, tenantId: string): Promise<SchemaDto> {
    return await await this.adminSchemaService.getSchema(tenantId, area, id);
  }

  async getRawDataSchemasUsedInCaseSchema(caseSchema: SchemaDto, tenantId: string, allRefSchemas: RefSchemasByAreas): Promise<SchemaDto[]> {
    let schemas: SchemaDto[] = [];
    await this.populateRawDataSchemas(caseSchema, tenantId, schemas, false, allRefSchemas);

    return schemas;
  }

  async populateRawDataSchemas(
    schema: SchemaDto,
    tenantId: string,
    allRawDataSchemas: SchemaDto[],
    isChildRef: boolean = false,
    allRefSchemas: RefSchemasByAreas
  ) {
    const rawDataSchemaFields = schema.fields.filter((field) => {
      return field.type === FieldTypeIds.ListOfLinksField && field.configuration.schemaAreaType === AreaTypeEnum.rawData;
    });
    if (rawDataSchemaFields.length) {
      for (const rawDataSchemaField of rawDataSchemaFields) {
        const schemaId = rawDataSchemaField.configuration.schemaId;
        /**
         * If !isChildRef -> schema is used in Case Area.
         * If isChildRef  -> Schema is used in Raw Data Area.
         * Set corresponding area flags to true.
         * */
        if (!allRefSchemas[schemaId]) allRefSchemas[schemaId] = { referencedInCase: false, referencedInRawData: false };
        if (!isChildRef) {
          allRefSchemas[schemaId].referencedInCase = true;
        } else allRefSchemas[schemaId].referencedInRawData = true;
        try {
          const id = rawDataSchemaField.configuration.schemaId;
          const rawDataSchema = await this.getCachedSchema(id, AreaTypeEnum.rawData, tenantId);
          rawDataSchema['isChildRef'] = isChildRef;
          allRawDataSchemas.push(rawDataSchema);
          await this.populateRawDataSchemas(rawDataSchema, tenantId, allRawDataSchemas, true, allRefSchemas);
        } catch (error) {
          // catch and continue
          console.log('failed to load rawData schema', error);
        }
      }
    }
  }
}
