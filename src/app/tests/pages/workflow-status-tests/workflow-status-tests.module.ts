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
import { WorkflowStatusTestsComponent } from './workflow-status-tests.components';

@NgModule({
  declarations: [WorkflowStatusTestsComponent],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: WorkflowStatusTestsComponent,
        pathMatch: 'full'
      }
    ]),

    ServiceLayerModule,
    TestUiModule
  ],
  exports: [RouterModule, WorkflowStatusTestsComponent]
})
export class WorkflowStatusTestModule {}
