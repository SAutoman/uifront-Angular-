/**
 * global
 */
import {
  CreateTenantSettings,
  IFilter,
  Operation,
  PagedData,
  Paging,
  RemoveTenantSettingsCommand,
  Settings,
  Sorting,
  TenantSettingsDto
} from '../models';
import { Injectable, Inject } from '@angular/core';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

/**
 * project
 */

/**
 * local
 */
import { HttpClientService } from './application-http-client.service';
import { OperationService } from './operation.service';

@Injectable({
  providedIn: 'root'
})
export class TenantSettingsService {
  BASE_URL = (tenantId) => `tenant/${tenantId}/tenantSettings`;
  constructor(@Inject('HttpClientService') private httpClient: HttpClientService, private operationsService: OperationService) {}

  async create(cmd: CreateTenantSettings): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL(cmd.tenantId)}/create`, cmd);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

    return operation;
  }

  async update(cmd: TenantSettingsDto): Promise<Operation> {
    let operation = await this.httpClient.put<Operation>(`${this.BASE_URL(cmd.tenantId)}/update`, cmd);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

    return operation;
  }

  async delete(tenantId: string, id: string): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL(tenantId)}/delete/${id}`, <RemoveTenantSettingsCommand>{
      publicId: id,
      tenantId
    });
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

    return operation;
  }

  async getByTenant(tenantId: string): Promise<TenantSettingsDto> {
    let result = await this.httpClient.get<TenantSettingsDto>(`${this.BASE_URL(tenantId)}/byTenant`);
    return result;
  }

  async getById(tenantId: string, id: string): Promise<Settings> {
    let result = await this.httpClient.get<Settings>(`${this.BASE_URL(tenantId)}/byId/${id}`);
    return result;
  }

  async getByTenantAndKey(tenant: string, key: string): Promise<Settings> {
    let result = await this.httpClient.get<Settings>(`${this.BASE_URL(tenant)}/byTenantAndKey/${key}`);
    return result;
  }

  async search(tenantId: string, paging: Paging, sorting?: Sorting[], filters?: IFilter[]): Promise<PagedData<Settings>> {
    const params = this.httpClient.buildSearchParams(paging, sorting, filters);
    return this.httpClient.post<PagedData<Settings>>(`${this.BASE_URL(tenantId)}/search`, params);
  }

  /**
   *@returns TenantSettingsDto.id
   */
  updateTenantSettings$(cmd: TenantSettingsDto, delay = 300): Observable<Operation> {
    return of(true).pipe(
      switchMap(() => {
        return from(this.httpClient.put<Operation>(`${this.BASE_URL(cmd.tenantId)}/update`, cmd));
      }),
      switchMap((task) => this.operationsService.waitTask(task.id, delay)),
      take(1)
    );
  }
}
