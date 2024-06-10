/**
 * global
 */
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { CompanyBriefInfo } from '@wfm/service-layer/models/mappings';

/**
 * project
 */

import { Company } from '../../service-layer';

/**
 * local
 */
import { CompanyActions, CompanyActionTypes } from './company.actions';

export interface CompanySearchQuery {
  filter: string;
  sorting: string;
  limit: number;
  page: number;
}

export interface CompanyState extends EntityState<Company> {
  // additional entities state properties
  selectedId: string;
  loading: boolean;
  error: string;
  query: CompanySearchQuery;
  companies: Company[];
  supplierCompanies: CompanyBriefInfo[];
  auditorCompanies: CompanyBriefInfo[];
  relatedCompanies: Company[];
  tenantMappingCompanies: Company[];
}

export const companyAdapter: EntityAdapter<Company> = createEntityAdapter<Company>();

export const initialCompanyState: CompanyState = companyAdapter.getInitialState({
  // additional company state properties
  selectedId: null,
  loading: false,
  error: '',
  query: {
    filter: '',
    sorting: '',
    limit: 999,
    page: 1
  },
  companies: [],
  supplierCompanies: null,
  auditorCompanies: null,
  tenantMappingCompanies: [],
  relatedCompanies: null
});

// export const applicationAdapter: EntityAdapter<Company> = createEntityAdapter<Company>({
//   selectId: (model: Company) => model.id
// });

export function companyReducer(state = initialCompanyState, action: CompanyActions): CompanyState {
  switch (action.type) {
    case CompanyActionTypes.CreateCompany:
      return {
        ...state,
        loading: true,
        error: ''
      };

    case CompanyActionTypes.CreateCompanySuccess:
      return {
        ...companyAdapter.addOne(action.payload.result, state),
        loading: false,
        error: ''
      };

    case CompanyActionTypes.CreateCompanyFail:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };

    case CompanyActionTypes.SearchAllCompanyEntities:
      return {
        ...companyAdapter.removeAll(state),
        loading: true,
        error: ''
      };

    case CompanyActionTypes.SearchAllCompanyEntitiesSuccess:
      return {
        // ...companyAdapter.setAll(action.payload.result, state),
        ...state,
        companies: action.payload.result,
        loading: false,
        error: ''
      };

    case CompanyActionTypes.SearchAllCompanyEntitiesFail:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };

    case CompanyActionTypes.LoadCompanyById:
      return {
        ...companyAdapter.removeAll(state),
        selectedId: action.payload.id,
        loading: true,
        error: ''
      };

    case CompanyActionTypes.LoadCompanyByIdSuccess:
      return {
        ...companyAdapter.addOne(action.payload.result, state),
        loading: false,
        error: ''
      };

    case CompanyActionTypes.LoadCompanyByIdFail:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };

    case CompanyActionTypes.UpdateCompany:
      return {
        ...state,
        loading: true,
        error: ''
      };

    case CompanyActionTypes.UpdateCompanySuccess:
      return {
        ...companyAdapter.updateOne(action.payload.update, state),
        loading: false,
        error: ''
      };

    case CompanyActionTypes.UpdateCompanyFail:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };

    case CompanyActionTypes.DeleteCompanyById:
      return {
        ...state,
        selectedId: action.payload.id,
        loading: true,
        error: ''
      };

    case CompanyActionTypes.DeleteCompanyByIdSuccess:
      return {
        ...companyAdapter.removeOne(action.payload.id, state),
        loading: false,
        error: ''
      };

    case CompanyActionTypes.DeleteCompanyByIdFail:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };

    case CompanyActionTypes.SetSearchQuery:
      return {
        ...state,
        query: {
          ...state.query,
          ...action.payload
        }
      };

    case CompanyActionTypes.SelectCompanyById:
      return {
        ...state,
        selectedId: action.payload.id,
        error: ''
      };

    case CompanyActionTypes.GetSupplierCompanies:
      return {
        ...state,
        loading: true,
        supplierCompanies: null,
        error: ''
      };

    case CompanyActionTypes.GetSupplierCompaniesSuccess:
      return {
        ...state,
        loading: false,
        supplierCompanies: action.payload.result,
        error: ''
      };

    case CompanyActionTypes.GetSupplierCompaniesFail:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };
    case CompanyActionTypes.GetAuditorCompanies:
      return {
        ...state,
        loading: true,
        auditorCompanies: null,
        error: ''
      };

    case CompanyActionTypes.GetAuditorCompaniesSuccess:
      return {
        ...state,
        loading: false,
        auditorCompanies: action.payload.result,
        error: ''
      };

    case CompanyActionTypes.GetAuditorCompaniesFail:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };
    case CompanyActionTypes.GetAssociatedCompaniesSuccess:
      return {
        ...state,
        relatedCompanies: action.payload.result
      };
    case CompanyActionTypes.GetAssociatedCompaniesFail:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };
    case CompanyActionTypes.GetTenantMappingCompanies:
      return {
        ...state,
        loading: true
      };
    case CompanyActionTypes.GetTenantMappingCompaniesSuccess:
      return {
        ...state,
        loading: false,
        tenantMappingCompanies: action.payload.result
      };
    case CompanyActionTypes.GetTenantMappingCompaniesFail:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };
    default:
      return state;
  }
}

export const getCompanySelectedId = (state: CompanyState) => state.selectedId;
export const getCompanyLoading = (state: CompanyState) => state.loading;
export const getCompanyError = (state: CompanyState) => state.error;
export const getCompanyQuery = (state: CompanyState) => state.query;
