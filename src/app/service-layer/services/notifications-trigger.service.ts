import { Inject, Injectable } from '@angular/core';
import { Operation } from '../models/operation';
import { HttpClientService } from './application-http-client.service';
import { OperationService } from './operation.service';

@Injectable()
export class NotificationsTriggerService {
  BASE_URL = (tenantId) => `tenant/${tenantId}/NotificationsTrigger`;

  constructor(private operationsService: OperationService, @Inject('HttpClientService') private httpClient: HttpClientService) {}

  async triggerSendingNotifications(tenantId: string): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL(tenantId)}`, {});
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async triggerSendingNotificationsByTopic(tenantId: string, topicId: string): Promise<void> {
    await this.httpClient.post<Operation>(`${this.BASE_URL(tenantId)}/triggerByTopic/${topicId}`, {});
  }
}
