import { CompanyState } from './company.reducer';
import { createSelector } from '@ngrx/store';

export const selectCompanyState: (c: any) => CompanyState = (state) => state.companies;

export const selectedCompanyIdSelector = createSelector(selectCompanyState, (companyState) => companyState.selectedId);

export const companySelector = createSelector(selectCompanyState, (companyState) => companyState.entities);

export const supplierCompaniesSelector = createSelector(selectCompanyState, (companyState) => {
  return companyState.supplierCompanies;
});

export const auditorCompaniesSelector = createSelector(selectCompanyState, (companyState) => {
  return companyState.auditorCompanies;
});

export const tenantCompaniesSelector = createSelector(selectCompanyState, (companyState) => {
  return companyState.tenantMappingCompanies;
});

export const tenantRelatedCompaniesSelector = createSelector(selectCompanyState, (companyState) => {
  return companyState.relatedCompanies;
});
