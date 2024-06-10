/**
 * global
 */
import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';

import {
  APP_CLIENT_ID,
  CreateWorkflowCommand,
  AreaTypeEnum,
  WorkflowResolutionDto,
  WorkflowService,
  OperationStatus,
  UpdateWorkflowCommand,
  GetWorkflowByRawDataQuery
} from '@wfm/service-layer';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { Test, TestResult } from '@wfm/tests/models';
import { TestUiPageComponent } from '@wfm/tests/modules/test-ui/test-ui-page/test-ui-page.component';

/**
 * local
 */
import { SchemaHelper } from '../helpers/schemaHelper';
import { StatusHelper } from '../helpers/statusHelper';

@Component({
  selector: 'workflow-tests',
  template: '<app-test-ui-page #test></app-test-ui-page>'
})
export class WorkflowTestsComponent extends TenantComponent implements AfterViewInit {
  @ViewChild('test') testsComp: TestUiPageComponent;

  title = 'Workflow tests';

  resolutions: WorkflowResolutionDto[] = [
    {
      name: 'Success'
    },
    {
      name: 'Fail'
    }
  ];

  constructor(
    @Inject(APP_CLIENT_ID) readonly appId: string,
    private workflowService: WorkflowService,
    private schemaHelper: SchemaHelper,
    private statusHelper: StatusHelper,
    store: Store<ApplicationState>
  ) {
    super(store);
  }

  ngAfterViewInit(): void {
    this.testsComp.init(this.title, [
      <Test>{
        name: 'Create',
        function: async () => await this.create()
      },
      <Test>{
        name: 'Get',
        function: async () => await this.get()
      },
      <Test>{
        name: 'Get by raw data',
        function: async () => await this.getByRawData()
      },
      <Test>{
        name: 'Update',
        function: async () => await this.update()
      },
      <Test>{
        name: 'Delete',
        function: async () => await this.delete()
      },
      <Test>{
        name: 'Search',
        function: async () => await this.search()
      }
    ]);
  }

  private async delete(): Promise<TestResult> {
    let isSuccess = false;

    try {
      // ***
      // This test is demonstrating how to delete workflow schema
      // ***
      const caseSchema = await this.schemaHelper.createCaseSchema(this.tenant, 'someSchemaName', AreaTypeEnum.case, [], []);

      const open = await this.statusHelper.createStatus(this.tenant, 'Open', 0);

      const createCmd: CreateWorkflowCommand = {
        name: 'workflow-test-delete',
        tenantId: this.tenant,
        caseSchemaId: caseSchema.id,
        statuses: [open.id]
      };
      const createOperation = await this.workflowService.create(createCmd);
      const deleteOperation = await this.workflowService.delete(createOperation.targetId, this.tenant);

      const operationStatusEnum: OperationStatus = OperationStatus[deleteOperation.status.toString()];

      if (operationStatusEnum === OperationStatus.Success) {
        isSuccess = true;
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Delete';
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async update(): Promise<TestResult> {
    let isSuccess = false;

    try {
      // ***
      // This test is demonstrating how to update the workflow schema
      // ***
      const caseSchema = await this.schemaHelper.createCaseSchema(this.tenant, 'someSchemaName', AreaTypeEnum.case, [], []);

      const open = await this.statusHelper.createStatus(this.tenant, 'Open', 0);

      const createCmd: CreateWorkflowCommand = {
        name: 'workflow-test-delete',
        tenantId: this.tenant,
        caseSchemaId: caseSchema.id,
        statuses: [open.id]
      };
      const createOperation = await this.workflowService.create(createCmd);
      const createOperationStatusEnum: OperationStatus = OperationStatus[createOperation.status.toString()];

      if (createOperationStatusEnum === OperationStatus.Success) {
        const updateCmd: UpdateWorkflowCommand = {
          id: createOperation.targetId,
          name: 'updated-name',
          tenantId: this.tenant,
          caseSchemaId: caseSchema.id,
          statuses: [open.id]
        };
        const updateOperation = await this.workflowService.update(updateCmd);
        const updateOperationStatusEnum: OperationStatus = OperationStatus[updateOperation.status.toString()];

        if (updateOperationStatusEnum === OperationStatus.Success) {
          const workflow = await this.workflowService.get(updateOperation.targetId, this.tenant);

          if (workflow.name === updateCmd.name) {
            isSuccess = true;
            await this.workflowService.delete(updateOperation.targetId, this.tenant);
          }
        }
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Update';

      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async get(): Promise<TestResult> {
    let isSuccess = false;

    try {
      // ***
      // This test is demonstrating how to get workflow schema by id
      // ***
      const caseSchema = await this.schemaHelper.createCaseSchema(this.tenant, 'someSchemaName', AreaTypeEnum.case, [], []);

      const open = await this.statusHelper.createStatus(this.tenant, 'Open', 0);

      const cmd: CreateWorkflowCommand = {
        name: 'workflow-test-delete',
        tenantId: this.tenant,
        caseSchemaId: caseSchema.id,
        statuses: [open.id]
      };

      const operation = await this.workflowService.create(cmd);
      const operationStatusEnum: OperationStatus = OperationStatus[operation.status.toString()];

      if (operationStatusEnum === OperationStatus.Success) {
        const workflow = await this.workflowService.get(operation.targetId, this.tenant);

        if (workflow.name === cmd.name) {
          isSuccess = true;
          await this.workflowService.delete(operation.targetId, this.tenant);
        }
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Get';

      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async getByRawData(): Promise<TestResult> {
    let isSuccess = false;

    try {
      // ***
      // This test is demonstrating how to get workflow schema by rawData info. [FOR NOW IT RETURNS THE FIRST ONE]
      // ***
      const result = await this.workflowService.getByRawData(<GetWorkflowByRawDataQuery>{ tenantId: this.tenant });

      if (result) {
        isSuccess = true;
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Get by raw data';

      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async create(): Promise<TestResult> {
    let isSuccess = false;

    try {
      // ***
      // This test is demonstrating how to create workflow schema
      // ***
      const caseSchema = await this.schemaHelper.createCaseSchema(this.tenant, 'someSchemaName', AreaTypeEnum.case, [], []);

      const open = await this.statusHelper.createStatus(this.tenant, 'Open', 0);

      const cmd: CreateWorkflowCommand = {
        name: 'workflow-test-create',
        tenantId: this.tenant,
        caseSchemaId: caseSchema.id,
        statuses: [open.id]
      };
      const operation = await this.workflowService.create(cmd);
      const operationStatusEnum: OperationStatus = OperationStatus[operation.status.toString()];

      if (operationStatusEnum === OperationStatus.Success) {
        isSuccess = true;
        await this.workflowService.delete(operation.targetId, this.tenant);
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Create';

      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async search(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const operation = await this.workflowService.search(this.tenant, { skip: 0, take: 1000 });

      if (operation.items.length > 0) {
        isSuccess = true;
      }

      console.log(operation);
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Search';

      console.warn('search failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }
}
