// /**
//  * global
//  */
// import { Injectable } from '@angular/core';
// import { Store } from '@ngrx/store';
// import { Actions, createEffect, ofType } from '@ngrx/effects';
// import { switchMap } from 'rxjs/operators';

// /**
//  * project
//  */
// import { UserSettingsDto, selectedLayout, SettingsKeys, Settings, UsersService } from '../../../service-layer';
// import { ApplicationState } from '../../../store/application/application.reducer';

// /**
//  * local
//  */
// import { CasesListActionTypes, SetSelectedLayout, ResetState } from './cases-list.actions';

// @Injectable()
// export class CasesListEffects {
//   constructor(private actions$: Actions, private usersService: UsersService) {}

//   setSelectedLayout$ = createEffect(
//     () =>
//       this.actions$.pipe(
//         ofType<SetSelectedLayout>(CasesListActionTypes.SetSelectedLayout),
//         switchMap(async (action) => {
//           try {
//             const layout = action.payload.layout;

//             const model = <UserSettingsDto>{
//               tenantId: action.payload.tenantId,
//               userId: action.payload.userId,
//               settings: [<Settings>(<any>{ key: selectedLayout, value: { layout } })]
//             };

//             const settingsKeys = <SettingsKeys>(<any>{ keys: [selectedLayout], isExclusive: false });

//             const caseSelectedLayout = await this.usersService.getUserSettingsByKeys(
//               action.payload.tenantId,
//               action.payload.userId,
//               settingsKeys
//             );

//             if (caseSelectedLayout.settings.length) {
//               const selectedLayoutModel = caseSelectedLayout.settings[caseSelectedLayout.settings.length - 1];
//               const updateModel = <UserSettingsDto>{
//                 tenantId: action.payload.tenantId,
//                 userId: action.payload.userId,
//                 settings: [{ id: selectedLayoutModel.id, key: selectedLayout, value: { layout } }]
//               };

//               await this.usersService.updateUserSettings(action.payload.tenantId, updateModel);
//             } else {
//               await this.usersService.createUserSettings(action.payload.tenantId, model);
//             }

//             return new SetSelectedLayout({ layout: action.payload.layout });
//           } catch (error) {
//             console.log(error);
//           }
//         })
//       ),
//     { dispatch: false }
//   );

//   // getSelectedLayout$ = createEffect(
//   //   () =>
//   //     this.actions$.pipe(
//   //       ofType<GetSelectedLayout>(CasesListActionTypes.GetSelectedLayout),
//   //       switchMap(async (action) => {
//   //         try {
//   //           const result = await this.usersService.getUserSettings(action.payload.tenantId, action.payload.userId);
//   //           const filtered = result.settings.filter((s) => s.key === selectedLayout);
//   //           this.store.dispatch(new GetSelectedLayoutSuccess({ layout: filtered[0].value }));
//   //         } catch (error) {
//   //           this.store.dispatch(new GetSelectedLayoutFail({ error: error.toString() }));
//   //         }
//   //       })
//   //     ),
//   //   { dispatch: false }
//   // );

//   // deleteLayout$ = createEffect(
//   //   () =>
//   //     this.actions$.pipe(
//   //       ofType<DeleteLayout>(CasesListActionTypes.DeleteLayout),
//   //       exhaustMap(async (action) => {
//   //         try {
//   //           await this.usersService.deleteUserSettings(action.payload.tenantId, action.payload.id);
//   //           return new DeleteLayoutSuccess({ id: action.payload.id });
//   //         } catch (error) {
//   //           return new DeleteLayoutFail({ error: error.toString() });
//   //         }
//   //       })
//   //     ),
//   //   { dispatch: false }
//   // );

//   // updateLayout$ = createEffect(
//   //   () =>
//   //     this.actions$.pipe(
//   //       ofType<UpdateLayout>(CasesListActionTypes.UpdateLayout),
//   //       exhaustMap(async (action) => {
//   //         try {
//   //           const result = await this.usersService.updateUserSettings(action.payload.tenantId, action.payload.layout);
//   //           return new UpdateLayoutSuccess({ update: { id: result.id, changes: result } });
//   //         } catch (error) {
//   //           return new UpdateLayoutFail({ error: error.toString() });
//   //         }
//   //       })
//   //     ),
//   //   { dispatch: false }
//   // );

//   resetState$ = createEffect(
//     () =>
//       this.actions$.pipe(
//         ofType<ResetState>(CasesListActionTypes.ResetState),
//         switchMap(async (action) => {
//           try {
//             return new ResetState();
//           } catch (error) {
//             console.log(error);
//           }
//         })
//       ),
//     { dispatch: false }
//   );
// }
