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
import { WorkflowTransitionTestsComponent } from './workflow-transition-tests.componens';

@NgModule({
  declarations: [WorkflowTransitionTestsComponent],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: WorkflowTransitionTestsComponent,
        pathMatch: 'full'
      }
    ]),

    ServiceLayerModule,
    TestUiModule
  ],
  exports: [RouterModule, WorkflowTransitionTestsComponent]
})
export class WorkflowTransitionTestModule {}
