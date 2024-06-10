import { Injectable } from '@angular/core';
import {
  CreateStatusCommand,
  CreateWorkflowCommand,
  GetWorkflowStateQuery,
  Operation,
  WorkflowDto,
  WorkflowService,
  WorkflowStateService,
  WorkflowStatusService
} from '@wfm/service-layer';
import { BaseActionType } from '@wfm/service-layer/models/actionDto';
import { DateTime } from 'luxon';

@Injectable()
export class WorkflowHelper {
  constructor(
    public workflowService: WorkflowService,
    private statusService: WorkflowStatusService,
    private workflowStateService: WorkflowStateService
  ) {}

  async createWorkflow(
    name: string,
    tenant: string,
    caseSchemaId: string,
    statuses: string[],
    onCreateEvents?: BaseActionType[],
    onDeleteEvents?: BaseActionType[],
    onUpdateCase?: BaseActionType[],
    statusEvents?: BaseActionType[],
    onStepAddedEvents?: BaseActionType[]
  ): Promise<WorkflowDto> {
    const cmd: CreateWorkflowCommand = {
      name: name,
      tenantId: tenant,
      caseSchemaId: caseSchemaId,
      statuses: statuses,
      onCreateEvents: onCreateEvents,
      onDeleteEvents: onDeleteEvents,
      onUpdateCase: onUpdateCase,
      statusEvents: statusEvents,
      onStepAddedEvents: onStepAddedEvents
    };
    const operation = await this.workflowService.create(cmd);
    const result = await this.workflowService.get(operation.targetId, tenant);
    return result;
  }

  async deleteWorkflow(tenantId: string, id: string): Promise<Operation> {
    return await this.workflowService.delete(id, tenantId);
  }
  async setDefaultStatus(workflowID: string, statusId: string, tenantId: string): Promise<Operation> {
    return await this.workflowService.setDefaultStatus(workflowID, statusId, tenantId);
  }

  async createStatusWithUniqueName(statusCommand: CreateStatusCommand): Promise<Operation> {
    statusCommand.name = `${statusCommand.name} - ${DateTime.now().toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)}`;
    return await this.statusService.create(statusCommand);
  }

  async getStepDePublicId(stepRefName: string, wfStateId: string, tenantId: string, wfId: string): Promise<string> {
    try {
      /**
       * get the workflowState
       * from it get the newly added step's stepDynamicEntity[0].dynamicEntityId
       * it shall be sent as publicId in stepDynamicEntites[0].dynamicEntity when updating the step
       */
      const wfState = await this.workflowStateService.get(<GetWorkflowStateQuery>{
        id: wfStateId,
        tenant: tenantId,
        schemaId: wfId
      });

      const stepDePublicId = wfState?.fields?.find((f) => f.refName === stepRefName)?.entities[0]?.stepDynamicEntities[0]?.dynamicEntityId;

      return stepDePublicId || null;
    } catch (error) {
      console.log(error);

      return null;
    }
  }
}
