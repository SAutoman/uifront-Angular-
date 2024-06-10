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
import { UsersGridComponent } from './users-grid/users-grid.component';
import { UserProfileComponent } from './user-profile/user-profile.component';

import { UserGroupsPageComponent } from './user-groups-page/user-groups-page.component';
import { UserProfilesUsavedDataGuard } from './user-profile-unsaved-data-guard';
import { TenantAdminGuard } from '../shared/tenant-admin.guard';
import { DeactivatedUsersListComponent } from './deactivated users/deactivated-users-list/deactivated-users-list.component';

export const usersMainRoute = 'users';
export const usersProfileRoute = 'user-profile';
export const usersGridRoute = 'list';
export const userGroupsRoute = 'user-groups';
export const deactivatedUsersRoute = 'deactivated-users';

export const UsersRoutes: Routes = [
  {
    path: usersGridRoute,
    component: UsersGridComponent,
    canActivate: [TenantAdminGuard]
  },
  {
    path: usersProfileRoute,
    component: UserProfileComponent,
    canDeactivate: [UserProfilesUsavedDataGuard]
  },
  {
    path: userGroupsRoute,
    component: UserGroupsPageComponent,
    canActivate: [TenantAdminGuard]
  },
  {
    path: deactivatedUsersRoute,
    component: DeactivatedUsersListComponent
  },
  // Not found
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forChild(UsersRoutes)],
  exports: [RouterModule],
  providers: [UserProfilesUsavedDataGuard]
})
export class UsersRoutingModule {}
