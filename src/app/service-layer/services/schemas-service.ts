/**
 * global
 */
import { Inject, Injectable } from '@angular/core';
import { AreaTypeEnum, IFilter } from '..';

/**
 * project
 */
import { PagedData, Paging, Sorting } from '../models/model';
import { Operation } from '../models/operation';
import {
  SchemaDto,
  SchemaFieldDto,
  UpdateSchemaCommand,
  ValidatSchemasRelation as ValidateSchemasRelationResponse,
  ValidationResponse
} from '../models/schema';

/**
 * local
 */
import { HttpClientService } from './application-http-client.service';
import { OperationService } from './operation.service';
import { SearchFieldModel } from '../models/dynamic-entity-models';
import { BaseFieldValueType } from '../models/FieldValueDto';

@Injectable()
export class SchemasService {
  BASE_URL = (tenantId) => `tenant/${tenantId}/schemas`;

  constructor(private operationsService: OperationService, @Inject('HttpClientService') private httpClient: HttpClientService) {}

  async create(cmd: SchemaDto): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL(cmd.tenantId)}`, cmd);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async update(cmd: UpdateSchemaCommand, tenantId: string, areaType: AreaTypeEnum): Promise<Operation> {
    let operation = await this.httpClient.put<Operation>(`${this.BASE_URL(tenantId)}/${areaType}/${cmd.id}`, cmd.newTemplate);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async search(
    tenantId: string,
    areaType: AreaTypeEnum,
    paging: Paging,
    sorting?: Sorting[],
    filters?: IFilter[]
  ): Promise<PagedData<SchemaDto>> {
    const params = this.httpClient.buildSearchParams(paging, sorting, filters);
    return this.httpClient.post<PagedData<SchemaDto>>(`${this.BASE_URL(tenantId)}/search/${areaType}`, params);
  }

  async getById(id: string, tenantId: string, areaType: AreaTypeEnum): Promise<SchemaDto> {
    return this.httpClient.get<SchemaDto>(`${this.BASE_URL(tenantId)}/${areaType.toString()}/${id}`);
  }

  async getSchemasByFieldId(tenantId: string, fieldId: string): Promise<SchemaDto[]> {
    return this.httpClient.get<SchemaDto[]>(`${this.BASE_URL(tenantId)}/byField/${fieldId}`);
  }

  async getSchemaFieldsByList(tenantId: string, listId: string): Promise<SchemaFieldDto[]> {
    return this.httpClient.get<SchemaFieldDto[]>(`${this.BASE_URL(tenantId)}/schemaFields/byList/${listId}`);
  }

  async getTenantFieldsByList(tenantId: string, listId: string): Promise<SchemaFieldDto[]> {
    return this.httpClient.get<SchemaFieldDto[]>(`${this.BASE_URL(tenantId)}/tenantFields/byList/${listId}`);
  }

  async deleteById(id: string, tenantId: string, areaType: AreaTypeEnum): Promise<Operation> {
    let operation = await this.httpClient.delete<Operation>(`${this.BASE_URL(tenantId)}/${areaType}/${id}`);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async exportAllDataCsv(
    tenantId: string,
    schemaId: string,
    total: number,
    filters: SearchFieldModel[],
    sortFields: Sorting[]
  ): Promise<string> {
    return await this.httpClient.post<string>(`${this.BASE_URL(tenantId)}/${schemaId}/export/csv`, {
      sorting: { sorting: sortFields || [] },
      paging: { skip: 0, take: total },
      filters: { filters: filters || [] }
    });
  }
  async checkSchemaValidators(
    tenantId: string,
    schemaId: string,
    dynamicEntityFields: BaseFieldValueType[],
    dynamicEntityId: string
  ): Promise<ValidationResponse[]> {
    return await this.httpClient.post<ValidationResponse[]>(`${this.BASE_URL(tenantId)}/schema/${schemaId}/validate`, {
      fields: dynamicEntityFields,
      dynamicEntityId
    });
  }

  async validateSchemasRelation(tenantId: string, parentSchemaId: string, childSchemaId: string): Promise<ValidateSchemasRelationResponse> {
    return await this.httpClient.post<ValidateSchemasRelationResponse>(
      `${this.BASE_URL(tenantId)}/parent-schema/${parentSchemaId}/${childSchemaId}/validate`,
      {}
    );
  }

  async deleteFieldsValuesFromEntities(tenantId: string, schemaId: string, schemaFieldIds: string[]): Promise<Operation> {
    let operation = await this.httpClient.delete<Operation>(
      `${this.BASE_URL(tenantId)}/${schemaId}/delete-fields-fromEntities`,
      null,
      schemaFieldIds
    );
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async getAllSchemas(tenantId: string, paging: Paging, sorting?: Sorting[], filters?: IFilter[]): Promise<PagedData<SchemaDto>> {
    const params = this.httpClient.buildSearchParams(paging, sorting, filters);
    return this.httpClient.post<PagedData<SchemaDto>>(`${this.BASE_URL(tenantId)}/search`, params);
  }
}
