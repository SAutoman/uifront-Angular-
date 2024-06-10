import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { WorkflowProcessStepsListComponent } from './workflow-process-steps-list/workflow-process-steps-list.component';
import { ProcessStepCreateComponent } from './process-step-create/process-step-create.component';
import { SharedModule } from '@wfm/shared/shared.module';

const routes: Route[] = [{ path: '', component: WorkflowProcessStepsListComponent }];

@NgModule({
  declarations: [ProcessStepCreateComponent, WorkflowProcessStepsListComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class WorkflowProcessStepsModule {}
