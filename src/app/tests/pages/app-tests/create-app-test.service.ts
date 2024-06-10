import { Injectable } from '@angular/core';
import { ApplicationService, WfmApplication } from '@wfm/service-layer';
import { TestResult } from '@wfm/tests/models';

export interface TestContext {
  tenantId: string;
  appId: string;
}

export interface ITestService {
  initialize(ctx: TestContext): Promise<void>;
  test(): Promise<TestResult>;
  cleanup(): Promise<void>;
}

@Injectable()
export class CreateAppTestService implements ITestService {
  private appId: string;

  constructor(private appService: ApplicationService) {}

  initialize(ctx: TestContext): Promise<void> {
    return Promise.resolve();
  }

  async test(): Promise<TestResult> {
    const app = <WfmApplication>{
      baseUrl: 'testBaseUrl',
      name: 'testAppName'
    };

    const operation = await this.appService.create(app);
    this.appId = operation.targetId;

    const result = await this.appService.getById(operation.targetId);

    if (result.name == app.name && result.baseUrl == app.baseUrl) {
      return TestResult.success();
    }

    // todo
    return TestResult.failure('something is wrong');
  }

  async cleanup(): Promise<void> {
    if (this.appId) {
      await this.appService.deleteById(this.appId);
    }
  }
}
