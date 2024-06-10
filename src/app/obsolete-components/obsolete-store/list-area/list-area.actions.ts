// /**
//  * global
//  */
// import { Action } from '@ngrx/store';
// import { Update } from '@ngrx/entity';

// /**
//  * project
//  */
// import { SearchFieldModel } from '@wfm/service-layer/models/dynamic-entity-models';
// import { PagedData, ListDto, Paging, Sorting } from '../../../service-layer';

// /**
//  * local
//  */

// export enum ListAreaActionTypes {
//   GetListArea = '[ListArea] GetListArea',
//   GetListAreaSuccess = '[ListArea] GetListArea Success',
//   GetListAreaFail = '[ListArea] GetListArea Fail',

//   CreateListArea = '[ListArea] CreateListArea',
//   CreateListAreaSuccess = '[ListArea] CreateListArea Success',
//   CreateListAreaFail = '[ListArea] CreateListArea Fail',

//   UpdateListArea = '[ListArea] UpdateListArea',
//   UpdateListAreaSuccess = '[ListArea] UpdateListArea Success',
//   UpdateListAreaFail = '[ListArea] UpdateListArea Fail',

//   DeleteListArea = '[ListArea] DeleteListArea',
//   DeleteListAreaSuccess = '[ListArea] DeleteListArea Success',
//   DeleteListAreaFail = '[ListArea] DeleteListArea Fail'
// }

// // ========================================= Get all list by tenant id

// export class GetListArea implements Action {
//   readonly type = ListAreaActionTypes.GetListArea;
//   constructor(public payload: { tenantId: string; paging?: Paging; sorting?: Sorting[]; filters?: SearchFieldModel[] }) {}
// }

// export class GetListAreaSuccess implements Action {
//   readonly type = ListAreaActionTypes.GetListAreaSuccess;
//   constructor(public payload: { result: PagedData<ListDto> }) {}
// }

// export class GetListAreaFail implements Action {
//   readonly type = ListAreaActionTypes.GetListAreaFail;
//   constructor(public payload: { error: string }) {}
// }

// // ========================================= Create list

// export class CreateListArea implements Action {
//   readonly type = ListAreaActionTypes.CreateListArea;
//   constructor(public payload: { tenantId: string; list: ListDto }) {}
// }

// export class CreateListAreaSuccess implements Action {
//   readonly type = ListAreaActionTypes.CreateListAreaSuccess;
//   constructor(public payload: { result: ListDto }) {}
// }

// export class CreateListAreaFail implements Action {
//   readonly type = ListAreaActionTypes.CreateListAreaFail;
//   constructor(public payload: { error: string }) {}
// }

// // ========================================= Update list

// export class UpdateListArea implements Action {
//   readonly type = ListAreaActionTypes.UpdateListArea;
//   constructor(public payload: { tenantId: string; listId: string; list: ListDto }) {}
// }

// export class UpdateListAreaSuccess implements Action {
//   readonly type = ListAreaActionTypes.UpdateListAreaSuccess;
//   constructor(public payload: { update: Update<ListDto> }) {}
// }

// export class UpdateListAreaFail implements Action {
//   readonly type = ListAreaActionTypes.UpdateListAreaFail;
//   constructor(public payload: { error: string }) {}
// }

// // ========================================= Delete list

// export class DeleteListArea implements Action {
//   readonly type = ListAreaActionTypes.DeleteListArea;
//   constructor(public payload: { tenantId: string; listId: string }) {}
// }

// export class DeleteListAreaSuccess implements Action {
//   readonly type = ListAreaActionTypes.DeleteListAreaSuccess;
//   constructor(public payload: { id: string }) {}
// }

// export class DeleteListAreaFail implements Action {
//   readonly type = ListAreaActionTypes.DeleteListAreaFail;
//   constructor(public payload: { error: string }) {}
// }

// export type ListAreaAction =
//   | GetListArea
//   | GetListAreaSuccess
//   | GetListAreaFail
//   | CreateListArea
//   | CreateListAreaSuccess
//   | CreateListAreaFail
//   | UpdateListArea
//   | UpdateListAreaSuccess
//   | UpdateListAreaFail
//   | DeleteListArea
//   | DeleteListAreaFail
//   | DeleteListAreaSuccess;
