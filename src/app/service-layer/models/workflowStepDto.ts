import { WorkflowResolutionDto } from './workflowResolution';

export interface WorkflowStepDto extends CreateWorkflowStepDto {
  id: string;
}

export interface CreateWorkflowStepDto {
  name: string;
  schemaId: string;
  refName: string;
  tenantId: string;
  workflowId: string;
  resolutions: WorkflowResolutionDto[];
}
