import { createSelector } from '@ngrx/store';
import { TenantsState } from './tenants.reducer';

export const selectTenantsState: (u: any) => TenantsState = (state) => state.tenantsState;

export const currentPageSelector = createSelector(selectTenantsState, (ts) => ts.tenantListPageViewModel);

export const displayDeleteConfirmationSelector = createSelector(
  selectTenantsState,
  (ts) => ts.tenantListPageViewModel.displayDeleteConfirmation
);

export const loadedTenantSelector = createSelector(selectTenantsState, (t) => t.tenant);

export const tenantOperationMsgSelector = createSelector(selectTenantsState, (t) => t.tenantOperationMsg);
