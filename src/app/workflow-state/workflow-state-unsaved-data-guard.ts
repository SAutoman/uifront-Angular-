/**
 * global
 */
import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Subject } from 'rxjs';

/**
 * project
 */

/**
 * local
 */
import { WorkflowStateComponent } from './workflow-state.component';
import { ConfirmActionComponent } from './confirm-action/confirm-action.component';
import { ConfirmActionData } from '@wfm/service-layer/models/confirm-action';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class WorkflowStateUnsavedDataGuard implements CanDeactivate<WorkflowStateComponent> {
  confirmDlg: MatDialogRef<ConfirmActionComponent>;

  constructor(private dialog: MatDialog) {}

  canDeactivate(component: WorkflowStateComponent) {
    const subject = new Subject<boolean>();

    if (component.wfStateUiService.hasUnsavedData()) {
      this.confirmDlg = this.dialog.open(ConfirmActionComponent, {
        data: <ConfirmActionData>{
          title: 'Are you sure?',
          message: 'Navigationg away will cause losing unsaved data',
          showProceedBtn: true
        },
        disableClose: true
      });
      this.confirmDlg.componentInstance.subject = subject;
      return subject.asObservable();
    }

    return true;
  }
}
