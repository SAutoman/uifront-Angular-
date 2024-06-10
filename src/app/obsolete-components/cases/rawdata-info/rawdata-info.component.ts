// /**
//  * global
//  */
// import { Component, OnInit, Input } from '@angular/core';

// /**
//  * project
//  */
// import { CustomDatePipe } from '../../shared/date.pipe';
// import { RawDataFieldsService, RawDataEntity, FieldTypeIds, RawDataFieldInfo, SettingsUI } from '../../service-layer';
// import { transformGridDate } from '@wfm/shared/utils';
// import { TenantComponent } from '@wfm/shared/tenant.component';
// import { ApplicationState, getDateFormatSettingsSelector } from '@wfm/store';

// /**
//  * local
//  */
// import { each, keyBy } from 'lodash-core';
// import { takeUntil } from 'rxjs/operators';
// import { select, Store } from '@ngrx/store';
// import { IObjectMap } from '@wfm/common/models/i-object-map';

// export interface RawDataInfoEntityUI {
//   name: string;
//   value: any;
// }

// @Component({
//   selector: 'app-rawdata-info',
//   templateUrl: './rawdata-info.component.html',
//   styleUrls: ['./rawdata-info.component.scss']
// })
// export class RawdataInfoComponent extends TenantComponent implements OnInit {
//   @Input() item: RawDataEntity;
//   @Input() tenant: string;
//   data: RawDataInfoEntityUI[] = [];
//   datePipe = new CustomDatePipe();
//   @Input() title: string;
//   dateFormatDb: SettingsUI;
//   fields: IObjectMap<RawDataFieldInfo>;
//   componentId = '6b02013a-537b-4325-9f28-b686af6598c3';

//   constructor(private rawDataFieldsService: RawDataFieldsService, private store: Store<ApplicationState>) {
//     super(store);
//   }

//   async ngOnInit() {
//     const fields = await this.rawDataFieldsService.getFieldsByTenant(this.tenant);
//     this.fields = keyBy(fields, 'id');

//     this.store.pipe(takeUntil(this.destroyed$), select(getDateFormatSettingsSelector)).subscribe((data) => {
//       if (data.settings) {
//         this.dateFormatDb = data.settings[0];
//         this.transformData();
//       }
//     });

//     this.transformData();
//   }

//   private transformData() {
//     this.data = [];

//     each(this.item.extra, (item) => {
//       const fieldId = item.name;

//       if (this.fields[fieldId]) {
//         const fieldDefinition = this.fields[fieldId];
//         const data: RawDataInfoEntityUI = {
//           name: fieldDefinition.name,
//           value: item.value
//         };

//         if (fieldDefinition.valueType === FieldTypeIds.DateField) {
//           data.value = DateTimeFormatHelper.transformGridDate(item.value, this.dateFormatDb);
//         }
//         if (fieldDefinition.valueType === FieldTypeIds.DateTimeField) {
//           data.value = DateTimeFormatHelper.transformGridDate(item.value, this.dateFormatDb) + ' ' + moment(item.value).format('LT');
//         }
//         if (fieldDefinition.valueType === FieldTypeIds.TimeField) {
//           data.value = moment(item.value).format('LT');
//         }
//         this.data.push(data);
//       }
//     });
//     this.data.unshift(<RawDataInfoEntityUI>{ name: 'Updated', value: this.item.systemUpdatedAt });
//     this.data.unshift(<RawDataInfoEntityUI>{ name: 'Created', value: this.item.systemCreatedAt });
//     this.data.unshift(<RawDataInfoEntityUI>{ name: 'Status', value: this.item.status });
//     this.data.unshift(<RawDataInfoEntityUI>{ name: 'External Key', value: this.item.externalSystemRef });
//   }
// }
