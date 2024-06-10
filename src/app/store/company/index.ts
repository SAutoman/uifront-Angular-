import { createSelector, createFeatureSelector } from '@ngrx/store';
import { companyAdapter, getCompanySelectedId, getCompanyLoading, getCompanyError, getCompanyQuery, CompanyState } from './company.reducer';

export * from './company.actions';
export * from './company.effects';
export * from './company.selectors';
export * from './company.model';
export * from './company.reducer';

export const getCompanyState = createFeatureSelector<CompanyState>('company');

const {
  selectIds: companyIds,
  selectEntities: companyEntities,
  selectAll: company,
  selectTotal: companyCount
} = companyAdapter.getSelectors(getCompanyState);

export const currentCompanyId = createSelector(getCompanyState, getCompanySelectedId);

export const currentCompany = createSelector(
  currentCompanyId,
  companyEntities,
  (selectedCompanyId, entities) => selectedCompanyId && entities[selectedCompanyId]
);

export const companyLoading = createSelector(
  // TODO: Need to pluraliae  name
  getCompanyState,
  getCompanyLoading
);

export const companyError = createSelector(getCompanyState, getCompanyError);

export const companyQuery = createSelector(getCompanyState, getCompanyQuery);
