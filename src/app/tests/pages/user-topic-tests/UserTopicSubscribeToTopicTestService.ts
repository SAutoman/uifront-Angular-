import { Injectable } from '@angular/core';
import { TestResult } from '@wfm/tests/models';
import { UserTopicService } from '@wfm/service-layer/services/user-topic.service';
import { NotificationTopicService } from '@wfm/service-layer/services/notification-topic.service';
import { NotificationTemplateService } from '@wfm/service-layer/services/notification-template.service';
import { CompanyService, UsersService } from '@wfm/service-layer';
import { SubscribeUserToTopic, UnsubscribeUserFromTopicCommand } from '@wfm/service-layer/models/usertopic';
import { UserTopicBaseTestService } from './UserTopicBaseTetsService';

@Injectable()
export class UserTopicSubscribeToTopicTestService extends UserTopicBaseTestService {
  constructor(
    userTopicService: UserTopicService,
    notificationTemplateService: NotificationTemplateService,
    notificationTopicService: NotificationTopicService,
    userService: UsersService,
    companyService: CompanyService
  ) {
    super(userTopicService, notificationTemplateService, notificationTopicService, userService, companyService);
  }

  async test(): Promise<TestResult> {
    const command = <SubscribeUserToTopic>{
      userId: this.userId,
      notificationTopicId: this.topicId,
      tenantId: this.ctx.tenantId
    };
    const subscribeOperation = await this.userTopicService.subscribe(command);

    return TestResult.success();
  }
  async cleanup(): Promise<void> {
    await this.userTopicService.unsubscribe(<UnsubscribeUserFromTopicCommand>{
      userId: this.userId,
      notificationTopicId: this.topicId,
      tenantId: this.ctx.tenantId
    });

    await super.cleanup();
  }
}
