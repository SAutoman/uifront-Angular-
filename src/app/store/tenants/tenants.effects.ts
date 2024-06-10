/**
 * global
 */
import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Update } from '@ngrx/entity';

import { Observable } from 'rxjs';
import { exhaustMap, switchMap } from 'rxjs/operators';

/**
 * project
 */
import { InvitationPopupComponent } from '../../tenants/invitation-popup/invitation-popup.component';

import { CopyTenantSettingsModel, Tenant, TenantsService } from '../../service-layer';

/**
 * local
 */

import {
  TenantsActionTypes,
  CreateTenants,
  CreateTenantsSuccess,
  CreateTenantsFail,
  FetchTenants,
  FetchTenantsSuccess,
  LoadTenantsById,
  LoadTenantsByIdSuccess,
  LoadTenantsByIdFail,
  UpdateTenants,
  UpdateTenantsSuccess,
  UpdateTenantsFail,
  DeleteTenantsById,
  DeleteTenantsByIdSuccess,
  DeleteTenantsByIdFail,
  CopyTenantData,
  CopyTenantDataSuccess,
  CopyTenantDataFailed
} from './tenants.actions';
import { MatDialog } from '@angular/material/dialog';
import { TenantsState } from './tenants.reducer';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';

@Injectable()
export class TenantsEffects {
  // ========================================= CREATE
  create: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<CreateTenants>(TenantsActionTypes.CreateTenants),
      exhaustMap(async (action) => {
        try {
          const result = await this.service.create(action.payload);
          const id = result.id;
          const dialogRef = this.dialog.open(InvitationPopupComponent);
          dialogRef.componentInstance.tenantName = action.payload.name;
          dialogRef.componentInstance.tenantId = id;

          if (action.copiedTenantId) {
            return new CopyTenantData(result.id, action.copiedTenantId);
          } else {
            return new CreateTenantsSuccess({ result: result, msg: 'New tenant has been created successfully-' + id });
          }
        } catch (error) {
          return new CreateTenantsFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  copyTenantData = createEffect(
    () =>
      this.actions$.pipe(
        ofType<CopyTenantData>(TenantsActionTypes.CopyTenantData),
        exhaustMap(async (action) => {
          try {
            const copySettingsModel = <CopyTenantSettingsModel>{
              oldTenantId: action.copiedTenantId,
              newTenantId: action.newTenantId,
              invitationTemplate: ''
            };
            const operation = await this.service.copySettingsFromTenant(copySettingsModel);
            if (operation.status.toString().toLowerCase() === 'success') {
              this.store.dispatch(new CopyTenantDataSuccess({ msg: 'New tenant has been created successfully-' + action.newTenantId }));
            }
          } catch (error) {
            this.store.dispatch(new CopyTenantDataFailed({ error: this.errorHandlerService.getAndShowErrorMsg(error) }));
          }
        })
      ),
    {
      dispatch: false
    }
  );

  // ========================================= SEARCH
  fetch: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<FetchTenants>(TenantsActionTypes.FetchTenants),
      switchMap(async (action) => {
        try {
          const result = await this.service.search(action.payload.paging, action.payload.sorting, action.payload.filters);
          return new FetchTenantsSuccess({ result: result });
        } catch (error) {
          return new LoadTenantsByIdFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  // ========================================= LOAD BY ID
  loadById: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<LoadTenantsById>(TenantsActionTypes.LoadTenantsById),
      switchMap(async (action) => {
        try {
          const result = await this.service.getById(action.payload.id);
          return new LoadTenantsByIdSuccess({ result });
        } catch (error) {
          return new LoadTenantsByIdFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  // ========================================= UPDATE
  update: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<UpdateTenants>(TenantsActionTypes.UpdateTenants),
      exhaustMap(async (action) => {
        try {
          const tenants = await this.service.update(action.payload.tenants);
          return new UpdateTenantsSuccess({
            update: { id: tenants.id, changes: tenants } as Update<Tenant>,
            msg: 'Tenant updated successfully'
          });
        } catch (error) {
          return new UpdateTenantsFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  // ========================================= DELETE
  delete: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<DeleteTenantsById>(TenantsActionTypes.DeleteTenantsById),
      exhaustMap(async (action) => {
        try {
          await this.service.deleteById(action.payload.id);
          return new DeleteTenantsByIdSuccess({ id: action.payload.id, msg: 'Tenant Deleted Successfully' });
        } catch (error) {
          return new DeleteTenantsByIdFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  // ========================================= QUERY
  // @Effect({
  //   dispatch: false
  // })
  // paging: Observable<Action> = this.actions$.pipe(
  //   ofType<SetTenantsSearchQuery>(TenantsActionTypes.SetSearchQuery),
  //   tap(() => {
  //     // do stuff with: action.payload.limit & action.payload.page
  //   })
  // );

  // ========================================= SELECTED ID
  // @Effect({
  //   dispatch: false
  // })
  // selectedId: Observable<Action> = this.actions$.pipe(
  //   ofType<SelectTenantsById>(TenantsActionTypes.SelectTenantsById),
  //   tap(() => {
  //     // do stuff with: action.payload.id
  //   })
  // );

  constructor(
    private actions$: Actions,
    private service: TenantsService,
    private dialog: MatDialog,
    private store: Store<TenantsState>,
    private errorHandlerService: ErrorHandlerService
  ) {}
}
