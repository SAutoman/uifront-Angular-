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

export const tenantMainRoute = 'admin';
export const tenantFields = 'tenant-fields';
export const tenantSchemas = 'schemas';
/**
 * @deprecated
 */
export const tenantRawDataFieldsRouteOld = 'raw-data-fields-old';
export const tenantListsRoute = 'lists';
/**
 * @deprecated
 */
export const tenantPreferencesRoute = 'preferences';

export const TenantAdminRoutes: Routes = [
  {
    path: tenantFields,
    loadChildren: () => import('@wfm/tenant-fields/tenant-fields.module').then((x) => x.TenantFieldsModule)
  },
  {
    path: tenantListsRoute,
    loadChildren: () => import('@wfm/tenant-lists/tenant-lists.module').then((x) => x.TenantListsModule)
  }
  // {
  //   path: tenantPreferencesRoute,
  //   component: RawDataFieldsPreferencesComponent
  // }
];

@NgModule({
  imports: [RouterModule.forChild(TenantAdminRoutes)],
  exports: [RouterModule]
})
export class TenantRoutingModule {}
