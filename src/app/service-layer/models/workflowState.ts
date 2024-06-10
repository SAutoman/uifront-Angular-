/**
 * local
 */
import { StepStatusData } from '@wfm/workflow-state/workflow-state.component';
import { WorkflowResolutionDto, UpdateDynamicEntityDto } from '.';
import { CreateDynamicEntityDto, DynamicEntityDto } from './dynamic-entity';
import { ActionSettings, PropertyPath } from './expressionModel';
import { BaseFieldValueType } from './FieldValueDto';
import { Roles } from './user-profile';
import { StepFieldsRights } from './workflow';
import { WorkflowStatusDto } from './workflowStatus';

export interface CreateWorkflowStateCommand {
  tenantId: string;
  case?: CreateDynamicEntityDto;
  schemaId: string;
  numberOfItems?: number;
}

export interface GetWorkflowStateQuery {
  id: string;
  tenant: string;
  schemaId: string;
}

export interface BulkGetWorkflowStateQuery {
  ids: string[];
  tenantId: string;
  schemaId: string;
}

export interface DeleteWorkflowStateCommand extends GetWorkflowStateQuery {}

export interface BulkDeleteWorkflowStatesCommand {
  tenant: string;
  schemaId: string;
  workflowStateIds: string[];
}

export interface WorkflowStateDto {
  /**
   * wfState.id is equal to wfState.case.id
   */
  id: string;
  workflowId: string;
  fields: WorkflowStateField[];
  currentStatus: WorkflowStatusDto;
  statuses: WorkflowStatusDto[];
  steps: WorkflowStateStepDto[];
  visualElements: VisualElement[];
  case: WorkflowStateCaseDto;
}

// new -> for ordering functionality
export interface VisualElement {
  id: string;
  index: number;
}

/**
 * for UI rendering
 */

export interface WorkflowStateUI extends WorkflowStateDto {
  caseSteps: CaseStepEntityUi[];
  numberOfCaseSteps: number;
}

export interface WorkflowStateCaseDto {
  id: string;
  fields: WorkflowStateCaseFieldDto[];
}

export interface WorkflowStateCaseFieldDto {
  id: string;
  type: number;
  value: any;
}

export interface WorkflowStateStepDto {
  id: string;
  name: string;
  refName: string;
  schemaId: string;
  canAdd: boolean;
  resolutions: WorkflowResolutionDto[];
  actionSettings?: ActionSettings;
  numberOfInstances?: number;
  isRepeatable: boolean;
  position?: number;
}

export interface StepDynamicEntityData {
  dynamicEntityId: string;
  // rawData item for which informationis being collected in step fields
  rawDataItemId?: string;
  rawDataItem?: DynamicEntityDto;
  //to be moved to a separate endpoint later
  hasSavedValues?: boolean;
  title?: string;
}

export interface CaseStepEntity {
  visualElementId: string;
  resolution: string;
  isGroup?: boolean;
  stepDynamicEntities: StepDynamicEntityData[];
  rawDataSchemaId: string;
  linkedRawDataFields?: PropertyPath[];
  activeRule: string[];
  rights?: StepFieldsRights;
  hasSavedValues?: boolean;
  title?: string;
}

export interface CaseStepEntityUi extends CaseStepEntity {
  // added in frontend
  position?: number;
  schemaId: string;
  refName: string;
  deFields?: BaseFieldValueType[];
  name: string;
  statusData?: StepStatusData;
  stepEntityHasResolutions?: boolean;
}

export interface WorkflowStateField {
  refName: string;
  schemaId: string;
  resolution: string;
  entities?: CaseStepEntity[];
}

export interface UpdateStatusCommand {
  tenantId: string;
  schemaId: string;
  userGroups?: string[];
  role?: Roles;
  workflowStateId: string;
  statusId: string;
}

export interface UpdateStateCase {
  workflowStateId: string;
  tenantId: string;
  schemaId: string; // this is the workflowId
  caseDynamicEntity: CreateDynamicEntityDto;
}

export interface StepDynamicEntityPayload {
  dynamicEntity: UpdateDynamicEntityDto;
  // rawData item for which informationis being collected in step fields
  rawDataItemId?: string;
}

export interface UpdateStepCommand {
  role?: Roles;
  tenantId: string;
  stepSchemaId: string;
  schemaId: string;
  workflowStateId: string;
  visualElementId?: string;
  visualElements?: VisualElement[];
  refName: string;
  isGroup?: boolean;
  stepDynamicEntities?: StepDynamicEntityPayload[];
  resolution: string;
}

export interface UpdateCaseStepsUi {
  tenantId: string;
  schemaId: string;
  stateId: string;
  visualElements: VisualElement[];
}

export interface DeleteStepCommand {
  tenantId: string;
  workflowStateId: string;
  schemaId: string;
  refName: string;
  visualElementId?: string;
  visualElements?: VisualElement[];
}

export enum CaseStepStatusEnum {
  open = 'open',
  inProgress = 'inProgress',
  done = 'done'
}
