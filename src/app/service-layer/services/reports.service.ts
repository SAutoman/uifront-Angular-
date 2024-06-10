import { Inject, Injectable } from '@angular/core';
import { HttpClientService } from './application-http-client.service';
import { OperationService } from './operation.service';
import { DatasourceFieldsTree, GridReportQuery, ReportGridDataResult, ReportGroupedDataResult } from '@wfm/report/report-datasource.model';
import { SearchParams } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  BASE_URL = (tenantId) => `reports/tenant/${tenantId}`;

  constructor(private operationsService: OperationService, @Inject('HttpClientService') private httpClient: HttpClientService) {}

  async getWorkflowFields(workflowSchemaId: string, tenantId: string): Promise<DatasourceFieldsTree> {
    return await this.httpClient.get<DatasourceFieldsTree>(`${this.BASE_URL(tenantId)}/workflow-schema/${workflowSchemaId}/fieldsTree`);
  }

  async getReport(dto: GridReportQuery): Promise<ReportGridDataResult | ReportGroupedDataResult> {
    const payload = {
      paging: dto.paging,
      sorting: dto.sorting,
      filters: dto.filters
    };
    return await this.httpClient.post<ReportGridDataResult | ReportGroupedDataResult>(
      `${this.BASE_URL(dto.tenantId)}/data-source/${dto.datasourceId}/reportType/${dto.reportType}/fields`,
      payload
    );
  }

  async exportReportToCsv(dto: GridReportQuery): Promise<string> {
    const payload: SearchParams = {
      paging: dto.paging,
      sorting: dto.sorting,
      filters: dto.filters
    };

    return await this.httpClient.post<string>(
      `${this.BASE_URL(dto.tenantId)}/data-source/${dto.datasourceId}/reportType/${dto.reportType}/fields/export/csv`,
      payload
    );
  }
}
