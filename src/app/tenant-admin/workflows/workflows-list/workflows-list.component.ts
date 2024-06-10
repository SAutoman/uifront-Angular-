import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { PageChangeEvent } from '@progress/kendo-angular-grid';

import { ConfirmDialogComponent } from '@wfm/confirm-dialog/confirm-dialog.component';
import { GridConfiguration, Paging, WorkflowDto } from '@wfm/service-layer';
import { nameToProperty } from '@wfm/service-layer/helpers';
import { defaultWorkflowsFormsGridSettings } from '@wfm/shared/default-grid-settings';
import { GridDataResultEx } from '@wfm/shared/kendo-util';
import { AppBarData, SharedService } from '@wfm/service-layer/services/shared.service';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { FetchWorkflowMenuData, loggedInState } from '@wfm/store';
import {
  DeleteWorkflow,
  GetWorkflowsByPagination,
  ResetWfOperationMsg,
  wfOperationMsgSelector,
  workflowBuilderLoader,
  workflowsListPaginatedSelector
} from '@wfm/store/workflow-builder';
import { WfmGridComponent } from '@wfm/shared/wfm-grid/wfm-grid.component';
import { ActionEvent, GridAction } from '@wfm/shared/dynamic-entity-grid/model/dynamic-entity-grid.model';

@Component({
  selector: 'app-workflows-list',
  templateUrl: './workflows-list.component.html',
  styleUrls: ['./workflows-list.component.scss']
})
export class WorkflowsListComponent extends TenantComponent implements OnInit, AfterViewInit {
  @ViewChild('formGrid') grid: WfmGridComponent;
  @ViewChild('incompletItems') incompletItems: TemplateRef<any>;

  gridData: GridDataResultEx<WorkflowDto>;
  tenantName: string;
  userId: string;
  formsGridSettingsConf: GridConfiguration = defaultWorkflowsFormsGridSettings;
  loading$: Observable<boolean>;
  isDeskTop: boolean = true;
  appBarData: AppBarData = { title: 'Workflows' } as AppBarData;
  gridActions: GridAction[];
  pageChangeSubs: Subscription;
  incompleteItems: WorkflowDto[];
  incompletesDialog: MatDialogRef<any>;
  gridAreaType: string = 'workflows';

  constructor(
    private store: Store<any>,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private sharedService: SharedService,
    private ts: TranslateService,
    private route: ActivatedRoute
  ) {
    super(store);
    this.sharedService.updateMobileQuery.pipe(takeUntil(this.destroyed$)).subscribe((isDeskTop: boolean) => (this.isDeskTop = isDeskTop));
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
    this.loading$ = this.store.pipe(takeUntil(this.destroyed$), select(workflowBuilderLoader));
    this.gridActions = [
      {
        title: 'Edit',
        actionId: 'edit',
        icon: 'edit',
        color: 'primary'
      },
      {
        title: 'Copy',
        actionId: 'copy',
        icon: 'copy',
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
    this.formsGridSettingsConf.girdSettingKeyName = 'workflowsList';
    this.store.pipe(select(wfOperationMsgSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x && x.toLowerCase().includes('success')) {
        this.snackBar.open(x, 'OK', { duration: 2000 });
        const paging = this.grid.gridPaging;
        this.store.dispatch(new FetchWorkflowMenuData({ tenantId: this.tenant, userId: this.userId }));
        this.loadData(paging);
        this.store.dispatch(new ResetWfOperationMsg());
      } else if (x && x.toLowerCase().includes('fail')) {
        this.store.dispatch(new ResetWfOperationMsg());
      }
    });
  }

  loadData(paging: Paging): void {
    this.store.dispatch(new GetWorkflowsByPagination({ paging: paging }));
  }

  async ngAfterViewInit(): Promise<void> {
    this.store.pipe(select(workflowsListPaginatedSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x) {
        this.gridData = {
          data: x.items,
          total: x.total
        };
        this.incompleteItems = x.incorrectItems;
        setTimeout(() => {
          if (!this.pageChangeSubs && this.grid) {
            this.subscribeToPaginationChanges();
          }
        });
      }
    });
    // grid is not yet initialized
    const paging = {
      skip: 0,
      take: this.formsGridSettingsConf.gridSettings.pageSize
    };
    this.loadData(paging);
  }

  subscribeToPaginationChanges(): void {
    this.pageChangeSubs = this.grid.grid.pageChange.subscribe(async (x) => {
      this.loadData(x);
      this.grid.grid.skip = (<PageChangeEvent>x).skip;
    });
  }

  onDelete(dataItem: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        this.store.dispatch(new DeleteWorkflow({ tenantId: this.tenant, wfId: dataItem }));
      }
    });
  }

  toEdit(wsId: string) {
    this.router.navigate([`${this.tenantName}/workflows/workflow/update/${wsId}`]);
  }

  onActionClick(event: ActionEvent): void {
    switch (event.actionId) {
      case 'edit':
        this.toEdit(event.raw?.id);
        break;
      case 'delete':
        this.onDelete(event.raw?.id);
        break;
      case 'copy':
        this.router.navigate(['create'], {
          relativeTo: this.route,
          queryParams: {
            copyWfId: event.raw?.id
          },
          queryParamsHandling: 'merge'
        });
        break;
      default:
        break;
    }
  }

  showIncompletItems(): void {
    this.incompletesDialog = this.dialog.open(this.incompletItems, {
      width: '400px'
    });
  }

  fixIncompleteItem(item: WorkflowDto): void {
    this.incompletesDialog.close();
    this.router.navigate([`${this.tenantName}/workflows/workflow/fix/${item.id}`]);
  }

  removeIncompleteItem(item: WorkflowDto): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        this.store.dispatch(new DeleteWorkflow({ tenantId: this.tenant, wfId: item.id }));
      }
    });
  }

  toCreatePage(value: boolean): void {
    if (value) {
      this.router.navigate(['create'], { relativeTo: this.route });
    }
  }
}
