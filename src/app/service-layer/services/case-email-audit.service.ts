import { Inject, Injectable } from '@angular/core';
import { CaseEmailAuditViewModel, EmailAuditViewModel, SearchEmailAuditsQuery } from '@wfm/email-audit/email-audit/email-audit.view-models';
import { HttpClientService } from '.';
import { PagedData } from '../models';

@Injectable()
export class CaseEmailAuditService {
  private BASE_URL = (tenantId) => `tenant/${tenantId}/casesemailaudits`;

  constructor(@Inject('HttpClientService') private httpClient: HttpClientService) {}

  async getIds(tenantId: string, caseId: string): Promise<string[]> {
    return await this.httpClient.get<string[]>(`${this.BASE_URL(tenantId)}/ids/${caseId}`);
  }

  // EmailAuditViewModel.content is received empty for smaller payload
  async getAllEmailAuditsByCaseId(tenantId: string, caseId: string): Promise<EmailAuditViewModel[]> {
    return await this.httpClient.get<EmailAuditViewModel[]>(`${this.BASE_URL(tenantId)}/all/${caseId}`);
  }

  async searchEmailAudits(tenantId: string, query: SearchEmailAuditsQuery): Promise<PagedData<CaseEmailAuditViewModel>> {
    return await this.httpClient.post<PagedData<CaseEmailAuditViewModel>>(`${this.BASE_URL(tenantId)}/search`, query);
  }

  async getEmailAuditById(tenantId: string, emailAuditId: string): Promise<EmailAuditViewModel> {
    return await this.httpClient.get<EmailAuditViewModel>(`${this.BASE_URL(tenantId)}/${emailAuditId}`);
  }

  async getEmailAuditCount(tenantId: string, caseId: string): Promise<number> {
    return await this.httpClient.get<number>(`${this.BASE_URL(tenantId)}/count/${caseId}`);
  }

  async deleteEmailAudits(tenantId: string, caseId: string): Promise<void> {
    return await this.httpClient.delete(`${this.BASE_URL(tenantId)}/${caseId}`);
  }
}
