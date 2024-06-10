/**
 * global
 */
import { Injectable, Inject } from '@angular/core';
import { SearchFieldModel } from '@wfm/service-layer/models/dynamic-entity-models';

/**
 * project
 */
import { PagedData, Paging, Sorting, WfmApplication } from '../models';
import { Operation } from '../models/operation';

/**
 * local
 */
import { HttpClientService } from './application-http-client.service';
import { OperationService } from './operation.service';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  BASE_URL = 'admin/apps';

  constructor(@Inject('HttpClientService') private httpClient: HttpClientService, private operationsService: OperationService) {}

  async create(application: WfmApplication): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL}`, { ...application, id: null });
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  getById(id: string): Promise<WfmApplication> {
    return this.httpClient.get<WfmApplication>(`${this.BASE_URL}/${id}`);
  }

  search(paging?: Paging, sorting?: Sorting[], filters?: SearchFieldModel[]): Promise<PagedData<WfmApplication>> {
    return this.httpClient.post<PagedData<WfmApplication>>(
      `${this.BASE_URL}/search`,
      this.httpClient.buildSearchParams(paging, sorting, filters)
    );
  }

  async update(application: WfmApplication): Promise<Operation> {
    let operation = await this.httpClient.put<Operation>(`${this.BASE_URL}/${application.id}`, application);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

    return operation;
  }

  async deleteById(id: string): Promise<Operation> {
    let operation = await this.httpClient.delete<Operation>(`${this.BASE_URL}/${id}`);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }
}
