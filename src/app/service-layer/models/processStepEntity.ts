import { WorkflowActionEventDto } from './actionDto';
import { WorkflowResolutionDto } from './workflowResolution';

export interface ProcessStepEntityDto extends CreateProcessStepEntityCmd {
  id: string;
}

export interface CreateProcessStepEntityCmd {
  name: string;
  schemaId: string;
  tenantId: string;
  // to be removed, obsolete
  actions?: WorkflowActionEventDto[];
  resolutions: WorkflowResolutionDto[];
}

export interface UpdateProcessStepEntityCmd extends CreateProcessStepEntityCmd {
  id: string;
}
