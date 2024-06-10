/**
 * global
 */
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';

/**
 * project
 */

import { MappedPlanUnitItem, WorkflowVisualPlanConfig } from '@wfm/service-layer/models/workflow-visual-plan.model';
import {
  DynamicEntityDto,
  PagedData,
  WorkflowDto,
  WorkflowSimplifiedDto,
  WorkflowStateDto,
  WorkflowStateUI,
  WorkflowStatusDto
} from '@wfm/service-layer';
import { FieldLinkRules } from '@wfm/tenant-admin/workflows/workflow-field-link/field-link.model';

/**
 * local
 */
import { WorkflowActions, WorkflowActionTypes } from './workflow.actions';
import { DataSourceSimplified } from '@wfm/report/report-datasource.model';
import { PostActionData } from '@wfm/service-layer/services/postaction.service';

export interface StepReference {
  refName: string;
  /**
   * to be used for multiple steps
   */
  index?: number;
}

export interface WorkflowState extends EntityState<WorkflowStateDto> {
  selectedWorkflowStateId: string;
  listLoading: boolean;
  loading: boolean;
  stepsUpdateLoading: boolean;
  currentStepError?: string;
  stepVisualSettingsError?: string;
  error: string;
  workflowState: WorkflowStateUI;
  workflowStateCasesList: PagedData<DynamicEntityDto>;
  workflow: WorkflowDto;
  selectedWorkflow: WorkflowSimplifiedDto;
  selectedReport: DataSourceSimplified;
  selectedKanban: boolean;
  workflowsList: WorkflowDto[];
  caseStepsUpdated: Array<StepReference>;
  statuses: { [key: string]: WorkflowStatusDto };
  refreshWorkflowStatesList: boolean;
  workflowStateLoadError: string;
  workflowLoadError: string;
  activatedFieldLinkRules: FieldLinkRules[];
  visualPlanLoading: boolean;
  visualPlanConfigList: WorkflowVisualPlanConfig[];
  visualPlanMappedUnits: MappedPlanUnitItem[];
  visualPlanError: string;
  visualPlanUpdateSuccess: string;
  visualPlanDeleteSuccess: string;
  statusUpdateMsg: string;
  runPostactions: PostActionData[];
}

export const workflowAdapter: EntityAdapter<WorkflowStateDto> = createEntityAdapter<WorkflowStateDto>();

export const initialWorkflowState: WorkflowState = workflowAdapter.getInitialState({
  selectedWorkflowStateId: '',
  loading: false,
  listLoading: false,
  stepsUpdateLoading: false,
  error: '',
  currentStepError: '',
  stepVisualSettingsError: '',
  workflowState: null,
  workflowStateCasesList: null,
  workflow: null,
  selectedWorkflow: null,
  selectedReport: null,

  workflowsList: null,
  caseStepsUpdated: [],
  selectedKanban: false,
  statuses: null,
  refreshWorkflowStatesList: false,
  workflowStateLoadError: '',
  workflowLoadError: '',
  activatedFieldLinkRules: [],
  visualPlanLoading: false,
  visualPlanConfigList: [],
  visualPlanMappedUnits: [],
  visualPlanError: '',
  visualPlanUpdateSuccess: '',
  visualPlanDeleteSuccess: '',
  statusUpdateMsg: null,
  runPostactions: null
});

export function workflowReducer(state = initialWorkflowState, action: WorkflowActions): WorkflowState {
  switch (action.type) {
    case WorkflowActionTypes.GetWorkflows:
      return {
        ...state,
        loading: true,
        error: ''
      };
    case WorkflowActionTypes.GetWorkflowsSuccess:
      return {
        ...state,
        workflowsList: action.payload.result,
        loading: false,
        error: ''
      };
    case WorkflowActionTypes.GetWorkflowsFail:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };
    case WorkflowActionTypes.GetStatusList:
      return {
        ...state,
        loading: true,
        error: ''
      };
    case WorkflowActionTypes.GetStatusListSuccess:
      return {
        ...state,
        statuses: action.payload.result,
        loading: false,
        error: ''
      };
    case WorkflowActionTypes.GetStatusListFail:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };
    case WorkflowActionTypes.GetWorkflowById:
      return {
        ...state,
        loading: !state.stepsUpdateLoading,
        error: ''
      };
    case WorkflowActionTypes.GetWorkflowSuccess:
      return {
        ...state,
        workflow: action.payload.result,
        loading: false,
        error: ''
      };
    case WorkflowActionTypes.GetWorkflowFail:
      return {
        ...state,
        loading: false,
        workflowLoadError: action.payload.error
      };
    case WorkflowActionTypes.ResetWorkflowLoadError:
      return {
        ...state,
        workflowLoadError: ''
      };
    case WorkflowActionTypes.GetWorkflowStateById:
      return {
        ...state,
        currentStepError: '',
        workflowState: null,
        selectedWorkflowStateId: action.payload.id,
        loading: !state.stepsUpdateLoading,
        workflowStateLoadError: ''
      };
    case WorkflowActionTypes.GetWorkflowStateSuccess:
      return {
        ...state,
        caseStepsUpdated: [],
        workflowState: action.payload.result,
        loading: false,
        stepsUpdateLoading: false,
        workflowStateLoadError: ''
      };
    case WorkflowActionTypes.GetWorkflowStateFail:
      return {
        ...state,
        loading: false,
        workflowStateLoadError: action.payload.error
      };
    case WorkflowActionTypes.GetWorkflowStateCasesList:
      return {
        ...state,
        listLoading: true,
        error: ''
      };
    case WorkflowActionTypes.GetWorkflowStateCasesListSuccess:
      return {
        ...state,
        workflowStateCasesList: action.payload.result,
        listLoading: false,
        error: '',
        refreshWorkflowStatesList: false
      };
    case WorkflowActionTypes.GetWorkflowStateCasesListFail:
      return {
        ...state,
        listLoading: false,
        error: action.payload.error
      };
    case WorkflowActionTypes.UpdateWorkflowStateStatusSuccess:
      return {
        ...state,
        statusUpdateMsg: 'Status updated successfully'
      };
    case WorkflowActionTypes.UpdateWorkflowStateStatusFail:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };
    case WorkflowActionTypes.ResetStatusUpdateMsg:
      return {
        ...state,
        statusUpdateMsg: null
      };
    case WorkflowActionTypes.UpdateWorkflowStateStep:
    case WorkflowActionTypes.CreateWorkflowStateStep:
      return {
        ...state,
        loading: true,
        currentStepError: ''
      };
    case WorkflowActionTypes.CreateUpdateWorkflowStateStepSuccess:
      // remove the newly saved step from pending-to-save steps array
      let newStepsUpdatedState = [...state.caseStepsUpdated];
      if (action.payload?.data?.refName) {
        newStepsUpdatedState = newStepsUpdatedState.filter((item) => {
          return item.refName !== action.payload.data.refName;
        });
      }
      return {
        ...state,
        caseStepsUpdated: newStepsUpdatedState,
        loading: false,
        currentStepError: ''
      };
    case WorkflowActionTypes.CreateUpdateWorkflowStateStepFail:
      return {
        ...state,
        loading: false,
        currentStepError: action.payload.error
      };
    case WorkflowActionTypes.RemoveWorkflowStateStep:
      return {
        ...state,
        loading: true,
        currentStepError: ''
      };
    case WorkflowActionTypes.RemoveWorkflowStateStepSuccess:
      return {
        ...state,
        loading: false,
        currentStepError: ''
      };
    case WorkflowActionTypes.RemoveWorkflowStateStepFail:
      return {
        ...state,
        loading: false,
        currentStepError: 'WorkflowState step removing failed'
      };
    case WorkflowActionTypes.AddFlagForStepUpdatedAction:
      const newCaseStepsUpdated = [...state.caseStepsUpdated];
      if (action.payload.dataChanged) {
        newCaseStepsUpdated.push(action.payload.data);
      }
      return {
        ...state,
        caseStepsUpdated: newCaseStepsUpdated
      };
    // case WorkflowActionTypes.UpdateWorkflowStateCase:
    //   return {
    //     ...state,
    //     refreshWorkflowStatesList: null
    //   };
    // case WorkflowActionTypes.UpdateWorkflowStateCaseSuccess:
    //   return {
    //     ...state,
    //     refreshWorkflowStatesList: true
    //   };
    case WorkflowActionTypes.UpdateWorkflowStateCaseFail:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };
    case WorkflowActionTypes.UpdateWorkflowStateCaseStepsUiFail:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };
    case WorkflowActionTypes.UpdateWorkflowStateCaseStepsUi:
      return {
        ...state,
        stepsUpdateLoading: true,
        error: ''
      };
    case WorkflowActionTypes.SetSelectedWorkflow:
      return {
        ...state,
        selectedWorkflow: action.payload.selectedWorkflow,
        visualPlanConfigList: []
      };
    case WorkflowActionTypes.SetSelectedWorkflowFail:
      return {
        ...state,
        error: action.payload.error
      };

    case WorkflowActionTypes.SetSelectedReport:
      return {
        ...state,
        selectedReport: action.payload.selectedReport
      };
    case WorkflowActionTypes.SetSelectedKanban:
      return {
        ...state,
        selectedKanban: action.payload.selectedKanabn
      };
    case WorkflowActionTypes.ResetWorkflowState:
      return Object.assign(
        {},
        {
          ...state,
          workflowState: null,
          activatedFieldLinkRules: []
        }
      );
    case WorkflowActionTypes.RefreshWorkflowStatesList:
      return {
        ...state,
        refreshWorkflowStatesList: action.payload.isRefresh
      };
    case WorkflowActionTypes.UpdateDynamicEntityVisualSettingsFail:
      return {
        ...state,
        stepVisualSettingsError: action.payload.error
      };
    case WorkflowActionTypes.ResetVisualSettingsError:
      return {
        ...state,
        stepVisualSettingsError: ''
      };
    case WorkflowActionTypes.GetActiveFieldLinkOverridesSuccess:
      return {
        ...state,
        loading: false,
        activatedFieldLinkRules: action.payload.data
      };
    case WorkflowActionTypes.ResetWorkflowStateCasesList:
      return {
        ...state,
        workflowStateCasesList: null
      };
    case WorkflowActionTypes.GetWorkflowVisualPlanList:
      return {
        ...state,
        visualPlanLoading: true,
        visualPlanError: null,
        visualPlanConfigList: []
      };
    case WorkflowActionTypes.GetWorkflowVisualPlanListSuccess:
      return {
        ...state,
        visualPlanLoading: false,
        visualPlanError: null,
        visualPlanConfigList: action.payload.data
      };
    case WorkflowActionTypes.GetWorkflowVisualPlanListFail:
      return {
        ...state,
        visualPlanLoading: false,
        visualPlanError: action.payload.error,
        visualPlanConfigList: []
      };
    case WorkflowActionTypes.CreateWorkflowVisualPlan:
      return {
        ...state,
        visualPlanLoading: true,
        visualPlanError: null,
        visualPlanUpdateSuccess: null
      };
    case WorkflowActionTypes.CreateWorkflowVisualPlanSuccess:
      return {
        ...state,
        visualPlanLoading: false,
        visualPlanError: null,
        visualPlanUpdateSuccess: action.payload.visualId
      };
    case WorkflowActionTypes.CreateWorkflowVisualPlanFail:
      return {
        ...state,
        visualPlanLoading: false,
        visualPlanError: action.payload.error,
        visualPlanUpdateSuccess: null
      };
    case WorkflowActionTypes.UpdateWorkflowVisualPlan:
      return {
        ...state,
        visualPlanLoading: true,
        visualPlanError: null,
        visualPlanUpdateSuccess: null
      };
    case WorkflowActionTypes.UpdateWorkflowVisualPlanSuccess:
      return {
        ...state,
        visualPlanLoading: false,
        visualPlanError: null,
        visualPlanUpdateSuccess: action.payload.visualId
      };
    case WorkflowActionTypes.UpdateWorkflowVisualPlanFail:
      return {
        ...state,
        visualPlanLoading: false,
        visualPlanError: action.payload.error,
        visualPlanUpdateSuccess: null
      };
    case WorkflowActionTypes.DeleteWorkflowVisualPlan:
      return {
        ...state,
        visualPlanLoading: true,
        visualPlanError: null,
        visualPlanUpdateSuccess: null
      };
    case WorkflowActionTypes.DeleteWorkflowVisualPlanSuccess:
      return {
        ...state,
        visualPlanLoading: false,
        visualPlanDeleteSuccess: action.payload.visualId
      };
    case WorkflowActionTypes.DeleteWorkflowVisualPlanFail:
      return {
        ...state,
        visualPlanLoading: false,
        visualPlanError: action.payload.error
      };

    case WorkflowActionTypes.GetWorkflowVisualPlanMappedUnits:
      return {
        ...state,
        visualPlanLoading: true,
        visualPlanMappedUnits: []
      };
    case WorkflowActionTypes.GetWorkflowVisualPlanMappedUnitsSuccess:
      return {
        ...state,
        visualPlanLoading: false,
        visualPlanMappedUnits: action.payload.items,
        visualPlanError: null
      };
    case WorkflowActionTypes.GetWorkflowVisualPlanMappedUnitsFail:
      return {
        ...state,
        visualPlanLoading: false,
        visualPlanMappedUnits: [],
        visualPlanError: action.payload.error
      };

    case WorkflowActionTypes.ResetVisualPlanOperations:
      return {
        ...state,
        visualPlanLoading: false,
        visualPlanError: null,
        visualPlanUpdateSuccess: null,
        visualPlanDeleteSuccess: null
      };
    case WorkflowActionTypes.GetFiredPostactions:
    case WorkflowActionTypes.ResetFiredPostactions:
      return {
        ...state,
        runPostactions: null
      };

    case WorkflowActionTypes.GetFiredPostactionsSuccess:
      return {
        ...state,
        runPostactions: action.payload.data
      };
    default:
      return state;
  }
}
