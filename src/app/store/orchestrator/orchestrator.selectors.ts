import { createSelector } from '@ngrx/store';
import { OrchestratorState } from './orchestrator.reducer';

export const selectOrchestratorState: (u: any) => OrchestratorState = (state) => state.orchestrator;

export const selectOrchestrators = createSelector(selectOrchestratorState, (data) => data.allOrchestrators);

export const selectCurrentOrchestrator = createSelector(selectOrchestratorState, (data) => data.selectedOrchestrator);

export const selectOrchestratorOperationMsg = createSelector(selectOrchestratorState, (data) => data.orchestratorOperationMsg);

export const selectOrchestratorActionEventTypes = createSelector(selectOrchestratorState, (data) => data.orchestratorActionEventTypes);

export const selectConnectorOperationMsg = createSelector(selectOrchestratorState, (data) => data.connectorOperationMsg);

export const selectConnectors = createSelector(selectOrchestratorState, (data) => data.allConnectors);

export const selectAllWorkflows = createSelector(selectOrchestratorState, (data) => data.getAllWorkflows);
