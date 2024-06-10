import { Component, Input, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { SearchType, SearchFieldModel } from '@wfm/service-layer/models/dynamic-entity-models';
import { DataFilterDef, FieldTypeIds, Paging, SortDirection, Sorting, SortingDef, User } from '../../service-layer/models';
import { OperationStatus } from '../../service-layer/models/operation';
import { UsersService } from '../../service-layer/services/users.service';
import { WfmGridComponent } from '../../shared/wfm-grid/wfm-grid.component';
import { LoadOperationsPayload } from '../../store/operations/operations-payload-models';
import { LoadOperations } from '../../store/operations/operations.actions';
import { OperationsState } from '../../store/operations/operations.reducer';
import { GetUsersByTenant, ResetUserOperationMsg, SearchAllUsersEntities } from '../../store/users/users.actions';
import { UsersState } from '../../store/users/users.reducer';
import { getAllUsersSelector, operationMsgSelector, tenantUsersSelector } from '../../store/users/users.selectors';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-operations-search',
  templateUrl: './operations-search.component.html',
  styleUrls: ['./operations-search.component.scss']
})
export class OperationsSearchComponent extends TenantComponent implements OnInit {
  paging: Paging = { skip: 0, take: 10 };
  expanded: boolean;

  statuses: string[] = [
    OperationStatus[OperationStatus.Success],
    OperationStatus[OperationStatus.Pending],
    OperationStatus[OperationStatus.Failure]
  ];
  selectedStatus: string;

  users: User[] = [];
  selectedUser: User;

  componentId = 'e557c0e1-c72b-484a-9b71-d15d4a9f1fba';

  constructor(
    private operationsStore: Store<OperationsState>,
    private usersStore: Store<UsersState>,
    private usersService: UsersService,
    private snackbar: MatSnackBar
  ) {
    super(usersStore);
  }

  ngOnInit(): void {
    this.usersStore.pipe(select(tenantUsersSelector), takeUntil(this.destroyed$)).subscribe((result) => {
      this.users = result || [];
    });

    this.usersStore.pipe(select(operationMsgSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x && x.toLowerCase().includes('success')) {
        this.snackbar.open(x, 'Ok', { duration: 3000 });
        this.usersStore.dispatch(new ResetUserOperationMsg());
      } else if (x && x.toLowerCase().includes('fail')) {
        this.usersStore.dispatch(new ResetUserOperationMsg());
      }
    });

    this.usersStore.dispatch(
      new GetUsersByTenant({
        tenantId: this.tenant,
        pagingData: { skip: 0, take: 9999 }
      })
    );
  }

  expandedState(): void {
    this.expanded = true;
  }

  loadData() {
    const sorting = <SortingDef>{ sorting: [<Sorting>{ propertyName: 'createdAt', sort: SortDirection.desc }] };
    this.usersStore.dispatch(new SearchAllUsersEntities({ filtering: undefined, paging: this.paging, sorting }));
  }

  onUserSelected(event): void {
    this.selectedUser = event.value;
  }

  onStatusSelected(event): void {
    this.selectedStatus = event.value;
  }

  onReset() {
    this.selectedStatus = '';
    this.selectedUser = undefined;
    this.onSearch();
  }

  onSearch() {
    this.operationsStore.dispatch(
      new LoadOperations(<LoadOperationsPayload>{ paging: this.paging, actor: this.selectedUser?.email, status: this.selectedStatus })
    );
  }
}
