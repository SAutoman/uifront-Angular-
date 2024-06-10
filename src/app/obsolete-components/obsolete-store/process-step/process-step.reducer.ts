// /**
//  * global
//  */
// import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';

// /**
//  * project
//  */
// import { ProcessStep } from '../../service-layer';

// /**
//  * local
//  */
// import { ProcessStepActions, ProcessStepActionTypes } from './process-step.actions';

// export interface ProcessStepSearchQuery {
//   filter: string;
//   sorting: string;
//   limit: number;
//   page: number;
// }

// export interface ProcessStepState extends EntityState<ProcessStep> {
//   selectedId: string;
//   loading: boolean;
//   error: string;
//   query: ProcessStepSearchQuery;
//   data: any;
// }

// export const processStepAdapter: EntityAdapter<ProcessStep> = createEntityAdapter<ProcessStep>();

// export const initialProcessStepState: ProcessStepState = processStepAdapter.getInitialState({
//   selectedId: null,
//   loading: false,
//   error: '',
//   query: {
//     filter: '',
//     sorting: '',
//     limit: 999,
//     page: 1
//   },
//   data: undefined
// });

// // export const applicationAdapter: EntityAdapter<ProcessStep> = createEntityAdapter<ProcessStep>({
// //   selectId: (model: ProcessStep) => model.id
// // });

// export function processStepReducer(state = initialProcessStepState, action: ProcessStepActions): ProcessStepState {
//   switch (action.type) {
//     case ProcessStepActionTypes.CreateProcessStep:
//       return {
//         ...state,
//         loading: true,
//         error: ''
//       };

//     case ProcessStepActionTypes.CreateProcessStepSuccess:
//       return {
//         ...processStepAdapter.addOne(action.payload.result, state),
//         loading: false,
//         error: ''
//       };

//     case ProcessStepActionTypes.CreateProcessStepFail:
//       return {
//         ...state,
//         loading: false,
//         error: 'Process Step create failed: ' + action.payload.error
//       };

//     case ProcessStepActionTypes.UpdateProcessStep:
//       return {
//         ...state,
//         loading: true,
//         error: ''
//       };

//     case ProcessStepActionTypes.UpdateProcessStepSuccess:
//       return {
//         ...processStepAdapter.updateOne(action.payload.update, state),
//         loading: false,
//         error: ''
//       };

//     case ProcessStepActionTypes.UpdateProcessStepFail:
//       return {
//         ...state,
//         loading: false,
//         error: 'Process Step update failed: ' + action.payload.error
//       };

//     case ProcessStepActionTypes.DeleteProcessStepById:
//       return {
//         ...state,
//         selectedId: action.payload.id,
//         loading: true,
//         error: ''
//       };

//     case ProcessStepActionTypes.DeleteProcessStepByIdSuccess:
//       return {
//         ...processStepAdapter.removeOne(action.payload.id, state),
//         loading: false,
//         error: ''
//       };

//     case ProcessStepActionTypes.DeleteProcessStepByIdFail:
//       return {
//         ...state,
//         loading: false,
//         error: 'Process Step delete failed: ' + action.payload.error
//       };

//     case ProcessStepActionTypes.GetProcessStepById:
//       return {
//         ...processStepAdapter.removeAll(state),
//         selectedId: action.payload.id,
//         loading: true,
//         error: ''
//       };

//     case ProcessStepActionTypes.GetProcessStepByIdSuccess:
//       return {
//         ...processStepAdapter.addOne(action.payload.result, state),
//         loading: false,
//         error: ''
//       };

//     case ProcessStepActionTypes.GetProcessStepByIdFail:
//       return {
//         ...state,
//         loading: false,
//         error: 'Process step load failed ' + action.payload.error
//       };

//     case ProcessStepActionTypes.GetProcessStepsSuccess:
//       return {
//         ...state,
//         data: action.payload,
//         error: ''
//       };

//     default:
//       return state;
//   }
// }

// export const getProcessSelectedId = (state: ProcessStepState) => state.selectedId;
// export const getProcessLoading = (state: ProcessStepState) => state.loading;
// export const getProcessError = (state: ProcessStepState) => state.error;
// export const getProcessQuery = (state: ProcessStepState) => state.query;
