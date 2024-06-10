import { createSelector, createFeatureSelector } from '@ngrx/store';

import { usersAdapter, getUsersSelectedId, getUsersLoading, getUsersError, getUsersQuery } from './users.reducer';
import { UsersState } from './users.reducer';

export * from './users.actions';
export * from './users.effects';
export * from './users.model';
export * from './users.reducer';
export * from './users.selectors';

export const getUsersState = createFeatureSelector<UsersState>('users');

const {
  selectIds: usersIds,
  selectEntities: usersEntities,
  selectAll: users,
  selectTotal: usersCount
} = usersAdapter.getSelectors(getUsersState);

export const currentUsersId = createSelector(getUsersState, getUsersSelectedId);

export const currentUsers = createSelector(
  currentUsersId,
  usersEntities,
  (selectedUsersId, entities) => selectedUsersId && entities[selectedUsersId]
);

export const usersLoading = createSelector(
  // TODO: Need to pluraliae  name
  getUsersState,
  getUsersLoading
);

export const usersError = createSelector(getUsersState, getUsersError);

export const usersQuery = createSelector(getUsersState, getUsersQuery);
