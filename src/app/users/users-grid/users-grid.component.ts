/**
 * global
 */
import { Component, OnInit, ViewChild, AfterViewInit, TemplateRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Store, select } from '@ngrx/store';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { takeUntil, filter, take } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

/**
 * project
 */
import { UsersService, usersGridSettings, Paging, User, GridConfiguration, UsersUiGrid, IFilter } from '@wfm/service-layer';

import { loggedInState } from '@wfm/store/auth/auth.selectors';
import { GridDataResultEx } from '@wfm/shared/kendo-util';
import { WfmGridComponent } from '@wfm/shared/wfm-grid/wfm-grid.component';
import { defaultCompanyInfoGridSettings, defaultUsersGridSettings } from '@wfm/shared/default-grid-settings';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { nameToProperty } from '@wfm/service-layer/helpers';
import { ActionEvent, GridAction } from '@wfm/shared/dynamic-entity-grid/model/dynamic-entity-grid.model';
import { DeactivateUser, ResetUserOperationsState, userOperationFailureSelector, userOperationSuccessSelector } from '@wfm/store';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';

@Component({
  selector: 'app-users-grid',
  templateUrl: './users-grid.component.html',
  styleUrls: ['./users-grid.component.scss']
})
export class UsersGridComponent extends TenantComponent implements OnInit, AfterViewInit {
  @ViewChild('useGrid') grid: WfmGridComponent;
  @ViewChild('companyInfo') companyGrid: TemplateRef<any>;
  filters: IFilter[];
  gridData: GridDataResultEx<User>;
  tenantName: string;
  userId: string;
  isSearchOpen: boolean = false;
  title: 'Users';
  usersGridSettingsConf: GridConfiguration = defaultUsersGridSettings;
  loading: boolean = true;
  gridActions: GridAction[];
  rowData: GridDataResultEx<UsersUiGrid[]>;

  companyInfoGridSettings: GridConfiguration = defaultCompanyInfoGridSettings;
  constructor(
    private store: Store<any>,
    private usersService: UsersService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private ts: TranslateService,
    private errorHandlerService: ErrorHandlerService
  ) {
    super(store);
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
  }

  async ngOnInit(): Promise<void> {
    this.initGridActions();
    this.usersGridSettingsConf.girdSettingKeyName = usersGridSettings;
    this.usersGridSettingsConf.gridToolbarSettings.toolbarHidden = false;
  }

  initGridActions(): void {
    this.gridActions = [
      {
        title: 'Deactivate user',
        actionId: 'deactivate',
        icon: 'delete',
        color: 'warn'
      }
    ];
  }

  doSearch($event: IFilter[]): void {
    this.filters = $event;
    const paging = this.grid.gridPaging;
    this.loadData(paging);
  }

  async loadData(paging: Paging): Promise<void> {
    this.loading = true;
    const data = await this.usersService.searchByTenant(this.tenant, paging, [], this.filters);
    let usersGridData: UsersUiGrid[] = [];
    data.items.forEach((x) => {
      usersGridData.push({
        ...x,
        companyName: x.company?.name,
        companyAddress: x.company?.address,
        companyCity: x.company?.city,
        companyCountry: x.company?.country,
        companyEmail: x.company?.email,
        companyNotes: x.company?.notes,
        companyPhone: x.company?.phone,
        companyVatNr: x.company?.vatNr,
        companyTaxNumber: x.company?.taxNumber,
        companyZip: x.company?.zip,
        companyDropDownInfo: { name: x?.company?.name, id: x?.company?.id }
      });
    });
    this.gridData = {
      data: usersGridData,
      total: data.total
    };
    this.loading = false;
  }

  async ngAfterViewInit(): Promise<void> {
    const paging = this.grid.gridPaging;
    this.loadData(paging);
    this.grid.grid.pageChange.subscribe(async (x) => {
      this.loadData(x);
      this.grid.grid.skip = (<PageChangeEvent>x).skip;
    });
  }

  searchOpen(event) {
    if (event === true) {
      this.isSearchOpen = true;
    }
  }
  searchClose(event) {
    if (event === false) {
      this.isSearchOpen = false;
    }
  }

  onActionClick(event: ActionEvent): void {
    switch (event.actionId) {
      case 'deactivate':
        if (event.raw) {
          this.store.dispatch(new DeactivateUser({ tenantId: this.tenant, userId: (<User>event.raw).id }));
          this.subscribeToUserOperationsStatus();
        }
        break;
      case 'companyInfoGridData':
        this.rowData = { data: [], total: 0 };
        this.rowData.data.push(event.raw);
        this.rowData.total = 1;
        this.openCompanyInfoDialog();
      default:
        break;
    }
  }

  subscribeToUserOperationsStatus(): void {
    // failure
    this.store
      .select(userOperationFailureSelector)
      .pipe(
        filter((x) => !!x),
        takeUntil(this.destroyed$),
        take(1)
      )
      .subscribe((error) => {
        // this.snackbar.open(error, 'Ok', { duration: 2000 });
        this.store.dispatch(new ResetUserOperationsState());
      });
    // success
    this.store
      .select(userOperationSuccessSelector)
      .pipe(
        filter((x) => !!x),
        takeUntil(this.destroyed$),
        take(1)
      )
      .subscribe((successMessage) => {
        if (successMessage) {
          this.snackbar.open(successMessage, 'Ok', { duration: 2000 });
          this.loadData(this.grid.gridPaging);
          this.store.dispatch(new ResetUserOperationsState());
        }
      });
  }

  openCompanyInfoDialog(): void {
    this.dialog.open(this.companyGrid, {
      panelClass: 'company-info-dialog'
    });
  }

  closeDialog(): void {
    this.dialog.closeAll();
  }

  onCompanyChange(event: { userId: string; companyId: string }): void {
    this.updateCompany(event);
  }

  async updateCompany(data: { userId: string; companyId: string }): Promise<void> {
    try {
      const result = await this.usersService.updateUserCompany(this.tenant, data.companyId, data.userId);
      if (result?.status?.toString()?.toLowerCase() === 'success') {
        const paging = this.grid.gridPaging;
        this.loadData(paging);
        this.closeDialog();
      }
    } catch (error) {
      this.errorHandlerService.getAndShowErrorMsg(error);
    }
  }
}
