import { createSelector } from '@ngrx/store';
import { WorkflowState } from './workflow.reducer';
import { EventTypes } from '@wfm/service-layer/models/actionDto';
import { PostActionData } from '@wfm/service-layer/services/postaction.service';

export const selectWorkflow: (p: any) => WorkflowState = (state) => state.workflow;

export const workflowStateSelector = createSelector(selectWorkflow, (wf) => wf.workflowState);
export const workflowSelector = createSelector(selectWorkflow, (wf) => wf.workflow);
export const workflowStateCasesListSelector = createSelector(selectWorkflow, (wf) => wf.workflowStateCasesList);
export const wfStateStepErrorSelector = createSelector(selectWorkflow, (wf) => wf.currentStepError);
export const wfStateErrorSelector = createSelector(selectWorkflow, (wf) => wf.error);
export const workflowStateUnsavedDataSelector = createSelector(selectWorkflow, (wf) => wf.caseStepsUpdated);
export const workflowStatusesSelector = createSelector(selectWorkflow, (wf) => wf.statuses);
export const selectedKanbanSelector = createSelector(selectWorkflow, (wf) => wf.selectedKanban);
export const workflowStateLoading = createSelector(selectWorkflow, (wf) => wf.loading);
export const workflowStepUpdateLoading = createSelector(selectWorkflow, (wf) => wf.stepsUpdateLoading);
export const workflowStatesListLoadingSelector = createSelector(selectWorkflow, (wf) => wf.listLoading);
export const refreshWorkflowStatesSelector = createSelector(selectWorkflow, (wf) => wf.refreshWorkflowStatesList);
export const workflowsListSelector = createSelector(selectWorkflow, (wf) => wf.workflowsList);
export const visualSettingsUpdateError = createSelector(selectWorkflow, (wf) => wf.stepVisualSettingsError);
export const workflowStateLoadErrorSelector = createSelector(selectWorkflow, (wf) => wf.workflowStateLoadError);
export const workflowLoadErrorSelector = createSelector(selectWorkflow, (wf) => wf.workflowLoadError);
export const activatedCaseFieldRulesSelector = createSelector(selectWorkflow, (wf) => wf.activatedFieldLinkRules);

export const allVisualPlanConfigsSelector = createSelector(selectWorkflow, (wf) => wf.visualPlanConfigList);
export const visualPlanMappedUnitsSelector = createSelector(selectWorkflow, (wf) => wf.visualPlanMappedUnits);
export const visualPlanErrorSelector = createSelector(selectWorkflow, (wf) => wf.visualPlanError);
export const visualPlanOperationSuccessSelector = createSelector(selectWorkflow, (wf) => wf.visualPlanUpdateSuccess);
export const visualPlanDeleteSuccessSelector = createSelector(selectWorkflow, (wf) => wf.visualPlanDeleteSuccess);
export const visualPlanConfigsLoadingSelector = createSelector(selectWorkflow, (wf) => wf.visualPlanLoading);

export const statusUpdateMsgSelector = createSelector(selectWorkflow, (wf) => wf.statusUpdateMsg);
export const selectedReportSelector = createSelector(selectWorkflow, (wf) => wf.selectedReport);
export const selectedWorkflowSelector = createSelector(selectWorkflow, (wf) => wf.selectedWorkflow);

export const browserActionsSelector = createSelector(selectWorkflow, (wf) => {
  const postactions: PostActionData[] = wf.runPostactions;
  if (postactions?.length) {
    return postactions.filter((action) => action.actionType === EventTypes.BrowserAction);
  }
  return null;
});
