/**
 * global
 */
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { TopicKindEnum, TopicSendTypeEnum } from '@wfm/service-layer/services/notification-topic.service';

/**
 * project
 */
import { User, Settings, DeactivatedUser, PagedData, Roles } from '../../service-layer';

/**
 * local
 */
import { UsersActions, UsersActionTypes } from './users.actions';

export interface UsersSearchQuery {
  filter: string;
  sorting: string;
  limit: number;
  page: number;
}

export interface UserSubscription {
  name: string;
  description: string;
  topicSendType: TopicSendTypeEnum;
  topicKind: TopicKindEnum;
  days: number;
  topicTemplateId: string;
  subject: string;
  roles: Roles[];
  userGroups: string[];
  userTopics: string[];
  id: string;
  subscribed: boolean;
}

export interface UsersState extends EntityState<User> {
  // additional entities state properties
  selectedId: string;
  loading: boolean;
  error: string;
  query: UsersSearchQuery;
  data: any;
  searchProfiles: Settings[];
  success?: string;
  operationMsg: string;
  deactivatedUsers: PagedData<DeactivatedUser>;
  userSubscriptionsList: UserSubscription[];
  userSubscriptionOperationMsg: string;
  subscriptionsLoading: boolean;
  tenantUsers: User[];
}

export interface UsersAppState {
  usersReducer: UsersState;
}

export const usersAdapter: EntityAdapter<User> = createEntityAdapter<User>();

export const initialUsersState: UsersState = usersAdapter.getInitialState({
  // additional users state properties
  selectedId: null,
  data: null,
  loading: false,
  error: '',
  query: {
    filter: '',
    sorting: '',
    limit: 999,
    page: 1
  },
  searchProfiles: null,
  userSubscriptionsList: null,
  userSubscriptionOperationMsg: null,
  subscriptionsLoading: false,
  operationMsg: null,
  deactivatedUsers: null,
  tenantUsers: null
});

// export const applicationAdapter: EntityAdapter<User> = createEntityAdapter<User>({
//   selectId: (model: User) => model.id
// });

export function usersReducer(state = initialUsersState, action: UsersActions): UsersState {
  switch (action.type) {
    // case UsersActionTypes.CreateUsers:
    //   return {
    //     ...state,
    //     loading: true,
    //     error: ''
    //   };

    // case UsersActionTypes.CreateUsersSuccess:
    //   return {
    //     ...usersAdapter.addOne(action.payload.result, state),
    //     loading: false,
    //     error: ''
    //   };

    // case UsersActionTypes.CreateUsersFail:
    //   return {
    //     ...state,
    //     loading: false,
    //     error: action.payload.error
    //   };

    case UsersActionTypes.SearchAllUsersEntities:
      return {
        ...usersAdapter.removeAll(state),
        loading: true,
        error: ''
      };

    case UsersActionTypes.SearchAllUsersEntitiesSuccess:
      return {
        ...usersAdapter.setAll(action.payload.result, state),
        loading: false,
        error: ''
      };

    case UsersActionTypes.SearchAllUsersEntitiesFail:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };

    case UsersActionTypes.LoadUsersById:
      return {
        ...usersAdapter.removeAll(state),
        selectedId: action.payload.id,
        loading: true,
        error: ''
      };

    case UsersActionTypes.LoadUsersByIdSuccess:
      return {
        ...usersAdapter.addOne(action.payload.result, state),
        loading: false,
        error: ''
      };

    case UsersActionTypes.LoadUsersByIdFail:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };

    case UsersActionTypes.UpdateUsers:
      return {
        ...state,
        loading: true,
        error: ''
      };

    case UsersActionTypes.UpdateUsersSuccess:
      return {
        ...usersAdapter.updateOne(action.payload.update, state),
        loading: false,
        error: ''
      };

    case UsersActionTypes.UpdateUsersFail:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };

    // case UsersActionTypes.DeleteUsersById:
    //   return {
    //     ...state,
    //     selectedId: action.payload.id,
    //     loading: true,
    //     error: ''
    //   };

    // case UsersActionTypes.DeleteUsersByIdSuccess:
    //   return {
    //     ...usersAdapter.removeOne(action.payload.id, state),
    //     loading: false,
    //     error: ''
    //   };

    // case UsersActionTypes.DeleteUsersByIdFail:
    //   return {
    //     ...state,
    //     loading: false,
    //     error: action.payload.error
    //   };

    case UsersActionTypes.SetSearchQuery:
      return {
        ...state,
        query: {
          ...state.query,
          ...action.payload
        }
      };

    case UsersActionTypes.SelectUsersById:
      return {
        ...state,
        selectedId: action.payload.id,
        error: ''
      };

    case UsersActionTypes.GetUserProfileSuccess:
      return {
        ...state,
        data: action.payload,
        error: ''
      };

    // case UsersActionTypes.SetUserSearchProfiles:
    //   return {
    //     ...state,
    //     searchProfiles: action.payload.searchProfiles
    //   };

    case UsersActionTypes.GetUserSubscriptions:
      return {
        ...state,
        subscriptionsLoading: true
      };
    case UsersActionTypes.GetUserSubscriptionsSuccess:
      return {
        ...state,
        subscriptionsLoading: false,
        userSubscriptionsList: action.payload.data
      };
    case UsersActionTypes.GetUserSubscriptionsFailed:
      return {
        ...state,
        subscriptionsLoading: false,
        userSubscriptionOperationMsg: 'Fail' + action.error
      };
    case UsersActionTypes.UnsubscribeUser:
      return {
        ...state,
        subscriptionsLoading: true
      };
    case UsersActionTypes.UnsubscribeUserSuccess:
      return {
        ...state,
        subscriptionsLoading: false,
        userSubscriptionOperationMsg: action.msg
      };
    case UsersActionTypes.UnsubscribeUserFailed:
      return {
        ...state,
        subscriptionsLoading: false,
        userSubscriptionOperationMsg: action.msg
      };
    case UsersActionTypes.ResetSubscriptionOperationMsg:
      return {
        ...state,
        userSubscriptionOperationMsg: null
      };
    case UsersActionTypes.SubscribeUser:
      return {
        ...state,
        subscriptionsLoading: true
      };
    case UsersActionTypes.SubscribeUserSuccess:
      return {
        ...state,
        subscriptionsLoading: false,
        userSubscriptionOperationMsg: action.msg
      };
    case UsersActionTypes.SubscribeUserFailed:
      return {
        ...state,
        subscriptionsLoading: false,
        userSubscriptionOperationMsg: action.msg
      };
    case UsersActionTypes.DeactivateUserSuccess:
      return {
        ...state,
        success: 'User Deactivated',
        error: null
      };
    case UsersActionTypes.DeactivateUserFail:
      return {
        ...state,
        success: null,
        error: 'Fail' + action.payload.error
      };
    case UsersActionTypes.ResetUserOperationsState:
      return {
        ...state,
        success: null,
        error: null
      };
    case UsersActionTypes.GetDeactivatedUsers:
      return {
        ...state,
        loading: true
      };
    case UsersActionTypes.GetDeactivatedUsersSuccess:
      return {
        ...state,
        loading: false,
        deactivatedUsers: action.payload.data
      };
    case UsersActionTypes.GetDeactivatedUsersFailed:
      return {
        ...state,
        loading: false
      };
    case UsersActionTypes.ReactivateUser:
      return {
        ...state,
        loading: true
      };
    case UsersActionTypes.ReactivateUserSuccess:
      return {
        ...state,
        loading: false,
        operationMsg: action.msg
      };
    case UsersActionTypes.ReactivateUserFailed:
      return {
        ...state,
        loading: false,
        operationMsg: 'Fail' + action.error
      };
    case UsersActionTypes.DeleteDeactivatedUser:
      return {
        ...state,
        loading: true
      };
    case UsersActionTypes.DeleteDeactivatedUserSuccess:
      return {
        ...state,
        loading: false,
        operationMsg: action.msg
      };
    case UsersActionTypes.DeleteDeactivatedUserFailed:
      return {
        ...state,
        loading: false,
        operationMsg: 'Fail' + action.error
      };
    case UsersActionTypes.ResetUserOperationMsg:
      return {
        ...state,
        operationMsg: null
      };
    case UsersActionTypes.GetUsersByTenant:
      return {
        ...state,
        loading: true
      };
    case UsersActionTypes.GetUsersByTenantSuccess:
      return {
        ...state,
        loading: false,
        tenantUsers: action.payload.users
      };
    case UsersActionTypes.GetUsersByTenantFailed:
      return {
        ...state,
        loading: false,
        operationMsg: 'Fail' + action.error
      };
    default:
      return state;
  }
}

export const getUsersSelectedId = (state: UsersState) => state.selectedId;
export const getUsersLoading = (state: UsersState) => state.loading;
export const getUsersError = (state: UsersState) => state.error;
export const getUsersQuery = (state: UsersState) => state.query;
