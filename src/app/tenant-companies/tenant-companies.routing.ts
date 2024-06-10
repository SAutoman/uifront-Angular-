/**
 * global
 */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TenantCompaniesListComponent } from './tenant-companies-list/tenant-companies-list.component';

export const tenantCompaniesRoute = 'companies';
export const tenantCompaniesListRoute = 'list';

export const tenantCompaniesRoutes: Routes = [
  {
    path: '',
    redirectTo: tenantCompaniesListRoute,
    pathMatch: 'full'
  },
  {
    path: tenantCompaniesListRoute,
    component: TenantCompaniesListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(tenantCompaniesRoutes)],
  exports: [RouterModule]
})
export class TenantcompaniesRoutingModule {}
