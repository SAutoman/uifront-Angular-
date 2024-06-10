// /**
//  * global
//  */
// import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';

// /**
//  * project
//  */
// import { ListItemDto } from '../../service-layer';

// /**
//  * local
//  */
// import { ListAreaItemAction, ListAreaItemActionTypes } from './list-area-items.actions';

// export interface ListAreaItemsState extends EntityState<ListItemDto> {
//   ListAreaItems: any;
// }

// export const ListAreaItemAdapter: EntityAdapter<ListItemDto> = createEntityAdapter<ListItemDto>();

// export const initialListAreaItemsState: ListAreaItemsState = ListAreaItemAdapter.getInitialState({
//   ListAreaItems: null
// });

// // export const applicationAdapter: EntityAdapter<ListItem> = createEntityAdapter<ListItem>({
// //   selectId: (model: ListItem) => model.id
// // });

// export function ListAreaItemsReducer(state = initialListAreaItemsState, action: ListAreaItemAction): ListAreaItemsState {
//   switch (action.type) {
//     case ListAreaItemActionTypes.GetListAreaItemsSuccess:
//       return {
//         ...state,
//         ListAreaItems: action.payload.result
//       };

//     case ListAreaItemActionTypes.CreateListAreaItemSuccess:
//       return {
//         ...ListAreaItemAdapter.addOne(action.payload.result, state)
//       };

//     case ListAreaItemActionTypes.UpdateListAreaItemSuccess:
//       return {
//         ...ListAreaItemAdapter.updateOne(action.payload.update, state)
//       };

//     case ListAreaItemActionTypes.DeleteListAreaItemSuccess:
//       return {
//         ...ListAreaItemAdapter.removeOne(action.payload.id, state)
//       };
//     default:
//       return state;
//   }
// }
