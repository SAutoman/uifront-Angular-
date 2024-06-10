import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { filter, take, takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { AreaTypeEnum, Roles, SchemaDto, Settings, SettingsUI, TenantSettingsDto, TenantSettingsService } from '@wfm/service-layer';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState, AuthState, FetchTenantSettingsAction, tenantSettingsSelector, loggedInState } from '@wfm/store';
import { MappingSettingsItem } from '../mapping-settings-item/mapping-settings-item.component';
import { BehaviorSubject } from 'rxjs';
import { cloneDeep } from 'lodash-core';

const mappingPermissionskey = 'mappingPermissions';
enum MappingSettingTypeEnum {
  DEFAULT = 0,
  MAPPED_AND_UNMAPPED,
  EXACT_MATCH
}
export interface MappingSettings {
  rolePermissions: MappingRolePermission[];
}

interface MappingRolePermission {
  role: Roles;
  permission: {
    settingType: MappingSettingTypeEnum;
    fields: {
      fieldName: string;
    }[];
    keyValueSeperator: string;
  };
}

@Component({
  selector: 'app-mapping-settings',
  templateUrl: './mapping-settings.component.html',
  styleUrls: ['./mapping-settings.component.scss']
})
export class MappingSettingsComponent extends TenantComponent implements OnInit, OnChanges, OnDestroy {
  @Input() schemasData: SchemaDto[];
  @Input() areaType: AreaTypeEnum;

  tenantAuthState: AuthState;
  setting$: BehaviorSubject<MappingSettings> = new BehaviorSubject(null);
  tenantSettings: SettingsUI[];
  selectedSchemaId: string;
  settingId: string;
  updatedFormvalue: MappingRolePermission[] = [
    {
      role: Roles.Supplier,
      permission: {
        settingType: null,
        fields: [],
        keyValueSeperator: null
      }
    },
    {
      role: Roles.Auditor,
      permission: {
        settingType: null,
        fields: [],
        keyValueSeperator: null
      }
    }
  ];

  get mappingSettingTypeEnum() {
    return MappingSettingTypeEnum;
  }

  get RoleTypes() {
    return Roles;
  }

  constructor(
    private store: Store<ApplicationState>,
    private tenantsService: TenantSettingsService,
    private snackBar: MatSnackBar,
    private ts: TranslateService
  ) {
    super(store);
  }

  ngOnInit(): void {
    this.store
      .pipe(
        select(loggedInState),
        filter((x) => !!x),
        take(1)
      )
      .subscribe((data) => {
        this.tenantAuthState = data;
      });

    this.store.pipe(select(tenantSettingsSelector), takeUntil(this.destroyed$)).subscribe((data) => {
      this.tenantSettings = data;
      if (this.selectedSchemaId && this.tenantSettings?.length) {
        this.filterSettings(this.selectedSchemaId);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.schemasData && changes.schemasData.currentValue !== changes.schemasData.previousValue) {
      if (this.schemasData?.length) {
        this.selectedSchemaId = this.schemasData[0]?.id;
        if (this.selectedSchemaId) {
          this.filterSettings(this.selectedSchemaId);
        }
      }
    }
  }

  filterSettings(schemaId: string): void {
    if (this.tenantSettings?.length) {
      const selectedSchemaSettings = this.tenantSettings.find((x) =>
        x.key.includes(`${mappingPermissionskey}_${schemaId}_${this.areaType}`)
      );
      this.settingId = selectedSchemaSettings?.id ? selectedSchemaSettings.id : null;
      const settings = selectedSchemaSettings?.value ? selectedSchemaSettings.value : null;
      this.setting$.next(cloneDeep(settings));
    }
  }

  onValueChange(event: MappingSettingsItem): void {
    this.updateValuePerRole(event);
  }

  updateValuePerRole(value: MappingSettingsItem): void {
    switch (value.roleType) {
      case Roles.Supplier:
        this.updatedFormvalue[0] = {
          role: value.roleType,
          permission: {
            settingType: value.settingType,
            keyValueSeperator: value.valueSeparator,
            fields:
              value.settingType === MappingSettingTypeEnum.EXACT_MATCH
                ? [
                    {
                      fieldName: value.fieldName
                    }
                  ]
                : []
          }
        };
        break;
      case Roles.Auditor:
        this.updatedFormvalue[1] = {
          role: value.roleType,
          permission: {
            settingType: value.settingType,
            keyValueSeperator: value.valueSeparator,
            fields:
              value.settingType === MappingSettingTypeEnum.EXACT_MATCH
                ? [
                    {
                      fieldName: value.fieldName
                    }
                  ]
                : []
          }
        };
        break;
      default:
        break;
    }
  }

  async onSubmit(): Promise<void> {
    const settings: MappingSettings = {
      rolePermissions: this.updatedFormvalue
    };
    const userSettings = <Settings>{
      key: `${mappingPermissionskey}_${this.selectedSchemaId}_${this.areaType}`,
      value: settings,
      id: this.settingId
    };
    const cmd = <TenantSettingsDto>{
      settings: [userSettings],
      tenantId: this.tenant
    };
    await this.tenantsService.update(cmd);
    this.snackBar.open(this.ts.instant('Tenant Settings Saved Successfully!'), 'CLOSE', { duration: 2000 });
    this.refreshTenantSettings();
  }

  isValid(): boolean {
    const rolePermissions = this.updatedFormvalue;
    let isValid = true;
    rolePermissions.forEach((p) => {
      const permission = p.permission;
      if (permission.settingType === MappingSettingTypeEnum.EXACT_MATCH) {
        const field = permission.fields[0];
        if (!field.fieldName || !permission.keyValueSeperator) {
          isValid = false;
          return isValid;
        }
      }
    });
    return isValid;
  }

  refreshTenantSettings(): void {
    this.store.dispatch(
      new FetchTenantSettingsAction({ tenant: this.tenantAuthState.currentTenantSystem.tenant, userId: this.tenantAuthState.profile.id })
    );
  }

  onSchemaChange(id: string): void {
    this.filterSettings(id);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }
}
