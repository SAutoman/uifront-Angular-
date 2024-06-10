/**
 * Global
 */
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

/**
 * Project
 */
import { GridConfiguration } from '@wfm/service-layer/models/grid-settings';
import { Roles } from '@wfm/service-layer/models/user-profile';
import { DeactivatedUserGrid } from '@wfm/service-layer/models/wfm-application';
import { defaultDeactivateUsersGridSettings } from '@wfm/shared/default-grid-settings';
import { ActionEvent, GridAction } from '@wfm/shared/dynamic-entity-grid/model/dynamic-entity-grid.model';
import { GridDataResultEx } from '@wfm/shared/kendo-util';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { WfmGridComponent } from '@wfm/shared/wfm-grid/wfm-grid.component';
import { deactivatedUsersSelector, GetDeactivatedUsers, loadingSelector, operationMsgSelector, ReactivateUser } from '@wfm/store';
import { DeleteDeactivatedUser, ResetUserOperationMsg } from '@wfm/store/users';
import { UsersState } from '@wfm/store/users/users.reducer';
import { ConfirmActionComponent } from '@wfm/workflow-state/confirm-action/confirm-action.component';

/**
 * Local
 */

@Component({
  selector: 'app-deactivated-users-list',
  templateUrl: './deactivated-users-list.component.html',
  styleUrls: ['./deactivated-users-list.component.scss']
})
export class DeactivatedUsersListComponent extends TenantComponent implements OnInit, AfterViewInit {
  @ViewChild('DeactivatedUsersGrid') grid: WfmGridComponent;

  gridData: GridDataResultEx<DeactivatedUserGrid>;
  gridActions: GridAction[];

  deactivatedUsersGridConfig: GridConfiguration = defaultDeactivateUsersGridSettings;
  loading$: Observable<boolean>;

  constructor(private store: Store<UsersState>, private snackbar: MatSnackBar, private dialog: MatDialog, private ts: TranslateService) {
    super(store);
    this.loading$ = this.store.pipe(select(loadingSelector), takeUntil(this.destroyed$));
    this.store.pipe(select(operationMsgSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x && x.toLowerCase().includes('success')) {
        this.snackbar.open(x, 'Ok', { duration: 3000 });
        this.store.dispatch(new ResetUserOperationMsg());
        this.loadData();
      } else if (x && x.toLowerCase().includes('fail')) {
        this.store.dispatch(new ResetUserOperationMsg());
      }
    });
  }

  loadData(): void {
    const paging = this.grid.gridPaging;
    this.store.dispatch(new GetDeactivatedUsers({ tenantId: this.tenant, skip: paging.skip, take: paging.take }));
  }

  ngOnInit(): void {
    const roles = [Roles.TenantAdmin, Roles.Tenant, Roles.Auditor, Roles.Supplier];
    const roleNames = roles.map((x) => {
      return {
        value: x,
        name: Roles[x]
      };
    });
    this.initGridActions();
    this.store.pipe(select(deactivatedUsersSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x && x.items) {
        const newItems = x.items.map((u) => {
          return {
            ...u,
            roleName: roleNames.find((r) => r.value === u.role).name
          };
        });
        this.gridData = {
          data: newItems,
          total: x.total
        };
      }
    });
  }

  async ngAfterViewInit(): Promise<void> {
    this.loadData();
    this.grid.grid.pageChange.subscribe(async (x) => {
      this.loadData();
    });
  }

  initGridActions(): void {
    this.gridActions = [
      {
        title: 'Reactivate user',
        actionId: 'reactivate',
        icon: 'refresh',
        color: 'success'
      }
    ];
  }

  onActionClick(event: ActionEvent): void {
    switch (event.actionId) {
      case 'reactivate':
        this.reactivateUser(event.raw);
        break;
      case 'delete':
        this.confirmDelete(event.raw);
        break;
      default:
        break;
    }
  }

  reactivateUser(data: DeactivatedUserGrid): void {
    this.store.dispatch(new ReactivateUser({ tenantId: this.tenant, userId: data.id }));
  }

  confirmDelete(data: DeactivatedUserGrid): void {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this user',
        showProceedBtn: true
      }
    });
    dialogRef.afterClosed().subscribe((x) => {
      if (x) this.deleteDeactivatedUser(data);
    });
  }

  deleteDeactivatedUser(data: DeactivatedUserGrid): void {
    this.store.dispatch(new DeleteDeactivatedUser({ tenantId: this.tenant, userId: data.id }));
  }
}
