/**
 * global
 */
import { Action } from '@ngrx/store';
import { SearchFieldModel } from '@wfm/service-layer/models/dynamic-entity-models';

/**
 * project
 */
import {
  PagedData,
  Paging,
  Sorting,
  UpdateStatusCommand,
  UpdateStepCommand,
  WorkflowDto,
  CreateWorkflowStateCommand,
  DeleteStepCommand,
  WorkflowStateUI,
  UpdateCaseStepsUi,
  UpdateStateCase,
  WorkflowStatusDto,
  DynamicEntityDto,
  UpdateDynamicEntityVisualSettingsDto,
  WorkflowSimplifiedDto,
  PostActionData,
  AggregationConfig
} from '@wfm/service-layer';

/**
 * local
 */
import { StepReference } from './workflow.reducer';
import { FieldLinkRules } from '@wfm/tenant-admin/workflows/workflow-field-link/field-link.model';
import {
  CreateWorkflowVisualPlanConfig,
  MappedPlanUnitItem,
  WorkflowVisualPlanConfig
} from '@wfm/service-layer/models/workflow-visual-plan.model';
import { DataSourceSimplified } from '@wfm/report/report-datasource.model';

export enum WorkflowActionTypes {
  GetWorkflows = '[Workflow] Get List',
  GetWorkflowsSuccess = '[Workflow] Get List Success',
  GetWorkflowsFail = '[Workflow] Get List Fail',

  GetStatusList = '[Workflow] Get Statuses',
  GetStatusListSuccess = '[Workflow] Get Statuses Success',
  GetStatusListFail = '[Workflow] Get Statuses Fail',

  GetWorkflowById = '[Workflow] Get By ID',
  GetWorkflowSuccess = '[Workflow] Get By ID Success',
  GetWorkflowFail = '[Workflow] Get By ID Fail',
  ResetWorkflowLoadError = '[Workflow] Reset Get By ID Error',

  GetWorkflowStateById = '[WorkflowState] Get By ID',
  GetWorkflowStateSuccess = '[WorkflowState] Get Success',
  GetWorkflowStateFail = '[WorkflowState] Get Fail',

  GetWorkflowStateCasesList = '[WorkflowState] Get Cases List',
  GetWorkflowStateCasesListSuccess = '[WorkflowState] Get Cases List Success',
  GetWorkflowStateCasesListFail = '[WorkflowState] Get Cases List Fail',

  UpdateWorkflowStateStatus = '[WorkflowState Status] Update Status',
  UpdateWorkflowStateStatusSuccess = '[WorkflowState Status] Update Status Success',
  UpdateWorkflowStateStatusFail = '[WorkflowState Status] Update Status Fail',

  CreateWorkflowStateStep = '[WorkflowState CaseStep] Create Step',

  UpdateWorkflowStateStep = '[WorkflowState CaseStep] Update Step',
  CreateUpdateWorkflowStateStepSuccess = '[WorkflowState CaseStep] Create/Update Step Success',
  CreateUpdateWorkflowStateStepFail = '[WorkflowState CaseStep] Create/Update Step Fail',

  UpdateDynamicEntityVisualSettings = '[WorkflowState CaseStep] Update Step DE Visual Settings',
  UpdateDynamicEntityVisualSettingsSuccess = '[WorkflowState CaseStep] Update Step DE Visual Settings Success',
  UpdateDynamicEntityVisualSettingsFail = '[WorkflowState CaseStep] Update Step DE Visual Settings Fail',
  ResetVisualSettingsError = '[WorkflowState CaseStep] Reset Visual Settings Fail Error Message',

  RemoveWorkflowStateStep = '[WorkflowState CaseStep] Remove Step',
  RemoveWorkflowStateStepSuccess = '[WorkflowState CaseStep] Remove Step Success',
  RemoveWorkflowStateStepFail = '[WorkflowState CaseStep] Remove Step Fail',

  CreateWorkflowStates = '[WorkflowState] Create States',
  CreateWorkflowStatesSuccess = '[WorkflowState] Create State Success',
  CreateWorkflowStatesFail = '[WorkflowState] Create State Fail',

  AddFlagForStepUpdatedAction = '[WorkflowState CaseStep] Add Updated Flag',

  UpdateWorkflowStateCaseStepsUi = '[WorkflowState CaseSteps] Update Steps UI',
  UpdateWorkflowStateCaseStepsUiSuccess = '[WorkflowState CaseSteps] Update Steps UI Success',
  UpdateWorkflowStateCaseStepsUiFail = '[WorkflowState CaseSteps] Update Steps UI Fail',

  UpdateWorkflowStateCase = '[WorkflowState] Update Case',
  UpdateWorkflowStateCaseSuccess = '[WorkflowState] Update Case Success',
  UpdateWorkflowStateCaseFail = '[WorkflowState] Update Case Fail',

  SetSelectedWorkflow = '[SelectedWorkflow] SetSelectedWorkflow',
  SetSelectedWorkflowFail = '[SelectedWorkflow] SetSelectedWorkflowFail',

  SetSelectedReport = '[SelectedReport] SetSelectedDatasource',

  SetSelectedKanban = '[SetSelectedKanban] SetSetSelectedKanban',

  ResetWorkflowState = '[ResetWorkflowState] ResetWorkflowState',
  RefreshWorkflowStatesList = '[RefreshWorkflowStatesList] Refresh WorkflowStates List',

  GetActiveFieldLinkOverrides = '[WorkflowState] Get Active Case Field LinkOverrides',
  GetActiveFieldLinkOverridesSuccess = '[WorkflowState] Get Active Case Field LinkOverrides Success',
  GetActiveFieldLinkOverridesFail = '[WorkflowState] Get Active Case Field LinkOverrides Fail',

  ResetWorkflowStateCasesList = '[WorkflowState] Reset WorkflowState Cases List',

  GetWorkflowVisualPlanList = '[WorkflowVisualPlanConfig] Get WorkflowVisualPlanConfig List',
  GetWorkflowVisualPlanListSuccess = '[WorkflowVisualPlanConfig] Get WorkflowVisualPlanConfig List Success',
  GetWorkflowVisualPlanListFail = '[WorkflowVisualPlanConfig] Get WorkflowVisualPlanConfig List Fail',

  CreateWorkflowVisualPlan = '[WorkflowVisualPlanConfig] Create WorkflowVisualPlanConfig',
  CreateWorkflowVisualPlanSuccess = '[WorkflowVisualPlanConfig] Create WorkflowVisualPlanConfig Success',
  CreateWorkflowVisualPlanFail = '[WorkflowVisualPlanConfig] Create WorkflowVisualPlanConfig Fail',

  UpdateWorkflowVisualPlan = '[WorkflowVisualPlanConfig] Update WorkflowVisualPlanConfig',
  UpdateWorkflowVisualPlanSuccess = '[WorkflowVisualPlanConfig] Update WorkflowVisualPlanConfig Success',
  UpdateWorkflowVisualPlanFail = '[WorkflowVisualPlanConfig] Update WorkflowVisualPlanConfig Fail',

  DeleteWorkflowVisualPlan = '[WorkflowVisualPlanConfig] Delete WorkflowVisualPlanConfig',
  DeleteWorkflowVisualPlanSuccess = '[WorkflowVisualPlanConfig] Delete WorkflowVisualPlanConfig Success',
  DeleteWorkflowVisualPlanFail = '[WorkflowVisualPlanConfig] Delete WorkflowVisualPlanConfig Fail',

  GetWorkflowVisualPlanMappedUnits = '[WorkflowVisualPlanConfig] Get WorkflowVisualPlan Mapped Units',
  GetWorkflowVisualPlanMappedUnitsSuccess = '[WorkflowVisualPlanConfig] Get WorkflowVisualPlan Mapped Units Success',
  GetWorkflowVisualPlanMappedUnitsFail = '[WorkflowVisualPlanConfig] Get WorkflowVisualPlan Mapped Units Fail',

  GetFiredPostactions = '[WorkflowState] Get Run Postactions',
  GetFiredPostactionsSuccess = '[WorkflowState] Get Run Postactions Success',
  GetFiredPostactionsFail = '[WorkflowState] Get Run Postactions Fail',
  ResetFiredPostactions = '[WorkflowState] Reset Stored Postactions',

  ResetVisualPlanOperations = '[WorkflowVisualPlanConfig] Reset VisualPlan Operation Messages',
  ResetStatusUpdateMsg = '[Workflow] Reset Status update message'
}

export class SetSelectedKanban implements Action {
  readonly type = WorkflowActionTypes.SetSelectedKanban;
  constructor(public payload: { selectedKanabn: boolean }) {}
}

// =============================== Set Selected Workflow
export class SetSelectedWorkflow implements Action {
  readonly type = WorkflowActionTypes.SetSelectedWorkflow;
  constructor(public payload: { selectedWorkflow: WorkflowSimplifiedDto }) {}
}
export class SetSelectedWorkflowFail implements Action {
  readonly type = WorkflowActionTypes.SetSelectedWorkflowFail;
  constructor(public payload: { error: string }) {}
}

// ======================Set Selected Report

export class SetSelectedReport implements Action {
  readonly type = WorkflowActionTypes.SetSelectedReport;
  constructor(public payload: { selectedReport: DataSourceSimplified }) {}
}

// ========================================= GET WF LIST
export class GetWorkflows implements Action {
  readonly type = WorkflowActionTypes.GetWorkflows;
  constructor(public payload: { tenantId: string; paging?: Paging; sorting?: Sorting[] }) {}
}

export class GetWorkflowsSuccess implements Action {
  readonly type = WorkflowActionTypes.GetWorkflowsSuccess;
  constructor(public payload: { result: WorkflowDto[] }) {}
}

export class GetWorkflowsFail implements Action {
  readonly type = WorkflowActionTypes.GetWorkflowsFail;
  constructor(public payload: { error: string }) {}
}

// GET THE LIST OF STATUSES
export class GetStatusList implements Action {
  readonly type = WorkflowActionTypes.GetStatusList;
  constructor(public payload: { tenantId: string; paging?: Paging; sorting?: Sorting[] }) {}
}

export class GetStatusListSuccess implements Action {
  readonly type = WorkflowActionTypes.GetStatusListSuccess;
  constructor(public payload: { result: { [key: string]: WorkflowStatusDto } }) {}
}

export class GetStatusListFail implements Action {
  readonly type = WorkflowActionTypes.GetStatusListFail;
  constructor(public payload: { error: string }) {}
}

// ========================================= GET WF
export class GetWorkflowById implements Action {
  readonly type = WorkflowActionTypes.GetWorkflowById;
  constructor(public payload: { id: string; tenantId: string; isIncomplete?: boolean }) {}
}

export class GetWorkflowSuccess implements Action {
  readonly type = WorkflowActionTypes.GetWorkflowSuccess;
  constructor(public payload: { result: WorkflowDto }) {}
}

export class GetWorkflowFail implements Action {
  readonly type = WorkflowActionTypes.GetWorkflowFail;
  constructor(public payload: { error: string }) {}
}

export class ResetWorkflowLoadError implements Action {
  readonly type = WorkflowActionTypes.ResetWorkflowLoadError;
  constructor() {}
}

// ========================================= CREATE WF-STATE

export class CreateWorkflowStates implements Action {
  readonly type = WorkflowActionTypes.CreateWorkflowStates;
  constructor(public payload: CreateWorkflowStateCommand) {}
}

export class CreateWorkflowStatesSuccess implements Action {
  readonly type = WorkflowActionTypes.CreateWorkflowStatesSuccess;
  constructor(public payload: { data: CreateWorkflowStateCommand; workflowStateId?: string }) {}
}

export class CreateWorkflowStatesFail implements Action {
  readonly type = WorkflowActionTypes.CreateWorkflowStatesFail;
  constructor(public payload: { error: string }) {}
}

// ========================================= GET WF-STATE
export class GetWorkflowStateById implements Action {
  readonly type = WorkflowActionTypes.GetWorkflowStateById;
  constructor(public payload: { id: string; schemaId: string }) {}
}

export class GetWorkflowStateSuccess implements Action {
  readonly type = WorkflowActionTypes.GetWorkflowStateSuccess;
  constructor(public payload: { result: WorkflowStateUI }) {}
}

export class GetWorkflowStateFail implements Action {
  readonly type = WorkflowActionTypes.GetWorkflowStateFail;
  constructor(public payload: { error: string }) {}
}

// ========================================= GET WF-STATE LIST
export class GetWorkflowStateCasesList implements Action {
  readonly type = WorkflowActionTypes.GetWorkflowStateCasesList;
  constructor(
    public payload: {
      tenantId: string;
      caseSchemaId: string;
      filter?: SearchFieldModel[];
      paging?: Paging;
      sorting?: Sorting[];
      aggregates?: AggregationConfig[];
    }
  ) {}
}

export class GetWorkflowStateCasesListSuccess implements Action {
  readonly type = WorkflowActionTypes.GetWorkflowStateCasesListSuccess;
  constructor(public payload: { result: PagedData<DynamicEntityDto> }) {}
}

export class GetWorkflowStateCasesListFail implements Action {
  readonly type = WorkflowActionTypes.GetWorkflowStateCasesListFail;
  constructor(public payload: { error: string }) {}
}

export class ResetWorkflowStateCasesList implements Action {
  readonly type = WorkflowActionTypes.ResetWorkflowStateCasesList;
  constructor() {}
}

// ========================================= UPDATE WF-STATE STATUS

export class UpdateWorkflowStateStatus implements Action {
  readonly type = WorkflowActionTypes.UpdateWorkflowStateStatus;
  constructor(public payload: { data: UpdateStatusCommand }) {}
}

export class UpdateWorkflowStateStatusSuccess implements Action {
  readonly type = WorkflowActionTypes.UpdateWorkflowStateStatusSuccess;
  constructor(public payload: { data: UpdateStatusCommand }) {}
}

export class UpdateWorkflowStateStatusFail implements Action {
  readonly type = WorkflowActionTypes.UpdateWorkflowStateStatusFail;
  constructor(public payload: { error: string }) {}
}

export class ResetStatusUpdateMsg implements Action {
  readonly type = WorkflowActionTypes.ResetStatusUpdateMsg;
  constructor() {}
}

// ========================================= CREATE WF-STATE CASE STEP

export class CreateWorkflowStateStep implements Action {
  readonly type = WorkflowActionTypes.CreateWorkflowStateStep;
  constructor(public payload: { data: UpdateStepCommand }) {}
}

// ========================================= UPDATE WF-STATE CASE STEP

export class UpdateWorkflowStateStep implements Action {
  readonly type = WorkflowActionTypes.UpdateWorkflowStateStep;
  constructor(public payload: { data: UpdateStepCommand }) {}
}

export class CreateUpdateWorkflowStateStepSuccess implements Action {
  readonly type = WorkflowActionTypes.CreateUpdateWorkflowStateStepSuccess;
  constructor(public payload: { data: UpdateStepCommand }) {}
}

export class CreateUpdateWorkflowStateStepFail implements Action {
  readonly type = WorkflowActionTypes.CreateUpdateWorkflowStateStepFail;
  constructor(public payload: { error: string }) {}
}

// ======================================= Update WF-STATE Case Step Visual Settings

export class UpdateDynamicEntityVisualSettings implements Action {
  readonly type = WorkflowActionTypes.UpdateDynamicEntityVisualSettings;
  constructor(public payload: { data: UpdateDynamicEntityVisualSettingsDto }) {}
}

export class UpdateDynamicEntityVisualSettingsSuccess implements Action {
  readonly type = WorkflowActionTypes.UpdateDynamicEntityVisualSettingsSuccess;
  constructor(public payload: {}) {}
}

export class UpdateDynamicEntityVisualSettingsFail implements Action {
  readonly type = WorkflowActionTypes.UpdateDynamicEntityVisualSettingsFail;
  constructor(public payload: { error: string }) {}
}

export class ResetVisualSettingsError implements Action {
  readonly type = WorkflowActionTypes.ResetVisualSettingsError;
  constructor() {}
}
// ========================================= Remove WF-STATE CASE STEP

export class RemoveWorkflowStateStep implements Action {
  readonly type = WorkflowActionTypes.RemoveWorkflowStateStep;
  constructor(public payload: { data: DeleteStepCommand }) {}
}

export class RemoveWorkflowStateStepSuccess implements Action {
  readonly type = WorkflowActionTypes.RemoveWorkflowStateStepSuccess;
  constructor(public payload: { data: DeleteStepCommand }) {}
}

export class RemoveWorkflowStateStepFail implements Action {
  readonly type = WorkflowActionTypes.RemoveWorkflowStateStepFail;
  constructor(public payload: { error: string }) {}
}

// =========================== Add a "has unsaved data" flag to case step

export class AddFlagForStepUpdatedAction implements Action {
  readonly type = WorkflowActionTypes.AddFlagForStepUpdatedAction;
  constructor(public payload: { data: StepReference; dataChanged: boolean }) {}
}
// ========================================= Update WF-STATE CASE STEPS ORDER
export class UpdateWorkflowStateCaseStepsUi implements Action {
  readonly type = WorkflowActionTypes.UpdateWorkflowStateCaseStepsUi;
  constructor(public payload: { data: UpdateCaseStepsUi }) {}
}

export class UpdateWorkflowStateCaseStepsUiSuccess implements Action {
  readonly type = WorkflowActionTypes.UpdateWorkflowStateCaseStepsUiSuccess;
  constructor(public payload: { data: UpdateCaseStepsUi }) {}
}

export class UpdateWorkflowStateCaseStepsUiFail implements Action {
  readonly type = WorkflowActionTypes.UpdateWorkflowStateCaseStepsUiFail;
  constructor(public payload: { error: string }) {}
}

// ========================================= UPDATE WF-STATE CASE

export class UpdateWorkflowStateCase implements Action {
  readonly type = WorkflowActionTypes.UpdateWorkflowStateCase;
  constructor(public payload: { data: UpdateStateCase; workflowStateId?: string }) {}
}

export class UpdateWorkflowStateCaseSuccess implements Action {
  readonly type = WorkflowActionTypes.UpdateWorkflowStateCaseSuccess;
  constructor(public payload: { data: UpdateStateCase; workflowStateId?: string }) {}
}

export class UpdateWorkflowStateCaseFail implements Action {
  readonly type = WorkflowActionTypes.UpdateWorkflowStateCaseFail;
  constructor(public payload: { error: string }) {}
}

export class ResetWorkflowState implements Action {
  readonly type = WorkflowActionTypes.ResetWorkflowState;
}

export class RefreshWorkflowStatesList implements Action {
  readonly type = WorkflowActionTypes.RefreshWorkflowStatesList;
  constructor(public payload: { isRefresh: boolean }) {}
}

export class GetActiveFieldLinkOverrides implements Action {
  readonly type = WorkflowActionTypes.GetActiveFieldLinkOverrides;
  constructor(public payload: { tenantId: string; workflowId: string; workflowStateId: string }) {}
}

export class GetActiveFieldLinkOverridesSuccess implements Action {
  readonly type = WorkflowActionTypes.GetActiveFieldLinkOverridesSuccess;
  constructor(public payload: { data: FieldLinkRules[] }) {}
}

export class GetActiveFieldLinkOverridesFail implements Action {
  readonly type = WorkflowActionTypes.GetActiveFieldLinkOverridesFail;
  constructor(public payload: { error: string }) {}
}

// VisualPlanConfig endpoints

export class GetWorkflowVisualPlanList implements Action {
  readonly type = WorkflowActionTypes.GetWorkflowVisualPlanList;
  constructor(public payload: { tenantId: string; workflowId: string }) {}
}

export class GetWorkflowVisualPlanListSuccess implements Action {
  readonly type = WorkflowActionTypes.GetWorkflowVisualPlanListSuccess;
  constructor(public payload: { data: WorkflowVisualPlanConfig[] }) {}
}

export class GetWorkflowVisualPlanListFail implements Action {
  readonly type = WorkflowActionTypes.GetWorkflowVisualPlanListFail;
  constructor(public payload: { error: string }) {}
}

export class CreateWorkflowVisualPlan implements Action {
  readonly type = WorkflowActionTypes.CreateWorkflowVisualPlan;
  constructor(public payload: { data: CreateWorkflowVisualPlanConfig }) {}
}

export class CreateWorkflowVisualPlanSuccess implements Action {
  readonly type = WorkflowActionTypes.CreateWorkflowVisualPlanSuccess;
  constructor(public payload: { visualId: string }) {}
}

export class CreateWorkflowVisualPlanFail implements Action {
  readonly type = WorkflowActionTypes.CreateWorkflowVisualPlanFail;
  constructor(public payload: { error: string }) {}
}

export class UpdateWorkflowVisualPlan implements Action {
  readonly type = WorkflowActionTypes.UpdateWorkflowVisualPlan;
  constructor(public payload: { data: WorkflowVisualPlanConfig }) {}
}

export class UpdateWorkflowVisualPlanSuccess implements Action {
  readonly type = WorkflowActionTypes.UpdateWorkflowVisualPlanSuccess;
  constructor(public payload: { visualId: string }) {}
}

export class UpdateWorkflowVisualPlanFail implements Action {
  readonly type = WorkflowActionTypes.UpdateWorkflowVisualPlanFail;
  constructor(public payload: { error: string }) {}
}

export class DeleteWorkflowVisualPlan implements Action {
  readonly type = WorkflowActionTypes.DeleteWorkflowVisualPlan;
  constructor(public payload: { workflowId: string; visualConfigId: string; tenantId: string }) {}
}

export class DeleteWorkflowVisualPlanSuccess implements Action {
  readonly type = WorkflowActionTypes.DeleteWorkflowVisualPlanSuccess;
  constructor(public payload: { visualId: string }) {}
}

export class DeleteWorkflowVisualPlanFail implements Action {
  readonly type = WorkflowActionTypes.DeleteWorkflowVisualPlanFail;
  constructor(public payload: { error: string }) {}
}

export class GetWorkflowVisualPlanMappedUnits implements Action {
  readonly type = WorkflowActionTypes.GetWorkflowVisualPlanMappedUnits;
  constructor(public payload: { workflowId: string; visualConfigId: string; tenantId: string }) {}
}

export class GetWorkflowVisualPlanMappedUnitsSuccess implements Action {
  readonly type = WorkflowActionTypes.GetWorkflowVisualPlanMappedUnitsSuccess;
  constructor(public payload: { items: MappedPlanUnitItem[] }) {}
}

export class GetWorkflowVisualPlanMappedUnitsFail implements Action {
  readonly type = WorkflowActionTypes.GetWorkflowVisualPlanMappedUnitsFail;
  constructor(public payload: { error: string }) {}
}

export class GetFiredPostactions implements Action {
  readonly type = WorkflowActionTypes.GetFiredPostactions;
  constructor(
    public payload: {
      operationId: string;
    }
  ) {}
}

export class GetFiredPostactionsSuccess implements Action {
  readonly type = WorkflowActionTypes.GetFiredPostactionsSuccess;
  constructor(public payload: { data: PostActionData[] }) {}
}

export class GetFiredPostactionsFail implements Action {
  readonly type = WorkflowActionTypes.GetFiredPostactionsFail;
  constructor(public payload: { error: string }) {}
}

export class ResetFiredPostactions implements Action {
  readonly type = WorkflowActionTypes.ResetFiredPostactions;
  constructor() {}
}

export class ResetVisualPlanOperations implements Action {
  readonly type = WorkflowActionTypes.ResetVisualPlanOperations;
}

export type WorkflowActions =
  | GetWorkflows
  | GetWorkflowsSuccess
  | GetWorkflowsFail
  | GetWorkflowById
  | GetWorkflowSuccess
  | GetWorkflowFail
  | ResetWorkflowLoadError
  | GetWorkflowStateById
  | GetWorkflowStateSuccess
  | GetWorkflowStateFail
  | GetWorkflowStateCasesList
  | GetWorkflowStateCasesListSuccess
  | GetWorkflowStateCasesListFail
  | GetStatusList
  | GetStatusListSuccess
  | GetStatusListFail
  | UpdateWorkflowStateStatus
  | UpdateWorkflowStateStatusSuccess
  | UpdateWorkflowStateStatusFail
  | CreateWorkflowStateStep
  | UpdateWorkflowStateStep
  | CreateUpdateWorkflowStateStepSuccess
  | CreateUpdateWorkflowStateStepFail
  | UpdateDynamicEntityVisualSettings
  | UpdateDynamicEntityVisualSettingsSuccess
  | UpdateDynamicEntityVisualSettingsFail
  | ResetVisualSettingsError
  | RemoveWorkflowStateStep
  | RemoveWorkflowStateStepSuccess
  | RemoveWorkflowStateStepFail
  | CreateWorkflowStates
  | CreateWorkflowStatesSuccess
  | CreateWorkflowStatesFail
  | AddFlagForStepUpdatedAction
  | UpdateWorkflowStateCaseStepsUi
  | UpdateWorkflowStateCaseStepsUiSuccess
  | UpdateWorkflowStateCaseStepsUiFail
  | UpdateWorkflowStateCase
  | UpdateWorkflowStateCaseSuccess
  | UpdateWorkflowStateCaseFail
  | SetSelectedWorkflow
  | SetSelectedWorkflowFail
  | SetSelectedReport
  | SetSelectedKanban
  | ResetWorkflowState
  | RefreshWorkflowStatesList
  | GetActiveFieldLinkOverrides
  | GetActiveFieldLinkOverridesSuccess
  | GetActiveFieldLinkOverridesFail
  | ResetWorkflowStateCasesList
  | GetWorkflowVisualPlanList
  | GetWorkflowVisualPlanListSuccess
  | GetWorkflowVisualPlanListFail
  | CreateWorkflowVisualPlan
  | CreateWorkflowVisualPlanSuccess
  | CreateWorkflowVisualPlanFail
  | UpdateWorkflowVisualPlan
  | UpdateWorkflowVisualPlanSuccess
  | UpdateWorkflowVisualPlanFail
  | DeleteWorkflowVisualPlan
  | DeleteWorkflowVisualPlanSuccess
  | DeleteWorkflowVisualPlanFail
  | GetWorkflowVisualPlanMappedUnits
  | GetWorkflowVisualPlanMappedUnitsSuccess
  | GetWorkflowVisualPlanMappedUnitsFail
  | ResetVisualPlanOperations
  | ResetStatusUpdateMsg
  | GetFiredPostactions
  | GetFiredPostactionsSuccess
  | GetFiredPostactionsFail
  | ResetFiredPostactions;
