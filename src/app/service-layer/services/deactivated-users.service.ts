import { Inject, Injectable } from '@angular/core';
import { DeactivatedUser, Operation, PagedData } from '../models';
import { HttpClientService } from './application-http-client.service';
import { OperationService } from './operation.service';

@Injectable()
export class DeactivatedUsersService {
  private BASE_URL = (tenantId) => `tenant/${tenantId}/deactivatedusers`;

  constructor(@Inject('HttpClientService') private httpClient: HttpClientService, private operationsService: OperationService) {}

  async getDeactivatedUsers(tenantId: string, skip?: number, take?: number): Promise<PagedData<DeactivatedUser>> {
    return await this.httpClient.get<PagedData<DeactivatedUser>>(`${this.BASE_URL(tenantId)}?skip=${skip || 0}&take=${take || 50}`);
  }

  async reactivateDeactivatedUser(tenantId: string, userId: string): Promise<Operation> {
    const operation = await this.httpClient.post<Operation>(`${this.BASE_URL(tenantId)}/reactivate/${userId}`, null);
    return await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
  }

  async deleteDeactivatedUser(tenantId: string, userId: string): Promise<Operation> {
    const operation = await this.httpClient.delete<Operation>(`${this.BASE_URL(tenantId)}/${userId}`);
    return await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
  }
}
