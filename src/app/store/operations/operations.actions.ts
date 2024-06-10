/**
 * global
 */
import { Action } from '@ngrx/store';
import { LoadOperationsFailPayload, LoadOperationsPayload, LoadOperationsSuccessPayload } from './operations-payload-models';

/**
 * project
 */
/**
 * local
 */

export enum OperationsTypes {
  LoadOperations = '[LoadOperations] Load',
  LoadOperationsSuccess = '[LoadOperations] Load Success',
  LoadOperationsFail = '[LoadOperations] Load Fail'
}

class BaseAction<TPayload> implements Action {
  constructor(public type: string, public payload: TPayload) {}
}

export class LoadOperations extends BaseAction<LoadOperationsPayload> {
  constructor(payload: LoadOperationsPayload) {
    super(OperationsTypes.LoadOperations, payload);
  }
}

export class LoadOperationsSuccess extends BaseAction<LoadOperationsSuccessPayload> {
  constructor(payload: LoadOperationsSuccessPayload) {
    super(OperationsTypes.LoadOperationsSuccess, payload);
  }
}

export class LoadOperationsFailure extends BaseAction<LoadOperationsFailPayload> {
  constructor(payload: LoadOperationsFailPayload) {
    super(OperationsTypes.LoadOperationsFail, payload);
  }
}

export type OperationsActions = LoadOperations | LoadOperationsSuccess | LoadOperationsFailure;
