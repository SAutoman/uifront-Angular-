import { Injectable } from '@angular/core';
import { GDCInvitationsTemplate } from '@wfm/notification-templates/gdc-invitation-template-file';
import {
  Company,
  CompanyService,
  CreateTenantModel,
  DynamicEntitiesService,
  Invitation,
  InvitationToolService,
  MappingsService,
  RegisterUserCommand,
  Roles,
  Tenant,
  TenantsService,
  User,
  UsersService
} from '@wfm/service-layer';
// import { DeleteNotificationTemplateCommand } from '@wfm/service-layer/models/notificationTemplate';
import { DeactivatedUsersService } from '@wfm/service-layer/services/deactivated-users.service';
import { NotificationTemplateService } from '@wfm/service-layer/services/notification-template.service';
import { NotificationTopicService } from '@wfm/service-layer/services/notification-topic.service';
import { NotificationsTriggerService } from '@wfm/service-layer/services/notifications-trigger.service';
import { UnsubscribeEmailService } from '@wfm/service-layer/services/unsubscribe-email.service';
import { Guid } from '@wfm/shared/guid';
import { TestResult } from '@wfm/tests/models';
import { ITestService, TestContext } from '../app-tests/create-app-test.service';
import { SchemaHelper } from '../helpers/schemaHelper';
import { TenantFieldsHelper } from '../helpers/tenantFieldsHelper';
import { RawDataBaseTestService } from '../notification-tests/notifications-test.service';

export class UsersTestsService implements ITestService {
  protected ctx: TestContext;
  protected companyId: string;
  protected testTenantId: string;
  protected testTenant: Tenant;

  constructor(private companyService: CompanyService, private tenantService: TenantsService) {}

  async initialize(ctx: TestContext): Promise<void> {
    this.ctx = ctx;
  }

  async prepareTestData(): Promise<void> {
    const createCompany: Company = {
      name: `company-new-${new Date().getTime()}`,
      email: 'some@mail.zz',
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
    };
    this.companyId = (await this.companyService.create(createCompany)).id;

    const createTenantModel: CreateTenantModel = {
      name: `tenant-new-${new Date().getTime()}`,
      appPublicId: this.ctx.appId,
      companyId: this.companyId,
      invitationTemplate: GDCInvitationsTemplate,
      timeZone: 'Europe/Berlin'
    };

    this.testTenant = await this.tenantService.create(createTenantModel);
    this.testTenantId = this.testTenant.id;
  }
  async test(): Promise<TestResult> {
    throw new Error('This method is not implemented.');
  }
  async cleanup(): Promise<void> {
    await this.tenantService.deleteById(this.testTenantId);
    await this.companyService.deleteById(this.companyId);
  }
}

export class CreateUserBaseTestService extends UsersTestsService {
  protected user: User;
  protected createUser: User;
  constructor(companyService: CompanyService, tenantService: TenantsService, protected usersService: UsersService) {
    super(companyService, tenantService);
  }

  async prepareTestData(): Promise<void> {
    await super.prepareTestData();

    const createUser = <User>{
      title: 'Mr',
      name: 'UserName123',
      lastName: 'UserLastname',
      email: 'someother@mail.zz',
      phone: '12112121',
      country: 'abc',
      city: 'abc',
      address: 'abc',
      department: 'abc',
      isAdmin: null,
      id: null,
      companyId: this.companyId,
      role: Roles.TenantAdmin,
      isTestUser: true,
      subject: `testUser${Guid.createGuid()}`
    };

    this.createUser = createUser;

    this.user = await this.usersService.createUser(this.ctx.tenantId, createUser);
  }
  async test(): Promise<TestResult> {
    throw new Error('This method is not implemented.');
  }
  async cleanup(): Promise<void> {
    await this.usersService.deleteUserById(this.ctx.tenantId, this.user.id);
    await super.cleanup();
  }
}

@Injectable()
export class InviteTenantAdminTestService extends UsersTestsService {
  // private templateId: string;
  // private topicId: string;
  private user: User;
  constructor(
    companyService: CompanyService,
    tenantService: TenantsService,
    private invitationService: InvitationToolService,
    private usersService: UsersService // private notificationTopicService: NotificationTopicService, // private notificationTemplateService: NotificationTemplateService
  ) {
    super(companyService, tenantService);
  }

  async test(): Promise<TestResult> {
    await this.prepareTestData();

    // const topicName = 'Invitation to the EUTR online system of Gries Deco Company';
    // const topic = await this.notificationTopicService.getByName(this.testTenantId, topicName);
    // this.topicId = topic.id;
    // this.templateId = topic.topicTemplateId;

    // invite tenantAdmin
    const invitationCMD = <Invitation>{
      emailAddress: 'user11@mail.zz',
      role: Roles.TenantAdmin
    };
    let invOperation = await this.invitationService.sendInvitation(this.testTenantId, invitationCMD);
    if (invOperation.status.toString() === 'Success') {
      // register that user
      const createUser = <RegisterUserCommand>{
        title: 'Mr',
        name: 'UserName123',
        lastName: 'UserLastname',
        email: invitationCMD.emailAddress,
        phone: '12112121',
        country: 'abc',
        city: 'abc',
        address: 'abc',
        department: 'abc',
        isAdmin: null,
        id: null,
        companyId: this.companyId,
        invitationEmail: invitationCMD.emailAddress,
        role: Roles.TenantAdmin,
        isTestUser: true,
        subject: `testUser${Guid.createGuid()}`
      };
      this.user = await this.usersService.registerTestUser(this.testTenantId, createUser);
      if (this.user && this.user.email === createUser.email) {
        return TestResult.success();
      }
    }

    return TestResult.failure('Test Failed');
  }

  async cleanup(): Promise<void> {
    // await this.notificationTopicService.delete(this.testTenantId, this.topicId);
    // await this.notificationTemplateService.delete(<DeleteNotificationTemplateCommand>{ tenantId: this.testTenantId, id: this.templateId });
    await this.usersService.deleteUserById(this.ctx.tenantId, this.user.id);
    await super.cleanup();
  }
}

@Injectable()
export class InviteSupplierTestService extends UsersTestsService {
  // private templateId: string;
  // private topicId: string;
  private user: User;
  constructor(
    companyService: CompanyService,
    tenantService: TenantsService,
    private invitationService: InvitationToolService,
    private usersService: UsersService // private notificationTopicService: NotificationTopicService, // private notificationTemplateService: NotificationTemplateService
  ) {
    super(companyService, tenantService);
  }

  async test(): Promise<TestResult> {
    await this.prepareTestData();

    // const topicName = 'Invitation to the EUTR online system of Gries Deco Company';
    // const topic = await this.notificationTopicService.getByName(this.testTenantId, topicName);
    // this.topicId = topic.id;
    // this.templateId = topic.topicTemplateId;

    // invite supplier
    const invitationCMD = <Invitation>{
      emailAddress: 'user11@mail.zz',
      role: Roles.Supplier
    };
    let invOperation = await this.invitationService.sendInvitation(this.testTenantId, invitationCMD);
    if (invOperation.status.toString() === 'Success') {
      // register that user
      const createUser = <RegisterUserCommand>{
        title: 'Mr',
        name: 'UserName123',
        lastName: 'UserLastname',
        email: invitationCMD.emailAddress,
        phone: '12112121',
        country: 'abc',
        city: 'abc',
        address: 'abc',
        department: 'abc',
        isAdmin: null,
        id: null,
        companyId: this.companyId,
        invitationEmail: invitationCMD.emailAddress,
        role: Roles.Supplier,
        isTestUser: true,
        subject: `testUser${Guid.createGuid()}`
      };
      this.user = await this.usersService.registerTestUser(this.testTenantId, createUser);

      console.log(this.user.email);
      if (this.user && this.user.email === createUser.email) {
        return TestResult.success();
      }
    }

    return TestResult.failure('Test Failed');
  }

  async cleanup(): Promise<void> {
    // await this.notificationTopicService.delete(this.testTenantId, this.topicId);
    // await this.notificationTemplateService.delete(<DeleteNotificationTemplateCommand>{ tenantId: this.testTenantId, id: this.templateId });
    await this.usersService.deleteUserById(this.ctx.tenantId, this.user.id);
    await super.cleanup();
  }
}

@Injectable()
export class CreateUserTestService extends CreateUserBaseTestService {
  constructor(companyService: CompanyService, tenantService: TenantsService, usersService: UsersService) {
    super(companyService, tenantService, usersService);
  }

  async test(): Promise<TestResult> {
    await this.prepareTestData();

    if (this.user && this.user.email === this.createUser.email) {
      return TestResult.success();
    }

    return TestResult.failure('Test Failed');
  }
}

@Injectable()
export class DeactivateUserTestService extends CreateUserBaseTestService {
  constructor(
    companyService: CompanyService,
    tenantService: TenantsService,
    usersService: UsersService,
    private deactivatedUsersService: DeactivatedUsersService
  ) {
    super(companyService, tenantService, usersService);
  }

  async test(): Promise<TestResult> {
    await this.prepareTestData();

    await this.usersService.deactivateUser(this.ctx.tenantId, this.user.id);
    const allTenantUsers = await this.usersService.searchByTenant(this.ctx.tenantId);
    // the user shall not be available in the list of tenant users after deactivation
    if (allTenantUsers.items.find((user) => user.id === this.user.id)) {
      return TestResult.failure('Deactivate test failed,user stillin the tenant users list');
    }
    return TestResult.success();
  }
  async cleanup(): Promise<void> {
    await this.deactivatedUsersService.deleteDeactivatedUser(this.ctx.tenantId, this.user.id);
    await super.cleanup();
  }
}

@Injectable()
export class GetDeactivatedUsersTestService extends CreateUserBaseTestService {
  constructor(
    companyService: CompanyService,
    tenantService: TenantsService,
    usersService: UsersService,
    private deactivatedUsersService: DeactivatedUsersService
  ) {
    super(companyService, tenantService, usersService);
  }

  async test(): Promise<TestResult> {
    await this.prepareTestData();

    await this.usersService.deactivateUser(this.ctx.tenantId, this.user.id);

    const deactivatedUsers = await this.deactivatedUsersService.getDeactivatedUsers(this.ctx.tenantId);

    if (deactivatedUsers && deactivatedUsers.total) {
      return TestResult.success();
    }

    return TestResult.failure('Test failed');
  }

  async cleanup(): Promise<void> {
    await this.deactivatedUsersService.deleteDeactivatedUser(this.ctx.tenantId, this.user.id);
    await super.cleanup();
  }
}

@Injectable()
export class ReactivateUserTestService extends CreateUserBaseTestService {
  constructor(
    companyService: CompanyService,
    tenantService: TenantsService,
    usersService: UsersService,
    private deactivatedUsersService: DeactivatedUsersService
  ) {
    super(companyService, tenantService, usersService);
  }

  async test(): Promise<TestResult> {
    await this.prepareTestData();

    await this.usersService.deactivateUser(this.ctx.tenantId, this.user.id);

    await this.deactivatedUsersService.reactivateDeactivatedUser(this.ctx.tenantId, this.user.id);

    return TestResult.success();
  }
  async cleanup(): Promise<void> {
    await super.cleanup();
  }
}

@Injectable()
export class UnsubscribeUserEmailTestService extends RawDataBaseTestService {
  constructor(
    userService: UsersService,
    notificationTemplateService: NotificationTemplateService,
    notificationTopicService: NotificationTopicService,
    tenantsFieldHelper: TenantFieldsHelper,
    companyService: CompanyService,
    schemaHelper: SchemaHelper,
    mappingsService: MappingsService,
    dynamicEntitiesService: DynamicEntitiesService,
    private notificationsService: NotificationsTriggerService,
    private unsubscribeService: UnsubscribeEmailService
  ) {
    super(
      userService,
      notificationTemplateService,
      notificationTopicService,
      tenantsFieldHelper,
      companyService,
      schemaHelper,
      dynamicEntitiesService,
      mappingsService
    );
  }
  async test(): Promise<TestResult> {
    await this.prepareRawDataTestData();
    await this.notificationsService.triggerSendingNotifications(this.ctx.tenantId);

    const hash = await this.unsubscribeService.generateHash(this.userId, this.topicId);
    const email = (await this.userService.getById(this.userId)).email;

    await this.unsubscribeService.unsubscribeUserEmail(hash, email);

    return TestResult.success();
  }
}
