/**
 * global
 */
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap } from 'rxjs/operators';
/**
 * Project
 */
import { AppSettingsService } from '@wfm/service-layer/services/app-settings.service';
/**
 * Local
 */
import {
  AppSettingsActionTypes,
  CreateAppSettingAction,
  CreateAppSettingFailure,
  CreateAppSettingSuccess,
  DeleteAppSetting,
  DeleteAppSettingFailure,
  DeleteAppSettingSuccess,
  SearchAppSettings,
  SearchAppSettingsFailure,
  SearchAppSettingsSuccess,
  UpdateAppSetting,
  UpdateAppSettingFailure,
  UpdateAppSettingSuccess
} from './app-settings.actions';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';

@Injectable()
export class AppSettingsEffects {
  constructor(
    private actions$: Actions,
    private appSettingsService: AppSettingsService,
    private errorHandlerService: ErrorHandlerService
  ) {}

  searchAppSettings$ = createEffect(() =>
    this.actions$.pipe(
      ofType<SearchAppSettings>(AppSettingsActionTypes.SearchAppSettings),
      switchMap(async (action) => {
        try {
          const result = await this.appSettingsService.search(action.payload.paging);
          if (result?.items) return new SearchAppSettingsSuccess(result.items);
          else return new SearchAppSettingsSuccess([]);
        } catch (error) {
          return new SearchAppSettingsFailure(this.errorHandlerService.getAndShowErrorMsg(error));
        }
      })
    )
  );

  createAppSetting$ = createEffect(() =>
    this.actions$.pipe(
      ofType<CreateAppSettingAction>(AppSettingsActionTypes.CreateAppSetting),
      switchMap(async (action) => {
        try {
          const result = await this.appSettingsService.create(action.payload.data);
          if (result.status.toString().toLowerCase() === 'success') return new CreateAppSettingSuccess('App Setting Created Successfully');
        } catch (error) {
          return new CreateAppSettingFailure(this.errorHandlerService.getAndShowErrorMsg(error));
        }
      })
    )
  );

  updateAppSetting$ = createEffect(() =>
    this.actions$.pipe(
      ofType<UpdateAppSetting>(AppSettingsActionTypes.UpdateAppSetting),
      switchMap(async (action) => {
        try {
          const result = await this.appSettingsService.update(action.payload.data);
          if (result.status.toString().toLowerCase() === 'success') return new UpdateAppSettingSuccess('App Setting Updated Successfully');
        } catch (error) {
          return new UpdateAppSettingFailure(this.errorHandlerService.getAndShowErrorMsg(error));
        }
      })
    )
  );

  deleteAppSetting$ = createEffect(() =>
    this.actions$.pipe(
      ofType<DeleteAppSetting>(AppSettingsActionTypes.DeleteAppSetting),
      switchMap(async (action) => {
        try {
          const result = await this.appSettingsService.delete(action.payload.id);
          if (result.status.toString().toLowerCase() === 'success') {
            return new DeleteAppSettingSuccess('Setting Deleted Successfully');
          }
        } catch (error) {
          return new DeleteAppSettingFailure(this.errorHandlerService.getAndShowErrorMsg(error));
        }
      })
    )
  );
}
