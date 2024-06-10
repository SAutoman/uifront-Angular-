/**
 * global
 */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/**
 * project
 */

/**
 * local
 */
import { ProcessStepComponent } from './process-step/process-step.component';
import { ProcessStepListComponent } from './process-step-list/process-step-list.component';

export const processStepMainRoute = 'process-step';
export const build = 'build';
export const processStepLists = 'created-steps';
export const editProcessStep = 'edit/:id';
export const processStepViewRoute = 'process-step/created-steps';

export const ProcessStepRoutes: Routes = [
  {
    path: build,
    component: ProcessStepComponent
  },
  {
    path: processStepLists,
    component: ProcessStepListComponent
  },
  {
    path: editProcessStep,
    component: ProcessStepComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(ProcessStepRoutes)],
  exports: [RouterModule]
})
export class ProcessStepRoutingModule {}
