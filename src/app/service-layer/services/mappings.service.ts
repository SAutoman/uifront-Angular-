/**
 * global
 */
import { Injectable, Inject } from '@angular/core';

/**
 * project
 */
import { Paging, Sorting, PagedData, IFilter, AreaTypeEnum } from '../models';

/**
 * local
 */
import { HttpClientService } from './application-http-client.service';
import { OperationService } from './operation.service';
import { Operation } from '../models/operation';
import { CreateMappingDto, EditMappingDto, MappingDto } from '../models/mappings';

@Injectable({
  providedIn: 'root'
})
export class MappingsService {
  BASE_URL = (tenantId) => `tenant/${tenantId}/mappings`;

  constructor(@Inject('HttpClientService') private httpClient: HttpClientService, private operationsService: OperationService) {}

  async deleteSupplier(tenantId: string, id: string): Promise<Operation> {
    let operation = await this.httpClient.delete<Operation>(`${this.BASE_URL(tenantId)}/suppliers/delete/${id}`);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async deleteAuditor(tenantId: string, id: string): Promise<Operation> {
    let operation = await this.httpClient.delete<Operation>(`${this.BASE_URL(tenantId)}/auditors/delete/${id}`);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async createSupplier(tenantId: string, supplier: CreateMappingDto): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL(tenantId)}/suppliers`, supplier);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

    return operation;
  }

  async createAuditor(tenantId: string, auditorDto: CreateMappingDto): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL(tenantId)}/auditors`, auditorDto);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

    return operation;
  }

  async getSupplierById(tenantId: string, id: string): Promise<MappingDto> {
    return this.httpClient.get<MappingDto>(`${this.BASE_URL(tenantId)}/suppliers/${id}`);
  }

  async getAuditorById(tenantId: string, id: string): Promise<MappingDto> {
    return this.httpClient.get<MappingDto>(`${this.BASE_URL(tenantId)}/auditors/${id}`);
  }

  async editSupplier(tenantId: string, supplier: EditMappingDto): Promise<Operation> {
    let operation = await this.httpClient.put<Operation>(`${this.BASE_URL(tenantId)}/suppliers/edit`, supplier);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

    return operation;
  }

  async editAuditor(tenantId: string, auditor: EditMappingDto): Promise<Operation> {
    let operation = await this.httpClient.put<Operation>(`${this.BASE_URL(tenantId)}/auditors/edit`, auditor);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

    return operation;
  }

  async getSuppliers(tenantId: string, paging?: Paging, sorting?: Sorting[], filters?: IFilter[]): Promise<PagedData<MappingDto>> {
    return this.httpClient.post<PagedData<MappingDto>>(
      `${this.BASE_URL(tenantId)}/suppliers/all`,
      this.httpClient.buildSearchParams(paging, sorting, filters || null)
    );
  }

  async getAuditors(tenantId: string, paging?: Paging, sorting?: Sorting[], filters?: IFilter[]): Promise<PagedData<MappingDto>> {
    return this.httpClient.post<PagedData<MappingDto>>(
      `${this.BASE_URL(tenantId)}/auditors/all`,
      this.httpClient.buildSearchParams(paging, sorting, filters || null)
    );
  }

  async getSuppliersByCompanyId(tenantId: string, companyId: string, paging?: Paging, sorting?: Sorting[]): Promise<PagedData<MappingDto>> {
    return this.httpClient.post<PagedData<MappingDto>>(
      `${this.BASE_URL(tenantId)}/suppliers/byCompanyId/${companyId}`,
      this.httpClient.buildSearchParams(paging, sorting, null)
    );
  }

  async getAuditorsByCompanyId(tenantId: string, companyId: string, paging?: Paging, sorting?: Sorting[]): Promise<PagedData<MappingDto>> {
    return this.httpClient.post<PagedData<MappingDto>>(
      `${this.BASE_URL(tenantId)}/auditors/byCompanyId/${companyId}`,
      this.httpClient.buildSearchParams(paging, sorting, null)
    );
  }

  async reapplyAllMappingsSuppliers(tenantId: string, areaType: AreaTypeEnum): Promise<Operation> {
    const result = await this.httpClient.post<Operation>(`${this.BASE_URL(tenantId)}/suppliers/area-type/${areaType}/reapply-all`, null);
    const operation = await this.operationsService.waitForSuccessfullOperationAsync(result.id);
    return operation;
  }

  async reapplyAllMappingAuditors(tenantId: string, areaType: AreaTypeEnum): Promise<Operation> {
    const result = await this.httpClient.post<Operation>(`${this.BASE_URL(tenantId)}/auditors/area-type/${areaType}/reapply-all`, null);
    const operation = await this.operationsService.waitForSuccessfullOperationAsync(result.id);
    return operation;
  }

  async getTenantsWithCompanyMappingForSupplier(companyId: string): Promise<{ tenantsCount: number }> {
    return this.httpClient.get<{ tenantsCount: number }>(`mappings/company/${companyId}/suppliers-tenants`);
  }

  async getTenantsWithCompanyMappingForAuditors(companyId: string): Promise<{ tenantsCount: number }> {
    return this.httpClient.get<{ tenantsCount: number }>(`mappings/company/${companyId}/auditors-tenants`);
  }
}
