/**
 * global
 */
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';

/**
 * project
 */
import {
  PagedData,
  PagedDataWithIncompleteItems,
  ProcessStepEntityDto,
  ProcessStepLinkDto,
  WorkflowDto,
  WorkflowStatusDto,
  WorkflowTransitionDto
} from '@wfm/service-layer';
import { RawDataLinkDto } from '@wfm/tenant-admin/workflows/rawData-link/rawdata-link.model';
import { FieldLinkDto, FieldLinkRules } from '@wfm/tenant-admin/workflows/workflow-field-link/field-link.model';

/**
 * local
 */
import { WorkflowBuilderActions, WorkflowBuilderActionTypes } from './workflow-builder.actions';

export interface WorkflowBuilderState extends EntityState<WorkflowDto> {
  loading: boolean;
  error: string;
  linkUpdateError: string;
  transitions: WorkflowTransitionDto[];
  tenantProcessSteps: PagedData<ProcessStepEntityDto>;
  processStepLinks: ProcessStepLinkDto[];
  stepUpdateError: boolean;
  stepUpdateSuccess: boolean;
  successResponse: string;
  defaultStatusError?: string;
  workflowsListPagination: PagedDataWithIncompleteItems<WorkflowDto>;
  processStepLinksLoading: boolean;
  wfTransitionsLoading: boolean;
  wfProcessStepsLoading: boolean;
  currentProcessStepDataById: ProcessStepEntityDto;
  currentStatusDataById: WorkflowStatusDto;
  wfOperationMsg: string;
  caseFieldLinks: FieldLinkDto[];
  currentFieldLink: FieldLinkDto;
  rawDataLinks?: RawDataLinkDto[];
  currentRawDataLink?: RawDataLinkDto;
}

export const workfloBuilderwAdapter: EntityAdapter<WorkflowDto> = createEntityAdapter<WorkflowDto>();

export const initialWorkflowBuilderState: WorkflowBuilderState = workfloBuilderwAdapter.getInitialState({
  loading: false,
  error: '',
  linkUpdateError: '',
  transitions: null,
  tenantProcessSteps: null,
  processStepLinks: null,
  stepUpdateError: null,
  stepUpdateSuccess: null,
  successResponse: null,
  defaultStatusError: null,
  workflowsListPagination: null,
  processStepLinksLoading: false,
  wfTransitionsLoading: false,
  wfProcessStepsLoading: false,
  currentProcessStepDataById: null,
  currentStatusDataById: null,
  wfOperationMsg: null,
  caseFieldLinks: null,
  currentFieldLink: null
});

export function workflowBuilderReducer(state = initialWorkflowBuilderState, action: WorkflowBuilderActions): WorkflowBuilderState {
  switch (action.type) {
    case WorkflowBuilderActionTypes.GetWorkflowTransitions:
      return {
        ...state,
        wfTransitionsLoading: true,
        error: '',
        successResponse: null
      };
    case WorkflowBuilderActionTypes.GetWorkflowTransitionsSuccess:
      return {
        ...state,
        wfTransitionsLoading: false,
        error: '',
        transitions: action.payload.data,
        successResponse: null
      };
    case WorkflowBuilderActionTypes.GetWorkflowTransitionsFail:
      return {
        ...state,
        wfTransitionsLoading: false,
        error: action.payload.error,
        successResponse: null
      };

    case WorkflowBuilderActionTypes.GetWorkflowProcessStepLinks:
      return {
        ...state,
        processStepLinksLoading: true,
        error: '',
        successResponse: null
      };
    case WorkflowBuilderActionTypes.GetWorkflowProcessStepLinksSuccess:
      return {
        ...state,
        processStepLinksLoading: false,
        error: '',
        processStepLinks: action.payload.data,
        successResponse: null
      };
    case WorkflowBuilderActionTypes.GetWorkflowProcessStepLinksFail:
      return {
        ...state,
        processStepLinksLoading: false,
        error: action.payload.error,
        processStepLinks: [],
        successResponse: null
      };
    case WorkflowBuilderActionTypes.AddProcessStepEntity:
      return {
        ...state,
        loading: true,
        successResponse: null
      };
    case WorkflowBuilderActionTypes.AddProcessStepEntitySuccess:
      return {
        ...state,
        loading: false,
        stepUpdateSuccess: true,
        successResponse: null
      };
    case WorkflowBuilderActionTypes.AddProcessStepEntityFailed:
      return {
        ...state,
        loading: false,
        stepUpdateError: true,
        successResponse: null
      };
    case WorkflowBuilderActionTypes.UpdateProcessStepEntity:
      return {
        ...state,
        loading: true,
        stepUpdateSuccess: null,
        successResponse: null
      };
    case WorkflowBuilderActionTypes.UpdateProcessStepEntitySuccess:
      return {
        ...state,
        loading: false,
        stepUpdateSuccess: true,
        successResponse: null
      };
    case WorkflowBuilderActionTypes.UpdateProcessStepEntityFailed:
      return {
        ...state,
        loading: false,
        stepUpdateError: true,
        successResponse: null
      };

    case WorkflowBuilderActionTypes.GetProcessSteps:
      return {
        ...state,
        wfProcessStepsLoading: true,
        successResponse: null
      };
    case WorkflowBuilderActionTypes.GetProcessStepsSuccess:
      return {
        ...state,
        tenantProcessSteps: action.payload.data,
        wfProcessStepsLoading: false,
        successResponse: null
      };
    case WorkflowBuilderActionTypes.GetProcessStepsFail:
      return {
        ...state,
        wfProcessStepsLoading: false,
        successResponse: null
      };
    case WorkflowBuilderActionTypes.ResetErrorState:
      return {
        ...state,
        stepUpdateError: action.payload.resetStepUpdateError ? null : state.stepUpdateError,
        stepUpdateSuccess: action.payload.resetStepUpdateSuccess ? null : state.stepUpdateSuccess,
        linkUpdateError: action.payload.resetLinkUpdateError ? null : state.linkUpdateError,
        error: action.payload.resetError ? null : state.error,
        defaultStatusError: action.payload.resetDefaultStatusError ? null : state.defaultStatusError
      };
    case WorkflowBuilderActionTypes.AddTransition:
      return {
        ...state,
        loading: true,
        successResponse: null
      };
    case WorkflowBuilderActionTypes.AddTransitionSuccess:
      return {
        ...state,
        loading: false,
        error: null,
        successResponse: 'Transition added successfully'
      };
    case WorkflowBuilderActionTypes.AddTransitionFail:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        successResponse: null
      };

    case WorkflowBuilderActionTypes.UpdateTransition:
      return {
        ...state,
        loading: true,
        successResponse: null
      };
    case WorkflowBuilderActionTypes.UpdateTransitionSuccess:
      return {
        ...state,
        loading: false,
        error: null,
        successResponse: 'Transition updated successfully'
      };
    case WorkflowBuilderActionTypes.UpdateTransitionFail:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        successResponse: null
      };
    case WorkflowBuilderActionTypes.DeleteTransition:
      return {
        ...state,
        loading: true,
        successResponse: null
      };
    case WorkflowBuilderActionTypes.DeleteTransitionSuccess:
      return {
        ...state,
        loading: false,
        error: null,
        successResponse: 'Transition deleted'
      };
    case WorkflowBuilderActionTypes.DeleteTransitionFail:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        successResponse: null
      };
    case WorkflowBuilderActionTypes.AddProcessStepLink:
      return {
        ...state,
        loading: true,
        successResponse: null
      };
    case WorkflowBuilderActionTypes.AddProcessStepLinkSuccess:
      return {
        ...state,
        loading: false,
        error: null,
        linkUpdateError: null,
        successResponse: 'Link created successfully'
      };
    case WorkflowBuilderActionTypes.AddProcessStepLinkFail:
      return {
        ...state,
        loading: false,
        linkUpdateError: action.payload.error,
        successResponse: null
      };
    case WorkflowBuilderActionTypes.UpdateProcessStepLink:
      return {
        ...state,
        loading: true,
        successResponse: null
      };
    case WorkflowBuilderActionTypes.UpdateProcessStepLinkSuccess:
      return {
        ...state,
        loading: false,
        error: null,
        linkUpdateError: null,
        successResponse: 'Link updated successfully'
      };
    case WorkflowBuilderActionTypes.UpdateProcessStepLinkFail:
      return {
        ...state,
        loading: false,
        linkUpdateError: action.payload.error,
        successResponse: null
      };
    case WorkflowBuilderActionTypes.DeleteProcessStepLink:
      return {
        ...state,
        loading: true,
        successResponse: null
      };
    case WorkflowBuilderActionTypes.DeleteProcessStepLinkSuccess:
      return {
        ...state,
        loading: false,
        error: null,
        successResponse: 'Link removed'
      };
    case WorkflowBuilderActionTypes.DeleteProcessStepLinkFail:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        successResponse: null
      };
    case WorkflowBuilderActionTypes.SetDefaultStatus:
      return {
        ...state,
        loading: true
      };
    case WorkflowBuilderActionTypes.SetDefaultStatusSuccess:
      return {
        ...state,
        defaultStatusError: null,
        loading: false
      };
    case WorkflowBuilderActionTypes.SetDefaultStatusFail:
      return {
        ...state,
        defaultStatusError: action.payload.error,
        loading: false
      };
    case WorkflowBuilderActionTypes.GetWorkflowsByPagination:
      return {
        ...state,
        loading: true
      };
    case WorkflowBuilderActionTypes.GetWorkflowsByPaginationSuccess:
      return {
        ...state,
        workflowsListPagination: {
          items: action.payload.items,
          total: action.payload.total,
          incorrectItems: action.payload.incorrectItems
        },
        loading: false
      };
    case WorkflowBuilderActionTypes.GetWorkflowsByPaginationFail:
      return {
        ...state,
        loading: false
      };
    case WorkflowBuilderActionTypes.AddStatus:
      return {
        ...state,
        loading: true
      };
    case WorkflowBuilderActionTypes.AddStatusSuccess:
      return {
        ...state,
        loading: false,
        wfOperationMsg: 'Status added successfully'
      };
    case WorkflowBuilderActionTypes.AddStatusFail:
      return {
        ...state,
        loading: false,
        wfOperationMsg: 'Fail' + action.payload.error
      };
    case WorkflowBuilderActionTypes.UpdateStatus:
      return {
        ...state,
        loading: true
      };
    case WorkflowBuilderActionTypes.UpdateStatusSuccess:
      return {
        ...state,
        loading: false,
        wfOperationMsg: 'Status updated successfully'
      };
    case WorkflowBuilderActionTypes.UpdateStatusFail:
      return {
        ...state,
        loading: false,
        wfOperationMsg: 'Fail' + action.payload.error
      };
    case WorkflowBuilderActionTypes.GetProcessStepDataById:
      return {
        ...state,
        wfProcessStepsLoading: true
      };
    case WorkflowBuilderActionTypes.GetProcessStepDataByIdSuccess:
      return {
        ...state,
        currentProcessStepDataById: action.payload.data,
        wfProcessStepsLoading: false
      };
    case WorkflowBuilderActionTypes.GetProcessStepDataByIdFail:
      return {
        ...state,
        wfProcessStepsLoading: false
      };
    case WorkflowBuilderActionTypes.ClearCurrentProcessStepData:
      return {
        ...state,
        currentProcessStepDataById: null
      };
    case WorkflowBuilderActionTypes.GetStatusDataById:
      return {
        ...state,
        loading: true
      };
    case WorkflowBuilderActionTypes.GetStatusDataByIdSuccess:
      return {
        ...state,
        currentStatusDataById: action.payload.data,
        loading: false
      };
    case WorkflowBuilderActionTypes.GetStatusDataByIdFail:
      return {
        ...state,
        loading: false
      };
    case WorkflowBuilderActionTypes.ClearCurrentStatusData:
      return {
        ...state,
        currentStatusDataById: null
      };
    case WorkflowBuilderActionTypes.ResetWfOperationMsg:
      return {
        ...state,
        wfOperationMsg: null
      };
    case WorkflowBuilderActionTypes.DeleteStatus:
      return {
        ...state,
        loading: true
      };
    case WorkflowBuilderActionTypes.DeleteStatusSuccess:
      return {
        ...state,
        loading: false,
        wfOperationMsg: 'Status Deleted Successfully'
      };
    case WorkflowBuilderActionTypes.DeleteStatusFail:
      return {
        ...state,
        loading: false,
        wfOperationMsg: 'Fail' + action.payload.error
      };
    case WorkflowBuilderActionTypes.DeleteProcessStepEntitySuccess:
      return {
        ...state,
        wfOperationMsg: action.payload.msg
      };
    case WorkflowBuilderActionTypes.DeleteProcessStepEntityFailed:
      return {
        ...state,
        wfOperationMsg: 'Fail' + action.payload.error
      };
    case WorkflowBuilderActionTypes.DeleteWorkflowSuccess:
      return {
        ...state,
        wfOperationMsg: action.payload.msg
      };
    case WorkflowBuilderActionTypes.DeleteWorkflowFailure:
      return {
        ...state,
        wfOperationMsg: 'Fail' + action.payload.error
      };
    case WorkflowBuilderActionTypes.CreateWorkflow:
      return {
        ...state,
        loading: true
      };
    case WorkflowBuilderActionTypes.CreateWorkflowSuccess:
      return {
        ...state,
        loading: false,
        wfOperationMsg: `${action.payload.msg}-${action.payload.workflowId}`
      };
    case WorkflowBuilderActionTypes.CreateWorkflowFailure:
      return {
        ...state,
        loading: false,
        wfOperationMsg: 'Fail' + action.payload.error
      };
    case WorkflowBuilderActionTypes.UpdateWorkflow:
      return {
        ...state,
        loading: true
      };
    case WorkflowBuilderActionTypes.UpdateWorkflowSuccess:
      return {
        ...state,
        loading: false,
        wfOperationMsg: `${action.payload.msg}-${action.payload.workflowId}`
      };
    case WorkflowBuilderActionTypes.UpdateWorkflowFailure:
      return {
        ...state,
        loading: false,
        wfOperationMsg: 'Fail' + action.payload.errorMessage
      };
    case WorkflowBuilderActionTypes.CreateCaseFieldLink:
      return {
        ...state,
        loading: true
      };
    case WorkflowBuilderActionTypes.CreateCaseFieldLinkSuccess:
      return {
        ...state,
        loading: false,
        currentFieldLink: action.payload.fieldLink,
        wfOperationMsg: action.payload.msg
      };
    case WorkflowBuilderActionTypes.CreateCaseFieldLinkFail:
      return {
        ...state,
        loading: false,
        wfOperationMsg: action.payload.error
      };
    case WorkflowBuilderActionTypes.UpdateCaseFieldLink:
      return {
        ...state,
        loading: true
      };
    case WorkflowBuilderActionTypes.UpdateCaseFieldLinkSuccess:
      return {
        ...state,
        loading: false,
        currentFieldLink: action.payload.fieldLink,
        wfOperationMsg: action.payload.msg
      };
    case WorkflowBuilderActionTypes.UpdateCaseFieldLinkFail:
      return {
        ...state,
        loading: false,
        wfOperationMsg: action.payload.error
      };
    case WorkflowBuilderActionTypes.DeleteCaseFieldLink:
      return {
        ...state,
        loading: true
      };
    case WorkflowBuilderActionTypes.DeleteCaseFieldLinkSuccess:
      return {
        ...state,
        loading: false,
        currentFieldLink: null,
        wfOperationMsg: action.payload.msg
      };
    case WorkflowBuilderActionTypes.DeleteCaseFieldLinkFail:
      return {
        ...state,
        loading: false,
        wfOperationMsg: action.payload.error
      };
    case WorkflowBuilderActionTypes.GetCaseFieldLink:
      return {
        ...state,
        loading: true
      };
    case WorkflowBuilderActionTypes.GetCaseFieldLinkSuccess:
      return {
        ...state,
        loading: false,
        currentFieldLink: action.payload.fieldLink
      };
    case WorkflowBuilderActionTypes.GetCaseFieldLinkFail:
      return {
        ...state,
        loading: false,
        wfOperationMsg: action.payload.error
      };
    case WorkflowBuilderActionTypes.GetAllCaseFieldLinks:
      return {
        ...state,
        loading: true
      };
    case WorkflowBuilderActionTypes.GetAllCaseFieldLinksSuccess:
      return {
        ...state,
        loading: false,
        caseFieldLinks: action.payload.fieldLinks
      };
    case WorkflowBuilderActionTypes.GetAllCaseFieldLinksFail:
      return {
        ...state,
        loading: false,
        wfOperationMsg: action.payload.error
      };
    case WorkflowBuilderActionTypes.UpdateAllProcessStepLinksPosition:
      return {
        ...state,
        loading: true
      };
    case WorkflowBuilderActionTypes.UpdateAllProcessStepLinksPositionSuccess:
      return {
        ...state,
        loading: false,
        wfOperationMsg: action.payload.msg
      };
    case WorkflowBuilderActionTypes.UpdateAllProcessStepLinksPositionFailure:
      return {
        ...state,
        loading: false,
        wfOperationMsg: action.payload.error
      };

    case WorkflowBuilderActionTypes.CreateRawDataLink:
      return {
        ...state,
        loading: true
      };
    case WorkflowBuilderActionTypes.CreateRawDataLinkSuccess:
      return {
        ...state,
        loading: false,
        currentRawDataLink: action.payload.rawDataLink,
        wfOperationMsg: action.payload.msg
      };
    case WorkflowBuilderActionTypes.CreateRawDataLinkFail:
      return {
        ...state,
        loading: false,
        wfOperationMsg: action.payload.error
      };
    case WorkflowBuilderActionTypes.UpdateRawDataLink:
      return {
        ...state,
        loading: true
      };
    case WorkflowBuilderActionTypes.UpdateRawDataLinkSuccess:
      return {
        ...state,
        loading: false,
        currentRawDataLink: action.payload.rawDataLink,
        wfOperationMsg: action.payload.msg
      };
    case WorkflowBuilderActionTypes.UpdateRawDataLinkFail:
      return {
        ...state,
        loading: false,
        wfOperationMsg: action.payload.error
      };
    case WorkflowBuilderActionTypes.DeleteRawDataLink:
      return {
        ...state,
        loading: true
      };
    case WorkflowBuilderActionTypes.DeleteRawDataLinkSuccess:
      return {
        ...state,
        loading: false,
        currentRawDataLink: null,
        wfOperationMsg: action.payload.msg
      };
    case WorkflowBuilderActionTypes.DeleteRawDataLinkFail:
      return {
        ...state,
        loading: false,
        wfOperationMsg: action.payload.error
      };
    case WorkflowBuilderActionTypes.GetRawDataLink:
      return {
        ...state,
        loading: true
      };
    case WorkflowBuilderActionTypes.GetRawDataLinkSuccess:
      return {
        ...state,
        loading: false,
        currentRawDataLink: action.payload.rawDataLink
      };
    case WorkflowBuilderActionTypes.GetRawDataLinkFail:
      return {
        ...state,
        loading: false,
        wfOperationMsg: action.payload.error
      };
    case WorkflowBuilderActionTypes.GetAllRawDataLinks:
      return {
        ...state,
        loading: true
      };
    case WorkflowBuilderActionTypes.GetAllRawDataLinksSuccess:
      return {
        ...state,
        loading: false,
        rawDataLinks: action.payload.rawDataLinks
      };
    case WorkflowBuilderActionTypes.GetAllRawDataLinksFail:
      return {
        ...state,
        loading: false,
        wfOperationMsg: action.payload.error
      };
    case WorkflowBuilderActionTypes.CreateWorkflowCopy:
      return {
        ...state,
        loading: true
      };
    case WorkflowBuilderActionTypes.CreateWorkflowCopySuccess:
      return {
        ...state,
        loading: false,
        wfOperationMsg: `${action.payload.msg}-${action.payload.workflowId}`
      };
    case WorkflowBuilderActionTypes.CreateWorkflowCopyFailed:
      return {
        ...state,
        loading: false,
        wfOperationMsg: 'Fail' + action.payload.error
      };
    default:
      return state;
  }
}
