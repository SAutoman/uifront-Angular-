import { Store } from '@ngrx/store';
import { AfterViewInit, Component, Injector, ViewChild } from '@angular/core';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store/application-state';
import { Test, TestResult } from '@tests/models';
import { environment } from '@src/environments/environment.base';
import { TestUiPageComponent } from '@wfm/tests/modules/test-ui/test-ui-page/test-ui-page.component';
import { ConfirmActionComponent } from '@wfm/workflow-state/confirm-action/confirm-action.component';
import { ConfirmActionData } from '@wfm/service-layer/models/confirm-action';
import { ITestService, TestContext } from '../app-tests/create-app-test.service';
import {
  ClearNotificationConfigurationsTestService,
  CreateSupplierAndAuditorMappingAndCaseTestService,
  CreateSupplierMappingAndRawDataTestService,
  SeedInvitationConfigurationsTestService,
  SeedNewRawDataConfigurationsTestService,
  SeedNewWorkflowConfigurationsTestService,
  SendNotificationForCaseTestService,
  SendNotificationForInvitationTestService,
  SendNotificationTestService,
  SendTwoNotificationsWithTheSameTemplateForCaseTestService,
  SendTwoNotificationsWithTheSameTemplateTestService
} from './notifications-test.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  template: '<app-test-ui-page #test></app-test-ui-page>',
  styles: [':host { display: block; height: 100%; overflow-y: auto; }']
})
export class NotificationTestsComponent extends TenantComponent implements AfterViewInit {
  @ViewChild('test') testsComp: TestUiPageComponent;

  title = 'Notification Tests';
  appId: string = environment.appId;

  constructor(store: Store<ApplicationState>, private injector: Injector, private dialog: MatDialog) {
    super(store);
  }

  ngAfterViewInit(): void {
    this.testsComp.init(this.title, [
      <Test>{
        name: 'Send',
        function: async () => await this.sendNotification()
      },
      <Test>{
        name: 'Send test for backend caching',
        function: async () => await this.sendTwoNotificationsWithTheSameTemplate()
      },
      <Test>{
        name: 'Send for case',
        function: async () => await this.sendNotificationForCase()
      },
      <Test>{
        name: 'Send test for backend caching for case',
        function: async () => await this.sendTwoNotificationsWithTheSameTemplateForCase()
      },
      <Test>{
        name: 'Send for invitation',
        function: async () => await this.sendNotificationForInvitation()
      },
      <Test>{
        name: 'Seed NewRawData Notification Configurations',
        function: async () => await this.seedNewRawDataConfigurations()
      },
      <Test>{
        name: 'Create Supplier Mappings and RawData',
        function: async () => await this.createSupplierMappingAndRawData()
      },
      <Test>{
        name: 'Seed delayed Case Notification Configurations',
        function: async () => await this.seedNewWorkflowConfigurations()
      },
      <Test>{
        name: 'Seed Invitation Notification Configurations',
        function: async () => await this.seedInvitationsConfigurations()
      },
      <Test>{
        name: 'Create Supplier and Auditor Mappings and Case',
        function: async () => await this.createSupplierAndAuditorMappingAndCase()
      },
      <Test>{
        name: 'Clear Notification Configurations',
        function: async () => await this.clearNotificationConfigurations()
      }
    ]);
  }

  private async sendTwoNotificationsWithTheSameTemplate(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(SendTwoNotificationsWithTheSameTemplateTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Create topic template';
      console.warn('create failed error', { error });
      return TestResult.failure(error.failedTest);
    } finally {
      await testService.cleanup();
    }
  }

  private async sendNotification(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(SendNotificationTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Create topic template';
      console.warn('create failed error', { error });

      return TestResult.failure(error.failedTest);
    } finally {
      await testService.cleanup();
    }
  }

  private async sendTwoNotificationsWithTheSameTemplateForCase(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(SendTwoNotificationsWithTheSameTemplateForCaseTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Create topic template';
      console.warn('create failed error', { error });
      return TestResult.failure(error.failedTest);
    } finally {
      await testService.cleanup();
    }
  }

  private async sendNotificationForCase(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(SendNotificationForCaseTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Create topic template';
      console.warn('create failed error', { error });

      return TestResult.failure(error.failedTest);
    } finally {
      await testService.cleanup();
    }
  }

  private async sendNotificationForInvitation(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(SendNotificationForInvitationTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Create topic template';
      console.warn('create failed error', { error });

      return TestResult.failure(error.failedTest);
    } finally {
      await testService.cleanup();
    }
  }

  private async seedNewRawDataConfigurations(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(SeedNewRawDataConfigurationsTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Create Notification Topic template';
      console.warn('create failed error', { error });
      return TestResult.failure(error.failedTest);
    } finally {
      await testService.cleanup();
    }
  }

  private async seedNewWorkflowConfigurations(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(SeedNewWorkflowConfigurationsTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Create Notification Topic template';
      console.warn('create failed error', { error });
      return TestResult.failure(error.failedTest);
    } finally {
      await testService.cleanup();
    }
  }

  private async seedInvitationsConfigurations(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(SeedInvitationConfigurationsTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Create Notification Topic template';
      console.warn('create failed error', { error });
      return TestResult.failure(error.failedTest);
    } finally {
      await testService.cleanup();
    }
  }

  private async createSupplierMappingAndRawData(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(CreateSupplierMappingAndRawDataTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async createSupplierAndAuditorMappingAndCase(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(CreateSupplierAndAuditorMappingAndCaseTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async clearNotificationConfigurations(): Promise<TestResult> {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: <ConfirmActionData>{
        title: 'Warning',
        message: 'Are you sure you want to reset Notification Settings, No notifications will be sent anymore.',
        showProceedBtn: true
      }
    });

    const result = await dialogRef.afterClosed().toPromise();

    if (result) {
      const testService = <ITestService>this.injector.get(ClearNotificationConfigurationsTestService);
      try {
        await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
        return await testService.test();
      } catch (error) {
        error.failedTest = this.title + ' ' + 'reset data seed';
        console.warn('reset failed error', { error });
        return TestResult.failure(error.failedTest);
      } finally {
        await testService.cleanup();
      }
    }
  }
}
