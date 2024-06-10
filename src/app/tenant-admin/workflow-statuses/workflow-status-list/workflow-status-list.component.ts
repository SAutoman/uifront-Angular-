/**
 * global
 */
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { takeUntil, filter } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
/**
 * project
 */
import { Store, select } from '@ngrx/store';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import {
  AreaTypeEnum,
  DynamicEntitiesService,
  DynamicEntityStatusUsage,
  GridConfiguration,
  Paging,
  WorkflowService,
  WorkflowStatusDto
} from '@wfm/service-layer';
import { nameToProperty } from '@wfm/service-layer/helpers';
import { defaultFormsGridSettings } from '@wfm/shared/default-grid-settings';
import { GridDataResultEx } from '@wfm/shared/kendo-util';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { loggedInState } from '@wfm/store';
import { DeleteStatus, ResetWfOperationMsg, wfOperationMsgSelector } from '@wfm/store/workflow-builder';
import { WorkflowStatusCreateComponent } from '../workflow-status-create/workflow-status-create.component';
import { workflowStateLoading, workflowStatusesSelector } from '@wfm/store/workflow/workflow.selectors';
import { AppBarData, SharedService } from '@wfm/service-layer/services/shared.service';
import { WorkflowStatusDeleteConfirmationComponent } from '../workflow-status-delete-confirmation/workflow-status-delete-confirmation.component';
import { WfmGridComponent } from '@wfm/shared/wfm-grid/wfm-grid.component';
import { ActionEvent, GridAction } from '@wfm/shared/dynamic-entity-grid/model/dynamic-entity-grid.model';

@Component({
  selector: 'app-workflow-status-list',
  templateUrl: './workflow-status-list.component.html',
  styleUrls: ['./workflow-status-list.component.scss']
})
export class WorkflowStatusListComponent extends TenantComponent implements OnInit, AfterViewInit {
  @ViewChild('formGrid') grid: WfmGridComponent;

  gridData: GridDataResultEx<WorkflowStatusDto>;
  tenantName: string;
  userId: string;
  formsGridSettingsConf: GridConfiguration = defaultFormsGridSettings;
  wfStateLoading$: Observable<boolean>;
  appBarData: AppBarData = { title: 'Workflow Statuses List' } as AppBarData;
  gridActions: GridAction[];

  constructor(
    private store: Store<any>,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private sharedService: SharedService,
    private wfService: WorkflowService,
    private dynamicEntityService: DynamicEntitiesService
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
    this.wfStateLoading$ = this.store.pipe(select(workflowStateLoading), takeUntil(this.destroyed$));
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
    this.formsGridSettingsConf.girdSettingKeyName = 'workflowStatuses';
    this.listenForOperationMsg();
  }

  loadData(paging: Paging): void {
    this.store.pipe(select(workflowStatusesSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      let data = [];
      for (const status in x) {
        data.push(x[status]);
      }
      this.gridData = {
        data: data,
        total: data.length
      };
    });
  }

  ngAfterViewInit(): void {
    this.setPagination();
    this.grid?.grid.pageChange.subscribe(async (x) => {
      this.loadData(x);
      this.grid.grid.skip = (<PageChangeEvent>x).skip;
    });
  }

  setPagination(): void {
    const paging = this.grid?.gridPaging;
    this.loadData(paging);
  }

  onActionClick(event: ActionEvent): void {
    switch (event.actionId) {
      case 'edit':
        this.onUpdate(event.raw?.id);
        break;
      case 'delete':
        this.onDelete(event.raw?.id);
        break;
      default:
        break;
    }
  }

  async onDelete(dataItem: string): Promise<void> {
    try {
      const workflowNames = await this.getWorkflowsUsingStatus(dataItem);
      const results = await this.getStatusUsageInDynamicEntities(dataItem);
      const dialogRef = this.dialog.open(WorkflowStatusDeleteConfirmationComponent, {
        data: {
          workflowNames: workflowNames,
          showDynamicEntityUsageMsg: results[0].length > 0 || results[1].length > 0 ? true : false,
          rawDataCountForStatus: results[0].length,
          casesCountForStatus: results[1].length
        }
      });
      dialogRef.afterClosed().subscribe(async (result) => {
        if (result) {
          this.store.dispatch(new DeleteStatus({ statusId: dataItem }));
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getWorkflowsUsingStatus(statusId: string): Promise<string[]> {
    const result = await this.wfService.getWorkflowStatusUsage(this.tenant, statusId);
    return result?.length > 0 ? result.map((x) => x.name) : [];
  }

  async getStatusUsageInDynamicEntities(statusId: string): Promise<DynamicEntityStatusUsage[][]> {
    return await Promise.all([
      this.dynamicEntityService.getDynamicEntityStatusUsage(this.tenant, statusId, AreaTypeEnum.rawData),
      this.dynamicEntityService.getDynamicEntityStatusUsage(this.tenant, statusId, AreaTypeEnum.case)
    ]);
  }

  listenForOperationMsg(): void {
    this.store
      .pipe(
        select(wfOperationMsgSelector),
        filter((x) => !!x),
        takeUntil(this.destroyed$)
      )
      .subscribe((x) => {
        if (x && x.toLowerCase().includes('success')) {
          this.snackBar.open(x, 'Ok', { duration: 2000 });
          this.store.dispatch(new ResetWfOperationMsg());
          this.setPagination();
        }
      });
  }

  onUpdate(statusId: string) {
    const dialogRef = this.dialog.open(WorkflowStatusCreateComponent, {
      disableClose: true,
      data: { id: statusId }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.setPagination();
      }
    });
  }

  createStatus(): void {
    const dialogRef = this.dialog.open(WorkflowStatusCreateComponent, {
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.setPagination();
      }
    });
  }

  toCreatePage(value: boolean): void {
    if (value) {
      this.createStatus();
    }
  }
}
