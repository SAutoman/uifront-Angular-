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
import { WorkflowProcessStepTestsComponent } from './workflow-process-step-tests.component';

@NgModule({
  declarations: [WorkflowProcessStepTestsComponent],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: WorkflowProcessStepTestsComponent,
        pathMatch: 'full'
      }
    ]),

    ServiceLayerModule,
    TestUiModule
  ],
  exports: [RouterModule, WorkflowProcessStepTestsComponent]
})
export class WorkflowProcessStepTestsModule {}
