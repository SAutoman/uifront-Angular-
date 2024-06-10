/**
 * global
 */
import { Injectable } from '@angular/core';
import { ofType, Actions, createEffect } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * project
 */
import { DynamicEntitiesService, MappingsService } from '../../service-layer';

/**
 * local
 */

import {
  LoadSuppliers,
  MappingTypes,
  LoadSuppliersSuccess,
  LoadSuppliersFailure,
  DeleteSupplier,
  DeleteSupplierFailure,
  DeleteSupplierSuccess,
  LoadSupplierFailure,
  LoadSupplier,
  LoadSupplierSuccess,
  EditSupplier,
  EditSupplierFailure,
  EditSupplierSuccess,
  CreateSupplier,
  CreateSupplierSuccess,
  CreateSupplierFailure,
  LoadAuditors,
  LoadAuditorsSuccess,
  LoadAuditorsFailure,
  CreateAuditor,
  CreateAuditorSuccess,
  CreateAuditorFailure,
  LoadAuditor,
  LoadAuditorSuccess,
  LoadAuditorFailure,
  EditAuditor,
  EditAuditorSuccess,
  EditAuditorFailure,
  DeleteAuditor,
  DeleteAuditorSuccess,
  DeleteAuditorFailure,
  ApplyMappingManualFail,
  ApplyMappingManual,
  ApplyMappingManualSuccess,
  ReapplyAllMappingsSuppliers,
  ReapplyAllMappingsSuppliersSuccess,
  ReapplyAllMappingsSuppliersFail,
  ReapplyAllMappingsAuditors,
  ReapplyAllMappingsAuditorsSuccess,
  ReapplyAllMappingsAuditorsFail
} from './mappings.actions';
import { MappingsState } from './mappings.reducer';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';

@Injectable()
export class MappingsEffects {
  constructor(
    private actions$: Actions,
    private store: Store<MappingsState>,
    private mappingsService: MappingsService,
    private dynamicEntitiesService: DynamicEntitiesService,
    private snackBar: MatSnackBar,
    private errorHandlerService: ErrorHandlerService
  ) {}

  LoadSuppliers = createEffect(
    () =>
      this.actions$.pipe(
        ofType<LoadSuppliers>(MappingTypes.LoadSuppliers),
        tap(async (action) => {
          try {
            const result = await this.mappingsService.getSuppliers(
              action.payload.tenantId,
              action.payload.paging,
              action.payload.sorting,
              action.payload.filters
            );
            this.store.dispatch(new LoadSuppliersSuccess({ result }));
          } catch (error) {
            this.store.dispatch(new LoadSuppliersFailure({ error: this.errorHandlerService.getAndShowErrorMsg(error) }));
          }
        })
      ),
    { dispatch: false }
  );

  LoadAuditors = createEffect(
    () =>
      this.actions$.pipe(
        ofType<LoadAuditors>(MappingTypes.LoadAuditors),
        tap(async (action) => {
          try {
            const result = await this.mappingsService.getAuditors(
              action.payload.tenantId,
              action.payload.paging,
              action.payload.sorting,
              action.payload.filters
            );
            this.store.dispatch(new LoadAuditorsSuccess({ result }));
          } catch (error) {
            this.store.dispatch(new LoadAuditorsFailure({ error: this.errorHandlerService.getAndShowErrorMsg(error) }));
          }
        })
      ),
    { dispatch: false }
  );

  DeleteSupplier = createEffect(
    () =>
      this.actions$.pipe(
        ofType<DeleteSupplier>(MappingTypes.DeleteSupplier),
        tap(async (action) => {
          try {
            const operation = await this.mappingsService.deleteSupplier(action.payload.tenantId, action.payload.id);
            this.store.dispatch(new DeleteSupplierSuccess({ msg: 'Deleted Successfully' }));
          } catch (error) {
            this.store.dispatch(new DeleteSupplierFailure({ error: this.errorHandlerService.getAndShowErrorMsg(error) }));
          }
        })
      ),
    { dispatch: false }
  );

  DeleteAuditor = createEffect(
    () =>
      this.actions$.pipe(
        ofType<DeleteAuditor>(MappingTypes.DeleteAuditor),
        tap(async (action) => {
          try {
            const operation = await this.mappingsService.deleteAuditor(action.payload.tenantId, action.payload.id);
            this.store.dispatch(new DeleteAuditorSuccess({ msg: 'Deleted Successfully' }));
          } catch (error) {
            this.store.dispatch(new DeleteAuditorFailure({ error: this.errorHandlerService.getAndShowErrorMsg(error) }));
          }
        })
      ),
    { dispatch: false }
  );

  LoadSupplier = createEffect(
    () =>
      this.actions$.pipe(
        ofType<LoadSupplier>(MappingTypes.LoadSupplier),
        tap(async (action) => {
          try {
            const mapping = await this.mappingsService.getSupplierById(action.payload.tenantId, action.payload.id);
            this.store.dispatch(new LoadSupplierSuccess({ mapping }));
          } catch (error) {
            this.store.dispatch(new LoadSupplierFailure({ error: this.errorHandlerService.getAndShowErrorMsg(error) }));
          }
        })
      ),
    { dispatch: false }
  );

  LoadAuditor = createEffect(
    () =>
      this.actions$.pipe(
        ofType<LoadAuditor>(MappingTypes.LoadAuditor),
        tap(async (action) => {
          try {
            const mapping = await this.mappingsService.getAuditorById(action.payload.tenantId, action.payload.id);
            this.store.dispatch(new LoadAuditorSuccess({ mapping }));
          } catch (error) {
            this.store.dispatch(new LoadAuditorFailure({ error: this.errorHandlerService.getAndShowErrorMsg(error) }));
          }
        })
      ),
    { dispatch: false }
  );

  CreateSupplier = createEffect(
    () =>
      this.actions$.pipe(
        ofType<CreateSupplier>(MappingTypes.CreateSupplier),
        tap(async (action) => {
          try {
            const operation = await this.mappingsService.createSupplier(action.payload.tenantId, action.payload.data);
            this.store.dispatch(new CreateSupplierSuccess({ operation }));
          } catch (error) {
            this.store.dispatch(new CreateSupplierFailure({ error: this.errorHandlerService.getAndShowErrorMsg(error) }));
            this.snackBar.open(`${error}`, 'CLOSE', { duration: 5000 });
          }
        })
      ),
    { dispatch: false }
  );

  CreateAuditor = createEffect(
    () =>
      this.actions$.pipe(
        ofType<CreateAuditor>(MappingTypes.CreateAuditor),
        tap(async (action) => {
          try {
            const operation = await this.mappingsService.createAuditor(action.payload.tenantId, action.payload.data);
            this.store.dispatch(new CreateAuditorSuccess({ operation }));
          } catch (error) {
            this.store.dispatch(new CreateAuditorFailure({ error: this.errorHandlerService.getAndShowErrorMsg(error) }));
            this.snackBar.open(`${error}`, 'CLOSE', { duration: 5000 });
          }
        })
      ),
    { dispatch: false }
  );

  EditSupplier = createEffect(
    () =>
      this.actions$.pipe(
        ofType<EditSupplier>(MappingTypes.EditSupplier),
        tap(async (action) => {
          try {
            const operation = await this.mappingsService.editSupplier(action.payload.tenantId, action.payload.mapping);
            this.store.dispatch(new EditSupplierSuccess({ operation }));
          } catch (error) {
            this.store.dispatch(new EditSupplierFailure({ error: this.errorHandlerService.getAndShowErrorMsg(error) }));
            this.snackBar.open(`${error}`, 'CLOSE', { duration: 5000 });
          }
        })
      ),
    { dispatch: false }
  );

  EditAuditor = createEffect(
    () =>
      this.actions$.pipe(
        ofType<EditAuditor>(MappingTypes.EditAuditor),
        tap(async (action) => {
          try {
            const operation = await this.mappingsService.editAuditor(action.payload.tenantId, action.payload.mapping);
            this.store.dispatch(new EditAuditorSuccess({ operation }));
          } catch (error) {
            this.store.dispatch(new EditAuditorFailure({ error: this.errorHandlerService.getAndShowErrorMsg(error) }));
            this.snackBar.open(`${error}`, 'CLOSE', { duration: 5000 });
          }
        })
      ),
    { dispatch: false }
  );

  ApplyMappingManual = createEffect(
    () =>
      this.actions$.pipe(
        ofType<ApplyMappingManual>(MappingTypes.ApplyMappingManual),
        tap(async (action) => {
          try {
            const operation = await this.dynamicEntitiesService.applyMapping(
              action.payload.tenantId,
              action.payload.areaType,
              action.payload.data
            );
            if (operation.status.toString() === 'Success') {
              return this.store.dispatch(new ApplyMappingManualSuccess({ msg: 'Mapping Reapplied Successfully' }));
            }
          } catch (error) {
            this.store.dispatch(new ApplyMappingManualFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) }));
          }
        })
      ),
    { dispatch: false }
  );

  ReapplyAllMappingsSuppliers = createEffect(
    () =>
      this.actions$.pipe(
        ofType<ReapplyAllMappingsSuppliers>(MappingTypes.ReapplyAllMappingsSuppliers),
        tap(async (action) => {
          try {
            const operation = await this.mappingsService.reapplyAllMappingsSuppliers(action.payload.tenantId, action.payload.areaType);
            if (operation.status.toString().toLowerCase() === 'success')
              this.store.dispatch(new ReapplyAllMappingsSuppliersSuccess({ msg: 'All existing supplier mappings deleted successfully' }));
          } catch (error) {
            this.store.dispatch(new ReapplyAllMappingsSuppliersFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) }));
          }
        })
      ),
    { dispatch: false }
  );

  ReapplyAllMappingsAuditors = createEffect(
    () =>
      this.actions$.pipe(
        ofType<ReapplyAllMappingsAuditors>(MappingTypes.ReapplyAllMappingsAuditors),
        tap(async (action) => {
          try {
            const operation = await this.mappingsService.reapplyAllMappingAuditors(action.payload.tenantId, action.payload.areaType);
            if (operation.status.toString().toLowerCase() === 'success')
              this.store.dispatch(new ReapplyAllMappingsAuditorsSuccess({ msg: 'All existing auditor mappings deleted successfully' }));
          } catch (error) {
            this.store.dispatch(new ReapplyAllMappingsAuditorsFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) }));
          }
        })
      ),
    { dispatch: false }
  );
}
