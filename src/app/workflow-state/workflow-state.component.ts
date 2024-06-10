/**
 * global
 */
import { Component, EventEmitter, HostListener, Inject, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { debounceTime, filter, map, take, takeUntil } from 'rxjs/operators';
import { cloneDeep } from 'lodash-core';
import { CdkDrag, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { TranslateService } from '@ngx-translate/core';
import { DateTime } from 'luxon';
import { CdkDragMove } from '@angular/cdk/drag-drop';

/**
 * project
 */
import {
  APP_CLIENT_ID,
  WorkflowDto,
  WorkflowStateStepDto,
  UpdateStepCommand,
  AreaTypeEnum,
  DeleteStepCommand,
  WorkflowStateUI,
  VisualElement,
  UpdateCaseStepsUi,
  FieldTypeIds,
  SchemaDto,
  SettingsUI,
  keyForSchemaTitleSettings,
  CaseStepEntityUi,
  PermissionSettings,
  SharedService
} from '@wfm/service-layer';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import {
  GetWorkflowStateById,
  workflowStateSelector,
  workflowSelector,
  GetWorkflowById,
  RemoveWorkflowStateStep,
  UpdateWorkflowStateCaseStepsUi,
  workflowStateLoading,
  workflowStepUpdateLoading,
  ResetWorkflowState,
  CreateWorkflowStateStep,
  workflowStateLoadErrorSelector,
  GetActiveFieldLinkOverrides
} from '@wfm/store/workflow';
import { Guid } from '@wfm/shared/guid';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { tenantSettingsSelector, showRawDataMenuSelector, AuthState, loggedInState } from '@wfm/store';
import { ListOfLinkFieldValueDto } from '@wfm/service-layer/models/FieldValueDto';
import { processStepRelocationSettingsKey } from '@wfm/tenants/process-steps-relocation/process-steps-relocation.component';
import { ConfirmActionData } from '@wfm/service-layer/models/confirm-action';
import { SchemaPermissionsHelper } from '@wfm/service-layer/helpers/schema-permissions.helper';
import { FieldLinkData } from '@wfm/service-layer/helpers/step-field-link-data.resolver';
import { StepToLoadEnum } from '@wfm/external-link-parser/external-link-parser';

/**
 * local
 */
import { WorkflowStateUiService } from './workflow-state-ui.service';
import { WorkflowStateRawDataComponent } from './workflow-state-raw-data/workflow-state-raw-data.component';

import { ConfirmActionComponent } from './confirm-action/confirm-action.component';
import { CommentData } from './workflow-state-case-activity/workflow-state-case-activity/workflow-state-case-activity.component';

export interface StepStatusData {
  icon: string;
  color: string;
  label: string;
}

export interface ScreenMeasurements {
  left?: number;
  right?: number;
  containerWidth: number;
  x: number;
  offsetX: number;
  panelWidth: number;
  tempPanelWidth: number;
  minWidth?: number;
}

export const caseStepsSelectedViewKey = 'caseStepsSelectedView';
export const stepsPanelWidthKey = 'steps-panel-width';

@Component({
  selector: 'app-workflow-state',
  templateUrl: './workflow-state.component.html',
  styleUrls: ['./workflow-state.component.scss']
})
export class WorkflowStateComponent extends TenantComponent implements OnInit, OnDestroy {
  @ViewChild('panelDragger', { read: CdkDrag }) panelDragger: CdkDrag;

  @Input() isSidePanel: boolean;
  @Input() showCaseButtons: boolean;
  @Output() closeEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  workflowStateId: string;
  caseSchemaId: string;
  workflowSchemaId: string;
  isEdit: boolean;

  componentId: string = 'e1b3a5dc-6b0f-4911-b78e-038389c10667';
  workflow: WorkflowDto;
  workflowState: WorkflowStateUI;
  isActivityVisible: boolean = false;
  processSteps: WorkflowStateStepDto[] = [];
  processStepsAll: WorkflowStateStepDto[] = [];
  rawDataComponentTitle: string = 'Raw Data in this Case';
  stepUsageMap: { [key: string]: number } = {};
  errorMessage$: Observable<string>;
  stepsAreHidden: boolean = false;
  showEditBtn: boolean = false;
  loading$: Observable<boolean>;
  steploading$: Observable<boolean>;
  caseSchema: SchemaDto;
  numberOfRawDataItems: number;
  allTitleSettings: SettingsUI[];
  caseStepsSelectedView: string = 'list';
  userId: string;
  canRelocateSteps: boolean = true;
  activeStepIndex: number;
  lastComment: string = '';
  showRawDataMenu$: Observable<boolean>;
  stepFieldLink: FieldLinkData;
  numberOfStepsToPreload = 3;
  stepsToLoad: { [key: string]: boolean };
  stepStatuses: { [key: string]: StepStatusData };
  stepToOpenFromQuery: StepToLoadEnum;
  tenantAuthState: AuthState;

  uiProps: ScreenMeasurements = {
    left: 150,
    containerWidth: 100,
    x: 100,
    offsetX: 0,
    panelWidth: 258,
    tempPanelWidth: 258,
    minWidth: 120
  };

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload() {
    this.storePanelWidth();
  }

  constructor(
    @Inject(APP_CLIENT_ID) readonly appId: string,
    private store: Store<ApplicationState>,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    public wfStateUiService: WorkflowStateUiService,
    private adminSchemaService: AdminSchemasService,
    private snackbar: MatSnackBar,
    private schemaPermissionsHelper: SchemaPermissionsHelper,
    private ts: TranslateService,
    private sharedService: SharedService
  ) {
    super(store);

    this.showRawDataMenu$ = this.store.pipe(select(showRawDataMenuSelector), takeUntil(this.destroyed$));
  }

  async ngOnInit(): Promise<void> {
    this.uiProps.containerWidth = window.screen.width;
    this.stepStatuses = {
      resolved: {
        icon: 'done',
        color: 'success',
        label: this.ts.instant('Resolved')
      },
      inProgress: {
        icon: 'save',
        color: 'warning',
        label: this.ts.instant('In Progress')
      }
    };
    this.checkStepFieldLink();
    this.workflowSchemaId = this.activatedRoute.snapshot.params['workflowId'];
    this.errorMessage$ = this.store.select(workflowStateLoadErrorSelector);
    this.listenForWorkflowStateGetById();
    this.activatedRoute.queryParams.pipe(takeUntil(this.destroyed$)).subscribe((queryParams) => {
      this.activeStepIndex = null;
      this.isEdit = queryParams['isEditCase'] === 'true' ? true : false;
      if (queryParams['stepToLoad']) {
        this.stepToOpenFromQuery = <StepToLoadEnum>queryParams['stepToLoad'];
      }

      if (this.isSidePanel) {
        // workflow-state view in sidepanel
        this.workflowStateId = queryParams['workflowStateId'];
        if (this.workflowStateId) {
          this.lastComment = '';
          this.getWorkflowState();
          this.isActivityVisible = false;
        }
      }
      if (queryParams['commentId']) {
        this.isActivityVisible = true;
      }
    });
    if (!this.isSidePanel) {
      // full screen
      this.workflowStateId = this.activatedRoute.snapshot.params['workflowStateId'];
      this.getWorkflowState();
    }
    this.store
      .select(workflowStateSelector)
      .pipe(
        filter((wfState) => !!wfState),
        takeUntil(this.destroyed$)
      )
      .subscribe((wfState) => {
        this.workflowState = null;
        this.workflowState = cloneDeep(wfState);
        this.populateStepStatuses();
        if (this.stepFieldLink) {
          this.openActiveStep();
        } else {
          this.openLastUnresolvedStep();
        }
        this.populateStepsToBePreloaded();
        this.populateUsageLimits();

        this.store.dispatch(
          new GetWorkflowById({
            id: this.workflowState.workflowId,
            tenantId: this.tenant
          })
        );

        this.store
          .select(tenantSettingsSelector)
          .pipe(
            filter((x) => !!x),
            takeUntil(this.destroyed$)
          )
          .subscribe((tenantSettings) => {
            this.allTitleSettings = tenantSettings.filter((x) => x.key.includes(keyForSchemaTitleSettings));
            /** Filter process step relocation settings */
            const currentRelocationStepsSettings = tenantSettings.find((x) =>
              x.key.includes(`${processStepRelocationSettingsKey}_${this.workflowSchemaId}`)
            );
            if (currentRelocationStepsSettings) this.canRelocateSteps = !currentRelocationStepsSettings.value.disable;
          });

        this.processSteps = this.workflowState.steps?.sort((a, b) => {
          return a.position - b.position;
        });
        this.stepsAreHidden =
          this.processSteps.filter((e) => e.canAdd).length === 0
            ? true
            : localStorage.getItem(`caseStepsPanelHidden_${this.workflowStateId}_${this.workflowSchemaId}`) != null;
        this.processStepsAll = cloneDeep(this.processSteps);
      });

    this.store
      .select(workflowSelector)
      .pipe(
        filter((wf) => !!wf),
        takeUntil(this.destroyed$)
      )
      .subscribe(async (wf) => {
        this.workflow = wf;
        this.caseSchemaId = this.workflow.caseSchemaId;
        this.numberOfRawDataItems = await this.getNumberOfRawDatasInCase();
        await this.getCaseSchemaSettings();
      });
    this.getTenantAuthState();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (stepsPanelWidthKey in localStorage) {
        this.uiProps.panelWidth = +localStorage.getItem(stepsPanelWidthKey);
        this.uiProps.tempPanelWidth = +localStorage.getItem(stepsPanelWidthKey);
      }
      this.setPanelSizes();
      this.panelDragger?.moved
        .pipe(
          takeUntil(this.destroyed$)
          // debounceTime(10)
        )
        .subscribe((e: CdkDragMove) => {
          this.onResizeRightColumn(e);
        });
    }, 700);
  }

  getTenantAuthState(): void {
    this.store.pipe(takeUntil(this.destroyed$), select(loggedInState)).subscribe((data) => {
      if (data) {
        this.tenantAuthState = data;
        this.userId = data.profile.id;
        if (data?.currentTenantSystem?.tenantSettings?.length) {
          const caseViewSetting = data.currentTenantSystem.tenantSettings.find((x) => x.key === caseStepsSelectedViewKey);
          const localCaseViewSetting = localStorage.getItem(`${caseStepsSelectedViewKey}_${this.userId}`);
          if (localCaseViewSetting) {
            this.caseStepsSelectedView = localCaseViewSetting;
          } else this.caseStepsSelectedView = caseViewSetting ? caseViewSetting?.value?.view : 'list';
        }
      }
    });
  }

  reviewData(): void {
    this.dialog.open(WorkflowStateRawDataComponent, {
      width: '900px',
      data: { title: this.rawDataComponentTitle, showAll: false, isDialog: true },
      panelClass: ['workflow-state-rawdata-preview']
    });
  }

  // preload only limited number of steps on workflowState loading
  populateStepsToBePreloaded(): void {
    this.stepsToLoad = {};
    let notLoadedCaseStepIds = this.workflowState.caseSteps.map((step) => step.visualElementId);
    if (notLoadedCaseStepIds.length) {
      const activeStep = this.workflowState.caseSteps[this.activeStepIndex];
      if (activeStep) {
        this.stepsToLoad[activeStep.visualElementId] = true;
        notLoadedCaseStepIds = notLoadedCaseStepIds.filter((id) => id !== activeStep.visualElementId);
      }
      while (notLoadedCaseStepIds.length >= 1 && Object.keys(this.stepsToLoad).length < this.numberOfStepsToPreload) {
        const nextStepId = notLoadedCaseStepIds.splice(0, 1)[0];
        this.stepsToLoad[nextStepId] = true;
      }
    }
  }

  checkStepFieldLink(): void {
    this.activatedRoute.data
      .pipe(
        filter((x) => !!x.stepFieldData),
        map((data) => data.stepFieldData),
        takeUntil(this.destroyed$)
      )
      .subscribe((stepFieldData: FieldLinkData) => {
        this.stepFieldLink = stepFieldData;
      });
  }

  openActiveStep(): void {
    if (this.stepFieldLink && this.workflowState.caseSteps?.length) {
      const index = this.workflowState.caseSteps.findIndex((caseStep) => {
        return caseStep.refName === this.stepFieldLink.stepRefName && caseStep.visualElementId === this.stepFieldLink.visualElementId;
      });
      if (index >= 0) {
        this.activeStepIndex = index;
      } else {
        this.openLastUnresolvedStep();
      }
    }
  }

  openLastUnresolvedStep(): void {
    if (this.workflowState.caseSteps?.length) {
      if (this.stepToOpenFromQuery) {
        this.activeStepIndex = this.stepToOpenFromQuery === StepToLoadEnum.first ? 0 : this.workflowState.caseSteps.length - 1;
      } else {
        for (let i = this.workflowState.caseSteps.length - 1; i >= 0; i--) {
          const caseStep = this.workflowState.caseSteps[i];
          if (!caseStep.resolution && caseStep.rights.canEdit) {
            this.activeStepIndex = i;
            break;
          }
        }
      }
    }
  }

  onStepOpened(event: MatTabChangeEvent): void {
    this.activeStepIndex = event.index;
    const activeStep = this.workflowState.caseSteps[this.activeStepIndex];
    if (activeStep) {
      this.stepsToLoad[activeStep.visualElementId] = true;
    }
  }

  handleLastComment(event: CommentData): void {
    if (!event) {
      this.lastComment = '';
    } else {
      this.lastComment = `${this.ts.instant('Last Comment Added')} \n ${DateTime.fromISO(event.createdAt).toRelative()}`;
      // const diffs = getDateDiffs(new Date(event.createdAt), new Date());
      // if (diffs.seconds <= 60 && diffs.days <= 0 && diffs.hours <= 0 && diffs.minutes <= 0) {
      //   this.lastComment += diffs.seconds + ' sec(s) ';
      // } else {
      //   if (diffs.days > 0) this.lastComment += diffs.days + ' day(s) ';
      //   if (diffs.hours > 0) this.lastComment += diffs.hours + ' hour(s) ';
      //   if (diffs.minutes > 0) this.lastComment += diffs.minutes + ' min(s) ';
      // }
      // this.lastComment += 'ago';
    }
  }

  async getNumberOfRawDatasInCase(): Promise<number> {
    try {
      this.caseSchema = await this.adminSchemaService.getSchema(this.tenant, AreaTypeEnum.case, this.caseSchemaId);

      const rawDataSchemaFields = this.caseSchema.fields?.filter((f) => {
        return f.type === FieldTypeIds.ListOfLinksField && f.schemaFieldConfiguration['schemaAreaType'] === AreaTypeEnum.rawData;
      });
      if (rawDataSchemaFields.length) {
        let totalRawDataCount = 0;

        for (const rawDataSchemaField of rawDataSchemaFields) {
          let rawDataIdsField = this.workflowState?.case?.fields?.find((f) => {
            return f.type === FieldTypeIds.ListOfLinksField && f.id === rawDataSchemaField?.fieldName;
          });
          const currentItems = (<ListOfLinkFieldValueDto>rawDataIdsField)?.value?.length || 0;
          totalRawDataCount += currentItems;
        }
        return totalRawDataCount;
      }
      return null;
    } catch (error) {
      console.log(error);
    }
  }

  getWorkflowState(): void {
    this.store.dispatch(new GetWorkflowStateById({ id: this.workflowStateId, schemaId: this.workflowSchemaId }));
    // get case field link rules
    this.store.dispatch(
      new GetActiveFieldLinkOverrides({ tenantId: this.tenant, workflowId: this.workflowSchemaId, workflowStateId: this.workflowStateId })
    );
  }

  listenForWorkflowStateGetById(): void {
    this.loading$ = this.store.select(workflowStateLoading);
    this.steploading$ = this.store.select(workflowStepUpdateLoading);
  }

  async getCaseSchemaSettings(): Promise<void> {
    const schemaPermissions = await this.schemaPermissionsHelper.getSchemaPermissions(this.caseSchemaId, AreaTypeEnum.case, this.tenant);
    this.setPermissions(schemaPermissions);
  }

  setPermissions(permissions: PermissionSettings): void {
    this.showEditBtn = permissions.edit;
  }

  clearFilter(): void {
    this.processSteps = this.processStepsAll;
  }

  filter(filteredList: WorkflowStateStepDto[]): void {
    this.processSteps = filteredList;
  }

  /**
   * we need to check what has been dragged and dropped to know what to do
   * add new case step or reorder existing case steps
   * @param event
   */
  drop(event: CdkDragDrop<CaseStepEntityUi[]>): void {
    if (this.canRelocateSteps) {
      const droppedStep = event.item.data;
      if (droppedStep.hasOwnProperty('visualElementId') && event.previousContainer === event.container) {
        if (event.previousIndex !== event.currentIndex) {
          this.reorderCaseSteps(event, droppedStep);
        }
      } else {
        this.processStepToCaseStep(droppedStep);
      }
    } else this.snackbar.open(this.ts.instant('Step relocation not allowed'), 'Ok', { duration: 2000 });
  }

  reorderCaseSteps(event: CdkDragDrop<CaseStepEntityUi[]>, step: CaseStepEntityUi): void {
    this.wfStateUiService
      .userWantsToProceed('Reorder Steps?', 'reordering the steps')
      .pipe(take(1))
      .subscribe((response: boolean) => {
        if (response) {
          const updatedSteps = cloneDeep(event.container.data);
          moveItemInArray(updatedSteps, event.previousIndex, event.currentIndex);
          let newOrderedSteps: CaseStepEntityUi[] = [...updatedSteps];
          let newVisualElements: VisualElement[] = [];
          newOrderedSteps.forEach((dataItem: CaseStepEntityUi, index) => {
            newVisualElements.push({
              id: dataItem.visualElementId,
              index: index
            });
            dataItem.position = index;
          });

          const cmd: UpdateCaseStepsUi = {
            tenantId: this.tenant,
            stateId: this.workflowState.id,
            visualElements: newVisualElements,
            schemaId: this.workflow.id
          };
          this.store.dispatch(new UpdateWorkflowStateCaseStepsUi({ data: cmd }));
        }
      });
  }

  onProcessStepAddClicked(addedStep: WorkflowStateStepDto): void {
    this.processStepToCaseStep(addedStep);
  }

  processStepToCaseStep(step: WorkflowStateStepDto): void {
    this.wfStateUiService
      .userWantsToProceed('Add Step?', 'adding new step')
      .pipe(take(1))
      .subscribe((response: boolean) => {
        if (response) {
          let uiState: VisualElement = {
            id: Guid.createQuickGuid().toString(),
            index: this.workflowState.numberOfCaseSteps
          };

          //update command
          const cmd: UpdateStepCommand = {
            refName: step.refName,
            resolution: '',
            tenantId: this.tenant,
            workflowStateId: this.workflowStateId,
            isGroup: step.isRepeatable,
            stepDynamicEntities: [],
            visualElementId: uiState.id,
            visualElements: [...this.workflowState.visualElements, uiState],
            stepSchemaId: step.schemaId,
            schemaId: this.workflowSchemaId
          };
          let numberOfAddedSteps = this.stepUsageMap[step.refName] || 0;
          // restrict adding more than allowed number of steps
          if (
            (step.numberOfInstances > 1 && numberOfAddedSteps >= step.numberOfInstances) ||
            (step.numberOfInstances <= 1 && numberOfAddedSteps === 1)
          ) {
            this.openMaxStepInfoDialog();
          }
          if (!this.stepUsageMap[step.refName]) {
            this.stepUsageMap[step.refName] = 0;
          }
          this.stepUsageMap[step.refName] += 1;

          //dispatch action
          this.store.dispatch(new CreateWorkflowStateStep({ data: cmd }));
        }
      });
  }

  openMaxStepInfoDialog(): void {
    this.dialog.open(ConfirmActionComponent, {
      data: <ConfirmActionData>{
        title: 'Warning',
        message: 'Step added max allowed number of times ',
        showProceedBtn: true
      }
    });
  }

  deleteStep(step: CaseStepEntityUi): void {
    this.wfStateUiService
      .userWantsToProceed('Remove Step?', 'removing this step', step.refName, true)
      .pipe(take(1))
      .subscribe((response: boolean) => {
        if (response) {
          const cmd: DeleteStepCommand = {
            tenantId: this.tenant,
            workflowStateId: this.workflowStateId,
            refName: step.refName,
            visualElementId: step.visualElementId,
            visualElements: this.filterAndNormalizeVisualElements(this.workflowState.visualElements, step),
            schemaId: this.workflowSchemaId
          };
          this.store.dispatch(new RemoveWorkflowStateStep({ data: cmd }));
        }
      });
  }

  /**
   *
   * @param elements
   * @param step
   * @returns
   */
  filterAndNormalizeVisualElements(elements: VisualElement[], step: CaseStepEntityUi): VisualElement[] {
    const filteredVisualElements = cloneDeep(
      elements.filter((item) => {
        return item.id !== step.visualElementId;
      })
    );
    filteredVisualElements.forEach((x, idx) => {
      if (x.index !== idx) {
        x.index = idx;
      }
    });
    return filteredVisualElements;
  }

  /**
   * create a map object for each step usage
   */
  populateUsageLimits(): void {
    this.stepUsageMap = {};
    this.workflowState.caseSteps?.forEach((stepEntity) => {
      if (this.stepUsageMap.hasOwnProperty(stepEntity.refName)) {
        this.stepUsageMap[stepEntity.refName] += 1;
      } else {
        this.stepUsageMap[stepEntity.refName] = 1;
      }
    });
  }

  toggleSteps(): void {
    this.stepsAreHidden = !this.stepsAreHidden;
    this.setPanelSizes();

    if (this.stepsAreHidden)
      localStorage.setItem(`caseStepsPanelHidden_${this.workflowStateId}_${this.workflowSchemaId}`, this.stepsAreHidden.toString());
    else localStorage.removeItem(`caseStepsPanelHidden_${this.workflowStateId}_${this.workflowSchemaId}`);
  }

  closeWorkflowState(): void {
    this.workflowState = null;
    this.sharedService.setCloseSidePanel();
    this.closeEvent.emit(false);
  }

  changeStepView(view: string): void {
    this.caseStepsSelectedView = view;
    localStorage.setItem(`${caseStepsSelectedViewKey}_${this.userId}`, this.caseStepsSelectedView);
  }

  populateStepStatuses(): void {
    this.workflowState.caseSteps.forEach((step) => {
      if (step.resolution) {
        step.statusData = this.stepStatuses.resolved;
      } else if (step.stepDynamicEntities.some((de) => de.hasSavedValues)) {
        // if at least one step is started, the step shall be shown as in progress
        step.statusData = this.stepStatuses.inProgress;
      }
    });
  }

  setPanelSizes(): void {
    const process = document.getElementById('process');
    const stateSteps = document.getElementById('state-step');
    if (process && stateSteps) {
      const marginKey = 'margin-right';
      if (this.stepsAreHidden) {
        process.style.width = '100%';
        stateSteps.style[marginKey] = `-${this.uiProps.panelWidth}px`;
      } else {
        process.style.width = `calc( 100% - ${this.uiProps.panelWidth}px`;
        stateSteps.style.width = `${this.uiProps.panelWidth}px`;
        stateSteps.style[marginKey] = '0';
      }
    }
  }

  // for right resizable container
  onResizeRightColumn(e: CdkDragMove): void {
    this.uiProps.x = (e.event as MouseEvent).pageX - this.uiProps.offsetX;
    this.uiProps.panelWidth = Math.floor(this.uiProps.containerWidth - this.uiProps.x);
    if (this.uiProps.panelWidth <= this.uiProps.minWidth) {
      this.uiProps.panelWidth = this.uiProps.minWidth;
      return;
    }

    document.getElementById('process').style.width = `calc( 100% - ${this.uiProps.panelWidth}px`;
    document.getElementById('state-step').style.width = `${this.uiProps.panelWidth}px`;
  }

  storePanelWidth(): void {
    if (this.uiProps.tempPanelWidth != this.uiProps.panelWidth && this.uiProps.panelWidth >= this.uiProps.minWidth) {
      localStorage.setItem(stepsPanelWidthKey, String(this.uiProps.panelWidth));
    }
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.storePanelWidth();
    this.store.dispatch(new ResetWorkflowState());
  }
}
