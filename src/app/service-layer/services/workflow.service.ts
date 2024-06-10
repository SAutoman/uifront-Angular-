/**
 * global
 */
import { Inject, Injectable } from '@angular/core';

/**
 * project
 */
import { Operation, PagedDataWithIncompleteItems, Paging, Sorting } from '@wfm/service-layer/models';

/**
 * local
 */
import {
  CopyWorkflow,
  CreateWorkflowCommand,
  DefaultStatusCommand,
  GetWorkflowByRawDataQuery,
  IncompleteWorkflowDto,
  RawDataReferencedWorkflows,
  UpdateWorkflowCommand,
  WorkflowDto,
  WorkflowSimplifiedDto,
  WorkflowStatusUsage
} from '../models/workflow';
import { WorkflowActionEventLogEntry } from '../models/workflow-action-event-log';
import { HttpClientService } from './application-http-client.service';
import { OperationService } from './operation.service';
import { PrintPreviewFieldsTree } from '@wfm/tenants/print-preview-setting/print-preview.model';

@Injectable()
export class WorkflowService {
  BASE_URL = (tenantId) => `tenant/${tenantId}/workflow`;
  constructor(private operationsService: OperationService, @Inject('HttpClientService') private httpClient: HttpClientService) {}

  async create(cmd: CreateWorkflowCommand): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL(cmd.tenantId)}`, cmd);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async setDefaultStatus(workflowId: string, statusId: string, tenantId: string): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL(tenantId)}/defaultStatus`, <DefaultStatusCommand>{
      workflowId,
      tenantId,
      statusId
    });
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async delete(id: string, tenantId: string): Promise<Operation> {
    let operation = await this.httpClient.delete<Operation>(`${this.BASE_URL(tenantId)}/${id}`);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async update(cmd: UpdateWorkflowCommand): Promise<Operation> {
    let operation = await this.httpClient.put<Operation>(`${this.BASE_URL(cmd.tenantId)}/${cmd.id}`, cmd);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async get(id: string, tenantId: string): Promise<WorkflowDto> {
    return this.httpClient.get<WorkflowDto>(`${this.BASE_URL(tenantId)}/${id}`);
  }

  async getActionEventLogs(tenantId: string): Promise<WorkflowActionEventLogEntry[]> {
    return this.httpClient.get<WorkflowActionEventLogEntry[]>(`${this.BASE_URL(tenantId)}/getActionEventLogs`);
  }

  async getByRawData(query: GetWorkflowByRawDataQuery): Promise<WorkflowDto> {
    return this.httpClient.get<WorkflowDto>(`${this.BASE_URL(query.tenantId)}/byRawData`);
  }

  async getRawDataWorkflows(tenantId: string, rawDataId: string): Promise<RawDataReferencedWorkflows[]> {
    return this.httpClient.get<RawDataReferencedWorkflows[]>(`${this.BASE_URL(tenantId)}/byRawData/${rawDataId}`);
  }

  async search(
    tenantId: string,
    paging: Paging,
    sorting?: Sorting[],
    sendIncomplete?: boolean
  ): Promise<PagedDataWithIncompleteItems<WorkflowDto>> {
    let url = `${this.BASE_URL(tenantId)}/search`;
    if (sendIncomplete) {
      url += `?includeIncorrectItems=true`;
    }
    return this.httpClient.post<PagedDataWithIncompleteItems<WorkflowDto>>(url, { paging, sorting });
  }

  async getWorkflowStatusUsage(tenantId: string, id: string): Promise<WorkflowStatusUsage[]> {
    return this.httpClient.get<WorkflowStatusUsage[]>(`${this.BASE_URL(tenantId)}/status/${id}`);
  }

  async getIncompleteWorkflow(id: string, tenantId: string): Promise<IncompleteWorkflowDto> {
    return this.httpClient.get<IncompleteWorkflowDto>(`${this.BASE_URL(tenantId)}/incomplete/${id}`);
  }

  async updateIncompleteWorkflow(cmd: UpdateWorkflowCommand): Promise<Operation> {
    let operation = await this.httpClient.put<Operation>(`${this.BASE_URL(cmd.tenantId)}/incomplete/${cmd.id}`, cmd);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async searchSimplified(tenantId: string, paging: Paging, sorting?: Sorting[]): Promise<WorkflowSimplifiedDto[]> {
    let url = `${this.BASE_URL(tenantId)}/trimmed-search`;

    return this.httpClient.post<WorkflowSimplifiedDto[]>(url, { paging, sorting });
  }

  async createWorkflowCopy(cmd: CopyWorkflow, tenantId: string): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL(tenantId)}/copy-workflow`, cmd);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async getWorkflowFieldsTree(tenantId: string, workflowId: string): Promise<PrintPreviewFieldsTree> {
    return this.httpClient.get<PrintPreviewFieldsTree>(`${this.BASE_URL(tenantId)}/${workflowId}/workflow-Fields`);
  }
}
