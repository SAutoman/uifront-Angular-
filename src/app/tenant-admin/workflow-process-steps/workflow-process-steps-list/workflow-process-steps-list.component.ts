import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { takeUntil, filter } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import { ConfirmDialogComponent } from '@wfm/confirm-dialog/confirm-dialog.component';
import { GridConfiguration, Paging, ProcessStepEntityDto, PagedData } from '@wfm/service-layer';
import { nameToProperty } from '@wfm/service-layer/helpers';
import { defaultFormsGridSettings } from '@wfm/shared/default-grid-settings';
import { GridDataResultEx } from '@wfm/shared/kendo-util';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { loggedInState } from '@wfm/store';
import { DeleteProcessStepEntity, ResetWfOperationMsg } from '@wfm/store/workflow-builder/workflow-builder.actions';
import { GetProcessSteps, tenantProcessSteps, wfOperationMsgSelector, wfProcessStepsLoaderSelector } from '@wfm/store/workflow-builder';
import { AppBarData, SharedService } from '@wfm/service-layer/services/shared.service';
import { WfmGridComponent } from '@wfm/shared/wfm-grid/wfm-grid.component';
import { ActionEvent, GridAction } from '@wfm/shared/dynamic-entity-grid/model/dynamic-entity-grid.model';

import { ProcessStepCreateComponent } from '../process-step-create/process-step-create.component';

@Component({
  selector: 'app-workflow-process-steps-list',
  templateUrl: './workflow-process-steps-list.component.html',
  styleUrls: ['./workflow-process-steps-list.component.scss']
})
export class WorkflowProcessStepsListComponent extends TenantComponent implements OnInit {
  @ViewChild('formGrid') grid: WfmGridComponent;

  gridData: GridDataResultEx<ProcessStepEntityDto>;
  tenantName: string;
  userId: string;
  formsGridSettingsConf: GridConfiguration = defaultFormsGridSettings;
  appBarData: AppBarData = { title: 'Process Step Entities List' } as AppBarData;
  wfStateLoading$: Observable<boolean>;
  gridActions: GridAction[];

  constructor(
    private store: Store<any>,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private sharedService: SharedService,
    private ts: TranslateService
  ) {
    super(store);
    this.sharedService.setAppBarData(this.appBarData);
    store
      .pipe(
        takeUntil(this.destroyed$),
        select(loggedInState),
        filter((x) => !!x)
      )
      .subscribe((data) => {
        this.userId = data.profile.id;
        this.tenantName = nameToProperty(data?.currentTenantSystem?.tenant?.tenantName);
      });
    this.wfStateLoading$ = this.store.pipe(select(wfProcessStepsLoaderSelector), takeUntil(this.destroyed$));
    this.gridActions = [
      {
        title: 'Edit',
        actionId: 'edit',
        icon: 'edit',
        color: 'primary'
      },
      {
        title: 'Delete',
        actionId: 'delete',
        icon: 'delete',
        color: 'warn'
      }
    ];
  }

  async ngOnInit() {
    this.store
      .select(tenantProcessSteps)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((stepsData: PagedData<ProcessStepEntityDto>) => {
        if (stepsData) {
          this.gridData = {
            data: stepsData.items,
            total: stepsData.total
          };
        }
      });
    this.formsGridSettingsConf.girdSettingKeyName = 'workflowProcessSteps';
    this.store.pipe(select(wfOperationMsgSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x && x.toLowerCase().includes('success')) {
        this.snackBar.open(x, 'OK', { duration: 2000 });
        this.loadStepsData();
        this.store.dispatch(new ResetWfOperationMsg());
      } else if (x && x.toLowerCase().includes('fail')) {
        this.store.dispatch(new ResetWfOperationMsg());
      }
    });
    this.loadStepsData();
  }

  /**
   *
   * @param paging To be changed for process steps API
   */
  async loadStepsData(): Promise<void> {
    const paging: Paging = { skip: this.formsGridSettingsConf.gridSettings.skip, take: this.formsGridSettingsConf.gridSettings.pageSize };
    this.store.dispatch(new GetProcessSteps({ tenantId: this.tenant, paging: paging }));
  }

  onDelete(dataItem: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        this.store.dispatch(new DeleteProcessStepEntity({ tenantId: this.tenant, id: dataItem }));
      }
    });
  }

  onUpdate(item: ProcessStepEntityDto) {
    this.dialog.open(ProcessStepCreateComponent, {
      disableClose: true,
      data: { id: item.id, data: item, processSteps: this.gridData.data }
    });
  }

  createProcessStep(): void {
    this.dialog.open(ProcessStepCreateComponent, {
      disableClose: true,
      data: { processSteps: this.gridData?.data }
    });
  }

  onPageChange(pagingInfo: Paging): void {
    this.formsGridSettingsConf.gridSettings.skip = pagingInfo.skip;
    this.formsGridSettingsConf.gridSettings.pageSize = pagingInfo.take;
    this.loadStepsData();
  }

  onActionClick(event: ActionEvent): void {
    switch (event.actionId) {
      case 'edit':
        this.onUpdate(event.raw);
        break;
      case 'delete':
        this.onDelete(event.raw?.id);
        break;
      default:
        break;
    }
  }

  toCreatePage(value: boolean): void {
    if (value) this.createProcessStep();
  }
}
