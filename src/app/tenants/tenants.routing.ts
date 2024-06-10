/**
 * global
 */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TenantSettingsDeactivateGuard } from './tenant-settings-deactivate-guard';
import { TenantAdminGuard } from '../shared/tenant-admin.guard';

/**
 * project
 */

/**
 * local
 */
import { TenantsSettingsComponent } from './tenants-settings/tenants-settings.component';

export const tenantsMainRoute = 'tenants';
export const tenantsViewRoute = 'list';
export const tenantEditRoute = 'edit';
export const tenantsSettingsRoute = 'settings';
export const tenantCreateRoute = 'create';
export const fieldsAdminRoute = 'fields';
export const errorRoute = 'error';
export const notificationsRoute = 'notifications';
export const documentManagementRoute = 'document-management';
export const appSettingsRoute = 'app-settings';
export const invitationsRoute = 'invitations';

export const CasesRoutes: Routes = [
  { path: '', redirectTo: tenantsSettingsRoute, pathMatch: 'full' },
  {
    path: tenantsSettingsRoute,
    component: TenantsSettingsComponent,
    canDeactivate: [TenantSettingsDeactivateGuard],
    canActivate: [TenantAdminGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(CasesRoutes)],
  exports: [RouterModule]
})
export class TenantsRoutingModule {}
