/**
 * global
 */
import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Update } from '@ngrx/entity';

import { Observable } from 'rxjs';
import { exhaustMap, switchMap, withLatestFrom } from 'rxjs/operators';

/**
 * project
 */
import { UserProfileService, UsersService, User } from '../../service-layer';

/**
 * local
 */

import {
  UsersActionTypes,
  // CreateUsers,
  // CreateUsersSuccess,
  // CreateUsersFail,
  LoadUsersById,
  LoadUsersByIdSuccess,
  LoadUsersByIdFail,
  UpdateUsers,
  UpdateUsersSuccess,
  UpdateUsersFail,
  // DeleteUsersById,
  // DeleteUsersByIdSuccess,
  // DeleteUsersByIdFail,
  GetUserProfile,
  GetUserProfileSuccess,
  GetUserProfileFailed,
  // GetUserSearchProfilesSuccess,
  // SetUserSearchProfiles,
  SearchAllUsersEntitiesSuccess,
  SearchAllUsersEntitiesFail,
  SearchAllUsersEntities,
  GetUserSubscriptions,
  GetUserSubscriptionsSuccess,
  GetUserSubscriptionsFailed,
  UnsubscribeUser,
  UnsubscribeUserFailed,
  UnsubscribeUserSuccess,
  SubscribeUserSuccess,
  SubscribeUserFailed,
  SubscribeUser,
  DeactivateUser,
  DeactivateUserFail,
  DeactivateUserSuccess,
  GetDeactivatedUsers,
  GetDeactivatedUsersSuccess,
  GetDeactivatedUsersFailed,
  ReactivateUser,
  ReactivateUserFailed,
  ReactivateUserSuccess,
  DeleteDeactivatedUser,
  GetUsersByTenant,
  GetUsersByTenantFailed,
  GetUsersByTenantSuccess
} from './users.actions';
import { currentUserSelector } from './users.selectors';
import { UsersAppState } from './users.reducer';
import { DeactivatedUsersService } from '@wfm/service-layer/services/deactivated-users.service';
import { UserTopicService } from '@wfm/service-layer/services/user-topic.service';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';

@Injectable()
export class UsersEffects {
  constructor(
    private actions$: Actions,
    private service: UsersService,
    public userProfileService: UserProfileService,
    private store: Store<UsersAppState>,
    private deactivatedUsersService: DeactivatedUsersService,
    private userTopicService: UserTopicService,
    private errorHandlerService: ErrorHandlerService
  ) {}

  // ========================================= CREATE
  // create: Observable<Action> = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType<CreateUsers>(UsersActionTypes.CreateUsers),
  //     exhaustMap(async (action) => {
  //       try {
  //         const users = await this.service.create(action.payload.users);
  //         return new CreateUsersSuccess({ result: users });
  //       } catch (error) {
  //         return new CreateUsersFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
  //       }
  //     })
  //   )
  // );

  // ========================================= SEARCH
  // @Effect()
  // search: Observable<Action> = this.actions$
  // .pipe(
  //     ofType<SearchAllUsersEntities>(UsersActionTypes.SearchAllUsersEntities),
  //     // Use the state's filtering and pagination values in this search call
  //     // here if desired:
  //     exhaustMap(() =>
  //       this.service.search().pipe(
  //         map((entities: Array<Users>) =>
  //           new SearchAllUsersEntitiesSuccess({ result: entities })
  //         ),
  //         catchError(({ message }) =>
  //           of(new SearchAllUsersEntitiesFail({ error: message }))
  //         )
  //       )
  //     )
  //   );

  getAll: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<SearchAllUsersEntities>(UsersActionTypes.SearchAllUsersEntities),
      exhaustMap(async (action) => {
        try {
          const users = await this.service.getAll(action.payload.paging, action.payload.sorting);
          return new SearchAllUsersEntitiesSuccess({ result: users.items });
        } catch (error) {
          return new SearchAllUsersEntitiesFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  // ========================================= LOAD BY ID
  loadById: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<LoadUsersById>(UsersActionTypes.LoadUsersById),
      switchMap(async (action) => {
        try {
          const users = await this.service.getById(action.payload.id);
          return new LoadUsersByIdSuccess({ result: users });
        } catch (error) {
          return new LoadUsersByIdFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  // ========================================= UPDATE
  update: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<UpdateUsers>(UsersActionTypes.UpdateUsers),
      exhaustMap(async (action) => {
        try {
          const users = await this.service.update(action.payload.users);
          return new UpdateUsersSuccess({
            update: { id: users.id, changes: users } as Update<User>
          });
        } catch (error) {
          return new UpdateUsersFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  // ========================================= DELETE
  // delete: Observable<Action> = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType<DeleteUsersById>(UsersActionTypes.DeleteUsersById),
  //     exhaustMap(async (action) => {
  //       try {
  //         await this.service.deleteById(action.payload.id);
  //         return new DeleteUsersByIdSuccess({ id: action.payload.id });
  //       } catch (error) {
  //         return new DeleteUsersByIdFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
  //       }
  //     })
  //   )
  // );

  // ===================================== DEACTIVATE USER

  DeactivateUser: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<DeactivateUser>(UsersActionTypes.DeactivateUser),
      exhaustMap(async (action) => {
        try {
          const op = await this.service.deactivateUser(action.payload.tenantId, action.payload.userId);
          if (op.status.toString() === 'Success') {
            return new DeactivateUserSuccess({ userId: action.payload.userId });
          }
        } catch (error) {
          return new DeactivateUserFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  // ========================================= QUERY
  // paging: Observable<Action> = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType<SetUsersSearchQuery>(UsersActionTypes.SetSearchQuery),
  //     tap((action) => {
  //       // do stuff with: action.payload.limit & action.payload.page
  //     })
  //   ),
  //   {
  //     dispatch: false
  //   }
  // );

  // ========================================= SELECTED ID

  // selectedId: Observable<Action> = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType<SelectUsersById>(UsersActionTypes.SelectUsersById),
  //     tap((action) => {
  //       // do stuff with: action.payload.id
  //     })
  //   ),
  //   {
  //     dispatch: false
  //   });

  // ========================================= GET USER PROFILE
  GetUserProfile: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetUserProfile>(UsersActionTypes.GetUserProfile),
      withLatestFrom(this.store.select(currentUserSelector)),
      exhaustMap(async () => {
        try {
          const data = await this.userProfileService.getProfile();
          return new GetUserProfileSuccess({ result: data });
        } catch (error) {
          return new GetUserProfileFailed({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  // Load user search profiles
  // GetUserSearchProfiles = createEffect(
  //   () =>
  //     this.actions$.pipe(
  //       ofType<GetUserSearchProfilesSuccess>(UsersActionTypes.GetUserSearchProfilesSuccess),
  //       tap(async (a) => {
  //         try {
  //           const settingsKeys = <SettingsKeys>{ keys: [appRawDataSearchProfile], isExclusive: false };
  //           const searchProfiles = await this.usersService.getUserSettingsByKeys(a.payload.tenantId, a.payload.userId, settingsKeys);
  //           const filteredSearchProfiles = searchProfiles.settings.filter((s) => s.key === appRawDataSearchProfile);
  //           return new SetUserSearchProfiles({ searchProfiles: filteredSearchProfiles });
  //         } catch (error) {
  //           console.log(error);
  //         }
  //       })
  //     ),
  //   {
  //     dispatch: false
  //   }
  // );

  // ==================================== Deactivated Users

  GetDeactivatedUsers: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetDeactivatedUsers>(UsersActionTypes.GetDeactivatedUsers),
      switchMap(async (action) => {
        try {
          const users = await this.deactivatedUsersService.getDeactivatedUsers(
            action.payload.tenantId,
            action.payload.skip,
            action.payload.take
          );
          return new GetDeactivatedUsersSuccess({ data: users });
        } catch (error) {
          return new GetDeactivatedUsersFailed({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  ReactivateUser: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<ReactivateUser>(UsersActionTypes.ReactivateUser),
      exhaustMap(async (action) => {
        try {
          const users = await this.deactivatedUsersService.reactivateDeactivatedUser(action.payload.tenantId, action.payload.userId);
          return new ReactivateUserSuccess('User reactivated successfully');
        } catch (error) {
          return new ReactivateUserFailed(this.errorHandlerService.getAndShowErrorMsg(error));
        }
      })
    )
  );

  DeleteReactivatedUser: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<DeleteDeactivatedUser>(UsersActionTypes.DeleteDeactivatedUser),
      exhaustMap(async (action) => {
        try {
          const users = await this.deactivatedUsersService.deleteDeactivatedUser(action.payload.tenantId, action.payload.userId);
          return new ReactivateUserSuccess('User Deleted successfully');
        } catch (error) {
          return new ReactivateUserFailed(this.errorHandlerService.getAndShowErrorMsg(error));
        }
      })
    )
  );

  // ================================ User Subscriptions

  GetUserSubscriptions: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetUserSubscriptions>(UsersActionTypes.GetUserSubscriptions),
      exhaustMap(async (action) => {
        try {
          const data = await this.userTopicService.getAllSubscriptions(action.tenantId);
          return new GetUserSubscriptionsSuccess({ data: data });
        } catch (error) {
          return new GetUserSubscriptionsFailed(this.errorHandlerService.getAndShowErrorMsg(error));
        }
      })
    )
  );

  UnsubscribeUser: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<UnsubscribeUser>(UsersActionTypes.UnsubscribeUser),
      exhaustMap(async (action) => {
        try {
          const result = await this.userTopicService.unsubscribe({
            notificationTopicId: action.payload.id,
            tenantId: action.payload.tenantId,
            userId: action.payload.userId
          });
          if (result.status.toString().toLowerCase() === 'success') {
            return new UnsubscribeUserSuccess('Unsubscribed Successfully');
          }
        } catch (error) {
          return new UnsubscribeUserFailed(this.errorHandlerService.getAndShowErrorMsg(error));
        }
      })
    )
  );

  SubscribeUser: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<SubscribeUser>(UsersActionTypes.SubscribeUser),
      exhaustMap(async (action) => {
        try {
          const result = await this.userTopicService.subscribe({
            notificationTopicId: action.payload.topicId,
            tenantId: action.payload.tenantId,
            userId: action.payload.userId
          });
          if (result.status.toString().toLowerCase() === 'success') {
            return new SubscribeUserSuccess('Subscribed Successfully');
          }
        } catch (error) {
          return new SubscribeUserFailed('Failed to Subscribe');
        }
      })
    )
  );

  GetUsersByTenant: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetUsersByTenant>(UsersActionTypes.GetUsersByTenant),
      exhaustMap(async (action) => {
        try {
          const result = await this.service.searchByTenant(action.payload.tenantId, action.payload.pagingData);
          return new GetUsersByTenantSuccess({ users: result?.items || [] });
        } catch (error) {
          return new GetUsersByTenantFailed('Failed to fetch users');
        }
      })
    )
  );
}
