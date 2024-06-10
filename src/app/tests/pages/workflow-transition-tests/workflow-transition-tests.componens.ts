/**
 * global
 */
import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';

import {
  APP_CLIENT_ID,
  AreaTypeEnum,
  CreateDynamicEntityDto,
  CreateWorkflowStateCommand,
  CreateWorkflowTransitionDto,
  GetWorkflowStateQuery,
  OperationStatus,
  SchemasService,
  UpdateStatusCommand,
  WorkflowService,
  WorkflowStateService,
  WorkflowTransitionService
} from '@wfm/service-layer';

/**
 * local
 */
import { SchemaHelper } from '../helpers/schemaHelper';
import { WorkflowHelper } from '../helpers/workflowHelper';
import { StatusHelper } from '../helpers/statusHelper';
import { Test, TestResult } from '@wfm/tests/models';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { Store } from '@ngrx/store';
import { ApplicationState } from '@wfm/store';
import { TestUiPageComponent } from '@wfm/tests/modules/test-ui/test-ui-page/test-ui-page.component';

@Component({
  selector: 'workflow-transition-tests',
  template: '<app-test-ui-page #test></app-test-ui-page>'
})
export class WorkflowTransitionTestsComponent extends TenantComponent implements AfterViewInit {
  @ViewChild('test') testsComp: TestUiPageComponent;

  title = 'Workflow transitions tests';

  constructor(
    @Inject(APP_CLIENT_ID) readonly appId: string,
    private schemaHelper: SchemaHelper,
    private workflowHelper: WorkflowHelper,
    private workflowService: WorkflowService,
    private schemaService: SchemasService,
    private statusHelper: StatusHelper,
    private stateService: WorkflowStateService,
    private transitionService: WorkflowTransitionService,
    store: Store<ApplicationState>
  ) {
    super(store);
  }

  ngAfterViewInit(): void {
    this.testsComp.init(this.title, [
      <Test>{
        name: 'Possible buttons - disabled and enabled',
        function: async () => await this.enableDisableButtons()
      },
      <Test>{
        name: 'Create',
        function: async () => await this.create()
      },
      <Test>{
        name: 'Get by id',
        function: async () => await this.get()
      },
      <Test>{
        name: 'Delete',
        function: async () => await this.delete()
      }
    ]);
  }

  private async enableDisableButtons(): Promise<TestResult> {
    let isSuccess = false;

    try {
      // Statuses
      const open = await this.statusHelper.createStatus(this.tenant, 'Open', 0);
      const inProgress = await this.statusHelper.createStatus(this.tenant, 'InProgress', 1);
      const done = await this.statusHelper.createStatus(this.tenant, 'Done', 2);
      const reopened = await this.statusHelper.createStatus(this.tenant, 'Reopened', 3);
      const finished = await this.statusHelper.createStatus(this.tenant, 'Finished', 4);

      // Schema & Workflow
      const caseSchema = await this.schemaHelper.createSchema(this.tenant, 'workflow-transition-schema-create', AreaTypeEnum.case, [], []);
      const workflow = await this.workflowHelper.createWorkflow('workflow-transition-workflow-create', this.tenant, caseSchema.id, [
        open.id,
        inProgress.id,
        done.id,
        reopened.id,
        finished.id
      ]);

      // Default status - Open
      await this.workflowService.setDefaultStatus(workflow.id, open.id, this.tenant);

      // From InProgress the only button that will be active will be Done. So we make transition to Done
      // Everything else should be disabled - Open, InProgress, Reopen, Finish

      const openToInProgressCmd: CreateWorkflowTransitionDto = {
        name: 'openToInProgress',
        statusId: open.id,
        toStatusId: inProgress.id,
        workflowId: workflow.id,
        tenantId: this.tenant
      };

      const inProgresstoDoneCmd: CreateWorkflowTransitionDto = {
        name: 'inProgressToDone',
        statusId: inProgress.id,
        toStatusId: done.id,
        workflowId: workflow.id,
        tenantId: this.tenant
      };

      const doneToFinishedCmd: CreateWorkflowTransitionDto = {
        name: 'doneToFinished',
        statusId: done.id,
        toStatusId: finished.id,
        workflowId: workflow.id,
        tenantId: this.tenant
      };

      await this.transitionService.create(openToInProgressCmd);
      await this.transitionService.create(inProgresstoDoneCmd);
      await this.transitionService.create(doneToFinishedCmd);

      // State

      const stateCmd: CreateWorkflowStateCommand = {
        tenantId: this.tenant,
        case: <CreateDynamicEntityDto>{
          appId: this.appId,
          areaType: AreaTypeEnum.case,
          fields: [],
          schemaId: caseSchema.id,
          tenantId: this.tenant
        },
        schemaId: workflow.id
      };
      const stateOperation = await this.stateService.create(stateCmd);
      const stateInitial = await this.stateService.get(<GetWorkflowStateQuery>{
        id: stateOperation.targetId,
        tenant: this.tenant,
        schemaId: workflow.id
      });

      if (stateInitial.statuses.filter((x) => x.enabled == true).length == 2) {
        isSuccess = false;
        console.log(stateInitial);
      } else {
        // (Automatic) Set the status to InProgress
        await this.stateService.updateStatus(<UpdateStatusCommand>{
          statusId: inProgress.id,
          tenantId: this.tenant,
          workflowStateId: stateOperation.targetId,
          schemaId: workflow.id
        });

        const state = await this.stateService.get(<GetWorkflowStateQuery>{
          id: stateOperation.targetId,
          tenant: this.tenant,
          schemaId: workflow.id
        });

        if (state.statuses.filter((x) => x.enabled == true).length == 1) {
          isSuccess = true;
          console.log(state);
        }
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Possible buttons disabled and enabled';
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async create(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const open = await this.statusHelper.createStatus(this.tenant, 'Open', 0);
      const inProgress = await this.statusHelper.createStatus(this.tenant, 'InProgress', 1);

      const caseSchema = await this.schemaHelper.createSchema(this.tenant, 'workflow-transition-schema-create', AreaTypeEnum.case, [], []);
      const workflow = await this.workflowHelper.createWorkflow('workflow-transition-workflow-delete', this.tenant, caseSchema.id, [
        open.id,
        inProgress.id
      ]);

      const cmd: CreateWorkflowTransitionDto = {
        name: 'transition77',
        statusId: open.id,
        toStatusId: inProgress.id,
        workflowId: workflow.id,
        expression: undefined,
        tenantId: this.tenant
      };
      const operation = await this.transitionService.create(cmd);
      const operationStatusEnum: OperationStatus = OperationStatus[operation.status.toString()];

      if (operationStatusEnum === OperationStatus.Success) {
        isSuccess = true;
        await this.transitionService.delete(this.tenant, operation.targetId);
        await this.workflowService.delete(workflow.id, this.tenant);
        await this.schemaService.deleteById(caseSchema.id, this.tenant, caseSchema.areaType);
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Create';

      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async get(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const open = await this.statusHelper.createStatus(this.tenant, 'Open', 0);
      const inProgress = await this.statusHelper.createStatus(this.tenant, 'InProgress', 1);

      const caseSchema = await this.schemaHelper.createSchema(this.tenant, 'workflow-transition-schema-ge', AreaTypeEnum.case, [], []);
      const workflow = await this.workflowHelper.createWorkflow('workflow-transition-workflow-delete', this.tenant, caseSchema.id, [
        open.id,
        inProgress.id
      ]);

      const cmd: CreateWorkflowTransitionDto = {
        name: 'transition77',
        statusId: open.id,
        toStatusId: inProgress.id,
        workflowId: workflow.id,
        expression: undefined,
        tenantId: this.tenant
      };
      const operation = await this.transitionService.create(cmd);
      const transition = await this.transitionService.get(this.tenant, operation.targetId);
      const operationStatusEnum: OperationStatus = OperationStatus[operation.status.toString()];

      if (operationStatusEnum === OperationStatus.Success && transition.name === cmd.name) {
        isSuccess = true;
        await this.transitionService.delete(this.tenant, operation.targetId);
        await this.workflowService.delete(workflow.id, this.tenant);
        await this.schemaService.deleteById(caseSchema.id, this.tenant, caseSchema.areaType);
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Get';

      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async delete(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const open = await this.statusHelper.createStatus(this.tenant, 'Open', 0);
      const inProgress = await this.statusHelper.createStatus(this.tenant, 'InProgress', 1);

      const caseSchema = await this.schemaHelper.createSchema(this.tenant, 'workflow-transition-schema-delete', AreaTypeEnum.case, [], []);
      const workflow = await this.workflowHelper.createWorkflow('workflow-transition-workflow-delete', this.tenant, caseSchema.id, [
        open.id,
        inProgress.id
      ]);

      const cmd: CreateWorkflowTransitionDto = {
        name: 'transition77',
        statusId: open.id,
        toStatusId: inProgress.id,
        workflowId: workflow.id,
        expression: undefined,
        tenantId: this.tenant
      };
      const createOperation = await this.transitionService.create(cmd);
      const deleteOperation = await this.transitionService.delete(this.tenant, createOperation.targetId);

      const operationStatusEnum: OperationStatus = OperationStatus[deleteOperation.status.toString()];

      if (operationStatusEnum === OperationStatus.Success) {
        isSuccess = true;
        await this.workflowService.delete(workflow.id, this.tenant);
        await this.schemaService.deleteById(caseSchema.id, this.tenant, caseSchema.areaType);
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Delete';

      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }
}
