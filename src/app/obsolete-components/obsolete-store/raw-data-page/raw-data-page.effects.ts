// /**
//  * global
//  */
// import { Injectable, Inject } from '@angular/core';
// import { Store } from '@ngrx/store';
// import { Actions, Effect, ofType } from '@ngrx/effects';
// import { tap, switchMap } from 'rxjs/operators';

// /**
//  * project
//  */
// import { SearchProfileUI, AuthenticationService, UsersService } from '@wfm/service-layer';

// /**
//  * local
//  */
// import {
//   LoadPageAction,
//   RawDataPageActionTypes,
//   GetRawDataSearchProfilesAction,
//   SetGetRawDataSearchProfiles
// } from './raw-data-page.actions';

// @Injectable()
// export class RawDataPageEffects {
//   constructor(
//     private actions$: Actions,
//     private store: Store<any>,
//     private usersService: UsersService,
//     @Inject('AuthenticationService') private authService: AuthenticationService
//   ) {}

//   @Effect({ dispatch: false })
//   loadPage$ = this.actions$.pipe(
//     ofType<LoadPageAction>(RawDataPageActionTypes.LoadPage),
//     tap(async (action) => {
//       this.store.dispatch(new GetRawDataSearchProfilesAction({ userId: action.payload.userId, tenantId: action.payload.tenantId }));
//     })
//   );

//   @Effect({ dispatch: false })
//   getRawDataSearchProfiles$ = this.actions$.pipe(
//     ofType<GetRawDataSearchProfilesAction>(RawDataPageActionTypes.GetRawDataSearchProfiles),
//     switchMap(async (action) => {
//       try {
//         // const data = await this.searchProfilesService.getUserSearchProfiles(action.payload.tenantId, action.payload.userId);
//         const userSettings = await this.usersService.getUserSettings(action.payload.tenantId, action.payload.userId);
//         const mappedSearchFields: SearchProfileUI[] = [];

//         // data.forEach(x => mappedSearchFields.push(<SearchProfileUI>{
//         //  isCurrentlySelected: false, // should be defined on the base of user settings table, there would be setting which is the current
//         //   searchFieldModels: (<SearchFieldModel[]>x.search)
//         // }));

//         this.store.dispatch(new SetGetRawDataSearchProfiles({ searchUserProfiles: mappedSearchFields, currentSearch: null }));
//       } catch (error) {
//         // error action
//       }
//     })
//   );
// }
