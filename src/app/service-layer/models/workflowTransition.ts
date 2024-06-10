import { Expression, ExpressionDef } from './expressionModel';

export interface CreateWorkflowTransitionDto {
  name: string;
  statusId: string;
  toStatusId: string;
  expression?: ExpressionDef;
  workflowId: string;
  tenantId: string;
}

export interface WorkflowTransitionDto extends CreateWorkflowTransitionDto {
  id: string;
}

export interface UpdateWorkflowTransitionDto extends CreateWorkflowTransitionDto {
  id: string;
}

export interface DeleteTransitionCommand {
  id: string;
  tenantId: string;
}
