// /**
//  * global
//  */
// import { Action } from '@ngrx/store';

// /**
//  * project
//  */
// import { SearchFieldModel } from '@wfm/service-layer/models/dynamic-entity-models';
// import { SearchProfileUI } from './../../service-layer';

// /**
//  * local
//  */

// export enum RawDataPageActionTypes {
//   LoadPage = '[LoadPage] Action',
//   GetRawDataSearchProfiles = '[GetRawDataSerachProfiles] Action',
//   SetRawDataSearchProfiles = '[SetGetRawDataSearchProfiles] Action'
// }

// export class LoadPageAction implements Action {
//   readonly type = RawDataPageActionTypes.LoadPage;
//   constructor(public payload: { userId: string; tenantId: string }) {}
// }

// export class GetRawDataSearchProfilesAction implements Action {
//   readonly type = RawDataPageActionTypes.GetRawDataSearchProfiles;
//   constructor(public payload: { userId: string; tenantId: string }) {}
// }

// export class SetGetRawDataSearchProfiles implements Action {
//   readonly type = RawDataPageActionTypes.SetRawDataSearchProfiles;
//   constructor(public payload: { searchUserProfiles: SearchProfileUI[]; currentSearch: SearchFieldModel[] }) {}
// }

// export type RawDataPageActions = LoadPageAction | GetRawDataSearchProfilesAction | SetGetRawDataSearchProfiles;
