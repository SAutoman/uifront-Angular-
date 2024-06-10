import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApiClientsListRoute } from '../api-clients.constants';
import { ApiClientsListComponent } from './api-clients-list/api-clients-list.component';

const routes: Routes = [
  {
    path: ApiClientsListRoute,
    component: ApiClientsListComponent
  },
  { path: '', redirectTo: ApiClientsListRoute, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApiClientsRoutingModule {}
