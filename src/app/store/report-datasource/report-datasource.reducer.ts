/**
 * global
 */
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';

/**
 * project
 */
import {
  DataSourceDto,
  DataSourceSimplified,
  DatasourceFieldsTree,
  DatasourceSchemaFieldConfiguration,
  ReportGridDataResult,
  ReportGroupedDataResult
} from '@wfm/report/report-datasource.model';
import { ReportActions, DatasourceActions, ReportsActionTypes, DatasourceActionTypes } from './report-datasource.actions';
import { cloneDeep } from 'lodash-core';
/**
 * local
 */

export interface ReportDatasourceState extends EntityState<DataSourceDto> {
  loading: boolean;
  error: string;
  datasourcesList: DataSourceSimplified[];
  reportsFieldsTrees: { [key: string]: DatasourceFieldsTree };
  currentDatasource: DataSourceDto;
  currenGridReport: ReportGridDataResult | ReportGroupedDataResult;
  currentDatasourceFields: DatasourceSchemaFieldConfiguration[];
}

export const reportDatasourceAdapter: EntityAdapter<DataSourceDto> = createEntityAdapter<DataSourceDto>();

export const initialReportDatasourceState: ReportDatasourceState = reportDatasourceAdapter.getInitialState({
  loading: false,
  error: '',
  datasourcesList: [],
  reportsFieldsTrees: {},
  currentDatasource: null,
  currenGridReport: null,
  currentDatasourceFields: null
});

export function reportReducer(state = initialReportDatasourceState, action: ReportActions | DatasourceActions): ReportDatasourceState {
  switch (action.type) {
    case ReportsActionTypes.GetDatasourceFieldsTree:
      return {
        ...state,
        loading: true,
        error: ''
      };
    case ReportsActionTypes.GetDatasourceFieldsTreeSuccess:
      const newMap = cloneDeep(state.reportsFieldsTrees);
      newMap[action.payload.workflowSchemaId] = action.payload.fields;
      return {
        ...state,
        reportsFieldsTrees: newMap,
        loading: false,
        error: ''
      };
    case ReportsActionTypes.GetDatasourceFieldsTreeFail:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };

    case ReportsActionTypes.GetGridReport:
      return {
        ...state,
        loading: true,
        error: ''
      };
    case ReportsActionTypes.GetGridReportSuccess:
      return {
        ...state,
        loading: false,
        error: '',
        currenGridReport: action.payload
      };
    case ReportsActionTypes.GetGridReportFail:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        currenGridReport: null
      };
    case ReportsActionTypes.ResetCurrentGridReport:
      return {
        ...state,
        loading: false,
        error: '',
        currenGridReport: null
      };
    case DatasourceActionTypes.CreateDatasource:
      return {
        ...state,
        loading: true,
        error: ''
      };
    case DatasourceActionTypes.CreateDatasourceSuccess:
      return {
        ...state,
        loading: false,
        error: ''
      };
    case DatasourceActionTypes.CreateDatasourceFail:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };

    case DatasourceActionTypes.UpdateDatasource:
      return {
        ...state,
        loading: true,
        error: ''
      };
    case DatasourceActionTypes.UpdateDatasourceSuccess:
      return {
        ...state,
        loading: false,
        error: ''
      };
    case DatasourceActionTypes.UpdateDatasourceFail:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };

    case DatasourceActionTypes.GetDatasource:
      return {
        ...state,
        loading: true,
        error: ''
      };
    case DatasourceActionTypes.GetDatasourceSuccess:
      return {
        ...state,
        loading: false,
        error: '',
        currentDatasource: action.payload.datasource
      };
    case DatasourceActionTypes.GetDatasourceFail:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };

    case DatasourceActionTypes.SetCurrentDatasource:
      return {
        ...state,

        currentDatasource: action.payload.datasource
      };
    case DatasourceActionTypes.DeleteDatasource:
      return {
        ...state,
        loading: true,
        error: ''
      };
    case DatasourceActionTypes.DeleteDatasourceSuccess:
      return {
        ...state,
        loading: false,
        error: '',
        currentDatasource: null
      };
    case DatasourceActionTypes.DeleteDatasourceFail:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };

    case DatasourceActionTypes.GetDatasourceSchemaFieldsSuccess:
      return {
        ...state,
        currentDatasourceFields: action.payload.fields
      };

    case DatasourceActionTypes.ResetDatasourceSchemaFields:
      return {
        ...state,
        currentDatasourceFields: null
      };

    default:
      return state;
  }
}
