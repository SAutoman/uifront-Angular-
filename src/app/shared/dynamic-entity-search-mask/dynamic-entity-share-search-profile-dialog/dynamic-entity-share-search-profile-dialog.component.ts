/**
 * global
 */
import { Component, OnInit, Input } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { filter, take, takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

/**
 * project
 */
import {
  UserGroupsDto,
  UserGroupsService,
  User,
  DataSourceBase,
  Roles,
  TenantProfile,
  UserSettingShareService,
  UserSettingShare,
  UserSettingShareDtoGet,
  Settings,
  DynamicEntitySearchProfileUI
} from '@wfm/service-layer';

import { BaseComponent } from '../../base.component';
import { loggedInState, ApplicationState, groupsOfUserSelector } from '../../../store';

/**
 * local
 */
import { UserDataSource } from './data-sources/user-datasource.service';
import { UserGroupsDataSource } from './data-sources/user-groups-datasource.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface SharedUserUI {
  user: User;
  isChecked: boolean;
  isShared?: boolean;
}

export interface SharedGroupUI {
  group: UserGroupsDto;
  isChecked: boolean;
  isShared?: boolean;
}

/**
 * component is used both for sharing grid layouts and search profiles
 */

@Component({
  selector: 'app-dynamic-entity-share-search-profile-dialog',
  templateUrl: './dynamic-entity-share-search-profile-dialog.component.html',
  styleUrls: ['./dynamic-entity-share-search-profile-dialog.component.scss']
})
export class DynamicEntityShareSearchProfileDialogComponent extends BaseComponent implements OnInit {
  @Input() name: string;
  @Input() tenantId: string;
  @Input() schemaId?: string; //raw data schemaId
  @Input() selectedProfile: DynamicEntitySearchProfileUI | Settings;
  @Input() header: string;
  @Input() message: string;
  @Input() isLayoutProfileSharing: boolean;

  groups: SharedGroupUI[] = [];
  /**
   * the groups ids with whom the setting is to be shared
   */
  groupIds: string[] = [];
  systemGroups: SharedGroupUI[] = [];
  userSettingShares: UserSettingShareDtoGet;

  /**
   * the users ids with whom the setting is to be shared
   */

  userIds: string[] = [];
  usersByTenant: SharedUserUI[] = [];
  /**
   * the current user's id
   */
  userId: string;

  counter = 0;
  dataSource: DataSourceBase;
  groupsDataSource: DataSourceBase;
  tenant: TenantProfile;

  userIdsForRemoval: string[] = [];
  groupIdsForRemoval: string[] = [];
  componentId = 'd2e858e8-b776-48b3-b33b-bb59b79bd638';

  get showSystemGroups(): boolean {
    return this.tenant.roleNum === Roles.TenantAdmin;
  }

  constructor(
    private userGroupsService: UserGroupsService,
    private userSettingShareService: UserSettingShareService,
    private store: Store<ApplicationState>,
    private snackBar: MatSnackBar,
    private userDataSource: UserDataSource,
    private userGroupsDataSource: UserGroupsDataSource,
    private ts: TranslateService
  ) {
    super();
    this.dataSource = userDataSource;
    this.groupsDataSource = userGroupsDataSource;

    this.store.pipe(select(loggedInState), takeUntil(this.destroyed$)).subscribe((authState) => {
      this.userId = authState.profile.id;
      this.tenant = authState.currentTenantSystem.tenant;
      this.userGroupsDataSource.isAdmin = this.tenant.roleNum === Roles.TenantAdmin;
      this.userGroupsDataSource.userId = authState.profile.id;

      this.userDataSource.isAdmin = this.tenant.roleNum === Roles.TenantAdmin;
      this.userDataSource.userId = authState.profile.id;
      this.userDataSource.userCompanyId = authState.profile.companyPublicId;
    });
  }

  async ngOnInit(): Promise<void> {
    if (!this.userGroupsDataSource.isAdmin) {
      this.store
        .select(groupsOfUserSelector)
        .pipe(
          filter((x) => !!x),
          take(1)
        )
        .subscribe((groups) => {
          let userGroups = groups.map((x) => x.id);
          this.userDataSource.userGroupIds = [...userGroups];
          this.userGroupsDataSource.userGroupIds = [...userGroups];
        });
    }

    if (typeof this.selectedProfile === 'string') {
      this.selectedProfile = await JSON.parse(<any>this.selectedProfile);
    }

    this.userDataSource.tenant = this.tenantId;
    this.userGroupsDataSource.tenant = this.tenantId;
    await this.loadSystemGroups();
    this.loadUsers();
    this.loadGroups();
  }

  async loadSystemGroups() {
    const tempSystemGroups = await this.userGroupsService.getSystemUserGroups(this.tenantId);
    this.userSettingShares = await this.userSettingShareService.getUserSettingSharesByUserSettingId(
      this.tenantId,
      this.userId,
      this.selectedProfile.id
    );

    tempSystemGroups.forEach((x) =>
      this.systemGroups.push(<SharedGroupUI>{
        group: x,
        isChecked: false,
        isShared: this.userSettingShares.sharedWithSystemGroups.some((j) => j === x.id)
      })
    );
  }

  loadUsers(): void {
    this.userDataSource.items
      .pipe(
        takeUntil(this.destroyed$),
        filter((x) => !!x)
      )
      .subscribe((users) => {
        this.usersByTenant = [];
        const tempUsers = users.filter((x) => x.id !== this.userId);
        tempUsers.forEach((x) =>
          this.usersByTenant.push(<SharedUserUI>{
            user: x,
            isChecked: false,
            isShared: this.userSettingShares.sharedWithUsers.some((j) => j.id === x.id)
          })
        );
      });
  }

  loadGroups(): void {
    this.userGroupsDataSource.items
      .pipe(
        takeUntil(this.destroyed$),
        filter((x) => !!x)
      )
      .subscribe((groups) => {
        this.groups = [];
        groups.forEach((x) =>
          this.groups.push(<SharedGroupUI>{
            group: x,
            isChecked: false,
            isShared: this.userSettingShares.sharedWithGroups.some((j) => j === x.id)
          })
        );
      });
  }

  onGroupsCheckboxChecked(groupId: string, isChecked: boolean, isShared?: boolean): void {
    if (isChecked && !isShared) {
      this.groupIds.push(groupId);
      this.counter += 1;
    } else if (isChecked && isShared) {
      this.groupIdsForRemoval.push(groupId);
    } else if (!isChecked && isShared) {
      this.groupIdsForRemoval = this.groupIdsForRemoval.filter((id) => id !== groupId);
    } else {
      this.groupIds = this.groupIds.filter((id) => id !== groupId);
      this.counter -= 1;
    }
  }

  onUsersCheckboxChecked(userId: string, isChecked: boolean, isShared?: boolean): void {
    if (isChecked && !isShared) {
      this.userIds.push(userId);
      this.counter += 1;
    } else if (isChecked && isShared) {
      this.userIdsForRemoval.push(userId);
    } else if (!isChecked && isShared) {
      this.userIdsForRemoval = this.userIdsForRemoval.filter((id) => id !== userId);
    } else {
      this.userIds = this.userIds.filter((id) => id !== userId);
      this.counter -= 1;
    }
  }

  async onShare(): Promise<void> {
    const cmd = <UserSettingShare>{
      userId: this.userId,
      users: this.userIds,
      groups: this.groupIds,
      userSettingId: this.selectedProfile.id
    };

    await this.userSettingShareService.shareUserSetting(this.tenantId, cmd);
    this.snackBar.open(`${this.ts.instant('Shared successfully!')} ${this.name} ${this.message} `, 'CLOSE', {
      duration: 3000
    });
  }

  async onRemove() {
    if (!this.userIdsForRemoval.length && !this.groupIdsForRemoval.length) {
      return this.snackBar.open(this.ts.instant('Please deselect users and/or groups before removing!'), 'CLOSE', {
        duration: 5000
      });
    }

    const cmd = <UserSettingShare>{
      userId: this.userId,
      users: this.userIdsForRemoval,
      /**
       * it is not possible to remove groups from shared list
       * to be checked if the request payload is not corresponding to backend
       * (if it is ok, then the issue is from backend)
       */
      groups: this.groupIdsForRemoval,
      userSettingId: this.selectedProfile.id
    };

    await this.userSettingShareService.deleteUserSharedSetting(this.tenantId, cmd);
    this.snackBar.open(`${this.ts.instant('Removed sharing of')} ${this.name}!`, 'CLOSE', {
      duration: 3000
    });
  }
}
