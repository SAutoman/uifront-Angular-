/**
 * global
 */
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { SortDescriptor } from '@progress/kendo-data-query';

/**
 * project
 */
import { Tenant, Paging, CreateTenantModel, SortDirectionValue } from '@wfm/service-layer';
import { TenantListPageViewModel, TenantViewModel } from '@wfm/tenants/tenant.model';
import { GridDataResultEx } from '@wfm/shared/kendo-util';

/**
 * local
 */

import {
  TenantsActions,
  TenantsActionTypes,
  FetchTenantsSuccess,
  FetchTenantsFail,
  FetchTenants,
  CreateTenantsSuccess,
  LoadTenantsById,
  LoadTenantsByIdSuccess,
  UpdateTenantsSuccess,
  DeleteTenantsById,
  DeleteTenantsByIdSuccess,
  SelectTenantsById
} from './tenants.actions';

export interface TenantsSearchQuery {
  filter: string;
  sorting: string;
  limit: number;
  page: number;
}

export interface TenantsState extends EntityState<Tenant> {
  // additional entities state properties
  // currentPage: string[];
  tenantListPageViewModel: TenantListPageViewModel;
  createTenantModel: CreateTenantModel;
  selectedId: string;
  loading: boolean;
  error: string;
  query: TenantsSearchQuery;
  tenant: Tenant;
  tenantOperationMsg: string;
}

export const tenantsAdapter: EntityAdapter<Tenant> = createEntityAdapter<Tenant>();

export const initialTenantsState: TenantsState = tenantsAdapter.getInitialState(<TenantsState>{
  // additional tenants state properties
  tenantListPageViewModel: <TenantListPageViewModel>{
    sort: <SortDescriptor[]>[
      {
        field: '',
        dir: SortDirectionValue.asc
      }
    ],
    gridData: <GridDataResultEx<TenantViewModel>>{},
    paging: <Paging>{
      skip: 0,
      take: 5
    }
  },
  tenantOperationMsg: null
});

// export const applicationAdapter: EntityAdapter<Tenant> = createEntityAdapter<Tenant>({
//   selectId: (model: Tenant) => model.id
// });

function handleFetchTenantsSuccess(action: FetchTenantsSuccess, state: TenantsState): TenantsState {
  return <TenantsState>{
    ...tenantsAdapter.setAll(action.payload.result.items, state),
    tenantListPageViewModel: <TenantListPageViewModel>{
      sort: state.tenantListPageViewModel.sort,
      paging: state.tenantListPageViewModel.paging,
      gridData: <GridDataResultEx<TenantViewModel>>{
        data: action.payload.result.items.map(
          (t) =>
            <TenantViewModel>{
              id: t.id,
              name: t.name,
              timeZone: t.timeZone,
              companyName: t?.companyName,
              company: {
                ...(t.company
                  ? {
                      companyName: t?.company?.name,
                      companyAddress: t?.company?.address,
                      companyCity: t?.company?.city,
                      companyCountry: t?.company?.country,
                      companyEmail: t?.company?.email,
                      companyNotes: t?.company['notes'],
                      companyPhone: t?.company?.phone,
                      companyVatNr: t?.company['vatNr'],
                      companyTaxNumber: t?.company['taxNumber'],
                      companyZip: t?.company['zip']
                    }
                  : null)
              }
            }
        ),
        total: action.payload.result.total
      }
    },
    loading: false,
    error: ''
  };
}

function handleFetchTenants(action: FetchTenants, state: TenantsState): TenantsState {
  return {
    ...state,
    tenantListPageViewModel: <TenantListPageViewModel>{
      paging: action.payload.paging,
      sort: action.payload.sortState
    },
    loading: true,
    error: ''
  };
}

function handleFetchTenantsFail(action: FetchTenantsFail, state: TenantsState): TenantsState {
  return {
    ...state,
    loading: false,
    error: 'Tenants search failed' //+ action.payload.error
  };
}

export function tenantsReducer(state = initialTenantsState, action: TenantsActions): TenantsState {
  switch (action.type) {
    case TenantsActionTypes.CreateTenants:
      return <TenantsState>(<any>{
        ...state,
        loading: true,
        error: ''
      });

    case TenantsActionTypes.CreateTenantsSuccess:
      return {
        ...tenantsAdapter.addOne((<CreateTenantsSuccess>action).payload.result, state),
        loading: false,
        error: '',
        tenantOperationMsg: action.payload['msg']
      };

    case TenantsActionTypes.CreateTenantsFail:
      return {
        ...state,
        loading: false,
        error: 'Fail' + action.payload['error']
      };

    case TenantsActionTypes.FetchTenants:
      return handleFetchTenants(action as FetchTenants, state);

    case TenantsActionTypes.FetchTenantsSuccess:
      return handleFetchTenantsSuccess(action as FetchTenantsSuccess, state);

    case TenantsActionTypes.FetchTenantsFail:
      return handleFetchTenantsFail(action as FetchTenantsFail, state);

    case TenantsActionTypes.LoadTenantsById:
      return {
        ...tenantsAdapter.removeAll(state),
        selectedId: (<LoadTenantsById>action).payload.id,
        loading: true,
        error: ''
      };

    case TenantsActionTypes.LoadTenantsByIdSuccess:
      return <TenantsState>{
        ...state,
        tenant: (<LoadTenantsByIdSuccess>action).payload.result,
        loading: false,
        error: ''
      };

    case TenantsActionTypes.LoadTenantsByIdFail:
      return {
        ...state,
        loading: false,
        error: 'Fail' + action.payload['error']
      };

    case TenantsActionTypes.UpdateTenants:
      return {
        ...state,
        loading: true,
        error: ''
      };

    case TenantsActionTypes.UpdateTenantsSuccess:
      return {
        ...tenantsAdapter.updateOne((<UpdateTenantsSuccess>action).payload.update, state),
        loading: false,
        error: '',
        tenantOperationMsg: action.payload['msg']
      };

    case TenantsActionTypes.UpdateTenantsFail:
      return {
        ...state,
        loading: false,
        tenantOperationMsg: 'Fail' + action.payload['error']
      };

    case TenantsActionTypes.DeleteTenantsById:
      return {
        ...state,
        selectedId: (<DeleteTenantsById>action).payload.id,
        loading: true,
        error: ''
      };

    case TenantsActionTypes.DeleteTenantsByIdSuccess:
      return {
        ...tenantsAdapter.removeOne((<DeleteTenantsByIdSuccess>action).payload.id, state),
        loading: false,
        error: '',
        tenantOperationMsg: action.payload['msg']
      };

    case TenantsActionTypes.DeleteTenantsByIdFail:
      return {
        ...state,
        loading: false,
        tenantOperationMsg: 'Fail' + action.payload['error']
      };

    // case TenantsActionTypes.SetSearchQuery:
    //   return {
    //     ...state,
    //     query: {
    //       ...state.query,
    //       ...action.payload
    //     }
    //   };

    case TenantsActionTypes.SelectTenantsById:
      return {
        ...state,
        selectedId: (<SelectTenantsById>action).payload.id,
        error: ''
      };
    case TenantsActionTypes.ResetLoadedTenant:
      return {
        ...state,
        tenant: null
      };
    case TenantsActionTypes.ResetOperationMsg:
      return {
        ...state,
        tenantOperationMsg: null
      };
    case TenantsActionTypes.ResetTenantListPageViewModel:
      return {
        ...state,
        tenantListPageViewModel: { ...state.tenantListPageViewModel, paging: { skip: 0, take: 5 }, gridData: null }
      };
    case TenantsActionTypes.CopyTenantData:
      return {
        ...state,
        loading: true
      };
    case TenantsActionTypes.CopyTenantDataSuccess:
      return {
        ...state,
        loading: false,
        tenantOperationMsg: action.payload['msg']
      };
    case TenantsActionTypes.CopyTenantDataFailed:
      return {
        ...state,
        loading: false,
        tenantOperationMsg: 'Fail' + action.payload['error']
      };
    default:
      return state;
  }
}

export const getTenantsSelectedId = (state: TenantsState) => state.selectedId;
export const getTenantsLoading = (state: TenantsState) => state.loading;
export const getTenantsError = (state: TenantsState) => state.error;
export const getTenantsQuery = (state: TenantsState) => state.query;
