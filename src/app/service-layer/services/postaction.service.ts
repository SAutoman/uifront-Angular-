import { Inject, Injectable } from '@angular/core';
import { EventTypes } from '../models/actionDto';
import { HttpClientService } from './application-http-client.service';

export enum StorageType {
  Unknown = 0,
  Workflow,
  ProcessStep
}

export enum PostActionStatusEnum {
  InProgress,
  Failure,
  Success
}

export interface PostActionData {
  name: string;
  actionType: EventTypes;
  operationId: string;
  status: PostActionStatusEnum;
  additionData?: string; // json strigified postactionDto
  id: string;
  createdAt: Date;
  updatedAt: Date;
  storageType: StorageType;
  parameters: string;
  // Json Parsed "parameters" prop
  parametersUi: {
    workflowStateId: string;
    tenantId: string;
    processStepEntityId: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PostactionService {
  private BASE_URL = `postactions`;

  constructor(@Inject('HttpClientService') private httpClient: HttpClientService) {}

  async getFiredPostactions(operationId: string): Promise<PostActionData[]> {
    return this.httpClient.get<PostActionData[]>(`${this.BASE_URL}/operation/${operationId}`);
  }
}
