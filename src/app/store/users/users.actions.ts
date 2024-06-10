/**
 * global
 */
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';

/**
 * project
 */
import { UserProfileResponse, User, DataFilterDef, SortingDef, Paging, DeactivatedUser, PagedData } from '../../service-layer';

/**
 * local
 */
import { UsersSearchQuery, UserSubscription } from './users.reducer';

export enum UsersActionTypes {
  // CreateUsers = '[Users] Create',
  // CreateUsersSuccess = '[Users] Insert Success',
  // CreateUsersFail = '[Users] Insert Fail',

  SearchAllUsersEntities = '[Users] Search',
  SearchAllUsersEntitiesSuccess = '[Users] Search Success',
  SearchAllUsersEntitiesFail = '[Users] Search Fail',

  LoadUsersById = '[Users] Load By ID',
  LoadUsersByIdSuccess = '[Users] Load Success',
  LoadUsersByIdFail = '[Users] Load Fail',

  UpdateUsers = '[Users] Update',
  UpdateUsersSuccess = '[Users] Update Success',
  UpdateUsersFail = '[Users] Update Fail',

  // DeleteUsersById = '[Users] Delete By ID',
  // DeleteUsersByIdSuccess = '[Users] Delete Success',
  // DeleteUsersByIdFail = '[Users] Delete Fail',

  SetSearchQuery = '[Users] Set Search Query',
  SelectUsersById = '[Users] Select By ID',

  GetUserProfile = '[Users] Get User Profile',
  GetUserProfileSuccess = '[Users] User Profile Success',
  GetUserProfileFailed = '[Users] User Profile Failed',

  // GetUserSearchProfilesSuccess = '[Users] Get User Search Profiles Success',
  // SetUserSearchProfiles = '[Users] Set User Search Profiles',

  GetUserSubscriptions = '[Users] Get Users Subscriptions',
  GetUserSubscriptionsSuccess = '[Users] Get Users Subscriptions Success',
  GetUserSubscriptionsFailed = '[Users] Get Users Subscriptions Failed',

  UnsubscribeUser = '[User] Unsubscribe User',
  UnsubscribeUserSuccess = '[User] Unsubscribe User Success',
  UnsubscribeUserFailed = '[User] Unsubscribe User Failed',

  ResetSubscriptionOperationMsg = '[User] Reset Subscription Operation Msg',

  SubscribeUser = '[User] Subscribe User',
  SubscribeUserSuccess = '[User] Subscribe User Success',
  SubscribeUserFailed = '[User] Subscribe User Failed',

  DeactivateUser = '[Users] Deactivate User',
  DeactivateUserSuccess = '[Users] Deactivate User Success',
  DeactivateUserFail = '[Users] Deactivate User Fail',
  ResetUserOperationsState = '[User] Reset User OperationsState',

  GetDeactivatedUsers = '[User] Get Deactivated Users',
  GetDeactivatedUsersSuccess = '[User] Get Deactivated Users Success',
  GetDeactivatedUsersFailed = '[User] Get Deactivated Users Failed',

  ReactivateUser = '[User] Reactivate User',
  ReactivateUserSuccess = '[User] Reactivate User Success',
  ReactivateUserFailed = '[User] Reactivate User Failed',

  DeleteDeactivatedUser = '[User] Delete Deactivated User',
  DeleteDeactivatedUserSuccess = '[User] Delete Deactivated User Success',
  DeleteDeactivatedUserFailed = '[User] Delete Deactivated User Failed',

  ResetUserOperationMsg = '[User] Reset User Operation msg',

  GetUsersByTenant = '[User] Get Users By Tenant',
  GetUsersByTenantSuccess = '[User] Get Users By Tenant Success',
  GetUsersByTenantFailed = '[User] Get Users By Tenant Failed'
}

// ========================================= CREATE

// export class CreateUsers implements Action {
//   readonly type = UsersActionTypes.CreateUsers;
//   constructor(public payload: { users: User }) {}
// }

// export class CreateUsersSuccess implements Action {
//   readonly type = UsersActionTypes.CreateUsersSuccess;
//   constructor(public payload: { result: User }) {}
// }

// export class CreateUsersFail implements Action {
//   readonly type = UsersActionTypes.CreateUsersFail;
//   constructor(public payload: { error: string }) {}
// }

// ========================================= SEARCH

export class SearchAllUsersEntities implements Action {
  readonly type = UsersActionTypes.SearchAllUsersEntities;
  constructor(public payload: { paging: Paging; sorting: SortingDef; filtering: DataFilterDef }) {}
}

export class SearchAllUsersEntitiesSuccess implements Action {
  readonly type = UsersActionTypes.SearchAllUsersEntitiesSuccess;
  constructor(public payload: { result: Array<User> }) {}
}

export class SearchAllUsersEntitiesFail implements Action {
  readonly type = UsersActionTypes.SearchAllUsersEntitiesFail;
  constructor(public payload: { error: string }) {}
}

// ========================================= LOAD BY ID

export class LoadUsersById implements Action {
  readonly type = UsersActionTypes.LoadUsersById;
  constructor(public payload: { id: string }) {}
}

export class LoadUsersByIdSuccess implements Action {
  readonly type = UsersActionTypes.LoadUsersByIdSuccess;
  constructor(public payload: { result: User }) {}
}

export class LoadUsersByIdFail implements Action {
  readonly type = UsersActionTypes.LoadUsersByIdFail;
  constructor(public payload: { error: string }) {}
}

// ========================================= UPDATE

export class UpdateUsers implements Action {
  readonly type = UsersActionTypes.UpdateUsers;
  constructor(public payload: { users: User }) {}
}

export class UpdateUsersSuccess implements Action {
  readonly type = UsersActionTypes.UpdateUsersSuccess;
  constructor(public payload: { update: Update<User> }) {}
}

export class UpdateUsersFail implements Action {
  readonly type = UsersActionTypes.UpdateUsersFail;
  constructor(public payload: { error: string }) {}
}

// ========================================= DELETE

// export class DeleteUsersById implements Action {
//   readonly type = UsersActionTypes.DeleteUsersById;
//   constructor(public payload: { id: string }) {}
// }

// export class DeleteUsersByIdSuccess implements Action {
//   readonly type = UsersActionTypes.DeleteUsersByIdSuccess;
//   constructor(public payload: { id: string }) {}
// }

// export class DeleteUsersByIdFail implements Action {
//   readonly type = UsersActionTypes.DeleteUsersByIdFail;
//   constructor(public payload: { error: string }) {}
// }

// ========================================= QUERY

export class SetUsersSearchQuery implements Action {
  readonly type = UsersActionTypes.SetSearchQuery;
  constructor(public payload: Partial<UsersSearchQuery>) {}
}

// ========================================= SELECTED ID

export class SelectUsersById implements Action {
  readonly type = UsersActionTypes.SelectUsersById;
  constructor(public payload: { id: string }) {}
}

// ========================================= GET USER PROFILE

export class GetUserProfile implements Action {
  readonly type = UsersActionTypes.GetUserProfile;
}

export class GetUserProfileSuccess implements Action {
  readonly type = UsersActionTypes.GetUserProfileSuccess;
  constructor(public payload: { result: UserProfileResponse }) {}
}

export class GetUserProfileFailed implements Action {
  readonly type = UsersActionTypes.GetUserProfileFailed;
  constructor(public payload: { error: string }) {}
}

// export class GetUserSearchProfilesSuccess implements Action {
//   readonly type = UsersActionTypes.GetUserSearchProfilesSuccess;
//   constructor(public payload: { tenantId: string; userId: string }) {}
// }

// export class SetUserSearchProfiles implements Action {
//   readonly type = UsersActionTypes.SetUserSearchProfiles;
//   constructor(public payload: { searchProfiles: Settings[] }) {}
// }

// ===================================== User Subscriptions

export class GetUserSubscriptions implements Action {
  readonly type = UsersActionTypes.GetUserSubscriptions;
  constructor(public tenantId: string) {}
}

export class GetUserSubscriptionsSuccess implements Action {
  readonly type = UsersActionTypes.GetUserSubscriptionsSuccess;
  constructor(public payload: { data: UserSubscription[] }) {}
}

export class GetUserSubscriptionsFailed implements Action {
  readonly type = UsersActionTypes.GetUserSubscriptionsFailed;
  constructor(public error: string) {}
}

export class UnsubscribeUser implements Action {
  readonly type = UsersActionTypes.UnsubscribeUser;
  constructor(public payload: { id: string; tenantId: string; userId: string }) {}
}

export class UnsubscribeUserSuccess implements Action {
  readonly type = UsersActionTypes.UnsubscribeUserSuccess;
  constructor(public msg: string) {}
}

export class UnsubscribeUserFailed implements Action {
  readonly type = UsersActionTypes.UnsubscribeUserFailed;
  constructor(public msg: string) {}
}

export class ResetSubscriptionOperationMsg implements Action {
  readonly type = UsersActionTypes.ResetSubscriptionOperationMsg;
  constructor() {}
}

export class SubscribeUser implements Action {
  readonly type = UsersActionTypes.SubscribeUser;
  constructor(public payload: { topicId: string; tenantId: string; userId: string }) {}
}

export class SubscribeUserSuccess implements Action {
  readonly type = UsersActionTypes.SubscribeUserSuccess;
  constructor(public msg: string) {}
}

export class SubscribeUserFailed implements Action {
  readonly type = UsersActionTypes.SubscribeUserFailed;
  constructor(public msg: string) {}
}

export class DeactivateUser implements Action {
  readonly type = UsersActionTypes.DeactivateUser;
  constructor(public payload: { tenantId: string; userId: string }) {}
}

export class DeactivateUserSuccess implements Action {
  readonly type = UsersActionTypes.DeactivateUserSuccess;
  constructor(public payload: { userId: string }) {}
}

export class DeactivateUserFail implements Action {
  readonly type = UsersActionTypes.DeactivateUserFail;
  constructor(public payload: { error: string }) {}
}

export class ResetUserOperationsState implements Action {
  readonly type = UsersActionTypes.ResetUserOperationsState;
  constructor() {}
}

// =================================== Deactiavted Users

export class GetDeactivatedUsers implements Action {
  readonly type = UsersActionTypes.GetDeactivatedUsers;
  constructor(public payload: { tenantId: string; skip: number; take: number }) {}
}

export class GetDeactivatedUsersSuccess implements Action {
  readonly type = UsersActionTypes.GetDeactivatedUsersSuccess;
  constructor(public payload: { data: PagedData<DeactivatedUser> }) {}
}

export class GetDeactivatedUsersFailed implements Action {
  readonly type = UsersActionTypes.GetDeactivatedUsersFailed;
  constructor(public payload: { error: string }) {}
}

export class ReactivateUser implements Action {
  readonly type = UsersActionTypes.ReactivateUser;
  constructor(public payload: { tenantId: string; userId: string }) {}
}

export class ReactivateUserSuccess implements Action {
  readonly type = UsersActionTypes.ReactivateUserSuccess;
  constructor(public msg: string) {}
}

export class ReactivateUserFailed implements Action {
  readonly type = UsersActionTypes.ReactivateUserFailed;
  constructor(public error: string) {}
}

export class DeleteDeactivatedUser implements Action {
  readonly type = UsersActionTypes.DeleteDeactivatedUser;
  constructor(public payload: { tenantId: string; userId: string }) {}
}

export class DeleteDeactivatedUserSuccess implements Action {
  readonly type = UsersActionTypes.DeleteDeactivatedUserSuccess;
  constructor(public msg: string) {}
}

export class DeleteDeactivatedUserFailed implements Action {
  readonly type = UsersActionTypes.DeleteDeactivatedUserFailed;
  constructor(public error: string) {}
}

export class ResetUserOperationMsg implements Action {
  readonly type = UsersActionTypes.ResetUserOperationMsg;
  constructor() {}
}

export class GetUsersByTenant implements Action {
  readonly type = UsersActionTypes.GetUsersByTenant;
  constructor(public payload: { tenantId: string; pagingData: Paging }) {}
}

export class GetUsersByTenantSuccess implements Action {
  readonly type = UsersActionTypes.GetUsersByTenantSuccess;
  constructor(public payload: { users: User[] }) {}
}

export class GetUsersByTenantFailed implements Action {
  readonly type = UsersActionTypes.GetUsersByTenantFailed;
  constructor(public error: string) {}
}

export type UsersActions =
  // | CreateUsers
  // | CreateUsersSuccess
  // | CreateUsersFail
  | SearchAllUsersEntities
  | SearchAllUsersEntitiesSuccess
  | SearchAllUsersEntitiesFail
  | LoadUsersById
  | LoadUsersByIdSuccess
  | LoadUsersByIdFail
  | UpdateUsers
  | UpdateUsersSuccess
  | UpdateUsersFail
  // | DeleteUsersById
  // | DeleteUsersByIdSuccess
  // | DeleteUsersByIdFail
  | SetUsersSearchQuery
  | SelectUsersById
  | GetUserProfile
  | GetUserProfileSuccess
  | GetUserProfileFailed
  // | GetUserSearchProfilesSuccess
  // | SetUserSearchProfiles
  | GetUserSubscriptions
  | GetUserSubscriptionsSuccess
  | GetUserSubscriptionsFailed
  | UnsubscribeUser
  | UnsubscribeUserSuccess
  | UnsubscribeUserFailed
  | ResetSubscriptionOperationMsg
  | SubscribeUser
  | SubscribeUserSuccess
  | SubscribeUserFailed
  | DeactivateUser
  | DeactivateUserSuccess
  | DeactivateUserFail
  | ResetUserOperationsState
  | GetDeactivatedUsers
  | GetDeactivatedUsersSuccess
  | GetDeactivatedUsersFailed
  | ReactivateUser
  | ReactivateUserSuccess
  | ReactivateUserFailed
  | DeleteDeactivatedUser
  | DeleteDeactivatedUserSuccess
  | DeleteDeactivatedUserFailed
  | ResetUserOperationMsg
  | GetUsersByTenant
  | GetUsersByTenantSuccess
  | GetUsersByTenantFailed;
