// /**
//  * global
//  */
// import { Injectable } from '@angular/core';
// import { BehaviorSubject } from 'rxjs';
// import { GridComponent, GridDataResult } from '@progress/kendo-angular-grid';
// import { keyBy } from 'lodash-core';

// /**
//  * project
//  */
// import { CustomDatePipe } from '@wfm/shared/date.pipe';
// import { RawDataStatus, Roles, Sorting, Paging, SettingsUI, GridSettings, ColumnSettings } from '@wfm/service-layer/models';
// import { RawDataEntityService, RawDataFieldInfo, FieldTypeIds } from '@wfm/service-layer';
// import { convertRawDataStatus } from '@wfm/shared/utils';
// import { SearchFieldModel } from '@wfm/service-layer/models/dynamic-entity-models';
// import DateTimeFormatHelper from '@wfm/shared/dateTimeFormatHelper';

// /**
//  * local
//  */

// @Injectable({
//   providedIn: 'root'
// })
// export class RawDataGridService extends BehaviorSubject<GridDataResult> {
//   datePipe = new CustomDatePipe();

//   constructor(private rawDataService: RawDataEntityService) {
//     super(null);
//   }

//   async query(
//     tenant: string,
//     supplier: string,
//     selectedRole: Roles,
//     paging?: Paging,
//     filters?: SearchFieldModel[],
//     sortArr?: Sorting[],
//     fieldsDefinitions?: RawDataFieldInfo[],
//     dateFormatDb?: SettingsUI
//   ): Promise<void> {
//     const data = await this.rawDataService.search(tenant, paging, sortArr, filters, supplier, selectedRole);
//     const fields = keyBy(fieldsDefinitions, 'id');

//     data.items.forEach((i) => {
//       if (i.extra) {
//         i.extra.forEach((f) => {
//           if (fields[f.name] && fields[f.name].type === FieldTypeIds.DateField) {
//             i[f.name] = DateTimeFormatHelper.transformGridDate(f.value, dateFormatDb);
//           }
//           if (fields[f.name] && fields[f.name].type === FieldTypeIds.DateTimeField) {
//             i[f.name] = DateTimeFormatHelper.transformGridDate(f.value, dateFormatDb) + ' ' + moment(f.value).format('LT');
//           }
//           if (fields[f.name] && fields[f.name].type === FieldTypeIds.TimeField) {
//             i[f.name] = moment(f.value).utcOffset(0).format('LT');
//           }
//           i[f.name] = i[f.name] || f.value;
//         });
//       }

//       i.status = convertRawDataStatus(<RawDataStatus>(<any>i.status));
//       i.systemCreatedAt = DateTimeFormatHelper.transformGridDate(i.systemCreatedAt, dateFormatDb);
//       i.systemUpdatedAt = DateTimeFormatHelper.transformGridDate(i.systemUpdatedAt, dateFormatDb);
//     });

//     super.next(<GridDataResult>{ total: data.total, data: data.items });
//   }

//   mapGridSettings(settings: string): GridSettings {
//     if (!settings) {
//       return null;
//     }
//     let gridSettings;
//     try {
//       gridSettings = JSON.parse(<any>settings);
//     } catch (e) {
//       console.error(e);
//       return;
//     }

//     const state = gridSettings.state;

//     return {
//       state,
//       columnsConfig: gridSettings?.columnsConfig?.sort((a, b) => a.orderIndex - b.orderIndex)
//     };
//   }

//   getGridSettingsFromGridComponent(grid: GridComponent): GridSettings {
//     let columns = grid.columns.toArray().map((item) => {
//       if (!item['field'] && !item['columnMenu']) {
//         item['isActionType'] = true;
//       }

//       return Object.keys(item)
//         .filter((propName) => {
//           const noTemplate = !propName.toLowerCase().includes('template');
//           const noNg = !propName.includes('__ng');

//           return noTemplate && noNg;
//         })
//         .reduce((acc, curr) => ({ ...acc, ...{ [curr]: item[curr] } }), <ColumnSettings>{});
//     });

//     return {
//       state: { sort: grid.sort },
//       columnsConfig: columns
//     };
//   }
// }
