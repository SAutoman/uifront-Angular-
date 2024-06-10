import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { WorkflowStatusCreateComponent } from './workflow-status-create/workflow-status-create.component';
import { WorkflowStatusListComponent } from './workflow-status-list/workflow-status-list.component';
import { SharedModule } from '@wfm/shared/shared.module';
import { WorkflowStatusDeleteConfirmationComponent } from './workflow-status-delete-confirmation/workflow-status-delete-confirmation.component';

const routes: Route[] = [{ path: '', component: WorkflowStatusListComponent }];

@NgModule({
  declarations: [WorkflowStatusCreateComponent, WorkflowStatusListComponent, WorkflowStatusDeleteConfirmationComponent],
  imports: [RouterModule.forChild(routes), SharedModule]
})
export class WorkflowStatusesModule {}
