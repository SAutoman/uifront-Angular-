import { createSelector } from '@ngrx/store';
import { ApiClientState } from './api-clients-reducer';

export const selectApiClient: (p: any) => ApiClientState = (state) => state.apiClient;

export const apiClientLoadingSelector = createSelector(selectApiClient, (apic) => apic.loading);
export const apiClientListSelector = createSelector(selectApiClient, (apic) => apic.apiClientsList);
export const apiClientOperationMsgSelector = createSelector(selectApiClient, (apic) => apic.apiClientOperationMessage);
