/**
 * global
 */
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * project
 */

/**
 * local
 */

import {
  ApplicationService,
  AppConfigService,
  UsersService,
  TenantsService,
  UserProfileService,
  StatePersistingService,
  RawDataImportService,
  ListsService,
  CompanyService,
  DocumentUploadService,
  UserGroupsService,
  UserSettingShareService,
  WorkflowService,
  DynamicEntitiesService,
  SchemasService,
  WorkflowStateService,
  WorkflowStatusService,
  WorkflowTransitionService,
  ProcessStepLinkService,
  ProcessStepEntityService,
  DataSeedService,
  ExternalIntegrationService,
  SentryService
} from './services';
import { AdminSchemasService } from './services/admin-schemas.service';
import { NotificationTemplateService } from './services/notification-template.service';
import { UserTopicService } from './services/user-topic.service';
import { EmailAuditService } from './services/email-audit.service';
import { NotificationsTriggerService } from './services/notifications-trigger.service';
import { NotificationTopicService } from './services/notification-topic.service';
import { WebHooksService } from './services/webhooks.service';
import { SchemaPermissionsHelper } from './helpers/schema-permissions.helper';
import { CaseEmailAuditService } from './services/case-email-audit.service';
import { RawDataEmailAuditService } from './services/raw-data-email-audit.service';
import { DeactivatedUsersService } from './services/deactivated-users.service';
import { UnsubscribeEmailService } from './services/unsubscribe-email.service';
import { NotificationProcessingSessionService } from './services/notification-processing-session-service';
import { CustomNumberFormatPipe } from '@wfm/pipes/custom-number-format.pipe';
import { SharedService } from './services/shared.service';
import { CustomDateFormatPipe } from '@wfm/pipes/custom-date-format.pipe';
import { CaseFieldLinkService } from './services/case-field-link.service';
import { WorkflowVisualPlanService } from './services/workflow-visual-plan.service';
import { WorkflowsConnectorService } from './services/workflows-connector.service';
import { OrchestratorsService } from './services/orchestrators.service';
import { DataSourceService } from './services/datasource.service';
import { ReportsService } from './services/reports.service';
import { SchemaValidatorsHelper } from './helpers/schema-validators.helper';
import { PostactionService } from './services/postaction.service';
import { ShortenerUrlService } from './services/shortner-url.service';
@NgModule({
  declarations: [],
  imports: [CommonModule, HttpClientModule],
  providers: [
    ApplicationService,
    AppConfigService,
    UserProfileService,
    UsersService,
    TenantsService,
    CompanyService,
    SchemasService,
    WorkflowService,
    ListsService,
    DocumentUploadService,
    CaseEmailAuditService,
    DeactivatedUsersService,
    StatePersistingService,
    UserGroupsService,
    UserSettingShareService,
    RawDataImportService,
    DynamicEntitiesService,
    AdminSchemasService,
    WorkflowStateService,
    WorkflowStatusService,
    WorkflowTransitionService,
    ProcessStepLinkService,
    ProcessStepEntityService,
    NotificationTemplateService,
    NotificationProcessingSessionService,
    UserTopicService,
    NotificationsTriggerService,
    UnsubscribeEmailService,
    EmailAuditService,
    RawDataEmailAuditService,
    DataSeedService,
    NotificationTopicService,
    WebHooksService,
    SchemaPermissionsHelper,
    ExternalIntegrationService,
    CustomDateFormatPipe,
    CustomNumberFormatPipe,
    SharedService,
    CaseFieldLinkService,
    WorkflowVisualPlanService,
    WorkflowsConnectorService,
    OrchestratorsService,
    DataSourceService,
    ReportsService,
    SchemaValidatorsHelper,
    ShortenerUrlService,
    SentryService,
    PostactionService
  ]
})
export class ServiceLayerModule {}
