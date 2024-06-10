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
import { WorkflowLinksTestsComponent } from './workflow-links-tests.component';
import {
  CreateWorkflowFieldLinkTestService,
  CreateWorkflowProcessStepLinkTestService,
  GetWorkflowFieldLinkTestService,
  DeleteWorkflowFieldLinkTestService,
  GetWorkflowProcessStepLinkTestService,
  GetWorkflowProcessStepLinkWithParentTestService,
  DeleteWorkflowProcessStepLinkTestService
} from './workflow-links-tests.service';

@NgModule({
  declarations: [WorkflowLinksTestsComponent],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: WorkflowLinksTestsComponent,
        pathMatch: 'full'
      }
    ]),

    ServiceLayerModule,
    TestUiModule
  ],
  providers: [
    CreateWorkflowFieldLinkTestService,
    CreateWorkflowProcessStepLinkTestService,
    GetWorkflowFieldLinkTestService,
    DeleteWorkflowFieldLinkTestService,
    GetWorkflowProcessStepLinkTestService,
    GetWorkflowProcessStepLinkWithParentTestService,
    DeleteWorkflowProcessStepLinkTestService
  ],
  exports: [RouterModule, WorkflowLinksTestsComponent]
})
export class WorkflowLinksTestsModule {}
