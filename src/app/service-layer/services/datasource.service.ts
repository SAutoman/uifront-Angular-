import { Inject, Injectable } from '@angular/core';
import { Operation } from '../models';
import { HttpClientService } from './application-http-client.service';
import { OperationService } from './operation.service';
import {
  CreateDataSourceDto,
  DataSourceDto,
  DataSourceSimplified,
  DatasourceSchemaFieldConfiguration,
  DatasourceSchemaFields
} from '@wfm/report/report-datasource.model';

@Injectable({
  providedIn: 'root'
})
export class DataSourceService {
  BASE_URL = (tenantId) => `reportsDataSources/tenant/${tenantId}`;

  constructor(private operationsService: OperationService, @Inject('HttpClientService') private httpClient: HttpClientService) {}

  async create(cmd: CreateDataSourceDto): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL(cmd.tenantId)}`, cmd);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async update(cmd: DataSourceDto): Promise<Operation> {
    let operation = await this.httpClient.put<Operation>(`${this.BASE_URL(cmd.tenantId)}/data-source/${cmd.id}`, cmd);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async delete(id: string, tenantId: string): Promise<Operation> {
    let operation = await this.httpClient.delete<Operation>(`${this.BASE_URL(tenantId)}/data-source/${id}`);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async getById(id: string, tenantId: string): Promise<DataSourceDto> {
    return await this.httpClient.get<DataSourceDto>(`${this.BASE_URL(tenantId)}/data-source/${id}`);
  }

  /**
   * not used yet
   */
  async getByWorkflowId(workflowId: string, tenantId: string): Promise<DataSourceDto[]> {
    return await this.httpClient.get<DataSourceDto[]>(`${this.BASE_URL(tenantId)}/workflow-schema/${workflowId}`);
  }

  async getAllSimplified(tenantId: string): Promise<DataSourceSimplified[]> {
    return await this.httpClient.get<DataSourceSimplified[]>(`${this.BASE_URL(tenantId)}`);
  }

  async getDatasourceFieldsConfigs(id: string, tenantId: string): Promise<DatasourceSchemaFields> {
    return await this.httpClient.get<DatasourceSchemaFields>(`${this.BASE_URL(tenantId)}/data-source/${id}/schema-fields`);
  }
}
