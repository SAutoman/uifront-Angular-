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
import { WorkflowTestsComponent } from './workflow-tests.components';

@NgModule({
  declarations: [WorkflowTestsComponent],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: WorkflowTestsComponent,
        pathMatch: 'full'
      }
    ]),

    ServiceLayerModule,
    TestUiModule
  ],
  exports: [RouterModule, WorkflowTestsComponent]
})
export class WorkflowTestsModule {}
