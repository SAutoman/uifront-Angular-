/**
 * global
 */
import { ChangeDetectorRef, Component, HostBinding, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import {
  ColumnReorderEvent,
  ColumnResizeArgs,
  ColumnVisibilityChangeEvent,
  DataStateChangeEvent,
  GridComponent,
  GridDataResult,
  PageChangeEvent,
  RowArgs
} from '@progress/kendo-angular-grid';
import { SortDescriptor, State as GridSate, orderBy as kendoOrderBy, process as kendoProcess, State } from '@progress/kendo-data-query';

import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { cloneDeep } from 'lodash-core';
import { TranslateService } from '@ngx-translate/core';

/**
 * project
 */
import {
  ColumnSettings,
  FieldTypeIds,
  GridSettings,
  IThemeColorObject,
  PagedData,
  SortDirectionValue,
  StatePersistingService,
  User,
  UserGroupCreateDto,
  UserGroupsDto,
  UserGroupsService,
  UserGroupUpdateDto,
  UsersService
} from '@wfm/service-layer';
import { BaseComponent } from '@wfm/shared/base.component';

import { IFormlyView } from '@wfm/common/models';

import { FormlyFieldAdapterFactory, FormVariableDto } from '@wfm/common/vendor';
import { Animations } from '@wfm/animations/animations';
import { emptyStringValidatorAsRequiredFn, uniqNameValidator } from '@wfm/service-layer/helpers';
import { ErrorMessageGenerator, ErrorMessageTypeEnum } from '@wfm/common/error-message-generator';

import { unsavedDataWarningMessage } from '@wfm/shared/consts/unsaved-data-warning';
import { ConfirmActionComponent } from '@wfm/workflow-state/confirm-action/confirm-action.component';
import { currentTenantSelector, GetTenantUserGroups } from '@wfm/store';
import { Store } from '@ngrx/store';
import { DynamicGridUiService } from '@wfm/service-layer/services/dynamic-grid-ui.service';
import { defaultUserGroupCreateDialogGridSettings } from '@wfm/shared/default-grid-settings';
import { ConfirmActionData } from '@wfm/service-layer/models/confirm-action';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

interface IFormModel {
  name?: string;
}
interface IView {
  /**
   * all users
   */
  users: User[];
  groupNames: string[];
  kendo: {
    gridData: GridDataResult;
    state: GridSate;
    sort: SortDescriptor[];
    selectedKeys: string[];
    columnsConfig: ColumnSettings[];
    loading: boolean;
  };
  formly: IFormlyView<IFormModel>;
  pending: boolean;
}

@Component({
  selector: 'app-user-group-editor-dialog',
  templateUrl: './user-group-editor-dialog.component.html',
  styleUrls: ['./user-group-editor-dialog.component.scss'],
  animations: Animations,
  encapsulation: ViewEncapsulation.None
})
export class UserGroupEditorDialogComponent extends BaseComponent implements OnInit, IThemeColorObject {
  @ViewChild('grid') grid: GridComponent;

  @HostBinding('class.blue') get blue(): boolean {
    return !!this.inputThemeColors?.blue;
  }
  @HostBinding('class.danger') get danger(): boolean {
    return !!this.inputThemeColors?.danger;
  }
  @HostBinding('class.dark') get dark(): boolean {
    return !!this.inputThemeColors?.dark;
  }
  @HostBinding('class.darkgreen') get darkgreen(): boolean {
    return !!this.inputThemeColors?.darkgreen;
  }
  @HostBinding('class.green') get green(): boolean {
    return !!this.inputThemeColors?.green;
  }

  inputUsers$: Observable<PagedData<User>>;
  inputGroupNames: string[];
  inputTenantId: string;
  inputCurrentUserId: string;
  inputGroup?: UserGroupsDto;
  inputThemeColors: IThemeColorObject;

  title: string;
  view$ = new BehaviorSubject<IView>(undefined);

  private isUpdate: boolean;
  private selectedUserMap: Map<string, string>;
  private snackBarDelay = 300;

  areGroupUsersModified: boolean;

  pageSize = [5, 10, 50, { text: 'all', value: 'all' }];

  gridData: GridDataResult = { total: 0, data: [] };

  tenantId: string;
  users$: Observable<User[]>;
  hidePagination: boolean = false;

  gridSettings: GridSettings;

  state: State = {
    skip: 0,
    take: 999
  };

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<UserGroupEditorDialogComponent>,
    private userGroupService: UserGroupsService,
    private dialog: MatDialog,
    private usersService: UsersService,
    private store: Store<any>,
    private dynamicGridUiService: DynamicGridUiService,
    private cd: ChangeDetectorRef,
    private persistingService: StatePersistingService,
    private ts: TranslateService
  ) {
    super();
    this.selectedUserMap = new Map();
  }

  ngOnInit(): void {
    this.isUpdate = !!this.inputGroup;
    if (this.isUpdate) {
      this.title = 'Update group';
    } else {
      this.title = 'Create group';
    }

    this.view$
      .pipe(
        takeUntil(this.destroyed$),
        filter((x) => !!x)
      )
      .subscribe((x) => {
        if (x.pending && x.formly.form.enabled) {
          x.formly.form.disable();
        } else if (!x.pending && x.formly.form.disabled) {
          x.formly.form.enable();
        }
      });

    const view = this.createView();
    view.kendo.loading = true;
    view.pending = true;

    this.view$.next(view);

    this.store
      .select(currentTenantSelector)
      .pipe(
        takeUntil(this.destroyed$),
        filter((x) => !!x)
      )
      .subscribe((x) => {
        this.tenantId = x;
        if (this.isUpdate) this.initLocalGridSettings();
      });

    this.loadData();
  }

  loadData(): void {
    const view = this.view$.value;
    from(this.usersService.searchByTenant(this.tenantId, { skip: view.kendo.state.skip, take: view.kendo.state.take })).subscribe((x) => {
      this.inputUsers$ = of({ items: [...x.items], total: x.total });

      this.inputUsers$.pipe(map((users) => cloneDeep(users))).subscribe((users: { items: User[]; total: number }) => {
        const selectedKeys = this.inputGroup?.users?.map((x) => x.id) || [];
        this.setSelectedUsers(selectedKeys);
        const userData = this.copyUsers(users.items, true);

        this.gridData = { data: users.items, total: users.total };

        const view = this.view$.value;
        this.view$.next({
          ...view,
          users: userData,
          pending: false,
          kendo: {
            ...view.kendo,
            loading: false,
            selectedKeys,
            gridData: {
              data: kendoOrderBy(cloneDeep(userData), view.kendo.sort),
              total: users.total
            }
          }
        });
      });
    });
  }

  /**
   * @description if not include it into grid will throw error for [selectedKeys]
   * @param context
   */
  getGridRowSelector(context: RowArgs): string {
    return context?.dataItem?.id || '';
  }

  onSelectedKeysChange(view: IView, rowIds: string[]): void {
    this.setSelectedUsers(rowIds);
    this.areGroupUsersModified = true;
  }

  onSortChange(view: IView, sort: SortDescriptor[]): void {
    const users = this.copyUsers(view.users, true);
    this.view$.next({
      ...view,
      kendo: {
        ...view.kendo,
        sort,
        gridData: {
          data: kendoOrderBy(users, view.kendo.sort),
          total: users.length
        },
        state: view.kendo.state
      }
    });
  }

  onDataStateChange(view: IView, state: DataStateChangeEvent): void {
    const users = this.copyUsers(view.users, false);
    this.view$.next({
      ...view,
      kendo: {
        ...view.kendo,
        state,
        gridData: kendoProcess(users, state)
      }
    });
  }

  async onSave(view: IView): Promise<void> {
    const revertData = cloneDeep(view);
    this.view$.next({
      ...view,
      pending: true
    });
    this.areGroupUsersModified = false;
    try {
      const groupName = view.formly.model.name.trim();
      const userIds: string[] = [...this.selectedUserMap.values()];
      const tenantId = this.inputTenantId;

      if (this.isUpdate) {
        const groupId = this.inputGroup.id;

        const cmd: UserGroupUpdateDto = {
          users: userIds,
          name: groupName
        };
        await this.userGroupService.updateUserGroup(tenantId, groupId, cmd);
        const group = await this.userGroupService.getUserGroupById(tenantId, groupId);

        this.dialogRef.close(group);
      } else {
        const cmd: UserGroupCreateDto = {
          ownerUserId: this.inputCurrentUserId,
          name: groupName,
          users: userIds
        };
        const group = await this.userGroupService.createUserGroup(this.inputTenantId, cmd);

        this.dialogRef.close(group);
      }

      this.store.dispatch(new GetTenantUserGroups({ tenantId: this.tenantId }));
    } catch (error) {
      this.view$.next(revertData);
      this.snackBar.open(this.ts.instant('Something went wrong'), 'CLOSE', {
        duration: this.snackBarDelay,
        panelClass: ['bg-light', 'text-danger']
      });
      throw error;
    }
  }

  private createView(): IView {
    const view: IView = {
      pending: false,
      users: [],
      formly: this.createFormly(),
      groupNames: this.inputGroupNames.filter((x) => {
        // remove existing group name for validate group create | update
        if (this.inputGroup) {
          return x !== this.inputGroup.name;
        }
        return true;
      }),
      kendo: {
        loading: false,
        selectedKeys: [],
        sort: [
          {
            field: 'isChecked',
            dir: SortDirectionValue.desc
          }
        ],
        columnsConfig: defaultUserGroupCreateDialogGridSettings.columnSettings,
        gridData: {
          data: [],
          total: 0
        },
        state: {
          skip: 0,
          take: 999,
          filter: {
            logic: 'and',
            filters: []
          }
        }
      }
    };
    this.state.take = view.kendo.state.take;
    this.state.skip = view.kendo.state.skip;
    return view;
  }

  private createFormly(): IFormlyView<IFormModel> {
    const model: IFormModel = {
      name: this.inputGroup?.name || ''
    };

    const dto: FormVariableDto = {
      label: this.ts.instant('Group Name'),
      name: 'name',
      type: FieldTypeIds.StringField,
      value: model.name,
      required: true
    };
    const field = FormlyFieldAdapterFactory.createAdapter(dto).getConfig();

    field.validators = {
      required: {
        expression: (x) => !emptyStringValidatorAsRequiredFn()(x)
      },
      [ErrorMessageTypeEnum.uniqueName]: {
        expression: (x) => {
          const names = this.view$.getValue().groupNames;
          return !uniqNameValidator(names, 0)(x);
        },
        message: ErrorMessageGenerator.get(ErrorMessageTypeEnum.uniqueName)
      }
    };
    const formlyModel: IFormlyView<IFormModel> = {
      fields: [field],
      form: this.fb.group(model),
      model
    };

    return formlyModel;
  }

  private setSelectedUsers(userIds: string[]): void {
    this.selectedUserMap = new Map();
    userIds.forEach((userId) => {
      this.selectedUserMap.set(userId, userId);
    });
  }

  private copyUsers(inputUsers: User[], sortByCheckbox: boolean): User[] {
    const copyUsers: User[] = cloneDeep(inputUsers);
    const userMap = new Map<string, User>();
    copyUsers.forEach((x) => userMap.set(x.id, x));

    [...this.selectedUserMap.keys()].forEach((x) => {
      if (userMap.get(x)) {
        userMap.get(x).isChecked = true;
      }
    });
    const users = [...userMap.values()];

    if (sortByCheckbox) {
      const checked = users.filter((x) => !!x.isChecked);
      const unchecked = users.filter((x) => !x.isChecked);
      const outputUsers = [...checked, ...unchecked];
      return outputUsers;
    }
    return users;
  }

  async onDialogClose(view: IView): Promise<void> {
    if (view.formly.form.dirty || this.areGroupUsersModified) {
      const dialogRef = this.dialog.open(ConfirmActionComponent, {
        disableClose: true,
        data: <ConfirmActionData>{ title: 'Alert', message: unsavedDataWarningMessage, showProceedBtn: true }
      });
      if (await dialogRef.afterClosed().toPromise()) this.dialogRef.close();
    } else {
      this.dialogRef.close();
    }
  }

  onPageChange(event: PageChangeEvent, state: State): void {
    state.skip = event.skip;
    state.take = event.take;
    this.state.take = state.take;
    this.state.skip = state.skip;
    this.cd.detectChanges();
    this.loadData();
  }

  filterChange(view: IView): void {
    view.kendo.gridData = { data: this.gridData.data, total: this.gridData.total };
    view.kendo.state.skip = this.state.skip;
    view.kendo.state.take = this.state.take;
  }

  private async saveGridSettingsLocally(grid: GridComponent): Promise<void> {
    if (this.inputGroup?.id) {
      await new Promise((res) => setTimeout(() => res(true), 100));
      const gridConfig = this.dynamicGridUiService.getGridSettingsFromGridComponent(grid);
      this.persistingService.set(this.getSettingsNameKey(), gridConfig);
      this.cd.detectChanges();
    }
  }

  private getSettingsNameKey(): string {
    let settingName = `UserGroupDialogSettings_${this.tenantId}_${this.inputGroup?.id}`;
    return settingName;
  }

  orderColumns(): void {
    this.gridSettings.columnsConfig = this.gridSettings.columnsConfig.sort((a, b) => a.orderIndex - b.orderIndex);
  }

  onColumnReorder(event: ColumnReorderEvent): void {
    this.saveGridSettingsLocally(this.grid);
  }

  onColumnResize(event: ColumnResizeArgs[]): void {
    this.saveGridSettingsLocally(this.grid);
  }

  onColumnVisibilityChange(event: ColumnVisibilityChangeEvent): void {
    this.saveGridSettingsLocally(this.grid);
  }

  private initLocalGridSettings(): void {
    const settings: string = this.persistingService.get(this.getSettingsNameKey());
    if (settings) {
      this.gridSettings = this.dynamicGridUiService.mapGridSettingsNonSchema(settings);
      const view = this.view$.value;
      view.kendo.columnsConfig = this.gridSettings.columnsConfig;
      const index = view.kendo.columnsConfig.findIndex((x) => x.title.toLowerCase() === 'in group');
      if (index >= 0) view.kendo.columnsConfig.splice(index, 1);
    }
  }
}
