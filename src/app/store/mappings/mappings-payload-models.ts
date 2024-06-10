/**
 * global
 */
import { SortDescriptor } from '@progress/kendo-data-query';

/**
 * project
 */
import { Paging, Sorting, PagedData } from '../../service-layer/models/model';
import { MappingViewModel } from '../../mappings/mappings/mapping.view-model';
import { CreateMappingDto, EditMappingDto, MappingDto } from '@wfm/service-layer/models/mappings';
import { IFilter, Operation } from '@wfm/service-layer';

/**
 * local
 */
export interface LoadMappingsPayload {
  paging: Paging;
  sorting: Sorting[];
  sortState: SortDescriptor[];
  filters?: IFilter[];
  tenantId: string;
}

export interface LoadMappingsFailPayload {
  error: string;
}

export interface LoadMappingsSuccessPayload {
  result: PagedData<MappingViewModel>;
}

export interface DeleteMappingPayload {
  id: string;
  tenantId: string;
}

export interface DeleteMappingSuccessPayload {
  operation: Operation;
}

export interface DeleteMappingFailPayload {}

export interface LoadMappingPayload {
  id: string;
  tenantId: string;
}

export interface LoadMappingSucessPayload {
  mapping: MappingDto;
}

export interface LoadMappingFailPayload {}

export interface EditMappingPayload {
  mapping: EditMappingDto;
  tenantId: string;
}

export interface EditMappingSuccessPayload {
  operation: Operation;
}

export interface EditMappingFailPayload {
  error: string;
}

export interface CreateMappingPayload {
  data: CreateMappingDto;
  tenantId: string;
}

export interface CreateMappingSuccessPayload {
  operation: Operation;
}

export interface CreateMappingFailPayload {
  error: string;
}
