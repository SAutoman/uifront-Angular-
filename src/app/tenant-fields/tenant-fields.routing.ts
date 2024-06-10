/**
 * global
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

/**
 * project
 */

/**
 * local
 */
import { PageTenantFieldsComponent } from './page-tenant-fields/page-tenant-fields.component';
const routes: Routes = [
  {
    path: '',
    component: PageTenantFieldsComponent,
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TenantFieldsRoutingModule {}
