// /**
//  * global
//  */
// import { Injectable } from '@angular/core';
// import { MatSnackBar } from '@angular/material/snack-bar';

// import { Actions, createEffect, Effect, ofType } from '@ngrx/effects';
// import { Action, Store } from '@ngrx/store';
// import { Update } from '@ngrx/entity';

// import { Observable } from 'rxjs';
// import { exhaustMap, switchMap } from 'rxjs/operators';

// /**
//  * project
//  */
// import { RawDataFieldsService } from '../../service-layer';
// import { RawDataFieldsModel } from '@wfm/service-layer/models/dynamic-entity-models';
// import { TenantAdminFieldsService } from '../../tenant-admin/tenant-admin.service';

// /**
//  * local
//  */
// import {
//   RawDataFieldsActionTypes,
//   GetFieldsByTenant,
//   GetFieldsByTenantSuccess,
//   GetFieldsByTenantFail,
//   GetAdminFieldsByTenant,
//   GetAdminFieldsByTenantSuccess,
//   GetAdminFieldsByTenantFail,
//   AddRawDataField,
//   AddRawDataFieldSuccess,
//   AddRawDataFieldFail,
//   RemoveRawDataField,
//   RemoveRawDataFieldSuccess,
//   RemoveRawDataFieldFail,
//   UpdateRawDataField,
//   UpdateRawDataFieldSuccess,
//   UpdateRawDataFieldFail
// } from './raw-data-fields.actions';

// @Injectable()
// export class RawDataFieldsEffects {
//   constructor(
//     private actions$: Actions,
//     private rawDataFieldsService: RawDataFieldsService,
//     private tenantAdminFieldsService: TenantAdminFieldsService,
//     private snackBar: MatSnackBar,
//     private store: Store<any>
//   ) {}

//   // ========================================= Get Fields By Tenant
//   GetFieldsByTenant: Observable<Action> = createEffect(() =>
//     this.actions$.pipe(
//       ofType<GetFieldsByTenant>(RawDataFieldsActionTypes.GetFieldsByTenant),
//       switchMap(async (action) => {
//         try {
//           const result = await this.rawDataFieldsService.getFieldsByTenant(action.payload.id);
//           this.store.dispatch(new GetAdminFieldsByTenant({ id: action.payload.id }));
//           return new GetFieldsByTenantSuccess({ result });
//         } catch (error) {
//           return new GetFieldsByTenantFail({ error: error.toString() });
//         }
//       })
//     )
//   );

//   // ========================================= Get Raw Data Fields
//   GetAdminFieldsByTenant: Observable<Action> = createEffect(() =>
//     this.actions$.pipe(
//       ofType<GetAdminFieldsByTenant>(RawDataFieldsActionTypes.GetAdminFieldsFieldsByTenant),
//       switchMap(async (a) => {
//         try {
//           const result = await this.tenantAdminFieldsService.getAdminFieldsByTenant();
//           return new GetAdminFieldsByTenantSuccess({ result: result.items });
//         } catch (error) {
//           return new GetAdminFieldsByTenantFail({ error: error.toString() });
//         }
//       })
//     )
//   );

//   // ========================================= Add Raw Data Field
//   AddRawDataField: Observable<Action> = createEffect(() =>
//     this.actions$.pipe(
//       ofType<AddRawDataField>(RawDataFieldsActionTypes.AddRawDataField),
//       exhaustMap(async (action) => {
//         try {
//           // const result = await this.rawDataFieldsService.create(action.payload.tenantId, action.payload.data);
//           const result = await this.rawDataFieldsService.crateDeleteMeAfterDemo(action.payload.tenantId, action.payload.data);
//           this.store.dispatch(new GetFieldsByTenant({ id: action.payload.tenantId }));
//           this.snackBar.open('Field Added Successfully', 'CLOSE', {
//             duration: 2000
//           });
//           return new AddRawDataFieldSuccess({ result });
//         } catch (error) {
//           return new AddRawDataFieldFail({ error: error.toString() });
//         }
//       })
//     )
//   );

//   // ========================================= Update Raw Data Field
//   UpdateRawDataField: Observable<Action> = createEffect(() =>
//     this.actions$.pipe(
//       ofType<UpdateRawDataField>(RawDataFieldsActionTypes.UpdateRawDataField),
//       exhaustMap(async (action) => {
//         try {
//           // const data = await this.rawDataFieldsService.update(action.payload.tenantId, action.payload.rawDataFieldId, action.payload.data);
//           const data = await this.rawDataFieldsService.updateDeleteMeAfterDemo(
//             action.payload.tenantId,
//             action.payload.rawDataFieldId,
//             action.payload.data
//           );
//           return new UpdateRawDataFieldSuccess({ update: { id: data.id, changes: data } as Update<RawDataFieldsModel> });
//         } catch (error) {
//           return new UpdateRawDataFieldFail({ error: error.toString() });
//         }
//       })
//     )
//   );

//   // ========================================= DELETE Raw Data Field
//   delete: Observable<Action> = createEffect(() =>
//     this.actions$.pipe(
//       ofType<RemoveRawDataField>(RawDataFieldsActionTypes.RemoveRawDataField),
//       exhaustMap(async (action) => {
//         try {
//           // await this.rawDataFieldsService.deleteById(action.payload.tenantId, action.payload.RawDataField);
//           await this.rawDataFieldsService.deleteDeleteMeAfterDemo(action.payload.tenantId, action.payload.RawDataField);
//           this.snackBar.open('Field Removed Successfully', 'CLOSE', {
//             duration: 2000
//           });

//           this.store.dispatch(new GetAdminFieldsByTenant({ id: null }));
//           return new RemoveRawDataFieldSuccess();
//         } catch (error) {
//           return new RemoveRawDataFieldFail({ error: error.toString() });
//         }
//       })
//     )
//   );
// }
