// /**
//  * global
//  */

// /**
//  * project
//  */
// import { SearchFieldModel } from '@wfm/service-layer/models/dynamic-entity-models';
// import { SearchProfileUI } from '../../service-layer';

// /**
//  * local
//  */
// import { RawDataPageActions, RawDataPageActionTypes } from './raw-data-page.actions';

// export enum RawDataPageLoadingState {
//   Unknown,
//   Loading,
//   Loaded,
//   Failed
// }

// export interface RawDataPageState {
//   currentSearch: SearchFieldModel[];
//   searchProfiles: SearchProfileUI[];
//   loadingState: RawDataPageLoadingState;
//   userId: string;
//   tenantId: string;
// }

// export const initialRawDataPageState: RawDataPageState = <RawDataPageState>{
//   currentSearch: [],
//   loadingState: RawDataPageLoadingState.Unknown
// };

// export function rawDataPageReducer(state = initialRawDataPageState, action: RawDataPageActions): RawDataPageState {
//   switch (action.type) {
//     case RawDataPageActionTypes.LoadPage:
//       return <RawDataPageState>{
//         ...state,
//         userId: action.payload.userId,
//         tenantId: action.payload.tenantId,
//         loadingState: RawDataPageLoadingState.Loading
//       };

//     case RawDataPageActionTypes.SetRawDataSearchProfiles:
//       return <RawDataPageState>{
//         ...state,
//         currentSearch: action.payload.currentSearch,
//         searchProfiles: action.payload.searchUserProfiles,
//         loadingState: RawDataPageLoadingState.Loaded
//       };

//     default:
//       return state;
//   }
// }
