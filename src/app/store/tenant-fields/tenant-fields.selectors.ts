import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IConfigurableListItem } from '@wfm/common/models';
import { TenantFieldsState } from './tenant-fields.reducer';

const getTenantFields = (state: TenantFieldsState): IConfigurableListItem[] => {
  if (state.page) {
    return state.page.items;
  }
  return undefined;
};

const getOpMsg = (state: TenantFieldsState): string => {
  if (state?.operationMsg) return state.operationMsg;
};

export const selectTenantFieldsState = createFeatureSelector<TenantFieldsState>('tenantFields');
export const selectPageFieldsSelector = createSelector(selectTenantFieldsState, getTenantFields);
export const tfOperationMsgSelector = createSelector(selectTenantFieldsState, getOpMsg);
