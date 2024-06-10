import { Injectable } from '@angular/core';
import { TestResult } from '@wfm/tests/models';
import { UserTopicService } from '@wfm/service-layer/services/user-topic.service';
import { NotificationTopicService } from '@wfm/service-layer/services/notification-topic.service';
import { NotificationTemplateService } from '@wfm/service-layer/services/notification-template.service';
import { SubscribeUserToTopic, UnsubscribeUserFromTopicCommand } from '@wfm/service-layer/models/usertopic';
import { CompanyService, UsersService } from '@wfm/service-layer';
import { UserTopicBaseTestService } from './UserTopicBaseTetsService';

@Injectable()
export class UserTopicUnSubscribeFromTopicTestService extends UserTopicBaseTestService {
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
    const unSubscribeOperation = await this.userTopicService.subscribe(command);
    await this.userTopicService.unsubscribe(<UnsubscribeUserFromTopicCommand>{
      userId: command.userId,
      notificationTopicId: command.notificationTopicId,
      tenantId: this.ctx.tenantId
    });

    var subscription = await this.userTopicService.getSubscription(this.ctx.tenantId, this.userId, this.topicId);

    if (!subscription.isEnabled) {
      return TestResult.success();
    }

    return TestResult.failure('Test Failed');
  }
}
