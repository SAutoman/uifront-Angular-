/**
 * global
 */
import { Injectable, Inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';

/**
 * project
 */
import { SearchFieldModel } from '@wfm/service-layer/models/dynamic-entity-models';

import {
  User,
  Roles,
  UserSettingsDto,
  SettingsKeys,
  Paging,
  Sorting,
  PagedData,
  SearchParams,
  SortingDef,
  IFilter,
  RegisterUserCommand
} from '../models';

/**
 * local
 */
import { HttpClientService } from './application-http-client.service';
import { OperationService } from './operation.service';
import { Operation } from '../models/operation';
import { UserWithCompany } from '../models/mappings';

export interface SearchParamsUsersEx extends SearchParams {
  groupIds: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  BASE_URL = 'Users';

  private createUserUrl = (tenantId: string) => `${this.BASE_URL}/${tenantId}/create-user`;
  private deleteUserUrl = (tenantId: string, userId: string) => `${this.BASE_URL}/${tenantId}/delete-user/${userId}`;

  constructor(@Inject('HttpClientService') private httpClient: HttpClientService, private operationsService: OperationService) {}

  // async create(user: User): Promise<User> {
  //   let operation = await this.httpClient.post<Operation>(this.BASE_URL, { ...user, id: null });
  //   operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

  //   return this.getById(operation.targetId);
  // }

  async createUser(tenantId: string, user: User): Promise<User> {
    let operation = await this.httpClient.post<Operation>(this.createUserUrl(tenantId), { ...user, id: null });
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

    return this.getById(operation.targetId);
  }

  async register(tenant: string, user: RegisterUserCommand): Promise<User> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL}/${tenant}/register-user`, { ...user, id: null });
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

    return this.getById(operation.targetId);
  }

  async registerTestUser(tenant: string, cmd: RegisterUserCommand): Promise<User> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL}/${tenant}/register-user`, { ...cmd, id: null });
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

    return this.getById(operation.targetId);
  }

  async deactivateUser(tenant: string, userId: string): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL}/${tenant}/deactivate-user/${userId}`, null);
    return await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
  }
  async search(paging?: Paging, sorting?: Sorting[]): Promise<PagedData<User>> {
    // TODO: get based on state.paging (filter, sorting, page, limit)
    if (paging || sorting) {
      let httpParams = new HttpParams();

      if (paging) {
        httpParams = httpParams.append('skip', paging.skip.toString()).append('take', paging.take.toString());
      }

      if (sorting) {
        httpParams = httpParams.append('sorting', JSON.stringify(sorting));
      }

      return this.httpClient.get<PagedData<User>>(`${this.BASE_URL}/${httpParams.toString()}`);
    }

    return this.httpClient.get<PagedData<User>>(`${this.BASE_URL}`);
  }

  async getAll(paging?: Paging, sorting?: SortingDef): Promise<PagedData<User>> {
    return this.httpClient.post<PagedData<User>>(`${this.BASE_URL}/search`, { paging, sorting });
  }

  async searchByTenant(tenantId: string, paging?: Paging, sorting?: Sorting[], filters?: IFilter[]): Promise<PagedData<User>> {
    // tslint:disable-next-line: max-line-length
    return this.httpClient.post<PagedData<User>>(
      `${this.BASE_URL}/tenant/${tenantId}`,
      this.httpClient.buildSearchParams(paging, sorting, filters)
    );
  }

  /**
   *
   * @returns all the users of the provided groups (groupIds array sent in request body)
   */

  async searchByTenantGroupIds(
    tenantId: string,
    groupIds: string[],
    paging?: Paging,
    sorting?: Sorting[],
    filters?: SearchFieldModel[]
  ): Promise<PagedData<User>> {
    // tslint:disable-next-line: max-line-length
    const temp = this.httpClient.buildSearchParams(paging, sorting, filters) as SearchParamsUsersEx;
    temp.groupIds = groupIds;
    return this.httpClient.post<PagedData<User>>(`${this.BASE_URL}/tenant/${tenantId}/by-group-ids`, temp);
  }

  async getById(id: string): Promise<User> {
    return this.httpClient.get<User>(`${this.BASE_URL}/${id}`);
  }

  async getUserRoleById(tenantId: string, userId: string): Promise<Roles> {
    return this.httpClient.get<Roles>(`${this.BASE_URL}/${userId}/role/${tenantId}`);
  }

  async update(users: User): Promise<User> {
    let operation = await this.httpClient.put<Operation>(`${this.BASE_URL}/profile`, users);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

    return this.getById(operation.targetId);
  }

  // async deleteById(id: string): Promise<Operation> {
  //   let operation = await this.httpClient.delete<Operation>(`${this.BASE_URL}/${id}`);
  //   operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

  //   return operation;
  // }

  async deleteUserById(tenantId: string, userId: string): Promise<Operation> {
    let operation = await this.httpClient.delete<Operation>(this.deleteUserUrl(tenantId, userId));
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

    return operation;
  }

  async getUserSettings(tenantId: string, userId: string): Promise<UserSettingsDto> {
    return this.httpClient.get<UserSettingsDto>(`${this.BASE_URL}/${tenantId}/${userId}/user-settings`);
  }

  async getUserSettingById(tenantId: string, settingId: string): Promise<UserSettingsDto> {
    return this.httpClient.get<UserSettingsDto>(`${this.BASE_URL}/${tenantId}/${settingId}/user-setting`);
  }

  async getUserSettingsByKeys(tenantId: string, userId: string, cmd: SettingsKeys): Promise<UserSettingsDto> {
    return this.httpClient.post<UserSettingsDto>(`${this.BASE_URL}/${tenantId}/${userId}/user-settings`, cmd);
  }

  async createUserSettings(tenantId: string, cmd: UserSettingsDto): Promise<UserSettingsDto> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL}/${tenantId}/user-settings`, cmd);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

    return cmd;
  }

  async updateUserSettings(tenantId: string, cmd: UserSettingsDto): Promise<UserSettingsDto> {
    let operation = await this.httpClient.put<Operation>(`${this.BASE_URL}/${tenantId}/user-settings`, cmd);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

    return cmd;
  }

  async deleteUserSettings(tenantId: string, settingId: string): Promise<Operation> {
    let operation = await this.httpClient.delete<Operation>(`${this.BASE_URL}/${tenantId}/${settingId}/user-settings`);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

    return operation;
  }

  async getSupplierCompanies(tenantId: string): Promise<UserWithCompany[]> {
    return this.httpClient.get<UserWithCompany[]>(`${this.BASE_URL}/${tenantId}/suppliers/companies`);
  }

  async getTenantCompanies(tenantId: string): Promise<UserWithCompany[]> {
    return this.httpClient.get<UserWithCompany[]>(`${this.BASE_URL}/${tenantId}/tenants/companies`);
  }

  async getAuditorCompanies(tenantId: string): Promise<UserWithCompany[]> {
    return this.httpClient.get<UserWithCompany[]>(`${this.BASE_URL}/${tenantId}/auditors/companies`);
  }

  async getUsersOfTenantFromCompany(tenantId: string, companyId: string): Promise<User[]> {
    return this.httpClient.get<User[]>(`${this.BASE_URL}/tenant/${tenantId}/companies/${companyId}/users`);
  }

  async updateUserCompany(tenantId: string, companyId: string, userId: string): Promise<Operation> {
    let operation = await this.httpClient.patch<Operation>(`${this.BASE_URL}/update-company?tenantId=${tenantId}`, {
      userId: userId,
      companyId: companyId
    });
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }
}
