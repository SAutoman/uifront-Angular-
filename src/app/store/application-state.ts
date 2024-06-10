/**
 * global
 */
import * as fromRouter from '@ngrx/router-store';
import { ActionReducerMap } from '@ngrx/store';

/**
 * project
 */

/**
 * local
 */
import { DateFormatState, dateFormatReducer, initialDateFormatState } from './date-format/date-format.reducer';
// import { CasesListState, casesListReducer, initialCasesListState } from '../obsolete-components/obsolete-store/cases-list/cases-list.reducer';

import { AuthState, initialAuthState, authReducer } from './auth/auth.reducer';
import { UsersState, initialUsersState, usersReducer } from './users/users.reducer';

import { companyReducer, CompanyState, initialCompanyState } from './company/company.reducer';
// import { RawDataFieldsState, RawDataFieldsReducer, initialRawDataFieldsState } from './raw-data-fields/raw-data-fields.reducer';
// import { ListAreaState, ListAreaReducer, initialListAreaState } from '../obsolete-components/store/list-area/list-area.reducer';
// import { ListAreaItemsReducer, initialListAreaItemsState, ListAreaItemsState } from './list-area-items/list-area-items.reducer';
import { InvitationsState, invitationsReducer, initialInvitationsState } from './invitation-tool/invitation-tool.reducer';
import { TenantsState, tenantsReducer, initialTenantsState } from './tenants/tenants.reducer';
import { gridLayoutsReducer, initialGridLayoutsState, GridLayoutsState } from './grid-layouts/grid-layouts.reducer';
import { MappingsState, mappingsReducer, initialMappingsState } from './mappings/mappings.reducer';
import { initialOperationsState, operationsReducer, OperationsState } from './operations/operations.reducer';
import { schemaReducer, SchemasState, initialSchemasState } from './schema';
import { initialWorkflowState, workflowReducer, WorkflowState } from './workflow';
import { initialWorkflowBuilderState, workflowBuilderReducer, WorkflowBuilderState } from './workflow-builder';
import {
  initialNotificationBuilderState,
  nfBuilderReducer,
  NotificationBuilderState
} from './notification-builder/notification-builder-reducer';
import { initialWebHookBuilderState, WebHookBuilderState, webHooksBuilderReducer } from './webhooks-builder/webhooks-builder-reducer';
import { RouterStateUrl } from './ui-state/custom-router-serializer';
import { initialFieldsState, tenantFieldsReducer, TenantFieldsState } from './tenant-fields';
import { initialTenantListsState, tenantListsReducer, TenantListsState } from './tenant-lists';
import { appSettingsReducer, AppSettingsState, initialAppSettingsState } from './app-settings/app-settings.reducer';
import { initialOrchestratorState, orchestratorReducer, OrchestratorState } from './orchestrator';
import { ReportDatasourceState, initialReportDatasourceState, reportReducer } from './report-datasource';
import { apiClientReducer, ApiClientState, initialApiClientState } from './api clients/api-clients-reducer';
import { UserSettingsState, initialUserSettingsState, userSettingsReducer } from './user-settings/user-settings.reducer';

export interface ApplicationState {
  routerReducer: fromRouter.RouterReducerState<RouterStateUrl>;
  auth: AuthState;
  users: UsersState;
  companies: CompanyState;
  tenantLists: TenantListsState;
  tenantFields: TenantFieldsState;
  invitations: InvitationsState;
  dateFormat: DateFormatState;
  tenantsState: TenantsState;
  gridLayoutsState: GridLayoutsState;
  mappingsState: MappingsState;
  operationsState: OperationsState;
  schemasState: SchemasState;
  workflow: WorkflowState;
  workflowBuilder: WorkflowBuilderState;
  nfBuilder: NotificationBuilderState;
  webHookBuilder: WebHookBuilderState;
  appSettings: AppSettingsState;
  orchestrator: OrchestratorState;
  reportDatasource: ReportDatasourceState;
  apiClient: ApiClientState;
  userSettingsState: UserSettingsState;
}

export const reducers: ActionReducerMap<ApplicationState> = {
  routerReducer: fromRouter.routerReducer,
  auth: authReducer,
  users: usersReducer,
  companies: companyReducer,
  tenantLists: tenantListsReducer,
  tenantFields: tenantFieldsReducer,
  invitations: invitationsReducer,
  dateFormat: dateFormatReducer,
  tenantsState: tenantsReducer,
  gridLayoutsState: gridLayoutsReducer,
  mappingsState: mappingsReducer,
  operationsState: operationsReducer,
  schemasState: schemaReducer,
  workflow: workflowReducer,
  workflowBuilder: workflowBuilderReducer,
  nfBuilder: nfBuilderReducer,
  webHookBuilder: webHooksBuilderReducer,
  appSettings: appSettingsReducer,
  orchestrator: orchestratorReducer,
  reportDatasource: reportReducer,
  apiClient: apiClientReducer,
  userSettingsState: userSettingsReducer
};

export const INITIAL_APPLICATION_STATE: ApplicationState = {
  routerReducer: undefined,
  auth: initialAuthState,
  users: initialUsersState,
  companies: initialCompanyState,
  tenantLists: initialTenantListsState,
  tenantFields: initialFieldsState,
  invitations: initialInvitationsState,
  dateFormat: initialDateFormatState,
  tenantsState: initialTenantsState,
  gridLayoutsState: initialGridLayoutsState,
  mappingsState: initialMappingsState,
  operationsState: initialOperationsState,
  schemasState: initialSchemasState,
  workflow: initialWorkflowState,
  workflowBuilder: initialWorkflowBuilderState,
  nfBuilder: initialNotificationBuilderState,
  webHookBuilder: initialWebHookBuilderState,
  appSettings: initialAppSettingsState,
  orchestrator: initialOrchestratorState,
  reportDatasource: initialReportDatasourceState,
  apiClient: initialApiClientState,
  userSettingsState: initialUserSettingsState
};
