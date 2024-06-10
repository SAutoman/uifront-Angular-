/**
 * global
 */
import { Inject, Injectable } from '@angular/core';

/**
 * project
 */

import { Operation, PagedData } from '@wfm/service-layer/models';
import {
  CreateStatusCommand,
  DeleteStatusCommand,
  QueryStatusesCommand,
  UpdateWorkflowStatusCommand,
  WorkflowStatusDto
} from '../models/workflowStatus';

/**
 * local
 */
import { HttpClientService } from './application-http-client.service';
import { OperationService } from './operation.service';

@Injectable()
export class WorkflowStatusService {
  BASE_URL = (tenantId) => `tenant/${tenantId}/workflowStatus`;

  constructor(private operationsService: OperationService, @Inject('HttpClientService') private httpClient: HttpClientService) {}

  async create(cmd: CreateStatusCommand): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL(cmd.tenantId)}`, cmd);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async get(tenantId: string, id: string): Promise<WorkflowStatusDto> {
    return await this.httpClient.get<WorkflowStatusDto>(`${this.BASE_URL(tenantId)}/${id}`);
  }

  async delete(tenantId: string, id: string): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL(tenantId)}/${id}`, <DeleteStatusCommand>{ id, tenantId });
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async update(id: string, cmd: UpdateWorkflowStatusCommand): Promise<Operation> {
    let operation = await this.httpClient.put<Operation>(`${this.BASE_URL(cmd.tenantId)}/${id}`, cmd);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async search(tenantId: string, query: QueryStatusesCommand): Promise<PagedData<WorkflowStatusDto>> {
    return this.httpClient.post<PagedData<WorkflowStatusDto>>(`${this.BASE_URL(tenantId)}/search`, query);
  }
}
