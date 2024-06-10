/**
 * global
 */
import { Component, Inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

/**
 * project
 */
import { AuthState, Logout } from '@wfm/store';
import { InvitationUserRole } from '@wfm/service-layer';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

/**
 * local
 */

@Component({
  selector: 'app-invalid-user-popup',
  templateUrl: './invalid-user-popup.component.html',
  styleUrls: ['./invalid-user-popup.component.scss']
})
export class InvalidUserPopupComponent implements OnInit {
  componentId = '2154713a-0ba2-40a1-9565-058b0f261c74';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: InvitationUserRole,
    private store: Store<AuthState>,
    private dialogRef: MatDialogRef<InvalidUserPopupComponent>
  ) {}

  ngOnInit(): void {}

  onSignOut(): void {
    this.store.dispatch(new Logout());
    this.dialogRef.close();
  }
}
