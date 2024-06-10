import { CompanyService, Roles, User, UsersService } from '@wfm/service-layer';
import { DeleteNotificationTemplateCommand } from '@wfm/service-layer/models/notificationTemplate';
import { NotificationTemplateService } from '@wfm/service-layer/services/notification-template.service';
import {
  CreateUpdateNotificationTopicCommand,
  NotificationTopicService,
  TopicKindEnum
} from '@wfm/service-layer/services/notification-topic.service';
import { UserTopicService } from '@wfm/service-layer/services/user-topic.service';
import { Guid } from '@wfm/shared/guid';
import { TestResult } from '@wfm/tests/models';
import { ITestService, TestContext } from '../app-tests/create-app-test.service';
import { GDCNewRawDataTemplate } from '../notification-tests/notification-template-file';

export class UserTopicBaseTestService implements ITestService {
  protected ctx: TestContext;
  protected userId: string;
  protected templateId: string;
  protected topicId: string;
  private companyId: string;

  constructor(
    protected userTopicService: UserTopicService,
    private notificationTemplateService: NotificationTemplateService,
    private notificationTopicService: NotificationTopicService,
    private userService: UsersService,
    private companyService: CompanyService
  ) {}
  async initialize(ctx: TestContext): Promise<void> {
    this.ctx = ctx;

    const template: string = GDCNewRawDataTemplate;

    const templateOperation = await this.notificationTemplateService.create({
      name: 'topicTestTemplate',
      tenantId: this.ctx.tenantId,
      logoId: '',
      template: template
    });

    this.templateId = templateOperation.targetId;

    const createTopicCommand = <CreateUpdateNotificationTopicCommand>{
      days: 0,
      topicKind: TopicKindEnum.NewRawData,
      topicTemplateId: this.templateId,
      name: 'NewRawData',
      subject: 'NewRawData',
      description: 'this is the latest NewRawData'
    };

    const opTopic = await this.notificationTopicService.create(this.ctx.tenantId, createTopicCommand);
    this.topicId = opTopic.targetId;

    const company = await this.companyService.create({
      email: 'nikolay.borisov@cargoclix.com',
      name: `mytestcomp-${new Date().getTime()}`,
      address: '123',
      city: '123',
      contactPersonId: null,
      country: '123',
      id: '123',
      notes: '123',
      number: '123',
      phone: '123',
      publicId: '123',
      vatNr: '123',
      zip: '123'
    });

    this.companyId = company.id;

    const supplier = await this.userService.createUser(this.ctx.tenantId, <User>{
      email: 'test.useremailsupplier1@cargoclix.com',
      name: 'testSupplier',
      companyId: company.id,
      role: Roles.Supplier,
      subject: `test.useremailsupplier1@cargoclix.com-${Guid.createGuid()}`,
      isTestUser: true
    });

    this.userId = supplier.id;
  }

  async test(): Promise<TestResult> {
    throw new Error('This method is not implemented.');
  }

  async cleanup(): Promise<void> {
    await this.userService.deleteUserById(this.ctx.tenantId, this.userId);
    await this.companyService.deleteById(this.companyId);
    await this.notificationTopicService.delete(this.ctx.tenantId, this.topicId);
    await this.notificationTemplateService.delete(<DeleteNotificationTemplateCommand>{
      tenantId: this.ctx.tenantId,
      id: this.templateId
    });
  }
}
