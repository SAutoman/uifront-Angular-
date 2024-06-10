import { SourceToDestinationWithPath } from './actionDto';
import { RuleSetCustom } from './expressionModel';
import { FieldTypeIds } from './FieldTypeIds';
import { BaseFieldValueType } from './FieldValueDto';

// ORCHESTRATOR RELATED

export interface OrchestratorEntity {
  id: string;
  name: string;
  orchestratorActions: OrchestratorActionEntity[];
}

export interface CreateOrchestratorEntityDto {
  name: string;
  orchestratorActions: CreateOrchestratorActionEntityDto[];
}

export interface UpdateOrchestratorEntityDto {
  name: string;
  id: string;
}

export interface OrchestratorActionEntity {
  id: string;
  name: string;
  order: number;
  orchestratorActionEventType: OrchestratorActionEventTypesEnum;
  workflowSchemaConnector: WorkflowSchemaConnectorEntity;
  orchestratorActionConfigurationJson: string;
  orchestratorActionConfiguration?: {
    trigger: OrchestratorActionTriggerEventTypes;
    handlers: OrchestratorActionHandlerTypes[];
  };
}

export interface CreateOrchestratorActionEntityDto {
  name: string;
  order: number;
  orchestratorActionEventType: OrchestratorActionEventTypesEnum;
  workflowSchemaConnectorId: string;
  orchestratorActionConfigurationJson: string;
}

export interface UpdateOrchestratorActionEntityDto extends CreateOrchestratorActionEntityDto {
  id: string;
}

export enum OrchestratorActionEventTypesEnum {
  ProcessStepResolution = 1,
  StatusChange,
  CaseUpdate,
  CaseCreate
}

export enum OrchestratorActionHandlerTypesEnum {
  ProcessStepManipulation = 1,
  CaseManipulation = 2
}

// IF options
export type OrchestratorActionTriggerEventTypes = ProcessStepResolutionEvent | StatusTransitionEvent | CaseUpdateEvent | CaseCreateEvent;

export interface ProcessStepResolutionEvent {
  sourceEventType: OrchestratorActionEventTypesEnum;
  sourceStepLinkRef: string;
  sourceResolutions: string[];
}

export interface StatusTransitionEvent {
  sourceEventType: OrchestratorActionEventTypesEnum;
  sourceStatusTransitionId: string;
}
export interface CaseUpdateEvent {
  sourceEventType: OrchestratorActionEventTypesEnum;
  ruleSet: RuleSetCustom;
}

export interface CaseCreateEvent {
  sourceEventType: OrchestratorActionEventTypesEnum;
  ruleSet: RuleSetCustom;
}

// THEN options
export type OrchestratorActionHandlerTypes = ProcessStepManipulationHandler | CaseManipulationHandler;

export interface BaseHandler {
  name: string;
  destinationHandlerType: OrchestratorActionHandlerTypesEnum;
  id?: number;
}

export interface ProcessStepManipulationHandler extends BaseHandler {
  destinationStepLinkRef: string;
  manipulations: {
    createStepIfNotExist?: boolean;
    addOrUpdateFields?: BaseFieldValueType[];
    addOrUpdateDynamicValue?: DynamicValueForConnectorField[];
    resolution?: string;
  };
}

export interface DynamicValueForConnectorField {
  id: string;
  type: FieldTypeIds;
  value: ConnectorSide;
}

export interface CaseManipulationHandler extends BaseHandler {
  side: ConnectorSide;
  manipulations: {
    addOrUpdateFields?: BaseFieldValueType[];
    addOrUpdateDynamicValue?: DynamicValueForConnectorField[];
    status?: string;
    copyFields?: SourceToDestinationWithPath[];
  };
}

export interface WorkflowSchemaConnectorEntity {
  id: string;
  name: string;
  workflowSchemaSourceId: string;
  workflowSchemaDestinationId: string;
  workflowSchemaSource: WorkflowSchemaItem; //Workflow entity
  workflowSchemaDestination: WorkflowSchemaItem; //workflow entity
  createdAt: Date;
}

export interface CreateWorkflowConnectorDto {
  name: string;
  workflowSchemaSourceId: string;
  workflowSchemaDestinationId: string;
}

export interface WorkflowSchemaItem {
  id: string;
  name: string;
  caseSchemaId: string;
  tenantId: string;
  tenantName: string;
  statuses: Array<{ name: string; id: string }>;
}

export interface CrossTenantWorkflowSchemaGroup {
  tenantId: string;
  tenantName: string;
  crossTenantWorkflowSchemas: [
    {
      caseSchemaId: string;
      name: string;
      workflowSchemaId: string;
    }
  ];
}

export enum ConnectorSide {
  Source = 'source',
  Destination = 'destination'
}
