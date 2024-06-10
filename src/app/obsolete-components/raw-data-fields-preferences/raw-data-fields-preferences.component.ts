// /**
//  * global
//  */
// import { Component, OnInit } from '@angular/core';
// import { Store, select } from '@ngrx/store';
// import { takeUntil } from 'rxjs/operators';
// import { MatSnackBar } from '@angular/material/snack-bar';

// /**
//  * project
//  */

// import { TenantSettingsDto, RAW_DATA_FIELDS_VISIBILITY_KEY, RawDataFieldInfo, Settings, TenantSettingsService } from '@wfm/service-layer';
// import { getFieldsByTenantSelector, ApplicationState, GetAdminFieldsByTenant, GetFieldsByTenant } from '@wfm/store';
// import { TenantComponent } from '@wfm/shared/tenant.component';

// /**
//  * local
//  */
// import { FieldSettingUI, FieldSettingValues } from '../models';

// @Component({
//   selector: 'app-raw-data-fields-preferences',
//   templateUrl: './raw-data-fields-preferences.component.html',
//   styleUrls: ['./raw-data-fields-preferences.component.scss']
// })
// /**
//  * @deprecated
//  */
// export class RawDataFieldsPreferencesComponent extends TenantComponent implements OnInit {
//   fields: RawDataFieldInfo[] = [];
//   fieldsSettings: FieldSettingUI[] = [];
//   fieldsSettingsAll: FieldSettingUI[];
//   settingsDto: Settings[] = [];
//   componentId = '4b224e94-8756-4e34-bbba-9927969ca2a6';

//   constructor(private store: Store<ApplicationState>, private snackBar: MatSnackBar, private tenantSettingsService: TenantSettingsService) {
//     super(store);
//   }

//   async ngOnInit() {
//     await this.store.dispatch(new GetAdminFieldsByTenant({ id: this.tenant }));
//     await this.store.dispatch(new GetFieldsByTenant({ id: this.tenant }));

//     this.store.pipe(takeUntil(this.destroyed$), select(getFieldsByTenantSelector)).subscribe((data) => {
//       if (data) {
//         this.fields = data;
//       }
//     });

//     await this.loadData();
//   }

//   mapFieldsToUI(x: RawDataFieldInfo): FieldSettingUI {
//     return <FieldSettingUI>{
//       name: x.id,
//       nameUI: x.name,
//       fieldId: x.publicId,
//       setting: <FieldSettingValues>{ details: null, overview: null }
//     };
//   }

//   async loadData() {
//     const tenantSettings = await this.tenantSettingsService.getByTenant(this.tenant);
//     this.fieldsSettingsAll = this.fields.map((x) => this.mapFieldsToUI(x));
//     const rawDataFieldsSettings = tenantSettings.settings.find((x) => x.key === RAW_DATA_FIELDS_VISIBILITY_KEY);

//     if (!rawDataFieldsSettings) {
//       return;
//     }

//     const rawDataFieldsSettingsValue = rawDataFieldsSettings.value;

//     rawDataFieldsSettingsValue[RAW_DATA_FIELDS_VISIBILITY_KEY].forEach((x) => {
//       const temp = this.fieldsSettingsAll.find((f) => f.fieldId === x.fieldId);
//       if (temp) {
//         temp.setting = x.setting;
//         this.fieldsSettings.push(temp);
//       }
//     });
//   }

//   onCheckboxClicked(field: FieldSettingUI, details?, overview?) {
//     field.setting = <FieldSettingValues>{ details: details.checked, overview: overview.checked };
//     const foundElement = this.fieldsSettings.find((x) => x.fieldId === field.fieldId);

//     if (foundElement) {
//       this.fieldsSettings = this.fieldsSettings.filter((x) => x !== foundElement);
//     }

//     this.fieldsSettings.push(field);
//   }

//   async onSubmit() {
//     const rawDataFieldVisibilityValue = <Settings>{
//       key: RAW_DATA_FIELDS_VISIBILITY_KEY,
//       value: { [RAW_DATA_FIELDS_VISIBILITY_KEY]: this.fieldsSettings }
//     };

//     const cmd = <TenantSettingsDto>{
//       settings: [rawDataFieldVisibilityValue],
//       tenantId: this.tenant
//     };

//     await this.tenantSettingsService.update(cmd);
//     this.snackBar.open('Field Settings Saved Successfully!', 'CLOSE', { duration: 2000 });
//   }
// }
