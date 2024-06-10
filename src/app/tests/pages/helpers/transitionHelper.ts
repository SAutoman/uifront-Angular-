import { Injectable } from '@angular/core';
import { CreateWorkflowTransitionDto, WorkflowTransitionService } from '@wfm/service-layer';
import { Expression } from '@wfm/service-layer/models/expressionModel';

@Injectable()
export class TransitionHelper {
  constructor(private transitionService: WorkflowTransitionService) {}

  async create(name: string, statusId: string, toStatusId: string, tenantId: string, workflowId: string, expression: Expression) {
    const cmd: CreateWorkflowTransitionDto = {
      name: name,
      statusId: statusId,
      toStatusId: toStatusId,
      tenantId: tenantId,
      workflowId: workflowId,
      expression: expression
    };

    const operation = await this.transitionService.create(cmd);
    const result = await this.transitionService.get(tenantId, operation.targetId);
    return result;
  }
}
