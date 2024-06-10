import { AfterViewInit, Component, Injector, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { environment } from '@src/environments/environment.base';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { Test, TestResult } from '@wfm/tests/models';
import { TestUiPageComponent } from '@wfm/tests/modules/test-ui/test-ui-page/test-ui-page.component';
import { ITestService, TestContext } from '../app-tests/create-app-test.service';
import {
  CreateUserTestService,
  DeactivateUserTestService,
  GetDeactivatedUsersTestService,
  InviteSupplierTestService,
  InviteTenantAdminTestService,
  ReactivateUserTestService,
  UnsubscribeUserEmailTestService
} from './users-tests.service';

@Component({
  template: '<app-test-ui-page #test></app-test-ui-page>'
})
export class UsersTestsComponent extends TenantComponent implements AfterViewInit {
  @ViewChild('test') testsComp: TestUiPageComponent;

  title = 'Users Tests';
  appId: string = environment.appId;

  constructor(store: Store<ApplicationState>, private injector: Injector) {
    super(store);
  }

  ngAfterViewInit(): void {
    this.testsComp.init(this.title, [
      <Test>{
        name: 'Invite TenantAdmin',
        function: async () => await this.inviteAdmin()
      },
      <Test>{
        name: 'Invite Supplier',
        function: async () => await this.inviteSupplier()
      },
      <Test>{
        name: 'Create User',
        function: async () => await this.createUser()
      },
      <Test>{
        name: 'Deactivate User',
        function: async () => await this.deactivateUser()
      },
      <Test>{
        name: 'Get Deactivated Users',
        function: async () => await this.getDeactivatedUsers()
      },
      <Test>{
        name: 'Reactivate User',
        function: async () => await this.reactivateUser()
      }
      // triggers sending notifications, which is crashing for some reason
      // <Test>{
      //   name: 'Unsubscribe from emails',
      //   function: async () => await this.unsubscribeEmail()
      // }
    ]);
  }

  private async inviteAdmin(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(InviteTenantAdminTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async inviteSupplier(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(InviteSupplierTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async createUser(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(CreateUserTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async deactivateUser(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(DeactivateUserTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async getDeactivatedUsers(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(GetDeactivatedUsersTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async reactivateUser(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(ReactivateUserTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async unsubscribeEmail(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(UnsubscribeUserEmailTestService);
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
