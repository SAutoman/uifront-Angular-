/**
 * global
 */
import { Store } from '@ngrx/store';
import { AfterViewInit, Component, Injector, ViewChild } from '@angular/core';
import { environment } from '@src/environments/environment.base';
import { ApplicationState } from '@wfm/store';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { TestUiPageComponent } from '@wfm/tests/modules/test-ui/test-ui-page/test-ui-page.component';
import { Test, TestResult } from '@wfm/tests/models';
import { ITestService, TestContext } from '../app-tests/create-app-test.service';
import {
  CreateMappingsTestService,
  GetMappingsTestService,
  SupplierMappingsCaseTestService,
  SupplierMappingsFilterTestService,
  SupplierMappingsRawDataTestService
} from './mappings-tests.service';

@Component({
  template: '<app-test-ui-page #test></app-test-ui-page>'
})
export class MappingsTestsComponent extends TenantComponent implements AfterViewInit {
  @ViewChild('test') testsComp: TestUiPageComponent;
  title = 'Mapping tests';
  appId: string = environment.appId;

  constructor(store: Store<ApplicationState>, private injector: Injector) {
    super(store);
  }

  ngAfterViewInit(): void {
    this.testsComp.init(this.title, [
      <Test>{
        function: async () => await this.create(),
        name: 'Create'
      },
      <Test>{
        function: async () => await this.get(),
        name: 'Get'
      },
      <Test>{
        function: async () => await this.supplierMappingRawDatas(),
        name: 'Supplier Mapping RawDatas (Gries Deco Company)'
      },
      <Test>{
        function: async () => await this.supplierMappingCases(),
        name: 'Supplier Mapping Cases (Gries Deco Company)'
      },
      <Test>{
        function: async () => await this.supplierFilter(),
        name: 'Supplier Filtering (Gries Deco Company)'
      }
    ]);
  }

  private async create(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(CreateMappingsTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch {
      return TestResult.failure('Test failed.');
    } finally {
      await testService.cleanup();
    }
  }

  private async get(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(GetMappingsTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch {
      return TestResult.failure('Test failed.');
    } finally {
      await testService.cleanup();
    }
  }

  private async supplierMappingRawDatas(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(SupplierMappingsRawDataTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch {
      return TestResult.failure('Test failed.');
    } finally {
      await testService.cleanup();
    }
  }

  private async supplierMappingCases(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(SupplierMappingsCaseTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch {
      return TestResult.failure('Test failed.');
    } finally {
      await testService.cleanup();
    }
  }

  private async supplierFilter(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(SupplierMappingsFilterTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch {
      return TestResult.failure('Test failed.');
    } finally {
      await testService.cleanup();
    }
  }
}
