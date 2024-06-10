import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GridLayoutsState } from './grid-layouts.reducer';

const getGridLayoutsSettings = createFeatureSelector<GridLayoutsState>('gridLayoutsState');

export const getAllLayoutsSettingsSelector = createSelector(getGridLayoutsSettings, (gridLayouts) => gridLayouts.data);

export const getGridLayoutSelector = createSelector(getGridLayoutsSettings, (gridLayouts) => gridLayouts.gridSettings);

export const currentLayoutSettingIdSelector = createSelector(getGridLayoutsSettings, (gridLayouts) => gridLayouts.selectedId);

export const getCardLayoutSelector = createSelector(getGridLayoutsSettings, (gridLayouts) => gridLayouts.cardSettings);

export const currentCardLayoutSettingIdSelector = createSelector(getGridLayoutsSettings, (cardLayouts) => cardLayouts.selectedId);

export const getReportGridLayoutSelector = createSelector(getGridLayoutsSettings, (gridLayouts) => gridLayouts.reportGridSettings);

export const allGridLayoutSettings = createSelector(getGridLayoutsSettings, (gridLayouts) => gridLayouts.allGridLayoutSettings);

export const childGridsLayoutSelector = createSelector(getGridLayoutsSettings, (gridLayout) => gridLayout.childGridSelectedLayouts);

export const allChildGridsLayoutSelector = createSelector(getGridLayoutsSettings, (gridLayout) => gridLayout.allChildGridLayouts);
