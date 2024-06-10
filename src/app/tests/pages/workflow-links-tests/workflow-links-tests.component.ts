/**
 * global
 */
import { AfterViewInit, Component, Inject, Injector, ViewChild } from '@angular/core';

import { APP_CLIENT_ID } from '@wfm/service-layer';

import { Test, TestResult } from '@wfm/tests/models';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { Store } from '@ngrx/store';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { TestUiPageComponent } from '@wfm/tests/modules/test-ui/test-ui-page/test-ui-page.component';
import { ITestService, TestContext } from '../app-tests/create-app-test.service';
import {
  CreateWorkflowFieldLinkTestService,
  CreateWorkflowProcessStepLinkTestService,
  DeleteWorkflowFieldLinkTestService,
  DeleteWorkflowProcessStepLinkTestService,
  GetWorkflowFieldLinkTestService,
  GetWorkflowProcessStepLinkTestService,
  GetWorkflowProcessStepLinkWithParentTestService
} from './workflow-links-tests.service';

@Component({
  selector: 'workflow-links-tests',
  template: '<app-test-ui-page #test></app-test-ui-page>'
})
export class WorkflowLinksTestsComponent extends TenantComponent implements AfterViewInit {
  @ViewChild('test') testsComp: TestUiPageComponent;

  title = 'Workflow link tests';

  constructor(@Inject(APP_CLIENT_ID) readonly appId: string, store: Store<ApplicationState>, private injector: Injector) {
    super(store);
  }

  ngAfterViewInit(): void {
    this.testsComp.init(this.title, [
      <Test>{
        name: 'Create - case field link',
        function: async () => await this.createFieldLink()
      },
      <Test>{
        name: 'Get - case field link',
        function: async () => await this.getFieldLink()
      },
      <Test>{
        name: 'Delete - case field link',
        function: async () => await this.deleteFieldLink()
      },
      <Test>{
        name: 'Create - step link',
        function: async () => await this.createStepLink()
      },
      <Test>{
        name: 'Get - step link',
        function: async () => await this.getStepLink()
      },
      <Test>{
        name: 'Get - step link with parent',
        function: async () => await this.getStepLinkWithParent()
      },
      <Test>{
        name: 'Delete - step link',
        function: async () => await this.deleteStepLink()
      }
    ]);
  }

  private async createFieldLink(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(CreateWorkflowFieldLinkTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async createStepLink(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(CreateWorkflowProcessStepLinkTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async getFieldLink(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(GetWorkflowFieldLinkTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async deleteFieldLink(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(DeleteWorkflowFieldLinkTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async getStepLink(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(GetWorkflowProcessStepLinkTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async getStepLinkWithParent(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(GetWorkflowProcessStepLinkWithParentTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async deleteStepLink(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(DeleteWorkflowProcessStepLinkTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }
}
