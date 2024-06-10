// import { cloneDeep, startsWith } from 'lodash-core';

// import {
//   allowManualCreation,
//   DynamicEntityDto,
//   FieldTypeIds,
//   PagedData,
//   RawDataStatus,
//   Roles,
//   SettingsUI,
//   TenantProfile
// } from '@wfm/service-layer';
// import { AuthState } from '@wfm/store';
// import { IPermission } from './i-permission';
// import { IConfigurableListItem } from '@wfm/common/models';
// import { GridDataResult } from '@progress/kendo-angular-grid';
// import { convertRawDataStatus, transformGridDate } from '@wfm/shared/utils';
// import { DateFieldValueDto, DateTimeFieldValueDto, StringFieldValueDto, TimeFieldValueDto } from '@wfm/service-layer/models/FieldValueDto';

// export const statusKey = 'status';
// export const settingsKey: 'details' | 'overview' = 'overview';

// export function getPermissions(tenantId: string, auth: AuthState): IPermission {
//   const tenantProfiles: TenantProfile[] = auth?.rolesPerTenant || [];
//   const allowManualCreationDb = auth.tenant?.tenantSettings?.find((x) => x.key === allowManualCreation)?.value;
//   const tenantProfile: TenantProfile = tenantProfiles.find((x) => x.tenantId === tenantId);
//   const roleId = Roles[tenantProfile.role];

//   const defaultPermissions: IPermission = {
//     add: false,
//     delete: false,
//     edit: false
//   };

//   const rolePermissions = allowManualCreationDb?.rolePermissions?.find((x) => x.role === roleId)?.permission || {};
//   return Object.assign(defaultPermissions, cloneDeep(rolePermissions));
// }

// export function toKendoProperty(propName: string): string {
//   return '_' + propName;
// }

// export function kendoPropertyToNative(kendoPropName: string): string {
//   if (startsWith(kendoPropName, '_')) {
//     return kendoPropName.substr(1);
//   }
//   return kendoPropName;
// }

// export function mapRawDataToKendoData(
//   page: PagedData<DynamicEntityDto>,
//   dateFormatDb: SettingsUI,
//   columns: IConfigurableListItem[]
// ): GridDataResult {
//   const inputRawData = page?.items || [];

//   const tenantStatusField = columns.find((x) => x.name === statusKey);

//   const kendoRowsData = inputRawData.map((item) => {
//     const copy = cloneDeep(item);
//     /**
//      * just alice for understanding
//      */
//     copy.rowId = copy.id;
//     copy.dynamicRawDtoRef = cloneDeep(item);

//     /**
//      * create  map via fieldId and property value
//      */
//     const dataFields = item.fields || [];
//     dataFields.forEach((x) => {
//       const fieldKey = toKendoProperty(x.id);
//       let uiValue = x.value;
//       if (uiValue && x.type === FieldTypeIds.DateField) {
//         const converted = <DateFieldValueDto>x;
//         uiValue = DateTimeFormatHelper.transformGridDate(converted.value, dateFormatDb);
//       }
//       if (uiValue && x.type === FieldTypeIds.DateTimeField) {
//         const converted = <DateTimeFieldValueDto>x;
//         uiValue = DateTimeFormatHelper.transformGridDate(converted.value, dateFormatDb) + ' ' + moment(converted.value).format('LT');
//       }
//       if (uiValue && x.type === FieldTypeIds.TimeField) {
//         const converted = <TimeFieldValueDto>x;
//         uiValue = moment(converted.value).utcOffset(0).format('LT');
//       }
//       if (tenantStatusField && x.id === tenantStatusField.id) {
//         const converted = <StringFieldValueDto>x;
//         const status: RawDataStatus = RawDataStatus[converted.value];
//         uiValue = convertRawDataStatus(status);
//       }

//       copy[fieldKey] = uiValue;
//     });
//     let dataStatus = RawDataStatus.Unassigned;
//     if (tenantStatusField) {
//       const statusField = <StringFieldValueDto>dataFields.find((x) => x.id === tenantStatusField.id);
//       const statusFieldValueToEnum: RawDataStatus = RawDataStatus[statusField?.value];
//       dataStatus = statusFieldValueToEnum || dataStatus;
//     }

//     copy[statusKey] = dataStatus;

//     copy._systemCreatedAt = DateTimeFormatHelper.transformGridDate(copy.systemCreatedAt, dateFormatDb);
//     copy._systemUpdatedAt = DateTimeFormatHelper.transformGridDate(copy.systemUpdatedAt, dateFormatDb);
//     copy.isChecked = false;
//     return copy;
//   });
//   return {
//     data: kendoRowsData,
//     total: page.total
//   };
// }
