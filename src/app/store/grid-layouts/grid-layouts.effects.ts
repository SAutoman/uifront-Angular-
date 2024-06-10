/**
 * global
 */
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Store } from '@ngrx/store';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { switchMap, exhaustMap, withLatestFrom } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

/**
 * project
 */
import { SettingsKeys, UsersService } from '../../service-layer';
import { BaseComponent } from '../../shared/base.component';

/**
 * local
 */
import {
  GetGridLayoutAction,
  GridLayoutsTypes,
  GetGridLayoutActionFail,
  GetGridLayoutActionSuccess,
  CreateGridLayoutActionFail,
  CreateGridLayoutActionSuccess,
  CreateGridLayoutAction,
  DeleteGridLayoutAction,
  DeleteGridLayoutActionSuccess,
  DeleteGridLayoutActionFail,
  UpdateGridLayoutAction,
  UpdateGridLayoutActionFail,
  UpdateGridLayoutActionSuccess
} from './grid-layouts.actions';
import { GridLayoutsState } from './grid-layouts.reducer';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';
import { allGridLayoutSettings as allGridLayoutSettings } from './grid-layouts.selectors';

@Injectable()
export class GridLayoutsEffects extends BaseComponent {
  constructor(
    private actions$: Actions,
    private usersService: UsersService,
    private store: Store<GridLayoutsState>,
    private snackBar: MatSnackBar,
    private ts: TranslateService,
    private errorHandlerService: ErrorHandlerService
  ) {
    super();
  }
  getGridLayout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<GetGridLayoutAction>(GridLayoutsTypes.GetGridLayoutAction),
        withLatestFrom(this.store.select(allGridLayoutSettings)),
        switchMap(async (data) => {
          try {
            const action = data[0];
            const existingSettings = data[1];
            const settingName = action.payload.settingName;
            let result = existingSettings[settingName];
            if (action?.payload?.refreshList || !result) {
              const settingsKeys = <SettingsKeys>(<any>{ keys: [settingName], isExclusive: false });
              result = await this.usersService.getUserSettingsByKeys(action.payload.tenantId, action.payload.userId, settingsKeys);
            }
            this.store.dispatch(
              new GetGridLayoutActionSuccess({
                userSettings: result,
                settingKey: settingName,
                isChildGrid: action.payload.isChildGrid
              })
            );
          } catch (error) {
            this.store.dispatch(new GetGridLayoutActionFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) }));
          }
        })
      ),
    { dispatch: false }
  );

  createGridLayout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<CreateGridLayoutAction>(GridLayoutsTypes.CreateGridLayoutAction),
        exhaustMap(async (action) => {
          try {
            const config = action.payload.grid;
            const result = await this.usersService.createUserSettings(action.payload.tenantId, config);
            this.store.dispatch(new CreateGridLayoutActionSuccess({ result }));
            this.snackBar.open(this.ts.instant('Layout Saved Successfully'), 'CLOSE', {
              duration: 3000
            });
          } catch (error) {
            this.store.dispatch(new CreateGridLayoutActionFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) }));
            this.snackBar.open(this.ts.instant(`Couldn't create layout, please try again!`), 'CLOSE', {
              duration: 3000
            });
          }
        })
      ),
    { dispatch: false }
  );

  deleteGridLayout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<DeleteGridLayoutAction>(GridLayoutsTypes.DeleteGridLayoutAction),
        exhaustMap(async (action) => {
          try {
            await this.usersService.deleteUserSettings(action.payload.tenantId, action.payload.settingId);
            this.store.dispatch(new DeleteGridLayoutActionSuccess({ id: action.payload.settingId }));
          } catch (error) {
            this.store.dispatch(new DeleteGridLayoutActionFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) }));
          }
        })
      ),
    { dispatch: false }
  );

  updateGridLayout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<UpdateGridLayoutAction>(GridLayoutsTypes.UpdateGridLayoutAction),
        exhaustMap(async (action) => {
          try {
            const result = await this.usersService.updateUserSettings(action.payload.tenantId, action.payload.layout);
            this.store.dispatch(new UpdateGridLayoutActionSuccess({ update: { id: result.settings[0]?.id, changes: result } }));
          } catch (error) {
            this.store.dispatch(new UpdateGridLayoutActionFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) }));
          }
        })
      ),
    { dispatch: false }
  );
}
