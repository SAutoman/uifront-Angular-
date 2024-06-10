/**
 * global
 */
import { KeyValue } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

/**
 * project
 */
import { Operation } from '@wfm/service-layer/models';
import {
  CreateOrchestratorActionEntityDto,
  CreateOrchestratorEntityDto,
  OrchestratorActionEventTypesEnum,
  OrchestratorEntity,
  UpdateOrchestratorActionEntityDto,
  UpdateOrchestratorEntityDto
} from '../models/orchestrator';

/**
 * local
 */

import { HttpClientService } from './application-http-client.service';
import { OperationService } from './operation.service';

@Injectable()
export class OrchestratorsService {
  BASE_URL = `Orchestrators`;

  constructor(private operationsService: OperationService, @Inject('HttpClientService') private httpClient: HttpClientService) {}

  async create(cmd: CreateOrchestratorEntityDto): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL}`, cmd);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async update(cmd: UpdateOrchestratorEntityDto): Promise<Operation> {
    let operation = await this.httpClient.put<Operation>(`${this.BASE_URL}/${cmd.id}`, cmd);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async delete(id: string): Promise<Operation> {
    let operation = await this.httpClient.delete<Operation>(`${this.BASE_URL}/${id}`);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async get(id: string): Promise<OrchestratorEntity> {
    return this.httpClient.get<OrchestratorEntity>(`${this.BASE_URL}/${id}`);
  }

  async getAll(): Promise<OrchestratorEntity[]> {
    return this.httpClient.get<OrchestratorEntity[]>(`${this.BASE_URL}`);
  }

  async getOrchestratorActionEventTypes(): Promise<KeyValue<OrchestratorActionEventTypesEnum, string>[]> {
    return this.httpClient.get<KeyValue<OrchestratorActionEventTypesEnum, string>[]>(`${this.BASE_URL}/action-event-types`);
  }

  //orchestrator actions

  async addAction(id: string, cmd: CreateOrchestratorActionEntityDto): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL}/${id}/actions`, cmd);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async updateAction(cmd: UpdateOrchestratorActionEntityDto): Promise<Operation> {
    let operation = await this.httpClient.put<Operation>(`${this.BASE_URL}/actions/${cmd.id}`, cmd);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async bulkUpdateActions(id: string, cmd: UpdateOrchestratorActionEntityDto[]): Promise<Operation> {
    let operation = await this.httpClient.put<Operation>(`${this.BASE_URL}/${id}/actions/bulk-update`, cmd);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async deleteAction(id: string) {
    let operation = await this.httpClient.delete<Operation>(`${this.BASE_URL}/actions/${id}`);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }
}
