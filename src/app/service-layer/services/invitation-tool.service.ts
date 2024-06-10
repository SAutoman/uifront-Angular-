/**
 * global
 */
import { Injectable, Inject } from '@angular/core';

/**
 * project
 */
import { Paging, Sorting, PagedData } from '../models/model';
import { CreateInvitationDto, Invitation } from '../models/Invitation';
import { SearchFieldModel } from '@wfm/service-layer/models/dynamic-entity-models';

/**
 * local
 */
import { HttpClientService } from './application-http-client.service';
import { OperationService } from './operation.service';
import { Operation } from '../models/operation';

@Injectable({
  providedIn: 'root'
})
export class InvitationToolService {
  BASE_URL = 'admin/invitation';
  constructor(@Inject('HttpClientService') private httpClient: HttpClientService, private operationsService: OperationService) {}

  async sendInvitation(tenantId: string, request: CreateInvitationDto): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL}/${tenantId}/send-registration-invitation`, request);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

    return operation;
  }

  searchByTenant(tenantId: string, paging?: Paging, sorting?: Sorting[], filters?: SearchFieldModel[]): Promise<PagedData<Invitation>> {
    // tslint:disable-next-line: max-line-length
    return this.httpClient.post<PagedData<Invitation>>(
      `${this.BASE_URL}/tenant/${tenantId}`,
      this.httpClient.buildSearchParams(paging, sorting, filters)
    );
  }

  getAllInvitations(paging?: Paging, sorting?: Sorting[], filters?: SearchFieldModel[]): Promise<PagedData<Invitation>> {
    return this.httpClient.post<PagedData<Invitation>>(
      `${this.BASE_URL}/getallinvitations`,
      this.httpClient.buildSearchParams(paging, sorting, filters)
    );
  }

  async getById(invitationId: string): Promise<Invitation> {
    return this.httpClient.get<Invitation>(`${this.BASE_URL}/${invitationId}`);
  }

  async deleteById(id: string): Promise<Operation> {
    let operation = await this.httpClient.delete<Operation>(`${this.BASE_URL}/${id}`);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

    return operation;
  }

  async deactivate(invitationSettingId: string, tenantId: string): Promise<Operation> {
    let operation = await this.httpClient.patch<Operation>(
      `${this.BASE_URL}/tenant/${tenantId}/settings/${invitationSettingId}/deactivate`,
      null
    );
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

    return operation;
  }
}
