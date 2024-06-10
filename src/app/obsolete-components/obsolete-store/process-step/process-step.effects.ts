// /**
//  * global
//  */
// import { Injectable } from '@angular/core';

// import { Store, Action } from '@ngrx/store';
// import { Update } from '@ngrx/entity';
// import { Effect, ofType, Actions } from '@ngrx/effects';

// import { Observable } from 'rxjs';
// import { exhaustMap, withLatestFrom, mergeMap } from 'rxjs/operators';

// /**
//  * project
//  */
// import { TenantComponent } from '../../shared/tenant.component';
// import { ProcessFlowService, ProcessStep } from '../../service-layer';

// /**
//  * local
//  */
// import {
//   CreateProcessStep,
//   ProcessStepActionTypes,
//   CreateProcessStepSuccess,
//   CreateProcessStepFail,
//   UpdateProcessStep,
//   UpdateProcessStepSuccess,
//   UpdateProcessStepFail,
//   DeleteProcessStepById,
//   DeleteProcessStepByIdSuccess,
//   DeleteProcessStepByIdFail,
//   GetProcessStepById,
//   GetProcessStepByIdSuccess,
//   GetProcessStepByIdFail,
//   GetProcessSteps,
//   GetProcessStepsSuccess,
//   GetProcessStepsFail
// } from './process-step.actions';
// import { ProcessStepState } from './process-step.reducer';
// import { processStepSelector } from './process-step.selectors';

// @Injectable()
// export class ProcessStepEffects extends TenantComponent {
//   constructor(private actions$: Actions, private service: ProcessFlowService, private store: Store<ProcessStepState>) {
//     super(store);
//   }

//   // ========================================= CREATE
//   @Effect()
//   create: Observable<Action> = this.actions$.pipe(
//     ofType<CreateProcessStep>(ProcessStepActionTypes.CreateProcessStep),
//     exhaustMap(async (action) => {
//       try {
//         const result = await this.service.create(this.tenant, action.payload.processSteps);
//         return new CreateProcessStepSuccess({ result });
//       } catch (error) {
//         return new CreateProcessStepFail({ error });
//       }
//     })
//   );

//   // ========================================= UPDATE
//   update: Observable<Action> = this.actions$.pipe(
//     ofType<UpdateProcessStep>(ProcessStepActionTypes.UpdateProcessStep),
//     exhaustMap(async (action) => {
//       try {
//         const processStep = await this.service.update(this.tenant, action.payload.processSteps);
//         return new UpdateProcessStepSuccess({ update: { id: processStep.id, changes: processStep } as Update<ProcessStep> });
//       } catch (error) {
//         return new UpdateProcessStepFail({ error });
//       }
//     })
//   );

//   // ========================================= DELETE
//   @Effect()
//   delete: Observable<Action> = this.actions$.pipe(
//     ofType<DeleteProcessStepById>(ProcessStepActionTypes.DeleteProcessStepById),
//     exhaustMap(async (action) => {
//       try {
//         await this.service.deleteById(this.tenant, action.payload.id);
//         return new DeleteProcessStepByIdSuccess({ id: action.payload.id });
//       } catch (error) {
//         return new DeleteProcessStepByIdFail({ error });
//       }
//     })
//   );

//   // ========================================= GET
//   @Effect()
//   getProcessStepById: Observable<Action> = this.actions$.pipe(
//     ofType<GetProcessStepById>(ProcessStepActionTypes.GetProcessStepById),
//     mergeMap(async (action) => {
//       try {
//         const result = await this.service.getProcessStepById(this.tenant, action.payload.id);
//         return new GetProcessStepByIdSuccess({ result });
//       } catch (error) {
//         return new GetProcessStepByIdFail({ error });
//       }
//     })
//   );

//   @Effect()
//   getAllProcessSteps: Observable<Action> = this.actions$.pipe(
//     ofType<GetProcessSteps>(ProcessStepActionTypes.GetProcessSteps),
//     withLatestFrom(this.store.select(processStepSelector)),
//     exhaustMap(async () => {
//       try {
//         const result = await this.service.getAllProcessSteps(this.tenant);
//         return new GetProcessStepsSuccess({ result });
//       } catch (error) {
//         return new GetProcessStepsFail({ error });
//       }
//     })
//   );
// }
