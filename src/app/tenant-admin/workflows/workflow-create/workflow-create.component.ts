import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatSelectChange } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';
import { cloneDeep, sortBy } from 'lodash-core';
import { TranslateService } from '@ngx-translate/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

/**
 * project
 */
import {
  AreaTypeEnum,
  CopyWorkflow,
  CreateWorkflowCommand,
  DynamicEntitiesService,
  DynamicEntityStatusUsage,
  FieldTypeIds,
  PagedData,
  PagedDataWithIncompleteItems,
  ProcessStepEntityDto,
  ProcessStepLinkDto,
  ProcessStepLinkPositionsDto,
  SchemaDto,
  SchemaFieldDto,
  SidebarLinksService,
  UpdateWorkflowCommand,
  WorkflowDto,
  WorkflowStatusDto,
  WorkflowTransitionDto
} from '@wfm/service-layer';
import { isEmptyField } from '@wfm/service-layer/helpers/field-empty-check';
import {
  ActionEventNameMap,
  BaseActionType,
  EventAreaScopes,
  EventTypes,
  WorkflowActionSubareaNameMap,
  WorkflowEventSubAreas
} from '@wfm/service-layer/models/actionDto';
import { ConfirmActionData } from '@wfm/service-layer/models/confirm-action';
import { SchemasService } from '@wfm/service-layer/services/schemas-service';
import { WorkflowsCacheService } from '@wfm/service-layer/services/workflows-cache.service';
import { ActionsComponent } from '@wfm/shared/actions/actions.component';
import { AppBarData, SharedService } from '@wfm/service-layer/services/shared.service';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { convertTenantName } from '@wfm/shared/utils';
import { GetWorkflowById, GetWorkflowSuccess, ResetWorkflowLoadError, workflowSelector } from '@wfm/store/workflow';
import {
  CreateWorkflow,
  UpdateWorkflow,
  GetWorkflowTransitions,
  workflowTransitionList,
  GetWorkflowProcessStepLinks,
  workflowProcessStepLinkList,
  tenantProcessSteps,
  GetProcessSteps,
  GetWorkflowProcessStepLinksSuccess,
  GetWorkflowTransitionsSuccess,
  WorkflowBuilderState,
  SetDefaultStatus,
  defaultStatusErrorSelector,
  ResetErrorState,
  wfBuilderTransitionsLoadingSelector,
  wfBuilderProcessStepLinksLoadingSelector,
  wfOperationMsgSelector,
  ResetWfOperationMsg,
  workflowsListPaginatedSelector,
  GetWorkflowsByPagination,
  FixWorkflow,
  UpdateAllProcessStepLinksPosition,
  CreateWorkflowCopy
} from '@wfm/store/workflow-builder';
import { workflowLoadErrorSelector, workflowStateLoading, workflowStatusesSelector } from '@wfm/store/workflow/workflow.selectors';
import { ConfirmActionComponent } from '@wfm/workflow-state/confirm-action/confirm-action.component';
import { FetchWorkflowMenuData, loggedInState } from '@wfm/store';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { KeyValue } from '@angular/common';

interface ISchemaDtoDisabled extends SchemaDto {
  disabled?: boolean;
}

interface AreaActionsData {
  subArea: WorkflowEventSubAreas;
  label: string;
  actions: BaseActionType[];
}

interface AllActionsByArea {
  createActions: BaseActionType[];
  updateActions: BaseActionType[];
  deleteActions: BaseActionType[];
  stepActions: BaseActionType[];
  statusActions: BaseActionType[];
  autoIncrementActions: BaseActionType[];
}

export interface SchemaData {
  areaType: AreaTypeEnum;
  schemaId: string;
  schemaName: string;
  refName?: string;
  resolutionOptions?: string[];
  fields?: SchemaFieldDto[];
  statuses?: KeyValue<string, string>[];
}

export interface WorkflowStateSchemaData {
  case?: SchemaData;
  steps?: SchemaData[];
}

const pageSize = 999;
@Component({
  selector: 'app-workflow-create',
  templateUrl: './workflow-create.component.html',
  styleUrls: ['./workflow-create.component.scss'],
  styles: [':host { display: block; height: 100%; overflow-y: auto; }']
})
export class WorkflowCreateComponent extends TenantComponent implements OnInit, OnDestroy {
  @ViewChild('linkCreator') linkCreator: MatExpansionPanel;
  @ViewChild('transitionCreator') transitionCreator: MatExpansionPanel;

  workflowForm: FormGroup;
  componentId: string = 'b3dabdfe-a11d-4228-8f9e-817dc99dda88';
  title: string = 'Create Workflow';
  allCaseSchemas: SchemaDto[];
  caseSchemaOptions: ISchemaDtoDisabled[];
  statusesList: WorkflowStatusDto[] = [];
  currentWorkflowId: string;

  defaultStatusesList: WorkflowStatusDto[] = [];
  existingWorkflows: WorkflowDto[];
  workflow: WorkflowDto;
  isDeskTop: boolean = true;
  appBarData: AppBarData = { title: this.title } as AppBarData;
  actionsByArea: AreaActionsData[] = [
    {
      subArea: WorkflowEventSubAreas.WorkflowOnCreateEventsScope,
      label: WorkflowActionSubareaNameMap.get(WorkflowEventSubAreas.WorkflowOnCreateEventsScope).viewValue,
      actions: []
    },
    {
      subArea: WorkflowEventSubAreas.WorkflowOnDeleteEventsScope,
      label: WorkflowActionSubareaNameMap.get(WorkflowEventSubAreas.WorkflowOnDeleteEventsScope).viewValue,
      actions: []
    },
    {
      subArea: WorkflowEventSubAreas.WorkflowOnUpdateEventsScope,
      label: WorkflowActionSubareaNameMap.get(WorkflowEventSubAreas.WorkflowOnUpdateEventsScope).viewValue,
      actions: []
    },
    {
      subArea: WorkflowEventSubAreas.WorkflowStatusEventsScope,
      label: WorkflowActionSubareaNameMap.get(WorkflowEventSubAreas.WorkflowStatusEventsScope).viewValue,
      actions: []
    },
    {
      subArea: WorkflowEventSubAreas.WorkflowStepAddedEventsScope,
      label: WorkflowActionSubareaNameMap.get(WorkflowEventSubAreas.WorkflowStepAddedEventsScope).viewValue,
      actions: []
    },
    {
      subArea: WorkflowEventSubAreas.WorkflowOnAutoIncrementField,
      label: WorkflowActionSubareaNameMap.get(WorkflowEventSubAreas.WorkflowOnAutoIncrementField).viewValue,
      actions: []
    }
  ];
  processStepLinks: ProcessStepLinkDto[] = [];
  statusTransitions: WorkflowTransitionDto[] = [];
  showLinkWidget: boolean = false;
  activeLink: ProcessStepLinkDto;
  showTransitionWidget: boolean = false;
  activeTransition: WorkflowTransitionDto;
  processSteps: ProcessStepEntityDto[];
  allStepsLinked: boolean;
  existingCaseSchemaId: string;
  wfStateLoading$: Observable<boolean>;
  wfBuilderProcessStepsLoading$: Observable<boolean>;
  wfBuilderTransitionsLoading$: Observable<boolean>;
  userId: string;
  isIncompleteWorkflow: boolean;
  showRawDataRules: boolean = false;
  workflowCopyId: string;
  disableSaveBtn: boolean = false;
  workflowStateSchemasData: WorkflowStateSchemaData = {};
  get eventScopes() {
    return EventAreaScopes;
  }

  get caseSchemaIdControl() {
    return this.workflowForm.controls['caseSchemaId'];
  }

  get statusesControl() {
    return this.workflowForm.controls['statusIds'];
  }

  constructor(
    private formBuilder: FormBuilder,
    private store: Store<WorkflowBuilderState>,
    private snackbar: MatSnackBar,
    private schemaService: SchemasService,
    private route: ActivatedRoute,
    private matDialog: MatDialog,
    private router: Router,
    private sidebarLinksService: SidebarLinksService,
    private workflowsCacheService: WorkflowsCacheService,
    private sharedService: SharedService,
    private dynamicEntitiesService: DynamicEntitiesService,
    private ts: TranslateService,
    private adminSchemasService: AdminSchemasService
  ) {
    super(store);
    this.addSubscriptions();
    this.sharedService.setAppBarData(this.appBarData);
    this.checkRouteParams();
    this.workflowCopyId = this.route.snapshot.queryParamMap.get('copyWfId');
  }

  async ngOnInit(): Promise<void> {
    this.store.dispatch(new GetProcessSteps({ tenantId: this.tenant, paging: { skip: 0, take: pageSize } }));

    this.store
      .select(loggedInState)
      .pipe(
        filter((x) => !!x),
        takeUntil(this.destroyed$)
      )
      .subscribe((data) => {
        this.userId = data.profile.id;
      });

    this.store
      .select(tenantProcessSteps)
      .pipe(
        takeUntil(this.destroyed$),
        filter((x) => !!x)
      )
      .subscribe((stepsData: PagedData<ProcessStepEntityDto>) => {
        this.processSteps = stepsData.items;
        if (this.currentWorkflowId) this.loadProcessStepLinks();
      });

    this.workflowForm = this.formBuilder.group({
      name: ['', Validators.required],
      caseSchemaId: [null, Validators.required],
      statusIds: [null],
      defaultStatus: [null, this.workflowCopyId ? null : Validators.required]
    });

    this.store
      .pipe(select(workflowsListPaginatedSelector), takeUntil(this.destroyed$))
      .subscribe((wfData: PagedDataWithIncompleteItems<WorkflowDto>) => {
        if (wfData) {
          const allWorkflows = wfData.items.concat(wfData.incorrectItems);
          this.processCaseSchemas(allWorkflows);
          if (this.workflowCopyId) {
            const wfSchema = allWorkflows.find((x) => x.id === this.workflowCopyId);
            if (wfSchema) this.title = 'Copy workflow' + ' - ' + wfSchema.name;
            else {
              this.title = 'No Matching Workflow Schema Found';
              this.disableSaveBtn = true;
            }
          }
        }
      });

    // we  need all workflows, not just the ones in store with smaller pagination
    this.store.dispatch(new GetWorkflowsByPagination({ paging: { skip: 0, take: 999 } }));

    this.loadStatuses();

    if (this.currentWorkflowId) {
      this.loadWorkflowData();
      this.loadTransitions();
    }
    this.listenToDefaultStatusFailure();
    this.listenForOperationMessage();
  }

  async populateRelatedSchemasData(): Promise<void> {}

  listenForOperationMessage(): void {
    this.store.pipe(select(wfOperationMsgSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x && x.toLowerCase().includes('success')) {
        this.store.dispatch(new FetchWorkflowMenuData({ tenantId: this.tenant, userId: this.userId }));
        const msg = x.split('-')[0];
        const wfId = x.split('-')[1];
        this.snackbar.open(msg, 'OK', { duration: 2000 });
        this.store.dispatch(new ResetWfOperationMsg());
        this.workflowsCacheService.removeFromCache(wfId);

        // if in create or fix screen, redirect to update screen
        if (wfId && (!this.currentWorkflowId || (this.currentWorkflowId && this.isIncompleteWorkflow))) {
          this.router.navigate([`/${convertTenantName(this.sidebarLinksService.tenantName)}/workflows/workflow/update/${wfId}`]);
        } else if (wfId && this.currentWorkflowId && !this.isIncompleteWorkflow) {
          this.workflowsCacheService.removeFromCache(wfId);
          this.store.dispatch(new GetWorkflowById({ id: wfId, tenantId: this.tenant }));
        }
      } else if (x && x.toLowerCase().includes('fail')) {
        this.store.dispatch(new ResetWfOperationMsg());
      }
    });
  }

  addSubscriptions(): void {
    this.sharedService.updateMobileQuery.pipe(takeUntil(this.destroyed$)).subscribe((isDeskTop: boolean) => (this.isDeskTop = isDeskTop));
    this.wfStateLoading$ = this.store.pipe(takeUntil(this.destroyed$), select(workflowStateLoading));

    this.wfBuilderProcessStepsLoading$ = this.store.pipe(takeUntil(this.destroyed$), select(wfBuilderProcessStepLinksLoadingSelector));

    this.wfBuilderTransitionsLoading$ = this.store.pipe(takeUntil(this.destroyed$), select(wfBuilderTransitionsLoadingSelector));
  }

  checkRouteParams(): void {
    if (this.route.snapshot.paramMap.get('id')) {
      this.currentWorkflowId = this.route.snapshot.paramMap.get('id');
    } else if (this.route.snapshot.paramMap.get('incorrectItemId')) {
      this.currentWorkflowId = this.route.snapshot.paramMap.get('incorrectItemId');
      this.isIncompleteWorkflow = true;
    }
    if (this.currentWorkflowId) {
      this.title = this.isIncompleteWorkflow ? 'Fix Workflow' : 'Update Workflow';
      this.appBarData.title = this.title;
      this.sharedService.setAppBarData(this.appBarData);
    }
  }

  async loadProcessStepLinks(): Promise<void> {
    if (this.isIncompleteWorkflow) {
      return;
    }
    this.store.dispatch(new GetWorkflowProcessStepLinks({ tenantId: this.tenant, workflowId: this.currentWorkflowId }));

    this.store
      .select(workflowProcessStepLinkList)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(async (links) => {
        if (links && links.length) {
          this.allStepsLinked = links.length === this.processSteps.length ? true : false;
          this.processStepLinks = [...links].sort((a, b) => {
            return a.position - b.position;
          });
          this.workflowStateSchemasData.steps = [];

          for (let link of this.processStepLinks) {
            const step = this.processSteps.find((step) => step.id === link.processStepEntityId);
            if (step) {
              const schema = await this.adminSchemasService.getSchema(this.tenant, AreaTypeEnum.stepForm, step.schemaId);
              if (schema) {
                const schemData: SchemaData = {
                  areaType: AreaTypeEnum.stepForm,
                  schemaName: `Step - ${step.name}`,
                  refName: link.refName,
                  resolutionOptions: step.resolutions.map((res) => res.name),
                  schemaId: step.schemaId,
                  fields: schema.fields
                };
                this.workflowStateSchemasData.steps.push(schemData);
              }
            }
          }
        }
      });
  }

  loadTransitions(): void {
    if (this.isIncompleteWorkflow) {
      return;
    }
    this.store.dispatch(new GetWorkflowTransitions({ tenantId: this.tenant, workflowId: this.currentWorkflowId }));

    this.store
      .select(workflowTransitionList)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((transitions) => {
        if (transitions && transitions.length) {
          this.statusTransitions = [...transitions];
        }
      });
  }

  async loadWorkflowData(): Promise<void> {
    this.store.dispatch(
      new GetWorkflowById({ id: this.currentWorkflowId, tenantId: this.tenant, isIncomplete: this.isIncompleteWorkflow })
    );
    this.store
      .select(workflowSelector)
      .pipe(
        filter((x) => !!x),
        takeUntil(this.destroyed$)
      )
      .subscribe(async (workflowDto) => {
        this.workflow = workflowDto;
        this.workflowForm.patchValue({
          name: this.workflow.name,
          caseSchemaId: this.workflow.caseSchemaId,
          statusIds: workflowDto.statuses?.length > 0 ? workflowDto.statuses.map((x) => x.id) : [],
          defaultStatus: workflowDto.defaultStatusId
        });
        if (this.isIncompleteWorkflow) {
          // to show invalid props in red
          this.workflowForm.markAllAsTouched();
        }

        const caseSchema = await this.adminSchemasService.getSchema(this.tenant, AreaTypeEnum.case, workflowDto.caseSchemaId);

        this.checkForRawData(workflowDto, caseSchema);
        this.existingCaseSchemaId = workflowDto.caseSchemaId;
        this.loadActionsByAreas();
        this.loadDefaultStatuses();

        this.workflowStateSchemasData.case = {
          areaType: AreaTypeEnum.case,
          refName: `workflow_${workflowDto.name}`,
          schemaName: workflowDto.name,
          schemaId: workflowDto.caseSchemaId,
          statuses: this.statusesList.map((status) => {
            return { key: status.name, value: status.id };
          }),
          fields: caseSchema?.fields
        };
      });
    // listen for get workflow by id failure and navigate to workflowGrid
    this.store
      .select(workflowLoadErrorSelector)
      .pipe(
        filter((x) => !!x),
        takeUntil(this.destroyed$)
      )
      .subscribe((error) => {
        this.snackbar.open(this.ts.instant('Failed To Load Workflow'), 'OK', { duration: 3000 });
        this.store.dispatch(new ResetWorkflowLoadError());
        this.router.navigate([`/${convertTenantName(this.sidebarLinksService.tenantName)}/workflows/workflow/list`]);
      });
  }

  /**
   * hide/show rawDataRules
   */

  async checkForRawData(workflow: WorkflowDto, caseSchema: SchemaDto): Promise<void> {
    const rawDataReferenceField = caseSchema.fields.find(
      (field) => field.type === FieldTypeIds.ListOfLinksField && field.configuration.schemaAreaType === AreaTypeEnum.rawData
    );
    this.showRawDataRules = rawDataReferenceField ? true : false;
  }

  loadActionsByAreas(): void {
    this.actionsByArea.forEach((actionData) => {
      switch (actionData.subArea) {
        case WorkflowEventSubAreas.WorkflowOnCreateEventsScope:
          actionData.actions = this.orderActions(this.workflow.onCreateEvents || []);
          break;
        case WorkflowEventSubAreas.WorkflowOnUpdateEventsScope:
          actionData.actions = this.orderActions(this.workflow.onUpdateCase || []);
          break;
        case WorkflowEventSubAreas.WorkflowOnDeleteEventsScope:
          actionData.actions = this.orderActions(this.workflow.onDeleteEvents || []);
          break;
        case WorkflowEventSubAreas.WorkflowStatusEventsScope:
          actionData.actions = this.orderActions(this.workflow.statusEvents || []);
          break;
        case WorkflowEventSubAreas.WorkflowStepAddedEventsScope:
          actionData.actions = this.orderActions(this.workflow.onStepAddedEvents || []);
          break;
        case WorkflowEventSubAreas.WorkflowOnAutoIncrementField:
          actionData.actions = this.orderActions(this.workflow.onAutoIncrementEvents || []);
        default:
          break;
      }
    });
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.workflowForm.controls[controlName].hasError(errorName);
  };

  async processCaseSchemas(workflows: WorkflowDto[]): Promise<void> {
    if (!this.allCaseSchemas) {
      this.allCaseSchemas = (
        await this.schemaService.search(this.tenant, AreaTypeEnum.case, { skip: 0, take: pageSize }, [{ propertyName: 'name', sort: 1 }])
      )?.items;
    }
    if (this.allCaseSchemas.length) {
      this.caseSchemaOptions = [];
      for (let index = 0; index < this.allCaseSchemas.length; index++) {
        if (workflows.findIndex((x) => x.caseSchemaId === this.allCaseSchemas[index].id) >= 0) {
          // if schema is used in some workflow,disable it
          this.caseSchemaOptions.push({ ...this.allCaseSchemas[index], disabled: true });
        } else {
          this.caseSchemaOptions.push({ ...this.allCaseSchemas[index], disabled: false });
        }
        this.workflowForm.patchValue({
          caseSchemaId: this.workflow?.caseSchemaId
          // show the user that caseSchema is missing, instead of preselecting 1
          //  || this.caseSchemaOptions.find((x) => !x.disabled)?.id
        });
      }
    }
  }

  loadStatuses(): void {
    this.store.pipe(select(workflowStatusesSelector)).subscribe((statuses) => {
      this.statusesList = [];
      for (const key in statuses) {
        this.statusesList.push(statuses[key]);
      }
    });
  }

  loadDefaultStatuses(): void {
    const wfStatuses = this.workflowForm.controls.statusIds.value;
    this.defaultStatusesList = [];
    if (wfStatuses?.length > 0 && this.statusesList.length > 0) {
      for (let index = 0; index < wfStatuses.length; index++) {
        const statusIndex = this.statusesList.findIndex((s) => s.id === wfStatuses[index]);
        if (statusIndex >= 0) this.defaultStatusesList.push(this.statusesList[statusIndex]);
      }

      /** during create set default status  to the first status in the list*/
      if (!this.currentWorkflowId && this.defaultStatusesList.length > 0 && !this.workflowForm.controls.defaultStatus.value)
        this.workflowForm.controls.defaultStatus.setValue(this.defaultStatusesList[0].id);

      /** If current default status removed from the list of statuses */
      if (this.currentWorkflowId && wfStatuses.findIndex((x) => x === this.workflowForm.controls.defaultStatus.value) < 0) {
        this.workflowForm.controls.defaultStatus.setValue(wfStatuses[0]);
        this.updateDefaultStatus();
      }
    }
  }

  onSubmit(): void {
    if (this.workflowCopyId) {
      this.createWorkflowCopy();
    } else if (!this.currentWorkflowId) {
      if (!isEmptyField(this.workflowForm.controls.name.value) && this.workflowForm.valid) {
        this.createWorkflow();
      } else {
        this.snackbar.open(this.ts.instant('Please fill the missing fields'), 'OK', { duration: 2000 });
      }
    } else {
      if (!isEmptyField(this.workflowForm.controls.name.value)) {
        this.updateWorkflow();
      } else {
        this.snackbar.open(this.ts.instant('Please fill the missing fields'), 'OK', { duration: 2000 });
      }
    }
  }

  async createWorkflow(): Promise<void> {
    const getAreasByActions = this.getActionsByArea();
    const workflowData: CreateWorkflowCommand = {
      name: this.workflowForm.controls.name.value.trim(),
      caseSchemaId: this.workflowForm.controls.caseSchemaId.value,
      statuses: this.workflowForm.controls.statusIds.value,
      tenantId: this.tenant,
      onCreateEvents: getAreasByActions.createActions,
      onDeleteEvents: getAreasByActions.deleteActions,
      onStepAddedEvents: getAreasByActions.stepActions,
      onUpdateCase: getAreasByActions.updateActions,
      statusEvents: getAreasByActions.statusActions,
      onAutoIncrementEvents: getAreasByActions.autoIncrementActions
    };
    try {
      let defaultStatus = this.workflowForm.controls.defaultStatus.value;
      this.store.dispatch(new CreateWorkflow({ data: workflowData, defaultStatusId: defaultStatus }));
    } catch (error) {
      console.log(error);
    }
  }

  getActionsByArea(): AllActionsByArea {
    let createActions: BaseActionType[],
      updateActions: BaseActionType[],
      deleteActions: BaseActionType[],
      stepActions: BaseActionType[],
      statusActions: BaseActionType[],
      autoIncrementActions: BaseActionType[] = [];

    this.actionsByArea.forEach((actionData) => {
      switch (actionData.subArea) {
        case WorkflowEventSubAreas.WorkflowOnCreateEventsScope:
          createActions = this.updateActionsOrders(actionData.actions);
          break;
        case WorkflowEventSubAreas.WorkflowOnDeleteEventsScope:
          deleteActions = this.updateActionsOrders(actionData.actions);
          break;
        case WorkflowEventSubAreas.WorkflowOnUpdateEventsScope:
          updateActions = this.updateActionsOrders(actionData.actions);
          break;
        case WorkflowEventSubAreas.WorkflowStatusEventsScope:
          statusActions = this.updateActionsOrders(actionData.actions);
          break;
        case WorkflowEventSubAreas.WorkflowStepAddedEventsScope:
          stepActions = this.updateActionsOrders(actionData.actions);
          break;
        case WorkflowEventSubAreas.WorkflowOnAutoIncrementField:
          autoIncrementActions = this.updateActionsOrders(actionData.actions);
        default:
          break;
      }
    });

    return {
      createActions: createActions,
      updateActions: updateActions,
      deleteActions: deleteActions,
      stepActions: stepActions,
      statusActions: statusActions,
      autoIncrementActions: autoIncrementActions
    };
  }

  async updateWorkflow(): Promise<void> {
    const getAreasByActions = this.getActionsByArea();
    const workflowData: UpdateWorkflowCommand = {
      id: this.currentWorkflowId,
      name: this.workflowForm.controls.name.value.trim(),
      tenantId: this.tenant,
      caseSchemaId: this.workflowForm.controls.caseSchemaId.value,
      statuses: this.workflowForm.controls.statusIds.value,
      onCreateEvents: getAreasByActions.createActions,
      onDeleteEvents: getAreasByActions.deleteActions,
      onStepAddedEvents: getAreasByActions.stepActions,
      onUpdateCase: getAreasByActions.updateActions,
      statusEvents: getAreasByActions.statusActions,
      onAutoIncrementEvents: getAreasByActions.autoIncrementActions
    };
    if (!this.isIncompleteWorkflow) {
      this.store.dispatch(new UpdateWorkflow({ data: workflowData }));
    } else {
      this.store.dispatch(new FixWorkflow({ data: workflowData }));
    }
  }

  createWorkflowCopy(): void {
    const workflowCopyData: CopyWorkflow = {
      caseSchemaId: this.workflowForm.controls.caseSchemaId.value,
      name: this.workflowForm.controls.name.value.trim(),
      workFlowSchemaId: this.workflowCopyId
    };
    this.store.dispatch(new CreateWorkflowCopy({ data: workflowCopyData }));
  }

  resetFields(): void {
    this.snackbar.open(this.ts.instant('Workflow added successfully'), 'OK', { duration: 2000 });
    this.defaultStatusesList = [];
    this.workflowForm.controls.defaultStatus.setValue(null);
    this.workflowForm.reset();
    this.workflowForm.markAsPristine();
    this.workflowForm.controls.caseSchemaId.setValue(this.caseSchemaOptions[0].id);
    this.workflowForm.controls.statusIds.setValue([this.statusesList.find((x) => x.position === 0).id] || null);
  }

  async openAction(action?: BaseActionType, index?: number, actionSubArea?: WorkflowEventSubAreas): Promise<void> {
    const dialogRef = this.matDialog.open(ActionsComponent, {
      width: '500px'
    });
    dialogRef.componentInstance.actionArea = EventAreaScopes.WorkflowScope;
    dialogRef.componentInstance.workflowStatuses = this.getSelectedStatuses();
    dialogRef.componentInstance.selectedCaseSchemaId = this.workflowForm.controls.caseSchemaId.value;
    dialogRef.componentInstance.workflow = this.workflow;
    dialogRef.componentInstance.subArea = actionSubArea;
    dialogRef.componentInstance.targetSchema = await this.adminSchemasService.getSchema(
      this.tenant,
      AreaTypeEnum.case,
      this.workflowForm.controls.caseSchemaId.value
    );

    if (action) {
      dialogRef.componentInstance.actionDto = action;
    }
    dialogRef.afterClosed().subscribe((x) => {
      if (x && x.actionDto && x.subAreas) {
        this.actionsByArea = cloneDeep(this.actionsByArea);
        for (let i = 0; i < this.actionsByArea.length; i++) {
          const actionData = this.actionsByArea[i];
          if (actionSubArea && actionSubArea === actionData.subArea && (index || index === 0)) {
            // updating existing
            actionData.actions.splice(index, 1, cloneDeep(x.actionDto));
          } else if (!actionSubArea && x.subAreas.includes(actionData.subArea)) {
            // creating a new action
            actionData.actions.push(cloneDeep(x.actionDto));
          }

          actionData.actions = this.updateActionsOrders(actionData.actions);
        }
      }
    });
  }

  removeAction(subArea: WorkflowEventSubAreas, action: BaseActionType, actionIndex: number): void {
    for (let index = 0; index < this.actionsByArea.length; index++) {
      this.actionsByArea = cloneDeep(this.actionsByArea);
      const actionData = this.actionsByArea[index];
      if (actionData.subArea === subArea) {
        actionData.actions.splice(actionIndex, 1);
        actionData.actions = this.updateActionsOrders(actionData.actions);
        break;
      }
    }
  }

  getSelectedStatuses(): WorkflowStatusDto[] {
    let statuses = [];
    let selected = this.workflowForm.controls.statusIds.value;
    if (selected) {
      selected.forEach((id) => {
        let selectedStatus = this.statusesList.find((stt) => stt.id === id);
        if (selectedStatus) {
          statuses.push(selectedStatus);
        }
      });
    }
    return statuses;
  }

  getEventName(type: EventTypes): string {
    return ActionEventNameMap.get(type).viewValue;
  }

  createLink(): void {
    if (this.activeLink && this.showLinkWidget) {
      this.activeLink = null;
      setTimeout(() => {
        this.showLinkWidget = true;
      });
    } else this.showLinkWidget = !this.showLinkWidget;
  }

  editLink(link: ProcessStepLinkDto): void {
    this.showLinkWidget = false;
    setTimeout(() => {
      this.showLinkWidget = true;
      this.activeLink = { ...link };
    });
  }

  resetActiveLink(): void {
    this.activeLink = null;
    this.showLinkWidget = false;
  }

  closeLinkWidget(event): void {
    this.showLinkWidget = false;
    this.activeLink = null;
    if (event === 'Removed') {
      this.resetActiveLink();
    } else {
      this.linkCreator.close();
    }
  }

  editTransition(transition): void {
    this.showTransitionWidget = false;
    setTimeout(() => {
      this.showTransitionWidget = true;
      this.activeTransition = { ...transition };
    });
  }

  resetActiveTransition(): void {
    this.activeTransition = null;
    this.showTransitionWidget = false;
  }

  createTransition(): void {
    this.showTransitionWidget = !this.showTransitionWidget;
    this.activeTransition = null;
  }

  closeTransitionWidget(event): void {
    this.showTransitionWidget = false;
    this.activeTransition = null;
    if (event === 'Removed') {
      this.resetActiveTransition();
    } else {
      this.transitionCreator.close();
    }
  }

  onSchemaChange(event: MatSelectChange): void {
    const dialogRef = this.matDialog.open(ConfirmActionComponent, {
      data: <ConfirmActionData>{
        title: 'Case Schema Change',
        message: 'Changing the caseSchema may affect the existing cases, post actions, rules. Are you sure you want to proceed?',
        showProceedBtn: true
      }
    });
    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((x) => {
        if (x) {
          const currentSchemaObj = this.caseSchemaOptions.find((x) => x.id === this.existingCaseSchemaId);
          if (currentSchemaObj) {
            currentSchemaObj.disabled = !currentSchemaObj.disabled;
          }
          this.existingCaseSchemaId = event.value;
          const newSchemaObj = this.caseSchemaOptions.find((x) => x.id === event.value);
          if (newSchemaObj) {
            newSchemaObj.disabled = !newSchemaObj.disabled;
          }
        } else {
          this.workflowForm.controls.caseSchemaId.setValue(this.existingCaseSchemaId);
        }
      });
  }

  listenToDefaultStatusFailure(): void {
    this.store.pipe(takeUntil(this.destroyed$), select(defaultStatusErrorSelector)).subscribe((errorState) => {
      if (errorState) {
        this.snackbar.open(errorState, 'Ok', { duration: 2000 });
        this.store.dispatch(new ResetErrorState({ resetDefaultStatusError: true }));
      }
    });
  }

  updateDefaultStatus(): void {
    if (this.currentWorkflowId) {
      this.store.dispatch(
        new SetDefaultStatus({ wfId: this.currentWorkflowId, defaultStatusId: this.workflowForm.controls.defaultStatus.value })
      );
    }
  }

  onActionDrag(e: CdkDragDrop<BaseActionType[]>, actionArea: AreaActionsData): void {
    if (e.previousContainer === e.container) {
      const reorderedData: BaseActionType[] = cloneDeep(e.container.data);
      moveItemInArray(reorderedData, e.previousIndex, e.currentIndex);
      actionArea.actions = this.updateActionsOrders(reorderedData);
    }
  }

  private updateActionsOrders(items: BaseActionType[]): BaseActionType[] {
    const clonedItems = cloneDeep(items);
    clonedItems.forEach((x, idx) => {
      if (x.index !== idx) {
        x.index = idx;
      }
    });
    return clonedItems;
  }

  orderActions(actions: BaseActionType[]): BaseActionType[] {
    return sortBy(actions || [], [(x) => x.index]);
  }

  /**
   * if the operation is failed because of
   * status being used in some cases,
   * get those cases
   * TODO: show the cases somehow, if required by business
   */
  async checkForStatusUsageFail(errorMessage: string): Promise<DynamicEntityStatusUsage[]> {
    try {
      if (errorMessage.includes('Status (')) {
        const re = /\((.*)\)/;
        const [, statusId] = errorMessage.match(re);
        if (statusId) {
          const casesWhereStatusIsUsed = await this.dynamicEntitiesService.getDynamicEntityStatusUsage(
            this.tenant,
            statusId,
            AreaTypeEnum.case,
            this.workflow.caseSchemaId
          );
          return casesWhereStatusIsUsed;
        }
        return null;
      }
      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  onDrag(e: CdkDragDrop<any[]>): void {
    if (e.previousContainer === e.container) {
      const reorderedData: ProcessStepLinkDto[] = cloneDeep(e.container.data);
      moveItemInArray(reorderedData, e.previousIndex, e.currentIndex);
      this.processStepLinks = this.updateProcessStepLinksOrder(reorderedData);
    }
    const processStepLinks: ProcessStepLinkPositionsDto[] = this.processStepLinks.map((x) => {
      return { refName: x.refName, position: x.position, id: x.id };
    });
    this.store.dispatch(new UpdateAllProcessStepLinksPosition({ tenantId: this.tenant, wfId: this.workflow.id, data: processStepLinks }));
  }

  updateProcessStepLinksOrder(data: ProcessStepLinkDto[]): ProcessStepLinkDto[] {
    const clonedItems: ProcessStepLinkDto[] = cloneDeep(data);
    clonedItems.forEach((x, idx) => {
      if (x.position !== idx) {
        x.position = idx;
      }
    });
    return clonedItems;
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    // reset all the workflow-specific state props
    this.store.dispatch(new GetWorkflowTransitionsSuccess({ data: [] }));
    this.store.dispatch(new GetWorkflowProcessStepLinksSuccess({ data: [] }));
    this.store.dispatch(new GetWorkflowSuccess({ result: null }));
  }
}
