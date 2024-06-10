/**
 * global
 */
import { Inject, Injectable } from '@angular/core';

/**
 * project
 */

import { Operation, ProcessStepLinkPositionsDto } from '@wfm/service-layer/models';
import { UpdateProcessStepLinkDto, CreateProcessStepLinkDtoNew, DeleteProcessStepLinkCommand, ProcessStepLinkDto } from '../models/LinkDto';

/**
 * local
 */
import { HttpClientService } from './application-http-client.service';
import { OperationService } from './operation.service';

@Injectable()
export class ProcessStepLinkService {
  BASE_URL = (tenantId) => `tenant/${tenantId}/processStepLink`;

  constructor(private operationsService: OperationService, @Inject('HttpClientService') private httpClient: HttpClientService) {}

  async createNew(cmd: CreateProcessStepLinkDtoNew): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL(cmd.tenantId)}`, cmd);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async get(tenantId: string, id: string): Promise<ProcessStepLinkDto> {
    return this.httpClient.get<ProcessStepLinkDto>(`${this.BASE_URL(tenantId)}/${id}`);
  }

  async delete(tenantId: string, id: string): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL(tenantId)}/${id}`, <DeleteProcessStepLinkCommand>{
      tenantId,
      id
    });
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async update(tenantId: string, cmd: UpdateProcessStepLinkDto): Promise<Operation> {
    let operation = await this.httpClient.put<Operation>(`${this.BASE_URL(tenantId)}/${cmd.id}`, cmd);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async getList(tenantId: string, workflowId: string): Promise<ProcessStepLinkDto[]> {
    return this.httpClient.get<ProcessStepLinkDto[]>(`${this.BASE_URL(tenantId)}/workflow/${workflowId}`);
  }

  async updateAllProcessStepLinksPosition(tenantId: string, wfId: string, data: ProcessStepLinkPositionsDto[]): Promise<Operation> {
    let operation = await this.httpClient.patch<Operation>(`${this.BASE_URL(tenantId)}/workflow/${wfId}/update-positions`, data);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }
}
