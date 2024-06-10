import { Inject, Injectable } from '@angular/core';
import {
  CreateNotificationTemplateCommand,
  DeleteNotificationTemplateCommand,
  GetNotificationTemplateQuery,
  SearchNotificationTemplatesQuery,
  NotificationTemplateDto,
  UpdateNotificationTemplateCommand
} from '../models/notificationTemplate';
import { HttpClientService } from './application-http-client.service';
import { OperationService } from './operation.service';
import { Operation, PagedData } from '@wfm/service-layer/models';

@Injectable()
export class NotificationTemplateService {
  private BASE_URL = (tenantId) => `tenant/${tenantId}/NotificationTemplate`;

  constructor(private operationsService: OperationService, @Inject('HttpClientService') private httpClient: HttpClientService) {}

  async create(command: CreateNotificationTemplateCommand): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL(command.tenantId)}`, command);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async createOrUpdate(command: CreateNotificationTemplateCommand): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL(command.tenantId)}/createorupdatebyname`, command);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async delete(command: DeleteNotificationTemplateCommand): Promise<Operation> {
    let operation = await this.httpClient.delete<Operation>(`${this.BASE_URL(command.tenantId)}/${command.id}`);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async get(query: GetNotificationTemplateQuery): Promise<NotificationTemplateDto> {
    return this.httpClient.get<NotificationTemplateDto>(`${this.BASE_URL(query.tenantId)}/${query.id}`);
  }

  async update(command: UpdateNotificationTemplateCommand): Promise<Operation> {
    let operation = await this.httpClient.put<Operation>(`${this.BASE_URL(command.tenantId)}/${command.id}`, command);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async search(tenantId: string, query: SearchNotificationTemplatesQuery): Promise<PagedData<NotificationTemplateDto>> {
    return await this.httpClient.post<PagedData<NotificationTemplateDto>>(`${this.BASE_URL(tenantId)}/search`, query);
  }
}
