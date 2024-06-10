import { Store } from '@ngrx/store';
import { AfterViewInit, Component, Injector, ViewChild } from '@angular/core';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store/application-state';
import { environment } from '@src/environments/environment.base';
import { TestUiPageComponent } from '@wfm/tests/modules/test-ui/test-ui-page/test-ui-page.component';
import { Test, TestResult } from '@wfm/tests/models';
import { ITestService, TestContext } from '../app-tests/create-app-test.service';
import {
  CreateNotificationTemplateTestService,
  DeleteNotificationTemplateTestService,
  GetNotificationTemplateTestService,
  SearchNotificationTemplateTestService,
  SeedBeckerCasesTemplateTestService,
  SeedBeckerInvitationsTemplateTestService,
  SeedBeckerRawDataTemplateTestService,
  SeedGDCCasesTemplateTestService,
  SeedGDCInvitationsTemplateTestService,
  SeedGDCRawDataTemplateTestService,
  SeedPorscheCasesTemplateTestService,
  SeedPorscheInvitationsTemplateTestService,
  SeedPorscheRawDataTemplateTestService,
  UpdateNotificationTemplateTestService
} from './notification-template-test.service';

@Component({
  template: '<app-test-ui-page #test></app-test-ui-page>'
})
export class NotificationTemplateTestsComponent extends TenantComponent implements AfterViewInit {
  @ViewChild('test') testsComp: TestUiPageComponent;

  title = 'Nofications Template Tests';
  appId: string = environment.appId;

  constructor(store: Store<ApplicationState>, private injector: Injector) {
    super(store);
  }

  ngAfterViewInit(): void {
    this.testsComp.init(this.title, [
      <Test>{
        name: 'Create',
        function: async () => await this.createNotificationTemplate()
      },
      <Test>{
        name: 'Delete',
        function: async () => await this.deleteNotificationTemplate()
      },
      <Test>{
        name: 'Get',
        function: async () => await this.getNotificationTemplate()
      },
      <Test>{
        name: 'Search',
        function: async () => await this.searchNotificationTemplate()
      },
      <Test>{
        name: 'Update',
        function: async () => await this.updateNotificationTemplate()
      },
      <Test>{
        name: 'Seed raw data template (GDC)',
        function: async () => await this.seedRawDataTemplate()
      },
      <Test>{
        name: 'Seed cases template (GDC)',
        function: async () => await this.seedCasesTemplate()
      },
      <Test>{
        name: 'Seed invitations template (GDC)',
        function: async () => await this.seedInvitationsTemplate()
      },
      <Test>{
        name: 'Seed raw data template (Becker)',
        function: async () => await this.seedBeckerRawDataTemplate()
      },
      <Test>{
        name: 'Seed cases template (Becker)',
        function: async () => await this.seedBeckerCasesTemplate()
      },
      <Test>{
        name: 'Seed invitations template (Becker)',
        function: async () => await this.seedBeckerInvitationsTemplate()
      },
      <Test>{
        name: 'Seed raw data template (Porsche)',
        function: async () => await this.seedPorscheRawDataTemplate()
      },
      <Test>{
        name: 'Seed cases template (Porsche)',
        function: async () => await this.seedPorscheCasesTemplate()
      },
      <Test>{
        name: 'Seed invitations template (Porsche)',
        function: async () => await this.seedPorscheInvitationsTemplate()
      }
    ]);
  }

  private async createNotificationTemplate(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(CreateNotificationTemplateTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async updateNotificationTemplate(): Promise<TestResult> {
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

  private async deleteNotificationTemplate(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(DeleteNotificationTemplateTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async searchNotificationTemplate(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(SearchNotificationTemplateTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async getNotificationTemplate(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(GetNotificationTemplateTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async seedRawDataTemplate(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(SeedGDCRawDataTemplateTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }
  private async seedCasesTemplate(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(SeedGDCCasesTemplateTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }
  private async seedInvitationsTemplate(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(SeedGDCInvitationsTemplateTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async seedBeckerRawDataTemplate(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(SeedBeckerRawDataTemplateTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }
  private async seedBeckerCasesTemplate(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(SeedBeckerCasesTemplateTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }
  private async seedBeckerInvitationsTemplate(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(SeedBeckerInvitationsTemplateTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }
  private async seedPorscheRawDataTemplate(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(SeedPorscheRawDataTemplateTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }
  private async seedPorscheCasesTemplate(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(SeedPorscheCasesTemplateTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }
  private async seedPorscheInvitationsTemplate(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(SeedPorscheInvitationsTemplateTestService);
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
