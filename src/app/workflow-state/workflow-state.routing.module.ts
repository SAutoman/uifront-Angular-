/**
 * global
 */
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { WorkflowStateComponent } from './workflow-state.component';
import { WorkflowStateUnsavedDataGuard } from './workflow-state-unsaved-data-guard';
import { WorkflowStatesListComponent } from './workflow-states-list/workflow-states-list.component';
import { StepFieldLinkDataResolver } from '@wfm/service-layer/helpers/step-field-link-data.resolver';

/**
 * project
 */

export const workflowStatesMainRoute = 'workflow-states';
export const workflowStatesListRoute = 'list';
export const workflowStateUpdate = 'update';
export const workflowStatesListWithIdRoute = 'list/:workflowId';

export const WorkflowStatesRoutes: Routes = [
  {
    path: `${workflowStateUpdate}/:workflowStateId/:workflowId`,
    component: WorkflowStateComponent,
    canDeactivate: [WorkflowStateUnsavedDataGuard],
    resolve: { stepFieldData: StepFieldLinkDataResolver }
  },
  {
    path: workflowStatesListWithIdRoute,
    component: WorkflowStatesListComponent
  },
  {
    path: workflowStatesListRoute,
    component: WorkflowStatesListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(WorkflowStatesRoutes)],
  exports: [RouterModule],
  providers: [WorkflowStateUnsavedDataGuard]
})
export class WorkflowStatesRoutingModule {}
