/**
 * global
 */
import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';

import { APP_CLIENT_ID, CreateStatusCommand, OperationStatus, WorkflowStatusService } from '@wfm/service-layer';

/**
 * local
 */
import { UpdateWorkflowStatusCommand } from '@wfm/service-layer/models/workflowStatus';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { Test, TestResult } from '@wfm/tests/models';
import { TestUiPageComponent } from '@wfm/tests/modules/test-ui/test-ui-page/test-ui-page.component';
import { WorkflowHelper } from '../helpers/workflowHelper';

@Component({
  selector: 'workflow-status-tests',
  template: '<app-test-ui-page #test></app-test-ui-page>'
})
export class WorkflowStatusTestsComponent extends TenantComponent implements AfterViewInit {
  @ViewChild('test') testsComp: TestUiPageComponent;

  title = 'Workflow status tests';

  constructor(
    @Inject(APP_CLIENT_ID) readonly appId: string,
    private statusService: WorkflowStatusService,
    store: Store<ApplicationState>,
    private wfHelper: WorkflowHelper
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
        name: 'Update',
        function: async () => await this.update()
      },
      <Test>{
        name: 'Delete',
        function: async () => await this.delete()
      }
    ]);
  }

  private async create(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const statusCmd: CreateStatusCommand = {
        name: 'Open',
        position: 0,
        tenantId: this.tenant
      };
      const statusOperationResult = await this.wfHelper.createStatusWithUniqueName(statusCmd);
      const operationStatusEnum: OperationStatus = OperationStatus[statusOperationResult.status.toString()];

      if (operationStatusEnum === OperationStatus.Success) {
        isSuccess = true;
        await this.statusService.delete(this.tenant, statusOperationResult.targetId);
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
      const statusCmd: CreateStatusCommand = {
        name: 'Open',
        position: 0,
        tenantId: this.tenant,
        configuration: {
          label: 'Button lable',
          color: 'red'
        }
      };

      const statusOperationResult = await this.wfHelper.createStatusWithUniqueName(statusCmd);
      const status = await this.statusService.get(this.tenant, statusOperationResult.targetId);
      if (status.name.includes('Open') && status.configuration) {
        isSuccess = true;
        await this.statusService.delete(this.tenant, statusOperationResult.targetId);
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
      const statusCmd: CreateStatusCommand = {
        name: 'Open',
        position: 0,
        tenantId: this.tenant
      };

      const statusOperationResult = await this.wfHelper.createStatusWithUniqueName(statusCmd);
      const deleteOperation = await this.statusService.delete(this.tenant, statusOperationResult.targetId);
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
      const statusCmd: CreateStatusCommand = {
        name: 'Open',
        position: 0,
        tenantId: this.tenant
      };

      const statusOperationResult = await this.wfHelper.createStatusWithUniqueName(statusCmd);

      const updateCmd: UpdateWorkflowStatusCommand = {
        name: 'updatedOpen',
        position: 0,
        tenantId: this.tenant
      };

      const updateOperation = await this.statusService.update(statusOperationResult.targetId, updateCmd);
      const operationStatusEnum: OperationStatus = OperationStatus[updateOperation.status.toString()];

      if (operationStatusEnum === OperationStatus.Success) {
        isSuccess = true;
        await this.statusService.delete(this.tenant, statusOperationResult.targetId);
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Update';

      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }
}
