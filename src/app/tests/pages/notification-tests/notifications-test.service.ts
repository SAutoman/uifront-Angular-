import { Injectable } from '@angular/core';
import { GDCCasesTemplate } from '@wfm/notification-templates/gdc-case-template-file';
import {
  AreaTypeEnum,
  CaseStatus,
  CompanyService,
  CreateDynamicEntityDto,
  CreateWorkflowCommand,
  CreateWorkflowStateCommand,
  DeleteWorkflowStateCommand,
  DynamicEntitiesService,
  FieldTypeIds,
  GetWorkflowStateQuery,
  Invitation,
  InvitationToolService,
  MappingsService,
  Paging,
  Roles,
  SchemaDto,
  SchemasService,
  UpdateSchemaCommand,
  User,
  UsersService,
  WorkflowService,
  WorkflowStateService,
  WorkflowStatusService
} from '@wfm/service-layer';
import { CreateMappingDto } from '@wfm/service-layer/models/mappings';
import { DeleteNotificationTemplateCommand } from '@wfm/service-layer/models/notificationTemplate';
import { CaseSchemaService } from '@wfm/service-layer/services/case-schema.service';
import { NotificationTemplateService } from '@wfm/service-layer/services/notification-template.service';
import {
  CreateUpdateNotificationTopicCommand,
  NotificationTopicService,
  TopicKindEnum,
  TopicSendTypeEnum
} from '@wfm/service-layer/services/notification-topic.service';
import { NotificationsTriggerService } from '@wfm/service-layer/services/notifications-trigger.service';
import { Guid } from '@wfm/shared/guid';
import { TestResult } from '@wfm/tests/models';
import { ITestService, TestContext } from '../app-tests/create-app-test.service';
import { SchemaHelper } from '../helpers/schemaHelper';
import { StatusHelper } from '../helpers/statusHelper';
import { TenantFieldsHelper } from '../helpers/tenantFieldsHelper';
import { InvitationTemplate } from './invitation-template-file';
import { GDCNewRawDataTemplate, invitationsTemplate } from './notification-template-file';

export abstract class NotificationsTestService implements ITestService {
  protected ctx: TestContext;

  async initialize(ctx: TestContext): Promise<void> {
    this.ctx = ctx;
  }

  abstract test(): Promise<TestResult>;

  abstract cleanup(): Promise<void>;
}

export class CaseBaseTestService extends NotificationsTestService {
  private templateId: string;
  protected topicId: string;
  private tenantFieldIds: string[] = [];
  private workflowStateId: string;
  private companyId: string;
  private workflowSchemaId: string;
  private rawDataId: string;
  private rawDataSchemaId: string;
  private supplierMappingsId: string;
  private auditorMappingsId: string;
  private statusIds = [];
  private userIds = [];

  protected caseSchemaId: string;
  protected caseId: string;

  constructor(
    protected notificationService: NotificationsTriggerService,
    protected caseSchemaService: CaseSchemaService,
    protected tenantsFieldHelper: TenantFieldsHelper,
    protected workflowStateService: WorkflowStateService,
    protected workflowService: WorkflowService,
    protected companyService: CompanyService,
    protected notificationTemplateService: NotificationTemplateService,
    protected notificationTopicService: NotificationTopicService,
    protected statusHelper: StatusHelper,
    protected schemaHelper: SchemaHelper,
    protected dynamicEntitiesService: DynamicEntitiesService,
    protected mappingsService: MappingsService,
    private userService: UsersService
  ) {
    super();
  }

  async prepareCaseTestData() {
    const template = GDCCasesTemplate;
    const templateOperation = await this.notificationTemplateService.create({
      name: 'topicTestTemplate',
      tenantId: this.ctx.tenantId,
      logoId: '',
      template: template
    });

    this.templateId = templateOperation.targetId;

    const command = <CreateUpdateNotificationTopicCommand>{
      days: 0,
      topicKind: TopicKindEnum.Cases,
      topicTemplateId: this.templateId,
      roles: [Roles.Supplier, Roles.Auditor],
      name: 'Cases',
      subject: 'Cases',
      description: 'this is the latest Case'
    };

    const opTopic = await this.notificationTopicService.create(this.ctx.tenantId, command);
    this.topicId = opTopic.targetId;

    const stringField = await this.tenantsFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.StringField,
      [AreaTypeEnum.rawData],
      'articleName',
      'test',
      []
    );

    this.tenantFieldIds.push(stringField.id);

    const rawDataSchema = await this.schemaHelper.createSchema(this.ctx.tenantId, 'rawDataSchema', AreaTypeEnum.rawData, [stringField], []);

    this.rawDataSchemaId = rawDataSchema.id;

    const rawDataOperation = await this.dynamicEntitiesService.create({
      areaType: AreaTypeEnum.rawData,
      schemaId: rawDataSchema.id,
      tenantId: this.ctx.tenantId,
      appId: this.ctx.appId,
      fields: [
        {
          id: 'articleName',
          type: FieldTypeIds.StringField,
          value: 'test'
        }
      ]
    });

    this.rawDataId = rawDataOperation.targetId;

    const caseNameField = await this.tenantsFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.StringField,
      [AreaTypeEnum.case],
      'caseName',
      'test',
      []
    );

    var rawDataSchemaField = await this.tenantsFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.ListOfLinksField,
      [AreaTypeEnum.rawData],
      'rawDataSchema',
      'rawDataSchema',
      []
    );

    this.tenantFieldIds.push(caseNameField.id);

    const createCaseSchemaCommand = <SchemaDto>{
      name: 'caseSchema',
      areaType: AreaTypeEnum.case,
      tenantId: this.ctx.tenantId,
      functions: [],
      status: CaseStatus.Open,
      fields: [
        {
          id: caseNameField.id
        },
        {
          id: rawDataSchemaField.id,
          configuration: {
            schemaAreaType: AreaTypeEnum.rawData,
            schemaId: rawDataSchema.id
          }
        }
      ]
    };

    const caseSchemaOperation = await this.caseSchemaService.createCaseSchema(createCaseSchemaCommand);

    this.caseSchemaId = caseSchemaOperation.targetId;

    const caseSchema = await this.caseSchemaService.getCaseSchema(this.caseSchemaId, this.ctx.tenantId);

    const field = createCaseSchemaCommand.fields.find((x) => x.fieldName === 'rawDataIds');

    if (field) {
      field.value = [this.rawDataId];
      await this.caseSchemaService.updateCaseSchema(<UpdateSchemaCommand>{ id: caseSchema.id, newTemplate: caseSchema }, this.ctx.tenantId);
    }

    this.tenantFieldIds.push(field.id);

    const open = await this.statusHelper.createStatus(this.ctx.tenantId, 'Open', 0);
    const inProgress = await this.statusHelper.createStatus(this.ctx.tenantId, 'InProgress', 1);

    this.statusIds.push(open.id, inProgress.id);

    const createWorkflowCommand = <CreateWorkflowCommand>{
      name: 'case',
      caseSchemaId: this.caseSchemaId,
      tenantId: this.ctx.tenantId,
      statuses: [open.id, inProgress.id]
    };

    const workflowSchemaOperation = await this.workflowService.create(createWorkflowCommand);

    this.workflowSchemaId = workflowSchemaOperation.targetId;

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
      companyId: this.companyId,
      role: Roles.Supplier,
      subject: `test.useremailsupplier1@cargoclix.com-${Guid.createGuid()}`,
      isTestUser: true
    });

    const auditor = await this.userService.createUser(this.ctx.tenantId, <User>{
      email: 'test.useremailauditor1@cargoclix.com',
      name: 'testAuditor',
      companyId: this.companyId,
      role: Roles.Auditor,
      subject: `test.useremailauditor1@cargoclix.com-${Guid.createGuid()}'`,
      isTestUser: true
    });

    this.userIds.push(auditor.id, supplier.id);

    const mappingData: CreateMappingDto = {
      companyId: this.companyId,
      schemaId: this.caseSchemaId,
      areaType: AreaTypeEnum.case,
      searchMask: {
        filters: [
          {
            fieldName: 'caseName',
            id: this.caseSchemaId,
            searchType: 3,
            value: 'test',
            valueType: 2
          }
        ]
      },
      tenantId: this.ctx.tenantId
    };

    const supplierMappings = await this.mappingsService.createSupplier(this.ctx.tenantId, mappingData);
    const auditorMappings = await this.mappingsService.createAuditor(this.ctx.tenantId, mappingData);

    this.supplierMappingsId = supplierMappings.targetId;
    this.auditorMappingsId = auditorMappings.targetId;

    const createCaseCommand = <CreateDynamicEntityDto>{
      areaType: AreaTypeEnum.case,
      schemaId: this.caseSchemaId,
      tenantId: this.ctx.tenantId,
      appId: this.ctx.appId,
      fields: [
        {
          id: 'caseName',
          type: FieldTypeIds.StringField,
          value: 'test'
        },
        {
          id: 'rawDataIds',
          type: FieldTypeIds.ListOfLinksField,
          value: [this.rawDataId]
        }
      ]
    };

    const workflowStateOperation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
      tenantId: this.ctx.tenantId,
      schemaId: this.workflowSchemaId,
      case: createCaseCommand
    });

    this.workflowStateId = workflowStateOperation.targetId;
    var workflowState = await this.workflowStateService.get(<GetWorkflowStateQuery>{
      tenant: this.ctx.tenantId,
      schemaId: this.workflowSchemaId,
      id: this.workflowStateId
    });

    this.caseId = workflowState.case.id;
  }

  async test(): Promise<TestResult> {
    throw new Error('This method is not implemented');
  }

  async cleanup(): Promise<void> {
    await this.mappingsService.deleteSupplier(this.ctx.tenantId, this.supplierMappingsId);
    await this.mappingsService.deleteAuditor(this.ctx.tenantId, this.auditorMappingsId);
    await this.workflowStateService.delete(<DeleteWorkflowStateCommand>{
      id: this.workflowStateId,
      tenant: this.ctx.tenantId,
      schemaId: this.workflowSchemaId
    });
    await this.workflowService.delete(this.workflowSchemaId, this.ctx.tenantId);
    await this.dynamicEntitiesService.deleteById(this.ctx.tenantId, this.rawDataId, this.rawDataSchemaId, AreaTypeEnum.rawData);
    await this.schemaHelper.removeRawDataSchema();
    const statusCalls = this.statusIds.map((statusId) => this.statusHelper.deleteStatus(this.ctx.tenantId, statusId));
    await Promise.all(statusCalls);
    await Promise.all(this.tenantFieldIds.map((x) => this.tenantsFieldHelper.deleteTenantField(x, this.ctx.tenantId)));
    await this.companyService.deleteById(this.companyId);
    await this.notificationTopicService.delete(this.ctx.tenantId, this.topicId);
    await this.notificationTemplateService.delete(<DeleteNotificationTemplateCommand>{ tenantId: this.ctx.tenantId, id: this.templateId });
    const userCalls = this.userIds.map((x) => this.userService.deleteUserById(this.ctx.tenantId, x));
    await Promise.all(userCalls);
  }
}

export class RawDataBaseTestService extends NotificationsTestService {
  private tenantFieldIds: string[] = [];
  protected companyIds: string[] = [];
  protected rawDataSchemaId: string;
  protected rawDataId: string;
  private templateId: string;
  protected topicId: string;
  protected userId: string;
  private supplierMappingsId: string;

  constructor(
    protected userService: UsersService,
    private notificationTemplateService: NotificationTemplateService,
    private notificationTopicService: NotificationTopicService,
    private tenantsFieldHelper: TenantFieldsHelper,
    protected companyService: CompanyService,
    private schemaHelper: SchemaHelper,
    protected dynamicEntitiesService: DynamicEntitiesService,
    private mappingsService: MappingsService
  ) {
    super();
  }

  async prepareRawDataTestData() {
    const template: string = GDCNewRawDataTemplate;

    const templateOperation = await this.notificationTemplateService.create({
      name: 'topicTestTemplate',
      tenantId: this.ctx.tenantId,
      logoId: '',
      template: template
    });

    this.templateId = templateOperation.targetId;

    const command = <CreateUpdateNotificationTopicCommand>{
      days: 0,
      topicKind: TopicKindEnum.NewRawData,
      topicTemplateId: this.templateId,
      name: 'NewRawData',
      subject: 'NewRawData',
      description: 'this is the latest NewRawData'
    };

    const opTopic = await this.notificationTopicService.create(this.ctx.tenantId, command);
    this.topicId = opTopic.targetId;

    const stringField = await this.tenantsFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.StringField,
      [AreaTypeEnum.rawData],
      'articleName',
      'articleName',
      []
    );

    this.tenantFieldIds.push(stringField.id);

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

    this.companyIds.push(company.id);

    const supplier = await this.userService.createUser(this.ctx.tenantId, <User>{
      email: 'test.useremailsupplier1@cargoclix.com',
      name: 'testSupplier',
      companyId: company.id,
      role: Roles.Supplier,
      subject: `test.useremailsupplier1@cargoclix.com-${Guid.createGuid()}`,
      isTestUser: true
    });

    this.userId = supplier.id;

    const rawDataSchema = await this.schemaHelper.createSchema(this.ctx.tenantId, 'rawDataSchema', AreaTypeEnum.rawData, [stringField], []);

    this.rawDataSchemaId = rawDataSchema.id;

    const mappingData: CreateMappingDto = {
      companyId: company.id,
      schemaId: this.rawDataSchemaId,
      searchMask: {
        filters: [
          {
            fieldName: 'articleName',
            id: this.rawDataSchemaId,
            searchType: 3,
            value: 'test',
            valueType: 2
          }
        ]
      },
      tenantId: this.ctx.tenantId
    };

    const supplierMappings = await this.mappingsService.createSupplier(this.ctx.tenantId, mappingData);

    this.supplierMappingsId = supplierMappings.targetId;

    const rawDataOperation = await this.dynamicEntitiesService.create({
      areaType: AreaTypeEnum.rawData,
      schemaId: rawDataSchema.id,
      tenantId: this.ctx.tenantId,
      appId: this.ctx.appId,
      fields: [
        {
          id: 'articleName',
          type: FieldTypeIds.StringField,
          value: 'test'
        }
      ]
    });

    this.rawDataId = rawDataOperation.targetId;
  }
  async test(): Promise<TestResult> {
    throw new Error('This method is not implemented.');
  }

  async cleanup(): Promise<void> {
    await this.mappingsService.deleteSupplier(this.ctx.tenantId, this.supplierMappingsId);
    await this.dynamicEntitiesService.deleteById(this.ctx.tenantId, this.rawDataId, this.rawDataSchemaId, AreaTypeEnum.rawData);
    await this.notificationTopicService.delete(this.ctx.tenantId, this.topicId);
    await this.notificationTemplateService.delete(<DeleteNotificationTemplateCommand>{ tenantId: this.ctx.tenantId, id: this.templateId });
    await Promise.all(this.tenantFieldIds.map((x) => this.tenantsFieldHelper.deleteTenantField(x, this.ctx.tenantId)));
    await this.schemaHelper.removeRawDataSchema();
    await this.userService.deleteUserById(this.ctx.tenantId, this.userId);
    await Promise.all(this.companyIds.map((x) => this.companyService.deleteById(x)));
  }
}

@Injectable()
export class SendNotificationTestService extends RawDataBaseTestService {
  constructor(
    userService: UsersService,
    notificationTemplateService: NotificationTemplateService,
    notificationTopicService: NotificationTopicService,
    tenantsFieldHelper: TenantFieldsHelper,
    companyService: CompanyService,
    schemaHelper: SchemaHelper,
    mappingsService: MappingsService,
    dynamicEntitiesService: DynamicEntitiesService,
    private notificationsService: NotificationsTriggerService
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
    await this.notificationsService.triggerSendingNotificationsByTopic(this.ctx.tenantId, this.topicId);
    return TestResult.success();
  }
}

@Injectable()
export class SendTwoNotificationsWithTheSameTemplateTestService extends RawDataBaseTestService {
  constructor(
    userService: UsersService,
    notificationTemplateService: NotificationTemplateService,
    notificationTopicService: NotificationTopicService,
    tenantsFieldHelper: TenantFieldsHelper,
    companyService: CompanyService,
    schemaHelper: SchemaHelper,
    mappingsService: MappingsService,
    dynamicEntitiesService: DynamicEntitiesService,
    private notificationsService: NotificationsTriggerService
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
    await this.notificationsService.triggerSendingNotificationsByTopic(this.ctx.tenantId, this.topicId);

    const company2 = await this.companyService.create({
      email: 'gergana.naydenova@cargoclix.com',
      // email: 'nikolay.borisov@cargoclix.com',
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

    this.companyIds.push(company2.id);

    await this.notificationsService.triggerSendingNotificationsByTopic(this.ctx.tenantId, this.topicId);

    return TestResult.success();
  }
}

@Injectable()
export class SendNotificationForCaseTestService extends CaseBaseTestService {
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
    userService: UsersService
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
    await this.notificationService.triggerSendingNotificationsByTopic(this.ctx.tenantId, this.topicId);

    return TestResult.success();
  }
}

@Injectable()
export class SendTwoNotificationsWithTheSameTemplateForCaseTestService extends CaseBaseTestService {
  public companyIds = [];
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
    userService: UsersService
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
    const company = await this.companyService.create({
      email: 'gergana.naydenova@cargoclix.com',
      // email: 'nikolay.borisov@cargoclix.com',
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

    await this.notificationService.triggerSendingNotificationsByTopic(this.ctx.tenantId, this.topicId);

    const company2 = await this.companyService.create({
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

    this.companyIds.push(company.id, company2.id);

    await this.notificationService.triggerSendingNotificationsByTopic(this.ctx.tenantId, this.topicId);

    return TestResult.success();
  }
  async cleanup(): Promise<void> {
    await super.cleanup();
    await Promise.all(this.companyIds.map((x) => this.companyService.deleteById(x)));
  }
}

@Injectable()
export class SendNotificationForInvitationTestService extends NotificationsTestService {
  private templateId: string;
  private topicId: string;

  constructor(
    private notificationTopicService: NotificationTopicService,
    private notificationTemplateService: NotificationTemplateService,
    private invitationsToolService: InvitationToolService
  ) {
    super();
  }
  async test(): Promise<TestResult> {
    const template = InvitationTemplate;

    const templateOperation = await this.notificationTemplateService.create({
      name: 'topicTestTemplate',
      tenantId: this.ctx.tenantId,
      logoId: '',
      template: template
    });

    this.templateId = templateOperation.targetId;

    const command = <CreateUpdateNotificationTopicCommand>{
      days: 0,
      topicKind: TopicKindEnum.Invitations,
      topicTemplateId: this.templateId,
      name: 'invitation',
      subject: 'Invitation',
      description: 'this is the latest invitation template'
    };

    const opTopic = await this.notificationTopicService.create(this.ctx.tenantId, command);
    this.topicId = opTopic.targetId;

    await this.invitationsToolService.sendInvitation(this.ctx.tenantId, <Invitation>{
      emailAddress: 'user11@mail.zz',
      role: Roles.Tenant
    });

    return TestResult.success();
  }

  async cleanup(): Promise<void> {
    await this.notificationTopicService.delete(this.ctx.tenantId, this.topicId);
    await this.notificationTemplateService.delete(<DeleteNotificationTemplateCommand>{ id: this.templateId, tenantId: this.ctx.tenantId });
  }
}

@Injectable()
export class SeedNewRawDataConfigurationsTestService extends NotificationsTestService {
  constructor(
    private notificationTopicService: NotificationTopicService,
    private notificationTemplateService: NotificationTemplateService
  ) {
    super();
  }

  async test(): Promise<TestResult> {
    const templateForNewRawData = GDCNewRawDataTemplate;

    const templateRawDataOperation = await this.notificationTemplateService.create({
      name: 'RawData Notification',
      tenantId: this.ctx.tenantId,
      logoId: '',
      template: templateForNewRawData
    });

    const rawDataNotificationTopicCommand: CreateUpdateNotificationTopicCommand = {
      days: 21,
      name: 'Notification topic for new RawDatas',
      topicTemplateId: templateRawDataOperation.targetId,
      topicKind: TopicKindEnum.RawDataNotProcessed,
      topicSendType: TopicSendTypeEnum.Email,
      description: 'Notification on newly added rawData-s',
      subject: 'Notification on newly added rawData-s',
      roles: [Roles.Supplier]
    };
    const notificationTopicOperation = await this.notificationTopicService.create(this.ctx.tenantId, rawDataNotificationTopicCommand);

    /* Manual Subscription Code */
    // if (notificationTopicOperation.status.toString().toLowerCase() === 'success') {
    //   this.userTopicService.subscribe({
    //     notificationTopicId: notificationTopicOperation.targetId,
    //     tenantId: this.tenant,
    //     userId: '6E1A64F60933AB4699FF87D18C89684C'
    //   });
    // }

    return TestResult.success();
  }
  async cleanup(): Promise<void> {}
}

@Injectable()
export class SeedNewWorkflowConfigurationsTestService extends NotificationsTestService {
  constructor(
    private notificationTemplateService: NotificationTemplateService,
    private notificationTopicService: NotificationTopicService
  ) {
    super();
  }

  async test(): Promise<TestResult> {
    const templateForDelayedCases = GDCCasesTemplate;

    const templateWorkflowOperation = await this.notificationTemplateService.create({
      name: 'Workflow Notification',
      tenantId: this.ctx.tenantId,
      logoId: '',
      template: templateForDelayedCases
    });

    const caseDelayedFor14DaysNotificationTopicCommand: CreateUpdateNotificationTopicCommand = {
      days: 14,
      name: 'Notification topic for delayed cases for 14 days',
      topicTemplateId: templateWorkflowOperation.targetId,
      topicKind: TopicKindEnum.Cases,
      topicSendType: TopicSendTypeEnum.Email,
      subject: 'Notification on delayed cases for 14 days',
      description: 'Notification on delayed cases for 14 days',
      roles: [Roles.Supplier, Roles.Auditor]
    };

    const caseDelayedFor21DaysNotificationTopicCommand: CreateUpdateNotificationTopicCommand = {
      days: 21,
      name: 'Notification topic for delayed cases for 21 days',
      topicTemplateId: templateWorkflowOperation.targetId,
      topicKind: TopicKindEnum.Cases,
      topicSendType: TopicSendTypeEnum.Email,
      subject: 'Notification on delayed cases for 21 days',
      description: 'Notification on delayed cases for 21 days',
      roles: [Roles.Supplier, Roles.Auditor]
    };

    const notificationTopicCase14DaysOperation = await this.notificationTopicService.create(
      this.ctx.tenantId,
      caseDelayedFor14DaysNotificationTopicCommand
    );
    const notificationTopicCase21DaysOperation = await this.notificationTopicService.create(
      this.ctx.tenantId,
      caseDelayedFor21DaysNotificationTopicCommand
    );

    return TestResult.success();
  }
  async cleanup(): Promise<void> {}
}

@Injectable()
export class SeedInvitationConfigurationsTestService extends NotificationsTestService {
  constructor(
    private notificationTemplateService: NotificationTemplateService,
    private notificationTopicService: NotificationTopicService
  ) {
    super();
  }

  async test(): Promise<TestResult> {
    const templateForInvitations = invitationsTemplate;

    const templateInvitationOperation = await this.notificationTemplateService.create({
      name: 'Invitation to the EUTR online system of Gries Deco Company',
      tenantId: this.ctx.tenantId,
      logoId: '',
      template: templateForInvitations
    });

    const invitationsNotificationTopicCommand: CreateUpdateNotificationTopicCommand = {
      days: 0,
      name: 'Invitation to the EUTR online system of Gries Deco Company',
      topicTemplateId: templateInvitationOperation.targetId,
      topicKind: TopicKindEnum.Invitations,
      topicSendType: TopicSendTypeEnum.Email,
      subject: 'Invitation to the EUTR online system of Gries Deco Company',
      description: 'Invitation to the EUTR online system of Gries Deco Company',
      roles: []
    };

    const invitationsOperation = await this.notificationTopicService.create(this.ctx.tenantId, invitationsNotificationTopicCommand);

    return TestResult.success();
  }
  async cleanup(): Promise<void> {}
}

@Injectable()
export class CreateSupplierMappingAndRawDataTestService extends NotificationsTestService {
  private tenantFieldId: string;
  private rawDataSchemaId: string;
  private companyId: string;
  private supplierMappingsId: string;

  constructor(
    private tenantsFieldHelper: TenantFieldsHelper,
    private schemaHelper: SchemaHelper,
    private mappingsService: MappingsService,
    private schemaService: SchemasService,
    private companyService: CompanyService
  ) {
    super();
  }

  async test(): Promise<TestResult> {
    /**
     * Code for Raw data
     */

    const stringField = await this.tenantsFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.StringField,
      [AreaTypeEnum.rawData],
      'articleName',
      'test',
      []
    );

    this.tenantFieldId = stringField.id;

    const rawDataSchema = await this.schemaHelper.createSchema(this.ctx.tenantId, 'rawDataSchema', AreaTypeEnum.rawData, [stringField], []);

    this.rawDataSchemaId = rawDataSchema.id;

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

    /**
     * Code for Supplier mappings
     */
    const mappingData: CreateMappingDto = {
      companyId: company.id,
      schemaId: rawDataSchema.id,
      areaType: AreaTypeEnum.rawData,
      searchMask: {
        filters: [
          {
            fieldName: 'articleName',
            id: '2912D50E8A8B2A44BD7FDE7C69A2B77B',
            searchType: 3,
            value: 'test',
            valueType: 2
          }
        ]
      },
      tenantId: this.ctx.tenantId
    };

    const supplierMappings = await this.mappingsService.createSupplier(this.ctx.tenantId, mappingData);
    this.supplierMappingsId = supplierMappings.targetId;
    if (supplierMappings.status.toString().toLowerCase() === 'success') {
      return TestResult.success();
    } else {
      return TestResult.failure('Test Failed');
    }
  }

  async cleanup(): Promise<void> {
    await this.mappingsService.deleteSupplier(this.ctx.tenantId, this.supplierMappingsId);
    await this.tenantsFieldHelper.deleteTenantField(this.tenantFieldId, this.ctx.tenantId);
    await this.schemaService.deleteById(this.rawDataSchemaId, this.ctx.tenantId, AreaTypeEnum.rawData);
    await this.companyService.deleteById(this.companyId);
  }
}

@Injectable()
export class CreateSupplierAndAuditorMappingAndCaseTestService extends NotificationsTestService {
  private schemaId: string;
  private statusIds: string[] = [];
  private companyId: string;
  private supplierMappingsId: string;

  constructor(
    private schemaHelper: SchemaHelper,
    private statusHelper: StatusHelper,
    private statusService: WorkflowStatusService,
    private mappingsService: MappingsService,
    private schemaService: SchemasService,
    private companyService: CompanyService
  ) {
    super();
  }

  async test(): Promise<TestResult> {
    const caseSchema = await this.schemaHelper.createSchema(this.ctx.tenantId, 'caseSchema', AreaTypeEnum.case, [], []);
    this.schemaId = caseSchema.id;

    const open = await this.statusHelper.createStatus(this.ctx.tenantId, 'Open', 0);
    const inProgress = await this.statusHelper.createStatus(this.ctx.tenantId, 'InProgress', 1);

    this.statusIds.push(open.id, inProgress.id);

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

    const mappingData: CreateMappingDto = {
      companyId: company.id,
      schemaId: caseSchema.id,
      areaType: AreaTypeEnum.case,
      searchMask: {
        filters: [
          {
            fieldName: 'articleName',
            id: '2912D50E8A8B2A44BD7FDE7C69A2B77B',
            searchType: 3,
            value: 'test',
            valueType: 2
          }
        ]
      },
      tenantId: this.ctx.tenantId
    };

    const supplierMappings = await this.mappingsService.createSupplier(this.ctx.tenantId, mappingData);
    this.supplierMappingsId = supplierMappings.targetId;
    const auditorMappings = await this.mappingsService.createAuditor(this.ctx.tenantId, mappingData);
    if (supplierMappings.status.toString().toLowerCase() === 'success' && auditorMappings.status.toString().toLowerCase() === 'success') {
      return TestResult.success();
    } else {
      return TestResult.failure('Test Failed');
    }
  }

  async cleanup(): Promise<void> {
    await this.mappingsService.deleteSupplier(this.ctx.tenantId, this.supplierMappingsId);
    await Promise.all(this.statusIds.map((x) => this.statusService.delete(this.ctx.tenantId, x)));
    await this.schemaService.deleteById(this.schemaId, this.ctx.tenantId, AreaTypeEnum.case);
    await this.companyService.deleteById(this.companyId);
  }
}

@Injectable()
export class ClearNotificationConfigurationsTestService extends NotificationsTestService {
  constructor(
    private notificationTopicService: NotificationTopicService,
    private notificationTemplateService: NotificationTemplateService
  ) {
    super();
  }
  async test(): Promise<TestResult> {
    const paging: Paging = { skip: 0, take: 9999 };
    const allNotificationTopics =
      (
        await this.notificationTopicService.search(this.ctx.tenantId, {
          paging: paging
        })
      )?.items || [];
    let allNotificationTopicsPromises = allNotificationTopics.map((item) => {
      return this.notificationTopicService.delete(this.ctx.tenantId, item.id);
    });

    await Promise.all(allNotificationTopicsPromises);

    const allNotificationTemplates = (await this.notificationTemplateService.search(this.ctx.tenantId, { paging: paging }))?.items || [];

    let allNotificationTemplatesPromises = allNotificationTemplates.map((y) => {
      return this.notificationTemplateService.delete({ tenantId: this.ctx.tenantId, id: y.id });
    });

    await Promise.all(allNotificationTemplatesPromises);

    return TestResult.success();
  }

  async cleanup(): Promise<void> {}
}
