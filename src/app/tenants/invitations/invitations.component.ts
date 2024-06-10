/**
 * global
 */
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';

import { PageChangeEvent, DetailExpandEvent } from '@progress/kendo-angular-grid';
import { Store, select } from '@ngrx/store';
import { process } from '@progress/kendo-data-query';
import { takeUntil, filter, switchMap } from 'rxjs/operators';
import { from } from 'rxjs';
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
import { dateFormatSettingsSelector } from '@wfm/store';

import { TenantComponent } from '@wfm/shared/tenant.component';
import { WfmGridComponent } from '@wfm/shared/wfm-grid/wfm-grid.component';
import { defaultInvitationsGridSettings } from '@wfm/shared/default-grid-settings';
import { convertRole, convertInvitationStatus } from '@wfm/shared/utils';
import { GridDataResultEx } from '@wfm/shared/kendo-util';
import { nameToProperty } from '@wfm/service-layer/helpers';
import DateTimeFormatHelper from '@wfm/shared/dateTimeFormatHelper';
/**
 * local
 */

import { InvitationViewModel } from './invitation.view-model';
import { ActionEvent, GridAction } from '@wfm/shared/dynamic-entity-grid/model/dynamic-entity-grid.model';
import { ConfirmDialogComponent } from '@wfm/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-invitations',
  templateUrl: './invitations.component.html',
  styleUrls: ['./invitations.component.scss']
})
export class InvitationsComponent extends TenantComponent implements OnInit, AfterViewInit {
  @ViewChild('invitationGrid') grid: WfmGridComponent;

  gridData: GridDataResultEx<InvitationViewModel>;
  data: PagedData<InvitationViewModel>;
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
    private ts: TranslateService
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
  }

  async ngOnInit() {
    this.initGridActions();
    this.invitationsGridSettingsConf.girdSettingKeyName = invitationsGridSettings;
  }

  initGridActions(): void {
    this.gridActions = [
      {
        title: 'Delete Invitation',
        actionId: 'delete',
        icon: 'trash',
        color: 'warn'
      }
    ];
  }

  onActionClick(actionEvent: ActionEvent): void {
    switch (actionEvent.actionId) {
      case 'delete':
        this.onDelete(actionEvent.raw);
        break;
      default:
        break;
    }
  }

  onDelete(invitation: InvitationViewModel): void {
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

  loadData(paging: Paging): void {
    this.gridData = {
      data: this.data.items.slice(paging.skip, paging.skip + paging.take),
      total: this.data.total
    };
  }

  async ngAfterViewInit(): Promise<void> {
    this.fetchInvitations();
    this.grid.grid.pageChange.subscribe(async (x) => {
      this.loadData(x);

      this.grid.grid.skip = (<PageChangeEvent>x).skip;
    });

    this.grid.grid.detailExpand.subscribe((x) => (this.dataItem = (<DetailExpandEvent>x).dataItem));
    this.grid.grid.dataStateChange.subscribe((x) => (this.gridData = process(this.data.items, x)));
  }

  async fetchInvitations(): Promise<void> {
    let tempData: PagedData<Invitation>;
    tempData = await this.invitationService.getAllInvitations();
    this.data = <PagedData<InvitationViewModel>>{
      items: tempData.items.map((x) => this.mapInvitation(x)),
      total: tempData.total
    };
    this.loadData(this.grid.gridPaging);
  }

  mapInvitation(x: Invitation): InvitationViewModel {
    return <InvitationViewModel>{
      id: x.id,
      senderName: x.creatorUser.name + ' ' + x.creatorUser.lastName,
      emailAddress: x.emailAddress,
      role: convertRole(<Roles>x.role),
      createdAt: DateTimeFormatHelper.formatDateBasedOnSetting(x.createdAt, this.dateFormatDb),
      status: convertInvitationStatus(<InvitationStatus>x.status),
      registeredUsers: x.registeredUsers
    };
  }
}
