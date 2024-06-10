import { Inject, Injectable } from '@angular/core';
import { EmailAuditListPageViewModel } from '@wfm/email-audit/email-audit/email-audit.view-models';
import { Operation } from '../models';
import { IFilter } from '../models/i-filter';
import { PagedData, Paging, Sorting } from '../models/model';
import { HttpClientService } from './application-http-client.service';
import { OperationService } from './operation.service';

@Injectable()
export class EmailAuditService {
  private BASE_URL = (tenantId) => `tenant/${tenantId}/emailaudits`;

  constructor(@Inject('HttpClientService') private httpClient: HttpClientService, private operationsService: OperationService) {}

  async search(
    tenantId: string,
    paging?: Paging,
    sorting?: Sorting[],
    filters?: IFilter[]
  ): Promise<PagedData<EmailAuditListPageViewModel>> {
    const searchParams = this.httpClient.buildSearchParams(paging, sorting, filters);

    const result = await this.httpClient.post<PagedData<EmailAuditListPageViewModel>>(`${this.BASE_URL(tenantId)}/search`, searchParams);

    let finalData = {
      ...result,
      items: result.items
    };
    return finalData;
  }

  async deleteAllOlderThan(dateTimeSince: string): Promise<Operation> {
    let operation = await this.httpClient.delete<Operation>(`emailaudits/deleteallolderthan?dateTimeSince=${dateTimeSince}`);
    return await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
  }
}
