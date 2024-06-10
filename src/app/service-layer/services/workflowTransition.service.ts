/**
 * global
 */
import { Inject, Injectable } from '@angular/core';

/**
 * project
 */

import { Operation } from '@wfm/service-layer/models';
import {
  CreateWorkflowTransitionDto,
  DeleteTransitionCommand,
  WorkflowTransitionDto,
  UpdateWorkflowTransitionDto
} from '../models/workflowTransition';

/**
 * local
 */
import { HttpClientService } from './application-http-client.service';
import { OperationService } from './operation.service';

@Injectable()
export class WorkflowTransitionService {
  BASE_URL = (tenantId) => `tenant/${tenantId}/workflowTransition`;

  constructor(private operationsService: OperationService, @Inject('HttpClientService') private httpClient: HttpClientService) {}

  async create(cmd: CreateWorkflowTransitionDto): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL(cmd.tenantId)}`, cmd);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async get(tenantId: string, id: string): Promise<WorkflowTransitionDto> {
    return this.httpClient.get<WorkflowTransitionDto>(`${this.BASE_URL(tenantId)}/${id}`);
  }

  async delete(tenantId: string, id: string): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL(tenantId)}/${id}`, <DeleteTransitionCommand>{ id, tenantId });
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async update(tenantId: string, cmd: UpdateWorkflowTransitionDto): Promise<Operation> {
    let operation = await this.httpClient.put<Operation>(`${this.BASE_URL(tenantId)}/${cmd.id}`, cmd);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async getList(tenantId: string, workflowId: string): Promise<WorkflowTransitionDto[]> {
    return this.httpClient.get<WorkflowTransitionDto[]>(`${this.BASE_URL(tenantId)}/workflow/${workflowId}`);
  }
}
