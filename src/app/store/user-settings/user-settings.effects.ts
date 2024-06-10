/**
 * global
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Action, Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, concatMap, withLatestFrom } from 'rxjs/operators';

/**
 * project
 */
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';

/**
 * local
 */

import { SettingsPerGroup, UserGroupsService, UserSettingShareService } from '../../service-layer';
import { BaseComponent } from '../../shared/base.component';
import {
  GetSharedUserSettingsPerGroupAction,
  GetSharedUserSettingsPerGroupActionFail,
  GetSharedUserSettingsPerGroupActionSuccess,
  GetSharedUserSettingsPerRoles,
  GetSharedUserSettingsPerRolesFail,
  GetSharedUserSettingsPerRolesSuccess,
  UserSettingsActionTypes
} from './user-settings.actions';
import { UserSettingsState } from './user-settings.reducer';
import { sharedSettingsPerGroup } from './user-settings.selectors';

@Injectable()
export class UserSettingsEffects extends BaseComponent {
  constructor(
    private actions$: Actions,
    private errorHandlerService: ErrorHandlerService,
    private userSettingShareService: UserSettingShareService,
    private userGroupsService: UserGroupsService,
    private store: Store<UserSettingsState>
  ) {
    super();
  }

  GetSharedUserSettingsPerRoles: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetSharedUserSettingsPerRoles>(UserSettingsActionTypes.GetSharedUserSettingsPerRoles),
      switchMap(async (action) => {
        try {
          const systemGroups = await this.userGroupsService.getSystemUserGroups(action.payload.tenantId);
          const promises = systemGroups.map((systemGroup) => {
            return this.userSettingShareService.getSettingsPerGroup(action.payload.tenantId, systemGroup.id);
          });

          const data = await Promise.all(promises);
          const response = data.map((groupSettings) => {
            return {
              settings: groupSettings.settings || [],
              groupId: groupSettings.groupId
            };
          });
          return new GetSharedUserSettingsPerRolesSuccess(response);
        } catch (error) {
          return new GetSharedUserSettingsPerRolesFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  GetSharedUserSettingsPerGroupAction: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetSharedUserSettingsPerGroupAction>(UserSettingsActionTypes.GetSharedUserSettingsPerGroupAction),
      withLatestFrom(this.store.select(sharedSettingsPerGroup)),
      concatMap(async (data) => {
        try {
          const groupSettings = data[1];
          const action = data[0];
          let settings: SettingsPerGroup;
          if (groupSettings && groupSettings[action.payload.groupId]) {
            settings = {
              groupId: action.payload.groupId,
              settings: groupSettings[action.payload.groupId]
            };
          } else {
            settings = await this.userSettingShareService.getSettingsPerGroup(action.payload.tenantId, action.payload.groupId);
          }
          return new GetSharedUserSettingsPerGroupActionSuccess(settings);
        } catch (error) {
          return new GetSharedUserSettingsPerGroupActionFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );
}
