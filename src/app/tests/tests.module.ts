/**
 * global
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MaterialModule } from '@wfm/material-module';
import { TestUiModule } from './modules/test-ui';
import { AppTestsModule } from './pages/app-tests/app-tests.module';
import { DeleteAllAboutTenantTestsModule } from './pages/delete-all-about-tenant/delete-all-about-tenant-tests.module';
import { DynamicEntityTestsModule } from './pages/dynamic-entity-tests/dynamic-entity-tests.module';
import { ExpressionsTestsModule } from './pages/expressions-tests/expressions-tests.module';
import { DynamicEntityHelper } from './pages/helpers/dynamicEntityHelper';
import { SchemaHelper } from './pages/helpers/schemaHelper';
import { StatusHelper } from './pages/helpers/statusHelper';
import { TenantFieldsHelper } from './pages/helpers/tenantFieldsHelper';
import { TransitionHelper } from './pages/helpers/transitionHelper';
import { WorkflowHelper } from './pages/helpers/workflowHelper';
import { ListsTestsModule } from './pages/lists-tests/lists-tests.module';
import { SchemaTestsModule } from './pages/schema-tests/schema-tests.module';
import { TenantFieldsTestsModule } from './pages/tenant-fields-tests/tenant-fields-tests.module';
import { TenantSettingsModule } from './pages/tenant-settings-tests/tenant-settings-tests.module';
import { TenantTestsModule } from './pages/tenant-tests/tenant-tests.module';
import { ValidatorsTestsModule } from './pages/validators-tests/validators-tests.module';
import { WorkflowActionTestsModule } from './pages/workflow-action-events-tests/workflow-action-events-tests.module';
import { WorkflowLinksTestsModule } from './pages/workflow-links-tests/workflow-links-tests.module';
import { WorkflowProcessStepTestsModule } from './pages/workflow-process-step-tests/workflow-process-step-tests.module';
import { WorkflowStateTestsModule } from './pages/workflow-state-tests/workflow-state-tests.module';
import { WorkflowStatusTestModule } from './pages/workflow-status-tests/workflow-status-tests.module';
import { WorkflowTestsModule } from './pages/workflow-tests/workflow-tests.module';
import { WorkflowTransitionTestModule } from './pages/workflow-transition-tests/workflow-transition-tests.module';

/**
 * project
 */

/**
 * local
 */
import { TestsRoutingModule } from './tests.routing';
import { MappingsTestsModule } from './pages/mappings-tests/mappings-tests.module';

import { NotificationTemplateTestsModule } from './pages/notification-templates-tests/notification-template-tests.module';
import { NotificationTestsModule } from './pages/notification-tests/notification-tests.module';
import { UsersTestsModule } from './pages/users-tests/users-tests.module';
import { EmailAuditTestsModule } from './pages/email-audits-tests/email-audit-tests.module';
import { SharedModule } from '@wfm/shared/shared.module';

@NgModule({
  declarations: [],
  providers: [TenantFieldsHelper, SchemaHelper, StatusHelper, WorkflowHelper, DynamicEntityHelper, TransitionHelper],
  imports: [
    TestsRoutingModule,
    AppTestsModule,
    TestUiModule,
    ExpressionsTestsModule,
    CommonModule,
    MaterialModule,
    DeleteAllAboutTenantTestsModule,
    DynamicEntityTestsModule,
    ListsTestsModule,
    SchemaTestsModule,
    TenantFieldsTestsModule,
    TenantSettingsModule,
    TenantTestsModule,
    ValidatorsTestsModule,
    WorkflowActionTestsModule,
    WorkflowLinksTestsModule,
    WorkflowStateTestsModule,
    WorkflowProcessStepTestsModule,
    WorkflowStatusTestModule,
    WorkflowTestsModule,
    WorkflowTransitionTestModule,
    MappingsTestsModule,
    NotificationTemplateTestsModule,
    NotificationTestsModule,
    EmailAuditTestsModule,
    UsersTestsModule,
    SharedModule
  ]
})
export class TestsModule {}
