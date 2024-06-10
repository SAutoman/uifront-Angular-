/**
 * global
 */
import { Component, Input, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataStateChangeEvent, GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { SortDescriptor, State as GridSate, orderBy as kendoOrderBy, process as kendoProcess } from '@progress/kendo-data-query';
import { TranslateService } from '@ngx-translate/core';

import { filter, map, switchMap, take, takeUntil } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { cloneDeep } from 'lodash-core';

/**
 * project
 */
import { BaseComponent } from '@wfm/shared/base.component';
import {
  applicationTheme,
  ColumnSettings,
  GridConfiguration,
  GroupUsers,
  IThemeColorObject,
  SystemUserGroupDto,
  User,
  UserAndSystemGroupsDto,
  UserGroupsDto,
  UserGroupsService,
  PagedData
} from '@wfm/service-layer';
import { tenantSettingsSelector, loggedInState } from '@wfm/store';
import { ConfirmDialogComponent } from '@wfm/confirm-dialog/confirm-dialog.component';
import {
  defaultCompanyInfoGridSettings,
  defaultUserGroupGridSettings,
  defaultUsersGroupUsersGridSettings
} from '@wfm/shared/default-grid-settings';
import { ActionEvent, GridAction } from '@wfm/shared/dynamic-entity-grid/model/dynamic-entity-grid.model';
import { GridDataResultEx } from '@wfm/shared/kendo-util';
/**
 * local
 */
import { createUserGridColumnSettings } from '../createUserGridColumnSettings';
import { UserGroupEditorDialogComponent } from '../user-group-editor-dialog/user-group-editor-dialog.component';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';

interface IView {
  pending: boolean;
  group: {
    groups: UserAndSystemGroupsDto[];
    selectedGroup: UserGroupsDto;
    loading: boolean;
  };
  kendo: {
    gridData: GridDataResult;
    state: GridSate;
    sort: SortDescriptor[];
    columnsConfig: ColumnSettings[];
    loading: boolean;
  };
}

enum GroupsEnum {
  UserGroup = 'User Group',
  SystemGroup = 'System Group'
}

@Component({
  selector: 'app-user-groups-viewer',
  templateUrl: './user-groups-viewer.component.html',
  styleUrls: ['./user-groups-viewer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UserGroupsViewerComponent extends BaseComponent implements OnInit {
  /**
   * @description all app users
   */
  @Input() users$: Observable<User[]>;
  @Input() tenantId: string;

  @ViewChild('companyInfo') companyGrid: TemplateRef<any>;
  @ViewChild('GroupUsersInfo') groupUsersGrid: TemplateRef<any>;

  currentUserId: string;

  view$ = new BehaviorSubject<IView>(undefined);
  private themeColors: IThemeColorObject;

  private snackBarDelay = 3000;

  usersGroupUsersGridSettingsConf: GridConfiguration = defaultUsersGroupUsersGridSettings;
  usersGroupGridSettingsConf: GridConfiguration = defaultUserGroupGridSettings;
  usersGroupGridPagination: PageChangeEvent = {
    skip: defaultUserGroupGridSettings.gridSettings.skip,
    take: defaultUserGroupGridSettings.gridSettings.pageSize
  };

  gridActions: GridAction[];
  groupUsersGridActions: GridAction[];
  rowData: GridDataResultEx<User>;
  companyInfoGridSettings: GridConfiguration = defaultCompanyInfoGridSettings;
  companyInfoData: GridDataResultEx<User>;
  selectedGroupInfo: UserGroupsDto;
  addAggregate$: BehaviorSubject<string> = new BehaviorSubject(null);

  constructor(
    private store: Store<any>,
    private userGroupsService: UserGroupsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private ts: TranslateService,
    private errorHandlerService: ErrorHandlerService
  ) {
    super();
    this.componentId = '46ba2815-f3dc-4265-b320-11e172d575f3';
  }

  async ngOnInit(): Promise<void> {
    const view = this.createView();
    view.group.loading = true;
    view.kendo.loading = true;
    this.view$.next(view);

    this.currentUserId = await this.store
      .pipe(
        select(loggedInState),
        takeUntil(this.destroyed$),
        filter((x) => !!x?.profile?.id),
        map((x) => x.profile.id),
        take(1)
      )
      .toPromise();

    /**
     * init groups
     */
    this.getAllGroups$()
      .pipe(take(1))
      .subscribe((groups) => {
        const currentView = this.view$.getValue();
        this.view$.next(this.fetchGroupView(currentView, groups));
      });

    this.store
      .select(tenantSettingsSelector)
      .pipe(
        takeUntil(this.destroyed$),
        filter((x) => !!x && !!x.length),
        map((x) => x.find((j) => j.key === applicationTheme)),
        filter((x) => !!x?.value?.colors),
        map((x) => x.value.colors)
      )
      .subscribe((colors: IThemeColorObject) => {
        this.themeColors = cloneDeep(colors);
      });
    this.initGridActions();
  }

  initGridActions(): void {
    this.gridActions = [
      {
        title: 'Users',
        actionId: 'groupUsersInfo',
        icon: 'info',
        color: 'primary'
      },
      {
        title: 'Edit',
        actionId: 'edit',
        icon: 'edit',
        color: 'primary',
        isConditional: true
      },
      {
        title: 'Delete',
        actionId: 'delete',
        icon: 'delete',
        color: 'warn',
        isConditional: true
      }
    ];
  }

  initGroupUsersGridActions(): void {
    this.groupUsersGridActions = [
      {
        title: 'Company Info',
        actionId: 'companyInfoGridData',
        icon: 'info',
        color: 'primary'
      }
    ];
  }

  onSortChange(view: IView, sort: SortDescriptor[]): void {
    const users = view.kendo?.gridData?.data || [];
    this.view$.next({
      ...view,
      kendo: {
        ...view.kendo,
        sort,
        gridData: {
          data: kendoOrderBy(users, view.kendo.sort),
          total: users.length
        }
      }
    });
  }

  onDataStateChange(view: IView, state: DataStateChangeEvent): void {
    const users = this.copySelectedUsers(view);
    this.view$.next({
      ...view,
      kendo: {
        ...view.kendo,
        state,
        gridData: kendoProcess(users, state)
      }
    });
  }

  openDialogCreateGroup(view: IView): void {
    const dialogRef = this.getEditDialog(view);
    dialogRef
      .afterClosed()
      .pipe(filter((x) => !!x))
      .subscribe((group: UserGroupsDto) => {
        group['type'] = GroupsEnum.UserGroup;
        const groups = [...view.kendo.gridData.data, group];
        const newView: IView = {
          ...view,
          group: {
            ...view.group,
            groups: [...view.group.groups, group]
          },
          pending: false,
          kendo: {
            ...view.kendo,
            gridData: {
              data: kendoOrderBy(groups, view.kendo.sort),
              total: groups.length
            }
          }
        };
        this.view$.next(newView);
        this.snackBar.open(this.ts.instant('Group Created Successfully'), 'CLOSE', {
          duration: this.snackBarDelay
        });
      });
  }

  openDialogEditGroup(view: IView, group: any): void {
    const dialogRef = this.getEditDialog(view);
    dialogRef.componentInstance.inputGroup = group;
    dialogRef
      .afterClosed()
      .pipe(filter((x) => !!x))
      .subscribe((group: UserGroupsDto) => {
        const groups = view.kendo.gridData.data;
        const groupIndex = groups.findIndex((x) => x.id === group.id);
        if (groupIndex >= 0) groups[groupIndex] = { ...group, type: GroupsEnum.UserGroup };

        const newView: IView = {
          ...view,
          group: {
            ...view.group,
            groups: [...view.group.groups]
          },
          pending: false,
          kendo: {
            ...view.kendo,
            gridData: {
              data: kendoOrderBy(groups, view.kendo.sort),
              total: groups.length
            }
          }
        };

        this.view$.next(newView);
        this.snackBar.open(this.ts.instant('Group Updated Successfully'), 'CLOSE', {
          duration: this.snackBarDelay
        });
      });
  }

  onDeleteGroup(view: IView, group: any): void {
    const groupId = group.id;
    const groupName = group.name;
    const tenantId = this.tenantId;

    const revertView = cloneDeep(view);

    this.openDialog$(ConfirmDialogComponent, undefined, undefined, { groupName }).subscribe(async () => {
      // mark as pending

      this.view$.next({
        ...view,
        pending: true
      });

      try {
        const currentView = this.view$.getValue();
        const groups: UserGroupsDto[] = currentView.kendo.gridData.data;
        const index = groups.findIndex((x) => x.id === groupId);
        await this.userGroupsService.deleteUserGroup(tenantId, groupId);
        if (index >= 0) {
          groups.splice(index, 1);
        }
        this.view$.next(this.fetchGroupView(currentView, { total: groups.length, items: groups }));
      } catch (error) {
        this.view$.next({
          ...revertView
        });
        this.errorHandlerService.getAndShowErrorMsg(error);
        throw error;
      }
      this.snackBar.open(`${groupName} ${this.ts.instant('deleted successfully')}`, 'CLOSE', {
        duration: this.snackBarDelay
      });
    });
  }

  private getEditDialog(view: IView): MatDialogRef<UserGroupEditorDialogComponent, UserGroupsDto> {
    const dialogRef = this.dialog.open(UserGroupEditorDialogComponent, { disableClose: true });
    const inst = dialogRef.componentInstance;
    inst.inputGroupNames = view.group.groups.map((x) => x.name);
    inst.inputTenantId = this.tenantId;
    inst.inputCurrentUserId = this.currentUserId;
    inst.inputThemeColors = this.themeColors;
    return dialogRef;
  }

  private createView(): IView {
    const view: IView = {
      pending: false,
      group: {
        groups: [],
        loading: false,
        selectedGroup: undefined
      },
      kendo: {
        loading: false,
        columnsConfig: createUserGridColumnSettings(),
        gridData: {
          data: [],
          total: 0
        },
        state: {
          skip: 0,
          filter: {
            logic: 'and',
            filters: []
          }
        },
        sort: []
      }
    };
    return view;
  }

  private fetchGroupView(view: IView, groups: PagedData<UserAndSystemGroupsDto>): IView {
    const groupView: IView = {
      ...view,
      group: {
        groups: [],
        selectedGroup: undefined,
        loading: false
      },
      kendo: {
        ...view.kendo,
        gridData: {
          data: [...groups.items],
          total: groups.total
        },
        loading: false
      },
      pending: false
    };
    return groupView;
  }

  getAllGroups$(): Observable<PagedData<UserAndSystemGroupsDto>> {
    return this.getCurrentUserId$().pipe(
      switchMap(() => {
        const groups = this.getUserGroupsWithSystemPaginated$();
        return groups.pipe(
          map((gps) => {
            const copySystem: UserGroupsDto[] = (cloneDeep(gps.items) as SystemUserGroupDto[]).map((x) => {
              return {
                ...x,
                systemGroup: x?.systemGroup ? true : false,
                type: x?.systemGroup ? GroupsEnum.SystemGroup : GroupsEnum.UserGroup,
                disabled: x?.systemGroup ? true : false
              };
            });
            return {
              total: gps.total,
              items: [...copySystem]
            };
          })
        );
      })
    );
  }

  private getCurrentUserId$(): Observable<string> {
    return this.store.select(loggedInState).pipe(
      filter((x) => !!x?.profile?.id),
      map((x) => x.profile.id),
      take(1)
    );
  }

  private getAllUserAndSystemGroups$(): Observable<UserAndSystemGroupsDto[]> {
    return of(true).pipe(switchMap(() => from(this.userGroupsService.getAllUserAndSystemGroups(this.tenantId))));
  }

  private getUserGroupsWithSystemPaginated$(): Observable<PagedData<UserAndSystemGroupsDto>> {
    return of(true).pipe(
      switchMap(() => from(this.userGroupsService.getUserGroupsWithSystemPaginated(this.tenantId, this.usersGroupGridPagination)))
    );
  }

  private openDialog$(template: any, panelClass?: string | string[], minWidth: number = 300, data: any = {}): Observable<any> {
    return this.dialog
      .open(template, {
        minWidth,
        panelClass,
        data
      })
      .afterClosed()
      .pipe(filter((x) => !!x));
  }

  private copySelectedUsers(view: IView, markAsSelected = true): User[] {
    const users = view.group?.selectedGroup?.users || [];
    const copyUsers: User[] = cloneDeep(users);
    if (markAsSelected) {
      copyUsers.forEach((x) => {
        x.isChecked = true;
      });
    }
    return copyUsers;
  }

  async onActionClick(event: ActionEvent): Promise<void> {
    const view = this.view$.value;
    const isCurrentGroup = this.checkSelectedGroup(event.raw.id);
    switch (event.actionId) {
      case 'groupUsersInfo':
        if (!isCurrentGroup) {
          this.selectedGroupInfo = null;
          this.rowData = null;
          const result = await this.getSelectedGroupUserInfo(event.raw.id);
          this.selectedGroupInfo = result;
          this.rowData = {
            data: result.users || [],
            total: result?.users?.length || 0
          };
        } else {
          this.rowData = {
            data: this.selectedGroupInfo.users || [],
            total: this.selectedGroupInfo?.users?.length || 0
          };
        }
        this.openGroupUsersInfoDialog();
        this.initGroupUsersGridActions();
        break;
      case 'companyInfoGridData':
        this.companyInfoData = { data: [], total: 1 };
        const modifiedData: User = {
          ...event.raw,
          companyName: event.raw.company?.name,
          companyAddress: event.raw.company?.address,
          companyCity: event.raw.company?.city,
          companyCountry: event.raw.company?.country,
          companyEmail: event.raw.company?.email,
          companyNotes: event.raw.company?.notes,
          companyPhone: event.raw.company?.phone,
          companyVatNr: event.raw.company?.vatNr,
          companyTaxNumber: event.raw.company?.taxNumber,
          companyZip: event.raw.company?.zip
        };
        this.companyInfoData.data.push(modifiedData);
        this.openCompanyInfoDialog();
        break;
      case 'edit':
        this.selectedGroupInfo = null;
        this.rowData = null;
        const result = await this.getSelectedGroupUserInfo(event.raw.id);
        this.selectedGroupInfo = result;
        this.openDialogEditGroup(view, this.selectedGroupInfo);
        break;
      case 'delete':
        this.onDeleteGroup(view, event.raw);
        break;
      default:
        break;
    }
  }

  onPaginationChange(event: PageChangeEvent): void {
    this.usersGroupGridPagination = event;
    this.getAllGroups$()
      .pipe(take(1))
      .subscribe((groups) => {
        const currentView = this.view$.getValue();
        this.view$.next(this.fetchGroupView(currentView, groups));
      });
  }

  openCompanyInfoDialog(): void {
    this.dialog.open(this.companyGrid, {
      panelClass: 'company-info-dialog'
    });
  }

  openGroupUsersInfoDialog(): void {
    this.dialog.open(this.groupUsersGrid);
  }

  closeDialog(): void {
    this.dialog.closeAll();
  }

  async getSelectedGroupUserInfo(groupId: string): Promise<GroupUsers> {
    const result = await this.userGroupsService.getUserGroupById(this.tenantId, groupId);
    return result;
  }

  checkSelectedGroup(id: string): boolean {
    if (!this.selectedGroupInfo || this.selectedGroupInfo?.id !== id) return false;
    else return true;
  }

  addAggregate(): void {
    this.addAggregate$.next(`${Math.round(Math.random() * 100)}`);
  }

  openCreate(value: boolean, view: IView): void {
    if (value) {
      this.openDialogCreateGroup(view);
    }
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
