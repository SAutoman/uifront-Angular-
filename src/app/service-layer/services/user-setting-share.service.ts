import { Injectable, Inject } from '@angular/core';
import { OperationService } from './operation.service';
import { Operation } from '../models/operation';
import { UserSettingShare, UserSettingShareDtoGet } from '../models/UserSettingShare';
import { HttpClientService } from './application-http-client.service';
import { Settings } from '@wfm/service-layer';

export interface SettingsPerGroup {
  groupId: string;
  settings: Settings[];
}

@Injectable({
  providedIn: 'root'
})
export class UserSettingShareService {
  BASE_URL = 'UserSettingShare';

  constructor(@Inject('HttpClientService') private httpClient: HttpClientService, private operationsService: OperationService) {}

  async shareUserSetting(tenantId: string, cmd: UserSettingShare): Promise<UserSettingShare[]> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL}/${tenantId}/share-user-setting`, cmd);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    const sharedSettings = await this.getSharedUserSettings(tenantId, cmd.userId);

    return sharedSettings.map((settingItem) => {
      return <UserSettingShare>{
        groups: settingItem?.sharedWithGroups,
        users: settingItem?.sharedWithUsers?.map((x) => x.id),
        userSettingId: settingItem?.userSettingId,
        userId: cmd.userId
      };
    });
  }

  getSharedUserSettings(tenantId: string, userId: string): Promise<UserSettingShareDtoGet[]> {
    return this.httpClient.get<UserSettingShareDtoGet[]>(`${this.BASE_URL}/${tenantId}/${userId}/get-user-shared-settings`);
  }

  async deleteSharedUserSetting(tenantId: string, shareId: string): Promise<Operation> {
    let operation = await this.httpClient.delete<Operation>(`${this.BASE_URL}/${tenantId}/${shareId}/delete-user-shared-setting`);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

    return operation;
  }

  getUserSettingSharesByUserSettingId(tenantId: string, userId: string, settingId: string): Promise<UserSettingShareDtoGet> {
    return this.httpClient.get<UserSettingShareDtoGet>(
      `${this.BASE_URL}/${tenantId}/${userId}/${settingId}/get-user-shares-setting-by-setting-id`
    );
  }

  async deleteUserSharedSetting(tenantId: string, cmd: UserSettingShare): Promise<UserSettingShare> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL}/${tenantId}/delete-users-shared-setting`, cmd);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

    return Promise.resolve(cmd);
  }

  async getSettingsPerGroup(tenantId: string, groupId: string): Promise<SettingsPerGroup> {
    const data = await this.httpClient.get<Settings[]>(`${this.BASE_URL}/${tenantId}/user-group/${groupId}`);
    return {
      groupId: groupId,
      settings: data
    };
  }
}
