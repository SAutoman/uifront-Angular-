import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CompanyComponent } from '@wfm/users/company/company.component';
import { CreateCompanyComponent } from '@wfm/users/create-company/create-company.component';

import { CompaniesKendoGridComponent } from './companies-kendo-grid/companies-kendo-grid.component';

export const companiesMainRoute = 'companies';
export const listCompaniesRoute = 'list';
export const createCompanyRoute = 'create';
export const editCompanyRoute = 'edit';

export const CompanyRoutes: Routes = [
  {
    path: listCompaniesRoute,
    component: CompaniesKendoGridComponent
  },
  {
    path: createCompanyRoute,
    component: CreateCompanyComponent
  },
  {
    path: `${editCompanyRoute}/:id`,
    component: CreateCompanyComponent
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forChild(CompanyRoutes)],
  exports: [RouterModule]
})
export class CompaniesRoutingModule {}
