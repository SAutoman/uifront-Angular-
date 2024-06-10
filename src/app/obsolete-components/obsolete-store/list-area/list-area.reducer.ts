// /**
//  * global
//  */
// import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';

// /**
//  * project
//  */
// import { ListDto } from '../../../service-layer';

// /**
//  * local
//  */
// import { ListAreaAction, ListAreaActionTypes } from './list-area.actions';

// export interface ListAreaState extends EntityState<ListDto> {
//   ListArea: any;
// }

// export const ListAreaAdapter: EntityAdapter<ListDto> = createEntityAdapter<ListDto>();

// export const initialListAreaState: ListAreaState = ListAreaAdapter.getInitialState({
//   ListArea: null
// });

// // export const applicationAdapter: EntityAdapter<List> = createEntityAdapter<List>({
// //   selectId: (model: List) => model.id
// // });

// export function ListAreaReducer(state = initialListAreaState, action: ListAreaAction): ListAreaState {
//   switch (action.type) {
//     case ListAreaActionTypes.GetListAreaSuccess:
//       return {
//         ...state,
//         ListArea: action.payload.result
//       };

//     case ListAreaActionTypes.CreateListAreaSuccess:
//       return {
//         ...ListAreaAdapter.addOne(action.payload.result, state)
//       };

//     case ListAreaActionTypes.UpdateListAreaSuccess:
//       return {
//         ...ListAreaAdapter.updateOne(action.payload.update, state)
//       };

//     case ListAreaActionTypes.DeleteListAreaSuccess:
//       return {
//         ...ListAreaAdapter.removeOne(action.payload.id, state)
//       };
//     default:
//       return state;
//   }
// }
