import { Injectable } from '@angular/core';
import {
  AreaTypeEnum,
  CompanyService,
  DynamicEntitiesService,
  MappingsService,
  UsersService,
  WorkflowService,
  WorkflowStateService
} from '@wfm/service-layer';
import { CaseEmailAuditService } from '@wfm/service-layer/services/case-email-audit.service';
import { CaseSchemaService } from '@wfm/service-layer/services/case-schema.service';
import { EmailAuditService } from '@wfm/service-layer/services/email-audit.service';
import { NotificationTemplateService } from '@wfm/service-layer/services/notification-template.service';
import { NotificationTopicService } from '@wfm/service-layer/services/notification-topic.service';
import { NotificationsTriggerService } from '@wfm/service-layer/services/notifications-trigger.service';
import { RawDataEmailAuditService } from '@wfm/service-layer/services/raw-data-email-audit.service';
import { TestResult } from '@wfm/tests/models';
import { ITestService, TestContext } from '../app-tests/create-app-test.service';
import { SchemaHelper } from '../helpers/schemaHelper';
import { StatusHelper } from '../helpers/statusHelper';
import { TenantFieldsHelper } from '../helpers/tenantFieldsHelper';
import { CaseBaseTestService, RawDataBaseTestService } from '../notification-tests/notifications-test.service';

@Injectable()
export class GetRawDataEmailAuditIdsTestService extends RawDataBaseTestService {
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
    private rawDataEmailAuditService: RawDataEmailAuditService
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

    const emailAduitIds = await this.rawDataEmailAuditService.getIds(this.ctx.tenantId, this.rawDataId);

    if (emailAduitIds.length && emailAduitIds[0]) {
      return TestResult.success();
    }
    return TestResult.failure('Test failed');
  }

  async cleanup(): Promise<void> {
    await this.rawDataEmailAuditService.deleteEmailAudits(this.ctx.tenantId, this.rawDataId);
    await super.cleanup();
  }
}

@Injectable()
export class GetRawDataEmailAuditTestService extends RawDataBaseTestService {
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
    private rawDataEmailAuditService: RawDataEmailAuditService
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

    const emailAduitIds = await this.rawDataEmailAuditService.getIds(this.ctx.tenantId, this.rawDataId);

    if (!emailAduitIds.length || !emailAduitIds[0]) {
      return TestResult.failure('Test failed');
    }

    const emailAudit = await this.rawDataEmailAuditService.getEmailAuditById(this.ctx.tenantId, emailAduitIds[0]);

    return emailAudit.to && emailAudit.to.length && emailAudit.from ? TestResult.success() : TestResult.failure('Test failed');
  }

  async cleanup(): Promise<void> {
    await this.rawDataEmailAuditService.deleteEmailAudits(this.ctx.tenantId, this.rawDataId);
    await super.cleanup();
  }
}

@Injectable()
export class GetRawDataEmailAuditsTestService extends RawDataBaseTestService {
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
    private rawDataEmailAuditService: RawDataEmailAuditService
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

    const emailAduits = await this.rawDataEmailAuditService.getAllEmailAuditsByRawDataId(this.ctx.tenantId, this.rawDataId);

    if (emailAduits && emailAduits.length && emailAduits[0].from && emailAduits[0].to && emailAduits[0].to.length) {
      return TestResult.success();
    }

    return TestResult.failure('Test failed');
  }

  async cleanup(): Promise<void> {
    await this.rawDataEmailAuditService.deleteEmailAudits(this.ctx.tenantId, this.rawDataId);
    await super.cleanup();
  }
}

@Injectable()
export class GetRawDataEmailAuditCountTestService extends RawDataBaseTestService {
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
    private rawDataEmailAuditService: RawDataEmailAuditService
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

    const emailAduitCount = await this.rawDataEmailAuditService.getEmailAuditCount(this.ctx.tenantId, this.rawDataId);

    return emailAduitCount > 0 ? TestResult.success() : TestResult.failure('Test failed');
  }

  async cleanup(): Promise<void> {
    await this.rawDataEmailAuditService.deleteEmailAudits(this.ctx.tenantId, this.rawDataId);
    await super.cleanup();
  }
}

@Injectable()
export class GetCaseEmailAuditIdsTestService extends CaseBaseTestService {
  constructor(
    notificationService: NotificationsTriggerService,
    caseSchemaService: CaseSchemaService,
    tenantsFieldHelper: TenantFieldsHelper,
    workflowStateService: WorkflowStateService,
    workflowService: WorkflowService,
    companyService: CompanyService,
    notificationTemplateService: NotificationTemplateService,
    notificationTopicService: NotificationTopicService,
    statusHelper: StatusHelper,
    schemaHelper: SchemaHelper,
    dynamicEntitiesService: DynamicEntitiesService,
    mappingsService: MappingsService,
    userService: UsersService,
    private caseEmailAuditService: CaseEmailAuditService
  ) {
    super(
      notificationService,
      caseSchemaService,
      tenantsFieldHelper,
      workflowStateService,
      workflowService,
      companyService,
      notificationTemplateService,
      notificationTopicService,
      statusHelper,
      schemaHelper,
      dynamicEntitiesService,
      mappingsService,
      userService
    );
  }

  async test(): Promise<TestResult> {
    await this.prepareCaseTestData();
    await this.notificationService.triggerSendingNotifications(this.ctx.tenantId);

    const emailAduitIds = await this.caseEmailAuditService.getIds(this.ctx.tenantId, this.caseId);

    if (emailAduitIds.length && emailAduitIds[0]) {
      return TestResult.success();
    }
    return TestResult.failure('Test failed');
  }

  async cleanup(): Promise<void> {
    await this.caseEmailAuditService.deleteEmailAudits(this.ctx.tenantId, this.caseId);
    await super.cleanup();
  }
}

@Injectable()
export class GetCaseEmailAuditTestService extends CaseBaseTestService {
  constructor(
    notificationService: NotificationsTriggerService,
    caseSchemaService: CaseSchemaService,
    tenantsFieldHelper: TenantFieldsHelper,
    workflowStateService: WorkflowStateService,
    workflowService: WorkflowService,
    companyService: CompanyService,
    notificationTemplateService: NotificationTemplateService,
    notificationTopicService: NotificationTopicService,
    statusHelper: StatusHelper,
    schemaHelper: SchemaHelper,
    dynamicEntitiesService: DynamicEntitiesService,
    mappingsService: MappingsService,
    userService: UsersService,
    private caseEmailAuditService: CaseEmailAuditService
  ) {
    super(
      notificationService,
      caseSchemaService,
      tenantsFieldHelper,
      workflowStateService,
      workflowService,
      companyService,
      notificationTemplateService,
      notificationTopicService,
      statusHelper,
      schemaHelper,
      dynamicEntitiesService,
      mappingsService,
      userService
    );
  }

  async test(): Promise<TestResult> {
    await this.prepareCaseTestData();
    await this.notificationService.triggerSendingNotifications(this.ctx.tenantId);

    const emailAduitIds = await this.caseEmailAuditService.getIds(this.ctx.tenantId, this.caseId);

    if (!emailAduitIds.length || !emailAduitIds[0]) {
      return TestResult.failure('Test failed');
    }

    const emailAudit = await this.caseEmailAuditService.getEmailAuditById(this.ctx.tenantId, emailAduitIds[0]);

    return emailAudit.to && emailAudit.to.length && emailAudit.from ? TestResult.success() : TestResult.failure('Test failed');
  }

  async cleanup(): Promise<void> {
    await this.caseEmailAuditService.deleteEmailAudits(this.ctx.tenantId, this.caseId);
    await super.cleanup();
  }
}

@Injectable()
export class GetCaseEmailAuditsTestService extends CaseBaseTestService {
  constructor(
    notificationService: NotificationsTriggerService,
    caseSchemaService: CaseSchemaService,
    tenantsFieldHelper: TenantFieldsHelper,
    workflowStateService: WorkflowStateService,
    workflowService: WorkflowService,
    companyService: CompanyService,
    notificationTemplateService: NotificationTemplateService,
    notificationTopicService: NotificationTopicService,
    statusHelper: StatusHelper,
    schemaHelper: SchemaHelper,
    dynamicEntitiesService: DynamicEntitiesService,
    mappingsService: MappingsService,
    userService: UsersService,
    private caseEmailAuditService: CaseEmailAuditService
  ) {
    super(
      notificationService,
      caseSchemaService,
      tenantsFieldHelper,
      workflowStateService,
      workflowService,
      companyService,
      notificationTemplateService,
      notificationTopicService,
      statusHelper,
      schemaHelper,
      dynamicEntitiesService,
      mappingsService,
      userService
    );
  }

  async test(): Promise<TestResult> {
    await this.prepareCaseTestData();
    await this.notificationService.triggerSendingNotifications(this.ctx.tenantId);

    const emailAduits = await this.caseEmailAuditService.getAllEmailAuditsByCaseId(this.ctx.tenantId, this.caseId);

    if (emailAduits && emailAduits.length && emailAduits[0].from && emailAduits[0].to && emailAduits[0].to.length) {
      return TestResult.success();
    }

    return TestResult.failure('Test failed');
  }

  async cleanup(): Promise<void> {
    await this.caseEmailAuditService.deleteEmailAudits(this.ctx.tenantId, this.caseId);
    await super.cleanup();
  }
}

@Injectable()
export class GetCaseEmailAuditCountTestService extends CaseBaseTestService {
  constructor(
    notificationService: NotificationsTriggerService,
    caseSchemaService: CaseSchemaService,
    tenantsFieldHelper: TenantFieldsHelper,
    workflowStateService: WorkflowStateService,
    workflowService: WorkflowService,
    companyService: CompanyService,
    notificationTemplateService: NotificationTemplateService,
    notificationTopicService: NotificationTopicService,
    statusHelper: StatusHelper,
    schemaHelper: SchemaHelper,
    dynamicEntitiesService: DynamicEntitiesService,
    mappingsService: MappingsService,
    userService: UsersService,
    private caseEmailAuditService: CaseEmailAuditService
  ) {
    super(
      notificationService,
      caseSchemaService,
      tenantsFieldHelper,
      workflowStateService,
      workflowService,
      companyService,
      notificationTemplateService,
      notificationTopicService,
      statusHelper,
      schemaHelper,
      dynamicEntitiesService,
      mappingsService,
      userService
    );
  }

  async test(): Promise<TestResult> {
    await this.prepareCaseTestData();
    await this.notificationService.triggerSendingNotifications(this.ctx.tenantId);

    const emailAduitCount = await this.caseEmailAuditService.getEmailAuditCount(this.ctx.tenantId, this.caseId);

    return emailAduitCount > 0 ? TestResult.success() : TestResult.failure('Test failed');
  }

  async cleanup(): Promise<void> {
    await this.caseEmailAuditService.deleteEmailAudits(this.ctx.tenantId, this.caseId);
    await super.cleanup();
  }
}

@Injectable()
export class SearchRawDataTestService extends RawDataBaseTestService {
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
    private rawDataEmailAuditService: RawDataEmailAuditService
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

    const rawDataEntities = await this.dynamicEntitiesService.search(AreaTypeEnum.rawData, this.ctx.tenantId, this.rawDataSchemaId);

    if (rawDataEntities.items && rawDataEntities.items.length && rawDataEntities.items[0].emailCount) {
      return TestResult.success();
    }
    return TestResult.failure('Test failed');
  }

  async cleanup(): Promise<void> {
    await this.rawDataEmailAuditService.deleteEmailAudits(this.ctx.tenantId, this.rawDataId);
    await super.cleanup();
  }
}

@Injectable()
export class GetRawDataByIdTestService extends RawDataBaseTestService {
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
    private rawDataEmailAuditService: RawDataEmailAuditService
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

    const rawDataEntity = await this.dynamicEntitiesService.getById(
      this.ctx.tenantId,
      this.rawDataId,
      this.rawDataSchemaId,
      AreaTypeEnum.rawData
    );

    if (rawDataEntity && rawDataEntity.emailCount) {
      return TestResult.success();
    }

    return TestResult.failure('Test failed');
  }

  async cleanup(): Promise<void> {
    await this.rawDataEmailAuditService.deleteEmailAudits(this.ctx.tenantId, this.rawDataId);
    await super.cleanup();
  }
}

@Injectable()
export class SearchCaseTestService extends CaseBaseTestService {
  constructor(
    notificationService: NotificationsTriggerService,
    caseSchemaService: CaseSchemaService,
    tenantsFieldHelper: TenantFieldsHelper,
    workflowStateService: WorkflowStateService,
    workflowService: WorkflowService,
    companyService: CompanyService,
    notificationTemplateService: NotificationTemplateService,
    notificationTopicService: NotificationTopicService,
    statusHelper: StatusHelper,
    schemaHelper: SchemaHelper,
    dynamicEntitiesService: DynamicEntitiesService,
    mappingsService: MappingsService,
    userService: UsersService,
    private caseEmailAuditService: CaseEmailAuditService
  ) {
    super(
      notificationService,
      caseSchemaService,
      tenantsFieldHelper,
      workflowStateService,
      workflowService,
      companyService,
      notificationTemplateService,
      notificationTopicService,
      statusHelper,
      schemaHelper,
      dynamicEntitiesService,
      mappingsService,
      userService
    );
  }

  async test(): Promise<TestResult> {
    await this.prepareCaseTestData();
    await this.notificationService.triggerSendingNotifications(this.ctx.tenantId);

    const caseEntities = await this.dynamicEntitiesService.search(AreaTypeEnum.case, this.ctx.tenantId, this.caseSchemaId);

    if (caseEntities.items && caseEntities.items.length && caseEntities.items[0].emailCount) {
      return TestResult.success();
    }
    return TestResult.failure('Test failed');
  }

  async cleanup(): Promise<void> {
    await this.caseEmailAuditService.deleteEmailAudits(this.ctx.tenantId, this.caseId);
    await super.cleanup();
  }
}

@Injectable()
export class GetCaseByIdTestService extends CaseBaseTestService {
  constructor(
    notificationService: NotificationsTriggerService,
    caseSchemaService: CaseSchemaService,
    tenantsFieldHelper: TenantFieldsHelper,
    workflowStateService: WorkflowStateService,
    workflowService: WorkflowService,
    companyService: CompanyService,
    notificationTemplateService: NotificationTemplateService,
    notificationTopicService: NotificationTopicService,
    statusHelper: StatusHelper,
    schemaHelper: SchemaHelper,
    dynamicEntitiesService: DynamicEntitiesService,
    mappingsService: MappingsService,
    userService: UsersService,
    private caseEmailAuditService: CaseEmailAuditService
  ) {
    super(
      notificationService,
      caseSchemaService,
      tenantsFieldHelper,
      workflowStateService,
      workflowService,
      companyService,
      notificationTemplateService,
      notificationTopicService,
      statusHelper,
      schemaHelper,
      dynamicEntitiesService,
      mappingsService,
      userService
    );
  }

  async test(): Promise<TestResult> {
    await this.prepareCaseTestData();
    await this.notificationService.triggerSendingNotifications(this.ctx.tenantId);

    const caseEntity = await this.dynamicEntitiesService.getById(this.ctx.tenantId, this.caseId, this.caseSchemaId, AreaTypeEnum.case);

    if (caseEntity && caseEntity.emailCount) {
      return TestResult.success();
    }
    return TestResult.failure('Test failed');
  }

  async cleanup(): Promise<void> {
    await this.caseEmailAuditService.deleteEmailAudits(this.ctx.tenantId, this.caseId);
    await super.cleanup();
  }
}

@Injectable()
export class DeleteAllEmailAuditsOlderThanTestService implements ITestService {
  constructor(private emailAuditsService: EmailAuditService) {}

  async initialize(ctx: TestContext): Promise<void> {}

  async test(): Promise<TestResult> {
    await this.emailAuditsService.deleteAllOlderThan(new Date().toUTCString());

    return TestResult.success();
  }

  async cleanup(): Promise<void> {}
}
