/**
 * global
 */
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { switchMap } from 'rxjs/operators';

/**
 * project
 */

import { appDateFormatKey, SettingsKeys, SettingsUI, UsersService } from '@wfm/service-layer';
import { ApplicationState } from '../application-state';

/**
 * local
 */
import { StoreDateFormatSettingAction, DateFormatActionTypes, StoreDateFormatSettingActionFail } from './date-format.actions';
import { SetUserSettingsByKeyAction } from '..';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';

const getValueByKey = (item: { key: string; value?: { [key: string]: any } }): any => {
  if (!item.value) {
    return undefined;
  }
  if (!item.value[item.key] && item.value[item.key] !== 0) {
    return item.value;
  }
  return item.value[item.key];
};
@Injectable()
export class DateFormatEffects {
  constructor(
    private actions$: Actions,
    private store: Store<ApplicationState>,
    private usersService: UsersService,
    private errorHandlerService: ErrorHandlerService
  ) {}
  storeDateFormatSetting$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<StoreDateFormatSettingAction>(DateFormatActionTypes.StoreDateFormatSettingAction),
        switchMap(async (action) => {
          try {
            const settingKey = <SettingsKeys>{ keys: [appDateFormatKey], isExclusive: true };
            const dateFormat = await this.usersService.getUserSettingsByKeys(action.payload.tenantId, action.payload.userId, settingKey);
            const sett = dateFormat.settings[0];
            const dateFormatMap: { [key: string]: SettingsUI } = {
              [appDateFormatKey]: { key: sett.key, value: getValueByKey(sett), id: sett.id || sett.key }
            };
            this.store.dispatch(new SetUserSettingsByKeyAction({ userSettings: dateFormatMap }));
          } catch (error) {
            this.store.dispatch(new StoreDateFormatSettingActionFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) }));
          }
        })
      ),
    { dispatch: false }
  );
}
