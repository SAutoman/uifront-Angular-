/**
 * global
 */
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { select } from '@ngrx/store';
import { filter, takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
/**
 * project
 */
import { CreateStatusCommand, UpdateWorkflowStatusCommand, WorkflowStatusDto } from '@wfm/service-layer';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { loggedInState } from '@wfm/store/auth/auth.selectors';
import {
  AddStatus,
  ClearCurrentStatusData,
  GetStatusDataById,
  UpdateStatus,
  wfStatusDataByIdSelector,
  wfOperationMsgSelector,
  workflowBuilderLoader,
  ResetWfOperationMsg
} from '@wfm/store/workflow-builder';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { workflowStatusesSelector } from '@wfm/store/workflow';

interface StatusDialogData {
  id: string;
}

@Component({
  selector: 'app-workflow-status-create',
  templateUrl: './workflow-status-create.component.html',
  styleUrls: ['./workflow-status-create.component.scss']
})
export class WorkflowStatusCreateComponent extends TenantComponent implements OnInit {
  createStatusForm: FormGroup;
  componentId: string = 'f44ac822-cb0f-464a-97ce-2ecf0e3b5b4d';
  title: string = 'Create Status';
  statusId: string;
  currentWorkflowStatusesCount: number;

  colors: string[] = ['red', 'blue', 'green', 'yellow', 'orange'];
  allstatuses: WorkflowStatusDto[];
  wfStateLoading$: Observable<boolean>;

  constructor(
    private formBuilder: FormBuilder,
    private store: Store<ApplicationState>,
    private snackbar: MatSnackBar,
    private dialogRef: MatDialogRef<WorkflowStatusCreateComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: StatusDialogData,
    private ts: TranslateService
  ) {
    super(store);
    this.store.pipe(select(loggedInState)).subscribe((authState) => {
      if (this.dialogData && this.dialogData?.id) {
        this.statusId = this.dialogData.id;
        if (this.statusId) {
          this.title = 'Update Status';
          this.store.dispatch(new GetStatusDataById({ data: { id: this.statusId } }));
          this.getWorkflowStatusById();
        }
      }
    });

    this.wfStateLoading$ = this.store.pipe(select(workflowBuilderLoader), takeUntil(this.destroyed$));
  }

  /**
   *  TODO Assign posi value
   */

  ngOnInit(): void {
    this.createStatusForm = this.formBuilder.group({
      name: ['', Validators.required],
      position: [null],
      label: [''],
      color: ['']
    });
    this.store.pipe(select(workflowStatusesSelector)).subscribe((statuses) => {
      this.allstatuses = [];
      for (const status in statuses) {
        this.allstatuses.push(statuses[status]);
      }
      this.createStatusForm.controls.position.setValue(this.allstatuses.length + 1);
    });
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.createStatusForm.controls[controlName].hasError(errorName);
  };

  getWorkflowStatusById(): void {
    try {
      this.store.pipe(select(wfStatusDataByIdSelector), takeUntil(this.destroyed$)).subscribe((x) => {
        if (x) {
          this.createStatusForm.patchValue(x);
          this.createStatusForm.controls.color.setValue(x.configuration?.color ? x.configuration?.color : '');
          this.createStatusForm.controls.label.setValue(x.configuration?.label ? x.configuration?.label : '');
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  onSubmit(): void {
    if (!this.isEmptyFields()) {
      !this.statusId ? this.createStatus() : this.updateStatus();
    }
  }

  async createStatus(): Promise<void> {
    const statusObject: CreateStatusCommand = {
      name: this.createStatusForm.controls.name.value ? this.createStatusForm.controls.name.value.trim() : '',
      position: this.createStatusForm.controls.position.value,
      tenantId: this.tenant
    };
    if (this.createStatusForm.controls.label?.value?.trim() !== '' || this.createStatusForm.controls.color.value?.trim() !== '') {
      statusObject.configuration = {
        color: this.createStatusForm.controls.color.value?.trim(),
        label: this.createStatusForm.controls.label.value?.trim()
      };
    }
    if (this.allstatuses.findIndex((x) => x.name.trim().toLowerCase() === statusObject.name.toLowerCase()) >= 0) {
      this.snackbar.open(this.ts.instant('Status name already exists'), 'OK', { duration: 2000 });
    } else {
      this.store.dispatch(new AddStatus({ data: statusObject }));
      this.listenForStatusOperationMsg();
    }
  }

  async updateStatus(): Promise<void> {
    let statusObject: UpdateWorkflowStatusCommand = {
      name: this.createStatusForm.controls.name.value ? this.createStatusForm.controls.name.value.trim() : '',
      position: this.createStatusForm.controls.position.value,
      tenantId: this.tenant
    };
    if (this.createStatusForm.controls.label?.value?.trim() !== '' || this.createStatusForm.controls.color.value?.trim() !== '') {
      statusObject.configuration = {
        color: this.createStatusForm.controls.color.value?.trim(),
        label: this.createStatusForm.controls.label.value?.trim()
      };
    }
    if (
      this.allstatuses
        .filter((x) => x.id !== this.statusId)
        .findIndex((x) => x.name.trim().toLowerCase() === statusObject.name.toLowerCase()) >= 0
    ) {
      this.snackbar.open(this.ts.instant('Status name already exists'), 'OK', { duration: 2000 });
    } else {
      this.clearCurrentStatusDataById();
      this.store.dispatch(new UpdateStatus({ id: this.statusId, data: statusObject }));
      this.listenForStatusOperationMsg();
    }
  }

  listenForStatusOperationMsg(): void {
    this.store
      .pipe(
        select(wfOperationMsgSelector),
        filter((x) => !!x),
        takeUntil(this.destroyed$)
      )
      .subscribe((x) => {
        if (x && x.toLowerCase().includes('success')) {
          this.snackbar.open(x, 'Ok', { duration: 2000 });
          this.store.dispatch(new ResetWfOperationMsg());
          this.dialogRef.close();
        }
      });
  }

  resetFields(): void {
    this.createStatusForm.reset();
    this.createStatusForm.markAsPristine();
  }

  isEmptyFields(): boolean {
    const name = this.createStatusForm.controls.name.value || '';
    const position = this.createStatusForm.controls.position.value;
    if (name.trim().length === 0 && !!position) return true;
    else return false;
  }

  openSnackbar(): void {
    const message = `Status ${this.statusId ? 'updated' : 'created'} successfully`;
    this.snackbar.open(this.ts.instant(message), 'Ok', { duration: 2000 });
  }

  close(): void {
    this.clearCurrentStatusDataById();
    this.dialogRef.close(false);
  }

  clearCurrentStatusDataById(): void {
    this.store.dispatch(new ClearCurrentStatusData());
  }
}
