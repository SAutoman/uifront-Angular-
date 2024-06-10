import { Inject, Injectable } from '@angular/core';
import { HttpClientService } from './application-http-client.service';

@Injectable()
export class NotificationProcessingSessionService {
  private BASE_URL = (tenantId) => `tenant/${tenantId}/notificationprocessingsessions`;

  constructor(@Inject('HttpClientService') private httpClient: HttpClientService) {}

  async setActiveSessionsEndDate(tenantId: string): Promise<void> {
    return await this.httpClient.post(`${this.BASE_URL(tenantId)}/setactivesessionsenddate`, null);
  }

  async getSessionsByStartDate(tenantId: string): Promise<NotificationProcessingSessionDto[]> {
    return await this.httpClient.get<NotificationProcessingSessionDto[]>(`${this.BASE_URL(tenantId)}/bystartdate`, null);
  }

  async getSessionsByEndDate(tenantId: string): Promise<NotificationProcessingSessionDto[]> {
    return await this.httpClient.get<NotificationProcessingSessionDto[]>(`${this.BASE_URL(tenantId)}/byenddate`, null);
  }

  async getSessionsInProgress(tenantId: string): Promise<NotificationProcessingSessionDto[]> {
    return await this.httpClient.get<NotificationProcessingSessionDto[]>(`${this.BASE_URL(tenantId)}/inprogress`, null);
  }
}

export interface NotificationProcessingSessionDto {
  start: string;
  end?: string;
  error: string;
  records: NotificationTopicProcessingRecordDto[];
}

export interface NotificationTopicProcessingRecordDto {
  notificationTopicId: string;
  errors: string;
  start: string;
  end?: string;
}
