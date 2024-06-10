/**
 * global
 */
import { Component, EventEmitter, Input, Output, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store, select } from '@ngrx/store';
import { filter, takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep } from 'lodash-core';
import { Subscription } from 'rxjs';
/**
 * project
 */
import {
  AreaTypeEnum,
  DynamicEntitySearchProfile,
  DynamicEntitySearchProfileUI,
  ManualCreationSettings,
  RoleManualCreation,
  Roles,
  SchemaDto,
  Settings,
  TenantSettingsDto,
  TenantSettingsService,
  UserGroupManualCreation,
  UserGroupsDto,
  UserGroupsService,
  WorkflowStatusDto,
  appCaseSearchProfile,
  appRawDataSearchProfile,
  dynamicGridSettingsKey
} from '@wfm/service-layer';

/**
 * local
 */
import {
  ApplicationState,
  AuthState,
  FetchTenantSettingsAction,
  GetSharedUserSettingsPerGroupAction,
  sharedLayoutsPerGroupSelector,
  sharedLayoutsPerRoleSelector,
  sharedSearchProfilesPerGroupSelector,
  sharedSearchProfilesPerRoleSelector,
  loggedInState,
  workflowMenuItemsSelector
} from '../../store';
import { TenantComponent } from '../../shared/tenant.component';
import { CaseViewEnum } from '@wfm/workflow-state/workflow-states-list/workflow-states-list.component';
import { DynamicEntityCreateAnotherSetting } from './create-another/create-another.component';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';
import { SearchProfilesRoleBased } from './select-search-profile/select-search-profile.component';
import { cleanupSearchProfiles } from '@wfm/service-layer/helpers';
import { DefaultLayoutSetting } from './layout-settings/layout-settings.component';
import { isUndefinedOrNull } from '@wfm/shared/utils';
import { DisabledCasesRoleBased } from './select-case-statuses/select-case-statuses.component';
import { ChildrenItems } from '@wfm/shared/menu-items/menu-items';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

export const schemaPermissionSettingsKey = 'allowManualCreation';

interface GroupOptionItem {
  name: string;
  id: string;
}

export enum SelectedRoleTab {
  TenantAdmin = 0,
  Tenant = 1,
  Supplier = 2,
  Auditor = 3
}

export interface AllWorkflowStatuses {
  schemaId: string;
  statuses: WorkflowStatusDto[];
}

@Component({
  selector: 'app-manual-creation-settings-by-schema',
  templateUrl: './manual-creation-settings-by-schema.component.html',
  styleUrls: ['./manual-creation-settings-by-schema.component.scss']
})
export class ManualCreationSettingsBySchemaComponent extends TenantComponent implements OnInit {
  @Input('areaTitle') areaType: AreaTypeEnum;
  @Input() schemasData: SchemaDto[];
  @Input() showMultiCreationSetting: boolean;
  @Input() showCaseViewSetting: boolean;
  @Output() formStatus: EventEmitter<boolean> = new EventEmitter();

  componentId = 'ca6ddd12-e52e-4638-90bb-b269721d91a6';
  settings: ManualCreationSettings;
  settingId: string;
  selectedSchemaId: string;
  selectedSchema: SchemaDto;
  areaName: string;
  tenantAuthState: AuthState;

  userGroups: UserGroupsDto[];
  selectedGroupId: string;
  groupsWithPermissions: Array<GroupOptionItem> = [];
  groupOptions: Array<GroupOptionItem>;
  disableMultiCreation: boolean = true;
  currentCaseViewSetting: CaseViewEnum;
  createAnotherItemSetting: DynamicEntityCreateAnotherSetting;
  gridStatusChangeSettingEnabled?: boolean = false;
  currentTabIndex = SelectedRoleTab.TenantAdmin;

  hasUnsavedChanges = false;

  rolePermissions: { [key: string]: RoleManualCreation } = {};
  groupPermissions: { [key: string]: UserGroupManualCreation } = {};
  searchProfileRolePermissions: { [key: string]: SearchProfilesRoleBased } = {};
  searchProfileGroupPermissions: { [key: string]: SearchProfilesRoleBased } = {};
  defaultLayoutRolePermissions: { [key: string]: DefaultLayoutSetting } = {};
  defaultLayoutGroupPermissions: { [key: string]: DefaultLayoutSetting } = {};

  roleByGroupId: { [systemGroupId: string]: Roles } = {};
  searchProfilesPerGroup: { [groupId: string]: DynamicEntitySearchProfileUI[] } = {};
  searchProfilesPerRole: { [roleEnum: string]: DynamicEntitySearchProfileUI[] } = {};
  layoutsPerGroup: { [groupId: string]: Settings[] } = {};
  layoutsPerRole: { [roleEnum: string]: Settings[] } = {};
  groupLayoutSubs: Subscription;
  groupSearchProfilesSubs: Subscription;

  roleLayoutSubs: Subscription;
  roleSearchProfilesSubs: Subscription;

  disabledCaseStatusesRolePermissions: { [key: string]: DisabledCasesRoleBased } = {};
  disabledCaseStatusesGroupPermissions: { [key: string]: DisabledCasesRoleBased } = {};
  allWorkflowStatuses: AllWorkflowStatuses[] = [];
  loadSearchAutomatically: boolean;

  get caseViewEnum() {
    return CaseViewEnum;
  }

  get gridAreaType() {
    return AreaTypeEnum;
  }

  get roleEnum() {
    return Roles;
  }

  constructor(
    private tenantsService: TenantSettingsService,
    private snackBar: MatSnackBar,
    private store: Store<ApplicationState>,
    private userGroupsService: UserGroupsService,
    private ts: TranslateService,
    private adminSchemasService: AdminSchemasService,
    private errorHandlerService: ErrorHandlerService,
    private cdk: ChangeDetectorRef
  ) {
    super(store);
    this.store.pipe(takeUntil(this.destroyed$), select(loggedInState)).subscribe((data) => {
      if (data) {
        this.tenantAuthState = data;
        if (this.selectedSchemaId) this.fetchRoleSettings();
      }
    });
  }

  async ngOnInit(): Promise<void> {
    this.checkAreaType();
    await this.getSystemGroups();
    this.subscribeToSharedUserSettings();

    this.userGroups = (await this.userGroupsService.getUserGroups(this.tenant)).items;
    this.groupOptions = this.userGroups.map((group) => {
      return { name: group.name, id: group.id };
    });
    this.initGroupsPermissions();
    if (this.areaType === AreaTypeEnum.case) this.getAllWorkflowStatuses();
  }

  getAllWorkflowStatuses(): void {
    this.store.pipe(select(workflowMenuItemsSelector), takeUntil(this.destroyed$)).subscribe((data) => {
      this.allWorkflowStatuses = cloneDeep(data)?.map((x: ChildrenItems) => {
        return <AllWorkflowStatuses>{
          schemaId: x?.setting?.caseSchemaId,
          statuses: x?.setting?.statuses
        };
      });
    });
  }

  checkAreaType(): void {
    switch (this.areaType) {
      case AreaTypeEnum.rawData:
        this.areaName = 'Raw Data';
        break;

      case AreaTypeEnum.case:
        this.areaName = 'Cases';
        break;

      case AreaTypeEnum.comment:
        this.areaName = 'Comment';
        break;
      case AreaTypeEnum.stepForm:
        this.areaName = 'Process';
        break;
      default:
        break;
    }
  }

  getSchemaId(id: string): void {
    if (id) {
      this.searchProfilesPerGroup = {};
      this.searchProfilesPerRole = {};
      this.layoutsPerGroup = {};
      this.layoutsPerRole = {};
      this.selectedSchemaId = id;
      this.fetchRoleSettings();
      if (Object.keys(this.roleByGroupId).length) {
        // for schema changes coming after the first init
        this.subscribeToSharedUserSettings();
      }
    }
    this.hasUnsavedChanges = true;
  }

  async fetchRoleSettings(): Promise<void> {
    this.filterSettings(this.selectedSchemaId);
    this.selectedSchema = await this.adminSchemasService.getSchema(this.tenant, this.areaType, this.selectedSchemaId);
  }

  filterSettings(schemaId: string): void {
    const selectedSchemaSettings = this.tenantAuthState.currentTenantSystem.tenantSettings.find((x) =>
      x.key.includes(`${schemaPermissionSettingsKey}_${schemaId}_${this.areaType}`)
    );
    this.settingId = selectedSchemaSettings?.id ? selectedSchemaSettings.id : null;
    this.settings = selectedSchemaSettings?.value ? selectedSchemaSettings.value : null;
    const rolePermissions = this.settings?.rolePermissions ? this.settings?.rolePermissions : null;
    if (rolePermissions) {
      rolePermissions.forEach((data) => {
        this.defaultLayoutRolePermissions[data.role] = {
          defaultLayoutId: data.permission.defaultLayout,
          role: data.role
        };
        const copy = cloneDeep(data);
        delete copy.permission.allowedSearchProfiles;
        delete copy.permission.defaultSearchProfile;
        delete copy.permission.defaultLayout;
        this.rolePermissions[data.role] = copy;
        this.searchProfileRolePermissions[data.role] = {
          role: data.role,
          allowedSearchProfiles: data.permission.allowedSearchProfiles,
          defaultSearchProfile: data.permission.defaultSearchProfile
        };
        this.disabledCaseStatusesRolePermissions[data.role] = {
          role: data.role,
          disabledCaseStatuses: data.permission.statusesWithDisabledDelete || []
        };
      });
    }
    this.initGroupsPermissions();
    const existingDisableMultiSetting = selectedSchemaSettings?.value?.disableMultiCreation;
    this.disableMultiCreation = isUndefinedOrNull(existingDisableMultiSetting) ? true : existingDisableMultiSetting;
    this.currentCaseViewSetting = selectedSchemaSettings?.value?.caseViewSetting;
    this.createAnotherItemSetting = selectedSchemaSettings?.value?.createAnotherSetting;
    this.gridStatusChangeSettingEnabled = selectedSchemaSettings?.value?.allowGridStatusChange;
    if (this.areaType === AreaTypeEnum.rawData || this.areaType === AreaTypeEnum.case) {
      this.loadSearchAutomatically =
        typeof selectedSchemaSettings?.value?.loadSearchAutomatically === 'boolean'
          ? selectedSchemaSettings.value.loadSearchAutomatically
          : true;
    }
    this.cdk.detectChanges();
  }

  async onSubmit(): Promise<void> {
    this.settings = {
      rolePermissions: this.getRoleSettings(),
      userGroupPermissions: this.getGroupSettings(),
      disableMultiCreation: this.disableMultiCreation,
      caseViewSetting: this.currentCaseViewSetting,
      createAnotherSetting: this.createAnotherItemSetting,
      allowGridStatusChange: this.gridStatusChangeSettingEnabled,
      loadSearchAutomatically: this.loadSearchAutomatically
    };
    const userSettings = <Settings>{
      key: `${schemaPermissionSettingsKey}_${this.selectedSchemaId}_${this.areaType}`,
      value: this.settings,
      id: this.settingId
    };
    const cmd = <TenantSettingsDto>{
      settings: [userSettings],
      tenantId: this.tenant
    };
    try {
      await this.tenantsService.update(cmd);
      this.refreshTenantSettings();
      this.hasUnsavedChanges = false;
      this.formStatus.emit(false);
      this.snackBar.open(this.ts.instant('Tenant Settings Saved Successfully!'), 'CLOSE', { duration: 2000 });
    } catch (error) {
      this.errorHandlerService.getAndShowErrorMsg(error);
    }
  }

  getRoleSettings(): RoleManualCreation[] {
    const roles = [Roles.TenantAdmin, Roles.Tenant, Roles.Supplier, Roles.Auditor];
    const data = roles.map((role: Roles) => {
      return {
        role: role,
        permission: {
          ...this.rolePermissions[role].permission,
          allowedSearchProfiles: this.searchProfileRolePermissions[role]
            ? this.searchProfileRolePermissions[role].allowedSearchProfiles
            : null,
          defaultSearchProfile: this.searchProfileRolePermissions[role]
            ? this.searchProfileRolePermissions[role].defaultSearchProfile
            : null,
          defaultLayout: this.defaultLayoutRolePermissions[role] ? this.defaultLayoutRolePermissions[role].defaultLayoutId : null,
          statusesWithDisabledDelete: this.getDisabledCaseStatusesForDeletion(role, null) || null
        }
      };
    });
    return data;
  }

  getDisabledCaseStatusesForDeletion(role?: Roles, groupId?: string): string[] {
    if (role && this.rolePermissions[role]?.permission?.delete && this.disabledCaseStatusesRolePermissions[role]) {
      return this.disabledCaseStatusesRolePermissions[role]?.disabledCaseStatuses;
    } else if (groupId && this.groupPermissions[groupId]?.permission?.delete && this.disabledCaseStatusesGroupPermissions[groupId]) {
      return this.disabledCaseStatusesGroupPermissions[groupId]?.disabledCaseStatuses;
    }
  }

  getGroupSettings(): UserGroupManualCreation[] {
    let groupsPermissions: UserGroupManualCreation[] = [];
    for (const groupId in this.groupPermissions) {
      if (this.groupPermissions.hasOwnProperty(groupId)) {
        const data = this.groupPermissions[groupId];
        const fullData: UserGroupManualCreation = {
          groupId,
          permission: {
            ...data.permission,
            allowedSearchProfiles: this.searchProfileGroupPermissions[groupId]?.allowedSearchProfiles,
            defaultSearchProfile: this.searchProfileGroupPermissions[groupId]?.defaultSearchProfile,
            defaultLayout: this.defaultLayoutGroupPermissions[groupId]?.defaultLayoutId,
            statusesWithDisabledDelete: this.getDisabledCaseStatusesForDeletion(null, groupId) || null
          }
        };
        groupsPermissions.push(fullData);
      }
    }
    return groupsPermissions;
  }

  refreshTenantSettings(): void {
    this.store.dispatch(
      new FetchTenantSettingsAction({ tenant: this.tenantAuthState.currentTenantSystem.tenant, userId: this.tenantAuthState.profile.id })
    );
  }

  initGroupsPermissions(): void {
    this.groupsWithPermissions = [];
    if (this.userGroups) {
      this.groupOptions = this.userGroups.map((group) => {
        return { name: group.name, id: group.id };
      });
      if (this.settings?.userGroupPermissions?.length) {
        this.settings.userGroupPermissions.forEach((groupSetting) => {
          this.onGroupSelected(groupSetting.groupId, false, groupSetting);
        });
      }
    }
  }

  removeGroupControl(groupId: string): void {
    delete this.groupPermissions[groupId];
    delete this.searchProfileGroupPermissions[groupId];

    let groupOption;
    this.groupsWithPermissions = this.groupsWithPermissions.filter((group) => {
      if (group.id === groupId) {
        groupOption = group;
        return false;
      }
      return true;
    });
    this.groupOptions.push(groupOption);
  }

  onGroupSelected(selectedGroupId: string, fromUI: boolean, setting?: UserGroupManualCreation): void {
    this.store.dispatch(new GetSharedUserSettingsPerGroupAction({ tenantId: this.tenant, groupId: selectedGroupId }));
    this.groupPermissions[selectedGroupId] = setting;
    this.defaultLayoutRolePermissions[selectedGroupId] = {
      defaultLayoutId: setting?.permission?.defaultLayout,
      groupId: selectedGroupId
    };
    this.searchProfileGroupPermissions[selectedGroupId] = {
      groupId: selectedGroupId,
      allowedSearchProfiles: setting?.permission?.allowedSearchProfiles,
      defaultSearchProfile: setting?.permission?.defaultSearchProfile
    };
    this.disabledCaseStatusesGroupPermissions[selectedGroupId] = {
      groupId: selectedGroupId,
      disabledCaseStatuses: setting?.permission?.statusesWithDisabledDelete || []
    };
    this.groupOptions = this.groupOptions.filter((groupOption) => {
      if (groupOption.id === selectedGroupId) {
        this.groupsWithPermissions.push(groupOption);
        return false;
      }
      return true;
    });
    if (fromUI) {
      this.selectedGroupId = null;
    }
  }

  createAnotherSettingUpdated(data: DynamicEntityCreateAnotherSetting): void {
    this.createAnotherItemSetting = { ...data };
  }

  onSelectionChange(): void {
    this.hasUnsavedChanges = true;
  }

  onSchemaRightsEmitted(value: RoleManualCreation | UserGroupManualCreation): void {
    this.hasUnsavedChanges = true;
    if (value['role']) {
      this.rolePermissions[value['role']] = cloneDeep(value);
    } else if (value['groupId']) {
      this.groupPermissions[value['groupId']] = cloneDeep(value);
    }
  }

  onSearchProfilechange(event: SearchProfilesRoleBased): void {
    if (event.groupId) {
      this.searchProfileGroupPermissions[event.groupId] = event;
    } else {
      this.searchProfileRolePermissions[event.role] = event;
    }
    this.hasUnsavedChanges = true;
    this.cdk.detectChanges();
  }

  onDefaultLayoutChange(event: DefaultLayoutSetting): void {
    if (event.role) {
      this.defaultLayoutRolePermissions[event.role] = event;
    } else if (event.groupId) {
      this.defaultLayoutGroupPermissions[event.groupId] = event;
    }
  }

  async getSystemGroups(): Promise<void> {
    const systemGroups = await this.userGroupsService.getSystemUserGroups(this.tenant);
    systemGroups.forEach((sysGroup) => {
      this.roleByGroupId[sysGroup.id] = sysGroup.systemGroup;
    });
  }

  populateLayoutsPerRoles(): void {
    const settingKey = `${dynamicGridSettingsKey}_${this.selectedSchemaId}_${this.areaType}`;
    this.roleLayoutSubs?.unsubscribe();
    this.roleLayoutSubs = this.store
      .select(sharedLayoutsPerRoleSelector)
      .pipe(
        filter((x) => !!x),
        takeUntil(this.destroyed$)
      )
      .subscribe((data) => {
        for (const groupId in data) {
          if (data.hasOwnProperty(groupId)) {
            const settings = data[groupId];
            const role = this.roleByGroupId[groupId];
            this.layoutsPerRole[role] = settings.filter((sett) => sett.key === settingKey);
          }
        }
      });
  }

  populateSearchProfilesPerRoles(): void {
    this.roleSearchProfilesSubs?.unsubscribe();
    this.roleSearchProfilesSubs = this.store
      .select(sharedSearchProfilesPerRoleSelector)
      .pipe(
        filter((x) => !!x),
        takeUntil(this.destroyed$)
      )
      .subscribe((data) => {
        for (const groupId in data) {
          if (data.hasOwnProperty(groupId)) {
            const settings = data[groupId];
            const role = this.roleByGroupId[groupId];
            this.searchProfilesPerRole[role] = this.prepareSearchProfiles(settings);
          }
        }
      });
  }

  populateLayoutsPerGroup(): void {
    this.groupLayoutSubs?.unsubscribe();
    this.groupLayoutSubs = this.store
      .select(sharedLayoutsPerGroupSelector)
      .pipe(
        filter((x) => !!x),
        takeUntil(this.destroyed$)
      )
      .subscribe((data) => {
        const settingKey = `${dynamicGridSettingsKey}_${this.selectedSchemaId}_${this.areaType}`;

        for (const groupId in data) {
          if (data.hasOwnProperty(groupId)) {
            const settings = data[groupId];
            this.layoutsPerGroup[groupId] = settings.filter((sett) => sett.key === settingKey);
          }
        }
      });
  }

  populateSearchProfilesPerGroup(): void {
    this.groupSearchProfilesSubs?.unsubscribe();
    this.groupSearchProfilesSubs = this.store
      .select(sharedSearchProfilesPerGroupSelector)
      .pipe(
        filter((x) => !!x),
        takeUntil(this.destroyed$)
      )
      .subscribe((data) => {
        for (const groupId in data) {
          if (data.hasOwnProperty(groupId)) {
            const settings = data[groupId];
            this.searchProfilesPerGroup[groupId] = this.prepareSearchProfiles(settings);
          }
        }
      });
  }

  prepareSearchProfiles(settings: Settings[]): DynamicEntitySearchProfileUI[] {
    const settKey = this.areaType === AreaTypeEnum.case ? appCaseSearchProfile : appRawDataSearchProfile;
    const filteredProfiles = cleanupSearchProfiles(settings);
    const availableSearchProfiles = filteredProfiles.filter((profile) => profile.key === settKey).map((x) => this.mapSearchProfileToUI(x));
    const searchProfiles = this.getSchemaSearchProfiles(availableSearchProfiles, this.selectedSchemaId);
    return searchProfiles || [];
  }

  mapSearchProfileToUI(x: Settings): DynamicEntitySearchProfileUI {
    const value = <DynamicEntitySearchProfile>x.value;
    return <DynamicEntitySearchProfileUI>{
      id: x.id,
      name: value.name,
      schemaId: x.value.schemaId
    };
  }

  getSchemaSearchProfiles(profiles: DynamicEntitySearchProfileUI[], schemaId: string): DynamicEntitySearchProfileUI[] {
    return profiles.filter((x) => {
      return x.schemaId === schemaId;
    });
  }

  subscribeToSharedUserSettings(): void {
    this.populateLayoutsPerRoles();
    this.populateSearchProfilesPerRoles();
    this.populateLayoutsPerGroup();
    this.populateSearchProfilesPerGroup();
  }

  onStatusChange(event: DisabledCasesRoleBased): void {
    if (event.groupId) {
      this.disabledCaseStatusesGroupPermissions[event.groupId] = event;
    } else {
      this.disabledCaseStatusesRolePermissions[event.role] = event;
    }
    this.hasUnsavedChanges = true;
    this.cdk.detectChanges();
  }

  onToggle(event: MatSlideToggleChange): void {
    this.hasUnsavedChanges = true;
    this.loadSearchAutomatically = event.checked;
  }
}
