import { AreaTypeEnum } from '.';

import { MappingSearchFieldModel } from './dynamic-entity-models';

export interface MappingDto extends CreateMappingDto {
  id: string;
}

export interface MappingDtoUi extends MappingDto {
  filters?: string;
  schemaName?: string;
}

export interface SearchMask {
  filters: MappingSearchFieldModel[];
}

export interface CreateMappingDto {
  tenantId: string;
  companyId: string;
  schemaId: string;
  searchMask: SearchMask;
  areaType?: AreaTypeEnum;
  tenantName?: string;
  companyName?: string;
}

export interface EditMappingDto {
  id: string;
  tenantId: string;
  entity: CreateMappingDto;
}

export interface CompanyBriefInfo {
  companyName: string;
  companyPublicId: string;
}

export interface UserWithCompany extends CompanyBriefInfo {
  userName: string;
  userPublicId: string;
}
export interface ApplyMappingDto {
  supplierMappingId?: string;
  auditorMappingId?: string;
  searchFilters: SearchMask;
}
