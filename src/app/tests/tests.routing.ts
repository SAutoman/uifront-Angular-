/**
 * global
 */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { AllTestsComponent } from './pages/all-tests/all-tests.component';

export const testsMainRoute = 'tests';
export const dataSeedRoute = 'data-seed';
export const appsTestsRoute = 'apps';
export const tenantsTestsRoute = 'tenants';
export const tenantFieldsTestsRoute = 'tenantFields';
export const schemasTestRoute = 'schemas';
export const dynamicEntityRoute = 'dynamicEntity';
export const listsRoute = 'lists';
export const expressionsRoute = 'expressions';
export const workflowRoute = 'workflow';
export const tenantSettingsRoute = 'tenantSettings';
export const processstepsRoute = 'workflow-process-steps';
export const workflowStatusesRoute = 'workflow-statuses';
export const workflowTransitionsRoute = 'workflow-transitions';
export const workflowLinksRoute = 'workflow-links';
export const workflowStateRoute = 'workflow-state';
export const workflowActionEventsRoute = 'workflow-action-events';
export const allTestsRoute = 'all-tests';
export const mappingsRoute = 'mappings';
export const notificationTemplatesRoute = 'notification-templates';
export const notifiationsTestsRoute = 'notifications';
export const emailAuditsTestsRoute = 'email-audits';
export const notificationsTriiggerTestsRoute = 'notifications-trigger';
export const usersTestsRoute = 'users';
export const userTopicRoute = 'user-topic';

export const TestsRoutes: Routes = [
  // {
  //   path: allTestsRoute,
  //   component: AllTestsComponent
  // },
  {
    path: workflowActionEventsRoute,
    loadChildren: () =>
      import('./pages/workflow-action-events-tests/workflow-action-events-tests.module').then((x) => x.WorkflowActionTestsModule)
  },
  {
    path: dataSeedRoute,
    loadChildren: () => import('./pages/data-seed/data-seed.module').then((x) => x.DataSeedModule)
  },
  {
    path: appsTestsRoute,
    loadChildren: () => import('./pages/app-tests/app-tests.module').then((x) => x.AppTestsModule)
  },
  {
    path: tenantsTestsRoute,
    loadChildren: () => import('./pages/tenant-tests/tenant-tests.module').then((x) => x.TenantTestsModule)
  },
  {
    path: tenantFieldsTestsRoute,
    loadChildren: () => import('./pages/tenant-fields-tests/tenant-fields-tests.module').then((x) => x.TenantFieldsTestsModule)
  },
  {
    path: schemasTestRoute,
    loadChildren: () => import('./pages/schema-tests/schema-tests.module').then((x) => x.SchemaTestsModule)
  },
  {
    path: dynamicEntityRoute,
    loadChildren: () => import('./pages/dynamic-entity-tests/dynamic-entity-tests.module').then((x) => x.DynamicEntityTestsModule)
  },
  {
    path: listsRoute,
    loadChildren: () => import('./pages/lists-tests/lists-tests.module').then((x) => x.ListsTestsModule)
  },
  {
    path: expressionsRoute,
    loadChildren: () => import('./pages/expressions-tests/expressions-tests.module').then((x) => x.ExpressionsTestsModule)
  },
  {
    path: workflowRoute,
    loadChildren: () => import('./pages/workflow-tests/workflow-tests.module').then((x) => x.WorkflowTestsModule)
  },
  {
    path: tenantSettingsRoute,
    loadChildren: () => import('./pages/tenant-settings-tests/tenant-settings-tests.module').then((x) => x.TenantSettingsModule)
  },
  {
    path: processstepsRoute,
    loadChildren: () =>
      import('./pages/workflow-process-step-tests/workflow-process-step-tests.module').then((x) => x.WorkflowProcessStepTestsModule)
  },
  {
    path: workflowStatusesRoute,
    loadChildren: () => import('./pages/workflow-status-tests/workflow-status-tests.module').then((x) => x.WorkflowStatusTestModule)
  },
  {
    path: workflowTransitionsRoute,
    loadChildren: () =>
      import('./pages/workflow-transition-tests/workflow-transition-tests.module').then((x) => x.WorkflowTransitionTestModule)
  },
  {
    path: workflowLinksRoute,
    loadChildren: () => import('./pages/workflow-links-tests/workflow-links-tests.module').then((x) => x.WorkflowLinksTestsModule)
  },
  {
    path: workflowStateRoute,
    loadChildren: () => import('./pages/workflow-state-tests/workflow-state-tests.module').then((x) => x.WorkflowStateTestsModule)
  },
  {
    path: mappingsRoute,
    loadChildren: () => import('./pages/mappings-tests/mappings-tests.module').then((x) => x.MappingsTestsModule)
  },
  {
    path: notificationTemplatesRoute,
    loadChildren: () =>
      import('./pages/notification-templates-tests/notification-template-tests.module').then((x) => x.NotificationTemplateTestsModule)
  },
  {
    path: userTopicRoute,
    loadChildren: () => import('./pages/user-topic-tests/user-topic-tests.module').then((x) => x.UserTopicTestsModule)
  },
  {
    path: notifiationsTestsRoute,
    loadChildren: () => import('./pages/notification-tests/notification-tests.module').then((x) => x.NotificationTestsModule)
  },
  {
    path: emailAuditsTestsRoute,
    loadChildren: () => import('./pages/email-audits-tests/email-audit-tests.module').then((x) => x.EmailAuditTestsModule)
  },
  {
    path: notificationsTriiggerTestsRoute,
    loadChildren: () =>
      import('./pages/notifications-trigger-test/notifications-trigger-tests.module').then((x) => x.NotificationsTriggerTestsModule)
  },
  {
    path: usersTestsRoute,
    loadChildren: () => import('./pages/users-tests/users-tests.module').then((x) => x.UsersTestsModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(TestsRoutes)],
  exports: [RouterModule]
})
export class TestsRoutingModule {}
