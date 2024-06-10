import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PageTenantListsComponent } from './page-tenant-lists/page-tenant-lists.component';

export const TenantListsRoutes: Routes = [
  {
    path: '',
    component: PageTenantListsComponent,
    pathMatch: 'full'
  }
];
@NgModule({
  imports: [RouterModule.forChild(TenantListsRoutes)],
  exports: [RouterModule]
})
export class TenantListsRoutingModule {}
