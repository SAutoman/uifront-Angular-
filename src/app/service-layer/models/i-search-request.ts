import { IFilter } from './i-filter';
import { AreaTypeEnum } from './area-type.enum';
import { AggregationConfig, Paging, Sorting } from './model';

export interface ISearchRequest {
  sorting?: {
    sorting: Sorting[];
  };
  filters?: {
    filters: IFilter[];
  };
  paging?: Paging;
}

export interface IAreaSearchRequest extends ISearchRequest {
  areaType: AreaTypeEnum;
  tenantId: string;
}

export interface DynamicEntitiesSearch extends IAreaSearchRequest {
  schemaId: string;
  aggregationConfig?: AggregationConfig[];
}
