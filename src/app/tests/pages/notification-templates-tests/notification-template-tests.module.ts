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
import { NotificationTemplateTestsComponent } from './notification-template-tests.component';
import {
  GetNotificationTemplateTestService,
  SearchNotificationTemplateTestService,
  DeleteNotificationTemplateTestService,
  UpdateNotificationTemplateTestService,
  CreateNotificationTemplateTestService,
  SeedGDCCasesTemplateTestService,
  SeedGDCRawDataTemplateTestService,
  SeedBeckerRawDataTemplateTestService,
  SeedBeckerCasesTemplateTestService,
  SeedBeckerInvitationsTemplateTestService,
  SeedGDCInvitationsTemplateTestService,
  SeedPorscheRawDataTemplateTestService,
  SeedPorscheCasesTemplateTestService,
  SeedPorscheInvitationsTemplateTestService
} from './notification-template-test.service';

@NgModule({
  declarations: [NotificationTemplateTestsComponent],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: NotificationTemplateTestsComponent,
        pathMatch: 'full'
      }
    ]),
    ServiceLayerModule,
    TestUiModule
  ],
  providers: [
    GetNotificationTemplateTestService,
    SearchNotificationTemplateTestService,
    DeleteNotificationTemplateTestService,
    UpdateNotificationTemplateTestService,
    CreateNotificationTemplateTestService,
    SeedGDCCasesTemplateTestService,
    SeedGDCRawDataTemplateTestService,
    SeedGDCInvitationsTemplateTestService,
    SeedBeckerRawDataTemplateTestService,
    SeedBeckerCasesTemplateTestService,
    SeedBeckerInvitationsTemplateTestService,
    SeedPorscheRawDataTemplateTestService,
    SeedPorscheCasesTemplateTestService,
    SeedPorscheInvitationsTemplateTestService
  ],
  exports: [RouterModule, NotificationTemplateTestsComponent]
})
export class NotificationTemplateTestsModule {}
