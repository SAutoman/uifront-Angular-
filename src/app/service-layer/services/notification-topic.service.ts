import { Inject, Injectable } from '@angular/core';
import { EnumConverter, IKeyValueView, KeyValueView } from '@wfm/common/models';
import { IFilter, Operation, PagedData, Paging, Roles, Sorting } from '../models';
import { HttpClientService } from './application-http-client.service';
import { OperationService } from './operation.service';

export enum TopicSendTypeEnum {
  Ui = 1,
  Email = 2
}

export enum TopicKindEnum {
  Unknown = 0,
  NewRawData = 1,
  Cases = 2,
  Invitations = 3,
  RawDataNotProcessed = 4,
  CasesNotProcessed = 5,
  OnCaseUpdate,
  OnCaseDelete,
  OnCaseStatusChange,
  OnStepAdd,
  OnStepUpdate,
  OnStepDelete,
  OnStepResolutionChange
}

export const TopicKindNameMap: {
  get: (type: TopicKindEnum) => IKeyValueView<string, TopicKindEnum>;
  has: (type: TopicKindEnum) => boolean;
} = (() => {
  const map = new Map<TopicKindEnum, IKeyValueView<string, TopicKindEnum>>();
  const converter = new EnumConverter(TopicKindEnum);

  const setItem = (type: TopicKindEnum, viewValue: string) => {
    const kv = converter.getKeyValue(type);
    map.set(kv.value, new KeyValueView(kv.key, kv.value, viewValue));
  };
  setItem(TopicKindEnum.Unknown, 'Unknown');
  setItem(TopicKindEnum.NewRawData, 'New RawData');
  setItem(TopicKindEnum.Cases, 'New Case');

  setItem(TopicKindEnum.Invitations, 'Invitations');
  setItem(TopicKindEnum.RawDataNotProcessed, 'RawData Not Processed');
  setItem(TopicKindEnum.CasesNotProcessed, 'Cases Not Processed');

  setItem(TopicKindEnum.OnCaseUpdate, 'On Case Update');
  setItem(TopicKindEnum.OnCaseDelete, 'On Case Delete');
  setItem(TopicKindEnum.OnCaseStatusChange, 'On Case Status Change');

  setItem(TopicKindEnum.OnStepAdd, 'On Step Add');
  setItem(TopicKindEnum.OnStepUpdate, 'On Step Update');
  setItem(TopicKindEnum.OnStepDelete, 'On Step Delete');
  setItem(TopicKindEnum.OnStepResolutionChange, 'On Step Resolution Change');

  const has = (type: TopicKindEnum) => {
    const kv = converter.getKeyValue(type);
    if (!kv) {
      return false;
    }
    return map.has(kv.value);
  };
  const getKv = (type: TopicKindEnum) => {
    if (!has(type)) {
      return { ...map.get(TopicKindEnum.Unknown) };
    }
    const kv = converter.getKeyValue(type);
    return { ...map.get(kv.value) };
  };

  return {
    get: getKv,
    has
  };
})();

export enum TopicType {
  RawData = 1,
  CaseProcess = 2,
  Invitations = 3
}

export interface CreateUpdateNotificationTopicCommand {
  topicKind: TopicKindEnum;
  topicSendType: TopicSendTypeEnum;
  name: string;
  description: string;
  subject: string;
  topicTemplateId: string;
  roles?: Roles[];
  userGroups?: string[];
  days?: number;
  id?: string;
}

export interface SearchNotificationTopicQuery {
  paging?: Paging;
  sorting?: Sorting[];
  filters?: IFilter[];
  projection?: {
    propertyNames: string[];
  };
}

export interface NotificationTopicDto extends CreateUpdateNotificationTopicCommand {
  id: string;
}

@Injectable()
export class NotificationTopicService {
  private BASE_URL = (tenantId) => `tenant/${tenantId}/NotificationTopic`;

  constructor(private operationsService: OperationService, @Inject('HttpClientService') private httpClient: HttpClientService) {}

  async create(tenantId: string, command: CreateUpdateNotificationTopicCommand): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL(tenantId)}`, command);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async delete(tenantId: string, id: string): Promise<Operation> {
    let operation = await this.httpClient.delete<Operation>(`${this.BASE_URL(tenantId)}/${id}`);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async get(tenantId: string, id: string): Promise<NotificationTopicDto> {
    return this.httpClient.get<NotificationTopicDto>(`${this.BASE_URL(tenantId)}/${id}`);
  }

  async getByName(tenantId: string, name: string): Promise<NotificationTopicDto> {
    return await this.httpClient.get<NotificationTopicDto>(`${this.BASE_URL(tenantId)}/getByName/${name}`);
  }

  async update(tenantId: string, id: string, command: CreateUpdateNotificationTopicCommand): Promise<Operation> {
    let operation = await this.httpClient.put<Operation>(`${this.BASE_URL(tenantId)}/${id}`, command);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async search(tenantId: string, query: SearchNotificationTopicQuery): Promise<PagedData<NotificationTopicDto>> {
    return await this.httpClient.post<PagedData<NotificationTopicDto>>(`${this.BASE_URL(tenantId)}/search`, query);
  }
}
