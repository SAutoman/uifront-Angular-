/**
 * global
 */
import { select, Store } from '@ngrx/store';
import { AfterViewInit, Component, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { random } from 'lodash-core';
import { filter, takeUntil } from 'rxjs/operators';

/**
 * project
 */
import {
  Company,
  CompanyService,
  CreateTenantModel,
  FieldTypeIds,
  IFilter,
  Paging,
  SortDirection,
  Sorting,
  Tenant,
  TenantsService
} from '@wfm/service-layer';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store/application-state';
import { loadedTenantSelector } from '@wfm/store';

/**
 * local
 */
import { Test, TestResult } from '@tests/models';
import { environment } from './../../../../environments/environment.dev';
import { SearchType } from '@wfm/service-layer/models/dynamic-entity-models';
import { TestUiPageComponent } from '@wfm/tests/modules/test-ui/test-ui-page/test-ui-page.component';
import { ITestService, TestContext } from '../app-tests/create-app-test.service';
import { CreateNotificationTemplateTestService } from '../notification-templates-tests/notification-template-test.service';
import {
  CopyTenantSettingsTestService,
  CreateTenantTestService,
  DeleteTenantByIdTestService,
  GetAllTenantsTestService,
  GetTenantByIdTestService,
  SearchWithFilterTestService,
  SearchWithPagingTestService,
  SearchWithSortingTestService,
  UpdateTenantTestService
} from './tenant-tests.service';

@Component({
  selector: 'app-tenant-tests',
  template: '<app-test-ui-page #test></app-test-ui-page>'
})
export class TenantTestsComponent extends TenantComponent implements AfterViewInit {
  @ViewChild('test') testsComp: TestUiPageComponent;

  title: string = 'Tenant Tests';
  loadedTenant: Tenant;
  appId: string = environment.appId;

  constructor(store: Store<ApplicationState>, private injector: Injector) {
    super(store);

    store
      .pipe(
        takeUntil(this.destroyed$),
        select(loadedTenantSelector),
        filter((x) => !!x)
      )
      .subscribe((data) => {
        this.loadedTenant = data;
      });
  }

  ngAfterViewInit(): void {
    this.testsComp.init(this.title, [
      <Test>{
        name: 'CREATE - tenant',
        function: async () => await this.create()
      },
      <Test>{
        name: 'UPDATE - by id',
        function: async () => await this.update()
      },
      <Test>{
        name: 'GET - by id',
        function: async () => await this.getById()
      },
      <Test>{
        name: 'GET - all',
        function: async () => await this.getAllTenants()
      },
      <Test>{
        name: 'SEARCH - with paging',
        function: async () => await this.searchWithPaging()
      },
      <Test>{
        name: 'SEARCH - with sorting',
        function: async () => await this.searchWithSorting()
      },
      <Test>{
        name: 'SEARCH - with filters',
        function: async () => await this.searchWithFilters()
      },
      <Test>{
        name: 'Copy settings - tenant',
        function: async () => await this.copyNewTenantSettings()
      },
      <Test>{
        name: 'DELETE - by id',
        function: async () => await this.deleteById()
      }
    ]);
  }

  private async create(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(CreateTenantTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async update(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(UpdateTenantTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async getById(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(GetTenantByIdTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async getAllTenants(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(GetAllTenantsTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async searchWithPaging(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(SearchWithPagingTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async searchWithSorting(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(SearchWithSortingTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async searchWithFilters(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(SearchWithFilterTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async deleteById(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(DeleteTenantByIdTestService);
    try {
      await testService.initialize(<TestContext>{ tenantId: this.tenant, appId: this.appId });
      return await testService.test();
    } catch (error) {
      return TestResult.failure('Test Failed');
    } finally {
      await testService.cleanup();
    }
  }

  private async copyNewTenantSettings(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(CopyTenantSettingsTestService);
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
