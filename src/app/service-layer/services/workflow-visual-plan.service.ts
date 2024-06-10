/**
 * global
 */
import { Inject, Injectable } from '@angular/core';

/**
 * project
 */
import { Operation } from '@wfm/service-layer/models';
import { CreateWorkflowVisualPlanConfig, MappedPlanUnitItem, WorkflowVisualPlanConfig } from '../models/workflow-visual-plan.model';

/**
 * local
 */

import { HttpClientService } from './application-http-client.service';
import { OperationService } from './operation.service';

@Injectable()
export class WorkflowVisualPlanService {
  BASE_URL = (tenantId) => `tenant/${tenantId}/workflowVisualPlan`;
  constructor(private operationsService: OperationService, @Inject('HttpClientService') private httpClient: HttpClientService) {}

  async create(cmd: CreateWorkflowVisualPlanConfig): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL(cmd.tenantId)}`, cmd);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }
  async getByWorkflow(tenantId: string, workflowId: string): Promise<WorkflowVisualPlanConfig[]> {
    return this.httpClient.get<WorkflowVisualPlanConfig[]>(`${this.BASE_URL(tenantId)}/workflow-schema/${workflowId}`);
  }

  async update(cmd: WorkflowVisualPlanConfig): Promise<Operation> {
    let operation = await this.httpClient.put<Operation>(`${this.BASE_URL(cmd.tenantId)}/update-workflowVisualPlan`, cmd);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async delete(workflowId: string, visualConfigId: string, tenantId: string): Promise<Operation> {
    let operation = await this.httpClient.delete<Operation>(
      `${this.BASE_URL(tenantId)}/workflow/${workflowId}/worflowvisualplan/${visualConfigId}`
    );
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async getMappedUnits(tenantId: string, workflowSchemaId: string, visualPlanId: string): Promise<MappedPlanUnitItem[]> {
    return this.httpClient.get<MappedPlanUnitItem[]>(
      `${this.BASE_URL(tenantId)}/workflow-schema/${workflowSchemaId}/${visualPlanId}/mappedUnits`
    );
  }
}
