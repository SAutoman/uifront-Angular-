/**
 * global
 */
import { Injectable } from '@angular/core';
import { ofType, Actions, createEffect } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import { LoadOperations, OperationsTypes, LoadOperationsSuccess, LoadOperationsFailure } from './operations.actions';
import { OperationsState } from './operations.reducer';
import { OperationService } from '../../service-layer/services/operation.service';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';

@Injectable()
export class OperationsEffects {
  constructor(
    private actions$: Actions,
    private store: Store<OperationsState>,
    private operationsService: OperationService,
    private errorHandlerService: ErrorHandlerService
  ) {}

  LoadOperations = createEffect(
    () =>
      this.actions$.pipe(
        ofType<LoadOperations>(OperationsTypes.LoadOperations),
        tap(async (action) => {
          try {
            const result = await this.operationsService.getAll(action.payload.actor, action.payload.status, action.payload.paging);
            this.store.dispatch(new LoadOperationsSuccess({ result, actor: action.payload.actor, status: action.payload.status }));
          } catch (error) {
            this.store.dispatch(new LoadOperationsFailure({ error: this.errorHandlerService.getAndShowErrorMsg(error) }));
          }
        })
      ),
    { dispatch: false }
  );
}
