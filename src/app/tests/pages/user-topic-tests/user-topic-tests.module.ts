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
import { UserTopicTestsComponent } from './user-topic-tests.component';

@NgModule({
  declarations: [UserTopicTestsComponent],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: UserTopicTestsComponent,
        pathMatch: 'full'
      }
    ]),
    ServiceLayerModule,
    TestUiModule
  ],
  exports: [RouterModule, UserTopicTestsComponent]
})
export class UserTopicTestsModule {}
