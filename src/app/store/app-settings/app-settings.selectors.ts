import { createSelector, createFeatureSelector } from '@ngrx/store';
import { AppSettingsState } from './app-settings.reducer';

const getAppSettingsState = createFeatureSelector<AppSettingsState>('appSettings');

export const getAppSettingsSelector = createSelector(getAppSettingsState, (app) => app.settings);

export const getAppSettingsLoadingSelector = createSelector(getAppSettingsState, (app) => app.loading);

export const getAppSettingsOperationMsgSelector = createSelector(getAppSettingsState, (app) => app.operationMsg);
