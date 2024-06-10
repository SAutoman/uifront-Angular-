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
import { NotificationTopicService } from '@wfm/service-layer/services/notification-topic.service';
import { NotificationsTriggerTestsComponent } from './notifications-trigger-test.component';
import { SetActiveSessionsEndDateTestService } from './TriggerNotificationsTestService';

@NgModule({
  declarations: [NotificationsTriggerTestsComponent],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: NotificationsTriggerTestsComponent,
        pathMatch: 'full'
      }
    ]),
    ServiceLayerModule,
    TestUiModule
  ],
  exports: [RouterModule, NotificationsTriggerTestsComponent],
  providers: [NotificationTopicService, SetActiveSessionsEndDateTestService]
})
export class NotificationsTriggerTestsModule {}
