import { Inject, Injectable } from '@angular/core';
import {
  EmailAuditViewModel,
  RawDataEmailAuditViewModel,
  SearchEmailAuditsQuery
} from '@wfm/email-audit/email-audit/email-audit.view-models';
import { HttpClientService } from '.';
import { PagedData } from '../models';

@Injectable()
export class RawDataEmailAuditService {
  private BASE_URL = (tenantId) => `tenant/${tenantId}/rawdataemailaudits`;

  constructor(@Inject('HttpClientService') private httpClient: HttpClientService) {}

  async getIds(tenantId: string, rawDataId: string): Promise<string[]> {
    return await this.httpClient.get<string[]>(`${this.BASE_URL(tenantId)}/ids/${rawDataId}`);
  }

  // EmailAuditViewModel.content is received empty for smaller payload
  async getAllEmailAuditsByRawDataId(tenantId: string, rawDataId: string): Promise<EmailAuditViewModel[]> {
    return await this.httpClient.get<EmailAuditViewModel[]>(`${this.BASE_URL(tenantId)}/all/${rawDataId}`);
  }

  async searchEmailAudits(tenantId: string, query: SearchEmailAuditsQuery): Promise<PagedData<RawDataEmailAuditViewModel>> {
    return await this.httpClient.post<PagedData<RawDataEmailAuditViewModel>>(`${this.BASE_URL(tenantId)}/search`, query);
  }

  async getEmailAuditById(tenantId: string, emailAuditId: string): Promise<EmailAuditViewModel> {
    return await this.httpClient.get<EmailAuditViewModel>(`${this.BASE_URL(tenantId)}/${emailAuditId}`);
  }

  async getEmailAuditCount(tenantId: string, rawDataId: string): Promise<number> {
    return await this.httpClient.get<number>(`${this.BASE_URL(tenantId)}/count/${rawDataId}`);
  }

  async deleteEmailAudits(tenantId: string, rawDataId: string): Promise<void> {
    return await this.httpClient.delete(`${this.BASE_URL(tenantId)}/${rawDataId}`);
  }
}
