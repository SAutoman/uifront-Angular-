/**
 * global
 */
import { Injectable } from '@angular/core';

import { Store, Action } from '@ngrx/store';
import { ofType, Actions, createEffect } from '@ngrx/effects';

import { Observable } from 'rxjs';
import { exhaustMap, switchMap, withLatestFrom } from 'rxjs/operators';

/**
 * local
 */

import { TenantComponent } from '../../shared/tenant.component';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';
import { ReportDatasourceState } from './report-datasource.reducer';
import {
  CreateDatasource,
  CreateDatasourceFail,
  CreateDatasourceSuccess,
  DatasourceActionTypes,
  DeleteDatasource,
  DeleteDatasourceFail,
  DeleteDatasourceSuccess,
  ExportReportToCsv,
  ExportReportToCsvFail,
  ExportReportToCsvSuccess,
  GetDatasource,
  GetDatasourceFail,
  GetDatasourceFieldsTree,
  GetDatasourceFieldsTreeFail,
  GetDatasourceFieldsTreeSuccess,
  GetDatasourceSchemaFields,
  GetDatasourceSchemaFieldsFail,
  GetDatasourceSchemaFieldsSuccess,
  GetDatasourceSuccess,
  GetGridReport,
  GetGridReportFail,
  GetGridReportSuccess,
  ReportsActionTypes,
  UpdateDatasource,
  UpdateDatasourceFail,
  UpdateDatasourceSuccess
} from './report-datasource.actions';
import { selectReportsFieldsTree } from './report-datasource.selectors';
import { ReportsService } from '@wfm/service-layer/services/reports.service';
import { DataSourceService } from '@wfm/service-layer/services/datasource.service';
import { DatasourceSchemaFieldConfiguration } from '@wfm/report/report-datasource.model';

@Injectable()
export class ReportDatasourceEffects extends TenantComponent {
  constructor(
    private actions$: Actions,

    private store: Store<ReportDatasourceState>,
    private errorHandlerService: ErrorHandlerService,
    private reportsService: ReportsService,
    private datasourceService: DataSourceService
  ) {
    super(store);
  }

  GetDatasourceFieldsTree: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetDatasourceFieldsTree>(ReportsActionTypes.GetDatasourceFieldsTree),
      withLatestFrom(this.store.select(selectReportsFieldsTree)),
      exhaustMap(async (data) => {
        try {
          const treeMap = data[1];
          const actionData = data[0];
          const cachedFields = treeMap[actionData.payload.workflowSchemaId];
          if (cachedFields) {
            return new GetDatasourceFieldsTreeSuccess({ workflowSchemaId: actionData.payload.workflowSchemaId, fields: cachedFields });
          } else {
            const result = await this.reportsService.getWorkflowFields(actionData.payload.workflowSchemaId, actionData.payload.tenantId);
            return new GetDatasourceFieldsTreeSuccess({ workflowSchemaId: actionData.payload.workflowSchemaId, fields: result });
          }
        } catch (error) {
          return new GetDatasourceFieldsTreeFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  GetGridReport: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetGridReport>(ReportsActionTypes.GetGridReport),
      exhaustMap(async (data) => {
        try {
          const result = await this.reportsService.getReport(data.payload);

          return new GetGridReportSuccess(result);
        } catch (error) {
          return new GetGridReportFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  ExportReportToCsv: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<ExportReportToCsv>(ReportsActionTypes.ExportReportToCsv),
      exhaustMap(async (data) => {
        try {
          const result = await this.reportsService.exportReportToCsv(data.payload.query);

          const blob = new Blob([result]);
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', `${data.payload.reportName}.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          return new ExportReportToCsvSuccess(result);
        } catch (error) {
          return new ExportReportToCsvFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  CreateDatasource: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<CreateDatasource>(DatasourceActionTypes.CreateDatasource),
      switchMap(async (data) => {
        try {
          const result = await this.datasourceService.create(data.payload.data);
          return new CreateDatasourceSuccess({ datasourceId: result.targetId });
        } catch (error) {
          return new CreateDatasourceFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  UpdateDatasource: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<UpdateDatasource>(DatasourceActionTypes.UpdateDatasource),
      switchMap(async (data) => {
        try {
          const result = await this.datasourceService.update(data.payload.data);
          return new UpdateDatasourceSuccess({ datasourceId: result.targetId });
        } catch (error) {
          return new UpdateDatasourceFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  GetDatasource: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetDatasource>(DatasourceActionTypes.GetDatasource),
      exhaustMap(async (data) => {
        try {
          const result = await this.datasourceService.getById(data.payload.datasourceId, data.payload.tenantId);
          result.dataSourceUI = JSON.parse(result.dataSource);
          return new GetDatasourceSuccess({ datasource: result });
        } catch (error) {
          return new GetDatasourceFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  DeleteDatasource: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<DeleteDatasource>(DatasourceActionTypes.DeleteDatasource),
      switchMap(async (data) => {
        try {
          const result = await this.datasourceService.delete(data.payload.datasourceId, data.payload.tenantId);
          return new DeleteDatasourceSuccess({ datasourceId: result.targetId });
        } catch (error) {
          return new DeleteDatasourceFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  GetDatasourceSchemaFields: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetDatasourceSchemaFields>(DatasourceActionTypes.GetDatasourceSchemaFields),
      exhaustMap(async (data) => {
        try {
          const result = await this.datasourceService.getDatasourceFieldsConfigs(data.payload.datasourceId, data.payload.tenantId);

          return new GetDatasourceSchemaFieldsSuccess({ fields: result.dataSourceSchemaFields });
        } catch (error) {
          return new GetDatasourceSchemaFieldsFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );
}
