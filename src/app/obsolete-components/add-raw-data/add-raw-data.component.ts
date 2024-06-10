// /**
//  * global
//  */
// import { Component, OnInit } from '@angular/core';
// import { select, Store } from '@ngrx/store';
// import { takeUntil } from 'rxjs/operators';

// import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
// import { endsWith } from 'lodash-core';
// import { FormGroup } from '@angular/forms';

// /**
//  * project
//  */
// import { environment } from '@src/environments/environment';
// import {
//   extRefIdRequired,
//   FieldTypeIds,
//   FieldValueDtoBase,
//   ListsService,
//   RawDataEntity,
//   RawDataFieldInfo,
//   RawDataFieldsService,
//   RawDataImportItem,
//   RawDataNewUpdate,
//   SettingsUI
// } from '@wfm/service-layer';

// import { ApplicationState, userProfile } from '@wfm/store';
// import { TenantComponent } from '@wfm/shared/tenant.component';
// import { RawDataService } from '@wfm/service-layer/services/raw-data.service';
// import { RawDataEntityService } from '@wfm/service-layer/services/row-data-entity.service';

// import { DateTimeAdapterSectionEnum, FormlyFieldAdapterFactory, FormVariableDto } from '@wfm/common/vendor';

// import { IObjectMap } from '@wfm/common/models';
// import { Animations } from '@wfm/animations/animations';

// /**
//  * local
//  */

// @Component({
//   selector: 'app-add-raw-data',
//   templateUrl: './add-raw-data.component.html',
//   styleUrls: ['./add-raw-data.component.scss'],
//   animations: Animations
// })
// export class AddRawDataComponent extends TenantComponent implements OnInit {
//   fields: RawDataFieldInfo[] = [];
//   isValid: boolean;
//   selectedItem: IObjectMap<any>;
//   buttonText: string;
//   private tenantSettings: SettingsUI[];

//   private rawDataEntity: RawDataEntity;

//   form = new FormGroup({});
//   model: any = {};
//   options: FormlyFormOptions = {
//     formState: {
//       awesomeIsForced: false
//     }
//   };
//   formlyFieldConfigs: FormlyFieldConfig[] = [];

//   constructor(
//     private rawDataService: RawDataService,
//     private rawDataEntityService: RawDataEntityService,
//     private dialogRef: MatDialogRef<AddRawDataComponent>,
//     private rawDataFieldsService: RawDataFieldsService,
//     private snackBar: MatSnackBar,
//     private listsService: ListsService,
//     private store: Store<ApplicationState>
//   ) {
//     super(store);
//   }

//   ngOnInit(): void {
//     this.store.pipe(takeUntil(this.destroyed$), select(userProfile)).subscribe((data) => {
//       if (data) {
//         this.tenantSettings = data.tenant.tenantSettings;
//       }
//     });

//     this.loadData();

//     this.buttonText = this.selectedItem ? 'Update' : 'Create';
//   }

//   async loadData(): Promise<void> {
//     if (this.selectedItem) {
//       this.rawDataEntity = await this.rawDataEntityService.getById(this.tenant, this.selectedItem.id);
//       if (this.rawDataEntity?.extra?.length) {
//         this.rawDataEntity.extra.forEach((field) => {
//           this.rawDataEntity[field.name] = field.value;
//         });
//       }
//     }

//     this.fields = await this.rawDataFieldsService.getFieldsByTenant(this.tenant);
//     this.fields.map((f) => (f.valueType = f['type']));
//     const fieldNames = ['status', 'systemCreatedAt', 'systemUpdatedAt'];
//     const fieldMap = new Map();
//     fieldNames.forEach((x) => fieldMap.set(x, x));

//     this.fields = this.fields.filter((f) => !fieldMap.has(f.id));
//     this.createFormlyConfig();
//   }

//   createFormlyConfig(): void {
//     const editedRow = this.rawDataEntity || {};
//     this.fields.forEach((field: RawDataFieldInfo) => {
//       const formVariableDto: FormVariableDto = {
//         type: field.valueType,
//         value: editedRow[field.id] || undefined,
//         name: field.id,
//         label: field.name,
//         valueInfo: {
//           // options: KeyValue<string, any>[],
//           // dateTimeAdapterType: DateTimeAdapterEnum,
//         },
//         required: field.configuration ? field.configuration.required : false,
//         readonly: false,
//         // disabled: boolean,
//         min: field.configuration?.min || undefined,
//         max: field.configuration?.max || undefined
//         // [attribute: string]: any,
//       };
//       if (field.valueType === FieldTypeIds.TimeField && !!formVariableDto.value && endsWith(formVariableDto.value, 'Z')) {
//         // convert to local value
//         const sectionName = DateTimeAdapterSectionEnum.appFormlyMatDatePickerConfig;
//         formVariableDto.valueInfo[sectionName] = {
//           useZeroOffset: true
//         };
//       }

//       const adapter = FormlyFieldAdapterFactory.createAdapter(formVariableDto);
//       const fieldConfig = adapter.getConfig();
//       // const fieldValue = adapter.getValue();
//       fieldConfig.className = 'raw-data-field';

//       if (field.valueType === FieldTypeIds.ListField) {
//         fieldConfig.templateOptions.compareWith = (o1, o2) => (o2 && o1 ? o1.item === o2 : false);
//         this.listsService.getListItems(this.tenant, 'D74C627BAC2F3F40B8C1EB4C00EA3ED7').then((list) => {
//           const options = list.items.map((listItem) => ({ value: listItem, key: listItem.item }));
//           fieldConfig.templateOptions.options = options;
//         });
//       }

//       this.formlyFieldConfigs.push(fieldConfig);
//     });
//   }

//   onChange(): void {
//     this.isValid = this.fields.every((f) => f.isValid);
//   }

//   mapFieldToRawData(field: RawDataFieldInfo): RawDataImportItem {
//     const rawData = {} as RawDataImportItem;
//     rawData.id = field.id;
//     rawData.value = field.value;

//     return rawData;
//   }

//   async onSave(): Promise<void> {
//     this.fields.forEach((x) => {
//       x.value = <FieldValueDtoBase>{
//         id: x.id,
//         type: x.valueType,
//         value: this.form.value[x.id]
//       };

//       if (x.valueType === FieldTypeIds.ListField && this.form.value[x.id]) {
//         x.value.value = {
//           listItemId: this.form.value[x.id].id,
//           listItemName: this.form.value[x.id].item
//         };
//       }
//     });

//     const isExternalKeyRequired = this.tenantSettings.filter((s) => s.key === extRefIdRequired);
//     const externalSystemRef = this.form.value['externalSystemRef'];
//     const hasData = this.fields.length > 0;

//     const cmd = <RawDataNewUpdate>{
//       appId: environment.appId,
//       fields: this.fields.map((x) => x.value),
//       tenantId: this.tenant
//     };

//     try {
//       if (this.rawDataEntity) {
//         cmd.publicId = this.rawDataEntity.id;
//         // await this.rawDataService.update(cmd);
//       } else {
//         // await this.rawDataService.create(cmd);
//       }
//       this.snackBar.open('Raw data updated successfully!', 'CLOSE', {
//         duration: 3000
//       });
//     } catch (error) {
//       if (isExternalKeyRequired[0].value && !externalSystemRef) {
//         this.snackBar.open('External Key is Required!', 'CLOSE', { duration: 3000 });
//       } else {
//         this.snackBar.open(`${error}`, 'CLOSE', { duration: 5000 });
//       }

//       return;
//     }
//     this.dialogRef.close(hasData);
//   }
// }
