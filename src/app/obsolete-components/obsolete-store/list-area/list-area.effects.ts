// /**
//  * global
//  */
// import { Injectable } from '@angular/core';
// import { Action } from '@ngrx/store';
// import { Update } from '@ngrx/entity';
// import { Actions, createEffect, ofType } from '@ngrx/effects';
// import { Observable } from 'rxjs';
// import { switchMap, exhaustMap } from 'rxjs/operators';

// /**
//  * project
//  */
// import { ListDto, ListsService } from '../../../service-layer';

// /**
//  * local
//  */
// import {
//   ListAreaActionTypes,
//   GetListArea,
//   GetListAreaSuccess,
//   GetListAreaFail,
//   CreateListArea,
//   CreateListAreaSuccess,
//   CreateListAreaFail,
//   UpdateListAreaSuccess,
//   UpdateListAreaFail,
//   UpdateListArea,
//   DeleteListAreaSuccess,
//   DeleteListAreaFail,
//   DeleteListArea
// } from './list-area.actions';

// @Injectable()
// export class ListAreaEffects {
//   // ========================================= Get list area
//   GetListArea: Observable<Action> = createEffect(() =>
//     this.actions$.pipe(
//       ofType<GetListArea>(ListAreaActionTypes.GetListArea),
//       switchMap(async (action) => {
//         try {
//           const result = await this.listsService.getLists(
//             action.payload.tenantId,
//             action.payload.paging,
//             action.payload.sorting,
//             action.payload.filters
//           );
//           return new GetListAreaSuccess({ result });
//         } catch (error) {
//           return new GetListAreaFail({ error: error.toString() });
//         }
//       })
//     )
//   );

//   // ========================================= Create list area
//   CreateListArea: Observable<Action> = createEffect(() =>
//     this.actions$.pipe(
//       ofType<CreateListArea>(ListAreaActionTypes.CreateListArea),
//       exhaustMap(async (action) => {
//         try {
//           const result = await this.listsService.createList(action.payload.tenantId, action.payload.list);
//           return new CreateListAreaSuccess({ result });
//         } catch (error) {
//           return new CreateListAreaFail({ error: error.toString() });
//         }
//       })
//     )
//   );

//   // ========================================= Update list area
//   UpdateListArea: Observable<Action> = createEffect(() =>
//     this.actions$.pipe(
//       ofType<UpdateListArea>(ListAreaActionTypes.UpdateListArea),
//       exhaustMap(async (action) => {
//         try {
//           const list = await this.listsService.updateList(action.payload.tenantId, action.payload.listId, action.payload.list);
//           return new UpdateListAreaSuccess({ update: { id: list.id, changes: list } as Update<ListDto> });
//         } catch (error) {
//           return new UpdateListAreaFail({ error: error.toString() });
//         }
//       })
//     )
//   );

//   // ========================================= Delete list area
//   DeleteListArea: Observable<Action> = createEffect(() =>
//     this.actions$.pipe(
//       ofType<DeleteListArea>(ListAreaActionTypes.DeleteListArea),
//       exhaustMap(async (action) => {
//         try {
//           await this.listsService.deleteList(action.payload.tenantId, action.payload.listId);
//           return new DeleteListAreaSuccess({ id: action.payload.listId });
//         } catch (error) {
//           return new DeleteListAreaFail({ error: error.toString() });
//         }
//       })
//     )
//   );

//   constructor(private actions$: Actions, private listsService: ListsService) {}
// }
