/**
 * global
 */

import { NgModule } from '@angular/core';
/**
 * project
 */
import { SharedModule } from '../shared/shared.module';
/**
 * local
 */
import { InvitationsRoutingModule } from './invitations.routing';
import { InvitationsGridComponent } from './invitations-grid/invitations-grid.component';
import { InvitationToolComponent } from './invitation-tool/invitation-tool.component';

@NgModule({
  declarations: [InvitationsGridComponent, InvitationToolComponent],
  imports: [SharedModule, InvitationsRoutingModule],
  exports: [
    // UsersGridComponent,
    // UserProfileComponent,
    // RegistrationComponent
  ]
})
export class InvitationsModule {}
