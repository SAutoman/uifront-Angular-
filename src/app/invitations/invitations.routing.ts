/**
 * global
 */
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

/**
 * local
 */
import { InvitationsGridComponent } from './invitations-grid/invitations-grid.component';
import { InvitationToolComponent } from './invitation-tool/invitation-tool.component';

export const invitationMainRoute = 'invitations';
export const invitationToolRoute = 'invite-user';
export const invitationsRoute = 'invitations';

export const InvitationRoutes: Routes = [
  {
    path: invitationToolRoute,
    component: InvitationToolComponent
  },
  {
    path: invitationsRoute,
    component: InvitationsGridComponent
  },
  // Not found
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forChild(InvitationRoutes)],
  exports: [RouterModule]
})
export class InvitationsRoutingModule {}
