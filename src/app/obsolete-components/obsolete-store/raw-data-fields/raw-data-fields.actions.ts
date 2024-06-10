// /**
//  * global
//  */
// import { Action } from '@ngrx/store';
// import { Update } from '@ngrx/entity';
// /**
//  * project
//  */
// import { RawDataFieldInfo, FieldDtoAdmin } from '../../service-layer';
// import { RawDataFieldsModel, CreateRawDataFieldModel } from '@wfm/service-layer/models/dynamic-entity-models';

// /**
//  * local
//  */

// export enum RawDataFieldsActionTypes {
//   GetFieldsByTenant = '[RawDataFields] GetFieldsByTenant',
//   GetFieldsByTenantSuccess = '[RawDataFields] GetFieldsByTenant Success',
//   GetFieldsByTenantFail = '[RawDataFields] GetFieldsByTenant Fail',

//   GetAdminFieldsFieldsByTenant = '[TenantAdmin] GetAdminFieldsFieldsByTenant',
//   GetAdminFieldsFieldsByTenantSuccess = '[TenantAdmin] GetAdminFieldsFieldsByTenant Success',
//   GetAdminFieldsFieldsByTenantFail = '[TenantAdmin] GetAdminFieldsFieldsByTenant Fail',

//   AddRawDataField = '[RawDataFields] AddRawDataField',
//   AddRawDataFieldSuccess = '[RawDataFields] AddRawDataFieldSuccess Success',
//   AddRawDataFieldFail = '[RawDataFields] AddRawDataFieldFail Fail',

//   UpdateRawDataField = '[RawDataFields] UpdateRawDataField',
//   UpdateRawDataFieldSuccess = '[RawDataFields] UpdateRawDataFieldSuccess Success',
//   UpdateRawDataFieldFail = '[RawDataFields] UpdateRawDataFieldFail Fail',

//   RemoveRawDataField = '[RawDataFields] RemoveRawDataField',
//   RemoveRawDataFieldSuccess = '[RawDataFields] RemoveRawDataFieldSuccess Success',
//   RemoveRawDataFieldFail = '[RawDataFields] RemoveRawDataFieldFail Fail'
// }

// // ========================================= Get Fields By Tenant

// export class GetFieldsByTenant implements Action {
//   readonly type = RawDataFieldsActionTypes.GetFieldsByTenant;
//   constructor(public payload: { id: string }) {}
// }

// export class GetFieldsByTenantSuccess implements Action {
//   readonly type = RawDataFieldsActionTypes.GetFieldsByTenantSuccess;
//   constructor(public payload: { result: RawDataFieldInfo[] }) {}
// }

// export class GetFieldsByTenantFail implements Action {
//   readonly type = RawDataFieldsActionTypes.GetFieldsByTenantFail;
//   constructor(public payload: { error: string }) {}
// }

// // ========================================= Get Admin Fields By Tenant

// export class GetAdminFieldsByTenant implements Action {
//   readonly type = RawDataFieldsActionTypes.GetAdminFieldsFieldsByTenant;
//   constructor(public payload: { id: string }) {}
// }

// export class GetAdminFieldsByTenantSuccess implements Action {
//   readonly type = RawDataFieldsActionTypes.GetAdminFieldsFieldsByTenantSuccess;
//   constructor(public payload: { result: FieldDtoAdmin[] }) {}
// }

// export class GetAdminFieldsByTenantFail implements Action {
//   readonly type = RawDataFieldsActionTypes.GetAdminFieldsFieldsByTenantFail;
//   constructor(public payload: { error: string }) {}
// }

// // ========================================= Add Raw Data Field

// export class AddRawDataField implements Action {
//   readonly type = RawDataFieldsActionTypes.AddRawDataField;
//   constructor(public payload: { tenantId: string; data: CreateRawDataFieldModel }) {}
// }

// export class AddRawDataFieldSuccess implements Action {
//   readonly type = RawDataFieldsActionTypes.AddRawDataFieldSuccess;
//   constructor(public payload: { result: CreateRawDataFieldModel }) {}
// }

// export class AddRawDataFieldFail implements Action {
//   readonly type = RawDataFieldsActionTypes.AddRawDataFieldFail;
//   constructor(public payload: { error: string }) {}
// }

// // ========================================= Update list

// export class UpdateRawDataField implements Action {
//   readonly type = RawDataFieldsActionTypes.UpdateRawDataField;
//   constructor(public payload: { tenantId: string; rawDataFieldId: string; data: any }) {}
// }

// export class UpdateRawDataFieldSuccess implements Action {
//   readonly type = RawDataFieldsActionTypes.UpdateRawDataFieldSuccess;
//   constructor(public payload: { update: Update<RawDataFieldsModel> }) {}
// }

// export class UpdateRawDataFieldFail implements Action {
//   readonly type = RawDataFieldsActionTypes.UpdateRawDataFieldFail;
//   constructor(public payload: { error: string }) {}
// }

// // ========================================= Remove Raw Data Field

// export class RemoveRawDataField implements Action {
//   readonly type = RawDataFieldsActionTypes.RemoveRawDataField;
//   constructor(public payload: { tenantId: string; RawDataField: string }) {}
// }

// export class RemoveRawDataFieldSuccess implements Action {
//   readonly type = RawDataFieldsActionTypes.RemoveRawDataFieldSuccess;
// }

// export class RemoveRawDataFieldFail implements Action {
//   readonly type = RawDataFieldsActionTypes.RemoveRawDataFieldFail;
//   constructor(public payload: { error: string }) {}
// }

// export type RawDataFieldsAction =
//   | GetFieldsByTenant
//   | GetFieldsByTenantSuccess
//   | GetFieldsByTenantFail
//   | GetAdminFieldsByTenant
//   | GetAdminFieldsByTenantSuccess
//   | GetAdminFieldsByTenantFail
//   | AddRawDataField
//   | AddRawDataFieldSuccess
//   | AddRawDataFieldFail
//   | UpdateRawDataField
//   | UpdateRawDataFieldSuccess
//   | UpdateRawDataFieldFail
//   | RemoveRawDataField
//   | RemoveRawDataFieldSuccess
//   | RemoveRawDataFieldFail;
