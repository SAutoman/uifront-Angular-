/**
 * global
 */
import { Injectable } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { filter, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';

/**
 * project
 */
import { IFieldSettingsVisibilityDto } from '@wfm/forms-flow-struct';

import {
  currentTenantSelector,
  FetchTenantSettingsAction,
  PatchTenantSettingsSection,
  tenantSettingsSelector,
  loggedInState
} from '@wfm/store';

import { IConfigurableListItem, KeyValueView } from '@wfm/common/models';
import {
  ADMIN_RAW_DATA_FIELDS_VISIBILITY_KEY,
  AreaTypeEnum,
  Settings,
  SettingsUI,
  TenantProfile,
  TenantSettingsDto,
  TenantSettingsService
} from '@wfm/service-layer';
import { AdminFieldSetting, FIELD_SETTING_VISIBILITY_KEYS, IFieldSettingDataRef } from '@wfm/tenant-admin/models';

/**
 * local
 */
import { AdminRawDataFieldsService } from '../field/admin-raw-data-fields.service';
import { TranslateService } from '@ngx-translate/core';

export interface IFieldSettingsVisibilityConfig<T = any> {
  tenantId?: string;
  name: string;
  items: IFieldSettingsVisibilityDto<T>[];
}
@Injectable()
export class AdminRawDataFieldSettingsVisibilityService {
  constructor(
    private store: Store<any>,
    private tenantSettingsService: TenantSettingsService,
    private rawFieldsService: AdminRawDataFieldsService,
    private ts: TranslateService
  ) {}

  getConfig(): Observable<IFieldSettingsVisibilityConfig> {
    const config: IFieldSettingsVisibilityConfig = {
      tenantId: undefined,
      name: 'Raw Data Fields Visibility',
      items: []
    };

    return combineLatest([this.store.select(currentTenantSelector), this.store.select(tenantSettingsSelector)]).pipe(
      filter(([tenantId, settings]) => !!tenantId && !!settings && !!settings.length),
      map(([tenantId, settings]) => {
        config.tenantId = tenantId;
        return settings;
      }),
      switchMap((settings) => {
        const key = ADMIN_RAW_DATA_FIELDS_VISIBILITY_KEY;
        const visibilitySetting: SettingsUI[] = ([] = settings.filter((x) => x.key === key));

        return this.rawFieldsService.getList(config.tenantId, undefined).pipe(
          map((x) => {
            return {
              settings: visibilitySetting,
              fields: x.items
            };
          })
        );
      }),
      map((data) => {
        const settings: SettingsUI[] = data.settings;
        const fields: IConfigurableListItem[] = ([] = data.fields.filter(
          (x) => x.areaTypes.includes(AreaTypeEnum.rawData) || x.areaTypes.includes(AreaTypeEnum.all)
        ));

        const fieldMap = new Map<string, IConfigurableListItem>();

        fields.forEach((x) => fieldMap.set(x.id, x));

        const items: IFieldSettingsVisibilityDto<IFieldSettingDataRef<IConfigurableListItem>>[] = [];
        const keys = FIELD_SETTING_VISIBILITY_KEYS;

        fields.forEach((f) => {
          const SettingsUIAll = settings ? settings.filter((x) => x.value.fieldId === f.id) : null;
          const SettingsUI = SettingsUIAll && SettingsUIAll.length > 0 ? SettingsUIAll[SettingsUIAll.length - 1] : null;
          const currentSettings: AdminFieldSetting = SettingsUI ? SettingsUI.value : null;
          const keyValues = {
            details: currentSettings && currentSettings.setting ? currentSettings.setting.details : false,
            overview: currentSettings && currentSettings.setting ? currentSettings.setting.overview : false
          };
          items.push({
            id: f.id,
            name: f.viewName,
            toched: false,
            options: [
              new KeyValueView(keys.details.key, keyValues.details, this.ts.instant(keys.details.viewValue)),
              new KeyValueView(keys.overview.key, keyValues.overview, this.ts.instant(keys.overview.viewValue))
            ],
            useKeys: [keys.details.key, keys.overview.key],
            data: {
              fieldRef: f,
              settingRef: {
                fieldId: f.id,
                toched: false,
                setting: {
                  details: keyValues.details,
                  overview: keyValues.overview
                }
              }
            }
          });
        });
        config.items = items;
        return config;
      })
    );
  }

  bulkUpdate(items: IFieldSettingsVisibilityDto<IFieldSettingDataRef<IConfigurableListItem>>[], tenantId?: string): Observable<boolean> {
    const keys = FIELD_SETTING_VISIBILITY_KEYS;
    const fieldSettings = items.map((x) => {
      const fieldSetting: AdminFieldSetting = {
        fieldId: x.id,
        setting: {
          details: x.options.find((j) => j.key === keys.details.key).value,
          overview: x.options.find((j) => j.key === keys.overview.key).value
        }
      };
      return fieldSetting;
    });

    const settingsList: Settings[] = [];

    fieldSettings.forEach((element) => {
      const settings = <Settings>{
        key: ADMIN_RAW_DATA_FIELDS_VISIBILITY_KEY,
        value: element
      };
      settingsList.push(settings);
    });

    const cmd = <TenantSettingsDto>{
      settings: settingsList,
      tenantId: tenantId
    };

    let tenantProfile;
    let profile;
    this.store.pipe(select(loggedInState)).subscribe((data): any => {
      if (data.currentTenantSystem && data.currentTenantSystem.tenantSettings && data.rolesPerTenant) {
        tenantProfile = data.currentTenantSystem;
        profile = data.profile;
      }
    });

    return this.tenantSettingsService.updateTenantSettings$(cmd).pipe(
      tap(() => {
        this.store.dispatch(
          new FetchTenantSettingsAction({
            tenant: tenantProfile?.tenant,
            userId: profile?.id
          })
        );
      }),
      map(() => true),
      take(1)
    );
  }
}
