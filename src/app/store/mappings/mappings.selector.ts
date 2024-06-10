import { createSelector } from '@ngrx/store';
import { MappingsState } from './mappings.reducer';

export const selectMappingsState: (u: any) => MappingsState = (state) => state.mappingsState;

export const getAllMappingDataSelector = createSelector(selectMappingsState, (data) => data);

export const editMappingViewModelSelector = createSelector(selectMappingsState, (data) => data.editMappingViewModel);

export const mappingsOperationMsgSelector = createSelector(selectMappingsState, (data) => data.operationMsg);
