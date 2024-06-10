import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { cloneDeep } from 'lodash-core';
import {
  ProcessStepLinkService,
  WorkflowDto,
  WorkflowStatusDto,
  ConditionedProcessStepLinkOverrideDto,
  ProcessStepLinkBaseOverrideDto,
  CreateProcessStepLinkDtoNew,
  ProcessStepLinkDto,
  UpdateProcessStepLinkDto,
  PagedData,
  RepeatableSettings,
  AreaTypeEnum,
  FieldTypeIds
} from '@wfm/service-layer';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { workflowStatusesSelector } from '@wfm/store/workflow/workflow.selectors';
import { ProcessStepEntityDto } from '@wfm/service-layer';
import { convertFieldName } from '@wfm/service-layer/helpers';
import { LinkOverrideComponent } from './link-override/link-override.component';
import { filter, take, takeUntil } from 'rxjs/operators';
import {
  DeleteProcessStepLink,
  WorkflowBuilderActionTypes,
  workflowProcessStepLinkList,
  tenantProcessSteps,
  AddProcessStepLink,
  AddProcessStepLinkSuccess,
  UpdateProcessStepLink,
  UpdateProcessStepLinkSuccess,
  workflowBuilderSuccessResponse,
  linkUpdateError,
  ResetErrorState,
  UpdateAllProcessStepLinksPosition
} from '@wfm/store/workflow-builder';
import { ConfirmDialogComponent } from '@wfm/confirm-dialog/confirm-dialog.component';
import { Actions, ofType } from '@ngrx/effects';
import { BehaviorSubject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { MatSelectChange } from '@angular/material/select';
import { ConfirmActionComponent } from '@wfm/workflow-state/confirm-action/confirm-action.component';
import { ExpressionDef } from '@wfm/service-layer/models/expressionModel';
import { TranslateService } from '@ngx-translate/core';
import { WorkflowStateSchemaData } from '../workflow-create/workflow-create.component';

export interface LinkData {
  processStepEntityId: string;
  refName: string;
  repeatableSettings?: RepeatableSettings;
}
@Component({
  selector: 'app-create-process-step-links',
  templateUrl: './create-process-step-links.component.html',
  styleUrls: ['./create-process-step-links.component.scss']
})
export class CreateProcessStepLinksComponent extends TenantComponent implements OnInit {
  @Input() workflow: WorkflowDto;
  @Input() processStepLink: ProcessStepLinkDto;
  @Input() workflowStateSchemasData: WorkflowStateSchemaData;

  @Output() closeCommand: EventEmitter<string> = new EventEmitter();
  // the selected processStep
  processStep: ProcessStepEntityDto;

  statusesList: WorkflowStatusDto[] = [];
  processStepLinkForm: FormGroup;
  workflowId: string;
  processSteps: ProcessStepEntityDto[];
  availableProcessSteps: ProcessStepEntityDto[];
  defaultOverride: ProcessStepLinkBaseOverrideDto;
  overrides: ConditionedProcessStepLinkOverrideDto[];
  existingLinks: ProcessStepLinkDto[];
  linkData$: BehaviorSubject<LinkData> = new BehaviorSubject(null);
  repeatableSettings: RepeatableSettings;
  noRawDataSchema: boolean = false;
  disableRepeatableCheckbox: boolean = false;
  isLinkOverrideFormValid: boolean;

  get isRepeatable(): boolean {
    return this.processStepLinkForm?.get('isRepeatable')?.value;
  }
  constructor(
    private matDialog: MatDialog,
    private store: Store<any>,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private processStepLinkService: ProcessStepLinkService,
    private snackbar: MatSnackBar,
    private actions$: Actions,
    private ts: TranslateService,
    private adminSchemasService: AdminSchemasService
  ) {
    super(store);
    this.workflowId = this.route.snapshot.paramMap.get('id');
  }

  async ngOnInit(): Promise<void> {
    this.checkRawDataSchemaPresence();
    this.store
      .select(linkUpdateError)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((err) => {
        if (err) {
          this.snackbar.open(err, 'Ok', { duration: 4000 });
          this.store.dispatch(
            new ResetErrorState({
              resetLinkUpdateError: true
            })
          );
        }
      });

    this.store
      .select(workflowBuilderSuccessResponse)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((successMessage) => {
        if (successMessage) {
          this.snackbar.open(successMessage, 'Ok', { duration: 2000 });
        }
      });
    this.loadStatuses();
    this.initForm();
    this.store
      .select(workflowProcessStepLinkList)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((links) => {
        if (links && links.length) {
          this.existingLinks = cloneDeep(links)?.sort((a, b) => {
            return a?.position - b?.position;
          });
        } else {
          this.existingLinks = [];
        }
      });
    this.defaultOverride = this.processStepLink ? this.processStepLink.defaultOverride : null;
    this.overrides = this.processStepLink ? cloneDeep(this.processStepLink.overrides) : [];

    this.processStepLinkForm.controls['stepId'].valueChanges
      .pipe(
        filter((x) => !!x),
        takeUntil(this.destroyed$)
      )
      .subscribe((stepId) => {
        const step = this.processSteps?.find((step) => step.id === stepId);
        if (step) {
          this.processStep = cloneDeep(step);
          this.processStepLinkForm.patchValue({
            refName: convertFieldName(this.processStep.name)
          });
          // step changes=> refName changes
          // high risk that overrides expressions and actions will get corrupted,
          // so we need to reset them
          this.overrides = [];

          this.linkData$.next({
            processStepEntityId: this.processStep.id,
            refName: convertFieldName(this.processStep.name)
          });
        }
      });

    this.getSteps();
  }

  initForm() {
    this.processStepLinkForm = this.formBuilder.group({
      stepId: [null, Validators.required],
      refName: ['', [Validators.required]],
      parentId: [],
      isRepeatable: [false],
      position: []
    });

    if (this.processStepLink) {
      this.updateForm();
    }
  }

  updateForm() {
    this.processStepLinkForm.patchValue({
      stepId: this.processStepLink.processStepEntityId,
      refName: this.processStepLink.refName,
      parentId: this.processStepLink.parentRefName,
      isRepeatable: this.processStepLink.processStepLinkRepeatableSettings?.isRepeatable || false,
      position: this.processStepLink?.position
    });
    if (this.processStepLink.processStepLinkRepeatableSettings?.isRepeatable) {
      // for existing repeatable settings, user cannot revert it back to regular step
      this.disableRepeatableCheckbox = true;
    }
    if (this.processStepLink.processStepLinkRepeatableSettings) {
      const savedSettings = { ...this.processStepLink.processStepLinkRepeatableSettings };
      this.repeatableSettings = {
        // linkedRawDataFieldNames: savedSettings.linkedRawDataFieldNames,
        isRepeatable: savedSettings.isRepeatable,
        resolveAtOnce: savedSettings.resolveAtOnce,
        linkedRawDataSettings: savedSettings.linkedRawDataSettings
      };
    }

    //stepId and refName will not be editable on link editing

    this.processStepLinkForm.get('stepId').disable();
    this.processStepLinkForm.get('refName').disable();
  }

  getSteps(): void {
    this.store
      .select(tenantProcessSteps)
      .pipe(
        takeUntil(this.destroyed$),
        filter((x) => !!x)
      )
      .subscribe((stepsData: PagedData<ProcessStepEntityDto>) => {
        this.processSteps = stepsData.items;
        if (!this.processStepLink) {
          //when creating a new link filter out the steps that are already linked
          this.availableProcessSteps = this.processSteps.filter((step) => {
            return !this.existingLinks.find((link: ProcessStepLinkDto) => {
              return link.processStepEntityId === step.id;
            });
          });
        } else {
          this.availableProcessSteps = [...this.processSteps];
          this.processStep = this.processSteps.find((step) => step.id === this.processStepLink.processStepEntityId);
          this.emitLinkData();
        }
      });
  }

  emitLinkData() {
    this.linkData$.next({
      processStepEntityId: this.processStep.id,
      refName: this.processStepLink.refName,
      repeatableSettings: this.processStepLink.processStepLinkRepeatableSettings || null
    });
  }

  openOverride(item?: ConditionedProcessStepLinkOverrideDto, index?: number) {
    const dialogRef = this.matDialog.open(LinkOverrideComponent, {
      disableClose: false,
      width: '500px'
    });
    dialogRef.componentInstance.processStep = { ...this.processStep };
    dialogRef.componentInstance.workflow = { ...this.workflow };
    dialogRef.componentInstance.isDefaultOverride = false;
    dialogRef.componentInstance.statuses = this.statusesList;
    dialogRef.componentInstance.linkData$ = this.linkData$;
    dialogRef.componentInstance.workflowStateSchemasData = this.workflowStateSchemasData;
    if (item) {
      dialogRef.componentInstance.overrideDto = item;
    }
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.data) {
        result.data.expression = this.removeNullProps(result.data?.expression);
        if (index || index === 0) {
          this.overrides.splice(index, 1, result.data);
        } else {
          this.overrides.push(result.data);
        }
      }
    });
  }

  removeNullProps(expression: ExpressionDef): ExpressionDef {
    if (expression) {
      Object.keys(expression).forEach((x) => {
        if (!expression[x] || expression[x]?.length === 0) delete expression[x];
      });
    }
    return expression;
  }

  loadStatuses(): void {
    this.store.pipe(select(workflowStatusesSelector), takeUntil(this.destroyed$)).subscribe((statuses) => {
      for (const status in statuses) {
        this.statusesList.push(statuses[status]);
      }
    });
  }

  removeOverride(override: ConditionedProcessStepLinkOverrideDto, index: number) {
    this.overrides.splice(index, 1);
  }

  async onSubmit() {
    try {
      let formValues = this.processStepLinkForm.value;
      let linkCmd: CreateProcessStepLinkDtoNew = {
        workflowId: this.workflow.id,
        processStepEntityId: this.processStepLinkForm.controls.stepId.value,
        refName: this.processStepLinkForm.controls.refName.value,
        tenantId: this.tenant,
        parentId: formValues.parentId,
        position: formValues?.position || formValues?.position === 0 ? formValues?.position : this.existingLinks?.length
      };
      if (this.defaultOverride) {
        linkCmd.defaultOverride = this.defaultOverride;
      }
      if (this.overrides && this.overrides.length) {
        linkCmd.overrides = this.overrides;
      }
      if (formValues.isRepeatable) {
        linkCmd.processStepLinkRepeatableSettings = this.repeatableSettings;
      }
      if (this.processStepLink) {
        (<UpdateProcessStepLinkDto>linkCmd).id = this.processStepLink.id;
        this.updateLink(<UpdateProcessStepLinkDto>linkCmd);
      } else {
        this.createLink(linkCmd);
      }
    } catch (error) {
      console.log(error);
    }
  }

  createLink(cmd: CreateProcessStepLinkDtoNew): void {
    try {
      this.store.dispatch(new AddProcessStepLink({ tenantId: this.tenant, data: cmd }));
      this.actions$
        .pipe(ofType(WorkflowBuilderActionTypes.AddProcessStepLinkSuccess), take(1))
        .subscribe((result: AddProcessStepLinkSuccess) => {
          this.closeCommand.emit('created');
        });
    } catch (error) {
      console.log(error);
    }
  }

  updateLink(cmd: UpdateProcessStepLinkDto): void {
    try {
      cmd.refName = this.processStepLink.refName;
      cmd.processStepEntityId = this.processStepLink.processStepEntityId;
      this.store.dispatch(new UpdateProcessStepLink({ tenantId: this.tenant, data: cmd }));
      this.actions$
        .pipe(ofType(WorkflowBuilderActionTypes.UpdateProcessStepLinkSuccess), take(1))
        .subscribe(async (result: UpdateProcessStepLinkSuccess) => {
          const link = await this.processStepLinkService.get(this.tenant, result.payload.id);
          this.processStepLink = { ...link };
          this.updateForm();
        });
    } catch (error) {
      console.log(error);
    }
  }

  async deleteLink(): Promise<void> {
    const dialogRef = this.matDialog.open(ConfirmDialogComponent);
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        let cmd = {
          tenantId: this.tenant,
          workflowId: this.workflow.id,
          id: this.processStepLink.id
        };
        const ind = this.existingLinks.findIndex((x) => x.id === this.processStepLink.id);
        if (ind >= 0) {
          this.existingLinks.splice(ind, 1);
        }
        this.store.dispatch(new DeleteProcessStepLink(cmd));
        this.actions$.pipe(ofType(WorkflowBuilderActionTypes.DeleteProcessStepLinkSuccess), take(1)).subscribe((result) => {
          this.snackbar.open(this.ts.instant('Process Step Link removed'), 'Ok', { duration: 2000 });
          this.closeCommand.emit('Removed');
          this.updateProcessStepLinksOrder(ind);
        });
      }
    });
  }

  updateProcessStepLinksOrder(startIndex: number): void {
    const processStepsData: ProcessStepLinkDto[] = cloneDeep(this.existingLinks);
    for (let index = startIndex; index < processStepsData?.length; index++) {
      const link = processStepsData[index];
      link.position = index;
    }
    const payloadProcessStepLinks = processStepsData.map((x) => {
      return { refName: x.refName, position: x.position, id: x.id };
    });
    this.store.dispatch(
      new UpdateAllProcessStepLinksPosition({ tenantId: this.tenant, wfId: this.workflow.id, data: payloadProcessStepLinks })
    );
  }

  async checkRawDataSchemaPresence(): Promise<void> {
    const caseSchema = await this.adminSchemasService.getSchema(this.tenant, AreaTypeEnum.case, this.workflow.caseSchemaId);

    const rawDataSchemaField = caseSchema.fields.find((field) => {
      return field.type === FieldTypeIds.ListOfLinksField && field.configuration.schemaAreaType === AreaTypeEnum.rawData;
    });

    if (!rawDataSchemaField) {
      this.noRawDataSchema = true;
    }
  }

  updateDefaultOverride(defaultOverrideData: { data: ProcessStepLinkBaseOverrideDto; isLinkOverrideFormValid: boolean }): void {
    this.defaultOverride = defaultOverrideData?.data;
    this.isLinkOverrideFormValid = defaultOverrideData?.isLinkOverrideFormValid;
  }

  updateRefName(value: string): string {
    if (value.trim().length > 0) return convertFieldName(value);
  }

  setRepeatableSettings(settings: RepeatableSettings): void {
    this.repeatableSettings = settings;
  }

  onParentStepChange(event: MatSelectChange): void {
    if (event.value === 'reset') {
      this.processStepLinkForm.controls.parentId.setValue(null);
    } else {
      const linkData = this.existingLinks.find((link) => link.refName === event.value);
      if (this.processStepLink.id === linkData.parentId) {
        this.processStepLinkForm.controls.parentId.setValue(null);
        this.openWarningMessage();
      }
    }
  }

  openWarningMessage(): void {
    this.matDialog.open(ConfirmActionComponent, {
      data: {
        title: 'Warning',
        message: `Parent Child circular dependency detected`,
        showProceedBtn: false
      }
    });
  }
}
