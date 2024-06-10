/**
 * global
 */
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';

/**
 * project
 */
import { IConfigurableListItem } from '@wfm/common/models';

/**
 * local
 */
import { SchemaDto } from '../../service-layer';
import { SchemaActions, SchemaActionTypes } from './schema.actions';
import { SchemaGridRow } from '@wfm/service-layer/services/admin-schemas.service';

export interface FunctionFieldsState {
  functionName: string;
  selectedFieldIds: string[];
  ruleFieldIds: string[];
}

export interface SchemaFunctionsState {
  [id: string]: FunctionFieldsState;
}

export interface SchemasState extends EntityState<SchemaDto> {
  selectedId: string;
  loading: boolean;
  error: string;
  allSchemasAsFields: IConfigurableListItem[];
  selectedSchemaFunctions: SchemaFunctionsState;
  selectedRawDataSchemaId: string;
  hasRawDataSchemas: boolean;
  // allSchemas: SchemaGridRow[];
  selectedSchema: SchemaDto;
}

export const schemaAdapter: EntityAdapter<SchemaDto> = createEntityAdapter<SchemaDto>();

export const initialSchemasState: SchemasState = schemaAdapter.getInitialState({
  selectedId: null,
  loading: false,
  error: '',
  allSchemasAsFields: null,
  selectedSchemaFunctions: null,
  selectedRawDataSchemaId: null,
  hasRawDataSchemas: null,
  // allSchemas: null,
  selectedSchema: null
});

export function schemaReducer(state = initialSchemasState, action: SchemaActions): SchemasState {
  switch (action.type) {
    case SchemaActionTypes.GetSchemaById:
      return {
        ...schemaAdapter.removeAll(state),
        allSchemasAsFields: state.allSchemasAsFields,
        selectedId: action.payload.id,
        loading: true,
        error: ''
      };

    case SchemaActionTypes.GetSchemaByIdSuccess:
      return {
        ...schemaAdapter.addOne(action.payload.result, state),
        loading: false,
        error: ''
      };

    case SchemaActionTypes.GetSchemaByIdFail:
      return {
        ...state,
        loading: false,
        error: 'Schema load failed' //+ action.payload.error
      };

    case SchemaActionTypes.GetAllSchemasAsFieldsSuccess:
      return {
        ...state,
        allSchemasAsFields: action.payload.result,
        error: ''
      };

    case SchemaActionTypes.UpdateSchemaFunctions:
      let newState = action.payload.functionState;
      let newFunctState = {
        ...state.selectedSchemaFunctions,
        ...newState
      };
      return {
        ...state,
        selectedSchemaFunctions: newFunctState
      };
    case SchemaActionTypes.RemoveSchemaFunction:
      let updatedState = {
        ...state.selectedSchemaFunctions
      };
      delete updatedState[action.payload.functionId];
      return {
        ...state,
        selectedSchemaFunctions: updatedState
      };
    case SchemaActionTypes.ClearFunctionsState:
      return {
        ...state,
        selectedSchemaFunctions: null
      };

    case SchemaActionTypes.SetSelectedRawDataSchema:
      return {
        ...state,
        selectedRawDataSchemaId: action.payload.selectedRawDataSchemaId
      };
    case SchemaActionTypes.SetHasRawDataSchemas:
      return {
        ...state,
        hasRawDataSchemas: action.payload.hasRawDataSchemas
      };
    // case SchemaActionTypes.FetchAllSchemas:
    //   return state;

    // case SchemaActionTypes.FetchAllSchemasSuccess:
    //   return {
    //     ...state,
    //     allSchemas: [...(state.allSchemas ? state.allSchemas : []), ...action.payload.data]
    //   };

    // case SchemaActionTypes.ClearAllSchemas:
    //   return {
    //     ...state,
    //     allSchemas: []
    //   };
    case SchemaActionTypes.SetSchema:
      return {
        ...state,
        selectedSchema: action.payload.data
      };
    default:
      return state;
  }
}
