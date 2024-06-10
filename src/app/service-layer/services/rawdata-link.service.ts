import { Inject, Injectable } from '@angular/core';
import { RawDataLinkDto } from '@wfm/tenant-admin/workflows/rawData-link/rawdata-link.model';
import { CreateFieldLinkDto } from '@wfm/tenant-admin/workflows/workflow-field-link/field-link.model';
import { DynamicEntityDto, GetWorkflowByRawDataQuery, Operation, RawDataRemoveFromCaseCheckDto } from '../models';
import { HttpClientService } from './application-http-client.service';
import { OperationService } from './operation.service';

export interface CasesForRawDataReference {
  cases: DynamicEntityDto[];
  workflowSchemaId: string;
  // comes like this from BE
  workflowSchemaName: string;
  caseSchemaId: string;
  isMatchingRules: boolean;
  failedOverrides?: FailedOverrides[];
}

export interface WorkflowOverviewDto {
  workflowSchemaId: string;
  name: string;
  caseSchemaId: string;
  isMatchingRules: boolean;
  failedOverrides?: FailedOverrides[];
}

export interface FailedOverrides {
  overrideName: string;
  ruleType: string;
  rule?: string;
}

export interface CanRemoveFromCasesDto {
  canDelete: string[];
}

export interface MinMaxValidationOnRemoveResponse {
  canDelete: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RawdataLinkService {
  BASE_URL = (tenantId) => `RawDataLinks/tenant/${tenantId}`;

  constructor(@Inject('HttpClientService') private httpClient: HttpClientService, private operationsService: OperationService) {}

  async create(cmd: CreateFieldLinkDto): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL(cmd.tenantId)}`, cmd);
    return await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
  }

  async update(cmd: RawDataLinkDto): Promise<Operation> {
    let operation = await this.httpClient.put<Operation>(`${this.BASE_URL(cmd.tenantId)}/raw-data-link/${cmd.id}`, cmd);
    return await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
  }

  async delete(tenantId: string, linkId: string): Promise<Operation> {
    let operation = await this.httpClient.delete<Operation>(`${this.BASE_URL(tenantId)}/raw-data-link/${linkId}`);
    return await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
  }

  async getById(tenantId: string, linkId: string): Promise<RawDataLinkDto> {
    let result = await this.httpClient.get<RawDataLinkDto>(`${this.BASE_URL(tenantId)}/raw-data-link/${linkId}`);
    return result;
  }

  async getLinks(tenantId: string, workflowId: string): Promise<RawDataLinkDto[]> {
    let result = await this.httpClient.get<RawDataLinkDto[]>(`${this.BASE_URL(tenantId)}/workflowschema/${workflowId}`);
    return result;
  }

  async checkRawDataAddToNewRules(data: GetWorkflowByRawDataQuery): Promise<WorkflowOverviewDto[]> {
    const cmd = {
      rawDataIds: data.rawDataIds,
      rawDataSchemaId: data.schemaId
    };
    return await this.httpClient.post<WorkflowOverviewDto[]>(`${this.BASE_URL(data.tenantId)}/validate-rawdata-in-new-case-creation`, cmd);
  }

  async checkRawDataAddToExistingCaseRules(data: GetWorkflowByRawDataQuery): Promise<CasesForRawDataReference[]> {
    const cmd = {
      rawDataIds: data.rawDataIds,
      rawDataSchemaId: data.schemaId
    };
    return await this.httpClient.post<CasesForRawDataReference[]>(
      `${this.BASE_URL(data.tenantId)}/validate-rawdata-in-existing-case-addition`,
      cmd
    );
  }

  async checkRulesForRawDataRemovalFromCase(data: RawDataRemoveFromCaseCheckDto, tenantId: string): Promise<CanRemoveFromCasesDto> {
    return await this.httpClient.post<CanRemoveFromCasesDto>(
      `${this.BASE_URL(tenantId)}/validate-rawdata-from-existing-case-deletion`,
      data
    );
  }

  async checkMinMaxValidationBeforeRemoval(
    data: RawDataRemoveFromCaseCheckDto,
    tenantId: string
  ): Promise<MinMaxValidationOnRemoveResponse> {
    return await this.httpClient.post<MinMaxValidationOnRemoveResponse>(
      `${this.BASE_URL(tenantId)}/validate-rawdata-from-existing-case-deletion/min-max`,
      data
    );
  }
}
