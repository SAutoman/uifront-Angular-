/**
 * global
 */
import { Injectable, Inject } from '@angular/core';

/**
 * project
 */
import {
  UserGroupsDto,
  UserGroupUpdateDto,
  GroupUsers,
  SystemUserGroupDto,
  UserGroupCreateDto,
  PagedData,
  Paging,
  Sorting,
  UserAndSystemGroupsDto
} from '../models';

import { SearchFieldModel } from '@wfm/service-layer/models/dynamic-entity-models';

/**
 * local
 */
import { HttpClientService } from './application-http-client.service';
import { OperationService } from './operation.service';
import { Operation } from '../models/operation';

@Injectable({
  providedIn: 'root'
})
export class UserGroupsService {
  BASE_URL = 'UserGroup';

  constructor(@Inject('HttpClientService') private httpClient: HttpClientService, private operationsService: OperationService) {}

  async createUserGroup(tenantId: string, cmd: UserGroupCreateDto): Promise<UserGroupsDto> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL}/${tenantId}/create-user-group`, cmd);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

    const result = await this.getUserGroupById(tenantId, operation.targetId);
    return <UserGroupsDto>{ name: result.name, ownerUserId: result.ownerUserId, users: result.users, id: operation.targetId };
  }

  getUserGroups(tenantId: string, paging?: Paging, sorting?: Sorting[], filters?: SearchFieldModel[]): Promise<PagedData<UserGroupsDto>> {
    // tslint:disable-next-line: max-line-length
    return this.httpClient.post<PagedData<UserGroupsDto>>(
      `${this.BASE_URL}/${tenantId}/get-user-groups`,
      this.httpClient.buildSearchParams(paging, sorting, filters)
    );
  }

  getUserGroupById(tenantId: string, groupId: string): Promise<GroupUsers> {
    return this.httpClient.get<GroupUsers>(`${this.BASE_URL}/${tenantId}/${groupId}/get-user-group`);
  }

  async deleteUserGroup(tenantId: string, groupId: string): Promise<Operation> {
    let operation = await this.httpClient.delete<Operation>(`${this.BASE_URL}/${tenantId}/${groupId}/delete-group`);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

    return operation;
  }

  async updateUserGroup(tenantId: string, groupId: string, cmd: UserGroupUpdateDto): Promise<UserGroupUpdateDto> {
    let operation = await this.httpClient.put<Operation>(`${this.BASE_URL}/${tenantId}/${groupId}/update-user-group`, cmd);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

    return cmd;
  }

  getSystemUserGroups(tenantId: string): Promise<SystemUserGroupDto[]> {
    return this.httpClient.get<SystemUserGroupDto[]>(`${this.BASE_URL}/${tenantId}/get-user-system-groups`);
  }

  getAllUserAndSystemGroups(tenantId: string): Promise<UserAndSystemGroupsDto[]> {
    return this.httpClient.get<UserAndSystemGroupsDto[]>(`${this.BASE_URL}/${tenantId}/get-user-groups-list`);
  }

  getUserGroupsWithSystemPaginated(
    tenantId: string,
    paging?: Paging,
    sorting?: Sorting[],
    filters?: SearchFieldModel[]
  ): Promise<PagedData<UserAndSystemGroupsDto>> {
    return this.httpClient.post<PagedData<UserAndSystemGroupsDto>>(
      `${this.BASE_URL}/${tenantId}/get-user-groups-with-system`,
      this.httpClient.buildSearchParams(paging, sorting, filters)
    );
  }

  /**
   *
   * @returns all the groups where the subject user is an owner
   */
  getUserGroupsByOwner(tenantId: string, userId: string, paging?: Paging): Promise<PagedData<UserGroupsDto>> {
    // tslint:disable-next-line: max-line-length
    return this.httpClient.post<PagedData<UserGroupsDto>>(
      `${this.BASE_URL}/${tenantId}/${userId}/get-user-groups-by-owner`,
      this.httpClient.buildSearchParams(paging)
    );
  }

  /**
   *
   * @returns all the groups where the subject user is a member
   */

  getUserGroupsByUserIn(
    tenantId: string,
    userId: string,
    paging?: Paging,
    sorting?: Sorting[],
    filters?: SearchFieldModel[]
  ): Promise<PagedData<UserGroupsDto>> {
    return this.httpClient.post<PagedData<UserGroupsDto>>(
      `${this.BASE_URL}/${tenantId}/${userId}/get-user-groups-by-user-in`,
      this.httpClient.buildSearchParams(paging, sorting, filters)
    );
  }
}
