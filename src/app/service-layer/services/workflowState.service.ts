/**
 * global
 */
import { Inject, Injectable } from '@angular/core';

/**
 * project
 */

import { Operation } from '@wfm/service-layer/models';
import { AxiosResponse } from 'axios';
import { IRequestOptionsForDownload } from '.';
import {
  BulkDeleteWorkflowStatesCommand,
  BulkGetWorkflowStateQuery,
  CreateWorkflowStateCommand,
  DeleteStepCommand,
  DeleteWorkflowStateCommand,
  GetWorkflowStateQuery,
  UpdateCaseStepsUi,
  UpdateStateCase,
  UpdateStatusCommand,
  UpdateStepCommand,
  WorkflowStateDto
} from '../models/workflowState';

/**
 * local
 */
import { HttpClientService } from './application-http-client.service';
import { OperationService } from './operation.service';
import { SchemaValidatorQuery, SchemaValidatorsHelper } from '../helpers/schema-validators.helper';
export interface FileBlobData {
  data: BlobPart;
  fileName?: string;
}

@Injectable()
export class WorkflowStateService {
  private BASE_URL = (tenantId, workflowId) => `tenant/${tenantId}/workflowState/schema/${workflowId}`;

  constructor(
    private operationsService: OperationService,
    @Inject('HttpClientService') private httpClient: HttpClientService,
    private schemaValidator: SchemaValidatorsHelper
  ) {}

  async create(cmd: CreateWorkflowStateCommand): Promise<Operation> {
    const validatorDto: SchemaValidatorQuery = {
      tenantId: cmd.tenantId,
      schemaId: cmd.case.schemaId,
      fields: cmd.case.fields
    };

    if (await this.schemaValidator.checkSchemaValidators(validatorDto)) {
      let operation = await this.httpClient.post<Operation>(this.BASE_URL(cmd.tenantId, cmd.schemaId), cmd);
      operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
      return operation;
    }

    throw new Error(`Create Case action stopped`);
  }

  async delete(cmd: DeleteWorkflowStateCommand): Promise<Operation> {
    let operation = await this.httpClient.delete<Operation>(`${this.BASE_URL(cmd.tenant, cmd.schemaId)}/${cmd.id}`);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async bulkDelete(cmd: BulkDeleteWorkflowStatesCommand): Promise<Operation> {
    let operation = await this.httpClient.delete<Operation>(`${this.BASE_URL(cmd.tenant, cmd.schemaId)}/bulk-delete`, null, {
      workflowStateId: cmd.workflowStateIds
    });
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async deleteStep(cmd: DeleteStepCommand): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL(cmd.tenantId, cmd.schemaId)}/delete-process-step`, cmd);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async get(query: GetWorkflowStateQuery): Promise<WorkflowStateDto> {
    return this.httpClient.get<WorkflowStateDto>(`${this.BASE_URL(query.tenant, query.schemaId)}/${query.id}`);
  }

  async bulkGet(query: BulkGetWorkflowStateQuery): Promise<WorkflowStateDto[]> {
    return await this.httpClient.post<WorkflowStateDto[]>(`${this.BASE_URL(query.tenantId, query.schemaId)}/bulk-get`, query);
  }

  async updateStatus(cmd: UpdateStatusCommand): Promise<Operation> {
    let operation = await this.httpClient.put<Operation>(`${this.BASE_URL(cmd.tenantId, cmd.schemaId)}/update-status`, cmd);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async addStep(cmd: UpdateStepCommand): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL(cmd.tenantId, cmd.schemaId)}/create-process-step`, cmd);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async updateStep(cmd: UpdateStepCommand): Promise<Operation> {
    const validatorDto: SchemaValidatorQuery = {
      tenantId: cmd.tenantId,
      schemaId: cmd.stepSchemaId,
      fields: cmd.stepDynamicEntities[0].dynamicEntity.fields,
      id: cmd.stepDynamicEntities[0].dynamicEntity.publicId
    };

    if (await this.schemaValidator.checkSchemaValidators(validatorDto)) {
      let operation = await this.httpClient.put<Operation>(`${this.BASE_URL(cmd.tenantId, cmd.schemaId)}/update-process-step`, cmd);
      operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
      return operation;
    }

    throw new Error(`Update Step action stopped`);
  }

  async updateCase(cmd: UpdateStateCase): Promise<Operation> {
    const validatorDto: SchemaValidatorQuery = {
      tenantId: cmd.tenantId,
      schemaId: cmd.caseDynamicEntity.schemaId,
      fields: cmd.caseDynamicEntity.fields,
      id: cmd.workflowStateId
    };

    if (await this.schemaValidator.checkSchemaValidators(validatorDto)) {
      let operation = await this.httpClient.put<Operation>(`${this.BASE_URL(cmd.tenantId, cmd.schemaId)}/update-case`, cmd);
      operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
      return operation;
    }

    throw new Error(`Update Case action stopped`);
  }

  async updateStepsUi(cmd: UpdateCaseStepsUi): Promise<Operation> {
    let operation = await this.httpClient.put<Operation>(`${this.BASE_URL(cmd.tenantId, cmd.schemaId)}/update-visual-elements`, cmd);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async downloadAllDocuments(tenantId: string, id: string, schemaId: string): Promise<FileBlobData> {
    const options: IRequestOptionsForDownload = {
      responseType: 'arraybuffer',
      observe: 'response'
    };

    return this.httpClient
      .getFullResponse<any>(`${this.BASE_URL(tenantId, schemaId)}/${id}/downloadAllDocuments`, options)
      .then((res: AxiosResponse) => {
        const fileRes: FileBlobData = {
          data: res.data
        };

        const contentDisposition = res.headers['content-disposition'];
        if (contentDisposition) {
          fileRes.fileName = contentDisposition?.split(';')[1]?.split('filename')[1]?.split('=')[1].trim();
        }
        return fileRes;
      });
  }
}
