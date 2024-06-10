import { Inject, Injectable } from '@angular/core';
import { OperationService, HttpClientService } from '.';
import { Operation } from '../models/operation';
import { WebHook, WebHookData } from '../models/webHooks';

@Injectable({
  providedIn: 'root'
})
export class WebHooksService {
  private BASE_URL = (tenantId) => `tenant/${tenantId}/WebHookManagement`;

  constructor(private operationsService: OperationService, @Inject('HttpClientService') private httpClient: HttpClientService) {}

  /**
   * any to be replaced with types
   */

  async create(tenantId: string, command: WebHook): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL(tenantId)}`, { definition: command });
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async delete(tenantId: string, id: string): Promise<Operation> {
    let operation = await this.httpClient.delete<Operation>(`${this.BASE_URL(tenantId)}/${id}`);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async get(tenantId: string): Promise<WebHookData[]> {
    return this.httpClient.get<any>(`${this.BASE_URL(tenantId)}`);
  }

  async getById(tenantId: string, id: string): Promise<any> {
    return this.httpClient.get<any>(`${this.BASE_URL(tenantId)}/${id}`);
  }

  async update(tenantId: string, id: string, command: WebHook): Promise<Operation> {
    let operation = await this.httpClient.put<Operation>(`${this.BASE_URL(tenantId)}/${id}`, {
      webhookId: id,
      definition: command
    });
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async getFields(tenantId: string, workflowSchemaId: string): Promise<string[]> {
    return await this.httpClient.get<string[]>(`${this.BASE_URL(tenantId)}/${workflowSchemaId}/payload-properties`);
  }
}
