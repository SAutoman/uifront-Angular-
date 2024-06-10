/**
 * global
 */
import { Inject, Injectable } from '@angular/core';

/**
 * project
 */
import { Operation } from '@wfm/service-layer/models';
import { HttpClientService } from './application-http-client.service';
import { OperationService } from './operation.service';

@Injectable()
export class DataSeedService {
  BASE_URL = (tenantId) => `tenant/${tenantId}/DataSeed`;
  constructor(private operationsService: OperationService, @Inject('HttpClientService') private httpClient: HttpClientService) {}

  async deleteAllData(tenantId: string): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL(tenantId)}/delete-all`, {});
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }
}
