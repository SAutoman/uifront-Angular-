import { Inject, Injectable } from '@angular/core';
import { ExternalIntegrationResponse } from '@wfm/external-link-parser/external-link-parser';
import { AreaTypeEnum } from '@wfm/service-layer/models';
import { HttpClientService } from './application-http-client.service';

@Injectable()
export class ExternalIntegrationService {
  BASE_URL = (tenantId) => `SlotIntegrations/${tenantId}`;

  constructor(@Inject('HttpClientService') private httpClient: HttpClientService) {}

  async getSchemaId(tenantId: string, dynamicEntityId: string, areaType: AreaTypeEnum): Promise<ExternalIntegrationResponse> {
    return await this.httpClient.get<ExternalIntegrationResponse>(
      `${this.BASE_URL(tenantId)}/dynamic-entity/${dynamicEntityId}/area-type/${areaType}/schema-id`
    );
  }
  async getTenantName(tenantId: string): Promise<ExternalIntegrationResponse> {
    return await this.httpClient.get<ExternalIntegrationResponse>(`${this.BASE_URL(tenantId)}/tenant-name`);
  }
  async getWorkflowId(tenantId: string, workflowStateId: string): Promise<ExternalIntegrationResponse> {
    return await this.httpClient.get<ExternalIntegrationResponse>(
      `${this.BASE_URL(tenantId)}/workflow-state-id/${workflowStateId}/workflow-id`
    );
  }
}
