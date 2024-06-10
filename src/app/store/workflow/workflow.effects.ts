/**
 * global
 */
import { Injectable } from '@angular/core';

import { Store, Action } from '@ngrx/store';
import { ofType, Actions, createEffect } from '@ngrx/effects';

import { Observable } from 'rxjs';
import { exhaustMap, switchMap } from 'rxjs/operators';
import { sortBy } from 'lodash-core';

/**
 * project
 */
import {
  AreaTypeEnum,
  CaseFieldLinkService,
  CaseStepEntityUi,
  CreateWorkflowStateCommand,
  DynamicEntitiesService,
  GetWorkflowStateQuery,
  Operation,
  OperationStatus,
  WorkflowDto,
  WorkflowService,
  WorkflowStateDto,
  WorkflowStateService,
  WorkflowStateUI,
  WorkflowStatusService,
  WorkflowVisualPlanService
} from '@wfm/service-layer';

/**
 * local
 */
import { TenantComponent } from '../../shared/tenant.component';
import {
  CreateWorkflowStates,
  CreateWorkflowStatesFail,
  GetWorkflowById,
  GetWorkflows,
  GetWorkflowsFail,
  GetWorkflowsSuccess,
  GetWorkflowStateById,
  GetWorkflowStateFail,
  GetWorkflowStateCasesList,
  GetWorkflowStateCasesListFail,
  GetWorkflowStateCasesListSuccess,
  GetWorkflowStateSuccess,
  GetWorkflowSuccess,
  RemoveWorkflowStateStep,
  RemoveWorkflowStateStepFail,
  RemoveWorkflowStateStepSuccess,
  UpdateWorkflowStateStatus,
  UpdateWorkflowStateStatusFail,
  UpdateWorkflowStateStatusSuccess,
  UpdateWorkflowStateStep,
  UpdateWorkflowStateCaseStepsUi,
  WorkflowActionTypes,
  UpdateWorkflowStateCaseStepsUiSuccess,
  UpdateWorkflowStateCaseStepsUiFail,
  CreateWorkflowStatesSuccess,
  UpdateWorkflowStateCaseFail,
  UpdateWorkflowStateCaseSuccess,
  UpdateWorkflowStateCase,
  GetStatusList,
  GetStatusListSuccess,
  GetStatusListFail,
  RefreshWorkflowStatesList,
  CreateUpdateWorkflowStateStepFail,
  CreateUpdateWorkflowStateStepSuccess,
  CreateWorkflowStateStep,
  GetWorkflowFail,
  GetActiveFieldLinkOverrides,
  GetActiveFieldLinkOverridesFail,
  GetActiveFieldLinkOverridesSuccess,
  GetWorkflowVisualPlanList,
  GetWorkflowVisualPlanListSuccess,
  GetWorkflowVisualPlanListFail,
  UpdateWorkflowVisualPlan,
  UpdateWorkflowVisualPlanSuccess,
  UpdateWorkflowVisualPlanFail,
  CreateWorkflowVisualPlan,
  CreateWorkflowVisualPlanSuccess,
  CreateWorkflowVisualPlanFail,
  DeleteWorkflowVisualPlan,
  DeleteWorkflowVisualPlanSuccess,
  DeleteWorkflowVisualPlanFail,
  GetWorkflowVisualPlanMappedUnits,
  GetWorkflowVisualPlanMappedUnitsSuccess,
  GetWorkflowVisualPlanMappedUnitsFail,
  GetFiredPostactions,
  GetFiredPostactionsSuccess,
  GetFiredPostactionsFail
} from './workflow.actions';
import { WorkflowState } from './workflow.reducer';
import { BaseActionDto, BaseActionType } from '@wfm/service-layer/models/actionDto';
import { WorkflowsCacheService } from '@wfm/service-layer/services/workflows-cache.service';
import { UpdateDynamicEntityVisualSettings, UpdateDynamicEntityVisualSettingsFail, UpdateDynamicEntityVisualSettingsSuccess } from '.';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';
import { SchemaValidatorsHelper } from '@wfm/service-layer/helpers/schema-validators.helper';
import { PostactionService } from '@wfm/service-layer/services/postaction.service';

@Injectable()
export class WorkflowEffects extends TenantComponent {
  constructor(
    private actions$: Actions,
    private wfStateService: WorkflowStateService,
    private dynamicEntityService: DynamicEntitiesService,
    private wfService: WorkflowService,
    private wfStatusService: WorkflowStatusService,
    private store: Store<WorkflowState>,
    private workflowsCacheService: WorkflowsCacheService,
    private caseFieldLinkService: CaseFieldLinkService,
    private visualPlanService: WorkflowVisualPlanService,
    private errorHandlerService: ErrorHandlerService,
    private schemaValidation: SchemaValidatorsHelper,
    private postactionService: PostactionService
  ) {
    super(store);
  }

  // ===== WORKFLOW related effects

  GetWorkflows: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetWorkflows>(WorkflowActionTypes.GetWorkflows),
      switchMap(async (action) => {
        try {
          const paging = action.payload?.paging || { skip: 0, take: 100 };
          const sorting = action.payload?.sorting || null;
          const result = await this.wfService.search(action.payload.tenantId, paging, sorting);
          return new GetWorkflowsSuccess({ result: result.items });
        } catch (error) {
          return new GetWorkflowsFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  GetStatusList: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetStatusList>(WorkflowActionTypes.GetStatusList),
      switchMap(async (action) => {
        try {
          const paging = action.payload?.paging || { skip: 0, take: 999 };
          const result = await this.wfStatusService.search(action.payload.tenantId, { paging });
          let statusMap = {};
          result.items.forEach((status) => {
            statusMap[status.id] = { ...status };
          });
          return new GetStatusListSuccess({ result: statusMap });
        } catch (error) {
          return new GetStatusListFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  GetWorkflowById: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetWorkflowById>(WorkflowActionTypes.GetWorkflowById),
      switchMap(async (action) => {
        try {
          const result = await this.workflowsCacheService.get(action.payload.id, 60, async () => {
            if (action.payload.isIncomplete) {
              return (await this.wfService.getIncompleteWorkflow(action.payload.id, action.payload.tenantId))?.workflowSchema;
            }
            return await this.wfService.get(action.payload.id, action.payload.tenantId);
          });
          const mapppedWorkflow = mapWorkflowToFrontend(result);
          return new GetWorkflowSuccess({ result: mapppedWorkflow });
        } catch (error) {
          return new GetWorkflowFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  // ===== WORKFLOW-STATE related effects

  GetWorkflowStateById: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetWorkflowStateById>(WorkflowActionTypes.GetWorkflowStateById),
      switchMap(async (action) => {
        try {
          const query: GetWorkflowStateQuery = {
            id: action.payload.id,
            tenant: this.tenant,
            schemaId: action.payload.schemaId
          };
          const result = await this.wfStateService.get(query);
          const wfStateUi: WorkflowStateUI = this.mapUiPropsToWfState(result);
          return new GetWorkflowStateSuccess({ result: wfStateUi });
        } catch (error) {
          return new GetWorkflowStateFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  GetWorkflowStateCasesList: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetWorkflowStateCasesList>(WorkflowActionTypes.GetWorkflowStateCasesList),
      switchMap(async (action) => {
        try {
          const result = await this.dynamicEntityService.search(
            AreaTypeEnum.case,
            action.payload.tenantId,
            action.payload.caseSchemaId,
            action.payload.paging || null,
            action.payload.sorting || null,
            action.payload.filter || null,
            action.payload.aggregates || null
          );
          return new GetWorkflowStateCasesListSuccess({ result });
        } catch (error) {
          console.log(error);
          return new GetWorkflowStateCasesListFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  UpdateWorkflowStateStatus: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<UpdateWorkflowStateStatus>(WorkflowActionTypes.UpdateWorkflowStateStatus),
      exhaustMap(async (action) => {
        try {
          const operation: Operation = await this.wfStateService.updateStatus(action.payload.data);
          if (operation.status.toString() === 'Success') {
            this.store.dispatch(
              new GetFiredPostactions({
                operationId: operation.operationId
              })
            );
            return new UpdateWorkflowStateStatusSuccess({ data: action.payload.data });
          }
        } catch (error) {
          return new UpdateWorkflowStateStatusFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  UpdateWorkflowStateStatusSuccess: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<UpdateWorkflowStateStatusSuccess>(WorkflowActionTypes.UpdateWorkflowStateStatusSuccess),
      exhaustMap(async (action) => {
        try {
          this.store.dispatch(new RefreshWorkflowStatesList({ isRefresh: true }));
          return new GetWorkflowStateById({ id: action.payload.data.workflowStateId, schemaId: action.payload.data.schemaId });
        } catch (error) {
          return new UpdateWorkflowStateStatusFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  CreateWorkflowStateStep: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<CreateWorkflowStateStep>(WorkflowActionTypes.CreateWorkflowStateStep),
      exhaustMap(async (action) => {
        try {
          const operation: Operation = await this.wfStateService.addStep(action.payload.data);
          if (operation.status.toString() === 'Success') {
            this.store.dispatch(
              new GetFiredPostactions({
                operationId: operation.operationId
              })
            );
            return new CreateUpdateWorkflowStateStepSuccess({ data: action.payload.data });
          }
        } catch (error) {
          return new CreateUpdateWorkflowStateStepFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  UpdateWorkflowStateStep: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<UpdateWorkflowStateStep>(WorkflowActionTypes.UpdateWorkflowStateStep),
      exhaustMap(async (action) => {
        try {
          const operation: Operation = await this.wfStateService.updateStep(action.payload.data);
          if (operation.status.toString() === 'Success') {
            this.store.dispatch(
              new GetFiredPostactions({
                operationId: operation.operationId
              })
            );
            return new CreateUpdateWorkflowStateStepSuccess({ data: action.payload.data });
          }
        } catch (error) {
          return new CreateUpdateWorkflowStateStepFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  CreateUpdateWorkflowStateStepSuccess: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<CreateUpdateWorkflowStateStepSuccess>(WorkflowActionTypes.CreateUpdateWorkflowStateStepSuccess),
      exhaustMap(async (action) => {
        try {
          this.store.dispatch(new RefreshWorkflowStatesList({ isRefresh: true }));
          return new GetWorkflowStateById({ id: action.payload.data.workflowStateId, schemaId: action.payload.data.schemaId });
        } catch (error) {
          return new UpdateWorkflowStateStatusFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  UpdateDynamicEntityVisualSettings: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<UpdateDynamicEntityVisualSettings>(WorkflowActionTypes.UpdateDynamicEntityVisualSettings),
      exhaustMap(async (action) => {
        try {
          const operation: Operation = await this.dynamicEntityService.updateVisualSettings(action.payload.data);
          if (operation.status.toString() === 'Success') {
            return new UpdateDynamicEntityVisualSettingsSuccess({});
          }
        } catch (error) {
          return new UpdateDynamicEntityVisualSettingsFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  RemoveWorkflowStateStep: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<RemoveWorkflowStateStep>(WorkflowActionTypes.RemoveWorkflowStateStep),
      exhaustMap(async (action) => {
        try {
          const operation: Operation = await this.wfStateService.deleteStep(action.payload.data);
          if (operation.status.toString() === 'Success') {
            this.store.dispatch(
              new GetFiredPostactions({
                operationId: operation.operationId
              })
            );
            return new RemoveWorkflowStateStepSuccess({ data: action.payload.data });
          }
        } catch (error) {
          return new RemoveWorkflowStateStepFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  RemoveWorkflowStateStepSuccess: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<RemoveWorkflowStateStepSuccess>(WorkflowActionTypes.RemoveWorkflowStateStepSuccess),
      exhaustMap(async (action) => {
        try {
          return new GetWorkflowStateById({ id: action.payload.data.workflowStateId, schemaId: action.payload.data.schemaId });
        } catch (error) {
          return new UpdateWorkflowStateStatusFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  CreateWorkflowStates: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<CreateWorkflowStates>(WorkflowActionTypes.CreateWorkflowStates),
      exhaustMap(async (action) => {
        try {
          const cmd: CreateWorkflowStateCommand = {
            tenantId: action.payload.tenantId,
            schemaId: action.payload.schemaId,
            case: action.payload.case
          };
          let numberOfItems = action.payload.numberOfItems || 1;
          const createRequests: Promise<Operation>[] = [];
          for (let index = 1; index <= numberOfItems; index++) {
            createRequests.push(this.wfStateService.create(cmd));
          }
          const results = await Promise.all(createRequests);
          const errorResult = results.find((result) => OperationStatus[result.status?.toString()] !== OperationStatus.Success);
          if (!errorResult) {
            if (results.length === 1) {
              this.store.dispatch(
                new GetFiredPostactions({
                  operationId: results[0].operationId
                })
              );

              return new CreateWorkflowStatesSuccess({ data: action.payload, workflowStateId: results[0]?.targetId });
            }
            return new CreateWorkflowStatesSuccess({ data: action.payload });
          }
        } catch (error) {
          return new CreateWorkflowStatesFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  CreateWorkflowStatesSuccess: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<CreateWorkflowStatesSuccess>(WorkflowActionTypes.CreateWorkflowStatesSuccess),
      exhaustMap(async (action) => {
        try {
          return new RefreshWorkflowStatesList({ isRefresh: true });
          // the above action is doing the same job
          // return new GetWorkflowStateCasesList({
          //   tenantId: action.payload.data.tenantId,
          //   caseSchemaId: action.payload.data.case.schemaId
          // });
        } catch (error) {
          return new GetWorkflowStateCasesListFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  UpdateWorkflowStateCase: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<UpdateWorkflowStateCase>(WorkflowActionTypes.UpdateWorkflowStateCase),
      exhaustMap(async (action) => {
        try {
          const operation: Operation = await this.wfStateService.updateCase(action.payload.data);

          if (operation.status.toString() === 'Success' && action.payload.workflowStateId) {
            this.store.dispatch(
              new GetFiredPostactions({
                operationId: operation.operationId
              })
            );
            this.store.dispatch(new RefreshWorkflowStatesList({ isRefresh: true }));
            return new UpdateWorkflowStateCaseSuccess({ data: action.payload.data, workflowStateId: action.payload.workflowStateId });
          }
        } catch (error) {
          return new UpdateWorkflowStateCaseFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  UpdateWorkflowStateCaseSuccess: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<UpdateWorkflowStateCaseSuccess>(WorkflowActionTypes.UpdateWorkflowStateCaseSuccess),
      exhaustMap(async (action) => {
        try {
          this.store.dispatch(new RefreshWorkflowStatesList({ isRefresh: true }));
          return new GetWorkflowStateById({ id: action.payload.workflowStateId, schemaId: action.payload.data.schemaId });
        } catch (error) {
          return new UpdateWorkflowStateCaseFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  UpdateWorkflowStateCaseStepsUi: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<UpdateWorkflowStateCaseStepsUi>(WorkflowActionTypes.UpdateWorkflowStateCaseStepsUi),
      exhaustMap(async (action) => {
        try {
          const operation: Operation = await this.wfStateService.updateStepsUi(action.payload.data);
          if (operation.status.toString() === 'Success') {
            return new UpdateWorkflowStateCaseStepsUiSuccess({ data: action.payload.data });
          }
        } catch (error) {
          return new UpdateWorkflowStateCaseStepsUiFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  UpdateWorkflowStateCaseStepsUiSuccess: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<UpdateWorkflowStateCaseStepsUiSuccess>(WorkflowActionTypes.UpdateWorkflowStateCaseStepsUiSuccess),
      exhaustMap(async (action) => {
        try {
          return new GetWorkflowStateById({ id: action.payload.data?.stateId, schemaId: action.payload.data.schemaId });
        } catch (error) {
          return new UpdateWorkflowStateCaseStepsUiFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  GetActiveFieldLinkOverrides: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetActiveFieldLinkOverrides>(WorkflowActionTypes.GetActiveFieldLinkOverrides),
      switchMap(async (action) => {
        try {
          const data = await this.caseFieldLinkService.getActiveOverrides(
            action.payload.tenantId,
            action.payload.workflowId,
            action.payload.workflowStateId
          );
          if (data) {
            return new GetActiveFieldLinkOverridesSuccess({ data });
          }
        } catch (error) {
          return new GetActiveFieldLinkOverridesFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  GetWorkflowVisualPlanList: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetWorkflowVisualPlanList>(WorkflowActionTypes.GetWorkflowVisualPlanList),
      switchMap(async (action) => {
        try {
          const data = await this.visualPlanService.getByWorkflow(action.payload.tenantId, action.payload.workflowId);
          if (data) {
            return new GetWorkflowVisualPlanListSuccess({ data });
          }
        } catch (error) {
          return new GetWorkflowVisualPlanListFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  CreateWorkflowVisualPlan: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<CreateWorkflowVisualPlan>(WorkflowActionTypes.CreateWorkflowVisualPlan),
      exhaustMap(async (action) => {
        try {
          const operation = await this.visualPlanService.create(action.payload.data);
          if (operation.status.toString() === 'Success') {
            return new CreateWorkflowVisualPlanSuccess({ visualId: operation.targetId });
          }
        } catch (error) {
          return new CreateWorkflowVisualPlanFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  UpdateWorkflowVisualPlan: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<UpdateWorkflowVisualPlan>(WorkflowActionTypes.UpdateWorkflowVisualPlan),
      exhaustMap(async (action) => {
        try {
          const operation = await this.visualPlanService.update(action.payload.data);
          if (operation.status.toString() === 'Success') {
            return new UpdateWorkflowVisualPlanSuccess({ visualId: operation.targetId });
          }
        } catch (error) {
          return new UpdateWorkflowVisualPlanFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  DeleteWorkflowVisualPlan: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<DeleteWorkflowVisualPlan>(WorkflowActionTypes.DeleteWorkflowVisualPlan),
      exhaustMap(async (action) => {
        try {
          const operation = await this.visualPlanService.delete(
            action.payload.workflowId,
            action.payload.visualConfigId,
            action.payload.tenantId
          );
          if (operation.status.toString() === 'Success') {
            return new DeleteWorkflowVisualPlanSuccess({ visualId: operation.targetId });
          }
        } catch (error) {
          return new DeleteWorkflowVisualPlanFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  GetWorkflowVisualPlanMappedUnits: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetWorkflowVisualPlanMappedUnits>(WorkflowActionTypes.GetWorkflowVisualPlanMappedUnits),
      switchMap(async (action) => {
        try {
          const data = await this.visualPlanService.getMappedUnits(
            action.payload.tenantId,
            action.payload.workflowId,
            action.payload.visualConfigId
          );
          if (data) {
            return new GetWorkflowVisualPlanMappedUnitsSuccess({ items: data });
          }
        } catch (error) {
          return new GetWorkflowVisualPlanMappedUnitsFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  /**
   * called when:
   * case is created,
   * case is updated,
   * status is updated,
   * step is added,
   * step is updated/resolved,
   * step is deleted
   */

  GetFiredPostactions: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetFiredPostactions>(WorkflowActionTypes.GetFiredPostactions),
      switchMap(async (action) => {
        try {
          const runPostactions = await this.postactionService.getFiredPostactions(action.payload.operationId);
          if (runPostactions) {
            runPostactions.forEach((item) => {
              item.parametersUi = JSON.parse(item.parameters);
            });
            return new GetFiredPostactionsSuccess({ data: runPostactions });
          }
        } catch (error) {
          return new GetFiredPostactionsFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  private mapUiPropsToWfState(state: WorkflowStateDto): WorkflowStateUI {
    let caseSteps = [];
    let stepEntityNumber = 0;
    if (!state.visualElements) {
      state.visualElements = [];
    }
    let orphanedVisualsToRemove = state.visualElements.map((item) => item.id);
    state.steps.forEach((step) => {
      // if the backend does not return numberOfInstances, it means you can add it once
      if (!step.numberOfInstances) {
        step.numberOfInstances = 1;
      }
    });

    state.fields.forEach((field) => {
      let stepEntity = state.steps?.find((step) => {
        return step.refName === field.refName;
      });
      let entities: CaseStepEntityUi[] = field.entities.map((item, index) => {
        stepEntityNumber++;
        orphanedVisualsToRemove = orphanedVisualsToRemove.filter((id) => id !== item.visualElementId);
        const currentElement = state.visualElements.find((element) => element.id === item.visualElementId);
        return {
          ...item,
          name: stepEntity?.name,
          indexInGroup: index,
          position: currentElement?.index || 0,
          refName: field.refName,
          schemaId: field.schemaId,
          title: item.stepDynamicEntities.find((de) => de.title)?.title || null,
          stepEntityHasResolutions: stepEntity?.resolutions?.length ? true : false
        };
      });
      entities = entities.filter((e) => e.rights.canView);
      caseSteps.push(...entities);
    });

    // actualize the visualElements, normalize the order
    state.visualElements = state.visualElements.filter((item) => {
      return !orphanedVisualsToRemove.includes(item.id);
    });
    state.visualElements.forEach((x, idx) => {
      if (x.index !== idx) {
        x.index = idx;
      }
    });

    let uiModel: WorkflowStateUI = {
      ...state,
      caseSteps: sortBy(caseSteps, [(x) => x.position]),
      numberOfCaseSteps: stepEntityNumber
    };
    return uiModel;
  }
}

/**
 * flatten workkflow actions (we are getting parameters prop which is not there in frontend contracts)
 */
function mapWorkflowToFrontend(workflowDto: WorkflowDto): WorkflowDto {
  workflowDto.onCreateEvents = flattenParametersProperty(workflowDto.onCreateEvents);
  workflowDto.onDeleteEvents = flattenParametersProperty(workflowDto.onDeleteEvents);
  workflowDto.onUpdateCase = flattenParametersProperty(workflowDto.onUpdateCase);
  workflowDto.statusEvents = flattenParametersProperty(workflowDto.statusEvents);
  workflowDto.onStepAddedEvents = flattenParametersProperty(workflowDto.onStepAddedEvents);
  workflowDto.onAutoIncrementEvents = flattenParametersProperty(workflowDto.onAutoIncrementEvents);
  return workflowDto;
}
function flattenParametersProperty(actions: BaseActionType[]): BaseActionType[] {
  return actions.map((action: BaseActionDto) => {
    let newAction = Object.assign({}, action, action.parameters);
    delete newAction.parameters;
    return newAction;
  });
}
