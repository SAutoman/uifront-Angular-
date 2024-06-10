/**
 * global
 */
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

/**
 * project
 */
import { ServiceLayerModule } from '@wfm/service-layer/service-layer.module';
import { TestUiModule } from '@wfm/tests/modules/test-ui';

/**
 * local
 */
import { WorkflowStateTestsComponent } from './workflow-state-tests.component';

@NgModule({
  declarations: [WorkflowStateTestsComponent],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: WorkflowStateTestsComponent,
        pathMatch: 'full'
      }
    ]),

    ServiceLayerModule,
    TestUiModule
  ],
  exports: [RouterModule, WorkflowStateTestsComponent]
})
export class WorkflowStateTestsModule {}
