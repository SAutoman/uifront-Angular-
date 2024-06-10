/**
 * global
 */
import { KeyValue } from '@angular/common';
import { Action } from '@ngrx/store';

/**
 * project
 */

import {
  CreateOrchestratorActionEntityDto,
  CreateOrchestratorEntityDto,
  CreateWorkflowConnectorDto,
  CrossTenantWorkflowSchemaGroup,
  OrchestratorActionEventTypesEnum,
  OrchestratorEntity,
  UpdateOrchestratorActionEntityDto,
  UpdateOrchestratorEntityDto,
  WorkflowSchemaConnectorEntity
} from '@wfm/service-layer/models/orchestrator';

/**
 * local
 */

export enum OrchestratorActionTypes {
  GetOrchestrators = '[Orchestrator] Get List',
  GetOrchestratorsSuccess = '[Orchestrator] Get List Success',
  GetOrchestratorsFail = '[Orchestrator] Get List Fail',

  CreateOrchestrator = '[Orchestrator] Create Orchestrator',
  CreateOrchestratorSuccess = '[Orchestrator] Create Orchestrator Success',
  CreateOrchestratorFail = '[Orchestrator] Create Orchestrator Fail',

  UpdateOrchestrator = '[Orchestrator] Update Orchestrator',
  UpdateOrchestratorSuccess = '[Orchestrator] Update Orchestrator Success',
  UpdateOrchestratorFail = '[Orchestrator] Update Orchestrator Fail',

  DeleteOrchestrator = '[Orchestrator] Delete Orchestrator',
  DeleteOrchestratorSuccess = '[Orchestrator] Delete Orchestrator Success',
  DeleteOrchestratorFail = '[Orchestrator] Delete Orchestrator Fail',

  GetOrchestratorById = '[Orchestrator] Get Orchestrator By Id',
  GetOrchestratorByIdSuccess = '[Orchestrator] Get Orchestrator By Id Success',
  GetOrchestratorByIdFail = '[Orchestrator] Get Orchestrator By Id Fail',

  ResetSelectedOrchestrator = '[Orchestrator] Reset Selected Orchestrator',
  ResetOrchestratorOperationMsg = '[Orchestrator] Reset Orchestrator Operation Msg',

  GetOrchestratorActionEventTypes = '[Orchestrator] Get All Action Event Types',
  GetOrchestratorActionEventTypesSuccess = '[Orchestrator] Get All Action Event Types Success',
  GetOrchestratorActionEventTypesFail = '[Orchestrator] Get All Action Event Types Fail',

  OrchestratorBulkUpdateActions = '[Orchestrator] Bulk Update Actions',
  OrchestratorBulkUpdateActionsSuccess = '[Orchestrator] Bulk Update Actions Success',
  OrchestratorBulkUpdateActionsFail = '[Orchestrator] Bulk Update Actions Fail',

  AddOrchestratorAction = '[Orchestrator] Add Action',
  AddOrchestratorActionSuccess = '[Orchestrator] Add Action Success',
  AddOrchestratorActionFail = '[Orchestrator] Add Action Fail',

  UpdateOrchestratorAction = '[Orchestrator] Update Action',
  UpdateOrchestratorActionSuccess = '[Orchestrator] Update Action Success',
  UpdateOrchestratorActionFail = '[Orchestrator] Update Action Fail',

  DeleteOrchestratorAction = '[Orchestrator] Delete Action',
  DeleteOrchestratorActionSuccess = '[Orchestrator] Delete Action Success',
  DeleteOrchestratorActionFail = '[Orchestrator] Delete Action Fail',

  // Connectors
  GetAllConnectors = '[Connector] Get All Connectors',
  GetAllConnectorsSuccess = '[Connector] Get All Connectors Success',
  GetAllConnectorsFail = '[Connector] Get All Connectors Fail',

  DeleteConnector = '[Connector] Delete Connector',
  DeleteConnectorSuccess = '[Connector] Delete Connector Success',
  DeleteConnectorFail = '[Connector] Delete Connector Fail',

  ResetConnectorOperationMsg = '[Connector] Reset Connector Operation Msg',

  CreateConnector = '[Connector] Create Connector',
  CreateConnectorSuccess = '[Connector] Create Connector Success',
  CreateConnectorFail = '[Connector] Create Connector Fail',

  UpdateConnector = '[Connector] Update Connector',
  UpdateConnectorSuccess = '[Connector] Update Connector Success',
  UpdateConnectorFail = '[Connector] Update Connector Fail',

  GetAllAccessibleWorkflows = '[Connector] Get All Workflows',
  GetAllAccessibleWorkflowsSuccess = '[Connector] Get All Workflows Success',
  GetAllAccessibleWorkflowsFail = '[Connector] Get All Workflows Fail'
}

// ========================================= GET LIST
export class GetOrchestrators implements Action {
  readonly type = OrchestratorActionTypes.GetOrchestrators;
  constructor() {}
}

export class GetOrchestratorsSuccess implements Action {
  readonly type = OrchestratorActionTypes.GetOrchestratorsSuccess;
  constructor(public payload: { result: OrchestratorEntity[] }) {}
}

export class GetOrchestratorsFail implements Action {
  readonly type = OrchestratorActionTypes.GetOrchestratorsFail;
  constructor(public payload: { error: string }) {}
}

export class CreateOrchestrator implements Action {
  readonly type = OrchestratorActionTypes.CreateOrchestrator;
  constructor(public payload: { data: CreateOrchestratorEntityDto }) {}
}

export class CreateOrchestratorSuccess implements Action {
  readonly type = OrchestratorActionTypes.CreateOrchestratorSuccess;
  constructor(public msg: string) {}
}

export class CreateOrchestratorFail implements Action {
  readonly type = OrchestratorActionTypes.CreateOrchestratorFail;
  constructor(public error: string) {}
}

export class UpdateOrchestrator implements Action {
  readonly type = OrchestratorActionTypes.UpdateOrchestrator;
  constructor(public payload: { data: UpdateOrchestratorEntityDto }) {}
}

export class UpdateOrchestratorSuccess implements Action {
  readonly type = OrchestratorActionTypes.UpdateOrchestratorSuccess;
  constructor(public msg: string) {}
}

export class UpdateOrchestratorFail implements Action {
  readonly type = OrchestratorActionTypes.UpdateOrchestratorFail;
  constructor(public error: string) {}
}

export class DeleteOrchestrator implements Action {
  readonly type = OrchestratorActionTypes.DeleteOrchestrator;
  constructor(public payload: { id: string }) {}
}

export class DeleteOrchestratorSuccess implements Action {
  readonly type = OrchestratorActionTypes.DeleteOrchestratorSuccess;
  constructor(public msg: string) {}
}

export class DeleteOrchestratorFail implements Action {
  readonly type = OrchestratorActionTypes.DeleteOrchestratorFail;
  constructor(public error: string) {}
}

export class GetOrchestratorById implements Action {
  readonly type = OrchestratorActionTypes.GetOrchestratorById;
  constructor(public payload: { id: string }) {}
}

export class GetOrchestratorByIdSuccess implements Action {
  readonly type = OrchestratorActionTypes.GetOrchestratorByIdSuccess;
  constructor(public data: OrchestratorEntity) {}
}

export class GetOrchestratorByIdFail implements Action {
  readonly type = OrchestratorActionTypes.GetOrchestratorByIdFail;
  constructor(public error: string) {}
}

export class ResetSelectedOrchestrator implements Action {
  readonly type = OrchestratorActionTypes.ResetSelectedOrchestrator;
  constructor() {}
}

export class ResetOrchestratorOperationMsg implements Action {
  readonly type = OrchestratorActionTypes.ResetOrchestratorOperationMsg;
  constructor() {}
}

export class GetOrchestratorActionEventTypes implements Action {
  readonly type = OrchestratorActionTypes.GetOrchestratorActionEventTypes;
  constructor() {}
}

export class GetOrchestratorActionEventTypesSuccess implements Action {
  readonly type = OrchestratorActionTypes.GetOrchestratorActionEventTypesSuccess;
  constructor(public data: KeyValue<OrchestratorActionEventTypesEnum, string>[]) {}
}

export class GetOrchestratorActionEventTypesFailure implements Action {
  readonly type = OrchestratorActionTypes.GetOrchestratorActionEventTypesFail;
  constructor(public error: string) {}
}

export class OrchestratorBulkUpdateActions implements Action {
  readonly type = OrchestratorActionTypes.OrchestratorBulkUpdateActions;
  constructor(public payload: { orchestratorId: string; data: UpdateOrchestratorActionEntityDto[] }) {}
}

export class OrchestratorBulkUpdateActionsSuccess implements Action {
  readonly type = OrchestratorActionTypes.OrchestratorBulkUpdateActionsSuccess;
  constructor(public msg: string) {}
}

export class OrchestratorBulkUpdateActionsFail implements Action {
  readonly type = OrchestratorActionTypes.OrchestratorBulkUpdateActionsFail;
  constructor(public error: string) {}
}

export class AddOrchestratorAction implements Action {
  readonly type = OrchestratorActionTypes.AddOrchestratorAction;
  constructor(public payload: { orchestratorId: string; data: CreateOrchestratorActionEntityDto }) {}
}

export class AddOrchestratorActionSuccess implements Action {
  readonly type = OrchestratorActionTypes.AddOrchestratorActionSuccess;
  constructor(public msg: string) {}
}

export class AddOrchestratorActionFail implements Action {
  readonly type = OrchestratorActionTypes.AddOrchestratorActionFail;
  constructor(public error: string) {}
}

export class UpdateOrchestratorAction implements Action {
  readonly type = OrchestratorActionTypes.UpdateOrchestratorAction;
  constructor(public payload: { data: UpdateOrchestratorActionEntityDto }) {}
}

export class UpdateOrchestratorActionSuccess implements Action {
  readonly type = OrchestratorActionTypes.UpdateOrchestratorActionSuccess;
  constructor(public msg: string) {}
}

export class UpdateOrchestratorActionFail implements Action {
  readonly type = OrchestratorActionTypes.UpdateOrchestratorActionFail;
  constructor(public error: string) {}
}

export class DeleteOrchestratorAction implements Action {
  readonly type = OrchestratorActionTypes.DeleteOrchestratorAction;
  constructor(public payload: { actionId: string }) {}
}

export class DeleteOrchestratorActionSuccess implements Action {
  readonly type = OrchestratorActionTypes.DeleteOrchestratorActionSuccess;
  constructor(public msg: string) {}
}

export class DeleteOrchestratorActionFail implements Action {
  readonly type = OrchestratorActionTypes.DeleteOrchestratorActionFail;
  constructor(public error: string) {}
}

// Connectors

export class GetAllConnectors implements Action {
  readonly type = OrchestratorActionTypes.GetAllConnectors;
  constructor() {}
}

export class GetAllConnectorsSuccess implements Action {
  readonly type = OrchestratorActionTypes.GetAllConnectorsSuccess;
  constructor(public data: { result: WorkflowSchemaConnectorEntity[] }) {}
}

export class GetAllConnectorsFail implements Action {
  readonly type = OrchestratorActionTypes.GetAllConnectorsFail;
  constructor(public error: string) {}
}

export class DeleteConnector implements Action {
  readonly type = OrchestratorActionTypes.DeleteConnector;
  constructor(public payload: { id: string }) {}
}

export class DeleteConnectorSuccess implements Action {
  readonly type = OrchestratorActionTypes.DeleteConnectorSuccess;
  constructor(public msg: string) {}
}

export class DeleteConnectorFail implements Action {
  readonly type = OrchestratorActionTypes.DeleteConnectorFail;
  constructor(public error: string) {}
}

export class ResetConnectorOperationMsg implements Action {
  readonly type = OrchestratorActionTypes.ResetConnectorOperationMsg;
  constructor() {}
}

export class CreateConnector implements Action {
  readonly type = OrchestratorActionTypes.CreateConnector;
  constructor(public payload: { data: CreateWorkflowConnectorDto }) {}
}

export class CreateConnectorSuccess implements Action {
  readonly type = OrchestratorActionTypes.CreateConnectorSuccess;
  constructor(public msg: string) {}
}

export class CreateConnectorFail implements Action {
  readonly type = OrchestratorActionTypes.CreateConnectorFail;
  constructor(public error: string) {}
}

export class GetAllAccessibleWorkflows implements Action {
  readonly type = OrchestratorActionTypes.GetAllAccessibleWorkflows;
  constructor() {}
}

export class GetAllAccessibleWorkflowsSuccess implements Action {
  readonly type = OrchestratorActionTypes.GetAllAccessibleWorkflowsSuccess;
  constructor(public data: { result: CrossTenantWorkflowSchemaGroup[] }) {}
}

export class GetAllAccessibleWorkflowsFail implements Action {
  readonly type = OrchestratorActionTypes.GetAllAccessibleWorkflowsFail;
  constructor(public error: string) {}
}

export type OrchestratorActions =
  | GetOrchestrators
  | GetOrchestratorsSuccess
  | GetOrchestratorsFail
  | CreateOrchestrator
  | CreateOrchestratorSuccess
  | CreateOrchestratorFail
  | UpdateOrchestrator
  | UpdateOrchestratorSuccess
  | UpdateOrchestratorFail
  | DeleteOrchestrator
  | DeleteOrchestratorSuccess
  | DeleteOrchestratorFail
  | GetOrchestratorById
  | GetOrchestratorByIdSuccess
  | GetOrchestratorByIdFail
  | ResetSelectedOrchestrator
  | ResetOrchestratorOperationMsg
  | GetOrchestratorActionEventTypes
  | GetOrchestratorActionEventTypesSuccess
  | GetOrchestratorActionEventTypesFailure
  | OrchestratorBulkUpdateActions
  | OrchestratorBulkUpdateActionsSuccess
  | OrchestratorBulkUpdateActionsFail
  | AddOrchestratorAction
  | AddOrchestratorActionSuccess
  | AddOrchestratorActionFail
  | UpdateOrchestratorAction
  | UpdateOrchestratorActionSuccess
  | UpdateOrchestratorActionFail
  | DeleteOrchestratorAction
  | DeleteOrchestratorActionSuccess
  | DeleteOrchestratorActionFail
  // Connectors
  | GetAllConnectors
  | GetAllConnectorsSuccess
  | GetAllConnectorsFail
  | DeleteConnector
  | DeleteConnectorSuccess
  | DeleteConnectorFail
  | CreateConnector
  | CreateConnectorSuccess
  | CreateConnectorFail
  | GetAllAccessibleWorkflows
  | GetAllAccessibleWorkflowsSuccess
  | GetAllAccessibleWorkflowsFail
  | ResetConnectorOperationMsg;
