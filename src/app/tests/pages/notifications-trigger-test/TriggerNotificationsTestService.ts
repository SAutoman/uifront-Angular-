import { Injectable } from '@angular/core';
import { NotificationProcessingSessionService } from '@wfm/service-layer/services/notification-processing-session-service';
import { NotificationsTriggerService } from '@wfm/service-layer/services/notifications-trigger.service';
import { TestResult } from '@wfm/tests/models';
import { ITestService, TestContext } from '../app-tests/create-app-test.service';

@Injectable()
export class TriggerNotificationsTestService implements ITestService {
  private ctx: TestContext;

  constructor(private service: NotificationsTriggerService) {}

  async test(): Promise<TestResult> {
    try {
      await this.service.triggerSendingNotifications(this.ctx.tenantId);
    } catch {
      return TestResult.failure('triggerSendingNotifications failed');
    }
    return TestResult.success();
  }

  async cleanup(): Promise<void> {}

  async initialize(ctx: TestContext): Promise<void> {
    this.ctx = ctx;
  }
}

@Injectable()
export class SetActiveSessionsEndDateTestService implements ITestService {
  private ctx: TestContext;

  constructor(private notificationSessionsService: NotificationProcessingSessionService) {}

  async initialize(ctx: TestContext): Promise<void> {
    this.ctx = ctx;
  }

  async test(): Promise<TestResult> {
    await this.notificationSessionsService.setActiveSessionsEndDate(this.ctx.tenantId);
    return TestResult.success();
  }

  async cleanup(): Promise<void> {}
}
