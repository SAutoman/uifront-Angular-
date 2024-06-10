/**
 * global
 */
import { EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { cloneDeep } from 'lodash-core';

/**
 * project
 */
import { GridSettings, UserSettingsDto, CardSettings, Settings } from './../../service-layer';

/**
 * local
 */
import { GridLayoutActions, GridLayoutsTypes } from './grid-layouts.actions';

export enum GridLayoutLoadingState {
  Unknown,
  Loading,
  Loaded,
  Failed
}

export interface GridLayoutsState {
  data: UserSettingsDto;
  loadingState: GridLayoutLoadingState;
  userId: string;
  tenantId: string;
  selectedId: string;
  gridSettings?: GridSettings;
  cardSettings?: CardSettings;
  reportGridSettings?: GridSettings;
  allGridLayoutSettings: { [key: string]: UserSettingsDto };
  // Holds all selected layouts in the child grid
  childGridSelectedLayouts: { [key: string]: GridSettings };
  // For all child layouts
  allChildGridLayouts: { [key: string]: UserSettingsDto };
}

export const GridLayoutsAdapter: EntityAdapter<UserSettingsDto> = createEntityAdapter<UserSettingsDto>({
  selectId: (model: UserSettingsDto) => model.id
});

export const initialGridLayoutsState: GridLayoutsState = <GridLayoutsState>{
  data: <UserSettingsDto>{},
  loadingState: GridLayoutLoadingState.Unknown,
  allGridLayoutSettings: {},
  childGridSelectedLayouts: {},
  allChildGridLayouts: {}
};

export function gridLayoutsReducer(state = initialGridLayoutsState, action: GridLayoutActions) {
  switch (action.type) {
    case GridLayoutsTypes.GetGridLayoutAction:
      return <GridLayoutsState>{
        ...state,
        loadingState: GridLayoutLoadingState.Loaded,
        tenantId: action.payload.tenantId,
        userId: action.payload.userId
      };

    case GridLayoutsTypes.GetGridLayoutActionSuccess:
      if (!action.payload?.isChildGrid) {
        const allSettings = { ...state.allGridLayoutSettings };
        allSettings[action.payload.settingKey] = action.payload.userSettings;
        return <GridLayoutsState>{
          ...state,
          loadingState: GridLayoutLoadingState.Loaded,
          data: action.payload.userSettings,
          allGridLayoutSettings: allSettings
        };
      } else if (action.payload.isChildGrid) {
        const childLayouts = cloneDeep(state.allChildGridLayouts);
        childLayouts[action.payload.settingKey] = action.payload.userSettings;
        return <GridLayoutsState>{
          ...state,
          allChildGridLayouts: childLayouts
        };
      }
      break;
    case GridLayoutsTypes.GetGridLayoutActionFail:
      return <GridLayoutsState>{
        ...state,
        loadingState: GridLayoutLoadingState.Loaded,
        error: action.payload.error
      };

    case GridLayoutsTypes.CreateGridLayoutAction:
      return <GridLayoutsState>{
        ...state,
        loadingState: GridLayoutLoadingState.Loaded
      };

    case GridLayoutsTypes.CreateGridLayoutActionSuccess:
      return <GridLayoutsState>{
        ...state,
        loadingState: GridLayoutLoadingState.Loaded
      };

    case GridLayoutsTypes.CreateGridLayoutActionFail:
      return <GridLayoutsState>{
        ...state,
        loadingState: GridLayoutLoadingState.Failed,
        error: action.payload.error
      };
    case GridLayoutsTypes.UpdateGridLayoutActionSuccess:
      return <GridLayoutsState>{
        ...state,
        allGridLayoutSettings: {},
        loadingState: GridLayoutLoadingState.Loaded,
        selectedId: action.payload.update.id
      };
    case GridLayoutsTypes.DeleteGridLayoutAction:
      return <GridLayoutsState>{
        ...state,
        loadingState: GridLayoutLoadingState.Loading
      };

    case GridLayoutsTypes.DeleteGridLayoutActionSuccess:
      return <GridLayoutsState>{
        ...state,
        allGridLayoutSettings: {},
        loadingState: GridLayoutLoadingState.Loaded
      };
    case GridLayoutsTypes.DeleteGridLayoutActionFail:
      return <GridLayoutsState>{
        ...state,
        loadingState: GridLayoutLoadingState.Failed,
        error: action.payload.error
      };

    case GridLayoutsTypes.ApplyGridLayoutAction:
      return <GridLayoutsState>{
        ...state,
        gridSettings: action.payload.gridConfig,
        cardSettings: action.payload.cardConfig,
        reportGridSettings: action.payload.reportGridConfig,
        selectedId: action.payload.settingId
      };

    case GridLayoutsTypes.ClearLayoutsAndSelectedId:
      return <GridLayoutsState>{
        ...state,
        data: <UserSettingsDto>{},
        selectedId: null
      };

    case GridLayoutsTypes.ApplyChildGridLayoutAction:
      const layouts = cloneDeep(state.childGridSelectedLayouts);
      const schemaId = action.payload.schemaId;
      if (schemaId) {
        layouts[schemaId] = action.payload.gridConfig;
      }
      return <GridLayoutsState>{
        ...state,
        childGridSelectedLayouts: action.payload.clearLayouts ? {} : { ...layouts }
      };
    case GridLayoutsTypes.RemoveChildGridLayoutAction:
      /**
       * Remove layout settings from allChildGridLayouts and removing any selected layout
       */
      const childLayouts = cloneDeep(state.allChildGridLayouts);
      const settingName = action.payload.settingName;
      const layoutSchemaId = action.payload.schemaId;
      if (settingName) {
        delete childLayouts[settingName];
      }
      const selectedLayouts = cloneDeep(state.childGridSelectedLayouts);
      if (layoutSchemaId) {
        delete selectedLayouts[layoutSchemaId];
      }
      const allGridLayoutSettings = cloneDeep(state.allGridLayoutSettings);
      delete allGridLayoutSettings[settingName];
      return <GridLayoutsState>{
        ...state,
        allChildGridLayouts: childLayouts,
        childGridSelectedLayouts: selectedLayouts,
        allGridLayoutSettings: allGridLayoutSettings
      };
    default:
      return state;
  }
}
