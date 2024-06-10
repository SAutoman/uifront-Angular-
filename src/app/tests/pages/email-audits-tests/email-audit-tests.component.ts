import { Store } from '@ngrx/store';
import { AfterViewInit, Component, Injector, ViewChild } from '@angular/core';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store/application-state';
import { Test, TestResult } from '@tests/models';
import { environment } from '@src/environments/environment.base';
import { TestUiPageComponent } from '@wfm/tests/modules/test-ui/test-ui-page/test-ui-page.component';
import { ITestService, TestContext } from '../app-tests/create-app-test.service';
import {
  DeleteAllEmailAuditsOlderThanTestService,
  GetCaseByIdTestService,
  GetCaseEmailAuditCountTestService,
  GetCaseEmailAuditIdsTestService,
  GetCaseEmailAuditsTestService,
  GetCaseEmailAuditTestService,
  GetRawDataByIdTestService,
  GetRawDataEmailAuditCountTestService,
  GetRawDataEmailAuditIdsTestService,
  GetRawDataEmailAuditsTestService,
  GetRawDataEmailAuditTestService,
  SearchCaseTestService,
  SearchRawDataTestService
} from './email-audits-test.service';

@Component({
  template: '<app-test-ui-page #test></app-test-ui-page>'
})
export class EmailAuditTestsComponent extends TenantComponent implements AfterViewInit {
  @ViewChild('test') testsComp: TestUiPageComponent;

  title = 'Email Audits Tests';
  appId: string = environment.appId;

  constructor(store: Store<ApplicationState>, private injector: Injector) {
    super(store);
  }

  ngAfterViewInit(): void {
    this.testsComp.init(this.title, [
      <Test>{
        name: 'Get Raw Data Email Audit Ids',
        function: async () => await this.getRawDataEmailAuditIds()
      },
      <Test>{
        name: 'Get Raw Data Email Audits',
        function: async () => await this.getRawDataEmailAudits()
      },
      <Test>{
        name: 'Get Raw Data Email Audit',
        function: async () => await this.getRawDataEmailAudit()
      },
      <Test>{
        name: 'Get Raw Data Email Audit Count',
        function: async () => await this.getRawDataEmailAuditCount()
      },
      <Test>{
        name: 'Get Case Email Audit Ids',
        function: async () => await this.getCaseEmailAuditIds()
      },
      <Test>{
        name: 'Get Case Email Audits',
        function: async () => await this.getCaseEmailAudits()
      },
      <Test>{
        name: 'Get Case Email Audit',
        function: async () => await this.getCaseEmailAudit()
      },
      <Test>{
        name: 'Get Case Email Audit Count',
        function: async () => await this.getCaseEmailAuditCount()
      },
      <Test>{
        name: 'Search Raw Data',
        function: async () => await this.searchRawData()
      },
      <Test>{
        name: 'Get Raw Data By Id',
        function: async () => await this.getRawDataById()
      },
      <Test>{
        name: 'Search Case',
        function: async () => await this.searchCase()
      },
      <Test>{
        name: 'Get Case By Id',
        function: async () => await this.getCaseById()
      },
      <Test>{
        name: 'Delete all email audits older than',
        function: async () => await this.deleteAllEMailAuditsOlderThan()
      }
    ]);
  }

  private async getRawDataEmailAuditIds(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(GetRawDataEmailAuditIdsTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async getRawDataEmailAudits(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(GetRawDataEmailAuditsTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async getRawDataEmailAudit(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(GetRawDataEmailAuditTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async getRawDataEmailAuditCount(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(GetRawDataEmailAuditCountTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async getCaseEmailAuditIds(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(GetCaseEmailAuditIdsTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async getCaseEmailAudit(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(GetCaseEmailAuditTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async getCaseEmailAudits(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(GetCaseEmailAuditsTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async getCaseEmailAuditCount(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(GetCaseEmailAuditCountTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async searchRawData(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(SearchRawDataTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async getRawDataById(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(GetRawDataByIdTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }
  private async searchCase(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(SearchCaseTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }
  private async getCaseById(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(GetCaseByIdTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async deleteAllEMailAuditsOlderThan(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(DeleteAllEmailAuditsOlderThanTestService);
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
