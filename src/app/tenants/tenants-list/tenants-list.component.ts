/**
 * global
 */
import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store, select } from '@ngrx/store';
import { SortDescriptor } from '@progress/kendo-data-query';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { takeUntil } from 'rxjs/operators';

/**
 * project
 */

import {
  DeleteTenantsById,
  FetchTenants,
  TenantsState,
  currentPageSelector,
  FetchTenantsPayload,
  tenantOperationMsgSelector,
  ResetTenantOperationMsg,
  invitationOperationMsgSelector,
  ResetInvitationOperationMsg
} from '../../store';

import { TenantComponent } from '../../shared/tenant.component';
import { GridDataResultEx, toApiSort } from '../../shared/kendo-util';
import { Paging, Sorting } from '../../service-layer/models/model';
import { TenantListPageViewModel } from '../tenant.model';
import { InvitationPopupComponent } from '../invitation-popup/invitation-popup.component';
import { FieldTypeIds, GridConfiguration, IFilter, User } from '@wfm/service-layer';
import { defaultCompanyInfoGridSettings, tenantsGridSettings } from '@wfm/shared/default-grid-settings';
import { WfmGridComponent } from '@wfm/shared/wfm-grid/wfm-grid.component';
import { SearchType } from '@wfm/service-layer/models/dynamic-entity-models';
import { ActionEvent, GridAction } from '@wfm/shared/dynamic-entity-grid/model/dynamic-entity-grid.model';
import { tenantCreateRoute, tenantEditRoute, tenantsMainRoute } from '../tenants.routing';
import { ConfirmActionComponent } from '@wfm/workflow-state/confirm-action/confirm-action.component';
import { ConfirmActionData } from '@wfm/service-layer/models/confirm-action';
import { TranslateService } from '@ngx-translate/core';

/**
 * local
 */

@Component({
  selector: 'app-tenants-list',
  templateUrl: './tenants-list.component.html',
  styleUrls: ['./tenants-list.component.scss']
})
export class TenantsListComponent extends TenantComponent implements OnInit, AfterViewInit {
  @ViewChild('companyInfo') companyGrid: TemplateRef<any>;

  model: TenantListPageViewModel;
  componentId = '0568c2e7-1dca-45d4-9511-4ebec253f41c';
  @ViewChild('tenantsGrid') grid: WfmGridComponent;
  gridData: GridDataResultEx<any>;
  tenantGridSettingsConf: GridConfiguration = tenantsGridSettings;
  gridActions: GridAction[];
  hidePaginationOptions: boolean = false;
  companyInfoGridSettings: GridConfiguration = defaultCompanyInfoGridSettings;
  companyInfoData: GridDataResultEx<User>;

  constructor(
    private store: Store<TenantsState>,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private router: Router,
    private ts: TranslateService
  ) {
    super(store);
    store.pipe(takeUntil(this.destroyed$), select(currentPageSelector)).subscribe((tenantState) => {
      if (tenantState?.gridData?.total > 0) {
        this.gridData = { data: tenantState.gridData.data, total: tenantState.gridData.total };
        this.initGridActions();
      }
    });
  }

  ngOnInit(): void {
    this.store.pipe(select(tenantOperationMsgSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x && x.toLowerCase().includes('success')) {
        this.snackbar.open(x, 'Ok', { duration: 3000 });
        this.store.dispatch(new ResetTenantOperationMsg());
        const paging = this.grid.gridPaging;
        this.loadData(paging);
      } else if (x && x.toLowerCase().includes('fail')) {
        this.store.dispatch(new ResetTenantOperationMsg());
      }
    });
    this.store.pipe(select(invitationOperationMsgSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x && x.toLowerCase().includes('success')) {
        this.snackbar.open(x, 'Ok', { duration: 3000 });
        this.store.dispatch(new ResetInvitationOperationMsg());
      } else if (x && x.toLowerCase().includes('fail')) {
        this.store.dispatch(new ResetInvitationOperationMsg());
      }
    });
  }

  async ngAfterViewInit(): Promise<void> {
    const paging = this.grid.gridPaging;
    this.loadData(paging);
    this.grid.grid.pageChange.subscribe(async (x) => {
      this.loadData(x);
      this.grid.grid.skip = (<PageChangeEvent>x).skip;
    });
  }

  loadData(paging: Paging, filters?: IFilter[]): void {
    this.store.dispatch(
      new FetchTenants(<FetchTenantsPayload>{
        paging,
        filters: filters ? filters : []
      })
    );
  }

  onPageChange(event: PageChangeEvent): void {
    this.store.dispatch(
      new FetchTenants(<FetchTenantsPayload>{
        paging: <Paging>{
          skip: event.skip,
          take: event.take
        }
      })
    );
  }

  initGridActions(): void {
    this.gridActions = [
      {
        title: 'Delete',
        actionId: 'delete',
        icon: 'trash',
        color: 'warn'
      },
      {
        title: 'Edit',
        actionId: 'edit',
        icon: 'edit',
        color: 'primary'
      },
      {
        title: 'Invite',
        actionId: 'invite',
        icon: 'message',
        color: 'primary'
      },
      {
        title: 'Company Info',
        actionId: 'companyInfoGridData',
        icon: 'info',
        color: 'primary'
      }
    ];
  }

  onActionClick(actionEvent: ActionEvent): void {
    switch (actionEvent.actionId) {
      case 'delete':
        this.onDelete(actionEvent.raw);
        break;
      case 'edit':
        this.router.navigate([`/${tenantsMainRoute}/${tenantEditRoute}/${actionEvent.raw.id}`]);
        break;
      case 'invite':
        this.onInvite({
          id: actionEvent.raw.id,
          name: actionEvent.raw.name
        });
        break;
      case 'companyInfoGridData':
        this.companyInfoData = { data: [], total: 1 };
        this.companyInfoData.data.push({ ...actionEvent.raw?.company });
        this.openCompanyInfoDialog();
        break;
      default:
        break;
    }
  }

  onSortChange(sort: SortDescriptor[]): void {
    let sortArr = null;

    if (sort[0].field && sort[0].dir) {
      sortArr = <Sorting[]>[
        {
          propertyName: sort[0].field,
          sort: toApiSort(sort[0])
        }
      ];
    }

    this.store.dispatch(
      new FetchTenants(<FetchTenantsPayload>{
        paging: <Paging>{
          skip: this.model.paging.skip,
          take: this.model.paging.take
        },
        sorting: sortArr,
        sortState: sort
      })
    );
  }

  onDelete(dataItem): void {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: <ConfirmActionData>{
        title: 'Confirm Delete',
        message: `Are you sure you want to delete?`,
        showProceedBtn: true,
        dynamicText: dataItem?.name
      }
    });
    dialogRef.afterClosed().subscribe((x) => {
      if (x) {
        this.store.dispatch(new DeleteTenantsById({ id: dataItem.id }));
      }
    });
  }

  onInvite(tenant: { id: string; name: string }): void {
    const dialogRef = this.dialog.open(InvitationPopupComponent);
    dialogRef.componentInstance.tenantId = tenant.id;
    dialogRef.componentInstance.tenantName = tenant.name;
  }

  onSearch(term: string) {
    if (term.trim().length > 0) {
      this.hidePaginationOptions = true;
      const paging = { skip: 0, take: 9999 };
      const filters = [{ fieldName: 'name', value: term.trim(), searchType: SearchType.Like, valueType: FieldTypeIds.StringField }];
      this.loadData(paging, filters);
    } else {
      this.loadData(this.grid.gridPaging);
      this.hidePaginationOptions = false;
    }
  }

  openCompanyInfoDialog(): void {
    this.dialog.open(this.companyGrid, {
      panelClass: 'company-info-dialog'
    });
  }

  closeDialog(): void {
    this.dialog.closeAll();
  }

  toCreatePage(value: boolean): void {
    if (value) {
      this.router.navigate([`/${tenantsMainRoute}/${tenantCreateRoute}`]);
    }
  }
}
