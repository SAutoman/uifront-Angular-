import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CanDeactivate } from '@angular/router';
import { ConfirmActionData } from '@wfm/service-layer/models/confirm-action';
import { unsavedDataWarningMessage } from '@wfm/shared/consts/unsaved-data-warning';
import { ConfirmActionComponent } from '@wfm/workflow-state/confirm-action/confirm-action.component';
import { PageFormBuilderComponent } from './page-form-builder.component';

@Injectable({
  providedIn: 'root'
})
export class PageFormBuilderUnsavedDataGuard implements CanDeactivate<PageFormBuilderComponent> {
  constructor(private dialog: MatDialog) {}

  async canDeactivate(component: PageFormBuilderComponent) {
    if (component.isChangedForm()) {
      return await this.openDialog();
    }
    return true;
  }

  async openDialog(): Promise<boolean> {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      disableClose: true,
      data: <ConfirmActionData>{ title: 'Alert', message: unsavedDataWarningMessage, showProceedBtn: true }
    });
    return await dialogRef.afterClosed().toPromise();
  }
}
