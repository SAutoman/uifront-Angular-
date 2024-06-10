import { EventTypes } from './actionDto';
import { WorkflowStateDto } from './workflowState';

export interface WorkflowActionEventLogEntry {
  id: string;
  content: WorkflowActionEventContent;
}

export interface WorkflowActionEventContent {
  tenantId: string;
  eventType: EventTypes;
  oldState: WorkflowStateDto;
  newState: WorkflowStateDto;
}
