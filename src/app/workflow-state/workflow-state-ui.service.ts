/**
 * global
 */
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable, of, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

/**
 * project
 */
import { KendoThemeService } from '@wfm/service-layer/services/kendo-theme.service';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { StepReference, workflowStateUnsavedDataSelector } from '@wfm/store/workflow';
/**
 * local
 */
import { ConfirmActionComponent } from './confirm-action/confirm-action.component';
import { ConfirmActionData } from '@wfm/service-layer/models/confirm-action';

@Injectable({
  providedIn: 'root'
})
export class WorkflowStateUiService {
  wfStateUnsavedDataState: Array<StepReference>;
  constructor(private dialog: MatDialog, private store: Store<ApplicationState>, private kendoService: KendoThemeService) {
    this.store
      .select(workflowStateUnsavedDataSelector)
      .pipe(
        filter((state) => !!state)
        // singleton, no memory leak
      )
      .subscribe((wfStateUnsavedDataState) => {
        this.wfStateUnsavedDataState = wfStateUnsavedDataState;
      });
  }

  /**
   * check for unsaved changes, if any, show a confirm popup,
   * return the user's response as an observable
   * @param actionTitle
   * @param actionText
   * @param showRemoveConfirmByDefault: used for remove action
   * @param stepRefName: the step for which some action is done
   * @returns
   */
  userWantsToProceed(
    actionTitle: string,
    actionText: string,
    stepRefName?: string,
    showRemoveConfirmByDefault?: boolean
  ): Observable<boolean> {
    if (showRemoveConfirmByDefault || this.hasUnsavedData(stepRefName)) {
      const subject = new Subject<boolean>();

      let message;
      if (this.hasUnsavedData(stepRefName)) {
        message = `Make sure to save your changes before ${actionText}: it will cause losing unsaved data.`;
      } else if (showRemoveConfirmByDefault) {
        message = `Are you sure you want to remove this step?`;
      }

      const confirmDialog = this.dialog.open(ConfirmActionComponent, {
        panelClass: [],
        width: '400px',
        data: <ConfirmActionData>{ title: actionTitle, message: message, showProceedBtn: true },
        disableClose: true
      });
      confirmDialog.componentInstance.subject = subject;
      return subject.asObservable();
    } else {
      return of(true);
    }
  }

  /**
   * check for unsaved data, if refName is provided exclude it from the search array
   * @param currentStepRefName
   * @returns
   */

  hasUnsavedData(currentStepRefName?: string): boolean {
    if (currentStepRefName) {
      let data = this.wfStateUnsavedDataState?.filter((item) => {
        return item.refName !== currentStepRefName;
      });
      return !!data?.length;
    } else {
      return !!this.wfStateUnsavedDataState?.length;
    }
  }
}
