// /**
//  * global
//  */
// import { Action } from '@ngrx/store';
// import { GridDataResult } from '@progress/kendo-angular-grid';
// import { CdkDragDrop } from '@angular/cdk/drag-drop';
// import { QueryList } from '@angular/core';

// /**
//  * project
//  */
// import {
//   CaseWithRawData,
//   CaseProcessStepForm,
//   ProcessStepNames,
//   Roles,
//   UpdateCaseStatusDto,
//   Paging,
//   ProcessStep,
//   FormDtoUI,
//   TenantSettingsDto,
//   SettingsUI
// } from '../../service-layer';

// import { ProcessStepUIModel } from '../../process-step/models';
// import { LikeFilter } from '@wfm/service-layer/models/dynamic-entity-models';

// import { CaseFieldWrapperComponent } from '../../shared-case-field-wrapper/case-field-wrapper/case-field-wrapper.component';
// import { FieldControlApiData } from '../../shared-case-field-wrapper/case-fields/field-control-api-value';
// import { AuthState } from '../auth/auth.reducer';

// /**
//  * local
//  */

// export enum WorkOnCaseTypes {
//   LoadCaseData = '[CaseData] Load',
//   LoadCaseDataSuccess = '[CaseData] Load Success',
//   LoadCaseDataFail = '[CaseData] Load Fail',
//   LoadCaseProcessStepData = '[CaseProcessStepData] Load',
//   LoadCaseProcessStepDataSuccess = '[CaseProcessStepData] Load Success',
//   LoadCaseProcessStepDataFail = '[CaseProcessStepData] Load Fail',
//   OnProcessStepAdd = '[OnProcessStepAdd] Add',
//   OnProcessStepAddSuccess = '[OnProcessStepAdd] Add Success',
//   OnProcessStepAddFail = '[OnProcessStepAdd] Add Fail',
//   OnProcessStepRemove = '[OnProcessStepRemove] Remove',
//   OnProcessStepRemoveSuccess = '[OnProcessStepRemove] Remove Success',
//   OnProcessStepRemoveFail = '[OnProcessStepRemove] Remove Fail',
//   OnChangedStatus = '[OnChangedStatus] Changed',
//   OnChangedStatusSuccess = '[OnChangedStatus] Change Success',
//   OnChangedStatusFail = '[OnChangedStatus] Change Fail',
//   OnRawDataDelete = '[OnRawDataDelete] Delete',
//   OnRawDataDeleteSuccess = '[OnChangedStatus] Delete Success',
//   OnRawDataDeleteFail = '[OnChangedStatus] Delete Fail',
//   OnPageChange = '[OnPageChange] Change',
//   OnPageChangeSuccess = '[OnPageChange] Change Success',
//   OnPageChangeFail = '[OnPageChange] Change Fail',
//   CdkDropListDropped = '[CdkDropListDropped] Dropped',
//   CdkDropListDroppedSuccess = '[CdkDropListDropped] Drop Success',
//   CdkDropListDroppedFail = '[CdkDropListDropped] Drop Fail',
//   RenameCase = '[RenameCase] Renamed',
//   RenameCaseSuccess = '[CdkDropListDropped] Rename Success',
//   RenameCaseFail = '[CdkDropListDropped] Rename Fail',
//   CaseProcessStepOnSave = '[CaseProcessStepOnSave] ProcessOnSave',
//   CaseProcessStepOnSaveSuccess = '[CaseProcessStepOnSave] ProcessOnSave Success',
//   CaseProcessStepOnSaveFail = '[CaseProcessStepOnSave] ProcessOnSave Fail',
//   BuildStepName = '[BuildStepName] Load',
//   BuildStepNameSuccess = '[BuildStepName] Success',
//   BuildStepNameFail = '[BuildStepName] Fail',
//   UpdateValues = '[UpdateValues] Load',
//   UpdateValuesSuccess = '[UpdateValues] Success',
//   UpdateValuesFail = '[UpdateValues] Fail',
//   SetButtons = '[SetButtons] Load',
//   SetButtonsSuccess = '[SetButtons] Success',
//   SetButtonsFail = '[SetButtons] Fail',
//   SearchSteps = '[SetButtons] Load',
//   SearchStepsSuccess = '[SearchSteps] Success',
//   SearchStepsFail = '[SearchSteps] Fail',
//   OnFormSave = '[OnFormSave] Load',
//   OnFormSaveSuccess = '[OnFormSave] Success',
//   OnFormSaveFail = '[OnFormSave] Fail',
//   ClearMessages = '[ClearMessages] Cleared'
// }

// export class LoadCaseData implements Action {
//   readonly type = WorkOnCaseTypes.LoadCaseData;
//   constructor(
//     public payload: {
//       tenant: string;
//       caseId: string;
//       dateFormatDb: SettingsUI;
//       pageSize: number;
//       selectedRole: Roles;
//       authState: AuthState;
//     }
//   ) {}
// }

// export class LoadCaseDataSuccess implements Action {
//   readonly type = WorkOnCaseTypes.LoadCaseDataSuccess;
//   constructor(
//     public payload: {
//       data: CaseWithRawData;
//       tenantSettings: TenantSettingsDto;
//       items: any;
//       ids: CaseProcessStepForm[];
//       stepData: ProcessStepUIModel[];
//       length: number;
//       processStepNames: ProcessStepNames[];
//       gridData: GridDataResult;
//       sliced: ProcessStepNames[];
//       canEditCaseError: string;
//       canEditCase: boolean;
//       reopenDisabled: boolean;
//       approveDisabled: boolean;
//       doneDisabled: boolean;
//       successMsg: string;
//     }
//   ) {}
// }

// export class LoadCaseDataFailure implements Action {
//   readonly type = WorkOnCaseTypes.LoadCaseDataFail;
//   constructor(public payload: { error: string }) {}
// }

// export class LoadCaseProcessStepData implements Action {
//   readonly type = WorkOnCaseTypes.LoadCaseProcessStepData;
//   constructor(public payload: { tenant: string; currentProcessStep: ProcessStepUIModel }) {}
// }

// export class LoadCaseProcessStepDataSuccess implements Action {
//   readonly type = WorkOnCaseTypes.LoadCaseProcessStepDataSuccess;
//   constructor(public payload: { currentProcessStep: ProcessStepUIModel; successMsg: string }) {}
// }

// export class LoadCaseProcessStepDataFailure implements Action {
//   readonly type = WorkOnCaseTypes.LoadCaseProcessStepDataFail;
//   constructor(public payload: { error: string }) {}
// }

// export class OnProcessStepAdd implements Action {
//   readonly type = WorkOnCaseTypes.OnProcessStepAdd;
//   constructor(public payload: { tenant: string; processStep: ProcessStepNames; caseId: string; stepData: ProcessStepUIModel[] }) {}
// }

// export class OnProcessStepAddSuccess implements Action {
//   readonly type = WorkOnCaseTypes.OnProcessStepAddSuccess;
//   constructor(public payload: { stepData: ProcessStepUIModel[]; successMsg: string }) {}
// }

// export class OnProcessStepAddFailure implements Action {
//   readonly type = WorkOnCaseTypes.OnProcessStepAddFail;
//   constructor(public payload: { error: string }) {}
// }

// export class OnProcessStepRemove implements Action {
//   readonly type = WorkOnCaseTypes.OnProcessStepRemove;
//   constructor(public payload: { tenant: string; processStep: ProcessStepUIModel; stepData: ProcessStepUIModel[] }) {}
// }

// export class OnProcessStepRemoveSuccess implements Action {
//   readonly type = WorkOnCaseTypes.OnProcessStepRemoveSuccess;
//   constructor(public payload: { stepData: ProcessStepUIModel[]; successMsg: string }) {}
// }

// export class OnProcessStepRemoveFailure implements Action {
//   readonly type = WorkOnCaseTypes.OnProcessStepRemoveFail;
//   constructor(public payload: { error: string }) {}
// }

// export class OnChangedStatus implements Action {
//   readonly type = WorkOnCaseTypes.OnChangedStatus;
//   constructor(public payload: { tenant: string; cmd: UpdateCaseStatusDto }) {}
// }

// export class OnChangedStatusSuccess implements Action {
//   readonly type = WorkOnCaseTypes.OnChangedStatusSuccess;
//   constructor(public payload: { successMsg: string }) {}
// }

// export class OnChangedStatusFailure implements Action {
//   readonly type = WorkOnCaseTypes.OnChangedStatusFail;
//   constructor(public payload: { error: string }) {}
// }

// export class OnRawDataDelete implements Action {
//   readonly type = WorkOnCaseTypes.OnRawDataDelete;
//   constructor(public payload: { item: any; dialog: MatDialog; tenant: string; caseId: string }) {}
// }

// export class OnRawDataDeleteSuccess implements Action {
//   readonly type = WorkOnCaseTypes.OnRawDataDeleteSuccess;
//   constructor(public payload: { successMsg: string }) {}
// }

// export class OnRawDataDeleteFailure implements Action {
//   readonly type = WorkOnCaseTypes.OnRawDataDeleteFail;
//   constructor(public payload: { error: string }) {}
// }

// export class OnPageChange implements Action {
//   readonly type = WorkOnCaseTypes.OnPageChange;
//   constructor(
//     public payload: {
//       event: PageEvent;
//       pageSize: number;
//       tenant: string;
//       length: number;
//       processStepNames: ProcessStepNames[];
//       searchModel: LikeFilter<string>;
//       sliced: ProcessStepNames[];
//     }
//   ) {}
// }

// export class OnPageChangeSuccess implements Action {
//   readonly type = WorkOnCaseTypes.OnPageChangeSuccess;
//   constructor(
//     public payload: {
//       pageSize: number;
//       length: number;
//       processStepNames: ProcessStepNames[];
//       sliced: ProcessStepNames[];
//       successMsg: string;
//     }
//   ) {}
// }

// export class OnPageChangeFailure implements Action {
//   readonly type = WorkOnCaseTypes.OnPageChangeFail;
//   constructor(public payload: { error: string }) {}
// }

// export class CdkDropListDropped implements Action {
//   readonly type = WorkOnCaseTypes.CdkDropListDropped;
//   constructor(
//     public payload: { event: CdkDragDrop<string[]>; caseId: string; stepData: ProcessStepUIModel[]; tenant: string; dialog: MatDialog }
//   ) {}
// }

// export class CdkDropListDroppedSuccess implements Action {
//   readonly type = WorkOnCaseTypes.CdkDropListDroppedSuccess;
//   constructor(public payload: { successMsg: string }) {}
// }

// export class CdkDropListDroppedFailure implements Action {
//   readonly type = WorkOnCaseTypes.CdkDropListDroppedFail;
//   constructor(public payload: { error: string }) {}
// }

// export class RenameCase implements Action {
//   readonly type = WorkOnCaseTypes.RenameCase;
//   constructor(public payload: { canEditCase: boolean; dialog: MatDialog; caseName: string; caseId: string; tenantId: string }) {}
// }

// export class RenameCaseSuccess implements Action {
//   readonly type = WorkOnCaseTypes.RenameCaseSuccess;
//   constructor(public payload: { caseName: string; successMsg: string }) {}
// }

// export class RenameCaseFailure implements Action {
//   readonly type = WorkOnCaseTypes.RenameCaseFail;
//   constructor(public payload: { error: string }) {}
// }

// export class CaseProcessStepOnSave implements Action {
//   readonly type = WorkOnCaseTypes.CaseProcessStepOnSave;
//   constructor(
//     public payload: {
//       currentProcessStep: ProcessStepUIModel;
//       tenant: string;
//       wrapperFields: QueryList<CaseFieldWrapperComponent>;
//       caseId: string;
//     }
//   ) {}
// }

// export class CaseProcessStepOnSaveSuccess implements Action {
//   readonly type = WorkOnCaseTypes.CaseProcessStepOnSaveSuccess;
//   constructor(public payload: { successMsg: string }) {}
// }

// export class CaseProcessStepOnSaveFailure implements Action {
//   readonly type = WorkOnCaseTypes.CaseProcessStepOnSaveFail;
//   constructor(public payload: { error: string }) {}
// }

// export class BuildStepName implements Action {
//   readonly type = WorkOnCaseTypes.BuildStepName;
//   constructor(public payload: { tenant: string; caseId: string; currentProcessStep: ProcessStepUIModel }) {}
// }

// export class BuildStepNameSuccess implements Action {
//   readonly type = WorkOnCaseTypes.BuildStepNameSuccess;
//   constructor(public payload: { name: string; successMsg: string }) {}
// }

// export class BuildStepNameFailure implements Action {
//   readonly type = WorkOnCaseTypes.BuildStepNameFail;
//   constructor(public payload: { error: string }) {}
// }

// export class UpdateValues implements Action {
//   readonly type = WorkOnCaseTypes.UpdateValues;
//   constructor(public payload: { event: FieldControlApiData; processStep: ProcessStepUIModel }) {}
// }

// export class UpdateValuesSuccess implements Action {
//   readonly type = WorkOnCaseTypes.UpdateValuesSuccess;
//   constructor(public payload: { processStep: ProcessStepUIModel; successMsg: string }) {}
// }

// export class UpdateValuesFailure implements Action {
//   readonly type = WorkOnCaseTypes.UpdateValuesFail;
//   constructor(public payload: { error: string }) {}
// }

// export class SearchSteps implements Action {
//   readonly type = WorkOnCaseTypes.SearchSteps;
//   constructor(public payload: { tenant: string; model: LikeFilter<string>; paging: Paging }) {}
// }

// export class SearchStepsSuccess implements Action {
//   readonly type = WorkOnCaseTypes.SearchStepsSuccess;
//   constructor(
//     public payload: {
//       length: number;
//       processStepNames: ProcessStepNames[];
//       searchModel: LikeFilter<string>;
//       processSteps: ProcessStep[];
//       successMsg: string;
//     }
//   ) {}
// }

// export class SearchStepsFailure implements Action {
//   readonly type = WorkOnCaseTypes.SearchStepsFail;
//   constructor(public payload: { error: string }) {}
// }

// export class OnFormSave implements Action {
//   readonly type = WorkOnCaseTypes.OnFormSave;
//   constructor(
//     public payload: {
//       wrapperFields: QueryList<CaseFieldWrapperComponent>;
//       form: FormDtoUI;
//       stepContentId: string;
//       tenant: string;
//       version: number;
//     }
//   ) {}
// }

// export class OnFormSaveSuccess implements Action {
//   readonly type = WorkOnCaseTypes.OnFormSaveSuccess;
//   constructor(public payload: { successMsg: string }) {}
// }

// export class OnFormSaveFailure implements Action {
//   readonly type = WorkOnCaseTypes.OnFormSaveFail;
//   constructor(public payload: { error: string }) {}
// }

// export class ClearMessages implements Action {
//   readonly type = WorkOnCaseTypes.ClearMessages;
//   constructor(public payload: {}) {}
// }

// export type CaseDataActions =
//   | LoadCaseData
//   | LoadCaseDataSuccess
//   | LoadCaseDataFailure
//   | LoadCaseProcessStepData
//   | LoadCaseProcessStepDataSuccess
//   | LoadCaseProcessStepDataFailure
//   | OnProcessStepAdd
//   | OnProcessStepAddSuccess
//   | OnProcessStepAddFailure
//   | OnProcessStepRemove
//   | OnProcessStepRemoveSuccess
//   | OnProcessStepRemoveFailure
//   | OnChangedStatus
//   | OnChangedStatusSuccess
//   | OnChangedStatusFailure
//   | OnRawDataDelete
//   | OnRawDataDeleteSuccess
//   | OnRawDataDeleteFailure
//   | OnPageChange
//   | OnPageChangeSuccess
//   | OnPageChangeFailure
//   | CdkDropListDropped
//   | CdkDropListDroppedSuccess
//   | CdkDropListDroppedFailure
//   | RenameCase
//   | RenameCaseSuccess
//   | RenameCaseFailure
//   | CaseProcessStepOnSave
//   | CaseProcessStepOnSaveSuccess
//   | CaseProcessStepOnSaveFailure
//   | BuildStepName
//   | BuildStepNameSuccess
//   | BuildStepNameFailure
//   | UpdateValues
//   | UpdateValuesSuccess
//   | UpdateValuesFailure
//   | SearchSteps
//   | SearchStepsSuccess
//   | SearchStepsFailure
//   | OnFormSave
//   | OnFormSaveSuccess
//   | OnFormSaveFailure
//   | ClearMessages;
