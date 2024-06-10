/**
 * Global
 */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
/**
 * Project
 */
import { GridConfiguration } from '@wfm/service-layer/models/grid-settings';
import { defaultApiClientsGridSettings } from '@wfm/shared/default-grid-settings';
import { ActionEvent, GridAction } from '@wfm/shared/dynamic-entity-grid/model/dynamic-entity-grid.model';
import { GridDataResultEx } from '@wfm/shared/kendo-util';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { WfmGridComponent } from '@wfm/shared/wfm-grid/wfm-grid.component';
import { AddApiClient, DeleteApiClient, GetApiClients, ResetApiClientOperationMsg } from '@wfm/store/api clients/api-clients-actions';
import { ApiClientState } from '@wfm/store/api clients/api-clients-reducer';
import {
  apiClientListSelector,
  apiClientLoadingSelector,
  apiClientOperationMsgSelector
} from '@wfm/store/api clients/api-clients-selector';
import { ConfirmDialogComponent } from '@wfm/confirm-dialog/confirm-dialog.component';
import { SidebarLinksService } from '@wfm/service-layer';
import { ApiClientsList, CreateApiClient } from '@wfm/service-layer/models/api-clients';
/**
 * Local
 */
import { ApiClientCreateComponent } from '../api-client-create/api-client-create.component';

@Component({
  selector: 'app-api-clients-list',
  templateUrl: './api-clients-list.component.html',
  styleUrls: ['./api-clients-list.component.scss']
})
export class ApiClientsListComponent extends TenantComponent implements OnInit {
  @ViewChild('apiClients') grid: WfmGridComponent;
  gridData: GridDataResultEx<ApiClientsList>;
  gridActions: GridAction[];
  loading$: Observable<boolean>;
  apiClientGridSettings: GridConfiguration = defaultApiClientsGridSettings;

  constructor(
    private store: Store<ApiClientState>,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    private clipBoard: Clipboard,
    private router: Router,
    private sidebarLinksService: SidebarLinksService
  ) {
    super(store);
    this.loading$ = this.store.pipe(select(apiClientLoadingSelector), takeUntil(this.destroyed$));
    this.gridActions = [
      {
        title: 'Delete',
        actionId: 'delete',
        icon: 'delete',
        color: 'warn',
        hideTitle: false
      },
      {
        title: 'Copy ID',
        actionId: 'copy',
        icon: 'copy',
        color: 'primary',
        hideTitle: false
      }
    ];
  }

  ngOnInit(): void {
    this.getApiClients();
    this.store.pipe(select(apiClientListSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      this.gridData = {
        data: x,
        total: x?.length
      };
    });
    this.store.pipe(select(apiClientOperationMsgSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x?.toLowerCase().includes('success')) {
        this.snackbar.open(x, 'Ok', { duration: 3000 });
        this.getApiClients();
        this.store.dispatch(new ResetApiClientOperationMsg());
      }
    });
  }

  getApiClients(): void {
    this.store.dispatch(new GetApiClients());
  }

  onActionClick(event: ActionEvent): void {
    switch (event.actionId) {
      case 'delete':
        this.confirmDelete(event.raw?.id);
        break;
      case 'copy':
        this.clipBoard.copy(event.raw?.id);
        this.snackbar.open('ID Copied to clipboard', 'Ok', { duration: 2000 });
      default:
        break;
    }
  }

  confirmDelete(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.afterClosed().subscribe((x) => {
      if (x) this.deleteApiClient(id);
    });
  }

  deleteApiClient(id: string): void {
    this.store.dispatch(new DeleteApiClient({ id: id }));
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ApiClientCreateComponent);
    dialogRef.afterClosed().subscribe((data: CreateApiClient) => {
      if (data) {
        this.store.dispatch(new AddApiClient({ data: data }));
      }
    });
  }
}
