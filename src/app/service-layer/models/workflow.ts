import { EnumConverter, IKeyValueView, KeyValueView } from '@wfm/common/models';
import { BaseActionType } from './actionDto';
import { Expression } from './expressionModel';
import { ProcessStepLinkDto } from './LinkDto';
import { SchemaDto } from './schema';
import { WorkflowStatusDto } from './workflowStatus';
import { WorkflowStepDto } from './workflowStepDto';

export enum WorkflowStepType {
  UI = 0
}

export enum WorkflowStepState {
  Running = 0,
  Completed = 1
}

export interface GetWorkflowByRawDataQuery {
  schemaId?: string;
  rawDataIds?: string[];
  tenantId: string;
}

export interface RawDataRemoveFromCaseCheckDto {
  rawDataIds: string[];
  rawDataSchemaId: string;
  caseId: string;
  workflowSchemaId: string;
}

export interface TransitionDto {
  id: string;
  name: string;
  fromId: string;
  toId: string;
  expressions: Expression[];
}

export interface WorkflowDto {
  id: string;
  name: string;
  tenantId: string;
  steps?: WorkflowStepDto[];
  statuses?: WorkflowStatusDto[];
  caseSchemaId?: string;
  processStepLinks: ProcessStepLinkDto[];
  onCreateEvents?: BaseActionType[];
  onDeleteEvents?: BaseActionType[];
  onUpdateCase?: BaseActionType[];
  statusEvents?: BaseActionType[];
  onStepAddedEvents?: BaseActionType[];
  onAutoIncrementEvents?: BaseActionType[];
  defaultStatusId?: string;
}

export interface WorkflowDtoUi extends WorkflowDto {
  caseSchema?: SchemaDto;
}

export interface WorkflowSimplifiedDto {
  id: string;
  name: string;
  caseSchemaId: string;
  caseSchema?: SchemaDto;
  disableMultiCreate?: boolean;
}

export interface IncompleteWorkflowDto {
  workflowSchema: WorkflowDto;
}

export interface CreateWorkflowCommand {
  name: string;
  tenantId: string;
  caseSchemaId: string;
  // status ids
  statuses: string[];
  onCreateEvents?: BaseActionType[];
  onDeleteEvents?: BaseActionType[];
  onUpdateCase?: BaseActionType[];
  statusEvents?: BaseActionType[];
  onStepAddedEvents?: BaseActionType[];
  onAutoIncrementEvents?: BaseActionType[];
}

export interface UpdateWorkflowCommand extends CreateWorkflowCommand {
  id: string;
}

export interface DeleteWorkflowCommand {
  id: string;
  tenantId: string;
}

export interface DefaultStatusCommand {
  workflowId: string;
  statusId: string;
  tenantId: string;
}

export interface StepFieldsRights {
  canDelete: boolean;
  canEdit: boolean;
  canResolve: boolean;
  canUnresolve: boolean;
  canHighlightFields: boolean;
  canView: boolean;
}

export enum WorkflowRightsEnum {
  Unknown = 0,
  CanAdd = 1,
  CanEdit = 2,
  CanDelete = 3,
  CanResolve = 4,
  CanUnresolve = 5,
  CanHighlightFields = 6,
  CanView = 7
}

export interface WorkflowStatusUsage {
  name: string;
  id: string;
}

export const WorkflowRightsNameMap: {
  get: (type: WorkflowRightsEnum) => IKeyValueView<string, WorkflowRightsEnum>;
  has: (type: WorkflowRightsEnum) => boolean;
} = (() => {
  const map = new Map<WorkflowRightsEnum, IKeyValueView<string, WorkflowRightsEnum>>();
  const converter = new EnumConverter(WorkflowRightsEnum);

  const setItem = (type: WorkflowRightsEnum, viewValue: string) => {
    const kv = converter.getKeyValue(type);
    map.set(kv.value, new KeyValueView(kv.key, kv.value, viewValue));
  };
  setItem(WorkflowRightsEnum.Unknown, 'Unknown');
  setItem(WorkflowRightsEnum.CanAdd, 'To Add');
  setItem(WorkflowRightsEnum.CanEdit, 'To Edit');
  setItem(WorkflowRightsEnum.CanDelete, 'To Delete');
  setItem(WorkflowRightsEnum.CanResolve, 'To Resolve');
  setItem(WorkflowRightsEnum.CanUnresolve, 'To Reopen');
  setItem(WorkflowRightsEnum.CanHighlightFields, 'To Highlight Step Fields');
  setItem(WorkflowRightsEnum.CanView, 'To View');

  const has = (type: WorkflowRightsEnum) => {
    const kv = converter.getKeyValue(type);
    if (!kv) {
      return false;
    }
    return map.has(kv.value);
  };
  const getKv = (type: WorkflowRightsEnum) => {
    if (!has(type)) {
      return { ...map.get(WorkflowRightsEnum.Unknown) };
    }
    const kv = converter.getKeyValue(type);
    return { ...map.get(kv.value) };
  };

  return {
    get: getKv,
    has
  };
})();
export const allRights = [
  WorkflowRightsEnum.CanAdd,
  WorkflowRightsEnum.CanEdit,
  WorkflowRightsEnum.CanDelete,
  WorkflowRightsEnum.CanResolve,
  WorkflowRightsEnum.CanUnresolve,
  WorkflowRightsEnum.CanHighlightFields,
  WorkflowRightsEnum.CanView
];

export interface ProcessStepLinkPositionsDto {
  refName: string;
  id: string;
  position: number;
}

export interface CopyWorkflow {
  workFlowSchemaId: string;
  name: string;
  caseSchemaId: string;
}

export interface RawDataReferencedWorkflows {
  workflowSchemaId: string;
  caseIds: string[];
  workflowSchemaName: string;
}
