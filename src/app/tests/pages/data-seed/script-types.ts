import {
  AreaTypeEnum,
  CaseStatus,
  FieldTypeIds,
  WorkflowResolutionDto,
  ConditionedProcessStepLinkOverrideDto,
  ProcessStepLinkBaseOverrideDto,
  SchemaTitleSettingModel,
  RepeatableSettings
} from '@wfm/service-layer';
import { Expression, ExpressionDef } from '@wfm/service-layer/models/expressionModel';
import { IBaseFieldConfiguration, Roles, StatusConfiguration, WorkflowRightsEnum } from '@wfm/service-layer/models';
import { BaseActionType } from '@wfm/service-layer/models/actionDto';
import { TopicKindEnum, TopicSendTypeEnum } from '@wfm/service-layer/services/notification-topic.service';

export interface ScriptField {
  fieldName: string;
  displayName: string;
  areaType: AreaTypeEnum[];
  type: FieldTypeIds;
  configuration?: IBaseFieldConfiguration;
}

export interface ScriptProcessStepLinkExpression {
  status: string;
  numberOfInstances?: number;
  expressions: ExpressionDef;
  actions?: BaseActionType[];
  disallowedRights?: WorkflowRightsEnum[];
  rights?: WorkflowRightsEnum[];
  parentStepName?: string;
  parentId?: string;
}

export interface ScriptSchemaField {
  name: string;
  configuration?: IBaseFieldConfiguration;
}

export interface ScriptSchema {
  name: string;
  areaType: AreaTypeEnum;
  functions: ExpressionConfig[];
  status: CaseStatus;
  fields?: ScriptSchemaField[];
  rawDataSchemaName?: string;
  commentSchemaName?: string;
}

export interface ScriptWorkflowStatus extends WorkflowResolutionDto {
  position: number;
  actions?: BaseActionType[];
  configuration?: StatusConfiguration;
}

export interface ScriptWorkflowTransition {
  name: string;
  fromStatus: string;
  toStatus: string;
  actions?: BaseActionType[];
  expression?: ExpressionDef;
}

export interface ScriptWorkflow {
  name: string;
  caseName: string;
  statuses: ScriptWorkflowStatus[];
  transitions: ScriptWorkflowTransition[];
  onCreateEvents: BaseActionType[];
  onDeleteEvents: BaseActionType[];
  onUpdateCase: BaseActionType[];
  onStepAddedEvents: BaseActionType[];
  statusEvents: BaseActionType[];
}

export interface StepConfig {
  name: string;
  refName: string;
  schema: string;
  resolution: WorkflowResolutionDto[];
  link?: {
    parentId?: string;
    parentStepName?: string;
    overrides: ConditionedProcessStepLinkOverrideDtoConfig[];
    defaultOverride?: ProcessStepLinkOverrideDtoConfig;
    processStepLinkRepeatableSettings?: RepeatableSettings;
  };
}

export interface ScriptCreateListDto {
  title: string;
  key: string;
  parentListName: string;
  listItems: string[];
}

export interface ScriptNotificationTemplate {
  name: string;
  template: string;
  logoId: string;
}

export interface ScriptNotificationTopic {
  topicName: string;
  subject: string;
  description: string;
  topicKind: TopicKindEnum;
  topicSendType: TopicSendTypeEnum;
  template: ScriptNotificationTemplate;
  days: number;
  roles?: Roles[];
  userGroups?: string[];
}

export interface ExpressionConfig extends Expression {
  forMappingLists?: boolean;
}

export interface ConditionedProcessStepLinkOverrideDtoConfig extends ConditionedProcessStepLinkOverrideDto {
  status?: string;
  actions?: BaseActionType[];
}

export interface ProcessStepLinkOverrideDtoConfig extends ProcessStepLinkBaseOverrideDto {
  actions?: BaseActionType[];
}

export interface ConfigTitleSettings {
  area: AreaTypeEnum;
  schemaName: string;
  schemaTitles: SchemaTitleSettingModel[];
}
