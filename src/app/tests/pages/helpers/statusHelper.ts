import { Injectable } from '@angular/core';
import { CreateStatusCommand, Operation, StatusConfiguration, WorkflowStatusDto, WorkflowStatusService } from '@wfm/service-layer';
import { WorkflowHelper } from './workflowHelper';

@Injectable()
export class StatusHelper {
  constructor(private statusService: WorkflowStatusService, private wfHelper: WorkflowHelper) {}

  async createStatus(tenantId: string, name: string, position: number, configuration?: StatusConfiguration): Promise<WorkflowStatusDto> {
    const cmd: CreateStatusCommand = {
      name: name,
      position: position,
      tenantId: tenantId,
      configuration
    };

    const operation = await this.wfHelper.createStatusWithUniqueName(cmd);
    const result = await this.statusService.get(tenantId, operation.targetId);
    return result;
  }

  async deleteStatus(tenantId: string, id: string): Promise<Operation> {
    return await this.statusService.delete(tenantId, id);
  }
}
