// /**
//  * global
//  */
// import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';

// /**
//  * project
//  */
// import { RawDataFieldInfo, FieldDtoAdmin, RawDataEntity } from '../../service-layer';

// /**
//  * local
//  */
// import { RawDataFieldsAction, RawDataFieldsActionTypes } from './raw-data-fields.actions';

// export interface RawDataFieldsState extends EntityState<RawDataEntity> {
//   Fields: RawDataFieldInfo[];
//   AdminFields: FieldDtoAdmin[];
// }

// export const RawDataFieldsAdapter: EntityAdapter<RawDataEntity> = createEntityAdapter<RawDataEntity>();

// export const initialRawDataFieldsState: RawDataFieldsState = RawDataFieldsAdapter.getInitialState({
//   Fields: null,
//   AdminFields: null
// });

// // export const applicationAdapter: EntityAdapter<RawDataEntity> = createEntityAdapter<RawDataEntity>({
// //   selectId: (model: RawDataEntity) => model.id
// // });

// export function RawDataFieldsReducer(state = initialRawDataFieldsState, action: RawDataFieldsAction): RawDataFieldsState {
//   switch (action.type) {
//     case RawDataFieldsActionTypes.GetFieldsByTenantSuccess:
//       return {
//         ...state,
//         Fields: action.payload.result
//       };

//     case RawDataFieldsActionTypes.GetAdminFieldsFieldsByTenantSuccess:
//       return {
//         ...state,
//         AdminFields: action.payload.result
//       };
//     default:
//       return state;
//   }
// }
