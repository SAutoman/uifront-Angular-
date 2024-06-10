/**
 * global
 */
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { KeyValue } from '@angular/common';

/**
 * project
 */

/**
 * local
 */
import { OrchestratorActions, OrchestratorActionTypes } from './orchestrator.actions';
import {
  CrossTenantWorkflowSchemaGroup,
  OrchestratorActionEventTypesEnum,
  OrchestratorEntity,
  WorkflowSchemaConnectorEntity
} from '@wfm/service-layer/models/orchestrator';

export interface OrchestratorState extends EntityState<OrchestratorEntity> {
  allOrchestrators: OrchestratorEntity[];
  selectedOrchestrator: OrchestratorEntity;
  loading: boolean;
  orchestratorOperationMsg: string;
  connectorOperationMsg: string;
  allConnectors: WorkflowSchemaConnectorEntity[];
  getAllWorkflows: CrossTenantWorkflowSchemaGroup[];
  orchestratorActionEventTypes: KeyValue<OrchestratorActionEventTypesEnum, string>[];
}

export const OrchestratorAdapter: EntityAdapter<OrchestratorEntity> = createEntityAdapter<OrchestratorEntity>();

export const initialOrchestratorState: OrchestratorState = OrchestratorAdapter.getInitialState({
  allOrchestrators: [],
  selectedOrchestrator: null,
  loading: false,
  orchestratorOperationMsg: null,
  connectorOperationMsg: null,
  allConnectors: null,
  getAllWorkflows: null,
  orchestratorActionEventTypes: null
});

export function orchestratorReducer(state = initialOrchestratorState, action: OrchestratorActions): OrchestratorState {
  switch (action.type) {
    case OrchestratorActionTypes.GetOrchestrators:
      return {
        ...state,
        allOrchestrators: [],
        loading: true
      };
    case OrchestratorActionTypes.GetOrchestratorsSuccess:
      return {
        ...state,
        allOrchestrators: action.payload.result,
        loading: false
      };
    case OrchestratorActionTypes.GetOrchestratorsFail:
      return {
        ...state,
        allOrchestrators: [],
        loading: false,
        orchestratorOperationMsg: 'Fail' + action.payload.error
      };
    case OrchestratorActionTypes.CreateOrchestrator:
      return {
        ...state,
        loading: true
      };
    case OrchestratorActionTypes.CreateOrchestratorSuccess:
      return {
        ...state,
        loading: false,
        orchestratorOperationMsg: action.msg
      };
    case OrchestratorActionTypes.CreateOrchestratorFail:
      return {
        ...state,
        loading: false,
        orchestratorOperationMsg: 'Fail' + action.error
      };
    case OrchestratorActionTypes.UpdateOrchestrator:
      return {
        ...state,
        loading: true
      };
    case OrchestratorActionTypes.UpdateOrchestratorSuccess:
      return {
        ...state,
        loading: false,
        orchestratorOperationMsg: action.msg
      };
    case OrchestratorActionTypes.UpdateOrchestratorFail:
      return {
        ...state,
        loading: false,
        orchestratorOperationMsg: 'Fail' + action.error
      };
    case OrchestratorActionTypes.DeleteOrchestrator:
      return {
        ...state,
        loading: true
      };
    case OrchestratorActionTypes.DeleteOrchestratorSuccess:
      return {
        ...state,
        loading: false,
        orchestratorOperationMsg: action.msg
      };
    case OrchestratorActionTypes.DeleteOrchestratorFail:
      return {
        ...state,
        loading: false,
        orchestratorOperationMsg: 'Fail' + action.error
      };
    case OrchestratorActionTypes.GetOrchestratorById:
      return {
        ...state,
        loading: true,
        selectedOrchestrator: null
      };
    case OrchestratorActionTypes.GetOrchestratorByIdSuccess:
      return {
        ...state,
        selectedOrchestrator: action.data,
        loading: false
      };
    case OrchestratorActionTypes.GetOrchestratorByIdFail:
      return {
        ...state,
        loading: false
      };
    case OrchestratorActionTypes.ResetSelectedOrchestrator:
      return {
        ...state,
        selectedOrchestrator: null
      };
    case OrchestratorActionTypes.ResetOrchestratorOperationMsg:
      return {
        ...state,
        orchestratorOperationMsg: null
      };
    case OrchestratorActionTypes.GetOrchestratorActionEventTypes:
      return {
        ...state,
        loading: true
      };
    case OrchestratorActionTypes.GetOrchestratorActionEventTypesSuccess:
      return {
        ...state,
        loading: false,
        orchestratorActionEventTypes: action.data
      };
    case OrchestratorActionTypes.GetOrchestratorActionEventTypesFail:
      return {
        ...state,
        loading: false,
        orchestratorOperationMsg: 'Fail' + action.error
      };
    case OrchestratorActionTypes.OrchestratorBulkUpdateActions:
      return {
        ...state,
        loading: true
      };
    case OrchestratorActionTypes.OrchestratorBulkUpdateActionsSuccess:
      return {
        ...state,
        loading: false,
        orchestratorOperationMsg: action.msg
      };
    case OrchestratorActionTypes.OrchestratorBulkUpdateActionsFail:
      return {
        ...state,
        loading: false,
        orchestratorOperationMsg: 'Fail' + action.error
      };
    case OrchestratorActionTypes.AddOrchestratorAction:
      return {
        ...state,
        loading: true
      };
    case OrchestratorActionTypes.AddOrchestratorActionSuccess:
      return {
        ...state,
        loading: false,
        orchestratorOperationMsg: action.msg
      };
    case OrchestratorActionTypes.AddOrchestratorActionFail:
      return {
        ...state,
        loading: false,
        orchestratorOperationMsg: 'Fail' + action.error
      };
    case OrchestratorActionTypes.UpdateOrchestratorAction:
      return {
        ...state,
        loading: true
      };
    case OrchestratorActionTypes.UpdateOrchestratorActionSuccess:
      return {
        ...state,
        loading: false,
        orchestratorOperationMsg: action.msg
      };
    case OrchestratorActionTypes.UpdateOrchestratorActionFail:
      return {
        ...state,
        loading: false,
        orchestratorOperationMsg: 'Fail' + action.error
      };
    case OrchestratorActionTypes.DeleteOrchestratorAction:
      return {
        ...state,
        loading: true
      };
    case OrchestratorActionTypes.DeleteOrchestratorActionSuccess:
      return {
        ...state,
        loading: false,
        orchestratorOperationMsg: action.msg
      };
    case OrchestratorActionTypes.DeleteOrchestratorActionFail:
      return {
        ...state,
        loading: false,
        orchestratorOperationMsg: 'Fail' + action.error
      };
    //Connector
    case OrchestratorActionTypes.GetAllConnectors:
      return {
        ...state,
        loading: true
      };
    case OrchestratorActionTypes.GetAllConnectorsSuccess:
      return {
        ...state,
        loading: false,
        allConnectors: action.data.result
      };
    case OrchestratorActionTypes.GetAllConnectorsFail:
      return {
        ...state,
        loading: false
      };
    case OrchestratorActionTypes.DeleteConnector:
      return {
        ...state,
        loading: true
      };
    case OrchestratorActionTypes.DeleteConnectorSuccess:
      return {
        ...state,
        loading: false,
        connectorOperationMsg: action.msg
      };
    case OrchestratorActionTypes.DeleteConnectorFail:
      return {
        ...state,
        loading: false,
        connectorOperationMsg: 'Fail' + action.error
      };
    case OrchestratorActionTypes.CreateConnector:
      return {
        ...state,
        loading: true
      };
    case OrchestratorActionTypes.CreateConnectorSuccess:
      return {
        ...state,
        loading: false,
        connectorOperationMsg: action.msg
      };
    case OrchestratorActionTypes.CreateConnectorFail:
      return {
        ...state,
        loading: false,
        connectorOperationMsg: 'Fail' + action.error
      };
    case OrchestratorActionTypes.GetAllAccessibleWorkflows:
      return {
        ...state,
        loading: true
      };
    case OrchestratorActionTypes.GetAllAccessibleWorkflowsSuccess:
      return {
        ...state,
        loading: false,
        getAllWorkflows: action.data.result
      };
    case OrchestratorActionTypes.GetAllAccessibleWorkflowsFail:
      return {
        ...state,
        loading: false,
        connectorOperationMsg: 'Fail' + action.error
      };
    case OrchestratorActionTypes.ResetConnectorOperationMsg:
      return {
        ...state,
        connectorOperationMsg: null
      };
    default:
      return state;
  }
}
