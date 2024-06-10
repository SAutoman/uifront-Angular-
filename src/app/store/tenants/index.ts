import { createSelector, createFeatureSelector } from '@ngrx/store';

import { tenantsAdapter, getTenantsSelectedId, getTenantsLoading, getTenantsError, getTenantsQuery } from './tenants.reducer';
import { TenantsState } from './tenants.reducer';

export * from './payload-models';
export * from './tenants.model';

export * from './tenants.actions';
export * from './tenants.effects';

export * from './tenants.reducer';
export * from './tenants.selectors';

export const getTenantsState = createFeatureSelector<TenantsState>('tenants');

const {
  selectIds: tenantsIds,
  selectEntities: tenantsEntities,
  selectAll: tenants,
  selectTotal: tenantsCount
} = tenantsAdapter.getSelectors(getTenantsState);

export const currentTenantsId = createSelector(getTenantsState, getTenantsSelectedId);

export const currentTenants = createSelector(
  currentTenantsId,
  tenantsEntities,
  (selectedTenantsId, entities) => selectedTenantsId && entities[selectedTenantsId]
);

export const tenantsLoading = createSelector(
  // TODO: Need to pluraliae  name
  getTenantsState,
  getTenantsLoading
);

export const tenantsError = createSelector(getTenantsState, getTenantsError);

export const tenantsQuery = createSelector(getTenantsState, getTenantsQuery);
