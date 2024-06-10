import { BaseActionType } from './actionDto';
import { ExpressionDef, PropertyPath, RawDataPath } from './expressionModel';
import { WorkflowRightsEnum } from './workflow';

export interface BaseLinkDto {
  workflowId: string;
  tenantId: string;
}

export interface RepeatableSettings {
  /**
   *  'resolveAtOnce: false': not implemented:  backend will create general steps with a single stepDynamicEntity
   */
  resolveAtOnce: boolean;
  isRepeatable: boolean;
  linkedRawDataSettings: LinkedRawDataSettings;
}

export interface LinkedRawDataSettings {
  rawDataSchemaId: string;
  linkedRawDataReference: PropertyPath;
  rawDataFields: RawDataPath[];
}

export interface CreateProcessStepLinkDtoNew extends BaseLinkDto {
  processStepEntityId: string;
  refName: string;
  parentId?: string;
  parentRefName?: string;
  /**
   * the link rules that will be applied if there is no any other more specific override
   */
  defaultOverride?: ProcessStepLinkBaseOverrideDto;
  /**
   * specific overrides (can be for some status or in general)
   */
  overrides?: ConditionedProcessStepLinkOverrideDto[];
  processStepLinkRepeatableSettings?: RepeatableSettings;
  position?: number;
}

export interface UpdateProcessStepLinkDto extends CreateProcessStepLinkDtoNew {
  id: string;
}

export interface ConditionedProcessStepLinkOverrideDto extends ProcessStepLinkBaseOverrideDto {
  name?: string;
  workflowStatusId?: string;
  expression?: ExpressionDef;
}

export interface ProcessStepLinkBaseOverrideDto {
  id?: string;
  numberOfInstances?: number;
  rights?: WorkflowRightsEnum[];
  disallowedRights?: WorkflowRightsEnum[];
  onDeletedEvent?: BaseActionType[];
  onStepAddedEvent?: BaseActionType[];
  onProcessStepResolvedEvents?: BaseActionType[];
  onStepUpdatedEvent?: BaseActionType[];
}

export interface ProcessStepLinkDto extends CreateProcessStepLinkDtoNew {
  id: string;
}

export interface DeleteSchemaFieldLinkCommand {
  id: string;
  tenantId: string;
}

export interface DeleteProcessStepLinkCommand {
  id: string;
  tenantId: string;
}
