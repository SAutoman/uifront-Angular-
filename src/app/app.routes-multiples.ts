/**
 * local
 */
import { tenantsMainRoute } from './tenants/tenants.routing';
import { tenantMainRoute, tenantSchemas } from './tenant-admin/tenant-admin.routing';
import { FullComponent } from './layouts/full/full.component';
import { AuthGuard } from './store/auth/auth.guard';
import { dataMainRoute } from './raw-data/raw-data.routing';
import { usersMainRoute } from './users/users.routing';
import { notificationMainRoute } from './notification-message/notification-message.routing';
import { invitationMainRoute } from './invitations/invitations.routing';
import { mappingsMainRoute } from './mappings/mappings.routing';
import { testsMainRoute } from './tests/tests.routing';
import { operationsMainRoute } from './operations/operations.routing';
import { workflowStatesMainRoute } from './workflow-state/workflow-state.routing.module';
import { workflowMainRoute } from './workflow/workflow.routing';
import { emailAuditsMainRoute } from './email-audit/email-audit.routing';
import { TenantAdminGuard } from './shared/tenant-admin.guard';
import { NotificationBuilderMainRoute } from './notification-builder/notification-builder-constants';
import { WebhooksBuilderMainRoute } from './webhooks-builder/webhook-builder-constants';
import { DevModeGuard } from './shared/dev-mode.guard';
import { tenantCompaniesRoute } from './tenant-companies/tenant-companies.routing';
import { reportsMainRoute } from './report/report.routing';
import { ApiClientsMainRoute } from './api clients/api-clients.constants';

export const AppRoutesMultiples = {
  path: '',
  component: FullComponent,
  children: [
    {
      path: dataMainRoute,
      loadChildren: () => import('./raw-data/raw-data.module').then((m) => m.RawDataModule)
    },
    {
      path: workflowStatesMainRoute,
      loadChildren: () => import('./workflow-state/workflow-state.module').then((m) => m.WorkflowStateModule)
    },
    {
      path: reportsMainRoute,
      loadChildren: () => import('./report/report.module').then((m) => m.ReportModule)
    },
    {
      path: usersMainRoute,
      loadChildren: () => import('./users/users.module').then((m) => m.UsersModule)
    },
    {
      path: workflowMainRoute,
      loadChildren: () => import('./workflow/workflow.module').then((m) => m.WorkflowModule),
      canActivate: [TenantAdminGuard]
    },

    {
      path: tenantMainRoute,
      loadChildren: () => import('./tenant-admin/tenant-admin.module').then((m) => m.TenantAdminModule),
      canActivate: [TenantAdminGuard]
    },
    {
      path: notificationMainRoute,
      loadChildren: () => import('./notification-message/notification-message.module').then((m) => m.NotificationMessageModule)
    },
    {
      path: tenantsMainRoute,
      loadChildren: () => import('./tenants/tenants.module').then((m) => m.TenantsModule)
    },
    {
      path: invitationMainRoute,
      loadChildren: () => import('./invitations/invitations.module').then((m) => m.InvitationsModule),
      canActivate: [TenantAdminGuard]
    },
    {
      path: mappingsMainRoute,
      loadChildren: () => import('./mappings/mappings.module').then((m) => m.MappingsModule),
      canActivate: [TenantAdminGuard]
    },
    {
      path: testsMainRoute,
      loadChildren: () => import('./tests/tests.module').then((m) => m.TestsModule),
      canActivate: [TenantAdminGuard, DevModeGuard]
    },
    {
      path: operationsMainRoute,
      loadChildren: () => import('./operations/operations.module').then((m) => m.OperationsModule),
      canActivate: [TenantAdminGuard]
    },
    {
      path: emailAuditsMainRoute,
      loadChildren: () => import('./email-audit/email-audit.module').then((m) => m.EmailAuditModule),
      canActivate: [TenantAdminGuard]
    },
    {
      path: NotificationBuilderMainRoute,
      loadChildren: () => import('./notification-builder/notification-builder.module').then((m) => m.NotificationBuilderModule)
    },
    {
      path: WebhooksBuilderMainRoute,
      loadChildren: () => import('./webhooks-builder/webhooks-builder.module').then((m) => m.WebhooksBuilderModule)
    },
    {
      path: tenantSchemas,
      loadChildren: () => import('./forms-flow-struct/forms-flow-struct.module').then((x) => x.FormsFlowStructModule)
    },
    {
      path: tenantCompaniesRoute,
      loadChildren: () => import('./tenant-companies/tenant-companies.module').then((m) => m.TenantCompaniesModule)
    },
    {
      path: ApiClientsMainRoute,
      loadChildren: () => import('./api clients/api-clients/api-clients.module').then((m) => m.ApiClientsModule)
    }
  ],
  canActivate: [AuthGuard]
};
