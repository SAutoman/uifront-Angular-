/**
 * global
 */
import { AfterViewInit, Component, Injector, ViewChild } from '@angular/core';

/**
 * project
 */
import { ApplicationService } from '@wfm/service-layer/services/application.service';
import { WfmApplication } from '@wfm/service-layer/models/wfm-application';

/**
 * local
 */
import { OperationStatus, Paging } from '@wfm/service-layer';
import { CreateAppTestService, ITestService, TestContext } from './create-app-test.service';
import { Test, TestResult } from '@wfm/tests/models';
import { TestUiPageComponent } from '@wfm/tests/modules/test-ui/test-ui-page/test-ui-page.component';

@Component({
  selector: 'app-tests',
  template: '<app-test-ui-page #test></app-test-ui-page>',
  providers: [CreateAppTestService]
})
export class AppTestsComponent implements AfterViewInit {
  @ViewChild('test') testsComp: TestUiPageComponent;

  title: string = 'App tests';

  constructor(private injector: Injector, private appService: ApplicationService) {}

  ngAfterViewInit(): void {
    this.testsComp.init(this.title, [
      <Test>{
        name: 'Create',
        function: async () => await this.create()
      },
      <Test>{
        name: 'Get by id',
        function: async () => await this.getById()
      },
      <Test>{
        name: 'Get all',
        function: async () => await this.getAll()
      },
      <Test>{
        name: 'Delete',
        function: async () => await this.delete()
      }
    ]);
  }

  private async create(): Promise<TestResult> {
    const testService = <ITestService>this.injector.get(CreateAppTestService);

    try {
      await testService.initialize(<TestContext>{});
      return await testService.test();
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Create';
      console.warn('create failed error', { error });
      return TestResult.failure(error.failedTest);
    } finally {
      await testService.cleanup();
    }
  }

  private async getById(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const app = <WfmApplication>{
        baseUrl: 'appToGet',
        name: 'appToGetname'
      };

      const operation = await this.appService.create(app);
      const result = await this.appService.getById(operation.targetId);

      if (result.name == app.name && result.baseUrl == app.baseUrl) {
        isSuccess = true;
        await this.appService.deleteById(operation.targetId);
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Get by id';
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async getAll(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const app1 = <WfmApplication>{
        baseUrl: 'firtEntity',
        name: 'firstEntityName'
      };
      const app2 = <WfmApplication>{
        baseUrl: 'firtEntity',
        name: 'firstEntityName'
      };

      const operation1 = await this.appService.create(app1);
      const operation2 = await this.appService.create(app2);

      const pagedResult = await this.appService.search(<Paging>{ take: 10, skip: 0 });

      if (pagedResult.total > 1) {
        isSuccess = true;
        await this.appService.deleteById(operation1.targetId);
        await this.appService.deleteById(operation2.targetId);
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Get all';
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async delete(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const app = <WfmApplication>{
        baseUrl: 'appToDelete',
        name: 'appToDeleteName'
      };

      const operation = await this.appService.create(app);
      const createOperationStatusEnum: OperationStatus = OperationStatus[operation.status.toString()];

      if (createOperationStatusEnum === OperationStatus.Success) {
        const deleteOperation = await this.appService.deleteById(operation.targetId);
        const deleteOperationStatusEnum: OperationStatus = OperationStatus[deleteOperation.status.toString()];

        if (deleteOperationStatusEnum === OperationStatus.Success) {
          isSuccess = true;
        }
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Delete';
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }
}
