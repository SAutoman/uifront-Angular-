import { createFeatureSelector } from '@ngrx/store';
import { TenantListsState } from './tenant-lists.reducer';

export const selectTenantListsState = createFeatureSelector<TenantListsState>('tenantLists');
