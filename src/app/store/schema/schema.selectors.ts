import { createSelector } from '@ngrx/store';
import { SchemasState } from './schema.reducer';

export const selectSchemaState: (p: any) => SchemasState = (state) => state.schemasState;

export const schemasAsFieldSelector = createSelector(selectSchemaState, (state) => state.allSchemasAsFields);

export const schemaFunctionsStateSelector = createSelector(selectSchemaState, (state) => state.selectedSchemaFunctions);

export const rawDataSelectedSchemaIdSelector = createSelector(selectSchemaState, (state) => state.selectedRawDataSchemaId);

// export const allSchemasSelector = createSelector(selectSchemaState, (state) => state.allSchemas);

export const getSelectedSchemaSelector = createSelector(selectSchemaState, (state) => state.selectedSchema);
export const hasRawDataSchemaSelector = createSelector(selectSchemaState, (state) => state.hasRawDataSchemas);
