/**
 * global
 */
import { SortDescriptor } from '@progress/kendo-data-query';

/**
 * project
 */
import { Paging, Sorting, PagedData, Tenant, IFilter } from '../../service-layer';

/**
 * local
 */

export interface FetchTenantsPayload {
  paging: Paging;
  sorting: Sorting[];
  sortState: SortDescriptor[];
  filters?: IFilter[];
}

export class FetchTenantsFailPayload {
  error: string;
}

export interface FetchTenantsSuccessPayload {
  result: PagedData<Tenant>;
}

export interface CreateTenantPayload {
  name: string;
  appPublicId: string;
  companyId: string;
  invitationTemplate: string;
  timeZone: string;
}

export interface LoadTenantByIdPayload {
  id: string;
}

export interface LoadTenantsByIdSuccessPayload {
  result: Tenant;
}
