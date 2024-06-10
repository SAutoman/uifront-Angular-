import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Operation } from '../models';
import { HttpClientService } from './application-http-client.service';
import { NotificationTopicDto } from './notification-topic.service';
import { OperationService } from './operation.service';

@Injectable()
export class UnsubscribeEmailService {
  private BASE_URL = `UnsubscribeUserEmail`;

  constructor(private operationsService: OperationService, private http: HttpClient) {}

  async unsubscribeUserEmail(hash: string, email: string) {
    const operation = await this.http.post<Operation>(`${this.BASE_URL}/unsubscribe/${hash}`, { email }).toPromise();

    return await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
  }

  async generateHash(userId: string, topicId: string) {
    return await this.http.get<string>(`${this.BASE_URL}/generateHash/${userId}/${topicId}`).toPromise();
  }

  async getNotificationTopic(hash: string) {
    return await this.http.get<NotificationTopicDto>(`${this.BASE_URL}/notificationTopic/${hash}`).toPromise();
  }
}
