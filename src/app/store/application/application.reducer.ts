/**
 * global
 */
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';

/**
 * project
 */
import { WfmApplication } from '../../service-layer';

/**
 * local
 */
import { ApplicationActions, ApplicationActionTypes } from './application.actions';
export interface ApplicationSearchQuery {
  filter: string;
  sorting: string;
  limit: number;
  page: number;
}

export interface ApplicationState extends EntityState<WfmApplication> {
  // additional entities state properties
  selectedId: string;
  loading: boolean;
  error: string;
  query: ApplicationSearchQuery;
}

export const applicationAdapter: EntityAdapter<WfmApplication> = createEntityAdapter<WfmApplication>({
  selectId: (model: WfmApplication) => model.id
});

export const initialApplicationState: ApplicationState = applicationAdapter.getInitialState({
  // additional application state properties
  selectedId: null,
  loading: false,
  error: '',
  query: {
    filter: '',
    sorting: '',
    limit: 999,
    page: 1
  }
});

export function applicationReducer(state = initialApplicationState, action: ApplicationActions): ApplicationState {
  switch (action.type) {
    case ApplicationActionTypes.CreateApplication:
      return {
        ...state,
        loading: true,
        error: ''
      };

    case ApplicationActionTypes.CreateApplicationSuccess:
      return {
        ...applicationAdapter.addOne(action.payload.result, state),
        loading: false,
        error: ''
      };

    case ApplicationActionTypes.CreateApplicationFail:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };

    case ApplicationActionTypes.SearchAllApplicationEntities:
      return {
        ...applicationAdapter.removeAll(state),
        loading: true,
        error: ''
      };

    case ApplicationActionTypes.SearchAllApplicationEntitiesSuccess:
      return {
        ...applicationAdapter.setAll(action.payload.result.items, state),
        loading: false,
        error: ''
      };

    case ApplicationActionTypes.SearchAllApplicationEntitiesFail:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };

    case ApplicationActionTypes.LoadApplicationById:
      return {
        ...applicationAdapter.removeAll(state),
        selectedId: action.payload.id,
        loading: true,
        error: ''
      };

    case ApplicationActionTypes.LoadApplicationByIdSuccess:
      return {
        ...applicationAdapter.addOne(action.payload.result, state),
        loading: false,
        error: ''
      };

    case ApplicationActionTypes.LoadApplicationByIdFail:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };

    case ApplicationActionTypes.UpdateApplication:
      return {
        ...state,
        loading: true,
        error: ''
      };

    case ApplicationActionTypes.UpdateApplicationSuccess:
      return {
        ...applicationAdapter.updateOne(action.payload.update, state),
        loading: false,
        error: ''
      };

    case ApplicationActionTypes.UpdateApplicationFail:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };

    case ApplicationActionTypes.DeleteApplicationById:
      return {
        ...state,
        selectedId: action.payload.id,
        loading: true,
        error: ''
      };

    case ApplicationActionTypes.DeleteApplicationByIdSuccess:
      return {
        ...applicationAdapter.removeOne(action.payload.id, state),
        loading: false,
        error: ''
      };

    case ApplicationActionTypes.DeleteApplicationByIdFail:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };

    case ApplicationActionTypes.SetSearchQuery:
      return {
        ...state,
        query: {
          ...state.query,
          ...action.payload
        }
      };

    case ApplicationActionTypes.SelectApplicationById:
      return {
        ...state,
        selectedId: action.payload.id,
        error: ''
      };

    default:
      return state;
  }
}

export const getSelectedId = (state: ApplicationState) => state.selectedId;
export const getLoading = (state: ApplicationState) => state.loading;
export const getError = (state: ApplicationState) => state.error;
export const getQuery = (state: ApplicationState) => state.query;
