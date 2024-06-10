/**
 * global
 */
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CanDeactivate } from '@angular/router';
import { ConfirmActionData } from '@wfm/service-layer/models/confirm-action';
import { unsavedDataWarningMessage } from '@wfm/shared/consts/unsaved-data-warning';
import { ConfirmActionComponent } from '@wfm/workflow-state/confirm-action/confirm-action.component';

/**
 * project
 */

/**
 * local
 */
import { UserProfileComponent } from './user-profile/user-profile.component';

@Injectable({
  providedIn: 'root'
})
export class UserProfilesUsavedDataGuard implements CanDeactivate<UserProfileComponent> {
  constructor(private dialog: MatDialog) {}

  async canDeactivate(component: UserProfileComponent) {
    if (component.userProfileHasChanges) {
      const dialogRef = this.dialog.open(ConfirmActionComponent, {
        disableClose: true,
        data: <ConfirmActionData>{ title: 'Alert', message: unsavedDataWarningMessage, showProceedBtn: true }
      });
      return await dialogRef.afterClosed().toPromise();
    }
    return true;
  }
}
