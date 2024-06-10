/**
 * global
 */
import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash-core';
import { select, Store } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';

/**
 * project
 */
import { BaseComponent } from '@wfm/shared/base.component';
import { tenantsMainRoute } from '@wfm/tenants/tenants.routing';
import { tenantMainRoute, tenantListsRoute, tenantFields, tenantSchemas } from '@wfm/tenant-admin/tenant-admin.routing';
import { userGroupsRoute, usersMainRoute, usersGridRoute, deactivatedUsersRoute } from '@wfm/users/users.routing';
import { dataViewRoute, dataMainRoute } from '@wfm/raw-data/raw-data.routing';
import { AppConfigService, SidebarLinksService } from '@wfm/service-layer/services';
import { invitationMainRoute, invitationToolRoute, invitationsRoute } from '@wfm/invitations/invitations.routing';
import {
  suppliersMainRoute,
  mappingsMainRoute,
  auditorsMainRoute,
  rawDataMappingRoute,
  caseMappingRoute,
  mappingSettings
} from '@wfm/mappings/mappings.routing';
import {
  appsTestsRoute,
  tenantFieldsTestsRoute,
  schemasTestRoute,
  tenantsTestsRoute,
  testsMainRoute,
  dynamicEntityRoute,
  listsRoute,
  expressionsRoute,
  tenantSettingsRoute,
  processstepsRoute,
  workflowStatusesRoute,
  workflowTransitionsRoute,
  workflowLinksRoute,
  dataSeedRoute,
  workflowStateRoute,
  workflowActionEventsRoute,
  mappingsRoute,
  notificationTemplatesRoute,
  notifiationsTestsRoute,
  usersTestsRoute,
  userTopicRoute,
  notificationsTriiggerTestsRoute,
  emailAuditsTestsRoute
} from '@wfm/tests/tests.routing';
import { operationsMainRoute } from '@wfm/operations/operations.routing';
import { workflowStatesMainRoute, workflowStatesListRoute } from '@wfm/workflow-state/workflow-state.routing.module';
import {
  orchestratorRoute,
  // rawDataFields,
  workflowMainRoute,
  workflowProcessStepRoute,
  workflowRoute,
  workflowStatusRoute
} from '@wfm/workflow/workflow.routing';
import { authUserProfileSelector } from '@wfm/store/auth/auth.selectors';
import { Profile, Roles } from '@wfm/service-layer';
import { casesAuditListRoute, emailAuditsMainRoute, rawDataAuditListRoute } from '@wfm/email-audit/email-audit.routing';
import {
  NotificationBuilderMainRoute,
  NotificationTemplatesRoute,
  NotificationTopicRoute
} from '@wfm/notification-builder/notification-builder-constants';
import { WebhooksBuilderMainRoute } from '@wfm/webhooks-builder/webhook-builder-constants';
import { ApiClientsCreateRoute, ApiClientsListRoute, ApiClientsMainRoute } from '@wfm/api clients/api-clients.constants';
import { tenantCompaniesRoute } from '@wfm/tenant-companies/tenant-companies.routing';
import { reportsMainRoute } from '@wfm/report/report.routing';
import { currentSelectedRoleNum } from '@wfm/store';
import { ApplicationState } from '@wfm/store/application-state';
/**
 * local
 */
import { convertTenantName } from '../utils';

export interface BadgeItem {
  type: string;
  value: string;
}
export interface Separator {
  name: string;
  type?: string;
}
export interface SubChildren {
  state: string;
  name: string;
  type?: string;
  setting?: any;
  useTenantPrefix?: boolean;
  isOpened?: boolean;
  selected?: boolean;
  isDefault?: boolean;
}
export interface ChildrenItems {
  state?: string;
  name: string;
  type?: string;
  child?: SubChildren[];
  setting?: any;
  color?: string;
  isOpened?: boolean;
  selected?: boolean;
  isHidden?: boolean;
}

export interface Menu {
  state: string;
  name: string;
  type: string;
  icon: string;
  badge?: BadgeItem[];
  separator?: Separator[];
  children?: ChildrenItems[];
  tenantName?: string;
  opened?: boolean;
  isSelected?: boolean;
}
export enum MenuItemType {
  separator = 'separator',
  sub = 'sub',
  subChild = 'subChild',
  link = 'link'
}

export enum MainMenuTypeEnum {
  ARTICLES = 'Articles',
  CASES = 'Cases',
  REPORTS = 'Reports'
}

@Injectable()
/**
 * @Injectable()
 * Use it as  Injectable in component constructor
 */
export class MenuItems extends BaseComponent {
  private _MENU_ITEMS: Menu[];
  private _ADMIN_MENU_ITEMS: Menu[];
  user: Profile;
  userRole: Roles;

  get MENU_ITEMS(): Menu[] {
    if (!this._MENU_ITEMS) {
      this._MENU_ITEMS = this.buildMenu();
    }
    return this._MENU_ITEMS;
  }

  get ADMIN_MENU_ITEMS(): Menu[] {
    if (!this._ADMIN_MENU_ITEMS) {
      this._ADMIN_MENU_ITEMS = this.buildAdminMenu();
    }
    return this._ADMIN_MENU_ITEMS;
  }

  constructor(private sidebarLinksService: SidebarLinksService, store: Store<ApplicationState>, private appConfig: AppConfigService) {
    super();

    this.sidebarLinksService.resetTenant = () => {
      this._MENU_ITEMS = null;
      this._ADMIN_MENU_ITEMS = null;
    };

    store.pipe(takeUntil(this.destroyed$), select(authUserProfileSelector)).subscribe((profileData) => (this.user = profileData));
    store.pipe(takeUntil(this.destroyed$), select(currentSelectedRoleNum)).subscribe((currentRole) => (this.userRole = currentRole));
  }

  buildMenu(): Menu[] {
    return [
      {
        state: '',
        name: 'Workflow Management',
        type: MenuItemType.separator,
        icon: 'workflow'
      },

      {
        state: `${dataMainRoute}`,
        name: MainMenuTypeEnum.ARTICLES,
        type: MenuItemType.sub,
        icon: 'raw-data',
        children: [{ state: `${dataViewRoute}`, name: 'Articles', type: MenuItemType.link }],
        tenantName: convertTenantName(this.sidebarLinksService.tenantName)
      },
      {
        state: `${workflowStatesMainRoute}`,
        name: MainMenuTypeEnum.CASES,
        type: MenuItemType.sub,
        icon: 'cases',
        children: [{ state: `${workflowStatesListRoute}`, name: 'Cases', type: MenuItemType.link }],
        tenantName: convertTenantName(this.sidebarLinksService.tenantName)
      },

      this.getReportsMenu()
    ];
  }

  getReportsMenu(): Menu {
    if (this.userRole === Roles.TenantAdmin || this.userRole === Roles.Tenant) {
      return {
        state: `${reportsMainRoute}`,
        name: MainMenuTypeEnum.REPORTS,
        type: MenuItemType.sub,
        icon: 'cases',
        children: [{ state: ``, name: 'Reports', type: MenuItemType.link }],
        tenantName: convertTenantName(this.sidebarLinksService.tenantName)
      };
    } else {
      return <Menu>{};
    }
  }

  buildAdminMenu(): Menu[] {
    return [
      {
        state: '',
        name: 'Workflow Management',
        type: MenuItemType.separator,
        icon: 'workflow'
      },
      {
        state: `${tenantMainRoute}`,
        name: 'Fields & Data',
        type: MenuItemType.sub,
        icon: 'raw-data',
        children: [
          { state: `${tenantListsRoute}`, name: 'Predefined List Items', type: MenuItemType.link },
          { state: `${tenantFields}`, name: 'Tenant Fields', type: MenuItemType.link }
        ],
        tenantName: convertTenantName(this.sidebarLinksService.tenantName)
      },
      {
        state: `${tenantSchemas}`,
        name: 'Schemas Overview',
        type: MenuItemType.link,
        icon: 'raw-data',
        tenantName: convertTenantName(this.sidebarLinksService.tenantName)
      },
      {
        state: `${workflowMainRoute}`,
        name: 'Workflow Builder',
        type: MenuItemType.sub,
        icon: 'workflow',
        children: [
          {
            state: `${workflowRoute}`,
            name: 'Workflow Schemas',
            type: MenuItemType.link
          },
          {
            state: `${workflowStatusRoute}`,
            name: 'Statuses',
            type: MenuItemType.link
          },
          {
            state: `${workflowProcessStepRoute}`,
            name: 'Process Steps',
            type: MenuItemType.link
          },
          {
            state: `${orchestratorRoute}`,
            name: 'Orchestrator Area',
            type: MenuItemType.subChild,
            child: [
              { state: 'connectors', name: 'Connectors', useTenantPrefix: true },
              { state: 'list', name: 'Orchestrators', useTenantPrefix: true }
            ]
          }
          // {
          //   state: `${rawDataFields}`,
          //   name: 'Raw Data Fields',
          //   type: MenuItemType.link
          // }
        ],
        tenantName: convertTenantName(this.sidebarLinksService.tenantName)
      },
      {
        state: NotificationBuilderMainRoute,
        name: 'Notification Builder',
        type: MenuItemType.sub,
        icon: 'email',
        children: [
          {
            state: NotificationTemplatesRoute,
            name: 'Templates',
            type: MenuItemType.link
          },
          {
            state: NotificationTopicRoute,
            name: 'Topics',
            type: MenuItemType.link
          }
        ],
        tenantName: convertTenantName(this.sidebarLinksService.tenantName)
      },
      {
        state: WebhooksBuilderMainRoute,
        name: 'WebHooks',
        type: MenuItemType.link,
        icon: 'settings',
        tenantName: convertTenantName(this.sidebarLinksService.tenantName)
      },
      {
        state: ApiClientsMainRoute,
        name: 'API Clients',
        type: MenuItemType.link,
        icon: 'settings',
        tenantName: convertTenantName(this.sidebarLinksService.tenantName)
      },
      {
        state: `${usersMainRoute}`,
        name: 'Users',
        type: MenuItemType.sub,
        icon: 'users',
        children: [
          { state: `${usersGridRoute}`, name: 'Users', type: MenuItemType.link },
          { state: `${userGroupsRoute}`, name: 'User Groups', type: MenuItemType.link },
          { state: `${deactivatedUsersRoute}`, name: 'Deactivated Users', type: MenuItemType.link }
        ],
        tenantName: convertTenantName(this.sidebarLinksService.tenantName)
      },
      {
        state: `${emailAuditsMainRoute}`,
        name: 'Email Audits',
        type: MenuItemType.sub,
        icon: 'email',
        children: [
          { state: `${rawDataAuditListRoute}`, name: 'Raw Data', type: MenuItemType.link },
          { state: `${casesAuditListRoute}`, name: 'Cases', type: MenuItemType.link }
        ],
        tenantName: convertTenantName(this.sidebarLinksService.tenantName)
      },
      {
        state: `${tenantsMainRoute}`,
        name: 'General',
        type: MenuItemType.link,
        icon: 'computer',
        tenantName: convertTenantName(this.sidebarLinksService.tenantName)
      },
      {
        state: `${tenantCompaniesRoute}`,
        name: 'Companies',
        type: MenuItemType.link,
        icon: 'list',
        tenantName: convertTenantName(this.sidebarLinksService.tenantName)
      },
      {
        state: `${invitationMainRoute}`,
        name: 'Invitations',
        type: MenuItemType.sub,
        icon: 'send',
        children: [
          { state: `${invitationToolRoute}`, name: 'Invitation Tool', type: MenuItemType.link },
          { state: `${invitationsRoute}`, name: 'Invitations', type: MenuItemType.link }
        ],
        tenantName: convertTenantName(this.sidebarLinksService.tenantName)
      },
      {
        state: `${mappingsMainRoute}`,
        name: 'Mappings',
        type: MenuItemType.sub,
        icon: 'map',
        children: [
          {
            state: `${rawDataMappingRoute}`,
            name: 'Raw Data',
            type: MenuItemType.subChild,
            child: [
              {
                useTenantPrefix: true,
                state: `${suppliersMainRoute}`,
                name: 'Supplier Mappings',
                type: MenuItemType.link
              },
              {
                useTenantPrefix: true,
                state: `${auditorsMainRoute}`,
                name: 'Auditor Mappings',
                type: MenuItemType.link
              },
              {
                useTenantPrefix: true,
                state: `${mappingSettings}`,
                name: 'Settings',
                type: MenuItemType.link
              }
            ]
          },
          {
            state: `${caseMappingRoute}`,
            name: 'Cases',
            type: MenuItemType.subChild,
            child: [
              {
                useTenantPrefix: true,
                state: `${suppliersMainRoute}`,
                name: 'Supplier Mappings',
                type: MenuItemType.link
              },
              {
                useTenantPrefix: true,
                state: `${auditorsMainRoute}`,
                name: 'Auditor Mappings',
                type: MenuItemType.link
              },
              {
                useTenantPrefix: true,
                state: `${mappingSettings}`,
                name: 'Settings',
                type: MenuItemType.link
              }
            ]
          }
        ],
        tenantName: convertTenantName(this.sidebarLinksService.tenantName)
      },
      this.getOperations(),
      this.getTests()
    ];
  }

  getOperations(): Menu {
    if (!this.user?.isAdmin) {
      return <Menu>{};
    }

    const operations: Menu = {
      state: `${operationsMainRoute}`,
      name: 'Operations',
      type: MenuItemType.link,
      icon: 'operations',
      tenantName: convertTenantName(this.sidebarLinksService.tenantName)
    };

    return operations;
  }

  getTests(): Menu {
    if (!this.user?.isAdmin || this.appConfig.config.production) {
      return <Menu>{};
    }

    const tests = {
      state: `${testsMainRoute}`,
      name: 'Tests',
      type: MenuItemType.sub,
      icon: 'check-circle',
      children: [
        { state: `${usersTestsRoute}`, name: 'Users Tests', type: MenuItemType.link },
        // { state: `${allTestsRoute}`, name: 'All Tests Execution', type: MenuItemType.link },
        { state: `${dataSeedRoute}`, name: 'Data Seed', type: MenuItemType.link },
        { state: `${appsTestsRoute}`, name: 'Application Tests', type: MenuItemType.link },
        { state: `${tenantsTestsRoute}`, name: 'Tenants Tests', type: MenuItemType.link },
        { state: `${tenantFieldsTestsRoute}`, name: 'Tenant fields Tests', type: MenuItemType.link },
        { state: `${schemasTestRoute}`, name: 'Schemas Tests', type: MenuItemType.link },
        { state: `${dynamicEntityRoute}`, name: 'Dynamic entity Tests', type: MenuItemType.link },
        { state: `${listsRoute}`, name: 'Lists Tests', type: MenuItemType.link },
        { state: `${expressionsRoute}`, name: 'Expressions Tests', type: MenuItemType.link },
        { state: `${workflowRoute}`, name: 'Workflow Tests', type: MenuItemType.link },
        { state: `${tenantSettingsRoute}`, name: 'Tenant settings Tests', type: MenuItemType.link },
        { state: `${processstepsRoute}`, name: 'Workflow process step entities Tests', type: MenuItemType.link },
        { state: `${workflowStatusesRoute}`, name: 'Workflow statuses Tests', type: MenuItemType.link },
        { state: `${workflowTransitionsRoute}`, name: 'Workflow transitions Tests', type: MenuItemType.link },
        { state: `${workflowLinksRoute}`, name: 'Workflow links Tests', type: MenuItemType.link },
        { state: `${workflowStateRoute}`, name: 'Workflow State Tests', type: MenuItemType.link },
        { state: `${workflowActionEventsRoute}`, name: 'Workflow Action Events Tests', type: MenuItemType.link },
        { state: `${mappingsRoute}`, name: 'Mappings Tests', type: MenuItemType.link },
        { state: `${notificationTemplatesRoute}`, name: 'Nofications Templates Tests', type: MenuItemType.link },
        { state: `${notificationsTriiggerTestsRoute}`, name: 'Nofications Trigger Tests', type: MenuItemType.link },
        { state: `${userTopicRoute}`, name: 'User Topic Tests', type: MenuItemType.link },
        { state: `${notifiationsTestsRoute}`, name: 'Notification Tests', type: MenuItemType.link },
        { state: `${emailAuditsTestsRoute}`, name: 'Email Audits Tests', type: MenuItemType.link }
      ],
      tenantName: convertTenantName(this.sidebarLinksService.tenantName)
    };

    return tests;
  }

  getMenuitem(): Menu[] {
    return this.MENU_ITEMS;
  }

  getAdminMenuitem(showRawDataMenu: boolean): Menu[] {
    let adminMenuItems: Menu[] = cloneDeep(this.ADMIN_MENU_ITEMS);
    if (!showRawDataMenu) {
      adminMenuItems = this.removeRawDataFromMappings(adminMenuItems);
    }
    return adminMenuItems;
  }

  removeRawDataFromMappings(menu: Menu[]): Menu[] {
    const indexOfMappings = menu.findIndex((x) => x.state === mappingsMainRoute);
    if (indexOfMappings >= 0) {
      const rawDataItemIndex = menu[indexOfMappings].children.findIndex((x) => x.state === rawDataMappingRoute);
      if (rawDataItemIndex >= 0) menu[indexOfMappings].children.splice(rawDataItemIndex, 1);
    }
    return menu;
  }
}
