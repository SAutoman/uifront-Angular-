/**
 * global
 */
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

/**
 * project
 */
import { TestUiModule } from '@wfm/tests/modules/test-ui/test-ui.module';

import { ServiceLayerModule } from '@wfm/service-layer/service-layer.module';

/**
 * local
 */
import { NotificationTestsComponent } from './notification-tests.component';
import { NotificationTopicService } from '@wfm/service-layer/services/notification-topic.service';
import {
  ClearNotificationConfigurationsTestService,
  CreateSupplierAndAuditorMappingAndCaseTestService,
  CreateSupplierMappingAndRawDataTestService,
  SeedInvitationConfigurationsTestService,
  SeedNewRawDataConfigurationsTestService,
  SeedNewWorkflowConfigurationsTestService,
  SendNotificationForCaseTestService,
  SendNotificationForInvitationTestService,
  SendNotificationTestService,
  SendTwoNotificationsWithTheSameTemplateForCaseTestService,
  SendTwoNotificationsWithTheSameTemplateTestService
} from './notifications-test.service';

@NgModule({
  declarations: [NotificationTestsComponent],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: NotificationTestsComponent,
        pathMatch: 'full'
      }
    ]),
    ServiceLayerModule,
    TestUiModule
  ],
  exports: [RouterModule, NotificationTestsComponent],
  providers: [
    NotificationTopicService,
    SendNotificationTestService,
    SendTwoNotificationsWithTheSameTemplateTestService,
    SeedNewRawDataConfigurationsTestService,
    SeedNewWorkflowConfigurationsTestService,
    SeedInvitationConfigurationsTestService,
    CreateSupplierMappingAndRawDataTestService,
    CreateSupplierAndAuditorMappingAndCaseTestService,
    ClearNotificationConfigurationsTestService,
    SendNotificationForCaseTestService,
    SendTwoNotificationsWithTheSameTemplateForCaseTestService,
    SendNotificationForInvitationTestService
  ]
})
export class NotificationTestsModule {}
