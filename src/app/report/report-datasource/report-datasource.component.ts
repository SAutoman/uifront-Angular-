/**
 * global
 */
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { cloneDeep } from 'lodash-core';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, take, takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { Actions } from '@ngrx/effects';

/**
 * project
 */
import { ConfirmActionData } from '@wfm/service-layer/models/confirm-action';
import { ConfirmActionComponent } from '@wfm/workflow-state/confirm-action/confirm-action.component';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';
import {
  DatasourceActionTypes,
  DeleteDatasource,
  DeleteDatasourceSuccess,
  ResetDatasourceSchemaFields,
  SetCurrentDatasource
} from '@wfm/store/report-datasource';
import { FetchWorkflowMenuData, SetSelectedRawDataSchema, reportMenuItemsSelector, loggedInState } from '@wfm/store';
import { SetSelectedReport, SetSelectedWorkflow, selectedReportSelector } from '@wfm/store/workflow';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { DataSourceService } from '@wfm/service-layer/services/datasource.service';

/**
 * local
 */
import { DataSourceDto, DataSourceSimplified } from '../report-datasource.model';

@Component({
  selector: 'app-report-datasource',
  templateUrl: './report-datasource.component.html',
  styleUrls: ['./report-datasource.component.scss']
})
export class ReportDatasourceComponent extends TenantComponent implements OnInit {
  isEditMode: boolean = false;
  isViewMode: boolean = true;
  datasourceId: string;
  datasource: DataSourceDto;
  allReports: DataSourceSimplified[];
  userId: string;

  constructor(
    private datasourceService: DataSourceService,
    private store: Store<ApplicationState>,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private errorHandlerService: ErrorHandlerService,
    private action$: Actions,
    private cdk: ChangeDetectorRef
  ) {
    super(store);
  }

  async ngOnInit(): Promise<void> {
    this.subscribeToReportSelection();
    this.store
      .pipe(
        select(loggedInState),
        filter((x) => !!x),
        takeUntil(this.destroyed$)
      )
      .subscribe((data) => {
        this.userId = data.profile.id;
      });
  }

  subscribeToReportSelection(): void {
    this.store
      .pipe(
        select(reportMenuItemsSelector),
        filter((x) => !!x),
        take(1)
      )
      .subscribe((reports) => {
        this.allReports = reports.map((item) => {
          return item.setting;
        });
        this.checkRoute();
      });

    this.store.pipe(select(selectedReportSelector), takeUntil(this.destroyed$)).subscribe(async (report) => {
      if (report && this.datasourceId) {
        try {
          this.datasource = cloneDeep(report);
          const datasourceCopy = cloneDeep(report);
          datasourceCopy.dataSourceUI = JSON.parse(datasourceCopy.dataSource);
          this.store.dispatch(new SetCurrentDatasource({ datasource: datasourceCopy }));
          this.store.dispatch(new ResetDatasourceSchemaFields());
        } catch (error) {
          this.errorHandlerService.getAndShowErrorMsg(error);
        }
      }
    });
  }

  toggleEdit(data?: boolean): void {
    this.isEditMode = data === true ? true : false;
    this.isViewMode = data === false ? true : false;
    this.cdk.detectChanges();
  }

  checkRoute(): void {
    this.route.params.pipe(takeUntil(this.destroyed$)).subscribe(async (paramsMap) => {
      this.datasourceId = paramsMap['reportId'];
      if (this.datasourceId) {
        try {
          let datasource = await this.datasourceService.getById(this.datasourceId, this.tenant);
          if (datasource && (!this.datasource || this.datasource.id !== datasource.id)) {
            this.store.dispatch(new SetSelectedReport({ selectedReport: { ...datasource } }));
            this.store.dispatch(new SetSelectedRawDataSchema({ selectedRawDataSchemaId: null }));
            this.store.dispatch(new SetSelectedWorkflow({ selectedWorkflow: null }));
          }
        } catch (error) {
          this.errorHandlerService.getAndShowErrorMsg(error);
          this.router.navigate(['..', 'create'], { relativeTo: this.route });
        }
      } else {
        if (this.allReports.length) {
          this.router.navigate([this.allReports[0]?.id], { relativeTo: this.route });
        }
      }
    });
  }

  removeDatasource(): void {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: <ConfirmActionData>{
        title: 'Warning',
        message: `Are you sure you want to delete this datasource?`,
        showProceedBtn: true,
        dynamicText: this.datasource.name
      }
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        this.store.dispatch(new DeleteDatasource({ datasourceId: this.datasourceId, tenantId: this.tenant }));

        this.action$
          .pipe(
            filter((action) => action.type === DatasourceActionTypes.DeleteDatasourceSuccess),
            take(1),
            takeUntil(this.destroyed$)
          )
          .subscribe((action: DeleteDatasourceSuccess) => {
            this.store.dispatch(new FetchWorkflowMenuData({ tenantId: this.tenant, userId: this.userId }));
            this.store.dispatch(new SetSelectedReport({ selectedReport: null }));
            this.router.navigate(['..', 'create'], { relativeTo: this.route });
          });
      }
    });
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.store.dispatch(new SetCurrentDatasource({ datasource: null }));
    this.store.dispatch(new ResetDatasourceSchemaFields());
  }
}
