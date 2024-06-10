/**
 * global
 */
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { takeUntil, filter } from 'rxjs/operators';

/**
 * project
 */
import { dateFormatSettingsSelector, loggedInState } from '@wfm/store';

import { SettingsUI, registeredUsersGridSettings, User, PagedData, GridConfiguration } from '@wfm/service-layer';

import { TenantComponent } from '@wfm/shared/tenant.component';
import { GridDataResultEx } from '@wfm/shared/kendo-util';
import { defaultRegisteredUsersGridSettings } from '@wfm/shared/default-grid-settings';
import DateTimeFormatHelper from '@wfm/shared/dateTimeFormatHelper';
import { WfmGridComponent } from '@wfm/shared/wfm-grid/wfm-grid.component';
import { nameToProperty } from '@wfm/service-layer/helpers';
import { InvitationViewModel } from '@wfm/invitations/invitations-grid/invitation.view-model';

/**
 * local
 */

export interface RegisteredUserViewModel {
  name: string;
  email: string;
  createdAt: string;
}

@Component({
  selector: 'app-registered-users-grid',
  templateUrl: './registered-users-grid.component.html',
  styleUrls: ['./registered-users-grid.component.scss']
})
export class RegisteredUsersGridComponent extends TenantComponent implements OnInit {
  @ViewChild('registeredUsersGrid') grid: WfmGridComponent;

  _dataItem: InvitationViewModel;
  @Input() set dataItem(value: InvitationViewModel) {
    if (value) {
      this._dataItem = value;
      this.initialize();
    }
  }

  get dataItem() {
    return this._dataItem;
  }
  gridData: GridDataResultEx<RegisteredUserViewModel>;
  registratedUsersGridSettingsConf: GridConfiguration = defaultRegisteredUsersGridSettings;
  data: PagedData<RegisteredUserViewModel>;
  dateFormatDb: SettingsUI;

  tenantName: string;
  userId: string;

  constructor(private store: Store<any>) {
    super(store);
    store.pipe(takeUntil(this.destroyed$), select(dateFormatSettingsSelector)).subscribe((data) => {
      if (data) {
        this.dateFormatDb = { ...data };
      }
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
    this.registratedUsersGridSettingsConf.girdSettingKeyName = registeredUsersGridSettings;
  }

  loadData() {
    this.gridData = {
      data: this.data.items,
      total: this.data.total
    };
  }

  async initialize() {
    this.data = <PagedData<RegisteredUserViewModel>>{
      items: this.dataItem.registeredUsers.map((x) => this.mapUser(x)),
      total: this.dataItem.registeredUsers.length
    };
    this.loadData();
  }

  mapUser(x: User): RegisteredUserViewModel {
    return <RegisteredUserViewModel>{
      name: x.name + ' ' + x.lastName,
      email: x.email,
      createdAt: DateTimeFormatHelper.formatDateBasedOnSetting(x.createdAt, this.dateFormatDb)
    };
  }
}
