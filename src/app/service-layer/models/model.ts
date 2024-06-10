import { AggregateResult } from '@progress/kendo-data-query';
import { SearchFieldModel } from '@wfm/service-layer/models/dynamic-entity-models';
export enum SortDirection {
  invalid = 0,
  asc,
  desc
}
export enum SortDirectionValue {
  asc = 'asc',
  desc = 'desc'
}

export interface Sorting {
  propertyName: string;
  sort: SortDirection;
}

export interface PagedData<T> {
  total: number;
  items: T[];
}

export interface PagedDataWithIncompleteItems<T> extends PagedData<T> {
  incorrectItems?: T[];
}

export interface PagedDataWithAggregations<T> extends PagedData<T> {
  aggregationResult?: AggregateResult;
}

export interface Paging {
  skip: number;
  take: number;
}

export interface DataEntity {
  id: string;
}

export interface ColumnState {
  title: string;
  field: string;
  width: number;
}

export interface GridState {
  columns: ColumnState[];
  pageSize: number;
}

export interface DataFilterDef {
  filters: SearchFieldModel[];
}

export interface SortingDef {
  sorting: Sorting[];
}

export interface SearchParams {
  paging: Paging;
  sorting: SortingDef;
  filters: DataFilterDef;
}

export enum AggregationEnumBackend {
  Min,
  Max,
  Count,
  Sum,
  Avg
}

export enum AggregationEnumBackendExtended {
  Min,
  Max,
  Count,
  Sum,
  Avg,
  Group = 100 //for UI
}

export type AggregationType = 'count' | 'sum' | 'average' | 'min' | 'max';

export interface AggregationConfig {
  aggregate: AggregationEnumBackend;
  // for SCHEMA Fields - "fields.${schemaFieldName}"
  // for SYSTEM Fields  - "${systemFieldName}"
  field: string;
}
