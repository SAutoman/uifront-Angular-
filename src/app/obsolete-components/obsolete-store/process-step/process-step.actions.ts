// /**
//  * global
//  */
// import { Update } from '@ngrx/entity';
// import { Action } from '@ngrx/store';

// /**
//  * project
//  */
// import { ProcessStep, PagedData } from '../../service-layer';

// /**
//  * local
//  */

// export enum ProcessStepActionTypes {
//   GetProcessSteps = '[ProcessStep] Get',
//   GetProcessStepsSuccess = '[ProcessStep] Get Success',
//   GetProcessStepsFail = '[ProcessStep] Get Fail',

//   GetProcessStepById = '[ProcessStep] Get By ID',
//   GetProcessStepByIdSuccess = '[ProcessStep] Get By ID Success',
//   GetProcessStepByIdFail = '[ProcessStep] Get By ID Fail',

//   CreateProcessStep = '[ProcessStep] Create',
//   CreateProcessStepSuccess = '[ProcessStep] Insert Success',
//   CreateProcessStepFail = '[ProcessStep] Insert Fail',

//   UpdateProcessStep = '[ProcessStep] Update',
//   UpdateProcessStepSuccess = '[ProcessStep] Update Success',
//   UpdateProcessStepFail = '[ProcessStep] Update Fail',

//   DeleteProcessStepById = '[ProcessStep] Delete By ID',
//   DeleteProcessStepByIdSuccess = '[ProcessStep] Delete Success',
//   DeleteProcessStepByIdFail = '[ProcessStep] Delete Fail'
// }

// // ========================================= GET ALL PROCESS STEPS

// export class GetProcessSteps implements Action {
//   readonly type = ProcessStepActionTypes.GetProcessSteps;
//   constructor(public payload: { tenant: string }) {}
// }

// export class GetProcessStepsSuccess implements Action {
//   readonly type = ProcessStepActionTypes.GetProcessStepsSuccess;
//   constructor(public payload: { result: PagedData<ProcessStep> }) {}
// }

// export class GetProcessStepsFail implements Action {
//   readonly type = ProcessStepActionTypes.GetProcessStepsFail;
//   constructor(public payload: { error: string }) {}
// }

// // ========================================= GET PROCESS STEP BY ID

// export class GetProcessStepById implements Action {
//   readonly type = ProcessStepActionTypes.GetProcessStepById;
//   constructor(public payload: { tenant: string; id: string }) {}
// }

// export class GetProcessStepByIdSuccess implements Action {
//   readonly type = ProcessStepActionTypes.GetProcessStepByIdSuccess;
//   constructor(public payload: { result: ProcessStep }) {}
// }

// export class GetProcessStepByIdFail implements Action {
//   readonly type = ProcessStepActionTypes.GetProcessStepByIdFail;
//   constructor(public payload: { error: string }) {}
// }

// // ========================================= CREATE

// export class CreateProcessStep implements Action {
//   readonly type = ProcessStepActionTypes.CreateProcessStep;
//   constructor(public payload: { processSteps: ProcessStep }) {}
// }

// export class CreateProcessStepSuccess implements Action {
//   readonly type = ProcessStepActionTypes.CreateProcessStepSuccess;
//   constructor(public payload: { result: ProcessStep }) {}
// }

// export class CreateProcessStepFail implements Action {
//   readonly type = ProcessStepActionTypes.CreateProcessStepFail;
//   constructor(public payload: { error: string }) {}
// }

// // ========================================= UPDATE

// export class UpdateProcessStep implements Action {
//   readonly type = ProcessStepActionTypes.UpdateProcessStep;
//   constructor(public payload: { processSteps: ProcessStep }) {}
// }

// export class UpdateProcessStepSuccess implements Action {
//   readonly type = ProcessStepActionTypes.UpdateProcessStepSuccess;
//   constructor(public payload: { update: Update<ProcessStep> }) {}
// }

// export class UpdateProcessStepFail implements Action {
//   readonly type = ProcessStepActionTypes.UpdateProcessStepFail;
//   constructor(public payload: { error: string }) {}
// }

// // ========================================= DELETE

// export class DeleteProcessStepById implements Action {
//   readonly type = ProcessStepActionTypes.DeleteProcessStepById;
//   constructor(public payload: { id: string }) {}
// }

// export class DeleteProcessStepByIdSuccess implements Action {
//   readonly type = ProcessStepActionTypes.DeleteProcessStepByIdSuccess;
//   constructor(public payload: { id: string }) {}
// }

// export class DeleteProcessStepByIdFail implements Action {
//   readonly type = ProcessStepActionTypes.DeleteProcessStepByIdFail;
//   constructor(public payload: { error: string }) {}
// }

// export type ProcessStepActions =
//   | CreateProcessStep
//   | CreateProcessStepSuccess
//   | CreateProcessStepFail
//   | UpdateProcessStep
//   | UpdateProcessStepSuccess
//   | UpdateProcessStepFail
//   | DeleteProcessStepById
//   | DeleteProcessStepByIdSuccess
//   | DeleteProcessStepByIdFail
//   | GetProcessSteps
//   | GetProcessStepsSuccess
//   | GetProcessStepsFail
//   | GetProcessStepById
//   | GetProcessStepByIdSuccess
//   | GetProcessStepByIdFail;
