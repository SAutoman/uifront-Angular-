import { createSelector, createFeatureSelector } from '@ngrx/store';

import { applicationAdapter, getSelectedId, getLoading, getError, getQuery } from './application.reducer';
import { ApplicationState } from './application.reducer';

export const getApplicationState = createFeatureSelector<ApplicationState>('application');

const {
  selectIds: applicationIds,
  selectEntities: applicationEntities,
  selectAll: application,
  selectTotal: applicationCount
} = applicationAdapter.getSelectors(getApplicationState);

export const currentApplicationId = createSelector(getApplicationState, getSelectedId);

export const currentApplication = createSelector(
  currentApplicationId,
  applicationEntities,
  (selectedApplicationId, entities) => selectedApplicationId && entities[selectedApplicationId]
);

export const applicationLoading = createSelector(
  // TODO: Need to pluraliae  name
  getApplicationState,
  getLoading
);

export const applicationError = createSelector(getApplicationState, getError);

export const applicationQuery = createSelector(getApplicationState, getQuery);
