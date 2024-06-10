/**
 * global
 */
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

/**
 * project
 */

import { Roles, CreateInvitationDto } from '../../service-layer';
import { InvitationsState, SendRegistrationInvitation } from '../../store/invitation-tool';

/**
 * local
 */

@Component({
  selector: 'app-invitation-popup',
  templateUrl: './invitation-popup.component.html',
  styleUrls: ['./invitation-popup.component.scss']
})
export class InvitationPopupComponent implements OnInit {
  tenantId: string;
  tenantName: string;
  email: string;
  componentId = 'abb7f0be-9a71-4b03-a8b3-fbdcf6f5e1f5';

  constructor(
    private store: Store<InvitationsState>,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<InvitationPopupComponent>,
    private ts: TranslateService
  ) {}

  ngOnInit(): void {}

  onSendInvitation(emailAddress: string) {
    if (!emailAddress) {
      return this.snackBar.open(this.ts.instant('Email cannot be empty!'), 'CLOSE', {
        duration: 3000
      });
    }

    const invitation: CreateInvitationDto = {
      role: this.roles.TenantAdmin,
      emailAddress: emailAddress
    };

    this.store.dispatch(new SendRegistrationInvitation({ tenantId: this.tenantId, invitations: invitation }));
    this.dialogRef.close();
  }

  get roles() {
    return Roles;
  }
}
