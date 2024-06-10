import { createSelector } from '@ngrx/store';
import { ReportDatasourceState } from './report-datasource.reducer';

export const selectReportDatasourceState: (u: any) => ReportDatasourceState = (state) => state.reportDatasource;
export const selectReportsFieldsTree = createSelector(selectReportDatasourceState, (data) => data.reportsFieldsTrees);

export const selectGridReport = createSelector(selectReportDatasourceState, (data) => data.currenGridReport);
export const selectReportDatasourceLoading = createSelector(selectReportDatasourceState, (data) => data.loading);
export const selectCurrentDatasource = createSelector(selectReportDatasourceState, (data) => data.currentDatasource);
export const selectDatasourceFieldsWithConfigs = createSelector(selectReportDatasourceState, (data) => data.currentDatasourceFields);
