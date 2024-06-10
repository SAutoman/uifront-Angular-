/**
 * Global
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
/**
 * Project
 */
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApiClientsService } from '@wfm/service-layer/services/api-clients.service';
import {
  AddApiClient,
  AddApiClientFailed,
  AddApiClientsuccess,
  ApiClientsActionTypes,
  DeleteApiClient,
  DeleteApiClientFailed,
  DeleteApiClientsuccess,
  GetApiClients,
  GetApiClientsFailed,
  GetApiClientsSuccess
} from './api-clients-actions';
import { ApiClientState } from './api-clients-reducer';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';

@Injectable()
export class ApiClientEffects extends TenantComponent {
  constructor(
    store: Store<ApiClientState>,
    private actions$: Actions,
    private apiClientsService: ApiClientsService,
    private errorHandlerService: ErrorHandlerService
  ) {
    super(store);
  }

  AddApiClient: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<AddApiClient>(ApiClientsActionTypes.AddApiClient),
      switchMap(async (action) => {
        try {
          let result = await this.apiClientsService.create(this.tenant, action.payload.data);
          if (result) {
            if (result.status.toString() === 'Success') {
              return new AddApiClientsuccess();
            }
          }
        } catch (error) {
          return new AddApiClientFailed({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  GetApiClients: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetApiClients>(ApiClientsActionTypes.GetApiClients),
      switchMap(async (action) => {
        try {
          let result = await this.apiClientsService.get(this.tenant);
          if (result) {
            return new GetApiClientsSuccess({ data: result });
          }
        } catch (error) {
          return new GetApiClientsFailed({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  DeleteApiClients: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<DeleteApiClient>(ApiClientsActionTypes.DeleteApiClient),
      switchMap(async (action) => {
        try {
          let result = await this.apiClientsService.delete(this.tenant, action.payload.id);
          if (result.status.toString() === 'Success') {
            return new DeleteApiClientsuccess({ msg: 'Deleted Successfully' });
          }
        } catch (error) {
          return new DeleteApiClientFailed({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );
}
