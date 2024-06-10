// /**
//  * global
//  */
// import { Injectable } from '@angular/core';
// import { Actions, createEffect, ofType } from '@ngrx/effects';
// import { Action } from '@ngrx/store';
// import { Update } from '@ngrx/entity';
// import { Observable } from 'rxjs';
// import { switchMap, exhaustMap } from 'rxjs/operators';

// /**
//  * project
//  */
// import { ListItemDto, ListsService } from '../../service-layer';

// /**
//  * local
//  */

// import {
//   ListAreaItemActionTypes,
//   GetListAreaItems,
//   GetListAreaItemsSuccess,
//   GetListAreaItemsFail,
//   CreateListAreaItem,
//   CreateListAreaItemSuccess,
//   CreateListAreaItemFail,
//   UpdateListAreaItem,
//   UpdateListAreaItemSuccess,
//   UpdateListAreaItemFail,
//   DeleteListAreaItem,
//   DeleteListAreaItemSuccess,
//   DeleteListAreaItemFail
// } from './list-area-items.actions';

// @Injectable()
// export class ListAreaItemsEffects {
//   // ========================================= Get list area Items
//   GetListAreaItems: Observable<Action> = createEffect(() =>
//     this.actions$.pipe(
//       ofType<GetListAreaItems>(ListAreaItemActionTypes.GetListAreaItems),
//       switchMap(async (action) => {
//         try {
//           const result = await this.listsService.getListItems(
//             action.payload.tenantId,
//             action.payload.listId,
//             action.payload.parentListItemId
//           );
//           return new GetListAreaItemsSuccess({ result });
//         } catch (error) {
//           return new GetListAreaItemsFail({ error: error.toString() });
//         }
//       })
//     )
//   );

//   // ========================================= Create list area Item
//   CreateListAreaItem: Observable<Action> = createEffect(() =>
//     this.actions$.pipe(
//       ofType<CreateListAreaItem>(ListAreaItemActionTypes.CreateListAreaItem),
//       exhaustMap(async (action) => {
//         try {
//           const result = await this.listsService.addListItem(action.payload.tenantId, action.payload.listId, action.payload.item);
//           return new CreateListAreaItemSuccess({ result });
//         } catch (error) {
//           return new CreateListAreaItemFail({ error: error.toString() });
//         }
//       })
//     )
//   );

//   // ========================================= Create list area Item
//   UpdateListAreaItem: Observable<Action> = createEffect(() =>
//     this.actions$.pipe(
//       ofType<UpdateListAreaItem>(ListAreaItemActionTypes.UpdateListAreaItem),
//       exhaustMap(async (action) => {
//         try {
//           const listItem = await this.listsService.editListItem(
//             action.payload.tenantId,
//             action.payload.listId,
//             action.payload.listItemId,
//             action.payload.item
//           );
//           return new UpdateListAreaItemSuccess({ update: { id: listItem.id, changes: listItem } as Update<ListItemDto> });
//         } catch (error) {
//           return new UpdateListAreaItemFail({ error: error.toString() });
//         }
//       })
//     )
//   );

//   // ========================================= Delete list area Item
//   DeleteListAreaItem: Observable<Action> = createEffect(() =>
//     this.actions$.pipe(
//       ofType<DeleteListAreaItem>(ListAreaItemActionTypes.DeleteListAreaItem),
//       exhaustMap(async (action) => {
//         try {
//           const op = await this.listsService.deleteListItem(action.payload.tenantId, action.payload.listId, action.payload.itemId);
//           if (op.status.toString() === 'Success') {
//             return new DeleteListAreaItemSuccess({ id: action.payload.itemId });
//           }
//           return new DeleteListAreaItemFail({ error: 'Failed to delete list item' });
//         } catch (error) {
//           return new DeleteListAreaItemFail({ error: error.toString() });
//         }
//       })
//     )
//   );

//   constructor(private actions$: Actions, private listsService: ListsService) {}
// }
