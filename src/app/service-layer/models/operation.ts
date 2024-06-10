export interface Operation {
  id: string;
  targetId: string;
  status: OperationStatus;
  errorMsg: string;
  actor: string;
  validationResult: string;
  userErrorMsg?: string;
  operationId: string;
}

export enum OperationStatus {
  Success = 0,
  Failure = 1,
  Pending = 2
}
