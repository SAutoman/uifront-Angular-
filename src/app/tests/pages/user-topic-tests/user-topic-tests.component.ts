import { select, Store } from '@ngrx/store';
import { AfterViewInit, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store/application-state';
import { environment } from '@src/environments/environment.base';
import { TestUiPageComponent } from '@wfm/tests/modules/test-ui/test-ui-page/test-ui-page.component';
import { Test, TestResult } from '@wfm/tests/models';
import { takeUntil } from 'rxjs/operators';
import { loggedInState } from '@wfm/store';
import { UserTopicSubscribeToTopicTestService } from './UserTopicSubscribeToTopicTestService';
import { UserTopicUnSubscribeFromTopicTestService } from './UserTopicUnSubscribeFromTopicTestService';
import { ITestService, TestContext } from '../app-tests/create-app-test.service';

@Component({
  template: '<app-test-ui-page #test></app-test-ui-page>',
  providers: [UserTopicSubscribeToTopicTestService, UserTopicUnSubscribeFromTopicTestService]
})
export class UserTopicTestsComponent extends TenantComponent implements AfterViewInit {
  @ViewChild('test') testsComp: TestUiPageComponent;

  title = 'User Topics Tests';
  appId: string = environment.appId;
  userId: string;

  constructor(store: Store<ApplicationState>, private injector: Injector) {
    super(store);

    store.pipe(takeUntil(this.destroyed$), select(loggedInState)).subscribe((data) => {
      if (data.profile) {
        this.userId = data.profile.id;
      }
    });
  }

  ngAfterViewInit(): void {
    this.testsComp.init(this.title, [
      <Test>{
        name: 'Subscribe',
        function: async () => await this.subscripeToTopic()
      },
      <Test>{
        name: 'Unsubscribe',
        function: async () => await this.unsubscribeFromTopic()
      }
    ]);
  }
  private async subscripeToTopic(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(UserTopicSubscribeToTopicTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async unsubscribeFromTopic(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(UserTopicUnSubscribeFromTopicTestService);
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
