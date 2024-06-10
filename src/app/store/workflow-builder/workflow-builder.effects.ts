/**
 * global
 */
import { Injectable } from '@angular/core';

import { Store, Action } from '@ngrx/store';
import { ofType, Actions, createEffect } from '@ngrx/effects';

import { Observable } from 'rxjs';
import { exhaustMap, switchMap } from 'rxjs/operators';

/**
 * project
 */
import {
  ProcessStepEntityService,
  ProcessStepLinkService,
  WorkflowService,
  WorkflowStatusService,
  WorkflowTransitionService,
  ProcessStepLinkDto
} from '@wfm/service-layer';

/**
 * local
 */
import { TenantComponent } from '../../shared/tenant.component';
import {
  WorkflowBuilderActionTypes,
  CreateWorkflow,
  CreateWorkflowSuccess,
  UpdateWorkflow,
  UpdateWorkflowSuccess,
  DeleteWorkflow,
  DeleteWorkflowSuccess,
  AddProcessStepEntity,
  AddProcessStepEntitySuccess,
  AddStatus,
  AddStatusSuccess,
  UpdateStatus,
  UpdateStatusSuccess,
  DeleteStatus,
  UpdateProcessStepEntity,
  UpdateProcessStepEntitySuccess,
  DeleteProcessStepEntity,
  GetWorkflowProcessStepLinks,
  GetWorkflowProcessStepLinksFail,
  GetWorkflowProcessStepLinksSuccess,
  GetWorkflowTransitions,
  GetWorkflowTransitionsFail,
  GetWorkflowTransitionsSuccess,
  DeleteProcessStepLink,
  DeleteProcessStepLinkFail,
  DeleteProcessStepLinkSuccess,
  DeleteTransition,
  DeleteTransitionFail,
  DeleteTransitionSuccess,
  AddProcessStepEntityFailed,
  DeleteProcessStepEntityFailed,
  DeleteProcessStepEntitySuccess,
  UpdateProcessStepEntityFailed,
  DeleteStatusSuccess,
  GetProcessSteps,
  GetProcessStepsFail,
  GetProcessStepsSuccess,
  AddTransition,
  AddTransitionFail,
  AddTransitionSuccess,
  UpdateTransition,
  UpdateTransitionFail,
  UpdateTransitionSuccess,
  AddProcessStepLink,
  AddProcessStepLinkSuccess,
  AddProcessStepLinkFail,
  UpdateProcessStepLink,
  UpdateProcessStepLinkFail,
  UpdateProcessStepLinkSuccess,
  SetDefaultStatus,
  SetDefaultStatusSuccess,
  SetDefaultStatusFail,
  GetStatusDataById,
  GetStatusDataByIdSuccess,
  GetWorkflowsByPagination,
  GetWorkflowsByPaginationFail,
  GetWorkflowsByPaginationSuccess,
  AddStatusFail,
  UpdateStatusFail,
  GetProcessStepDataById,
  GetProcessStepDataByIdFail,
  GetProcessStepDataByIdSuccess,
  GetStatusDataByIdFail,
  DeleteStatusFail,
  UpdateWorkflowFailure,
  CreateWorkflowFailure,
  DeleteWorkflowFailure,
  FixWorkflow,
  CreateCaseFieldLink,
  CreateCaseFieldLinkSuccess,
  CreateCaseFieldLinkFail,
  UpdateCaseFieldLink,
  UpdateCaseFieldLinkFail,
  UpdateCaseFieldLinkSuccess,
  GetCaseFieldLink,
  GetCaseFieldLinkSuccess,
  GetCaseFieldLinkFail,
  DeleteCaseFieldLink,
  DeleteCaseFieldLinkSuccess,
  DeleteCaseFieldLinkFail,
  GetAllCaseFieldLinks,
  GetAllCaseFieldLinksFail,
  GetAllCaseFieldLinksSuccess,
  UpdateAllProcessStepLinksPosition,
  UpdateAllProcessStepLinksPositionSuccess,
  UpdateAllProcessStepLinksPositionFailure,
  CreateRawDataLink,
  CreateRawDataLinkFail,
  CreateRawDataLinkSuccess,
  DeleteRawDataLink,
  DeleteRawDataLinkFail,
  DeleteRawDataLinkSuccess,
  GetAllRawDataLinks,
  GetAllRawDataLinksFail,
  GetAllRawDataLinksSuccess,
  GetRawDataLink,
  GetRawDataLinkFail,
  GetRawDataLinkSuccess,
  UpdateRawDataLink,
  UpdateRawDataLinkFail,
  UpdateRawDataLinkSuccess,
  CreateWorkflowCopy,
  CreateWorkflowCopyFailed,
  CreateWorkflowCopySuccess
} from './workflow-builder.actions';
import { BaseActionDto, BaseActionType } from '@wfm/service-layer/models/actionDto';
import { WorkflowBuilderState } from './workflow-builder.reducer';
import { GetStatusList, GetStatusListFail } from '../workflow/workflow.actions';
import { CaseFieldLinkService } from '@wfm/service-layer/services/case-field-link.service';
import { WorkflowsCacheService } from '@wfm/service-layer/services/workflows-cache.service';
import { RawdataLinkService } from '@wfm/service-layer/services/rawdata-link.service';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';

@Injectable()
export class WorkflowBuilderEffects extends TenantComponent {
  constructor(
    private actions$: Actions,
    private wfService: WorkflowService,
    private workflowsCacheService: WorkflowsCacheService,
    private wfStatusService: WorkflowStatusService,
    private store: Store<WorkflowBuilderState>,
    private processStepEntityService: ProcessStepEntityService,
    private workflowTransitionService: WorkflowTransitionService,
    private processStepLinkService: ProcessStepLinkService,
    private caseFieldLinkService: CaseFieldLinkService,
    private rawDataLinkService: RawdataLinkService,
    private errorHandlerService: ErrorHandlerService
  ) {
    super(store);
  }

  CreateWorkflow: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<CreateWorkflow>(WorkflowBuilderActionTypes.CreateWorkflow),
      exhaustMap(async (action) => {
        let workflowOperation = await this.wfService.create(action.payload.data);
        try {
          if (workflowOperation.status.toString() === 'Success') {
            return new CreateWorkflowSuccess({
              defaultStatusId: action.payload.defaultStatusId,
              workflowId: workflowOperation.targetId,
              msg: 'Workflow created successsfully'
            });
          }
        } catch (error) {
          return new CreateWorkflowFailure({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  CreateWorkflowSuccess: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<CreateWorkflowSuccess>(WorkflowBuilderActionTypes.CreateWorkflowSuccess),
      exhaustMap(async (action) => {
        return new SetDefaultStatus({ wfId: action.payload.workflowId, defaultStatusId: action.payload.defaultStatusId });
      })
    )
  );

  UpdateWorkflow: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<UpdateWorkflow>(WorkflowBuilderActionTypes.UpdateWorkflow),
      exhaustMap(async (action) => {
        try {
          const response = await this.wfService.update(action.payload.data);
          if (response.status.toString() === 'Success') {
            return new UpdateWorkflowSuccess({ workflowId: action.payload.data.id, msg: 'Workflow updated successfully' });
          }
        } catch (error) {
          return new UpdateWorkflowFailure({ errorMessage: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  FixWorkflow: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<FixWorkflow>(WorkflowBuilderActionTypes.FixWorkflow),
      exhaustMap(async (action) => {
        try {
          const response = await this.wfService.updateIncompleteWorkflow(action.payload.data);
          if (response.status.toString() === 'Success') {
            return new UpdateWorkflowSuccess({ workflowId: action.payload.data.id, msg: 'Workflow updated successfully' });
          }
        } catch (error) {
          return new UpdateWorkflowFailure({ errorMessage: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  DeleteWorkflow: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<DeleteWorkflow>(WorkflowBuilderActionTypes.DeleteWorkflow),
      exhaustMap(async (action) => {
        try {
          const result = await this.wfService.delete(action.payload.wfId, action.payload.tenantId);
          if (result.status.toString() === 'Success') {
            return new DeleteWorkflowSuccess({ msg: 'Workflow deleted successfully' });
          }
        } catch (error) {
          return new DeleteWorkflowFailure({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  AddProcessStep: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<AddProcessStepEntity>(WorkflowBuilderActionTypes.AddProcessStepEntity),
      exhaustMap(async (action) => {
        try {
          const operation = await this.processStepEntityService.create(action.payload.data);
          if (operation.status.toString().toLowerCase() === 'success') {
            return new AddProcessStepEntitySuccess();
          }
        } catch (error) {
          return new AddProcessStepEntityFailed({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  AddProcessStepEntitySuccess: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<AddProcessStepEntitySuccess>(WorkflowBuilderActionTypes.AddProcessStepEntitySuccess),
      exhaustMap(async (action) => {
        try {
          return new GetProcessSteps({ tenantId: this.tenant, paging: { skip: 0, take: 1000 } });
        } catch (error) {
          return new AddProcessStepEntityFailed({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  UpdateProcessStep: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<UpdateProcessStepEntity>(WorkflowBuilderActionTypes.UpdateProcessStepEntity),
      exhaustMap(async (action) => {
        try {
          const operation = await this.processStepEntityService.update(action.payload.data);
          if (operation.status.toString().toLowerCase() === 'success') {
            return new UpdateProcessStepEntitySuccess();
          }
        } catch (error) {
          return new UpdateProcessStepEntityFailed({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  UpdateProcessStepEntitySuccess: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<UpdateProcessStepEntitySuccess>(WorkflowBuilderActionTypes.UpdateProcessStepEntitySuccess),
      exhaustMap(async (action) => {
        try {
          return new GetProcessSteps({ tenantId: this.tenant, paging: { skip: 0, take: 1000 } });
        } catch (error) {
          return new UpdateProcessStepEntityFailed({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  DeleteProcessStep: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<DeleteProcessStepEntity>(WorkflowBuilderActionTypes.DeleteProcessStepEntity),
      exhaustMap(async (action) => {
        try {
          const operation = await this.processStepEntityService.delete(action.payload.tenantId, action.payload.id);
          if (operation.status.toString().toLowerCase() === 'success') {
            return new DeleteProcessStepEntitySuccess({ msg: 'Process step entity deleted successfully' });
          }
        } catch (error) {
          return new DeleteProcessStepEntityFailed({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  // DeleteProcessStepEntitySuccess: Observable<Action> = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType<DeleteProcessStepEntitySuccess>(WorkflowBuilderActionTypes.DeleteProcessStepEntitySuccess),
  //     exhaustMap(async (action) => {
  //       try {
  //         return new GetProcessSteps({ tenantId: this.tenant, paging: { skip: 0, take: 1000 } });
  //       } catch (error) {
  //         console.log(error);
  //         return new DeleteProcessStepEntityFailed();
  //       }
  //     })
  //   )
  // );

  GetProcessSteps: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetProcessSteps>(WorkflowBuilderActionTypes.GetProcessSteps),
      switchMap(async (action) => {
        try {
          let result = await this.processStepEntityService.getList(action.payload.tenantId, action.payload.paging);
          return new GetProcessStepsSuccess({ data: result });
        } catch (error) {
          return new GetProcessStepsFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  SetDefaultStatus: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<SetDefaultStatus>(WorkflowBuilderActionTypes.SetDefaultStatus),
      exhaustMap(async (action) => {
        try {
          const result = await this.wfService.setDefaultStatus(action.payload.wfId, action.payload.defaultStatusId, this.tenant);
          if (result.status.toString().toLowerCase() === 'success') {
            return new SetDefaultStatusSuccess();
          }
        } catch (error) {
          return new SetDefaultStatusFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  AddStatus: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<AddStatus>(WorkflowBuilderActionTypes.AddStatus),
      exhaustMap(async (action) => {
        try {
          const operation = await this.wfStatusService.create(action?.payload?.data);
          if (operation.status.toString().toLowerCase() === 'success') {
            return new AddStatusSuccess({ data: { tenantId: action.payload.data.tenantId, id: operation.targetId } });
          }
        } catch (error) {
          return new AddStatusFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  AddStatusSuccess: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<AddStatusSuccess>(WorkflowBuilderActionTypes.AddStatusSuccess),
      exhaustMap(async (action) => {
        try {
          const result = await this.wfStatusService.get(action.payload.data.tenantId, action.payload.data.id);
          if (result) {
            return new GetStatusList({ tenantId: this.tenant });
          }
        } catch (error) {
          return new AddStatusFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  UpdateStatus: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<UpdateStatus>(WorkflowBuilderActionTypes.UpdateStatus),
      exhaustMap(async (action) => {
        try {
          const operation = await this.wfStatusService.update(action?.payload?.id, action.payload.data);
          if (operation.status.toString().toLowerCase() === 'success') {
            return new UpdateStatusSuccess({ tenantId: action.payload.data.tenantId, id: operation.targetId });
          }
        } catch (error) {
          return new UpdateStatusFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  UpdateStatusSuccess: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<UpdateStatusSuccess>(WorkflowBuilderActionTypes.UpdateStatusSuccess),
      exhaustMap(async (action) => {
        try {
          const result = await this.wfStatusService.get(action.payload.tenantId, action.payload.id);
          if (result) {
            return new GetStatusList({ tenantId: this.tenant });
          }
        } catch (error) {
          return new GetStatusListFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  DeleteStatus: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<DeleteStatus>(WorkflowBuilderActionTypes.DeleteStatus),
      exhaustMap(async (action) => {
        try {
          const result = await this.wfStatusService.delete(this.tenant, action.payload.statusId);
          if (result.status.toString().toLowerCase() === 'success') {
            this.store.dispatch(new GetStatusList({ tenantId: this.tenant }));
            return new DeleteStatusSuccess();
          }
        } catch (error) {
          return new DeleteStatusFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  GetWorkflowTransitions: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetWorkflowTransitions>(WorkflowBuilderActionTypes.GetWorkflowTransitions),
      switchMap(async (action) => {
        try {
          let result = await this.workflowTransitionService.getList(action.payload.tenantId, action.payload.workflowId);
          return new GetWorkflowTransitionsSuccess({ data: result });
        } catch (error) {
          return new GetWorkflowTransitionsFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  GetWorkflowProcessStepLinks: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetWorkflowProcessStepLinks>(WorkflowBuilderActionTypes.GetWorkflowProcessStepLinks),
      switchMap(async (action) => {
        try {
          let result = await this.processStepLinkService.getList(action.payload.tenantId, action.payload.workflowId);
          mapLinksToFrontend(result);
          return new GetWorkflowProcessStepLinksSuccess({ data: result });
        } catch (error) {
          return new GetWorkflowProcessStepLinksFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  AddProcessStepLink: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<AddProcessStepLink>(WorkflowBuilderActionTypes.AddProcessStepLink),
      exhaustMap(async (action) => {
        try {
          const operation = await this.processStepLinkService.createNew(action.payload.data);
          if (operation.status.toString() === 'Success') {
            return new AddProcessStepLinkSuccess({ id: operation.targetId, workflowId: action.payload.data.workflowId });
          }
        } catch (error) {
          return new AddProcessStepLinkFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  AddProcessStepLinkSuccess: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<AddProcessStepLinkSuccess>(WorkflowBuilderActionTypes.AddProcessStepLinkSuccess),
      exhaustMap(async (action) => {
        try {
          this.workflowsCacheService.removeFromCache(action.payload.workflowId);
          return new GetWorkflowProcessStepLinks({ tenantId: this.tenant, workflowId: action.payload.workflowId });
        } catch (error) {
          return new AddProcessStepLinkFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  UpdateProcessStepLink: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<UpdateProcessStepLink>(WorkflowBuilderActionTypes.UpdateProcessStepLink),
      exhaustMap(async (action) => {
        try {
          const operation = await this.processStepLinkService.update(this.tenant, action.payload.data);
          if (operation.status.toString() === 'Success') {
            return new UpdateProcessStepLinkSuccess({ id: operation.targetId, workflowId: action.payload.data.workflowId });
          }
        } catch (error) {
          return new UpdateProcessStepLinkFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  UpdateProcessStepLinkSuccess: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<UpdateProcessStepLinkSuccess>(WorkflowBuilderActionTypes.UpdateProcessStepLinkSuccess),
      exhaustMap(async (action) => {
        try {
          this.workflowsCacheService.removeFromCache(action.payload.workflowId);
          return new GetWorkflowProcessStepLinks({ tenantId: this.tenant, workflowId: action.payload.workflowId });
        } catch (error) {
          return new UpdateProcessStepLinkFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  DeleteProcessStepLink: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<DeleteProcessStepLink>(WorkflowBuilderActionTypes.DeleteProcessStepLink),
      exhaustMap(async (action) => {
        try {
          const operation = await this.processStepLinkService.delete(this.tenant, action.payload.id);
          if (operation.status.toString() === 'Success') {
            return new DeleteProcessStepLinkSuccess({ id: operation.targetId, workflowId: action.payload.workflowId });
          }
        } catch (error) {
          return new DeleteProcessStepLinkFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  DeleteProcessStepLinkSuccess: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<DeleteProcessStepLinkSuccess>(WorkflowBuilderActionTypes.DeleteProcessStepLinkSuccess),
      exhaustMap(async (action) => {
        try {
          this.workflowsCacheService.removeFromCache(action.payload.workflowId);
          return new GetWorkflowProcessStepLinks({ tenantId: this.tenant, workflowId: action.payload.workflowId });
        } catch (error) {
          return new DeleteProcessStepLinkFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  AddTransition: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<AddTransition>(WorkflowBuilderActionTypes.AddTransition),
      exhaustMap(async (action) => {
        try {
          const operation = await this.workflowTransitionService.create(action.payload.data);
          if (operation.status.toString() === 'Success') {
            return new AddTransitionSuccess({ id: operation.targetId, workflowId: action.payload.data.workflowId });
          }
        } catch (error) {
          return new AddTransitionFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  AddTransitionSuccess: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<AddTransitionSuccess>(WorkflowBuilderActionTypes.AddTransitionSuccess),
      exhaustMap(async (action) => {
        try {
          return new GetWorkflowTransitions({ tenantId: this.tenant, workflowId: action.payload.workflowId });
        } catch (error) {
          return new AddTransitionFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  UpdateTransition: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<UpdateTransition>(WorkflowBuilderActionTypes.UpdateTransition),
      exhaustMap(async (action) => {
        try {
          const operation = await this.workflowTransitionService.update(this.tenant, action.payload.data);
          if (operation.status.toString() === 'Success') {
            return new UpdateTransitionSuccess({ id: operation.targetId, workflowId: action.payload.data.workflowId });
          }
        } catch (error) {
          return new UpdateTransitionFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  UpdateTransitionSuccess: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<UpdateTransitionSuccess>(WorkflowBuilderActionTypes.UpdateTransitionSuccess),
      exhaustMap(async (action) => {
        try {
          return new GetWorkflowTransitions({ tenantId: this.tenant, workflowId: action.payload.workflowId });
        } catch (error) {
          return new UpdateTransitionFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  DeleteTransition: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<DeleteTransition>(WorkflowBuilderActionTypes.DeleteTransition),
      exhaustMap(async (action) => {
        try {
          const operation = await this.workflowTransitionService.delete(this.tenant, action.payload.id);
          if (operation.status.toString() === 'Success') {
            return new DeleteTransitionSuccess({ id: operation.targetId, workflowId: action.payload.workflowId });
          }
        } catch (error) {
          return new DeleteTransitionFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  DeleteTransitionSuccess: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<DeleteTransitionSuccess>(WorkflowBuilderActionTypes.DeleteTransitionSuccess),
      exhaustMap(async (action) => {
        try {
          return new GetWorkflowTransitions({ tenantId: this.tenant, workflowId: action.payload.workflowId });
        } catch (error) {
          return new DeleteTransitionFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  GetWorkflowsByPagination: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetWorkflowsByPagination>(WorkflowBuilderActionTypes.GetWorkflowsByPagination),
      switchMap(async (action) => {
        try {
          const paging = action.payload?.paging || { skip: 0, take: 100 };
          const result = await this.wfService.search(this.tenant, paging, null, true);
          return new GetWorkflowsByPaginationSuccess({
            items: result.items,
            total: result.total - result.incorrectItems?.length || 0,
            incorrectItems: result.incorrectItems
          });
        } catch (error) {
          return new GetWorkflowsByPaginationFail();
        }
      })
    )
  );

  GetProcessStepDataById: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetProcessStepDataById>(WorkflowBuilderActionTypes.GetProcessStepDataById),
      switchMap(async (action) => {
        try {
          const processStepEntityDataById = await this.processStepEntityService.get(this.tenant, action.payload.data.id);
          if (processStepEntityDataById) return new GetProcessStepDataByIdSuccess({ data: processStepEntityDataById });
        } catch (error) {
          return new GetProcessStepDataByIdFail();
        }
      })
    )
  );

  GetStatusDataById: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetStatusDataById>(WorkflowBuilderActionTypes.GetStatusDataById),
      switchMap(async (action) => {
        try {
          const statusDataById = await this.wfStatusService.get(this.tenant, action.payload.data.id);
          if (statusDataById) return new GetStatusDataByIdSuccess({ data: statusDataById });
        } catch (error) {
          return new GetStatusDataByIdFail();
        }
      })
    )
  );

  CreateCaseFieldLink: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<CreateCaseFieldLink>(WorkflowBuilderActionTypes.CreateCaseFieldLink),
      exhaustMap(async (action) => {
        try {
          const operation = await this.caseFieldLinkService.create(action.payload.data);
          if (operation.status.toString() === 'Success') {
            const link = await this.caseFieldLinkService.getById(action.payload.data.tenantId, operation.targetId);
            return new CreateCaseFieldLinkSuccess({ fieldLink: link, msg: 'Field Rules Created Successfully' });
          }
        } catch (error) {
          return new CreateCaseFieldLinkFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  UpdateCaseFieldLink: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<UpdateCaseFieldLink>(WorkflowBuilderActionTypes.UpdateCaseFieldLink),
      exhaustMap(async (action) => {
        try {
          const operation = await this.caseFieldLinkService.update(action.payload.data);
          if (operation.status.toString() === 'Success') {
            const link = await this.caseFieldLinkService.getById(this.tenant, operation.targetId);
            return new UpdateCaseFieldLinkSuccess({ fieldLink: link, msg: 'Field Rules Updated Successfully' });
          }
        } catch (error) {
          return new UpdateCaseFieldLinkFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  DeleteCaseFieldLink: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<DeleteCaseFieldLink>(WorkflowBuilderActionTypes.DeleteCaseFieldLink),
      exhaustMap(async (action) => {
        try {
          const operation = await this.caseFieldLinkService.delete(action.payload.tenantId, action.payload.linkId);
          if (operation.status.toString() === 'Success') {
            return new DeleteCaseFieldLinkSuccess({ msg: 'Field Rules Deleted Successfully' });
          }
        } catch (error) {
          return new DeleteCaseFieldLinkFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  GetCaseFieldLink: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetCaseFieldLink>(WorkflowBuilderActionTypes.GetCaseFieldLink),
      switchMap(async (action) => {
        try {
          const link = await this.caseFieldLinkService.getById(action.payload.tenantId, action.payload.linkId);
          if (link) return new GetCaseFieldLinkSuccess({ fieldLink: link });
        } catch (error) {
          return new GetCaseFieldLinkFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  GetAllCaseFieldLinks: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetAllCaseFieldLinks>(WorkflowBuilderActionTypes.GetAllCaseFieldLinks),
      switchMap(async (action) => {
        try {
          const links = await this.caseFieldLinkService.getLinks(action.payload.tenantId, action.payload.workflowId);
          if (links) {
            return new GetAllCaseFieldLinksSuccess({ fieldLinks: links });
          }
        } catch (error) {
          return new GetAllCaseFieldLinksFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  CreateRawDataLink: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<CreateRawDataLink>(WorkflowBuilderActionTypes.CreateRawDataLink),
      exhaustMap(async (action) => {
        try {
          const operation = await this.rawDataLinkService.create(action.payload.data);
          if (operation.status.toString() === 'Success') {
            const link = await this.rawDataLinkService.getById(action.payload.data.tenantId, operation.targetId);
            return new CreateRawDataLinkSuccess({ rawDataLink: link, msg: 'RawData Rules Created Successfully' });
          }
        } catch (error) {
          return new CreateRawDataLinkFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  UpdateRawDataLink: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<UpdateRawDataLink>(WorkflowBuilderActionTypes.UpdateRawDataLink),
      exhaustMap(async (action) => {
        try {
          const operation = await this.rawDataLinkService.update(action.payload.data);
          if (operation.status.toString() === 'Success') {
            const link = await this.rawDataLinkService.getById(this.tenant, operation.targetId);
            return new UpdateRawDataLinkSuccess({ rawDataLink: link, msg: 'RawData Rules Updated Successfully' });
          }
        } catch (error) {
          return new UpdateRawDataLinkFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  DeleteRawDataLink: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<DeleteRawDataLink>(WorkflowBuilderActionTypes.DeleteRawDataLink),
      exhaustMap(async (action) => {
        try {
          const operation = await this.rawDataLinkService.delete(action.payload.tenantId, action.payload.linkId);
          if (operation.status.toString() === 'Success') {
            return new DeleteRawDataLinkSuccess({ msg: 'RawData Rules Deleted Successfully' });
          }
        } catch (error) {
          return new DeleteRawDataLinkFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  GetRawDataLink: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetRawDataLink>(WorkflowBuilderActionTypes.GetRawDataLink),
      switchMap(async (action) => {
        try {
          const link = await this.rawDataLinkService.getById(action.payload.tenantId, action.payload.linkId);
          if (link) return new GetRawDataLinkSuccess({ rawDataLink: link });
        } catch (error) {
          return new GetRawDataLinkFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  GetAllRawDataLinks: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetAllRawDataLinks>(WorkflowBuilderActionTypes.GetAllRawDataLinks),
      switchMap(async (action) => {
        try {
          const links = await this.rawDataLinkService.getLinks(action.payload.tenantId, action.payload.workflowId);
          if (links) {
            return new GetAllRawDataLinksSuccess({ rawDataLinks: links });
          }
        } catch (error) {
          return new GetAllRawDataLinksFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  UpdateProcessStepLinksPosition: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<UpdateAllProcessStepLinksPosition>(WorkflowBuilderActionTypes.UpdateAllProcessStepLinksPosition),
      exhaustMap(async (action) => {
        try {
          const operation = await this.processStepLinkService.updateAllProcessStepLinksPosition(
            action.payload.tenantId,
            action.payload.wfId,
            action?.payload?.data
          );
          if (operation.status.toString().toLowerCase() === 'success') {
            return new UpdateAllProcessStepLinksPositionSuccess({ msg: 'Position Updated Successfully' });
          }
        } catch (error) {
          return new UpdateAllProcessStepLinksPositionFailure({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  CreateWorkflowCopy: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<CreateWorkflowCopy>(WorkflowBuilderActionTypes.CreateWorkflowCopy),
      exhaustMap(async (action) => {
        try {
          const workflowOperation = await this.wfService.createWorkflowCopy(action.payload.data, this.tenant);
          if (workflowOperation.status.toString() === 'Success') {
            return new CreateWorkflowCopySuccess({
              workflowId: workflowOperation.targetId,
              msg: 'Workflow created successsfully'
            });
          }
        } catch (error) {
          return new CreateWorkflowCopyFailed({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );
}

/**
 * flatten link's postaction.parameters property which we are getting from backend
 * as reported by Ahmet, it is hard to implement at the backend
 */
function mapLinksToFrontend(linksData: ProcessStepLinkDto[]): void {
  linksData.forEach((link) => {
    const resolveEventActions = link.defaultOverride.onProcessStepResolvedEvents;
    if (resolveEventActions?.length) {
      link.defaultOverride.onProcessStepResolvedEvents = flattenParametersProperty(resolveEventActions);
    }
    const stepAddEvents = link.defaultOverride.onStepAddedEvent;
    if (stepAddEvents?.length) {
      link.defaultOverride.onStepAddedEvent = flattenParametersProperty(stepAddEvents);
    }
    const stepUpdateEvents = link.defaultOverride.onStepUpdatedEvent;
    if (stepUpdateEvents?.length) {
      link.defaultOverride.onStepUpdatedEvent = flattenParametersProperty(stepUpdateEvents);
    }
    const stepDeleteEvents = link.defaultOverride.onDeletedEvent;
    if (stepDeleteEvents?.length) {
      link.defaultOverride.onDeletedEvent = flattenParametersProperty(stepDeleteEvents);
    }

    if (link?.overrides?.length) {
      link.overrides.forEach((override) => {
        if (override.onProcessStepResolvedEvents?.length) {
          const actions = override.onProcessStepResolvedEvents;
          override.onProcessStepResolvedEvents = flattenParametersProperty(actions);
        }
        if (override.onDeletedEvent?.length) {
          const actions = override.onDeletedEvent;
          override.onDeletedEvent = flattenParametersProperty(actions);
        }
        if (override.onStepAddedEvent?.length) {
          const actions = override.onStepAddedEvent;
          override.onStepAddedEvent = flattenParametersProperty(actions);
        }
        if (override.onStepUpdatedEvent?.length) {
          const actions = override.onStepUpdatedEvent;
          override.onStepUpdatedEvent = flattenParametersProperty(actions);
        }
      });
    }
  });
}
function flattenParametersProperty(actions: BaseActionType[]): BaseActionType[] {
  return actions.map((action: BaseActionDto) => {
    let newAction = Object.assign({}, action, action.parameters);
    delete newAction.parameters;
    return newAction;
  });
}
