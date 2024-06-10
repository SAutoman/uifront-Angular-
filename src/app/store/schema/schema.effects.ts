/**
 * global
 */
import { Injectable } from '@angular/core';

import { Store, Action } from '@ngrx/store';
import { ofType, Actions, createEffect } from '@ngrx/effects';

import { Observable } from 'rxjs';
import { exhaustMap, withLatestFrom } from 'rxjs/operators';

/**
 * project
 */
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';

/**
 * local
 */
import { SchemasState } from './schema.reducer';
import { GetAllSchemasAsFields, GetAllSchemasAsFieldsFail, GetAllSchemasAsFieldsSuccess, SchemaActionTypes } from './schema.actions';
import { schemasAsFieldSelector } from './schema.selectors';
import { TenantComponent } from '../../shared/tenant.component';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';

@Injectable()
export class SchemaEffects extends TenantComponent {
  constructor(
    private actions$: Actions,
    private service: AdminSchemasService,
    private store: Store<SchemasState>,
    private errorHandlerService: ErrorHandlerService
  ) {
    super(store);
  }

  GetAllSchemasAsFields: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetAllSchemasAsFields>(SchemaActionTypes.GetAllSchemasAsFields),
      withLatestFrom(this.store.select(schemasAsFieldSelector)),
      exhaustMap(async () => {
        try {
          const result = await this.service.getAllSchemasAsListItems(this.tenant);
          return new GetAllSchemasAsFieldsSuccess({ result: result });
        } catch (error) {
          return new GetAllSchemasAsFieldsFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  // GetAllSchemas: Observable<Action> = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType<LoadSchemasByAreaType>(SchemaActionTypes.FetchAllSchemas),
  //     mergeMap(async (action) => {
  //       try {
  //         const result = await from(
  //           this.service.getList(action.payload.tenantId, action.payload.paging, action.payload.sorting, action.payload.area)
  //         ).toPromise();
  //         return new LoadSchemasByAreaTypeSuccess({ data: result.items });
  //       } catch (error) {
  //         this.errorHandlerService.getAndShowErrorMsg(error);
  //       }
  //     })
  //   )
  // );
}
