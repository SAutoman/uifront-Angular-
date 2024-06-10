/**
 * global
 */
import { Inject, Injectable } from '@angular/core';
/**
 * project
 */
import {
  CreateProcessStepEntityCmd,
  Operation,
  PagedData,
  Paging,
  ProcessStepEntityDto,
  UpdateProcessStepEntityCmd
} from '@wfm/service-layer/models';
/**
 * local
 */
import { HttpClientService } from './application-http-client.service';
import { OperationService } from './operation.service';

@Injectable()
export class ProcessStepEntityService {
  BASE_URL = (tenantId) => `tenant/${tenantId}/ProcessStepEntity`;

  constructor(private operationsService: OperationService, @Inject('HttpClientService') private httpClient: HttpClientService) {}

  async create(cmd: CreateProcessStepEntityCmd): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL(cmd.tenantId)}/create`, cmd);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async update(cmd: UpdateProcessStepEntityCmd): Promise<Operation> {
    let operation = await this.httpClient.put<Operation>(`${this.BASE_URL(cmd.tenantId)}/${cmd.id}`, cmd);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async get(tenantId: string, id: string): Promise<ProcessStepEntityDto> {
    return this.httpClient.get<ProcessStepEntityDto>(`${this.BASE_URL(tenantId)}/${id}`);
  }

  async getList(tenantId: string, paging: Paging): Promise<PagedData<ProcessStepEntityDto>> {
    return this.httpClient.get<PagedData<ProcessStepEntityDto>>(`${this.BASE_URL(tenantId)}?skip=${paging.skip}&take=${paging.take}`);
  }

  async delete(tenantId: string, id: string): Promise<Operation> {
    let operation = await this.httpClient.delete<Operation>(`${this.BASE_URL(tenantId)}/${id}`);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }
}
