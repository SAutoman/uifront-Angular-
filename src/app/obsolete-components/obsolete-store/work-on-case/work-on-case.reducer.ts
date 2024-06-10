// /**
//  * global
//  */
// import { GridDataResult } from '@progress/kendo-angular-grid';

// import { cloneDeep } from 'lodash-core';

// /**
//  * project
//  */
// import { ProcessStepNames, CaseStatus, Roles, ProcessStep, Profile, RawDataStatus, RawDataEntity } from '@wfm/service-layer';
// import { FieldSettingUI } from '@wfm/tenant-admin/models';

// import { ProcessStepUIModel, ProcessStepUI } from '@wfm/process-step/models';

// import { convertRawDataStatus } from '@wfm/shared/utils';
// import { LikeFilter } from '@wfm/service-layer/models/dynamic-entity-models';

// /**
//  * local
//  */
// import { CaseDataActions, WorkOnCaseTypes } from './work-on-case.actions';

// export interface WorkOnCaseState {
//   caseId: string;
//   caseName: string;
//   caseStatus: CaseStatus;
//   caseAuthor: string;
//   selectedRole: Roles;
//   items: FieldSettingUI[];
//   itemsWithValues: [];
//   gridData: GridDataResult;
//   availableProcessSteps: ProcessStep[];
//   stepData: ProcessStepUIModel[];
//   processStepsIds: ProcessStepUI[];
//   doneDisabled: boolean;
//   reopenDisabled: boolean;
//   approveDisabled: boolean;
//   userProfile: Profile;
//   canEditCase: boolean;
//   canEditCaseError: string;
//   length: number;
//   pageSize: number;
//   pageSizeOptions: number[];
//   pageEvent: PageEvent;
//   sliced: ProcessStepNames[];
//   userId: string;
//   isChangedFields: boolean;
//   isChangedFormFields: boolean;
//   processStepNames: ProcessStepNames[];
//   searchModel: LikeFilter<string>;
//   processSteps: any;
//   errorMsg: string;
//   successMsg: string;
// }

// export const initialCaseDataState: WorkOnCaseState = <WorkOnCaseState>{
//   caseId: '',
//   caseName: '',
//   caseStatus: null,
//   caseAuthor: '',
//   selectedRole: null,
//   items: [],
//   itemsWithValues: [],
//   gridData: null,
//   availableProcessSteps: [],
//   stepData: [],
//   processStepsIds: [],
//   doneDisabled: true,
//   reopenDisabled: true,
//   approveDisabled: true,
//   userProfile: null,
//   canEditCase: false,
//   canEditCaseError: '',
//   isChangedFields: false,
//   isChangedFormFields: false,
//   length: 0,
//   pageSize: 6,
//   pageSizeOptions: [6, 15, 25],
//   pageEvent: null,
//   userId: '',
//   sliced: [],
//   processStepNames: [],
//   searchModel: null,
//   processSteps: {},
//   errorMsg: '',
//   successMsg: ''
// };

// function itemsWithValue(rawData: RawDataEntity[]): RawDataEntity[] {
//   const clone = <RawDataEntity[]>cloneDeep(rawData);
//   if (clone) {
//     clone.forEach((i) => {
//       i.status = convertRawDataStatus(<RawDataStatus>(<any>i.status));
//       i['rawDataId'] = i.id;
//       i['rawDataEntity'] = i;

//       if (i.extra) {
//         i.extra.forEach((f) => (i[f.name] = f.value));
//       }
//     });
//   }

//   return clone;
// }

// function items(fieldSettings: FieldSettingUI[]): FieldSettingUI[] {
//   //  fieldSettings structure has changed
//   return [];
//   // return fieldSettings.filter((x) => x.setting.details === true);
// }

// export function workOnCaseReducer(state = initialCaseDataState, action: CaseDataActions) {
//   switch (action.type) {
//     case WorkOnCaseTypes.LoadCaseDataSuccess:
//       return <WorkOnCaseState>{
//         ...state,
//         length: action.payload.length,
//         caseName: action.payload.data.name,
//         caseStatus: action.payload.data.status,
//         caseAuthor: action.payload.data.authorId,
//         items: items(action.payload.items),
//         itemsWithValues: itemsWithValue(action.payload.data.rawData),
//         gridData: action.payload.gridData,
//         stepData: action.payload.stepData,
//         processStepNames: action.payload.processStepNames,
//         sliced: action.payload.sliced,
//         canEditCaseError: action.payload.canEditCaseError,
//         canEditCase: action.payload.canEditCase,
//         reopenDisabled: action.payload.reopenDisabled,
//         approveDisabled: action.payload.approveDisabled,
//         doneDisabled: action.payload.doneDisabled,
//         successMsg: action.payload.successMsg
//       };
//     case WorkOnCaseTypes.OnProcessStepAddSuccess:
//       return <WorkOnCaseState>{
//         ...state,
//         stepData: action.payload.stepData,
//         successMsg: action.payload.successMsg
//       };
//     case WorkOnCaseTypes.OnProcessStepRemoveSuccess:
//       return <WorkOnCaseState>{
//         ...state,
//         stepData: action.payload.stepData,
//         successMsg: action.payload.successMsg
//       };
//     case WorkOnCaseTypes.OnChangedStatusSuccess:
//       return <WorkOnCaseState>{
//         ...state,
//         successMsg: action.payload.successMsg
//       };
//     case WorkOnCaseTypes.OnRawDataDeleteSuccess:
//       return <WorkOnCaseState>{
//         ...state,
//         successMsg: action.payload.successMsg
//       };
//     case WorkOnCaseTypes.OnPageChangeSuccess:
//       return <WorkOnCaseState>{
//         ...state,
//         length: action.payload.length,
//         processStepNames: action.payload.processStepNames,
//         pageSize: action.payload.pageSize,
//         sliced: action.payload.sliced,
//         successMsg: action.payload.successMsg
//       };
//     case WorkOnCaseTypes.CdkDropListDroppedSuccess:
//       return <WorkOnCaseState>{
//         ...state,
//         successMsg: action.payload.successMsg
//       };
//     case WorkOnCaseTypes.RenameCaseSuccess:
//       return <WorkOnCaseState>{
//         ...state,
//         caseName: action.payload.caseName,
//         successMsg: action.payload.successMsg
//       };
//     case WorkOnCaseTypes.RenameCaseFail:
//       return <WorkOnCaseState>{
//         ...state,
//         errorMsg: action.payload.error
//       };
//     case WorkOnCaseTypes.OnFormSaveFail:
//       return <WorkOnCaseState>{
//         ...state,
//         errorMsg: action.payload.error
//       };
//     case WorkOnCaseTypes.SearchStepsFail:
//       return <WorkOnCaseState>{
//         ...state,
//         errorMsg: action.payload.error
//       };
//     case WorkOnCaseTypes.UpdateValuesFail:
//       return <WorkOnCaseState>{
//         ...state,
//         errorMsg: action.payload.error
//       };
//     case WorkOnCaseTypes.LoadCaseProcessStepDataFail:
//       return <WorkOnCaseState>{
//         ...state,
//         errorMsg: action.payload.error
//       };
//     case WorkOnCaseTypes.LoadCaseDataFail:
//       return <WorkOnCaseState>{
//         ...state,
//         errorMsg: action.payload.error
//       };
//     case WorkOnCaseTypes.OnProcessStepRemoveFail:
//       return <WorkOnCaseState>{
//         ...state,
//         errorMsg: action.payload.error
//       };
//     case WorkOnCaseTypes.OnProcessStepAddFail:
//       return <WorkOnCaseState>{
//         ...state,
//         errorMsg: action.payload.error
//       };
//     case WorkOnCaseTypes.OnChangedStatusFail:
//       return <WorkOnCaseState>{
//         ...state,
//         errorMsg: action.payload.error
//       };
//     case WorkOnCaseTypes.OnRawDataDeleteFail:
//       return <WorkOnCaseState>{
//         ...state,
//         errorMsg: action.payload.error
//       };
//     case WorkOnCaseTypes.OnPageChangeFail:
//       return <WorkOnCaseState>{
//         ...state,
//         errorMsg: action.payload.error
//       };
//     case WorkOnCaseTypes.CdkDropListDroppedFail:
//       return <WorkOnCaseState>{
//         ...state,
//         errorMsg: action.payload.error
//       };
//     case WorkOnCaseTypes.CaseProcessStepOnSaveFail:
//       return <WorkOnCaseState>{
//         ...state,
//         errorMsg: action.payload.error
//       };
//     case WorkOnCaseTypes.UpdateValuesFail:
//       return <WorkOnCaseState>{
//         ...state,
//         errorMsg: action.payload.error
//       };
//     case WorkOnCaseTypes.LoadCaseProcessStepDataSuccess:
//       const loadCaseResult = <WorkOnCaseState>{
//         ...state,
//         successMsg: action.payload.successMsg
//       };

//       const loadCaseClone = cloneDeep(loadCaseResult.processSteps);
//       loadCaseClone[action.payload.currentProcessStep.id] = action.payload.currentProcessStep;

//       return <WorkOnCaseState>{
//         ...state,
//         processSteps: loadCaseClone
//       };
//     case WorkOnCaseTypes.UpdateValuesSuccess:
//       const updateValuesResult = <WorkOnCaseState>{
//         ...state,
//         successMsg: action.payload.successMsg
//       };

//       const updateValuesClone = cloneDeep(updateValuesResult.processSteps);
//       updateValuesClone[action.payload.processStep.id] = action.payload.processStep;

//       return <WorkOnCaseState>{
//         ...state,
//         processSteps: updateValuesClone
//       };
//     case WorkOnCaseTypes.CaseProcessStepOnSaveSuccess:
//       return <WorkOnCaseState>{
//         ...state,
//         successMsg: action.payload.successMsg
//       };
//     case WorkOnCaseTypes.SearchStepsSuccess:
//       return <WorkOnCaseState>{
//         ...state,
//         length: action.payload.length,
//         searchModel: action.payload.searchModel,
//         processSteps: action.payload.processSteps,
//         sliced: action.payload.processStepNames,
//         successMsg: action.payload.successMsg
//       };
//     case WorkOnCaseTypes.ClearMessages:
//       return <WorkOnCaseState>{
//         ...state,
//         errorMsg: '',
//         successMsg: ''
//       };
//     default:
//       return state;
//   }
// }
