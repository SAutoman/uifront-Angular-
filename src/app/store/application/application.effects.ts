/**
 * global
 */
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { exhaustMap, tap, switchMap } from 'rxjs/operators';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';

/**
 * project
 */
import { ApplicationService, WfmApplication, OperationService } from '../../service-layer';
import { Operation } from '../../service-layer/models';
/**
 * local
 */

import {
  ApplicationActionTypes,
  CreateApplication,
  CreateApplicationSuccess,
  CreateApplicationFail,
  SearchAllApplicationEntities,
  SearchAllApplicationEntitiesSuccess,
  SearchAllApplicationEntitiesFail,
  LoadApplicationById,
  LoadApplicationByIdSuccess,
  LoadApplicationByIdFail,
  UpdateApplication,
  UpdateApplicationSuccess,
  UpdateApplicationFail,
  DeleteApplicationById,
  DeleteApplicationByIdSuccess,
  DeleteApplicationByIdFail,
  SetApplicationSearchQuery,
  SelectApplicationById
} from './application.actions';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';

@Injectable()
export class ApplicationEffects {
  // ========================================= CREATE
  create: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<CreateApplication>(ApplicationActionTypes.CreateApplication),
      exhaustMap(async (action) => {
        try {
          const operationId = (<Operation>await this.applicationService.create(action.payload.application)).id;
          const operation = await this.operationService.getByIdAsync(operationId);
          const result = await this.applicationService.getById(operation.targetId);

          return new CreateApplicationSuccess({ result });
        } catch (error) {
          return new CreateApplicationFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  // ========================================= SEARCH
  search: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<SearchAllApplicationEntities>(ApplicationActionTypes.SearchAllApplicationEntities),
      // Use the state's filtering and pagination values in this search call
      // here if desired:
      exhaustMap(async () => {
        try {
          const result = await this.applicationService.search();
          return new SearchAllApplicationEntitiesSuccess({ result });
        } catch (error) {
          return new SearchAllApplicationEntitiesFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  // ========================================= LOAD BY ID
  loadById: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<LoadApplicationById>(ApplicationActionTypes.LoadApplicationById),
      switchMap(async (action) => {
        try {
          const result = await this.applicationService.getById(action.payload.id);
          return new LoadApplicationByIdSuccess({ result });
        } catch (error) {
          return new LoadApplicationByIdFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  // ========================================= UPDATE
  update: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<UpdateApplication>(ApplicationActionTypes.UpdateApplication),
      exhaustMap(async (action) => {
        try {
          const operationId = (await this.applicationService.update(action.payload.application)).id;
          const operation = await this.operationService.getByIdAsync(operationId);
          const application = await this.applicationService.getById(operation.targetId);

          return new UpdateApplicationSuccess({ update: { id: application.id, changes: application } as Update<WfmApplication> });
        } catch (error) {
          return new UpdateApplicationFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  // ========================================= DELETE
  delete: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<DeleteApplicationById>(ApplicationActionTypes.DeleteApplicationById),
      exhaustMap(async (action) => {
        try {
          const operationId = (await this.applicationService.deleteById(action.payload.id)).id;
          const operation = await this.operationService.getByIdAsync(operationId);
          await this.applicationService.getById(operation.targetId);

          return new DeleteApplicationByIdSuccess({ id: action.payload.id });
        } catch (error) {
          return new DeleteApplicationByIdFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  // ========================================= QUERY

  paging: Observable<Action> = createEffect(
    () =>
      this.actions$.pipe(
        ofType<SetApplicationSearchQuery>(ApplicationActionTypes.SetSearchQuery),
        tap(() => {
          // do stuff with: action.payload.limit & action.payload.page
        })
      ),
    {
      dispatch: false
    }
  );

  // ========================================= SELECTED ID

  selectedId: Observable<Action> = createEffect(
    () =>
      this.actions$.pipe(
        ofType<SelectApplicationById>(ApplicationActionTypes.SelectApplicationById),
        tap(() => {
          // do stuff with: action.payload.id
        })
      ),
    {
      dispatch: false
    }
  );

  constructor(
    private actions$: Actions,
    private applicationService: ApplicationService,
    private operationService: OperationService,
    private errorHandlerService: ErrorHandlerService
  ) {}
}
