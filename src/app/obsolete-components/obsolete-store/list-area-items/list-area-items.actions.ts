// /**
//  * global
//  */
// import { Action } from '@ngrx/store';
// import { Update } from '@ngrx/entity';

// /**
//  * project
//  */
// import { PagedData, ListItemDto } from '../../service-layer';

// /**
//  * local
//  */

// export enum ListAreaItemActionTypes {
//   GetListAreaItems = '[ListAreaItems] GetListAreaItems',
//   GetListAreaItemsSuccess = '[ListAreaItems] GetListAreaItems Success',
//   GetListAreaItemsFail = '[ListAreaItems] GetListAreaItems Fail',

//   CreateListAreaItem = '[ListAreaItems] CreateListAreaItem',
//   CreateListAreaItemSuccess = '[ListAreaItems] CreateListAreaItem Success',
//   CreateListAreaItemFail = '[ListAreaItems] CreateListAreaItem Fail',

//   UpdateListAreaItem = '[ListAreaItems] UpdateListAreaItem',
//   UpdateListAreaItemSuccess = '[ListAreaItems] UpdateListAreaItem Success',
//   UpdateListAreaItemFail = '[ListAreaItems] UpdateListAreaItem Fail',

//   DeleteListAreaItem = '[ListAreaItems] DeleteListAreaItem',
//   DeleteListAreaItemSuccess = '[ListAreaItems] DeleteListAreaItem Success',
//   DeleteListAreaItemFail = '[ListAreaItems] DeleteListAreaItem Fail'
// }

// // ========================================= Get all list Items by List id

// export class GetListAreaItems implements Action {
//   readonly type = ListAreaItemActionTypes.GetListAreaItems;
//   constructor(public payload: { tenantId: string; listId: string; parentListItemId?: string }) {}
// }

// export class GetListAreaItemsSuccess implements Action {
//   readonly type = ListAreaItemActionTypes.GetListAreaItemsSuccess;
//   constructor(public payload: { result: PagedData<ListItemDto> }) {}
// }

// export class GetListAreaItemsFail implements Action {
//   readonly type = ListAreaItemActionTypes.GetListAreaItemsFail;
//   constructor(public payload: { error: string }) {}
// }

// // ========================================= Create list Item

// export class CreateListAreaItem implements Action {
//   readonly type = ListAreaItemActionTypes.CreateListAreaItem;
//   constructor(public payload: { tenantId: string; listId: string; item: ListItemDto }) {}
// }

// export class CreateListAreaItemSuccess implements Action {
//   readonly type = ListAreaItemActionTypes.CreateListAreaItemSuccess;
//   constructor(public payload: { result: ListItemDto }) {}
// }

// export class CreateListAreaItemFail implements Action {
//   readonly type = ListAreaItemActionTypes.CreateListAreaItemFail;
//   constructor(public payload: { error: string }) {}
// }

// // ========================================= Update list Item

// export class UpdateListAreaItem implements Action {
//   readonly type = ListAreaItemActionTypes.UpdateListAreaItem;
//   constructor(public payload: { tenantId: string; listId: string; listItemId: string; item: ListItemDto }) {}
// }

// export class UpdateListAreaItemSuccess implements Action {
//   readonly type = ListAreaItemActionTypes.UpdateListAreaItemSuccess;
//   constructor(public payload: { update: Update<ListItemDto> }) {}
// }

// export class UpdateListAreaItemFail implements Action {
//   readonly type = ListAreaItemActionTypes.UpdateListAreaItemFail;
//   constructor(public payload: { error: string }) {}
// }

// // ========================================= Delete list Item

// export class DeleteListAreaItem implements Action {
//   readonly type = ListAreaItemActionTypes.DeleteListAreaItem;
//   constructor(public payload: { tenantId: string; listId: string; itemId: string }) {}
// }

// export class DeleteListAreaItemSuccess implements Action {
//   readonly type = ListAreaItemActionTypes.DeleteListAreaItemSuccess;
//   constructor(public payload: { id: string }) {}
// }

// export class DeleteListAreaItemFail implements Action {
//   readonly type = ListAreaItemActionTypes.DeleteListAreaItemFail;
//   constructor(public payload: { error: string }) {}
// }

// export type ListAreaItemAction =
//   | GetListAreaItems
//   | GetListAreaItemsSuccess
//   | GetListAreaItemsFail
//   | CreateListAreaItem
//   | CreateListAreaItemSuccess
//   | CreateListAreaItemFail
//   | UpdateListAreaItem
//   | UpdateListAreaItemSuccess
//   | UpdateListAreaItemFail
//   | DeleteListAreaItem
//   | DeleteListAreaItemFail
//   | DeleteListAreaItemSuccess;
