import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CanDeactivate } from '@angular/router';
import { ConfirmActionData } from '@wfm/service-layer/models/confirm-action';
import { unsavedDataWarningMessage } from '@wfm/shared/consts/unsaved-data-warning';
import { ConfirmActionComponent } from '@wfm/workflow-state/confirm-action/confirm-action.component';
import { MappingEditorComponent } from './mapping-editor/mapping-editor.component';

@Injectable({
  providedIn: 'root'
})
export class MappingsUnsavedDataGuard implements CanDeactivate<MappingEditorComponent> {
  constructor(private dialog: MatDialog) {}

  async canDeactivate(component: MappingEditorComponent) {
    if (component.mappingFormHasChanges) {
      const dialogRef = this.dialog.open(ConfirmActionComponent, {
        disableClose: true,
        data: <ConfirmActionData>{ title: 'Alert', message: unsavedDataWarningMessage, showProceedBtn: true }
      });
      return await dialogRef.afterClosed().toPromise();
    }
    return true;
  }
}
