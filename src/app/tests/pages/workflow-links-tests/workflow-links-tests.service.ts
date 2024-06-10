import { Injectable } from '@angular/core';
import {
  AreaTypeEnum,
  FieldTypeIds,
  OperationStatus,
  SchemasService,
  Operation,
  CreateProcessStepEntityCmd,
  ProcessStepEntityDto,
  WorkflowResolutionDto,
  ProcessStepEntityService,
  ProcessStepLinkService,
  CreateProcessStepLinkDtoNew,
  Roles
} from '@wfm/service-layer';
import { CaseFieldLinkService } from '@wfm/service-layer/services/case-field-link.service';
import { CreateFieldLinkDto } from '@wfm/tenant-admin/workflows/workflow-field-link/field-link.model';
import { TestResult } from '@wfm/tests/models';
import { ITestService, TestContext } from '../app-tests/create-app-test.service';
import { SchemaHelper } from '../helpers/schemaHelper';
import { StatusHelper } from '../helpers/statusHelper';
import { TenantFieldsHelper } from '../helpers/tenantFieldsHelper';
import { WorkflowHelper } from '../helpers/workflowHelper';

export class WorkflowLinkBaseTestService implements ITestService {
  protected ctx: TestContext;
  protected tenantFieldId: string;
  protected schemaFieldId: string;
  protected schemaId: string;
  protected caseSchemaId: string;
  protected workflowId: string;
  protected statusId: string;

  constructor(
    private schemaHelper: SchemaHelper,
    private statusHelper: StatusHelper,
    private tenantFieldHelper: TenantFieldsHelper,
    private workflowHelper: WorkflowHelper,
    private schemaService: SchemasService
  ) {}
  async initialize(ctx: TestContext): Promise<void> {
    this.ctx = ctx;

    const caseSchema = await this.schemaHelper.createSchema(this.ctx.tenantId, 'schema-link-schema-create', AreaTypeEnum.case, [], []);

    this.caseSchemaId = caseSchema.id;

    const open = await this.statusHelper.createStatus(this.ctx.tenantId, 'open', 0);
    this.statusId = open.id;
    const workflow = await this.workflowHelper.createWorkflow('schema-link-workflow-create', this.ctx.tenantId, caseSchema.id, [open.id]);

    this.workflowId = workflow.id;

    const tenantField = await this.tenantFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.StringField,
      [AreaTypeEnum.case],
      'name',
      'Name',
      []
    );
    this.tenantFieldId = tenantField.id;

    const fields = await this.schemaHelper.createSchemaFields([tenantField]);
    const schema = await this.schemaHelper.createSchema(this.ctx.tenantId, 'schemaLinkSchemaCreate', AreaTypeEnum.case, fields, []);
    this.schemaFieldId = schema.fields[0].id;
    this.schemaId = schema.id;
  }

  async test(): Promise<TestResult> {
    throw new Error('This method is not implemented.');
  }

  async cleanup(): Promise<void> {
    await this.workflowHelper.deleteWorkflow(this.ctx.tenantId, this.workflowId);
    await this.schemaService.deleteById(this.caseSchemaId, this.ctx.tenantId, AreaTypeEnum.case);
    await this.schemaService.deleteById(this.schemaId, this.ctx.tenantId, AreaTypeEnum.case);
    await this.tenantFieldHelper.deleteTenantField(this.tenantFieldId, this.ctx.tenantId);
    await this.statusHelper.deleteStatus(this.ctx.tenantId, this.statusId);
  }
}

export class WorkflowFieldLinkBaseTestService extends WorkflowLinkBaseTestService {
  protected ctx: TestContext;
  protected tenantFieldId: string;
  protected schemaFieldId: string;
  protected schemaFieldLinkOperation: Operation;
  protected schemaId: string;
  protected caseSchemaId: string;
  protected workflowId: string;
  protected statusId: string;

  constructor(
    schemaHelper: SchemaHelper,
    statusHelper: StatusHelper,
    tenantFieldHelper: TenantFieldsHelper,
    workflowHelper: WorkflowHelper,
    schemaService: SchemasService,
    protected fieldLinkService: CaseFieldLinkService
  ) {
    super(schemaHelper, statusHelper, tenantFieldHelper, workflowHelper, schemaService);
  }
  async initialize(ctx: TestContext): Promise<void> {
    await super.initialize(ctx);
    const cmd: CreateFieldLinkDto = {
      tenantId: this.ctx.tenantId,
      workflowSchemaId: this.workflowId,
      schemaFieldId: this.schemaFieldId,
      caseFieldLinkOverrides: [
        {
          name: 'name1',
          workflowStatusIds: [],
          roles: [Roles.Supplier],
          userGroupIds: [],
          caseFieldLinkOverrideRights: {
            canEdit: false,
            canView: false
          }
        }
      ]
    };

    const operation = await this.fieldLinkService.create(cmd);

    this.schemaFieldLinkOperation = operation;
  }

  async test(): Promise<TestResult> {
    throw new Error('This method is not implemented.');
  }

  async cleanup(): Promise<void> {
    try {
      // in case fieldLink is already removed in the test
      await this.fieldLinkService.delete(this.ctx.tenantId, this.schemaFieldLinkOperation.targetId);
    } catch (error) {
      console.log(error);
    } finally {
      await super.cleanup();
    }
  }
}

export class WorkflowProcessStepLinkBaseTestService extends WorkflowLinkBaseTestService {
  protected ctx: TestContext;
  protected stepLinkOperation: Operation;
  protected refName: string;
  protected stepId: string;

  constructor(
    schemaHelper: SchemaHelper,
    statusHelper: StatusHelper,
    tenantFieldHelper: TenantFieldsHelper,
    workflowHelper: WorkflowHelper,
    schemaService: SchemasService,
    protected processStepLinkService: ProcessStepLinkService,
    protected processStepEntityService: ProcessStepEntityService
  ) {
    super(schemaHelper, statusHelper, tenantFieldHelper, workflowHelper, schemaService);
  }
  async initialize(ctx: TestContext): Promise<void> {
    await super.initialize(ctx);

    const step = await this.createProcessStepEntity('process-step-get', 'process-step-get', this.schemaId, []);

    this.stepId = step.id;

    const cmd: CreateProcessStepLinkDtoNew = {
      refName: 'test',
      tenantId: this.ctx.tenantId,
      workflowId: this.workflowId,
      processStepEntityId: step.id
    };

    this.refName = cmd.refName;

    const operation = await this.processStepLinkService.createNew(cmd);

    this.stepLinkOperation = operation;
  }

  async test(): Promise<TestResult> {
    throw new Error('This method is not implemented.');
  }

  async cleanup(): Promise<void> {
    await this.processStepLinkService.delete(this.ctx.tenantId, this.stepLinkOperation.targetId);
    await this.processStepEntityService.delete(this.ctx.tenantId, this.stepId);
    await super.cleanup();
  }

  private async createProcessStepEntity(
    name: string,
    refName: string,
    schemaId: string,
    resolutions: WorkflowResolutionDto[]
  ): Promise<ProcessStepEntityDto> {
    const cmd: CreateProcessStepEntityCmd = {
      name: name,
      actions: [],
      // refName: refName,
      schemaId: schemaId,
      resolutions: resolutions,
      tenantId: this.ctx.tenantId
    };
    const operation = await this.processStepEntityService.create(cmd);
    const result = await this.processStepEntityService.get(this.ctx.tenantId, operation.targetId);

    return result;
  }
}

@Injectable()
export class CreateWorkflowFieldLinkTestService extends WorkflowFieldLinkBaseTestService {
  constructor(
    schemaHelper: SchemaHelper,
    statusHelper: StatusHelper,
    tenantFieldHelper: TenantFieldsHelper,
    workflowHelper: WorkflowHelper,
    schemaService: SchemasService,
    fieldLinkService: CaseFieldLinkService
  ) {
    super(schemaHelper, statusHelper, tenantFieldHelper, workflowHelper, schemaService, fieldLinkService);
  }

  async test(): Promise<TestResult> {
    const operationStatusEnum: OperationStatus = OperationStatus[this.schemaFieldLinkOperation.status.toString()];

    if (operationStatusEnum === OperationStatus.Success) {
      return TestResult.success();
    }

    return TestResult.failure('Test Failed');
  }
}

@Injectable()
export class GetWorkflowFieldLinkTestService extends WorkflowFieldLinkBaseTestService {
  constructor(
    schemaHelper: SchemaHelper,
    statusHelper: StatusHelper,
    tenantFieldHelper: TenantFieldsHelper,
    workflowHelper: WorkflowHelper,
    schemaService: SchemasService,
    fieldLinkService: CaseFieldLinkService
  ) {
    super(schemaHelper, statusHelper, tenantFieldHelper, workflowHelper, schemaService, fieldLinkService);
  }

  async test(): Promise<TestResult> {
    const link = await this.fieldLinkService.getById(this.ctx.tenantId, this.schemaFieldLinkOperation.targetId);

    if (link.workflowSchemaId === this.workflowId) {
      return TestResult.success();
    }

    return TestResult.failure('Test Failed');
  }
}

@Injectable()
export class DeleteWorkflowFieldLinkTestService extends WorkflowFieldLinkBaseTestService {
  constructor(
    schemaHelper: SchemaHelper,
    statusHelper: StatusHelper,
    tenantFieldHelper: TenantFieldsHelper,
    workflowHelper: WorkflowHelper,
    schemaService: SchemasService,
    fieldLinkService: CaseFieldLinkService
  ) {
    super(schemaHelper, statusHelper, tenantFieldHelper, workflowHelper, schemaService, fieldLinkService);
  }

  async test(): Promise<TestResult> {
    const deleteOperation = await this.fieldLinkService.delete(this.ctx.tenantId, this.schemaFieldLinkOperation.targetId);

    const operationStatusEnum: OperationStatus = OperationStatus[deleteOperation.status.toString()];

    if (operationStatusEnum === OperationStatus.Success) {
      return TestResult.success();
    }

    return TestResult.failure('Test Failed');
  }
}

@Injectable()
export class CreateWorkflowProcessStepLinkTestService extends WorkflowProcessStepLinkBaseTestService {
  constructor(
    schemaHelper: SchemaHelper,
    statusHelper: StatusHelper,
    tenantFieldHelper: TenantFieldsHelper,
    workflowHelper: WorkflowHelper,
    schemaService: SchemasService,
    processStepLinkService: ProcessStepLinkService,
    processStepEntityService: ProcessStepEntityService
  ) {
    super(schemaHelper, statusHelper, tenantFieldHelper, workflowHelper, schemaService, processStepLinkService, processStepEntityService);
  }

  async test(): Promise<TestResult> {
    const operationStatusEnum: OperationStatus = OperationStatus[this.stepLinkOperation.status.toString()];

    if (operationStatusEnum === OperationStatus.Success) {
      return TestResult.success();
    }
  }
}

@Injectable()
export class GetWorkflowProcessStepLinkTestService extends WorkflowProcessStepLinkBaseTestService {
  constructor(
    schemaHelper: SchemaHelper,
    statusHelper: StatusHelper,
    tenantFieldHelper: TenantFieldsHelper,
    workflowHelper: WorkflowHelper,
    schemaService: SchemasService,
    processStepLinkService: ProcessStepLinkService,
    processStepEntityService: ProcessStepEntityService
  ) {
    super(schemaHelper, statusHelper, tenantFieldHelper, workflowHelper, schemaService, processStepLinkService, processStepEntityService);
  }

  async test(): Promise<TestResult> {
    const link = await this.processStepLinkService.get(this.ctx.tenantId, this.stepLinkOperation.targetId);

    if (link.workflowId === this.workflowId) {
      return TestResult.success();
    }

    return TestResult.failure('Test Failed');
  }
}

@Injectable()
export class GetWorkflowProcessStepLinkWithParentTestService extends WorkflowProcessStepLinkBaseTestService {
  private childStepLinkId: string;

  constructor(
    schemaHelper: SchemaHelper,
    statusHelper: StatusHelper,
    tenantFieldHelper: TenantFieldsHelper,
    workflowHelper: WorkflowHelper,
    schemaService: SchemasService,
    processStepLinkService: ProcessStepLinkService,
    processStepEntityService: ProcessStepEntityService
  ) {
    super(schemaHelper, statusHelper, tenantFieldHelper, workflowHelper, schemaService, processStepLinkService, processStepEntityService);
  }

  async initialize(ctx: TestContext): Promise<void> {
    await super.initialize(ctx);

    const createStepLinkCmd = <CreateProcessStepLinkDtoNew>{
      processStepEntityId: this.stepId,
      tenantId: this.ctx.tenantId,
      parentId: this.stepLinkOperation.targetId,
      expression: {},
      workflowId: this.workflowId,
      refName: 'test-child'
    };

    this.childStepLinkId = (await this.processStepLinkService.createNew(createStepLinkCmd)).targetId;
  }

  async test(): Promise<TestResult> {
    const link = await this.processStepLinkService.get(this.ctx.tenantId, this.childStepLinkId);

    if (link.parentId === this.stepLinkOperation.targetId && link.parentRefName === this.refName) {
      return TestResult.success();
    }

    return TestResult.failure('Test Failed');
  }
}

@Injectable()
export class DeleteWorkflowProcessStepLinkTestService extends WorkflowProcessStepLinkBaseTestService {
  constructor(
    schemaHelper: SchemaHelper,
    statusHelper: StatusHelper,
    tenantFieldHelper: TenantFieldsHelper,
    workflowHelper: WorkflowHelper,
    schemaService: SchemasService,
    processStepLinkService: ProcessStepLinkService,
    processStepEntityService: ProcessStepEntityService
  ) {
    super(schemaHelper, statusHelper, tenantFieldHelper, workflowHelper, schemaService, processStepLinkService, processStepEntityService);
  }

  async test(): Promise<TestResult> {
    const deleteOperation = await this.processStepLinkService.delete(this.ctx.tenantId, this.stepLinkOperation.targetId);

    const operationStatusEnum: OperationStatus = OperationStatus[deleteOperation.status.toString()];

    if (operationStatusEnum === OperationStatus.Success) {
      return TestResult.success();
    }

    return TestResult.failure('Test Failed');
  }
}
