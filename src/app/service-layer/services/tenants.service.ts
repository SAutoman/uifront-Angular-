/**
 * global
 */
import { Injectable, Inject } from '@angular/core';

/**
 * project
 */
import { Paging, Sorting, PagedData, Tenant, CreateTenantModel, IFilter, CopyTenantSettingsModel } from '../models';
import { Operation } from '../models/operation';

/**
 * local
 */
import { HttpClientService } from './application-http-client.service';
import { OperationService } from './operation.service';

@Injectable({
  providedIn: 'root'
})
export class TenantsService {
  BASE_URL = 'admin/';

  constructor(@Inject('HttpClientService') private httpClient: HttpClientService, private operationsService: OperationService) {}

  async create(tenant: CreateTenantModel): Promise<Tenant> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL}tenants`, tenant);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return this.getById(operation.targetId);
  }

  async copySettingsFromTenant(copySettingsModel: CopyTenantSettingsModel): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(
      `${this.BASE_URL}tenants/copy-tenant-settings/${copySettingsModel.newTenantId}/${copySettingsModel.oldTenantId}`,
      {
        invitationTemplate: copySettingsModel.invitationTemplate
      }
    );
    return await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
  }

  search(paging?: Paging, sorting?: Sorting[], filters?: IFilter[]): Promise<PagedData<Tenant>> {
    // TODO: get based on state.paging (filter, sorting, page, limit)
    return this.httpClient.post<PagedData<Tenant>>(
      `${this.BASE_URL}tenants/search`,
      this.httpClient.buildSearchParams(paging, sorting, filters)
    );
  }

  getById(id: string): Promise<Tenant> {
    return this.httpClient.get<Tenant>(`${this.BASE_URL}tenants/${id}`);
  }

  async update(tenantData: Tenant): Promise<Tenant> {
    let operation = await this.httpClient.put<Operation>(`${this.BASE_URL}tenants/${tenantData.id}`, {
      name: tenantData.name,
      timeZone: tenantData.timeZone
    });
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return this.getById(tenantData.id);
  }

  async deleteById(id: string): Promise<Operation> {
    let operation = await this.httpClient.delete<Operation>(`${this.BASE_URL}tenants/${id}`);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  setInStorage(token: string, tenant: string): void {
    localStorage.setItem(token, tenant);
  }

  getFromStorage(token: string): string {
    return localStorage.getItem(token);
  }
}
