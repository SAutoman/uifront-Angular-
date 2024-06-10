import { PagedData } from '@wfm/service-layer';
import { cloneDeep, remove } from 'lodash-core';

import { TenantListsActionTypes, TenantFieldsActions } from './tenant-lists.actions';

import { IConfigurableListItem } from '@wfm/common/models';
import { idPredicate } from '@wfm/service-layer/helpers';

export interface TenantListsState {
  page?: PagedData<IConfigurableListItem>;
  loading?: boolean;
  silent?: boolean;
  error?: string | any;
}

export const initialTenantListsState: TenantListsState = {
  loading: false,
  error: null
};

export function tenantListsReducer(state: TenantListsState = initialTenantListsState, action: TenantFieldsActions): TenantListsState {
  switch (action.type) {
    case TenantListsActionTypes.GetTenantLists:
      return {
        ...state,
        loading: true,
        error: undefined
      };
    case TenantListsActionTypes.TenantListsError:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };
    case TenantListsActionTypes.GetTenantListsSuccess:
      return {
        ...state,
        page: action.payload,
        loading: false,
        error: undefined
      };
    case TenantListsActionTypes.RemoveTenantList:
      return {
        ...state,
        loading: true,
        error: undefined
      };
    case TenantListsActionTypes.RemoveTenantListSuccess:
      return (() => {
        const page: PagedData<IConfigurableListItem> = cloneDeep(
          state.page || {
            items: [],
            total: 0
          }
        );
        const removed = remove(page.items, (x) => x.id === action.payload.id);
        if (removed) {
          page.total = page.items.length;
        }

        return {
          ...state,
          page: page,
          loading: false,
          error: undefined
        };
      })();
    case TenantListsActionTypes.AddOrUpdateTenantList:
      return {
        ...state,
        loading: true,
        error: undefined
      };
    case TenantListsActionTypes.AddOrUpdateTenantListSuccess:
      return (() => {
        const item = cloneDeep(action.payload.item);
        const page: PagedData<IConfigurableListItem> = cloneDeep(
          state.page || {
            items: [],
            total: 0
          }
        );
        if (action.payload.isUpdate) {
          const index = page.items.findIndex(idPredicate(item.id));
          if (index > -1) {
            page.items[index] = cloneDeep(item);
          }
        } else {
          page.items = [item, ...page.items];
          page.total = page.items.length;
        }
        page.items.forEach((x, idx) => {
          if (!x.configuration) {
            x.configuration = {} as any;
          }
          x.configuration.position = idx;
        });
        return {
          ...state,
          page,
          loading: false,
          error: undefined
        };
      })();

    default:
      return state;
  }
}
