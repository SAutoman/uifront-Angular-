/**
 * global
 */
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';

import { PageChangeEvent, DetailExpandEvent } from '@progress/kendo-angular-grid';
import { Store, select } from '@ngrx/store';
import { process } from '@progress/kendo-data-query';
import { takeUntil, filter, switchMap, tap, catchError } from 'rxjs/operators';
import { from, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

/**
 * project
 */
import {
  PagedData,
  GridConfiguration,
  Paging,
  Roles,
  InvitationStatus,
  InvitationToolService,
  SettingsUI,
  invitationsGridSettings,
  Invitation
} from '@wfm/service-layer';
import { dateFormatSettingsSelector, loggedInState } from '@wfm/store';

import { TenantComponent } from '@wfm/shared/tenant.component';
import { WfmGridComponent } from '@wfm/shared/wfm-grid/wfm-grid.component';
import { defaultInvitationsGridSettings } from '@wfm/shared/default-grid-settings';
import { convertRole, convertInvitationStatus } from '@wfm/shared/utils';
import { GridDataResultEx } from '@wfm/shared/kendo-util';
import { nameToProperty } from '@wfm/service-layer/helpers';
/**
 * local
 */

import { InvitationViewModel } from './invitation.view-model';
import { ActionEvent, GridAction } from '@wfm/shared/dynamic-entity-grid/model/dynamic-entity-grid.model';
import { ConfirmDialogComponent } from '@wfm/confirm-dialog/confirm-dialog.component';
import { ConfirmActionComponent } from '@wfm/workflow-state/confirm-action/confirm-action.component';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';

@Component({
  selector: 'app-invitations-grid',
  templateUrl: './invitations-grid.component.html',
  styleUrls: ['./invitations-grid.component.scss']
})
export class InvitationsGridComponent extends TenantComponent implements OnInit, AfterViewInit {
  @ViewChild('invitationGrid') wfmGrid: WfmGridComponent;

  gridData: GridDataResultEx<InvitationViewModel>;
  data: PagedData<InvitationViewModel>;
  tenantName: string;
  userId: string;
  // invitationsGridSettingId: string;
  invitationsGridSettingsConf: GridConfiguration = defaultInvitationsGridSettings;
  dataItem: Invitation;

  dateFormatDb: SettingsUI;
  gridActions: GridAction[];
  constructor(
    store: Store<any>,
    private invitationService: InvitationToolService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private ts: TranslateService,
    private errorHandler: ErrorHandlerService
  ) {
    super(store);
    store
      .pipe(
        takeUntil(this.destroyed$),
        select(dateFormatSettingsSelector),
        filter((x) => !!x)
      )
      .subscribe((data) => {
        this.dateFormatDb = { ...data };
      });

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

  async ngOnInit() {
    this.initGridActions();
    this.invitationsGridSettingsConf.girdSettingKeyName = invitationsGridSettings;
  }

  /**
   * To make invitations inactive provide button in the invitations list "Deactivate". Deactivated invitation is not possible to  be activated or used for registration again. 
invitation link is visible in the invitation list with options to copy until it is active 
   */

  initGridActions(): void {
    this.gridActions = [
      {
        title: 'Delete',
        actionId: 'delete',
        icon: 'trash',
        color: 'warn'
      },
      {
        title: 'Deactivate ',
        actionId: 'deactivate',
        icon: 'cancel'
        // color: 'warn'
      }
    ];
  }

  onActionClick(actionEvent: ActionEvent): void {
    switch (actionEvent.actionId) {
      case 'delete':
        this.onDelete(actionEvent.raw);
        break;
      case 'deactivate':
        this.onDeactivate(actionEvent.raw);
        break;
      default:
        break;
    }
  }

  onDelete(invitation: Invitation): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef
      .afterClosed()
      .pipe(
        filter((x) => !!x),
        switchMap(() => {
          return from(this.invitationService.deleteById(invitation.id));
        })
      )
      .subscribe(() => {
        this.snackBar.open(this.ts.instant('Deleted Successfully'), 'CLOSE', { duration: 2000 });
        this.fetchInvitations();
      });
  }

  onDeactivate(invitation: Invitation): void {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: {
        title: 'Warning',
        message: 'Are you sure you want to deactivate the invitation? The action is irrevokable.',
        showProceedBtn: true
      }
    });
    dialogRef
      .afterClosed()
      .pipe(
        filter((x) => !!x),
        switchMap(() => {
          return from(this.invitationService.deactivate(invitation.invitationSettingId, this.tenant));
        }),
        tap(() => {
          this.snackBar.open(this.ts.instant('Deactivated'), 'CLOSE', { duration: 2000 });
          this.fetchInvitations();
        }),
        catchError((err) => {
          this.errorHandler.getAndShowErrorMsg(err);
          return of(null);
        })
      )
      .subscribe();
  }

  populateGridData(paging: Paging): void {
    this.gridData = {
      data: this.data.items.slice(paging.skip, paging.skip + paging.take),
      total: this.data.total
    };
  }

  async ngAfterViewInit(): Promise<void> {
    this.fetchInvitations();
    this.wfmGrid.grid.pageChange.subscribe(async (x) => {
      this.populateGridData(x);

      this.wfmGrid.grid.skip = (<PageChangeEvent>x).skip;
    });

    this.wfmGrid.grid.detailExpand.subscribe((x) => (this.dataItem = (<DetailExpandEvent>x).dataItem));
    this.wfmGrid.grid.dataStateChange.subscribe((x) => (this.gridData = process(this.data.items, x)));
  }

  async fetchInvitations(): Promise<void> {
    let tempData: PagedData<Invitation>;
    tempData = await this.invitationService.searchByTenant(this.tenant);
    this.data = <PagedData<InvitationViewModel>>{
      items: tempData.items.map((x) => this.mapInvitation(x)),
      total: tempData.total
    };
    this.populateGridData(this.wfmGrid.gridPaging);
  }

  mapInvitation(x: Invitation): InvitationViewModel {
    return <InvitationViewModel>{
      id: x?.id,
      senderName: x?.creatorUser?.name + ' ' + x?.creatorUser?.lastName,
      emailAddress: x?.emailAddress,
      role: convertRole(<Roles>x?.role),
      createdAt: x?.createdAt,
      status: convertInvitationStatus(<InvitationStatus>x?.status),
      registeredUsers: x?.registeredUsers,
      isActive: x?.isActive,
      invitationLink: x && x.multipleRegistrations && x.isActive ? x.invitationUrl : '',
      multipleRegistrations: x?.multipleRegistrations,
      invitationSettingId: x?.invitationSettingId
    };
  }
}
