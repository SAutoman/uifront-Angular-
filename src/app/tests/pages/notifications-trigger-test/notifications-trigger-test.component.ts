/**
 * local
 */
import { AfterViewInit, Component, Injector, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { environment } from '@src/environments/environment.base';
import { OperationStatus } from '@wfm/service-layer';
import { TenantComponent } from '@wfm/shared/tenant.component';

import { Test, TestResult } from '@wfm/tests/models';
import { TestUiPageComponent } from '@wfm/tests/modules/test-ui/test-ui-page/test-ui-page.component';
import { ITestService, TestContext } from '../app-tests/create-app-test.service';
import { SetActiveSessionsEndDateTestService, TriggerNotificationsTestService } from './TriggerNotificationsTestService';

@Component({
  selector: 'app-notifications-trigger-test',
  template: '<app-test-ui-page #test></app-test-ui-page>',
  providers: [TriggerNotificationsTestService]
})
export class NotificationsTriggerTestsComponent extends TenantComponent implements AfterViewInit {
  @ViewChild('test') testsComp: TestUiPageComponent;

  title: string = 'Notifications trigger tests';
  appId: string = environment.appId;

  constructor(store: Store<any>, private injector: Injector) {
    super(store);
  }

  ngAfterViewInit(): void {
    this.testsComp.init(this.title, [
      <Test>{
        name: 'Trigger Notifications',
        function: async () => await this.trigger()
      },
      <Test>{
        name: 'Close active Sessions',
        function: async () => await this.setActiveSessionsEndDate()
      }
    ]);
  }

  private async trigger(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(TriggerNotificationsTestService);

    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant });
      return await testService.test();
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Create';
      console.warn('create failed error', { error });
      return TestResult.failure(error.failedTest);
    } finally {
      await testService.cleanup();
    }
  }

  private async setActiveSessionsEndDate(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(SetActiveSessionsEndDateTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Close Active Sessions';
      console.warn('create failed error', { error });

      return TestResult.failure(error.failedTest);
    } finally {
      await testService.cleanup();
    }
  }
}
