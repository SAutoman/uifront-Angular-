import { createSelector } from '@ngrx/store';
import { WorkflowBuilderState } from './workflow-builder.reducer';

export const selectWorkflowBuilder: (p: any) => WorkflowBuilderState = (state) => state.workflowBuilder;
export const workflowTransitionList = createSelector(selectWorkflowBuilder, (wf) => wf.transitions);
export const workflowProcessStepLinkList = createSelector(selectWorkflowBuilder, (wf) => wf.processStepLinks);
export const workflowProcessStepEntityError = createSelector(selectWorkflowBuilder, (wf) => wf.stepUpdateError);
export const workflowProcessStepEntitySuccess = createSelector(selectWorkflowBuilder, (wf) => wf.stepUpdateSuccess);
export const workflowBuilderLoader = createSelector(selectWorkflowBuilder, (wf) => wf.loading);
export const tenantProcessSteps = createSelector(selectWorkflowBuilder, (wf) => wf.tenantProcessSteps);
export const workflowBuilderSuccessResponse = createSelector(selectWorkflowBuilder, (wf) => wf.successResponse);
export const linkUpdateError = createSelector(selectWorkflowBuilder, (wf) => wf.linkUpdateError);
export const defaultStatusErrorSelector = createSelector(selectWorkflowBuilder, (wf) => wf.defaultStatusError);
export const workflowsListPaginatedSelector = createSelector(selectWorkflowBuilder, (wf) => wf.workflowsListPagination);
export const wfBuilderProcessStepLinksLoadingSelector = createSelector(selectWorkflowBuilder, (wf) => wf.processStepLinksLoading);
export const wfBuilderTransitionsLoadingSelector = createSelector(selectWorkflowBuilder, (wf) => wf.wfTransitionsLoading);
export const wfProcessStepsLoaderSelector = createSelector(selectWorkflowBuilder, (wf) => wf.wfProcessStepsLoading);
export const wfProcessStepDataByIdSelector = createSelector(selectWorkflowBuilder, (wf) => wf.currentProcessStepDataById);
export const wfStatusDataByIdSelector = createSelector(selectWorkflowBuilder, (wf) => wf.currentStatusDataById);
export const wfOperationMsgSelector = createSelector(selectWorkflowBuilder, (wf) => wf.wfOperationMsg);
export const wfCaseFieldLinkSelector = createSelector(selectWorkflowBuilder, (wf) => wf.currentFieldLink);
export const wfCaseFieldsLinksSelector = createSelector(selectWorkflowBuilder, (wf) => wf.caseFieldLinks);

export const wfRawDataLinkSelector = createSelector(selectWorkflowBuilder, (wf) => wf.currentRawDataLink);
export const wfAllRawDataLinksSelector = createSelector(selectWorkflowBuilder, (wf) => wf.rawDataLinks);
