/**
 * global
 */
import { Injectable } from '@angular/core';

import { Store, Action } from '@ngrx/store';
import { ofType, Actions, createEffect } from '@ngrx/effects';

import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { KeyValue } from '@angular/common';

/**
 * project
 */

/**
 * local
 */
import { TenantComponent } from '../../shared/tenant.component';
import {
  AddOrchestratorAction,
  AddOrchestratorActionFail,
  AddOrchestratorActionSuccess,
  CreateConnector,
  CreateConnectorFail,
  CreateConnectorSuccess,
  CreateOrchestrator,
  CreateOrchestratorFail,
  CreateOrchestratorSuccess,
  DeleteConnector,
  DeleteConnectorFail,
  DeleteConnectorSuccess,
  DeleteOrchestrator,
  DeleteOrchestratorAction,
  DeleteOrchestratorActionFail,
  DeleteOrchestratorActionSuccess,
  DeleteOrchestratorFail,
  DeleteOrchestratorSuccess,
  GetAllAccessibleWorkflows,
  GetAllAccessibleWorkflowsFail,
  GetAllAccessibleWorkflowsSuccess,
  GetAllConnectors,
  GetAllConnectorsFail,
  GetAllConnectorsSuccess,
  GetOrchestratorActionEventTypes,
  GetOrchestratorActionEventTypesFailure,
  GetOrchestratorActionEventTypesSuccess,
  GetOrchestratorById,
  GetOrchestratorByIdFail,
  GetOrchestratorByIdSuccess,
  GetOrchestrators,
  GetOrchestratorsFail,
  GetOrchestratorsSuccess,
  OrchestratorActionTypes,
  OrchestratorBulkUpdateActions,
  OrchestratorBulkUpdateActionsFail,
  OrchestratorBulkUpdateActionsSuccess,
  UpdateOrchestrator,
  UpdateOrchestratorAction,
  UpdateOrchestratorActionFail,
  UpdateOrchestratorActionSuccess,
  UpdateOrchestratorFail,
  UpdateOrchestratorSuccess
} from './orchestrator.actions';
import { OrchestratorState } from './orchestrator.reducer';
import { OrchestratorsService } from '@wfm/service-layer/services/orchestrators.service';
import { Operation } from '@wfm/service-layer';
import { OrchestratorActionEventTypesEnum, OrchestratorEntity } from '@wfm/service-layer/models/orchestrator';
import { WorkflowsConnectorService } from '@wfm/service-layer/services/workflows-connector.service';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';

@Injectable()
export class OrchestratorEffects extends TenantComponent {
  constructor(
    private actions$: Actions,

    private store: Store<OrchestratorState>,
    private orchestratorsService: OrchestratorsService,
    private connectorService: WorkflowsConnectorService,
    private errorHandlerService: ErrorHandlerService
  ) {
    super(store);
  }

  GetOrchestrators: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetOrchestrators>(OrchestratorActionTypes.GetOrchestrators),
      switchMap(async (action) => {
        try {
          const orchestrators = await this.orchestratorsService.getAll();
          return new GetOrchestratorsSuccess({ result: orchestrators });
        } catch (error) {
          return new GetOrchestratorsFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  CreateOrchestrator: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<CreateOrchestrator>(OrchestratorActionTypes.CreateOrchestrator),
      switchMap(async (action) => {
        try {
          const result: Operation = await this.orchestratorsService.create(action.payload.data);
          if (result.status?.toString()?.toLowerCase() === 'success')
            return new CreateOrchestratorSuccess(`Orchestrator Created Successfully-${result.targetId}`);
        } catch (error) {
          return new CreateOrchestratorFail(this.errorHandlerService.getAndShowErrorMsg(error));
        }
      })
    )
  );

  UpdateOrchestrator: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<UpdateOrchestrator>(OrchestratorActionTypes.UpdateOrchestrator),
      switchMap(async (action) => {
        try {
          const result: Operation = await this.orchestratorsService.update(action.payload.data);
          if (result.status?.toString()?.toLowerCase() === 'success')
            return new UpdateOrchestratorSuccess('Orchestrator Updated Successfully');
        } catch (error) {
          return new UpdateOrchestratorFail(this.errorHandlerService.getAndShowErrorMsg(error));
        }
      })
    )
  );

  DeleteOrchestrator: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<DeleteOrchestrator>(OrchestratorActionTypes.DeleteOrchestrator),
      switchMap(async (action) => {
        try {
          const result: Operation = await this.orchestratorsService.delete(action.payload.id);
          if (result.status?.toString()?.toLowerCase() === 'success')
            return new DeleteOrchestratorSuccess('Orchestrator Deleted Successfully');
        } catch (error) {
          return new DeleteOrchestratorFail(this.errorHandlerService.getAndShowErrorMsg(error));
        }
      })
    )
  );

  GetOrchestratorById: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetOrchestratorById>(OrchestratorActionTypes.GetOrchestratorById),
      switchMap(async (action) => {
        try {
          const result: OrchestratorEntity = await this.orchestratorsService.get(action.payload.id);
          if (result) return new GetOrchestratorByIdSuccess(result);
        } catch (error) {
          return new GetOrchestratorByIdFail(this.errorHandlerService.getAndShowErrorMsg(error));
        }
      })
    )
  );

  GetOrchestratorActionEventTypes: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetOrchestratorActionEventTypes>(OrchestratorActionTypes.GetOrchestratorActionEventTypes),
      switchMap(async () => {
        try {
          const result: KeyValue<OrchestratorActionEventTypesEnum, string>[] =
            await this.orchestratorsService.getOrchestratorActionEventTypes();
          if (result) return new GetOrchestratorActionEventTypesSuccess(result);
        } catch (error) {
          return new GetOrchestratorActionEventTypesFailure(this.errorHandlerService.getAndShowErrorMsg(error));
        }
      })
    )
  );

  OrchestratorBulkUpdateAction: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<OrchestratorBulkUpdateActions>(OrchestratorActionTypes.OrchestratorBulkUpdateActions),
      switchMap(async (action) => {
        try {
          const result: Operation = await this.orchestratorsService.bulkUpdateActions(action.payload.orchestratorId, action.payload.data);
          if (result.status?.toString()?.toLowerCase() === 'success')
            return new OrchestratorBulkUpdateActionsSuccess('Actions Updated Successfully');
        } catch (error) {
          return new OrchestratorBulkUpdateActionsFail(this.errorHandlerService.getAndShowErrorMsg(error));
        }
      })
    )
  );

  AddOrchestratorAction: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<AddOrchestratorAction>(OrchestratorActionTypes.AddOrchestratorAction),
      switchMap(async (action) => {
        try {
          const result: Operation = await this.orchestratorsService.addAction(action.payload.orchestratorId, action.payload.data);
          if (result.status?.toString()?.toLowerCase() === 'success')
            return new AddOrchestratorActionSuccess('Action Created Successfully');
        } catch (error) {
          return new AddOrchestratorActionFail(this.errorHandlerService.getAndShowErrorMsg(error));
        }
      })
    )
  );

  UpdateOrchestratorAction: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<UpdateOrchestratorAction>(OrchestratorActionTypes.UpdateOrchestratorAction),
      switchMap(async (action) => {
        try {
          const result: Operation = await this.orchestratorsService.updateAction(action.payload.data);
          if (result.status?.toString()?.toLowerCase() === 'success')
            return new UpdateOrchestratorActionSuccess('Action Updated Successfully');
        } catch (error) {
          return new UpdateOrchestratorActionFail(this.errorHandlerService.getAndShowErrorMsg(error));
        }
      })
    )
  );

  DeleteOrchestratorAction: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<DeleteOrchestratorAction>(OrchestratorActionTypes.DeleteOrchestratorAction),
      switchMap(async (action) => {
        try {
          const result: Operation = await this.orchestratorsService.deleteAction(action.payload.actionId);
          if (result.status?.toString()?.toLowerCase() === 'success')
            return new DeleteOrchestratorActionSuccess('Action Deleted Successfully');
        } catch (error) {
          return new DeleteOrchestratorActionFail(this.errorHandlerService.getAndShowErrorMsg(error));
        }
      })
    )
  );

  // Connector

  GetAllConnectors: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetAllConnectors>(OrchestratorActionTypes.GetAllConnectors),
      switchMap(async (action) => {
        try {
          const connectors = await this.connectorService.getAll();
          return new GetAllConnectorsSuccess({ result: connectors });
        } catch (error) {
          return new GetAllConnectorsFail(this.errorHandlerService.getAndShowErrorMsg(error));
        }
      })
    )
  );

  DeleteConnector: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<DeleteConnector>(OrchestratorActionTypes.DeleteConnector),
      switchMap(async (action) => {
        try {
          const result: Operation = await this.connectorService.delete(action.payload.id);
          if (result.status?.toString()?.toLowerCase() === 'success') return new DeleteConnectorSuccess('Connector Deleted Successfully');
        } catch (error) {
          return new DeleteConnectorFail(this.errorHandlerService.getAndShowErrorMsg(error));
        }
      })
    )
  );

  CreateConnector: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<CreateConnector>(OrchestratorActionTypes.CreateConnector),
      switchMap(async (action) => {
        try {
          const result: Operation = await this.connectorService.create(action.payload.data);
          if (result.status?.toString()?.toLowerCase() === 'success') return new CreateConnectorSuccess(`Connector Created Successfully`);
        } catch (error) {
          return new CreateConnectorFail(this.errorHandlerService.getAndShowErrorMsg(error));
        }
      })
    )
  );

  GetAllAccessibleWorkflows: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetAllAccessibleWorkflows>(OrchestratorActionTypes.GetAllAccessibleWorkflows),
      switchMap(async (action) => {
        try {
          const workflows = await this.connectorService.getGroupedTenantWorkflows();
          return new GetAllAccessibleWorkflowsSuccess({ result: workflows });
        } catch (error) {
          return new GetAllAccessibleWorkflowsFail(this.errorHandlerService.getAndShowErrorMsg(error));
        }
      })
    )
  );
}
