import { Injectable, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { browserActionsSelector, ResetFiredPostactions } from '@wfm/store/workflow';
import { distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
import { BrowserActionTypeEnum } from '../models/actionDto';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ExternalIntegrationService } from './external-integration.service';
import { WorkflowService } from './workflow.service';
import { CasePrintPreviewComponent } from '@wfm/workflow-state/case-print-preview/case-print-preview.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorHandlerService } from './error-handler.service';
import { FileBlobData, WorkflowStateService } from './workflowState.service';

@Injectable({
  providedIn: 'root'
})
export class BrowserPostactionHandler implements OnDestroy {
  protected destroyed$ = new Subject<any>();
  isDownloading: boolean = false;

  constructor(
    private store: Store,
    public dialog: MatDialog,
    private externalIntegrator: ExternalIntegrationService,
    private workflowService: WorkflowService,
    private snackbar: MatSnackBar,
    private errorHandlerService: ErrorHandlerService,
    private wfStateService: WorkflowStateService
  ) {}

  init(): void {
    this.subscribeToBrowserPostactionStream();
  }

  subscribeToBrowserPostactionStream(): void {
    this.store
      .select(browserActionsSelector)
      .pipe(
        filter((x) => !!x?.length),
        distinctUntilChanged(),
        takeUntil(this.destroyed$)
      )
      .subscribe((browserActions) => {
        for (const action of browserActions) {
          try {
            const data = JSON.parse(action.additionData);
            if (data.browserActionType === BrowserActionTypeEnum.Print) {
              this.printWorkflowState(action.parametersUi.workflowStateId, action.parametersUi.tenantId);
            } else if (data.browserActionType === BrowserActionTypeEnum.Download) {
              this.downloadWorkflowState(action.parametersUi.workflowStateId, action.parametersUi.tenantId);
            }
          } catch (error) {
            console.log(error);
          }
        }

        this.store.dispatch(new ResetFiredPostactions());
      });
  }

  async printWorkflowState(wsId: string, tenantId: string): Promise<void> {
    const data = await this.externalIntegrator.getWorkflowId(tenantId, wsId);
    const workflow = await this.workflowService.get(data.workflowPublicId, tenantId);

    const dialogRef = this.dialog?.open(CasePrintPreviewComponent, {
      width: '50%',
      height: '600px',
      panelClass: 'print'
    });

    dialogRef.componentInstance.workflowStateId = wsId;
    dialogRef.componentInstance.workflowSchema = { ...workflow };
    dialogRef.componentInstance.autoLaunchPrintDialogue = true;
  }

  async downloadWorkflowState(wfStateId: string, tenantId: string): Promise<void> {
    try {
      const wfData = await this.externalIntegrator.getWorkflowId(tenantId, wfStateId);
      this.isDownloading = true;
      this.snackbar.open('Downloading in progress...', 'OK');
      const data = await this.wfStateService.downloadAllDocuments(tenantId, wfStateId, wfData.workflowPublicId);
      this.downloadFile(data);
    } catch (error) {
      this.isDownloading = false;
      this.snackbar.dismiss();
      this.errorHandlerService.getAndShowErrorMsg(error);
    }
  }

  downloadFile(fileData: FileBlobData): void {
    this.snackbar.dismiss();
    const blob = new Blob([fileData.data]);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileData.fileName || 'documents.zip');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.isDownloading = false;
  }

  ngOnDestroy(): void {
    this.destroyed$.next({});
    this.destroyed$.complete();
  }
}
