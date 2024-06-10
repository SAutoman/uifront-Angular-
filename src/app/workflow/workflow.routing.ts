/**
 * global
 */
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
// import { PageFieldSettingsVisibilityComponent } from '@wfm/forms-flow-struct/page-field-settings-visibility/page-field-settings-visibility.component';

export const workflowMainRoute = 'workflows';
export const workflowStatusRoute = 'statuses';
export const workflowProcessStepRoute = 'process-steps';
export const workflowRoute = 'workflow';
// export const rawDataFields = 'raw-data-fields';
export const orchestratorRoute = 'orchestrator-area';

export const WorkflowsRoutes: Routes = [
  {
    path: workflowStatusRoute,
    loadChildren: () => import('./../tenant-admin/workflow-statuses/workflow-statuses.module').then((x) => x.WorkflowStatusesModule)
  },
  {
    path: workflowProcessStepRoute,
    loadChildren: () =>
      import('./../tenant-admin/workflow-process-steps/workflow-process-steps.module').then((x) => x.WorkflowProcessStepsModule)
  },
  {
    path: workflowRoute,
    loadChildren: () => import('./../tenant-admin/workflows/workflows.module').then((x) => x.WorkflowsModule)
  },
  // {
  //   path: rawDataFields,
  //   component: PageFieldSettingsVisibilityComponent
  // },
  {
    path: orchestratorRoute,
    loadChildren: () => import('./../tenant-admin/orchestrator-area/orchestrator-area.module').then((x) => x.OrchestratorAreaModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(WorkflowsRoutes)],
  exports: [RouterModule]
})
export class WorkflowRoutingModule {}
