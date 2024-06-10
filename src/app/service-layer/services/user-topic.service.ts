import { Inject, Injectable } from '@angular/core';
import { UserSubscription } from '@wfm/store/users/users.reducer';
import { Operation } from '../models/operation';
import { SubscribeUserToTopic, UnsubscribeUserFromTopicCommand, UserTopicDto } from '../models/usertopic';
import { HttpClientService } from './application-http-client.service';
import { OperationService } from './operation.service';

@Injectable()
export class UserTopicService {
  private BASE_URL = (tenantId) => `tenant/${tenantId}/UserTopic`;

  constructor(private operationsService: OperationService, @Inject('HttpClientService') private httpClient: HttpClientService) {}

  async subscribe(command: SubscribeUserToTopic): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL(command.tenantId)}`, command);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async unsubscribe(command: UnsubscribeUserFromTopicCommand): Promise<Operation> {
    let operation = await this.httpClient.delete<Operation>(
      `${this.BASE_URL(command.tenantId)}/${command.notificationTopicId}/${command.userId}`
    );
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async getSubscription(tenantId: string, userId: string, topicId: string): Promise<UserTopicDto> {
    return await this.httpClient.get<UserTopicDto>(`${this.BASE_URL(tenantId)}/subscription/${topicId}/${userId}`);
  }

  async getAllSubscriptions(tenantId: string): Promise<UserSubscription[]> {
    return await this.httpClient.get<UserSubscription[]>(`${this.BASE_URL(tenantId)}`);
  }
}
