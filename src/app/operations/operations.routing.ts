/**
 * global
 */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OperationsComponent } from './operations/operations.component';

export const operationsMainRoute = 'operations';
export const operationsListRoute = 'list';

export const OperationsRoutes: Routes = [
  {
    path: operationsListRoute,
    component: OperationsComponent
  },
  {
    path: '',
    redirectTo: operationsListRoute,
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(OperationsRoutes)],
  exports: [RouterModule]
})
export class OperationsRoutingModule {}
