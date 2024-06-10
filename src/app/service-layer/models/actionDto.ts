import { EnumConverter, IKeyValueView, KeyValueView } from '@wfm/common/models';
import { PropertyPathExtended } from '@wfm/shared/actions/field-path-generator/FieldPathModels';
import { ExpressionDef, ProcessStepPath, PropertyPath, RawDataPath } from './expressionModel';
import { BaseFieldValueType } from './FieldValueDto';
import { EmailSubjectTypeEnum } from '@wfm/shared/actions/send-email-action/send-email-action.component';
import { AggregationActionDto } from '@wfm/tenant-admin/workflows/rawData-link/aggregation-validation/aggregation.model';

export enum EventTypes {
  Unknown = 0,
  OnRawDataAddedToCase = 1,
  AutomaticAddSteps = 2,
  RawDataToCase = 3,
  StepToCase = 4,
  StepToRawData = 5,
  UpdateCaseStatusBasedOnStepResolution = 6,
  DifferenceCalculation = 7,
  UpdateStatusBasedOnStepAdded = 8,
  MathExpressionCalculation = 9,
  WebHook = 10,
  CaseToStep = 11,
  SendEmail = 12,
  AutoIncrement = 13,
  AggregatedRawDataToCase = 14,
  RawDataToStep = 15,
  BrowserAction = 16,
  AutomaticRemoveSteps = 17
}

/**
 * in which entity (entity.property) the action is used
 */
export enum EventAreaScopes {
  Unknown = 0,
  WorkflowScope = 1,
  ProcessStepLinkScope = 2
}

export enum WorkflowEventSubAreas {
  Unknown = 0,
  WorkflowStatusEventsScope = 1,
  WorkflowStepAddedEventsScope = 2,
  WorkflowOnCreateEventsScope = 3,
  WorkflowOnDeleteEventsScope = 4,
  WorkflowOnUpdateEventsScope = 5,
  WorkflowOnAutoIncrementField = 6
}

export enum ProcessStepLinksEventSubArea {
  Unknown = 0,
  OnStepDeleted,
  OnStepAdded,
  OnStepResolved,
  OnStepUpdated
}

/**
 * when the processStep event is to be fired (save/resolve)
 */
export enum ProcessStepEventExecutionType {
  Unknown = 0,
  Always,
  OnResolutionOnly
}

export interface WorkflowActionEventDto {
  id: string;
  name: string;
  eventType: EventTypes;
  expression?: ExpressionDef;
  index?: number;
}

export enum BrowserActionTypeEnum {
  Unknown = 0,
  Print,
  Download
}

export interface BrowserActionEventDto extends WorkflowActionEventDto {
  browserActionType: BrowserActionTypeEnum;
  actionParams: string; // JSON string
}

export interface UpdateRawDataBasedOnCaseEventDto extends WorkflowActionEventDto {}

export interface AutomaticAddStepsEventDto extends WorkflowActionEventDto {
  /**
   * id-s of the steps that should be automatically added
   */
  steps: string[];
  checkAutoIncrementedFieldPaths?: PropertyPath[];
}

export interface UpdateCaseStatusBasedOnStepResolutionEventDto extends WorkflowActionEventDto {
  /**
   * step refName
   */
  refName: string;
  /**
   * step schema id
   */
  schemaId: string;
  /**
   * for which resolutions the case status updating should be triggered
   */
  resolutions: string[];
  /**
   * what status should the case be updated to
   */
  statusId: string;
}

/**
 *
 * {secondStep-firstStep} result will go into 'resultField'
 * process step link scope:
 */
export interface DifferenceCalculationEventDto extends WorkflowActionEventDto {
  /**
   * field path that will serve as subtrahend:
   * the number that is subtracted
   */
  firstStep: PropertyPath;
  /**
   * field path that will serve as minuend:
   * the one from which to subtract
   */
  secondStep: PropertyPath;
  /**
   * case fieldName that  will serve as difference holder:
   * the result of substraction
   */
  caseResultField?: string;
  rawdataResultField?: RawDataPath;
  stepResultField?: ProcessStepPath;
}

export interface UpdateStatusBasedOnStepAddedEvent extends WorkflowActionEventDto {
  /**
   * what status should the case be updated to
   */
  statusId: string;
}

export interface RawDataToCaseEventDto extends CopyDataBetweenEntitiesEventDto {}

export interface StepToCaseEventDto extends CopyDataBetweenEntitiesEventDto {
  processStepEventExecutionType?: ProcessStepEventExecutionType;
}

export interface CopyDataBetweenEntitiesEventDto extends WorkflowActionEventDto {
  sourceToDestination?: SourceToDestinationWithPath[];
  destinationFieldManipulations?: DestinationFieldManipulation[];
}

export interface DestinationFieldManipulation {
  value: BaseFieldValueType;
  destination: PropertyPathExtended;
}

export interface SourceToDestinationWithPath {
  /**
   * source field path (this field's value  is to be copied)
   */
  source: PropertyPathExtended;
  /**
   * source field path (the above value to be pasted into destination field's value )
   */
  destination: PropertyPathExtended;
}

export interface StepToRawDataEventDto extends CopyDataBetweenEntitiesEventDto {
  isCopyAsRepeatableEnabled?: boolean;
}

export interface MathExpressionCalculationEvent extends WorkflowActionEventDto {
  processStepFields?: { [key: string]: PropertyPath };
  caseFields?: { [key: string]: PropertyPath };
  formula: string;
  caseResultField?: PropertyPath;
  processStepResultField?: PropertyPath;
}

export interface WebhookEventDto extends WorkflowActionEventDto {
  statusId?: string;
  webhookEndpointId: string;
  fields?: string[];
}

export interface CaseToStepEventDto extends CopyDataBetweenEntitiesEventDto {}

export interface SendEmailActionDto extends WorkflowActionEventDto {
  emailData: SendEmailDataDto;
}

export interface AutoIncrementActionDto extends WorkflowActionEventDto {
  autoIncrementFieldPaths?: PropertyPath[];
}

export interface RawDataToStepActionDto extends WorkflowActionEventDto {
  copyAggregation?: AggregationActionDto;
  /**
   * used for copying to repeatable step
   * where we have [1 step <=> 1 rawData] relations
   */
  sourceToDestinationWithPath?: SourceToDestinationWithPath[];
}

export interface AutomaticRemoveStepsActionDto extends WorkflowActionEventDto {
  refNames: string[];
}

export interface RawDataToCaseAggregatedActionDto extends AggregationActionDto {}

export type BaseActionType =
  | UpdateRawDataBasedOnCaseEventDto
  | AutomaticAddStepsEventDto
  | RawDataToCaseEventDto
  | StepToCaseEventDto
  | StepToRawDataEventDto
  | UpdateCaseStatusBasedOnStepResolutionEventDto
  | DifferenceCalculationEventDto
  | UpdateStatusBasedOnStepAddedEvent
  | MathExpressionCalculationEvent
  | WebhookEventDto
  | CaseToStepEventDto
  | SendEmailActionDto
  | AutoIncrementActionDto
  | RawDataToCaseAggregatedActionDto
  | RawDataToStepActionDto
  | BrowserActionEventDto
  | AutomaticRemoveStepsActionDto;

export interface BaseActionDto extends WorkflowActionEventDto {
  parameters: any;
}

export interface SendEmailDataDto {
  emailToFieldName: string;
  emailTo: string;
  emailCC: string;
  emailBCC: string;
  emailSubjectType: EmailSubjectTypeEnum;
  subject: string;
  emailTopicId: string;
}

export const ActionEventNameMap: {
  get: (type: EventTypes) => IKeyValueView<string, EventTypes>;
  has: (type: EventTypes) => boolean;
} = (() => {
  const map = new Map<EventTypes, IKeyValueView<string, EventTypes>>();
  const converter = new EnumConverter(EventTypes);

  const setItem = (type: EventTypes, viewValue: string) => {
    const kv = converter.getKeyValue(type);
    map.set(kv.value, new KeyValueView(kv.key, kv.value, viewValue));
  };
  setItem(EventTypes.Unknown, 'Unknown');
  setItem(EventTypes.OnRawDataAddedToCase, 'Link RawData Status To Case Status');
  setItem(EventTypes.AutomaticAddSteps, 'Add Steps Automatically');
  setItem(EventTypes.AutomaticRemoveSteps, 'Remove Steps Automatically');
  setItem(EventTypes.RawDataToCase, 'Copy RawData Field Values To Case Fields');
  setItem(EventTypes.StepToCase, 'Copy Step Field Values To Case Fields');
  setItem(EventTypes.StepToRawData, 'Copy Step Field Values To RawData Fields');
  setItem(EventTypes.UpdateCaseStatusBasedOnStepResolution, 'Update Case Status On Resolving A Step');
  setItem(EventTypes.DifferenceCalculation, 'Calculate Difference');
  setItem(EventTypes.UpdateStatusBasedOnStepAdded, 'Update Case Status On Adding A Step');
  setItem(EventTypes.MathExpressionCalculation, 'Math Expression Calculation Action');
  setItem(EventTypes.WebHook, 'Webhook Action');
  setItem(EventTypes.CaseToStep, 'Copy Case Field Values To Step Fields');
  setItem(EventTypes.SendEmail, 'Send Email');
  setItem(EventTypes.AutoIncrement, 'Auto Increment');
  setItem(EventTypes.AggregatedRawDataToCase, 'Aggregate Multiple RawData Items And Set In Case');
  setItem(EventTypes.RawDataToStep, 'RawData To Step');
  setItem(EventTypes.BrowserAction, 'Browser Action');

  const has = (type: EventTypes) => {
    const kv = converter.getKeyValue(type);
    if (!kv) {
      return false;
    }
    return map.has(kv.value);
  };
  const getKv = (type: EventTypes) => {
    if (!has(type)) {
      return { ...map.get(EventTypes.Unknown) };
    }
    const kv = converter.getKeyValue(type);
    return { ...map.get(kv.value) };
  };

  return {
    get: getKv,
    has
  };
})();

export const WorkflowActionSubareaNameMap: {
  get: (type: WorkflowEventSubAreas) => IKeyValueView<string, WorkflowEventSubAreas>;
  has: (type: WorkflowEventSubAreas) => boolean;
} = (() => {
  const map = new Map<WorkflowEventSubAreas, IKeyValueView<string, WorkflowEventSubAreas>>();
  const converter = new EnumConverter(WorkflowEventSubAreas);

  const setItem = (type: WorkflowEventSubAreas, viewValue: string) => {
    const kv = converter.getKeyValue(type);
    map.set(kv.value, new KeyValueView(kv.key, kv.value, viewValue));
  };
  setItem(WorkflowEventSubAreas.Unknown, 'Unknown');
  setItem(WorkflowEventSubAreas.WorkflowOnCreateEventsScope, 'Run when creating case');
  setItem(WorkflowEventSubAreas.WorkflowOnDeleteEventsScope, 'Run when deleting case');
  setItem(WorkflowEventSubAreas.WorkflowOnUpdateEventsScope, 'Run when updating case');
  setItem(WorkflowEventSubAreas.WorkflowStatusEventsScope, 'Run when status changes');
  setItem(WorkflowEventSubAreas.WorkflowStepAddedEventsScope, 'Run when adding a step');
  setItem(WorkflowEventSubAreas.WorkflowOnAutoIncrementField, 'Run when the Auto Incremented field is updated');

  const has = (type: WorkflowEventSubAreas) => {
    const kv = converter.getKeyValue(type);
    if (!kv) {
      return false;
    }
    return map.has(kv.value);
  };
  const getKv = (type: WorkflowEventSubAreas) => {
    if (!has(type)) {
      return { ...map.get(WorkflowEventSubAreas.Unknown) };
    }
    const kv = converter.getKeyValue(type);
    return { ...map.get(kv.value) };
  };

  return {
    get: getKv,
    has
  };
})();

export const ProcessStepLinksActionSubareaNameMap: {
  get: (type: ProcessStepLinksEventSubArea) => IKeyValueView<string, ProcessStepLinksEventSubArea>;
  has: (type: ProcessStepLinksEventSubArea) => boolean;
} = (() => {
  const map = new Map<ProcessStepLinksEventSubArea, IKeyValueView<string, ProcessStepLinksEventSubArea>>();
  const converter = new EnumConverter(ProcessStepLinksEventSubArea);

  const setItem = (type: ProcessStepLinksEventSubArea, viewValue: string) => {
    const kv = converter.getKeyValue(type);
    map.set(kv.value, new KeyValueView(kv.key, kv.value, viewValue));
  };
  setItem(ProcessStepLinksEventSubArea.Unknown, 'Unknown');
  setItem(ProcessStepLinksEventSubArea.OnStepDeleted, 'Run when deleting step');
  setItem(ProcessStepLinksEventSubArea.OnStepAdded, 'Run when step added');
  setItem(ProcessStepLinksEventSubArea.OnStepResolved, 'Run when step resolution changes');
  setItem(ProcessStepLinksEventSubArea.OnStepUpdated, 'Run when step updated');

  const has = (type: ProcessStepLinksEventSubArea) => {
    const kv = converter.getKeyValue(type);
    if (!kv) {
      return false;
    }
    return map.has(kv.value);
  };
  const getKv = (type: ProcessStepLinksEventSubArea) => {
    if (!has(type)) {
      return { ...map.get(ProcessStepLinksEventSubArea.Unknown) };
    }
    const kv = converter.getKeyValue(type);
    return { ...map.get(kv.value) };
  };

  return {
    get: getKv,
    has
  };
})();

export const ActionScopeMap: {
  has: (type: EventAreaScopes) => boolean;
  get: (type: EventAreaScopes) => EventTypes[];
} = (() => {
  const map = new Map<EventAreaScopes, EventTypes[]>();
  const hasScopeActions = (type: EventAreaScopes) => {
    return map.has(type) && !!map.get(type).length;
  };
  const getScopeActions = (type: EventAreaScopes) => {
    if (!hasScopeActions(type)) {
      return [];
    }
    return [...map.get(type)];
  };

  map.set(EventAreaScopes.ProcessStepLinkScope, [
    EventTypes.AutomaticAddSteps,
    EventTypes.AutomaticRemoveSteps,
    EventTypes.AutoIncrement,
    EventTypes.UpdateCaseStatusBasedOnStepResolution,
    EventTypes.DifferenceCalculation,
    EventTypes.MathExpressionCalculation,
    EventTypes.StepToCase,
    EventTypes.StepToRawData,
    EventTypes.RawDataToStep,
    EventTypes.WebHook,
    EventTypes.SendEmail,
    EventTypes.BrowserAction
  ]);

  map.set(EventAreaScopes.WorkflowScope, [
    EventTypes.AutomaticAddSteps,
    EventTypes.AutomaticRemoveSteps,
    EventTypes.AutoIncrement,
    EventTypes.OnRawDataAddedToCase,
    EventTypes.UpdateStatusBasedOnStepAdded,
    EventTypes.RawDataToCase,
    EventTypes.AggregatedRawDataToCase,
    EventTypes.RawDataToStep,
    EventTypes.CaseToStep,
    EventTypes.WebHook,
    EventTypes.SendEmail,
    EventTypes.BrowserAction
  ]);

  return {
    get: getScopeActions,
    has: hasScopeActions
  };
})();

export const WorkflowSubAreaByActionMap: { [key: number]: WorkflowEventSubAreas[] } = {
  [EventTypes.RawDataToCase]: [WorkflowEventSubAreas.WorkflowOnCreateEventsScope],
  [EventTypes.OnRawDataAddedToCase]: [WorkflowEventSubAreas.WorkflowStatusEventsScope],
  [EventTypes.WebHook]: [
    WorkflowEventSubAreas.WorkflowStatusEventsScope,
    WorkflowEventSubAreas.WorkflowOnCreateEventsScope,
    WorkflowEventSubAreas.WorkflowOnDeleteEventsScope,
    WorkflowEventSubAreas.WorkflowOnUpdateEventsScope,
    WorkflowEventSubAreas.WorkflowStepAddedEventsScope
  ],
  [EventTypes.UpdateStatusBasedOnStepAdded]: [WorkflowEventSubAreas.WorkflowStepAddedEventsScope],
  [EventTypes.AutomaticAddSteps]: [WorkflowEventSubAreas.WorkflowOnCreateEventsScope, WorkflowEventSubAreas.WorkflowOnAutoIncrementField],
  [EventTypes.CaseToStep]: [
    WorkflowEventSubAreas.WorkflowOnCreateEventsScope,
    WorkflowEventSubAreas.WorkflowOnUpdateEventsScope,
    WorkflowEventSubAreas.WorkflowStepAddedEventsScope
  ],
  [EventTypes.SendEmail]: [
    WorkflowEventSubAreas.WorkflowOnCreateEventsScope,
    WorkflowEventSubAreas.WorkflowOnDeleteEventsScope,
    WorkflowEventSubAreas.WorkflowOnUpdateEventsScope,
    WorkflowEventSubAreas.WorkflowStatusEventsScope,
    WorkflowEventSubAreas.WorkflowStepAddedEventsScope
  ],
  [EventTypes.AggregatedRawDataToCase]: [
    WorkflowEventSubAreas.WorkflowOnCreateEventsScope,
    WorkflowEventSubAreas.WorkflowOnUpdateEventsScope
  ],
  [EventTypes.AutoIncrement]: [
    WorkflowEventSubAreas.WorkflowOnCreateEventsScope,
    WorkflowEventSubAreas.WorkflowOnDeleteEventsScope,
    WorkflowEventSubAreas.WorkflowOnUpdateEventsScope,
    WorkflowEventSubAreas.WorkflowStatusEventsScope,
    WorkflowEventSubAreas.WorkflowStepAddedEventsScope
  ],
  [EventTypes.RawDataToStep]: [
    WorkflowEventSubAreas.WorkflowOnUpdateEventsScope,
    WorkflowEventSubAreas.WorkflowStatusEventsScope,
    WorkflowEventSubAreas.WorkflowStepAddedEventsScope
  ],
  [EventTypes.BrowserAction]: [
    WorkflowEventSubAreas.WorkflowOnUpdateEventsScope,
    WorkflowEventSubAreas.WorkflowStatusEventsScope,
    WorkflowEventSubAreas.WorkflowStepAddedEventsScope,
    WorkflowEventSubAreas.WorkflowOnCreateEventsScope
    // WorkflowEventSubAreas.WorkflowOnDeleteEventsScope
  ],
  [EventTypes.AutomaticRemoveSteps]: [
    WorkflowEventSubAreas.WorkflowOnUpdateEventsScope,
    WorkflowEventSubAreas.WorkflowStatusEventsScope,
    WorkflowEventSubAreas.WorkflowStepAddedEventsScope
  ]
};

export const ProcessStepSubAreaByActionMap: { [key: number]: ProcessStepLinksEventSubArea[] } = {
  [EventTypes.StepToCase]: [ProcessStepLinksEventSubArea.OnStepResolved, ProcessStepLinksEventSubArea.OnStepUpdated],
  [EventTypes.AutomaticAddSteps]: [ProcessStepLinksEventSubArea.OnStepResolved],
  [EventTypes.UpdateCaseStatusBasedOnStepResolution]: [ProcessStepLinksEventSubArea.OnStepResolved],
  [EventTypes.DifferenceCalculation]: [ProcessStepLinksEventSubArea.OnStepResolved],
  [EventTypes.StepToRawData]: [ProcessStepLinksEventSubArea.OnStepResolved, ProcessStepLinksEventSubArea.OnStepUpdated],
  [EventTypes.MathExpressionCalculation]: [ProcessStepLinksEventSubArea.OnStepResolved],
  [EventTypes.WebHook]: [
    ProcessStepLinksEventSubArea.OnStepAdded,
    ProcessStepLinksEventSubArea.OnStepResolved,
    ProcessStepLinksEventSubArea.OnStepUpdated,
    ProcessStepLinksEventSubArea.OnStepDeleted
  ],
  [EventTypes.SendEmail]: [
    ProcessStepLinksEventSubArea.OnStepAdded,
    ProcessStepLinksEventSubArea.OnStepResolved,
    ProcessStepLinksEventSubArea.OnStepUpdated,
    ProcessStepLinksEventSubArea.OnStepDeleted
  ],
  [EventTypes.AutoIncrement]: [
    ProcessStepLinksEventSubArea.OnStepDeleted,
    ProcessStepLinksEventSubArea.OnStepAdded,
    ProcessStepLinksEventSubArea.OnStepResolved,
    ProcessStepLinksEventSubArea.OnStepUpdated
  ],
  [EventTypes.RawDataToStep]: [
    ProcessStepLinksEventSubArea.OnStepAdded,
    ProcessStepLinksEventSubArea.OnStepResolved,
    ProcessStepLinksEventSubArea.OnStepUpdated
  ],
  [EventTypes.BrowserAction]: [
    ProcessStepLinksEventSubArea.OnStepAdded,
    ProcessStepLinksEventSubArea.OnStepResolved,
    ProcessStepLinksEventSubArea.OnStepUpdated,
    ProcessStepLinksEventSubArea.OnStepDeleted
  ],
  [EventTypes.AutomaticRemoveSteps]: [
    ProcessStepLinksEventSubArea.OnStepAdded,
    ProcessStepLinksEventSubArea.OnStepResolved,
    ProcessStepLinksEventSubArea.OnStepUpdated,
    ProcessStepLinksEventSubArea.OnStepDeleted
  ]
};

// export const WorkflowActionSubAreas = [
//   WorkflowEventSubAreas.WorkflowOnCreateEventsScope,
//   WorkflowEventSubAreas.WorkflowOnUpdateEventsScope,
//   WorkflowEventSubAreas.WorkflowStepAddedEventsScope,
//   WorkflowEventSubAreas.WorkflowOnDeleteEventsScope,
//   WorkflowEventSubAreas.WorkflowStatusEventsScope
// ];

// export const ProcessStepLinkActionSubAreas = [
//   ProcessStepLinksEventSubArea.OnStepDeleted,
//   ProcessStepLinksEventSubArea.OnStepAdded,
//   ProcessStepLinksEventSubArea.OnStepResolved,
//   ProcessStepLinksEventSubArea.OnStepUpdated
// ];
