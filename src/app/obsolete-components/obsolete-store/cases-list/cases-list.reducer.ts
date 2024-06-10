// /**
//  * global
//  */

// /**
//  * project
//  */
// import { ChildrenItems } from '../../../shared/menu-items/menu-items';

// /**
//  * local
//  */
// import { CasesListActions, CasesListActionTypes } from './cases-list.actions';
// export enum CasesListLoadingState {
//   Unknown,
//   Loading,
//   Loaded,
//   Failed
// }

// export interface CasesListState {
//   layout: ChildrenItems;
//   loadingState: CasesListLoadingState;
//   userId: string;
//   tenantId: string;
// }

// export const initialCasesListState: CasesListState = <CasesListState>{
//   loadingState: CasesListLoadingState.Unknown,
//   layout: <ChildrenItems>{}
// };

// export function casesListReducer(state = initialCasesListState, action: CasesListActions) {
//   switch (action.type) {
//     case CasesListActionTypes.SetSelectedLayout:
//       return <CasesListState>{
//         ...state,
//         loadingState: CasesListLoadingState.Loaded,
//         userId: action.payload.userId,
//         tenantId: action.payload.tenantId,
//         layout: action.payload.layout
//       };

//     case CasesListActionTypes.GetSelectedLayout:
//       return <CasesListState>{
//         ...state,
//         loadingState: CasesListLoadingState.Loaded,
//         userId: action.payload.userId,
//         tenantId: action.payload.tenantId
//       };

//     case CasesListActionTypes.GetSelectedLayoutSuccess:
//       return <CasesListState>{
//         ...state,
//         loadingState: CasesListLoadingState.Loaded,
//         layout: action.payload.layout.layout
//       };

//     case CasesListActionTypes.GetSelectedLayoutFail:
//       return <CasesListState>{
//         ...state,
//         loadingState: CasesListLoadingState.Failed,
//         error: 'Faild Getting Selected Layout'
//       };

//     case CasesListActionTypes.ResetState:
//       return Object.assign({}, initialCasesListState);

//     default:
//       return state;
//   }
// }
