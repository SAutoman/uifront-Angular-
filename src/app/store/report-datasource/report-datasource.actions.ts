/**
 * global
 */
import { Action } from '@ngrx/store';

/**
 * project
 */
import {
  CreateDataSourceDto,
  DataSourceDto,
  DatasourceFieldsTree,
  DatasourceSchemaFieldConfiguration,
  GridReportQuery,
  ReportGridDataResult,
  ReportGroupedDataResult
} from '@wfm/report/report-datasource.model';

/**
 * local
 */

export enum ReportsActionTypes {
  GetDatasourceFieldsTree = '[Datasource Page] Get Datasource Fields Tree',
  GetDatasourceFieldsTreeSuccess = '[Datasource Page] Get Datasource Fields Tree Success',
  GetDatasourceFieldsTreeFail = '[Datasource Page] Get Datasource Fields Tree Fail',

  GetGridReport = '[Report Grid Page] Get Grid Report',
  GetGridReportSuccess = '[Reports API] Get Grid Report Success',
  GetGridReportFail = '[Reports API] Get Grid Report Fail',

  ExportReportToCsv = '[Report Grid Page] Export Grid To Csv',
  ExportReportToCsvSuccess = '[Report API] Export Grid To CSV Success',
  ExportReportToCsvFail = '[Report API] Export Grid To CSV Fail',

  ResetCurrentGridReport = '[Report Grid Page] Reset Current Grid Report'
}
export class GetDatasourceFieldsTree implements Action {
  readonly type = ReportsActionTypes.GetDatasourceFieldsTree;
  constructor(public payload: { workflowSchemaId: string; tenantId: string }) {}
}

export class GetDatasourceFieldsTreeSuccess implements Action {
  readonly type = ReportsActionTypes.GetDatasourceFieldsTreeSuccess;
  constructor(public payload: { workflowSchemaId: string; fields: DatasourceFieldsTree }) {}
}

export class GetDatasourceFieldsTreeFail implements Action {
  readonly type = ReportsActionTypes.GetDatasourceFieldsTreeFail;
  constructor(public payload: { error: string }) {}
}

// Grid Report

export class GetGridReport implements Action {
  readonly type = ReportsActionTypes.GetGridReport;
  constructor(public payload: GridReportQuery) {}
}

export class GetGridReportSuccess implements Action {
  readonly type = ReportsActionTypes.GetGridReportSuccess;
  constructor(public payload: ReportGridDataResult | ReportGroupedDataResult) {}
}

export class GetGridReportFail implements Action {
  readonly type = ReportsActionTypes.GetGridReportFail;
  constructor(public payload: { error: string }) {}
}

export class ExportReportToCsv implements Action {
  readonly type = ReportsActionTypes.ExportReportToCsv;
  constructor(public payload: { query: GridReportQuery; reportName: string }) {}
}

export class ExportReportToCsvSuccess implements Action {
  readonly type = ReportsActionTypes.ExportReportToCsvSuccess;
  constructor(public payload: string) {}
}

export class ExportReportToCsvFail implements Action {
  readonly type = ReportsActionTypes.ExportReportToCsvFail;
  constructor(public payload: { error: string }) {}
}

export class ResetCurrentGridReport implements Action {
  readonly type = ReportsActionTypes.ResetCurrentGridReport;
  constructor() {}
}

export enum DatasourceActionTypes {
  CreateDatasource = '[Datasource Page] Create Datasource',
  CreateDatasourceSuccess = '[Datasource API] Create Datasource Success',
  CreateDatasourceFail = '[Datasource API] Create Datasource Fail',

  UpdateDatasource = '[Datasource Page] Update Datasource',
  UpdateDatasourceSuccess = '[Datasource API] Update Datasource Success',
  UpdateDatasourceFail = '[Datasource API] Update Datasource Fail',

  DeleteDatasource = '[Datasource Page] Delete Datasource',
  DeleteDatasourceSuccess = '[Datasource API] Delete Datasource Success',
  DeleteDatasourceFail = '[Datasource API] Delete Datasource Fail',

  GetDatasource = '[Datasource Page] Get Datasource',
  GetDatasourceSuccess = '[Datasource API] Get Datasource Success',
  GetDatasourceFail = '[Datasource API] Get Datasource Fail',

  SetCurrentDatasource = '[Datasource Page] Set Datasource',

  GetDatasourceSchemaFields = '[Reports Page] Get Datasource SchemaFields',
  GetDatasourceSchemaFieldsSuccess = '[Datasource API] Get Datasource SchemaFields Success',
  GetDatasourceSchemaFieldsFail = '[Datasource API] Get Datasource SchemaFields Fail',

  ResetDatasourceSchemaFields = '[Reports Page] Reset Datasource SchemaFields'

  // GetAllDatasources = '[Datasource Page] Get Datasources',
  // GetAllDatasourcesSuccess= '[Datasource API] Get Datasources Success',
  // GetAllDatasourcesFail= '[Datasource API] Get Datasources Fail'
}
// CREATE

export class CreateDatasource implements Action {
  readonly type = DatasourceActionTypes.CreateDatasource;
  constructor(public payload: { data: CreateDataSourceDto }) {}
}

export class CreateDatasourceSuccess implements Action {
  readonly type = DatasourceActionTypes.CreateDatasourceSuccess;
  constructor(public payload: { datasourceId: string }) {}
}

export class CreateDatasourceFail implements Action {
  readonly type = DatasourceActionTypes.CreateDatasourceFail;
  constructor(public payload: { error: string }) {}
}

//   UPDATE

export class UpdateDatasource implements Action {
  readonly type = DatasourceActionTypes.UpdateDatasource;
  constructor(public payload: { data: DataSourceDto }) {}
}

export class UpdateDatasourceSuccess implements Action {
  readonly type = DatasourceActionTypes.UpdateDatasourceSuccess;
  constructor(public payload: { datasourceId: string }) {}
}

export class UpdateDatasourceFail implements Action {
  readonly type = DatasourceActionTypes.UpdateDatasourceFail;
  constructor(public payload: { error: string }) {}
}

//   DELETE

export class DeleteDatasource implements Action {
  readonly type = DatasourceActionTypes.DeleteDatasource;
  constructor(public payload: { datasourceId: string; tenantId: string }) {}
}

export class DeleteDatasourceSuccess implements Action {
  readonly type = DatasourceActionTypes.DeleteDatasourceSuccess;
  constructor(public payload: { datasourceId: string }) {}
}

export class DeleteDatasourceFail implements Action {
  readonly type = DatasourceActionTypes.DeleteDatasourceFail;
  constructor(public payload: { error: string }) {}
}

//   GET BY ID

export class GetDatasource implements Action {
  readonly type = DatasourceActionTypes.GetDatasource;
  constructor(public payload: { datasourceId: string; tenantId: string }) {}
}

export class GetDatasourceSuccess implements Action {
  readonly type = DatasourceActionTypes.GetDatasourceSuccess;
  constructor(public payload: { datasource: DataSourceDto }) {}
}

export class GetDatasourceFail implements Action {
  readonly type = DatasourceActionTypes.GetDatasourceFail;
  constructor(public payload: { error: string }) {}
}

export class SetCurrentDatasource implements Action {
  readonly type = DatasourceActionTypes.SetCurrentDatasource;
  constructor(public payload: { datasource: DataSourceDto }) {}
}

export class GetDatasourceSchemaFields implements Action {
  readonly type = DatasourceActionTypes.GetDatasourceSchemaFields;
  constructor(public payload: { datasourceId: string; tenantId: string }) {}
}

export class GetDatasourceSchemaFieldsSuccess implements Action {
  readonly type = DatasourceActionTypes.GetDatasourceSchemaFieldsSuccess;
  constructor(public payload: { fields: DatasourceSchemaFieldConfiguration[] }) {}
}

export class GetDatasourceSchemaFieldsFail implements Action {
  readonly type = DatasourceActionTypes.GetDatasourceSchemaFieldsFail;
  constructor(public payload: { error: string }) {}
}

export class ResetDatasourceSchemaFields implements Action {
  readonly type = DatasourceActionTypes.ResetDatasourceSchemaFields;
  constructor() {}
}

export type ReportActions =
  | GetDatasourceFieldsTree
  | GetDatasourceFieldsTreeSuccess
  | GetDatasourceFieldsTreeFail
  | GetGridReport
  | GetGridReportSuccess
  | GetGridReportFail
  | ExportReportToCsv
  | ExportReportToCsvSuccess
  | ExportReportToCsvFail
  | ResetCurrentGridReport;

export type DatasourceActions =
  | CreateDatasource
  | CreateDatasourceSuccess
  | CreateDatasourceFail
  | UpdateDatasource
  | UpdateDatasourceSuccess
  | UpdateDatasourceFail
  | DeleteDatasource
  | DeleteDatasourceSuccess
  | DeleteDatasourceFail
  | GetDatasource
  | GetDatasourceSuccess
  | GetDatasourceFail
  | SetCurrentDatasource
  | GetDatasourceSchemaFields
  | GetDatasourceSchemaFieldsSuccess
  | GetDatasourceSchemaFieldsFail
  | ResetDatasourceSchemaFields;
