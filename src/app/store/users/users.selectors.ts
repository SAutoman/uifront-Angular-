import { createSelector } from '@ngrx/store';
import { UsersState } from './users.reducer';

export const selectUsersState: (u: any) => UsersState = (state) => state.users;

export const getAllUsersSelector = createSelector(selectUsersState, (data) => data.entities);

export const currentUserSelector = createSelector(selectUsersState, (profile) => profile.data);

export const seachProfilesSelector = createSelector(selectUsersState, (auth) => auth.searchProfiles);

export const userSubscriptionsList = createSelector(selectUsersState, (user) => user.userSubscriptionsList);

export const userSubscriptionsLoading = createSelector(selectUsersState, (user) => user.subscriptionsLoading);

export const userSubscriptionOperationMsgSelector = createSelector(selectUsersState, (user) => user.userSubscriptionOperationMsg);

export const userOperationSuccessSelector = createSelector(selectUsersState, (auth) => auth.success);

export const userOperationFailureSelector = createSelector(selectUsersState, (auth) => auth.error);

export const operationMsgSelector = createSelector(selectUsersState, (auth) => auth.operationMsg);

export const deactivatedUsersSelector = createSelector(selectUsersState, (auth) => auth.deactivatedUsers);

export const loadingSelector = createSelector(selectUsersState, (auth) => auth.loading);

export const tenantUsersSelector = createSelector(selectUsersState, (auth) => auth.tenantUsers);
