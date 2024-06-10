/**
 * global
 */
import { AfterViewInit, Component, Inject, Injector, ViewChild } from '@angular/core';

import { ApplicationState } from '@wfm/store';
import { Store } from '@ngrx/store';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { TestUiPageComponent } from '@wfm/tests/modules/test-ui/test-ui-page/test-ui-page.component';
import { Test, TestResult } from '@wfm/tests/models';
import { ITestService, TestContext } from '../app-tests/create-app-test.service';
import {
  AutoAddStepsTestService,
  CaseFieldsPersistOnCaseStatusUpdate2TestService,
  CaseFieldsPersistOnCaseStatusUpdateTestService,
  DifferenceInWeighting2TestService,
  DifferenceInWeightingTestService,
  EmbeddedFieldMathOperationActionTestTestService,
  MathOperationActionTestTestService,
  MultipleStepsTestService,
  RawDataToCaseTestService,
  ResetStepToCaseTestSerivce,
  StepToCaseTestService,
  StepToRawDataTestService,
  UpdateCaseStatusBasedOnStepResolutionTestService,
  UpdateRawDataBasedOnCaseTestService
} from './workflow-action-events-tests.service';
import { UpdateNotificationTemplateTestService } from '../notification-templates-tests/notification-template-test.service';
import { APP_CLIENT_ID } from '@wfm/service-layer';

@Component({
  selector: 'workflow-action-events-tests',
  template: '<app-test-ui-page #test></app-test-ui-page>',
  styles: [':host { display: block; height: 100%; overflow-y: auto; }']
})
export class WorkflowActionEventsTestsComponent extends TenantComponent implements AfterViewInit {
  @ViewChild('test') testsComp: TestUiPageComponent;

  title: string = 'Workflow action events tests';

  constructor(@Inject(APP_CLIENT_ID) readonly appId: string, store: Store<ApplicationState>, private injector: Injector) {
    super(store);
  }

  ngAfterViewInit(): void {
    this.testsComp.init(this.title, [
      <Test>{
        name: 'Update case/state status based on step resolution',
        function: async () => await this.updateCaseStatusBasedOnStepResolution()
      },
      <Test>{
        name: 'Copy/Update raw data fields to case',
        function: async () => await this.rawDataToCase()
      },
      <Test>{
        name: 'Copy/Update step fields to case',
        function: async () => await this.stepToCase()
      },
      <Test>{
        name: 'Copy/Reset step fields to case',
        function: async () => await this.setResetStepDataToCase()
      },
      <Test>{
        name: 'Update raw data status based on case/state status',
        function: async () => await this.updateRawDataBasedOnCase()
      },
      <Test>{
        name: 'Automatically add steps, when other is resolved',
        function: async () => await this.autoAddSteps()
      },
      <Test>{
        name: 'Difference in weighting',
        function: async () => await this.differenceInWeighting()
      },
      <Test>{
        name: 'Difference in weighting math expression',
        function: async () => await this.differenceInWeighting2()
      },
      <Test>{
        name: 'Math expression with division to field value',
        function: async () => await this.mathOperationActionTest()
      },
      <Test>{
        name: 'Math expression with division to field value with embedded field',
        function: async () => await this.embeddedFieldMathExpression()
      },
      <Test>{
        name: 'Changes status when step is added',
        function: async () => await this.changeStatusWhenStepAdded()
      },
      <Test>{
        name: 'Testing multiple actions fired on same step resolution',
        function: async () => await this.testMultipleSteps()
      },
      <Test>{
        name: 'Update RawData field value based on Step field',
        function: async () => await this.stepToRawData()
      },
      <Test>{
        name: 'Case fields should not be reset on updatingCaseStatusOnStepResolution',
        function: async () => await this.caseFieldsPersistOnCaseStatusUpdate()
      },
      <Test>{
        name: 'Case fields should not be reset on UpdateStatusBasedOnStepAdded',
        function: async () => await this.caseFieldsPersistOnCaseStatusUpdate2()
      },
      <Test>{
        name: 'Update Case and RawData field value based on Step field',
        function: async () => await this.stepToRawDataAndCase()
      }
    ]);
  }

  private async changeStatusWhenStepAdded(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(UpdateNotificationTemplateTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async differenceInWeighting(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(DifferenceInWeightingTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async mathOperationActionTest(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(MathOperationActionTestTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async differenceInWeighting2(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(DifferenceInWeighting2TestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async updateCaseStatusBasedOnStepResolution(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(UpdateCaseStatusBasedOnStepResolutionTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async caseFieldsPersistOnCaseStatusUpdate(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(CaseFieldsPersistOnCaseStatusUpdateTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async caseFieldsPersistOnCaseStatusUpdate2(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(CaseFieldsPersistOnCaseStatusUpdate2TestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  // Same as the old setCaseData, just this one is working with multiple fields not only 1.
  private async stepToCase(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(StepToCaseTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  // WFM-1593
  private async setResetStepDataToCase(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(ResetStepToCaseTestSerivce);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async rawDataToCase(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(RawDataToCaseTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async autoAddSteps(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(AutoAddStepsTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async updateRawDataBasedOnCase(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(UpdateRawDataBasedOnCaseTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async testMultipleSteps(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(MultipleStepsTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async stepToRawData(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(UpdateNotificationTemplateTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  // firing multiple actions
  private async stepToRawDataAndCase(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(StepToRawDataTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  // firing multiple actions
  private async embeddedFieldMathExpression(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(EmbeddedFieldMathOperationActionTestTestService);
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
