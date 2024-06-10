import { Injectable } from '@angular/core';

/**
 * global
 */
import { Inject } from '@angular/core';

/**
 * project
 */
import { CreateFieldLinkDto, FieldLinkDto, FieldLinkRules } from '@wfm/tenant-admin/workflows/workflow-field-link/field-link.model';

/**
 * local
 */
import { OperationService } from '..';
import { Operation } from '../models';
import { HttpClientService } from './application-http-client.service';
@Injectable()
export class CaseFieldLinkService {
  BASE_URL = (tenantId) => `CaseFieldLinks/tenant/${tenantId}`;

  constructor(@Inject('HttpClientService') private httpClient: HttpClientService, private operationsService: OperationService) {}
  async create(cmd: CreateFieldLinkDto): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL(cmd.tenantId)}`, cmd);
    return await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
  }

  async update(cmd: FieldLinkDto): Promise<Operation> {
    let operation = await this.httpClient.put<Operation>(`${this.BASE_URL(cmd.tenantId)}/case-field-link/${cmd.id}`, cmd);
    return await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
  }

  async delete(tenantId: string, linkId: string): Promise<Operation> {
    let operation = await this.httpClient.delete<Operation>(`${this.BASE_URL(tenantId)}/case-field-link/${linkId}`);
    return await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
  }

  async getById(tenantId: string, linkId: string): Promise<FieldLinkDto> {
    let result = await this.httpClient.get<FieldLinkDto>(`${this.BASE_URL(tenantId)}/case-field-link/${linkId}`);
    return result;
  }

  async getLinks(tenantId: string, workflowId: string): Promise<FieldLinkDto[]> {
    let result = await this.httpClient.get<FieldLinkDto[]>(`${this.BASE_URL(tenantId)}/workflow-schema/${workflowId}`);
    return result;
  }

  async getActiveOverrides(tenantId: string, workflowId: string, caseId: string): Promise<FieldLinkRules[]> {
    let result = await this.httpClient.get<FieldLinkRules[]>(
      `${this.BASE_URL(tenantId)}/workflow-schema/${workflowId}/case/${caseId}/activated-overrides`
    );
    return result;
  }
}
