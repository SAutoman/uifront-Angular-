import { Inject, Injectable } from '@angular/core';
import { Operation } from '../models';
import { ApiClientsList, CreateApiClient } from '../models/api-clients';
import { HttpClientService } from './application-http-client.service';
import { OperationService } from './operation.service';

@Injectable({
  providedIn: 'root'
})
export class ApiClientsService {
  private BASE_URL = (tenantId) => `tenant/${tenantId}/TenantApiClients`;

  constructor(private operationsService: OperationService, @Inject('HttpClientService') private httpClient: HttpClientService) {}

  async create(tenantId: string, command: CreateApiClient): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL(tenantId)}`, command);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async get(tenantId: string): Promise<ApiClientsList[]> {
    return this.httpClient.get<ApiClientsList[]>(`${this.BASE_URL(tenantId)}`);
  }

  async delete(tenantId: string, id: string): Promise<Operation> {
    let operation = await this.httpClient.delete<Operation>(`${this.BASE_URL(tenantId)}/${id}`);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }
}
