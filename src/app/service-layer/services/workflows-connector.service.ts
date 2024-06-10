/**
 * global
 */
import { Inject, Injectable } from '@angular/core';
import { ConnectorFieldOption } from '@wfm/common/models/connector-field';

/**
 * project
 */
import { AreaTypeEnum, Operation } from '@wfm/service-layer/models';
import { CreateWorkflowConnectorDto, CrossTenantWorkflowSchemaGroup, WorkflowSchemaConnectorEntity } from '../models/orchestrator';

/**
 * local
 */

import { HttpClientService } from './application-http-client.service';
import { OperationService } from './operation.service';

@Injectable()
export class WorkflowsConnectorService {
  BASE_URL = `workflow-schema-connectors`;

  constructor(private operationsService: OperationService, @Inject('HttpClientService') private httpClient: HttpClientService) {}

  async create(cmd: CreateWorkflowConnectorDto): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL}`, cmd);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async delete(id: string): Promise<Operation> {
    let operation = await this.httpClient.delete<Operation>(`${this.BASE_URL}/${id}`);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async get(id: string): Promise<WorkflowSchemaConnectorEntity> {
    return this.httpClient.get<WorkflowSchemaConnectorEntity>(`${this.BASE_URL}/${id}`);
  }

  async getAll(): Promise<WorkflowSchemaConnectorEntity[]> {
    return this.httpClient.get<WorkflowSchemaConnectorEntity[]>(`${this.BASE_URL}`);
  }

  getGroupedTenantWorkflows(): Promise<CrossTenantWorkflowSchemaGroup[]> {
    return this.httpClient.get<CrossTenantWorkflowSchemaGroup[]>(`${this.BASE_URL}/tenant-workflow-schemas`);
  }

  getConnectorFieldOptions(connectorFieldId: string, dynamicEntityId?: string): Promise<ConnectorFieldOption[]> {
    let url = `${this.BASE_URL}/schema-fields/${connectorFieldId}/connector-field-options`;
    if (dynamicEntityId) {
      url += `?dynamicEntityId=${dynamicEntityId}`;
    }

    return this.httpClient.get<ConnectorFieldOption[]>(url);
  }
}
