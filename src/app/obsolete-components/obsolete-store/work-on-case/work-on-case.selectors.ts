// import { createSelector } from '@ngrx/store';
// import { WorkOnCaseState } from './work-on-case.reducer';

// export const workOnCaseState: (u: any) => WorkOnCaseState = (state) => state.workOnCaseState;
// export const selectAllSteps = (state: WorkOnCaseState) => state.stepData;

// export const getWorkOnCaseData = createSelector(workOnCaseState, (data) => data);

// export const getWorkOnCaseCaseName = createSelector(workOnCaseState, (data) => data.caseName);

// export const getWorkOnCaseErrorMsg = createSelector(workOnCaseState, (data) => data.errorMsg);

// export const getWorkOnCaseSuccessMsg = createSelector(workOnCaseState, (data) => data.successMsg);

// export const getWorkOnCaseStepData = createSelector(workOnCaseState, (data) => data.stepData);

// export const getWorkOnCaseProcessStepById = () =>
//   createSelector(
//     (state, props) => state.workOnCaseState.processSteps[props.id],
//     (counter, props) => counter
//   );
