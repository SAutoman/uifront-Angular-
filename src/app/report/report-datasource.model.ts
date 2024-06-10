// Datasource - the configuration object
// Report/DatasourceReport - the actual data received based on the configuration

import {
  AggregationEnumBackend,
  AggregationEnumBackendExtended,
  FieldTypeIds,
  IBaseFieldConfiguration,
  SearchParams
} from '@wfm/service-layer';
import { ProcessStepPath, PropertyPath } from '@wfm/service-layer/models/expressionModel';
import { AggregateResult } from '@progress/kendo-data-query';

export interface DataSourceDto extends CreateDataSourceDto {
  id: string;
}

export interface CreateDataSourceDto {
  name: string;
  workflowSchemaId: string;
  tenantId: string;
  dataSourceUI?: DatasourceFieldsConfig;
  //JSON.stringified  dataSourceUI
  dataSource: string;
  reportType: ReportTypeEnum;
}

export enum ReportTypeEnum {
  GRID = 1,
  PIVOT = 2,
  AGGREGATION = 3
}

export interface DataSourceSimplified {
  id: string;
  name: string;
  workflowSchemaId: string;
}

export interface DatasourceSchemaFieldConfiguration {
  id: string;
  columnTitle: string;
  propertyPath: PropertyPath | ProcessStepPath;
  fieldName: string;
  displayName: string;
  type: FieldTypeIds;
  isSystemField?: boolean;
  schemaFieldConfiguration: IBaseFieldConfiguration;
}

export interface DatasourceSchemaFields {
  dataSourceSchemaFields: DatasourceSchemaFieldConfiguration[];
}

export interface ReportAggregationConfig {
  aggregate: AggregationEnumBackend;
  field: string;
  propertyPath: PropertyPath;
}

export interface GroupByField {
  fieldName: string;
  propertyPath: PropertyPath;
}

export interface DatasourceFieldsTree {
  caseSchemaFields: DatasourceField[];
  processStepSchemaFields: DatasourceField[];
}

export interface DatasourceFieldsConfig extends DatasourceFieldsTree {
  aggregationConfigs?: ReportAggregationConfig[];
  groupByFields?: GroupByField[];
}

export interface DatasourceField {
  id: string;
  propertyPath: PropertyPath | ProcessStepPath;
  fieldName: string;
  displayName: string;
  type: FieldTypeIds;
  nestedSchemaFields?: DatasourceField[];
  pathSchemaFieldIds: string[];
  position: number;
  isSystemField?: boolean;
  customReportTitle?: string;
  aggregationType?: AggregationEnumBackendExtended;
}

export interface ReportGridDataResult {
  data: ReportGridRowItem[];
  total: number;
}

export interface ReportGroupedDataResult {
  groupedData?: ReportGroupedData[];
  overAllAggregationResult?: ReportAggregationItem[];
  total: number;
}

export interface ReportGroupedData {
  groupedData: ReportGroupItem[];
  aggregates?: ReportAggregationItem[];
}

export interface ReportAggregationItem {
  fieldName: string;
  propertyPath: PropertyPath;
  aggregate: AggregationEnumBackend;
  value: any;
}

export interface ReportGroupItem {
  fieldName: string;
  propertyPath: PropertyPath;
  value: string;
}

export interface ReportGridRowItem {
  reportColumns: ReportGridCellItem[];
  workflowStateId: string;
}
export interface ReportGridColumnItem {
  id?: string;
  configuration?: IBaseFieldConfiguration;
  columnTitle: string; // includes the whole path to the field
  displayName: string;
  type: FieldTypeIds;
  propertyPath: PropertyPath;
  //stringified propertyPath
  fieldName?: string;
  isSystemField?: boolean;
}

export interface ReportGridCellItem {
  id?: string;
  propertyPath: PropertyPath;
  value: any;
  formattedValue: string;
  fieldName: string;
  isSystemField?: boolean;
}

export interface GridReportQuery extends Partial<SearchParams> {
  tenantId: string;
  datasourceId: string;
  reportType: ReportTypeEnum;
}
