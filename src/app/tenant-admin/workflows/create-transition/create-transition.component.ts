/**
 * global
 */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { cloneDeep, capitalize, camelCase } from 'lodash-core';
import { Actions, ofType } from '@ngrx/effects';
import { take, takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs';
/**
 * project
 */
import { WorkflowDto } from '@wfm/service-layer';
import { ExpressionDef } from '@wfm/service-layer/models/expressionModel';
import { WorkflowStatusDto } from '@wfm/service-layer/models/workflowStatus';
import {
  CreateWorkflowTransitionDto,
  WorkflowTransitionDto,
  UpdateWorkflowTransitionDto
} from '@wfm/service-layer/models/workflowTransition';
import { WorkflowTransitionService } from '@wfm/service-layer/services/workflowTransition.service';
import { TenantComponent } from '@wfm/shared/tenant.component';
import {
  AddTransition,
  AddTransitionSuccess,
  DeleteTransition,
  UpdateTransition,
  UpdateTransitionSuccess,
  WorkflowBuilderActionTypes,
  workflowBuilderLoader,
  workflowBuilderSuccessResponse,
  workflowTransitionList
} from '@wfm/store/workflow-builder';
import { ConfirmDialogComponent } from '@wfm/confirm-dialog/confirm-dialog.component';

/**
 * local
 */
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExpressionConfig, ExpressionDefOutput } from '../rules-builder/rules-builder.component';
interface WorkflowStatusOption extends WorkflowStatusDto {
  isDisabled: boolean;
}

@Component({
  selector: 'app-create-transition',
  templateUrl: './create-transition.component.html',
  styleUrls: ['./create-transition.component.scss']
})
export class CreateTransitionComponent extends TenantComponent implements OnInit {
  @Input() workflow: WorkflowDto;
  @Input() transition: WorkflowTransitionDto;
  @Output() closeCommand: EventEmitter<string> = new EventEmitter();
  transitionForm: FormGroup;
  toStatusesList: WorkflowStatusOption[] = [];
  fromStatusesList: WorkflowStatusOption[] = [];
  componentId: string = '2f1931fd-1bf6-4538-94af-f0a784278be6';
  loading$: Observable<boolean>;
  expressionsDef: ExpressionDef;

  expressionConfig: ExpressionConfig = {
    title: '',
    rules: false,
    buttons: false,
    userGroupsLabel: '',
    rulesLabel: '',
    userRolesLabel: 'Roles that can execute this transition'
  };
  isExpressionRuleInvalid: boolean;
  transitionsList: WorkflowTransitionDto[];
  constructor(
    private formBuilder: FormBuilder,
    private store: Store<any>,
    private snackbar: MatSnackBar,
    private transitionService: WorkflowTransitionService,
    private matDialog: MatDialog,
    private actions$: Actions
  ) {
    super(store);
  }

  async ngOnInit(): Promise<void> {
    this.loading$ = this.store.select(workflowBuilderLoader);
    this.getAllTransitions();
    this.expressionsDef = this.transition?.expression || {};

    this.store
      .select(workflowBuilderSuccessResponse)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((successMessage) => {
        if (successMessage) {
          this.snackbar.open(successMessage, 'Ok', { duration: 2000 });
        }
      });
    this.transitionForm = this.formBuilder.group({
      fromStatusId: [null, Validators.required],
      toStatusId: [null, Validators.required]
    });

    await this.getWorkflowAndStatuses();
    this.transitionForm.controls['fromStatusId'].valueChanges.subscribe((selectedFromStatusId: string) => {
      this.disableStatusInOppositeCollection('toStatus', selectedFromStatusId);
      this.checkForSimilarTransition(selectedFromStatusId, null);
    });

    this.transitionForm.controls['toStatusId'].valueChanges.subscribe((selectedToStatusId: string) => {
      this.disableStatusInOppositeCollection('fromStatus', selectedToStatusId);
      this.checkForSimilarTransition(null, selectedToStatusId);
    });
    this.updateFormWithExistingData();
  }

  getAllTransitions() {
    this.store
      .select(workflowTransitionList)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((allTransitions) => {
        this.transitionsList = allTransitions;
      });
  }

  /**
   * if there is a transition that has the same to/from statuses already, disable that option
   */
  checkForSimilarTransition(fromStatusId: string, toStatusId: string): void {
    let filteredTransitions = this.transitionsList.filter((trn) => trn.id !== this.transition?.id);
    if (fromStatusId) {
      let usedToStatusIds = filteredTransitions.map((trn) => trn.toStatusId);
      filteredTransitions.forEach((trn) => {
        if (trn.statusId === fromStatusId && usedToStatusIds.indexOf(trn.toStatusId) >= 0) {
          let statusOptionToDisable = this.toStatusesList.find((status) => {
            return trn.toStatusId === status.id;
          });
          statusOptionToDisable.isDisabled = true;
        }
      });
    } else if (toStatusId) {
      let usedFromStatusIds = filteredTransitions.map((trn) => trn.statusId);

      filteredTransitions.forEach((trn) => {
        if (trn.toStatusId === toStatusId && usedFromStatusIds.indexOf(trn.statusId) >= 0) {
          let statusOptionToDisable = this.fromStatusesList.find((status) => {
            return trn.statusId === status.id;
          });
          statusOptionToDisable.isDisabled = true;
        }
      });
    }
  }

  disableStatusInOppositeCollection(statusesToDisable: string, statusId: string): void {
    if (statusesToDisable === 'toStatus') {
      this.toStatusesList.forEach((status) => {
        if (status.id === statusId) {
          status.isDisabled = true;
        } else {
          status.isDisabled = false;
        }
      });
    }

    if (statusesToDisable === 'fromStatus') {
      this.fromStatusesList.forEach((status) => {
        if (status.id === statusId) {
          status.isDisabled = true;
        } else {
          status.isDisabled = false;
        }
      });
    }
  }

  updateFormWithExistingData() {
    if (this.transition) {
      this.transitionForm.patchValue({
        fromStatusId: this.transition.statusId,
        toStatusId: this.transition.toStatusId
      });
    }
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.transitionForm.controls[controlName].hasError(errorName);
  };

  async getWorkflowAndStatuses() {
    this.toStatusesList = this.workflow.statuses.map((status) => {
      return {
        ...status,
        isDisabled: false
      };
    });
    this.fromStatusesList = this.workflow.statuses.map((status) => {
      return {
        ...status,
        isDisabled: false
      };
    });
  }

  updateName(): string {
    const statusFrom = this.fromStatusesList.find((x) => x.id === this.transitionForm.controls.fromStatusId.value)?.name;
    const statusTo = this.toStatusesList.find((x) => x.id === this.transitionForm.controls.toStatusId.value)?.name;
    if (statusFrom && statusTo) {
      let from = capitalize(camelCase(statusFrom));
      let to = capitalize(camelCase(statusTo));

      return `from${from}To${to}Transition`;
    }
  }

  onExpressionUpdate(event: ExpressionDefOutput): void {
    this.expressionsDef = null;
    if (event.data) {
      this.expressionsDef = cloneDeep(event.data);
    }
  }

  async onSubmit() {
    const dto = this.populateDto();
    if (this.transition) {
      this.updateTransition(<UpdateWorkflowTransitionDto>dto);
    } else {
      this.createTransition(dto);
    }
  }

  populateDto(): CreateWorkflowTransitionDto {
    const transitionData: CreateWorkflowTransitionDto = {
      name: this.updateName(),
      statusId: this.transitionForm.controls.fromStatusId.value,
      toStatusId: this.transitionForm.controls.toStatusId.value,
      tenantId: this.tenant,
      workflowId: this.workflow.id,
      // config: [],
      expression: this.expressionsDef || null
    };
    if (this.transition) {
      (<UpdateWorkflowTransitionDto>transitionData).id = this.transition.id;
    }
    return transitionData;
  }

  isTransitionValid(): boolean {
    return this.transitionForm.valid && !this.isExpressionRuleInvalid;
  }

  createTransition(transitionData: CreateWorkflowTransitionDto): void {
    try {
      this.store.dispatch(new AddTransition({ tenantId: this.tenant, data: transitionData }));
      this.actions$.pipe(ofType(WorkflowBuilderActionTypes.AddTransitionSuccess), take(1)).subscribe((result: AddTransitionSuccess) => {
        this.closeCommand.emit('created');
      });
    } catch (error) {
      console.log(error);
    }
  }

  updateTransition(transitionData: UpdateWorkflowTransitionDto): void {
    try {
      this.store.dispatch(new UpdateTransition({ tenantId: this.tenant, data: transitionData }));
      this.actions$
        .pipe(ofType(WorkflowBuilderActionTypes.UpdateTransitionSuccess), take(1))
        .subscribe(async (result: UpdateTransitionSuccess) => {
          this.transition = await this.transitionService.get(this.tenant, result.payload.id);
          this.updateFormWithExistingData();
        });
    } catch (error) {
      console.log(error);
    }
  }

  deleteTransition(): void {
    const dialogRef = this.matDialog.open(ConfirmDialogComponent);
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        let cmd = {
          tenantId: this.tenant,
          workflowId: this.workflow.id,
          id: this.transition.id
        };

        this.store.dispatch(new DeleteTransition(cmd));
        this.actions$.pipe(ofType(WorkflowBuilderActionTypes.DeleteTransitionSuccess), take(1)).subscribe((result) => {
          this.closeCommand.emit('Removed');
        });
      }
    });
  }
}
