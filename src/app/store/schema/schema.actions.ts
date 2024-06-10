/**
 * global
 */
import { Action } from '@ngrx/store';

/**
 * project
 */
import { IConfigurableListItem } from '@wfm/common/models';

/**
 * local
 */
import { AreaTypeEnum, PagedData, Paging, SchemaDto, Sorting } from '../../service-layer';
import { SchemaFunctionsState } from '../schema';
import { SchemaGridRow } from '@wfm/service-layer/services/admin-schemas.service';

export enum SchemaActionTypes {
  GetAllSchemasAsFields = '[Schemas] Get All',
  GetAllSchemasAsFieldsSuccess = '[Schemas] Get All Success',
  GetAllSchemasAsFieldsFail = '[Schemas] Get All Fail',

  GetSchemaById = '[Schema] Get By ID',
  GetSchemaByIdSuccess = '[Schema] Get By ID Success',
  GetSchemaByIdFail = '[Schema] Get By ID Fail',
  UpdateSchemaFunctions = '[Expressions] Update Functions Fields State',
  RemoveSchemaFunction = '[Expressions] Remove Function Fields State',
  ClearFunctionsState = '[Expressions] Clear All Functions Fields State',

  SetSelectedRawDataSchema = '[SelectedRawDataSchema] SetSelectedRawDataSchema',
  SetSelectedRawDataSchemaFail = '[SelectedRawDataSchema] SetSelectedRawDataSchemaFail',
  SetHasRawDataSchemas = '[Set Has Raw Data Schema] Action',
  FetchAllSchemas = '[Schema] Fetch All Schemas',
  FetchAllSchemasSuccess = '[Schema] Fetch All Schemas Success',
  FetchAllSchemasFailed = '[Schema] Fetch All Schemas Failed',
  ClearAllSchemas = '[Schema] Clear All Schemas',
  SetSchema = '[Schema Builder] Set Editable Schema'
}

// =============================== Set Selected raw data schema
export class SetSelectedRawDataSchema implements Action {
  readonly type = SchemaActionTypes.SetSelectedRawDataSchema;
  constructor(public payload: { selectedRawDataSchemaId: string }) {}
}
export class SetSelectedRawDataSchemaFail implements Action {
  readonly type = SchemaActionTypes.SetSelectedRawDataSchemaFail;
  constructor(public payload: { error: string }) {}
}

export class SetHasRawDataSchemas implements Action {
  readonly type = SchemaActionTypes.SetHasRawDataSchemas;
  constructor(public payload: { hasRawDataSchemas: boolean }) {}
}

// ========================================= GET ALL PROCESS STEPS

export class GetAllSchemasAsFields implements Action {
  readonly type = SchemaActionTypes.GetAllSchemasAsFields;
  constructor(public payload: { tenant: string }) {}
}

export class GetAllSchemasAsFieldsSuccess implements Action {
  readonly type = SchemaActionTypes.GetAllSchemasAsFieldsSuccess;
  constructor(public payload: { result: IConfigurableListItem[] }) {}
}

export class GetAllSchemasAsFieldsFail implements Action {
  readonly type = SchemaActionTypes.GetAllSchemasAsFieldsFail;
  constructor(public payload: { error: string }) {}
}

// ========================================= GET PROCESS STEP BY ID

export class GetSchemaById implements Action {
  readonly type = SchemaActionTypes.GetSchemaById;
  constructor(public payload: { tenant: string; area: AreaTypeEnum; id: string }) {}
}

export class GetSchemaByIdSuccess implements Action {
  readonly type = SchemaActionTypes.GetSchemaByIdSuccess;
  constructor(public payload: { result: SchemaDto }) {}
}

export class GetSchemaByIdFail implements Action {
  readonly type = SchemaActionTypes.GetSchemaByIdFail;
  constructor(public payload: { error: string }) {}
}

export class UpdateSchemaFunctions implements Action {
  readonly type = SchemaActionTypes.UpdateSchemaFunctions;
  constructor(public payload: { functionState: SchemaFunctionsState }) {}
}

export class RemoveSchemaFunction implements Action {
  readonly type = SchemaActionTypes.RemoveSchemaFunction;
  constructor(public payload: { functionId: string }) {}
}

export class ClearFunctionsState implements Action {
  readonly type = SchemaActionTypes.ClearFunctionsState;
  constructor() {}
}

/** All Schemas */

// export class LoadSchemasByAreaType implements Action {
//   readonly type = SchemaActionTypes.FetchAllSchemas;
//   constructor(public payload: { tenantId: string; paging: Paging; sorting?: Sorting[]; area?: AreaTypeEnum }) {}
// }

// export class LoadSchemasByAreaTypeSuccess implements Action {
//   readonly type = SchemaActionTypes.FetchAllSchemasSuccess;
//   constructor(public payload: { data: SchemaGridRow[] }) {}
// }

// export class LoadSchemasByAreaTypeFailed implements Action {
//   readonly type = SchemaActionTypes.FetchAllSchemasFailed;
//   constructor() {}
// }

// export class ClearAllSchemas implements Action {
//   readonly type = SchemaActionTypes.ClearAllSchemas;
//   constructor() {}
// }

export class SetSchema implements Action {
  readonly type = SchemaActionTypes.SetSchema;
  constructor(public payload: { data: SchemaDto }) {}
}

export type SchemaActions =
  | GetAllSchemasAsFields
  | GetAllSchemasAsFieldsSuccess
  | GetAllSchemasAsFieldsFail
  | GetSchemaById
  | GetSchemaByIdSuccess
  | GetSchemaByIdFail
  | UpdateSchemaFunctions
  | RemoveSchemaFunction
  | ClearFunctionsState
  | SetSelectedRawDataSchema
  | SetSelectedRawDataSchemaFail
  | SetHasRawDataSchemas
  // | LoadSchemasByAreaType
  // | LoadSchemasByAreaTypeSuccess
  // | LoadSchemasByAreaTypeFailed
  // | ClearAllSchemas
  | SetSchema;
