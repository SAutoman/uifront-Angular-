import { createSelector } from '@ngrx/store';
import { OperationsState } from './operations.reducer';

export const selectOperationsState: (u: any) => OperationsState = (state) => state.operationsState;

export const getAllDataSelector = createSelector(selectOperationsState, (data) => data);
