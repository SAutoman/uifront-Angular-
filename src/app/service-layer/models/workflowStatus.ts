import { IFilter } from './i-filter';
import { Paging, SortingDef } from './model';

export interface StatusConfiguration {
  label?: string;
  color?: string;
}

export interface WorkflowStatusDto extends CreateStatusCommand {
  id: string;
  name: string;
  enabled: boolean;
  position: number;
  configuration?: StatusConfiguration;
}

export interface CreateStatusCommand {
  name: string;
  position: number;
  tenantId: string;
  configuration?: StatusConfiguration;
}

export interface UpdateWorkflowStatusCommand {
  name: string;
  position: number;
  tenantId: string;
  configuration?: StatusConfiguration;
}

export interface DeleteStatusCommand {
  id: string;
  tenantId: string;
}

export interface QueryStatusesCommand {
  paging: Paging;
  sorting?: SortingDef;
  filters?: IFilter[];
  projection?: {
    propertyNames: string[];
  };
}
