import { Injectable } from '@angular/core';
import {
  FieldTypeIds,
  AreaTypeEnum,
  CreateDynamicEntityDto,
  CreateWorkflowStateCommand,
  GetWorkflowStateQuery,
  DynamicEntitiesService,
  ProcessStepEntityService,
  ProcessStepLinkService,
  WorkflowStateService,
  IFieldBaseDto,
  CreateProcessStepLinkDtoNew,
  CreateStatusCommand,
  StatusConfiguration,
  UpdateStepCommand,
  VisualElement,
  WorkflowResolutionDto,
  CreateProcessStepEntityCmd,
  ProcessStepEntityDto,
  SchemaDto,
  DeleteStepCommand,
  UpdateStatusCommand,
  ProcessStepLinkBaseOverrideDto,
  IBaseFieldConfiguration,
  SchemasService,
  WorkflowRightsEnum
} from '@wfm/service-layer';
import {
  RawDataToCaseEventDto,
  EventTypes,
  SourceToDestinationWithPath,
  StepToCaseEventDto,
  UpdateStatusBasedOnStepAddedEvent,
  StepToRawDataEventDto,
  AutomaticAddStepsEventDto,
  UpdateCaseStatusBasedOnStepResolutionEventDto,
  DifferenceCalculationEventDto,
  UpdateRawDataBasedOnCaseEventDto,
  MathExpressionCalculationEvent
} from '@wfm/service-layer/models/actionDto';
import { PropertyPath } from '@wfm/service-layer/models/expressionModel';
import {
  StringFieldValueDto,
  ListOfLinkFieldValueDto,
  IntFieldValueDto,
  DecimalFieldValueDto,
  EmbededFieldValueDto
} from '@wfm/service-layer/models/FieldValueDto';
import { TestResult } from '@wfm/tests/models';
import { DateTime } from 'luxon';
import { ITestService, TestContext } from '../app-tests/create-app-test.service';
import { SchemaHelper } from '../helpers/schemaHelper';
import { StatusHelper } from '../helpers/statusHelper';
import { TenantFieldsHelper } from '../helpers/tenantFieldsHelper';
import { WorkflowHelper } from '../helpers/workflowHelper';

export class WorkflowActionEventsBaseTestService implements ITestService {
  protected ctx: TestContext;
  protected fieldIds: string[] = [];
  protected stepSchemaIds: string[] = [];
  protected caseSchemaIds: string[] = [];
  protected workflowId: string;
  protected workflowStateId: string;
  protected statusIds: string[] = [];
  protected deleteStepCommands: DeleteStepCommand[] = [];
  protected stepLinkIds: string[] = [];

  constructor(
    private processStepEntityService: ProcessStepEntityService,
    protected tenantFieldHelper: TenantFieldsHelper,
    protected schemaHelper: SchemaHelper,
    protected workflowHelper: WorkflowHelper,
    protected statusHelper: StatusHelper,
    protected workflowStateService: WorkflowStateService,
    protected processStepLinkService: ProcessStepLinkService
  ) {}

  async initialize(ctx: TestContext): Promise<void> {
    this.ctx = ctx;
  }
  async test(): Promise<TestResult> {
    throw new Error('Method not implemented.');
  }
  async cleanup(): Promise<void> {
    await Promise.all(this.deleteStepCommands.map((cmd) => this.workflowStateService.deleteStep(cmd)));
    await Promise.all(this.stepLinkIds.map((id) => this.processStepLinkService.delete(this.ctx.tenantId, id)));
    await this.workflowStateService.delete({ id: this.workflowStateId, tenant: this.ctx.tenantId, schemaId: this.workflowId });
    await this.workflowHelper.deleteWorkflow(this.ctx.tenantId, this.workflowId);
    await Promise.all(this.stepSchemaIds.map((id) => this.schemaHelper.deleteSchema(this.ctx.tenantId, id, AreaTypeEnum.stepForm)));
    await Promise.all(this.caseSchemaIds.map((id) => this.schemaHelper.deleteSchema(this.ctx.tenantId, id, AreaTypeEnum.case)));
    await Promise.all(this.statusIds.map((id) => this.statusHelper.deleteStatus(this.ctx.tenantId, id)));
    await Promise.all(this.fieldIds.map((id) => this.tenantFieldHelper.deleteTenantField(id, this.ctx.tenantId)));
  }

  protected async createProcessStepEntity(
    name: string,
    schemaId: string,
    resolutions: WorkflowResolutionDto[]
  ): Promise<ProcessStepEntityDto> {
    const cmd: CreateProcessStepEntityCmd = {
      name: name,
      actions: [],
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
export class RawDataToCaseTestService extends WorkflowActionEventsBaseTestService {
  private rawDataId: string;
  private rawDataSchemaId: string;
  private rawDataLinkField: IFieldBaseDto;
  private caseStringTenantField: IFieldBaseDto;

  constructor(
    statusHelper: StatusHelper,
    workflowStateService: WorkflowStateService,
    schemaHelper: SchemaHelper,
    workflowHelper: WorkflowHelper,
    tenantFieldHelper: TenantFieldsHelper,
    processStepEntityService: ProcessStepEntityService,
    processStepLinkService: ProcessStepLinkService,
    private dynamicEntityService: DynamicEntitiesService
  ) {
    super(
      processStepEntityService,
      tenantFieldHelper,
      schemaHelper,
      workflowHelper,
      statusHelper,
      workflowStateService,
      processStepLinkService
    );
  }

  async initialize(ctx: TestContext): Promise<void> {
    await super.initialize(ctx);

    const rawDataStringTenantField = await this.tenantFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.StringField,
      [AreaTypeEnum.rawData],
      'coolField',
      'coolField',
      []
    );
    const caseStringTenantField = await this.tenantFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.StringField,
      [AreaTypeEnum.case],
      'coolField',
      'coolField',
      []
    );

    this.caseStringTenantField = caseStringTenantField;

    const rawDataSchema = await this.schemaHelper.createSchema(
      this.ctx.tenantId,
      'rawData',
      AreaTypeEnum.rawData,
      [rawDataStringTenantField],
      []
    );

    this.rawDataSchemaId = rawDataSchema.id;

    const rawDataLinkField = await this.tenantFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.ListOfLinksField,
      [AreaTypeEnum.case],
      'rawDataIds',
      'rawDataIds',
      [],
      {
        position: 0,
        schemaId: rawDataSchema.id,
        schemaAreaType: rawDataSchema.areaType
      }
    );

    this.rawDataLinkField = rawDataLinkField;

    this.fieldIds.push(rawDataStringTenantField.id, caseStringTenantField.id, rawDataLinkField.id);

    const rawDataOperation = await this.dynamicEntityService.create(<CreateDynamicEntityDto>{
      appId: this.ctx.appId,
      areaType: rawDataSchema.areaType,
      fields: [
        <StringFieldValueDto>{
          id: rawDataStringTenantField.fieldName,
          type: FieldTypeIds.StringField,
          value: 'im from rawData'
        }
      ],
      schemaId: rawDataSchema.id,
      tenantId: this.ctx.tenantId
    });
    this.rawDataId = rawDataOperation.targetId;

    const caseSchema = await this.schemaHelper.createSchema(
      this.ctx.tenantId,
      'case-schema126',
      AreaTypeEnum.case,
      [caseStringTenantField, rawDataLinkField],
      []
    );

    this.caseSchemaIds.push(caseSchema.id);

    const open = await this.statusHelper.createStatus(this.ctx.tenantId, 'Open', 0);
    this.statusIds.push(open.id);

    const workflow = await this.workflowHelper.createWorkflow(
      'workflow',
      this.ctx.tenantId,
      caseSchema.id,
      [open.id],
      [
        <RawDataToCaseEventDto>{
          id: undefined,
          eventType: EventTypes.RawDataToCase,
          name: 'qwert',
          sourceToDestination: [
            <SourceToDestinationWithPath>{
              destination: { path: [caseStringTenantField.fieldName] },
              source: { path: [rawDataStringTenantField.fieldName] }
            }
          ]
        }
      ],
      [],
      [],
      []
    );
    this.workflowId = workflow.id;
    await this.workflowHelper.setDefaultStatus(workflow.id, open.id, this.ctx.tenantId);

    const listOfLinksField = <ListOfLinkFieldValueDto>{
      id: rawDataLinkField.fieldName,
      type: FieldTypeIds.ListOfLinksField,
      value: [rawDataOperation.targetId]
    };

    const caseValue: CreateDynamicEntityDto = {
      appId: this.ctx.appId,
      areaType: AreaTypeEnum.case,
      tenantId: this.ctx.tenantId,
      fields: [
        listOfLinksField,
        <StringFieldValueDto>{
          id: caseStringTenantField.fieldName,
          type: FieldTypeIds.StringField,
          value: 'im from case'
        }
      ],
      schemaId: caseSchema.id
    };

    const stateOperation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
      tenantId: this.ctx.tenantId,
      case: caseValue,
      schemaId: workflow.id
    });

    this.workflowStateId = stateOperation.targetId;
  }

  async test(): Promise<TestResult> {
    const query: GetWorkflowStateQuery = {
      id: this.workflowStateId,
      tenant: this.ctx.tenantId,
      schemaId: this.workflowId
    };

    let state = await this.workflowStateService.get(query);

    // 1. the RawData field value ("im from rawData") is to be copied into the case field
    // 2. the RawData id is to be kept inside the respective ListOfLinks field in the case
    if (
      state.case.fields.find((x) => x.id === this.caseStringTenantField.fieldName && x.value === 'im from rawData') &&
      state.case.fields.find((x) => x.id === this.rawDataLinkField.fieldName && x.value?.length)
    ) {
      return TestResult.success();
    }

    return TestResult.failure('Test failed');
  }
  async cleanup(): Promise<void> {
    await this.dynamicEntityService.deleteById(this.ctx.tenantId, this.rawDataId, this.rawDataSchemaId, AreaTypeEnum.rawData);
    await this.schemaHelper.deleteSchema(this.ctx.tenantId, this.rawDataSchemaId, AreaTypeEnum.rawData);
    await super.cleanup();
  }
}

@Injectable()
export class ResetStepToCaseTestSerivce extends WorkflowActionEventsBaseTestService {
  private resolutions: WorkflowResolutionDto[];
  private caseField1: IFieldBaseDto;
  private stepDE: CreateDynamicEntityDto;
  private createStepCommand: UpdateStepCommand;
  private stepEntityPublicId: string;
  private stepSchema: SchemaDto;

  constructor(
    schemaHelper: SchemaHelper,
    workflowHelper: WorkflowHelper,
    workflowStateService: WorkflowStateService,
    statusHelper: StatusHelper,
    tenantFieldHelper: TenantFieldsHelper,
    processStepEntityService: ProcessStepEntityService,
    processStepLinkService: ProcessStepLinkService
  ) {
    super(
      processStepEntityService,
      tenantFieldHelper,
      schemaHelper,
      workflowHelper,
      statusHelper,
      workflowStateService,
      processStepLinkService
    );
  }

  async initialize(ctx: TestContext): Promise<void> {
    await super.initialize(ctx);

    const resolutions: WorkflowResolutionDto[] = [
      {
        name: 'Success'
      },
      {
        name: 'Fail'
      }
    ];

    this.resolutions = resolutions;

    const stepField1 = await this.tenantFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.IntField,
      [AreaTypeEnum.stepForm],
      'stepField',
      'step Field',
      []
    );

    const caseField1 = await this.tenantFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.IntField,
      [AreaTypeEnum.case],
      'caseField',
      'case Field',
      []
    );

    this.caseField1 = caseField1;

    this.fieldIds.push(stepField1.id, caseField1.id);

    const stepSchema = await this.schemaHelper.createSchema(this.ctx.tenantId, 'stepSchema', AreaTypeEnum.stepForm, [stepField1], []);
    this.stepSchema = stepSchema;

    this.stepSchemaIds.push(stepSchema.id);

    const step = await this.createProcessStepEntity('stepEntity', stepSchema.id, resolutions);
    const stepDE: CreateDynamicEntityDto = {
      areaType: stepSchema.areaType,
      fields: [
        <IntFieldValueDto>{
          id: stepField1.fieldName,
          type: FieldTypeIds.IntField,
          value: 10
        }
      ],
      appId: this.ctx.appId,
      schemaId: stepSchema.id,
      tenantId: this.ctx.tenantId
    };

    this.stepDE = stepDE;

    const caseSchema = await this.schemaHelper.createSchema(this.ctx.tenantId, 'caseSchema', AreaTypeEnum.case, [caseField1], []);

    this.caseSchemaIds.push(caseSchema.id);

    const caseDE: CreateDynamicEntityDto = {
      appId: this.ctx.appId,
      areaType: AreaTypeEnum.case,
      fields: [],
      schemaId: caseSchema.id,
      tenantId: this.ctx.tenantId
    };

    const workflowStatusOperation = await this.workflowHelper.createStatusWithUniqueName(<CreateStatusCommand>{
      name: 'statusForWorkflowSchema',
      tenantId: this.ctx.tenantId,
      position: 0,
      configuration: <StatusConfiguration>{
        color: 'green',
        label: 'done'
      }
    });

    this.statusIds.push(workflowStatusOperation.targetId);

    const workflow = await this.workflowHelper.createWorkflow('workflow', this.ctx.tenantId, caseSchema.id, [
      workflowStatusOperation.targetId
    ]);

    this.workflowId = workflow.id;

    await this.workflowHelper.setDefaultStatus(workflow.id, workflowStatusOperation.targetId, this.ctx.tenantId);

    this.stepLinkIds.push(
      (
        await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
          workflowId: workflow.id,
          workflowStatusId: workflowStatusOperation.targetId,
          refName: 'stepEntity',
          processStepEntityId: step.id,
          tenantId: this.ctx.tenantId,
          defaultOverride: {
            rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanResolve, WorkflowRightsEnum.CanDelete],
            expression: {},
            numberOfInstances: 1,
            onProcessStepResolvedEvents: [
              <StepToCaseEventDto>{
                id: undefined,
                eventType: EventTypes.StepToCase,
                name: 'somename',
                sourceToDestination: [
                  {
                    source: { path: [stepField1.fieldName] },
                    destination: { path: [caseField1.fieldName] }
                  }
                ]
              }
            ]
          }
        })
      ).targetId
    );

    const stateOperation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
      tenantId: this.ctx.tenantId,
      case: caseDE,
      schemaId: workflow.id
    });

    this.workflowStateId = stateOperation.targetId;

    let visualElements: VisualElement[] = [
      {
        id: 'idGeneratedFromFrontEnd1',
        index: 0
      }
    ];
    const createStepCommand = <UpdateStepCommand>{
      stepDynamicEntities: [],
      refName: 'stepEntity',
      resolution: '',
      stepSchemaId: stepSchema.id,
      schemaId: workflow.id,
      tenantId: this.ctx.tenantId,
      workflowStateId: stateOperation.targetId,
      visualElements: visualElements,
      visualElementId: visualElements[0].id
    };

    this.createStepCommand = createStepCommand;
    this.deleteStepCommands.push(<DeleteStepCommand>createStepCommand);

    await this.workflowStateService.addStep(createStepCommand);

    const stepEntityPublicId = await this.workflowHelper.getStepDePublicId(
      'stepEntity',
      stateOperation.targetId,
      this.ctx.tenantId,
      workflow.id
    );

    if (stepEntityPublicId) {
      this.stepEntityPublicId = stepEntityPublicId;
      await this.workflowStateService.updateStep(<UpdateStepCommand>{
        ...createStepCommand,
        stepDynamicEntities: [{ dynamicEntity: { ...stepDE, publicId: stepEntityPublicId } }],
        resolution: resolutions[0].name
      });
    }
  }

  async test(): Promise<TestResult> {
    const query: GetWorkflowStateQuery = {
      id: this.workflowStateId,
      tenant: this.ctx.tenantId,
      schemaId: this.workflowId
    };

    let state = await this.workflowStateService.get(query);

    if (state.case.fields.find((x) => x.id === this.caseField1.fieldName && x.value === 10)) {
      // reopen step
      await this.workflowStateService.updateStep(<UpdateStepCommand>{
        ...this.createStepCommand,
        stepDynamicEntities: [{ dynamicEntity: { ...this.stepDE, publicId: this.stepEntityPublicId } }],
        resolution: ''
      });

      // reset the step field value and resolve,

      // it is expected that the respective case field value will be reset too
      await this.workflowStateService.updateStep(<UpdateStepCommand>{
        ...this.createStepCommand,
        stepDynamicEntities: [
          {
            dynamicEntity: {
              publicId: this.stepEntityPublicId,
              appId: this.ctx.appId,
              areaType: AreaTypeEnum.stepForm,
              fields: [],
              schemaId: this.stepSchema.id,
              tenantId: this.ctx.tenantId
            }
          }
        ],
        resolution: this.resolutions[0].name
      });

      let stateNew = await this.workflowStateService.get(query);
      if (stateNew.case.fields.length === 0 || stateNew.case.fields.find((x) => x.id === this.caseField1.fieldName && !x.value)) {
        return TestResult.success();
      }
    }

    return TestResult.failure('Test Failed');
  }
}

@Injectable()
export class StepToCaseTestService extends WorkflowActionEventsBaseTestService {
  private caseField1: IFieldBaseDto;
  private caseField2: IFieldBaseDto;

  constructor(
    schemaHelper: SchemaHelper,
    workflowHelper: WorkflowHelper,
    workflowStateService: WorkflowStateService,
    processStepEntityService: ProcessStepEntityService,
    tenantFieldHelper: TenantFieldsHelper,
    statusHelper: StatusHelper,
    processStepLinkService: ProcessStepLinkService,
    private dynamicEntityService: DynamicEntitiesService
  ) {
    super(
      processStepEntityService,
      tenantFieldHelper,
      schemaHelper,
      workflowHelper,
      statusHelper,
      workflowStateService,
      processStepLinkService
    );
  }

  async initialize(ctx: TestContext): Promise<void> {
    await super.initialize(ctx);
    const resolutions: WorkflowResolutionDto[] = [
      {
        name: 'Success'
      },
      {
        name: 'Fail'
      }
    ];

    const stepField1 = await this.tenantFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.IntField,
      [AreaTypeEnum.stepForm],
      'stepField',
      'step Field',
      []
    );

    const stepField2 = await this.tenantFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.StringField,
      [AreaTypeEnum.stepForm],
      'stepField2',
      'step Field2',
      []
    );
    const caseField1 = await this.tenantFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.IntField,
      [AreaTypeEnum.case],
      'caseField',
      'case Field',
      []
    );

    this.caseField1 = caseField1;

    const caseField2 = await this.tenantFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.StringField,
      [AreaTypeEnum.case],
      'caseField2',
      'case Field2',
      []
    );

    this.caseField2 = caseField2;

    this.fieldIds.push(stepField1.id, stepField2.id, caseField1.id, caseField2.id);

    const stepSchema = await this.schemaHelper.createSchema(this.ctx.tenantId, 'stepSchema', AreaTypeEnum.stepForm, [stepField1], []);

    const step = await this.createProcessStepEntity('stepEntity', stepSchema.id, resolutions);
    const stepDE: CreateDynamicEntityDto = {
      areaType: stepSchema.areaType,
      fields: [
        <IntFieldValueDto>{
          id: stepField1.fieldName,
          type: FieldTypeIds.IntField,
          value: 10
        }
      ],
      appId: this.ctx.appId,
      schemaId: stepSchema.id,
      tenantId: this.ctx.tenantId
    };

    const stepSchema2 = await this.schemaHelper.createSchema(
      this.ctx.tenantId,
      'anotherStepSchema',
      AreaTypeEnum.stepForm,
      [stepField2],
      []
    );

    this.stepSchemaIds.push(stepSchema.id, stepSchema2.id);

    const step2 = await this.createProcessStepEntity('stepEntity2', stepSchema2.id, resolutions);
    const stepDE2: CreateDynamicEntityDto = {
      areaType: stepSchema2.areaType,
      fields: [
        <StringFieldValueDto>{
          id: stepField2.fieldName,
          type: FieldTypeIds.StringField,
          value: 'Hello from Step'
        }
      ],
      appId: this.ctx.appId,
      schemaId: stepSchema2.id,
      tenantId: this.ctx.tenantId
    };

    const caseSchema = await this.schemaHelper.createSchema(
      this.ctx.tenantId,
      'caseSchema',
      AreaTypeEnum.case,
      [caseField1, caseField2],
      []
    );

    this.caseSchemaIds.push(caseSchema.id);

    const caseDE: CreateDynamicEntityDto = {
      appId: this.ctx.appId,
      areaType: AreaTypeEnum.case,
      fields: [
        <StringFieldValueDto>{
          id: caseField2.fieldName,
          type: FieldTypeIds.StringField,
          value: 'Hello from Case'
        }
      ],
      schemaId: caseSchema.id,
      tenantId: this.ctx.tenantId
    };

    const workflowStatusOperation = await this.workflowHelper.createStatusWithUniqueName(<CreateStatusCommand>{
      name: 'statusForWorkflowSchema',
      tenantId: this.ctx.tenantId,
      position: 0,
      configuration: <StatusConfiguration>{
        color: 'green',
        label: 'done'
      }
    });

    this.statusIds.push(workflowStatusOperation.targetId);

    const workflow = await this.workflowHelper.createWorkflow('workflow', this.ctx.tenantId, caseSchema.id, [
      workflowStatusOperation.targetId
    ]);

    this.workflowId = workflow.id;

    await this.workflowHelper.setDefaultStatus(workflow.id, workflowStatusOperation.targetId, this.ctx.tenantId);

    this.stepLinkIds.push(
      (
        await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
          workflowId: workflow.id,
          workflowStatusId: workflowStatusOperation.targetId,
          refName: 'stepEntity',
          processStepEntityId: step.id,
          tenantId: this.ctx.tenantId,
          defaultOverride: {
            rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanResolve, WorkflowRightsEnum.CanDelete],
            expression: {},
            numberOfInstances: 1,
            onProcessStepResolvedEvents: [
              <StepToCaseEventDto>{
                id: undefined,
                eventType: EventTypes.StepToCase,
                name: 'somename',
                sourceToDestination: [
                  {
                    source: { path: [stepField1.fieldName] },
                    destination: { path: [caseField1.fieldName] }
                  }
                ]
              }
            ]
          }
        })
      ).targetId
    );

    this.stepLinkIds.push(
      (
        await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
          workflowId: workflow.id,
          workflowStatusId: workflowStatusOperation.targetId,
          refName: 'stepEntity2',
          processStepEntityId: step2.id,
          tenantId: this.ctx.tenantId,
          defaultOverride: {
            rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanResolve, WorkflowRightsEnum.CanDelete],
            expression: {},
            numberOfInstances: 1,
            onProcessStepResolvedEvents: [
              <StepToCaseEventDto>{
                id: undefined,
                eventType: EventTypes.StepToCase,
                name: 'somename2',
                sourceToDestination: [
                  {
                    source: { path: [stepField2.fieldName] },
                    destination: { path: [caseField2.fieldName] }
                  }
                ]
              }
            ]
          }
        })
      ).targetId
    );

    const stateOperation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
      tenantId: this.ctx.tenantId,
      case: caseDE,
      schemaId: workflow.id
    });

    this.workflowStateId = stateOperation.targetId;

    let visualElements: VisualElement[] = [
      {
        id: 'idGeneratedFromFrontEnd1',
        index: 0
      },
      {
        id: 'idGeneratedFromFrontEnd2',
        index: 1
      }
    ];
    const createStepCommand = <UpdateStepCommand>{
      stepDynamicEntities: [],
      refName: 'stepEntity',
      resolution: '',
      stepSchemaId: stepSchema.id,
      schemaId: workflow.id,
      tenantId: this.ctx.tenantId,
      workflowStateId: stateOperation.targetId,
      visualElements: visualElements,
      visualElementId: visualElements[0].id
    };

    await this.workflowStateService.addStep(createStepCommand);

    this.deleteStepCommands.push(<DeleteStepCommand>createStepCommand);

    const stepEntityPublicId = await this.workflowHelper.getStepDePublicId(
      'stepEntity',
      stateOperation.targetId,
      this.ctx.tenantId,
      workflow.id
    );

    if (stepEntityPublicId) {
      await this.workflowStateService.updateStep(<UpdateStepCommand>{
        ...createStepCommand,
        stepDynamicEntities: [{ dynamicEntity: { ...stepDE, publicId: stepEntityPublicId } }],
        resolution: resolutions[0].name
      });

      const createStepCommand2 = <UpdateStepCommand>{
        stepDynamicEntities: [],
        refName: 'stepEntity2',
        resolution: '',
        stepSchemaId: stepSchema2.id,
        schemaId: workflow.id,
        tenantId: this.ctx.tenantId,
        workflowStateId: stateOperation.targetId,
        visualElements: visualElements,
        visualElementId: visualElements[1].id
      };

      await this.workflowStateService.addStep(createStepCommand2);

      const step2EntityPublicId = await this.workflowHelper.getStepDePublicId(
        'stepEntity2',
        stateOperation.targetId,
        this.ctx.tenantId,
        workflow.id
      );

      if (step2EntityPublicId) {
        await this.workflowStateService.updateStep(<UpdateStepCommand>{
          ...createStepCommand2,
          stepDynamicEntities: [{ dynamicEntity: { ...stepDE2, publicId: step2EntityPublicId } }],
          resolution: resolutions[0].name
        });

        this.workflowStateId = stateOperation.targetId;
      }
    }
  }

  async test(): Promise<TestResult> {
    const query: GetWorkflowStateQuery = {
      id: this.workflowStateId,
      tenant: this.ctx.tenantId,
      schemaId: this.workflowId
    };

    let state = await this.workflowStateService.get(query);

    const caseEnt = await this.dynamicEntityService.getById(this.ctx.tenantId, state.case.id, this.caseSchemaIds[0], AreaTypeEnum.case);

    if (
      caseEnt.fields.find((x) => x.id === this.caseField1.fieldName && x.value === 10) &&
      caseEnt.fields.find((x) => x.id === this.caseField2.fieldName && x.value === 'Hello from Step')
    ) {
      return TestResult.success();
    }

    return TestResult.failure('Test Failed');
  }
}

@Injectable()
export class ChangeStatusWhenStepAddedTestService extends WorkflowActionEventsBaseTestService {
  constructor(
    schemaHelper: SchemaHelper,
    workflowHelper: WorkflowHelper,
    workflowStateService: WorkflowStateService,
    processStepEntityService: ProcessStepEntityService,
    tenantFieldHelper: TenantFieldsHelper,
    statusHelper: StatusHelper,
    processStepLinkService: ProcessStepLinkService
  ) {
    super(
      processStepEntityService,
      tenantFieldHelper,
      schemaHelper,
      workflowHelper,
      statusHelper,
      workflowStateService,
      processStepLinkService
    );
  }

  async initialize(ctx: TestContext): Promise<void> {
    await super.initialize(ctx);
    const resolutions: WorkflowResolutionDto[] = [
      {
        name: 'Success'
      },
      {
        name: 'Fail'
      }
    ];

    const open = await this.statusHelper.createStatus(this.ctx.tenantId, 'Open', 0);
    const inProgress = await this.statusHelper.createStatus(this.ctx.tenantId, 'InProgress', 1);

    this.statusIds.push(open.id, inProgress.id);

    const caseSchema = await this.schemaHelper.createSchema(this.ctx.tenantId, 'case-schema1234456', AreaTypeEnum.case, [], []);
    this.caseSchemaIds.push(caseSchema.id);

    const workflow = await this.workflowHelper.createWorkflow(
      'workflow',
      this.ctx.tenantId,
      caseSchema.id,
      [open.id, inProgress.id],
      [],
      [],
      [],
      [],
      [
        <UpdateStatusBasedOnStepAddedEvent>{
          name: 'testnasdkn',
          eventType: EventTypes.UpdateStatusBasedOnStepAdded,
          statusId: inProgress.id
        }
      ]
    );

    this.workflowId = workflow.id;

    const harvesterSchema = await this.schemaHelper.createSchema(this.ctx.tenantId, 'schemaForHarvester', AreaTypeEnum.stepForm, [], []);
    const harvesterStep = await this.createProcessStepEntity('Harvester', harvesterSchema.id, resolutions);
    this.stepSchemaIds.push(harvesterSchema.id);

    const caseEntity: CreateDynamicEntityDto = {
      appId: this.ctx.appId,
      areaType: AreaTypeEnum.case,
      tenantId: this.ctx.tenantId,
      fields: [],
      schemaId: caseSchema.id
    };

    const harvesterDynamicEntityCmd: CreateDynamicEntityDto = {
      areaType: harvesterSchema.areaType,
      fields: [],
      appId: this.ctx.appId,
      schemaId: harvesterSchema.id,
      tenantId: this.ctx.tenantId
    };

    this.stepLinkIds.push(
      (
        await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
          workflowId: workflow.id,
          workflowStatusId: undefined,
          refName: 'harvester',
          processStepEntityId: harvesterStep.id,
          expression: {},
          tenantId: this.ctx.tenantId,
          numberOfInstances: 1,
          onProcessStepResolvedEvents: [],
          defaultOverride: {
            rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanResolve, WorkflowRightsEnum.CanDelete]
          }
        })
      ).targetId
    );

    const stateOperation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
      tenantId: this.ctx.tenantId,
      case: caseEntity,
      schemaId: workflow.id
    });

    this.workflowStateId = stateOperation.targetId;

    let visualElements: VisualElement[] = [
      {
        id: 'idGeneratedFromFrontEnd1',
        index: 0
      }
    ];

    const createStepCommand = <UpdateStepCommand>{
      stepDynamicEntities: [],
      refName: 'harvester',
      resolution: '',
      stepSchemaId: harvesterSchema.id,
      schemaId: workflow.id,
      tenantId: this.ctx.tenantId,
      workflowStateId: stateOperation.targetId,
      visualElements: visualElements,
      visualElementId: visualElements[0].id
    };

    this.deleteStepCommands.push(<DeleteStepCommand>createStepCommand);

    await this.workflowStateService.addStep(createStepCommand);

    const stepHarvesterPublicId = await this.workflowHelper.getStepDePublicId(
      'harvester',
      stateOperation.targetId,
      this.ctx.tenantId,
      workflow.id
    );

    if (stepHarvesterPublicId) {
      await this.workflowStateService.updateStep(<UpdateStepCommand>{
        ...createStepCommand,
        stepDynamicEntities: [{ dynamicEntity: { ...harvesterDynamicEntityCmd, publicId: stepHarvesterPublicId } }]
      });
    }
  }

  async test(): Promise<TestResult> {
    const query: GetWorkflowStateQuery = {
      id: this.workflowStateId,
      tenant: this.ctx.tenantId,
      schemaId: this.workflowId
    };

    let state = await this.workflowStateService.get(query);

    if (state.currentStatus.id == this.statusIds[1]) {
      return TestResult.success();
    }

    return TestResult.failure('Test failed.');
  }
}

@Injectable()
export class StepToRawDataTestService extends WorkflowActionEventsBaseTestService {
  private rawDataId: string;
  private rawDataSchemaId: string;
  private rawDataStringTenantField: IFieldBaseDto;

  constructor(
    schemaHelper: SchemaHelper,
    workflowHelper: WorkflowHelper,
    workflowStateService: WorkflowStateService,
    processStepEntityService: ProcessStepEntityService,
    tenantFieldHelper: TenantFieldsHelper,
    statusHelper: StatusHelper,
    processStepLinkService: ProcessStepLinkService,
    private dynamicEntityService: DynamicEntitiesService
  ) {
    super(
      processStepEntityService,
      tenantFieldHelper,
      schemaHelper,
      workflowHelper,
      statusHelper,
      workflowStateService,
      processStepLinkService
    );
  }

  async initialize(ctx: TestContext): Promise<void> {
    await super.initialize(ctx);
    // Step creation
    var stepStingTenantField = await this.tenantFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.StringField,
      [AreaTypeEnum.stepForm],
      'stepStringField',
      'Step String Field',
      []
    );

    const stepSchema = await this.schemaHelper.createSchema(
      this.ctx.tenantId,
      'stepSchema',
      AreaTypeEnum.stepForm,
      [stepStingTenantField],
      []
    );

    this.stepSchemaIds.push(stepSchema.id);

    const resolutions: WorkflowResolutionDto[] = [
      {
        name: 'Success'
      },
      {
        name: 'Fail'
      }
    ];
    const step = await this.createProcessStepEntity('stepEntity', stepSchema.id, resolutions);

    // RawData creation
    const rawDataStringTenantField = await this.tenantFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.StringField,
      [AreaTypeEnum.rawData],
      'coolField',
      'coolField',
      []
    );

    this.rawDataStringTenantField = rawDataStringTenantField;

    const rawDataSchema = await this.schemaHelper.createSchema(
      this.ctx.tenantId,
      'rawData',
      AreaTypeEnum.rawData,
      [rawDataStringTenantField],
      []
    );

    this.rawDataSchemaId = rawDataSchema.id;

    const rawDataLinkField = await this.tenantFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.ListOfLinksField,
      [AreaTypeEnum.case],
      'rawDataIds',
      'rawDataIds',
      [],
      {
        position: 0,
        schemaId: rawDataSchema.id,
        schemaAreaType: rawDataSchema.areaType
      }
    );
    const rawDataOperation = await this.dynamicEntityService.create(<CreateDynamicEntityDto>{
      appId: this.ctx.appId,
      areaType: rawDataSchema.areaType,
      fields: [
        <StringFieldValueDto>{
          id: rawDataStringTenantField.fieldName,
          type: FieldTypeIds.StringField,
          value: 'im from rawData'
        }
      ],
      schemaId: rawDataSchema.id,
      tenantId: this.ctx.tenantId
    });

    this.rawDataId = rawDataOperation.targetId;

    this.fieldIds.push(rawDataStringTenantField.id, rawDataLinkField.id, stepStingTenantField.id);

    // Case Creation
    const caseSchema = await this.schemaHelper.createSchema(this.ctx.tenantId, 'case-schema126', AreaTypeEnum.case, [rawDataLinkField], []);
    const open = await this.statusHelper.createStatus(this.ctx.tenantId, 'Open', 0);

    const workflow = await this.workflowHelper.createWorkflow('workflow', this.ctx.tenantId, caseSchema.id, [open.id], [], [], [], []);
    await this.workflowHelper.setDefaultStatus(workflow.id, open.id, this.ctx.tenantId);

    this.caseSchemaIds.push(caseSchema.id);

    this.statusIds.push(open.id);

    this.workflowId = workflow.id;

    this.stepLinkIds.push(
      (
        await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
          workflowId: workflow.id,
          refName: 'stepEntity',
          processStepEntityId: step.id,
          tenantId: this.ctx.tenantId,
          defaultOverride: {
            rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanResolve, WorkflowRightsEnum.CanDelete],
            expression: {},
            numberOfInstances: 1,
            onProcessStepResolvedEvents: [
              <StepToRawDataEventDto>{
                id: undefined,
                eventType: EventTypes.StepToRawData,
                name: 'setStringFieldInRawData',
                sourceToDestination: [
                  {
                    source: { path: [stepStingTenantField.fieldName] },
                    destination: { path: [rawDataStringTenantField.fieldName] }
                  }
                ]
              }
            ]
          }
        })
      ).targetId
    );

    const listOfLinksField = <ListOfLinkFieldValueDto>{
      id: rawDataLinkField.fieldName,
      type: FieldTypeIds.ListOfLinksField,
      value: [rawDataOperation.targetId]
    };

    const caseValue: CreateDynamicEntityDto = {
      appId: this.ctx.appId,
      areaType: AreaTypeEnum.case,
      tenantId: this.ctx.tenantId,
      fields: [listOfLinksField],
      schemaId: caseSchema.id
    };

    const stateOperation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
      tenantId: this.ctx.tenantId,
      case: caseValue,
      schemaId: workflow.id
    });

    this.workflowStateId = stateOperation.targetId;

    const stepDE: CreateDynamicEntityDto = {
      areaType: stepSchema.areaType,
      fields: [
        <StringFieldValueDto>{
          id: stepStingTenantField.fieldName,
          type: FieldTypeIds.StringField,
          value: "I'm from step field"
        }
      ],
      appId: this.ctx.appId,
      schemaId: stepSchema.id,
      tenantId: this.ctx.tenantId
    };
    let visualElements: VisualElement[] = [
      {
        id: 'idGeneratedFromFrontEnd1',
        index: 0
      }
    ];

    const createStepCommand = <UpdateStepCommand>{
      stepDynamicEntities: [],
      refName: 'stepEntity',
      resolution: '',
      stepSchemaId: stepSchema.id,
      schemaId: workflow.id,
      tenantId: this.ctx.tenantId,
      workflowStateId: stateOperation.targetId,
      visualElements: visualElements,
      visualElementId: visualElements[0].id
    };

    this.deleteStepCommands.push(<DeleteStepCommand>createStepCommand);

    await this.workflowStateService.addStep(createStepCommand);

    const stepEntityPublicId = await this.workflowHelper.getStepDePublicId(
      'stepEntity',
      stateOperation.targetId,
      this.ctx.tenantId,
      workflow.id
    );

    if (stepEntityPublicId) {
      await this.workflowStateService.updateStep(<UpdateStepCommand>{
        ...createStepCommand,
        stepDynamicEntities: [{ dynamicEntity: { ...stepDE, publicId: stepEntityPublicId } }],
        resolution: resolutions[0].name
      });
    }
  }

  async test(): Promise<TestResult> {
    // get the rawData entity and check if the step field value is copied into the rawData
    const rawDataItem = await this.dynamicEntityService.getById(
      this.ctx.tenantId,
      this.rawDataId,
      this.rawDataSchemaId,
      AreaTypeEnum.rawData
    );
    if (rawDataItem.fields.find((x) => x.id === this.rawDataStringTenantField.fieldName && x.value === "I'm from step field")) {
      return TestResult.success();
    }

    return TestResult.failure('Test Failed');
  }

  async cleanup(): Promise<void> {
    await this.dynamicEntityService.deleteById(this.ctx.tenantId, this.rawDataId, this.rawDataSchemaId, AreaTypeEnum.rawData);
    await super.cleanup();
  }
}

@Injectable()
export class StepToRawDataAndCaseTestService extends WorkflowActionEventsBaseTestService {
  private rawDataId: string;
  private rawDataSchemaId: string;
  private rawDataStringTenantField: IFieldBaseDto;

  constructor(
    schemaHelper: SchemaHelper,
    workflowHelper: WorkflowHelper,
    workflowStateService: WorkflowStateService,
    processStepEntityService: ProcessStepEntityService,
    tenantFieldHelper: TenantFieldsHelper,
    statusHelper: StatusHelper,
    processStepLinkService: ProcessStepLinkService,
    private dynamicEntityService: DynamicEntitiesService
  ) {
    super(
      processStepEntityService,
      tenantFieldHelper,
      schemaHelper,
      workflowHelper,
      statusHelper,
      workflowStateService,
      processStepLinkService
    );
  }

  async initialize(ctx: TestContext): Promise<void> {
    await super.initialize(ctx);

    // Step creation
    var stingTenantField = await this.tenantFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.StringField,
      [AreaTypeEnum.stepForm, AreaTypeEnum.rawData, AreaTypeEnum.case],
      'xNumber',
      'X-Number',
      []
    );

    const stepSchema = await this.schemaHelper.createSchema(this.ctx.tenantId, 'stepSchema', AreaTypeEnum.stepForm, [stingTenantField], []);
    const stepSchema2 = await this.schemaHelper.createSchema(this.ctx.tenantId, 'stepSchema2', AreaTypeEnum.stepForm, [], []);
    const stepSchema3 = await this.schemaHelper.createSchema(this.ctx.tenantId, 'stepSchema3', AreaTypeEnum.stepForm, [], []);

    this.stepSchemaIds.push(stepSchema.id, stepSchema2.id, stepSchema3.id);

    const resolutions: WorkflowResolutionDto[] = [
      {
        name: 'Success'
      },
      {
        name: 'Fail'
      }
    ];

    const step = await this.createProcessStepEntity('stepEntity', stepSchema.id, resolutions);
    const step2 = await this.createProcessStepEntity('stepEntity2', stepSchema2.id, resolutions);
    const step3 = await this.createProcessStepEntity('stepEntity3', stepSchema3.id, resolutions);

    const rawDataSchema = await this.schemaHelper.createSchema(this.ctx.tenantId, 'rawData', AreaTypeEnum.rawData, [stingTenantField], []);
    this.rawDataSchemaId = rawDataSchema.id;

    const rawDataLinkField = await this.tenantFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.ListOfLinksField,
      [AreaTypeEnum.case],
      'rawDataIds',
      'rawDataIds',
      [],
      {
        position: 0,
        schemaId: rawDataSchema.id,
        schemaAreaType: rawDataSchema.areaType
      }
    );

    this.fieldIds.push(stingTenantField.id, rawDataLinkField.id);

    this.rawDataStringTenantField = stingTenantField;

    const rawDataOperation = await this.dynamicEntityService.create(<CreateDynamicEntityDto>{
      appId: this.ctx.appId,
      areaType: rawDataSchema.areaType,
      fields: [
        <StringFieldValueDto>{
          id: stingTenantField.fieldName,
          type: FieldTypeIds.StringField,
          value: 'im from rawData'
        }
      ],
      schemaId: rawDataSchema.id,
      tenantId: this.ctx.tenantId
    });

    this.rawDataId = rawDataOperation.targetId;

    const caseSchema = await this.schemaHelper.createSchema(
      this.ctx.tenantId,
      'case-schema126',
      AreaTypeEnum.case,
      [rawDataLinkField, stingTenantField],
      []
    );

    this.caseSchemaIds.push(caseSchema.id);

    const open = await this.statusHelper.createStatus(this.ctx.tenantId, 'Open', 0);
    this.statusIds.push(open.id);

    const workflow = await this.workflowHelper.createWorkflow('workflow', this.ctx.tenantId, caseSchema.id, [open.id], [], [], [], []);
    await this.workflowHelper.setDefaultStatus(workflow.id, open.id, this.ctx.tenantId);

    this.workflowId = workflow.id;

    const processStepLinkId = (
      await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        workflowId: workflow.id,
        refName: 'stepEntity',
        processStepEntityId: step.id,
        tenantId: this.ctx.tenantId,
        defaultOverride: {
          rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanResolve, WorkflowRightsEnum.CanDelete],
          expression: {},
          numberOfInstances: 1,
          onProcessStepResolvedEvents: [
            <AutomaticAddStepsEventDto>{
              name: 'addStepsOnResolved',
              eventType: EventTypes.AutomaticAddSteps,
              steps: ['stepEntity2', 'stepEntity3'] // refName of the step that will be autoAdded
            },
            <StepToCaseEventDto>{
              id: undefined,
              eventType: EventTypes.StepToCase,
              name: 'setStringFieldInCase',
              sourceToDestination: [
                {
                  source: { path: [stingTenantField.fieldName] },
                  destination: { path: [stingTenantField.fieldName] }
                }
              ]
            },
            <StepToRawDataEventDto>{
              id: undefined,
              eventType: EventTypes.StepToRawData,
              name: 'setStringFieldInRawData',
              sourceToDestination: [
                {
                  source: { path: [stingTenantField.fieldName] },
                  destination: { path: [stingTenantField.fieldName] }
                }
              ]
            }
          ]
        }
      })
    ).targetId;

    const processStepLink2Id = (
      await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        workflowId: workflow.id,
        refName: 'stepEntity2',
        processStepEntityId: step2.id,
        tenantId: this.ctx.tenantId,
        defaultOverride: {
          rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanResolve, WorkflowRightsEnum.CanDelete],
          expression: {},
          numberOfInstances: 1,
          onProcessStepResolvedEvents: []
        }
      })
    ).targetId;

    const processStepLink3Id = (
      await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        workflowId: workflow.id,
        refName: 'stepEntity3',
        processStepEntityId: step3.id,
        tenantId: this.ctx.tenantId,
        defaultOverride: {
          rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanResolve, WorkflowRightsEnum.CanDelete],
          expression: {},
          numberOfInstances: 1,
          onProcessStepResolvedEvents: []
        }
      })
    ).targetId;

    this.stepLinkIds.push(processStepLinkId, processStepLink2Id, processStepLink3Id);

    const listOfLinksField = <ListOfLinkFieldValueDto>{
      id: rawDataLinkField.fieldName,
      type: FieldTypeIds.ListOfLinksField,
      value: [rawDataOperation.targetId]
    };

    const caseValue: CreateDynamicEntityDto = {
      appId: this.ctx.appId,
      areaType: AreaTypeEnum.case,
      tenantId: this.ctx.tenantId,
      fields: [listOfLinksField],
      schemaId: caseSchema.id
    };

    const stateOperation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
      tenantId: this.ctx.tenantId,
      case: caseValue,
      schemaId: workflow.id
    });

    const stepDE: CreateDynamicEntityDto = {
      areaType: stepSchema.areaType,
      fields: [
        <StringFieldValueDto>{
          id: stingTenantField.fieldName,
          type: FieldTypeIds.StringField,
          value: "I'm from step field"
        }
      ],
      appId: this.ctx.appId,
      schemaId: stepSchema.id,
      tenantId: this.ctx.tenantId
    };
    let visualElements: VisualElement[] = [
      {
        id: 'idGeneratedFromFrontEnd1',
        index: 0
      }
    ];

    const createStepCommand = <UpdateStepCommand>{
      stepDynamicEntities: [],
      refName: 'stepEntity',
      resolution: '',
      stepSchemaId: stepSchema.id,
      schemaId: workflow.id,
      tenantId: this.ctx.tenantId,
      workflowStateId: stateOperation.targetId,
      visualElements: visualElements,
      visualElementId: visualElements[0].id
    };

    await this.workflowStateService.addStep(createStepCommand);

    const stepEntityPublicId = await this.workflowHelper.getStepDePublicId(
      'stepEntity',
      stateOperation.targetId,
      this.ctx.tenantId,
      workflow.id
    );

    if (stepEntityPublicId) {
      await this.workflowStateService.updateStep(<UpdateStepCommand>{
        ...createStepCommand,
        stepDynamicEntities: [{ dynamicEntity: { ...stepDE, publicId: stepEntityPublicId } }],
        resolution: resolutions[0].name
      });
    }
  }

  async test(): Promise<TestResult> {
    // get wfState
    const query: GetWorkflowStateQuery = {
      id: this.workflowStateId,
      tenant: this.ctx.tenantId,
      schemaId: this.workflowId
    };

    let state = await this.workflowStateService.get(query);

    // get the rawData entity and check if the step field value is copied into the rawData
    const rawDataItem = await this.dynamicEntityService.getById(
      this.ctx.tenantId,
      this.rawDataId,
      this.rawDataSchemaId,
      AreaTypeEnum.rawData
    );

    if (
      state.case.fields.find((x) => x.id === this.rawDataStringTenantField.fieldName && x.value === "I'm from step field") &&
      rawDataItem.fields.find((x) => x.id === this.rawDataStringTenantField.fieldName && x.value === "I'm from step field")
    ) {
      return TestResult.success();
    }
    return TestResult.failure('Test Failed');
  }

  async cleanup(): Promise<void> {
    await this.dynamicEntityService.deleteById(this.ctx.tenantId, this.rawDataId, this.rawDataSchemaId, AreaTypeEnum.rawData);
    await super.cleanup();
  }
}

@Injectable()
export class MultipleStepsTestService extends WorkflowActionEventsBaseTestService {
  private rawDataId: string;
  private rawDataSchemaId: string;
  private differenceWeightingTenantField: IFieldBaseDto;
  private firstWeightingStepDE: CreateDynamicEntityDto;
  private secondWeightingStepDE: CreateDynamicEntityDto;

  constructor(
    schemaHelper: SchemaHelper,
    workflowHelper: WorkflowHelper,
    workflowStateService: WorkflowStateService,
    processStepEntityService: ProcessStepEntityService,
    tenantFieldHelper: TenantFieldsHelper,
    statusHelper: StatusHelper,
    processStepLinkService: ProcessStepLinkService,
    private dynamicEntityService: DynamicEntitiesService
  ) {
    super(
      processStepEntityService,
      tenantFieldHelper,
      schemaHelper,
      workflowHelper,
      statusHelper,
      workflowStateService,
      processStepLinkService
    );
  }

  async initialize(ctx: TestContext): Promise<void> {
    await super.initialize(ctx);
    const resolutions: WorkflowResolutionDto[] = [
      {
        name: 'Success'
      },
      {
        name: 'Fail'
      }
    ];

    // Tenant fields
    var firstWeightingTenantField = await this.tenantFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.IntField,
      [AreaTypeEnum.stepForm, AreaTypeEnum.case],
      'firstWeighting',
      'First weighting',
      []
    );
    var secondWeightingTenantField = await this.tenantFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.IntField,
      [AreaTypeEnum.stepForm, AreaTypeEnum.case],
      'secondWeighting',
      'Second weighting',
      []
    );
    var differenceWeightingTenantField = await this.tenantFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.IntField,
      [AreaTypeEnum.stepForm, AreaTypeEnum.case],
      'differenceWeighing',
      'Difference Weighing',
      []
    );
    this.differenceWeightingTenantField = differenceWeightingTenantField;
    // First Step
    const firstWeightingSchema = await this.schemaHelper.createSchema(
      this.ctx.tenantId,
      'firstWeightingSchema',
      AreaTypeEnum.stepForm,
      [firstWeightingTenantField],
      []
    );
    const firstWeightingStep = await this.createProcessStepEntity('firstWeightingStepEntity', firstWeightingSchema.id, resolutions);
    const firstWeightingStepDE: CreateDynamicEntityDto = {
      areaType: firstWeightingSchema.areaType,
      fields: [
        <IntFieldValueDto>{
          id: firstWeightingTenantField.fieldName,
          type: FieldTypeIds.IntField,
          value: 1003
        }
      ],
      appId: this.ctx.appId,
      schemaId: firstWeightingSchema.id,
      tenantId: this.ctx.tenantId
    };
    this.firstWeightingStepDE = firstWeightingStepDE;
    // Second Step
    const secondWeightingSchema = await this.schemaHelper.createSchema(
      this.ctx.tenantId,
      'secondWeightingSchema',
      AreaTypeEnum.stepForm,
      [secondWeightingTenantField],
      []
    );
    const secondWeightingStep = await this.createProcessStepEntity('secondWeightingStepEntity', secondWeightingSchema.id, resolutions);
    const secondWeightingStepDE: CreateDynamicEntityDto = {
      areaType: secondWeightingSchema.areaType,
      fields: [
        <IntFieldValueDto>{
          id: secondWeightingTenantField.fieldName,
          type: FieldTypeIds.IntField,
          value: 506
        }
      ],
      appId: this.ctx.appId,
      schemaId: secondWeightingSchema.id,
      tenantId: this.ctx.tenantId
    };

    this.secondWeightingStepDE = secondWeightingStepDE;

    // Case
    const caseSchema = await this.schemaHelper.createSchema(
      this.ctx.tenantId,
      'caseSchema',
      AreaTypeEnum.case,
      [differenceWeightingTenantField, secondWeightingTenantField],
      []
    );
    const caseDE: CreateDynamicEntityDto = {
      appId: this.ctx.appId,
      areaType: AreaTypeEnum.case,
      fields: [],
      schemaId: caseSchema.id,
      tenantId: this.ctx.tenantId
    };

    const open = await this.statusHelper.createStatus(this.ctx.tenantId, 'Open', 0);
    const done = await this.statusHelper.createStatus(this.ctx.tenantId, 'Done', 1);

    this.statusIds.push(open.id, done.id);

    const workflow = await this.workflowHelper.createWorkflow('workflow', this.ctx.tenantId, caseSchema.id, [open.id, done.id]);

    this.workflowId = workflow.id;

    const processStepLinkId = (
      await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        workflowId: workflow.id,
        refName: 'firstWeightingStep',
        processStepEntityId: firstWeightingStep.id,
        tenantId: this.ctx.tenantId,
        defaultOverride: {
          rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanResolve, WorkflowRightsEnum.CanDelete],
          expression: {},
          numberOfInstances: 1,
          onProcessStepResolvedEvents: []
        }
      })
    ).targetId;

    // on secondWeightingStep resolution we want to copy step field into case, calculate difference and set in case, update case status

    // the actual result => postActions are getting into conflict with each other,

    // different scenarios can be checked with commenting the respective action,
    // my findings are:
    // when all three are active => only  UpdateCaseStatusBasedOnStepResolution action is fired
    // when UpdateCaseStatusBasedOnStepResolutionEventDto is commented out => StepToCase and DifferenceCalculation actions are fired ok

    const processStepLink2Id = (
      await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        workflowId: workflow.id,
        refName: 'secondWeightingStep',
        processStepEntityId: secondWeightingStep.id,
        tenantId: this.ctx.tenantId,
        defaultOverride: {
          rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanResolve, WorkflowRightsEnum.CanDelete],
          numberOfInstances: 1,
          onProcessStepResolvedEvents: [
            <StepToCaseEventDto>{
              id: undefined,
              eventType: EventTypes.StepToCase,
              name: 'setSecondWeighingInCase',
              sourceToDestination: [
                {
                  source: { path: [secondWeightingTenantField.fieldName] },
                  destination: { path: [secondWeightingTenantField.fieldName] }
                }
              ]
            },
            <DifferenceCalculationEventDto>{
              eventType: EventTypes.DifferenceCalculation,
              name: 'testName',
              firstStep: {
                path: ['firstWeightingStep', firstWeightingTenantField.fieldName]
              },
              secondStep: {
                path: ['secondWeightingStep', secondWeightingTenantField.fieldName]
              },
              caseResultField: differenceWeightingTenantField.fieldName
            },
            <UpdateCaseStatusBasedOnStepResolutionEventDto>{
              eventType: EventTypes.UpdateCaseStatusBasedOnStepResolution,
              name: 'setToDoneWhenResolved',
              refName: 'secondWeightingStep',
              resolutions: ['Success'],
              schemaId: secondWeightingStep.schemaId,
              statusId: done.id
            }
          ]
        }
      })
    ).targetId;

    this.stepLinkIds.push(processStepLinkId, processStepLink2Id);

    const stateOperation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
      tenantId: this.ctx.tenantId,
      case: caseDE,
      schemaId: workflow.id
    });

    let visualElements: VisualElement[] = [
      {
        id: 'idGeneratedFromFrontEnd1',
        index: 0
      },
      {
        id: 'idGeneratedFromFrontEnd2',
        index: 1
      }
    ];

    this.workflowStateId = stateOperation.targetId;

    const createStepCommand = <UpdateStepCommand>{
      stepDynamicEntities: [],
      refName: 'firstWeightingStep',
      resolution: '',
      stepSchemaId: firstWeightingSchema.id,
      schemaId: workflow.id,
      tenantId: this.ctx.tenantId,
      workflowStateId: stateOperation.targetId,
      visualElements: visualElements,
      visualElementId: visualElements[0].id
    };

    this.deleteStepCommands.push(<DeleteStepCommand>createStepCommand);

    await this.workflowStateService.addStep(createStepCommand);

    const stepFirstWeighingPublicId = await this.workflowHelper.getStepDePublicId(
      'firstWeightingStep',
      stateOperation.targetId,
      this.ctx.tenantId,
      workflow.id
    );

    if (stepFirstWeighingPublicId) {
      await this.workflowStateService.updateStep(<UpdateStepCommand>{
        ...createStepCommand,
        stepDynamicEntities: [{ dynamicEntity: { ...firstWeightingStepDE, publicId: stepFirstWeighingPublicId } }],
        resolution: resolutions[0].name
      });

      const createStepCommand2 = <UpdateStepCommand>{
        stepDynamicEntities: [],
        refName: 'secondWeightingStep',
        resolution: '',
        stepSchemaId: secondWeightingSchema.id,
        schemaId: workflow.id,
        tenantId: this.ctx.tenantId,
        workflowStateId: stateOperation.targetId,
        visualElements: visualElements,
        visualElementId: visualElements[1].id
      };

      await this.workflowStateService.addStep(createStepCommand2);

      this.deleteStepCommands.push(<DeleteStepCommand>createStepCommand2);

      const stepSecondWeighingPublicId = await this.workflowHelper.getStepDePublicId(
        'secondWeightingStep',
        stateOperation.targetId,
        this.ctx.tenantId,
        workflow.id
      );

      if (stepSecondWeighingPublicId) {
        await this.workflowStateService.updateStep(<UpdateStepCommand>{
          ...createStepCommand2,
          stepDynamicEntities: [{ dynamicEntity: { ...secondWeightingStepDE, publicId: stepSecondWeighingPublicId } }],
          resolution: resolutions[0].name
        });
      }
    }
  }

  async test(): Promise<TestResult> {
    const query: GetWorkflowStateQuery = {
      id: this.workflowStateId,
      tenant: this.ctx.tenantId,
      schemaId: this.workflowId
    };

    let state = await this.workflowStateService.get(query);
    const expectedResult = Number(this.secondWeightingStepDE.fields[0].value) - Number(this.firstWeightingStepDE.fields[0].value);
    const result = Number(state.case.fields.find((x) => x.id === this.differenceWeightingTenantField.fieldName)?.value);

    if (
      state.currentStatus.id === this.statusIds[1] &&
      result === expectedResult &&
      state.case.fields.find((field) => {
        return field.id === 'secondWeighting' && field.value;
      })
    ) {
      return TestResult.success();
    }

    return TestResult.failure('Test Failed');
  }
  async cleanup(): Promise<void> {
    await this.dynamicEntityService.deleteById(this.ctx.tenantId, this.rawDataId, this.rawDataSchemaId, AreaTypeEnum.rawData);
    await super.cleanup();
  }
}

@Injectable()
export class UpdateRawDataBasedOnCaseTestService extends WorkflowActionEventsBaseTestService {
  private rawDataId: string;
  private rawDataSchemaId: string;

  constructor(
    schemaHelper: SchemaHelper,
    workflowHelper: WorkflowHelper,
    workflowStateService: WorkflowStateService,
    processStepEntityService: ProcessStepEntityService,
    tenantFieldHelper: TenantFieldsHelper,
    statusHelper: StatusHelper,
    processStepLinkService: ProcessStepLinkService,
    private dynamicEntityService: DynamicEntitiesService
  ) {
    super(
      processStepEntityService,
      tenantFieldHelper,
      schemaHelper,
      workflowHelper,
      statusHelper,
      workflowStateService,
      processStepLinkService
    );
  }

  async initialize(ctx: TestContext): Promise<void> {
    await super.initialize(ctx);

    const ageTenantField = await this.tenantFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.IntField,
      [AreaTypeEnum.rawData],
      'age',
      'age',
      []
    );
    const rawDataSchema = await this.schemaHelper.createSchema(this.ctx.tenantId, 'rawData', AreaTypeEnum.rawData, [ageTenantField], []);
    this.rawDataSchemaId = rawDataSchema.id;

    const rawDataOperation = await this.dynamicEntityService.create(<CreateDynamicEntityDto>{
      appId: this.ctx.appId,
      areaType: rawDataSchema.areaType,
      fields: [
        <IntFieldValueDto>{
          id: ageTenantField.fieldName,
          type: FieldTypeIds.IntField,
          value: 21
        }
      ],
      schemaId: rawDataSchema.id,
      tenantId: this.ctx.tenantId
    });

    const rawDataLinkField = await this.tenantFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.ListOfLinksField,
      [AreaTypeEnum.case],
      'rawDataIds',
      'rawDataIds',
      [],
      {
        position: 0,
        schemaId: rawDataSchema.id,
        schemaAreaType: rawDataSchema.areaType
      }
    );

    this.rawDataId = rawDataOperation.targetId;

    this.fieldIds.push(rawDataLinkField.id, ageTenantField.id);
    const open = await this.statusHelper.createStatus(this.ctx.tenantId, 'Open', 0);
    const inProgress = await this.statusHelper.createStatus(this.ctx.tenantId, 'InProgress', 1);

    this.statusIds.push(open.id, inProgress.id);

    const caseSchema = await this.schemaHelper.createSchema(
      this.ctx.tenantId,
      'case-schema1234456',
      AreaTypeEnum.case,
      [rawDataLinkField],
      []
    );

    this.caseSchemaIds.push(caseSchema.id);

    const workflow = await this.workflowHelper.createWorkflow(
      `workflow-${DateTime.now().toJSDate().getTime()}`,
      this.ctx.tenantId,
      caseSchema.id,
      [open.id, inProgress.id],
      [],
      [],
      [],
      [
        <UpdateRawDataBasedOnCaseEventDto>{
          id: undefined,
          eventType: EventTypes.OnRawDataAddedToCase,
          name: 'testAction'
        }
      ]
    );

    this.workflowId = workflow.id;

    const listOfLinksField = <ListOfLinkFieldValueDto>{
      id: rawDataLinkField.fieldName,
      type: FieldTypeIds.ListOfLinksField,
      value: [rawDataOperation.targetId]
    };

    const caseValue: CreateDynamicEntityDto = {
      appId: this.ctx.appId,
      areaType: AreaTypeEnum.case,
      tenantId: this.ctx.tenantId,
      fields: [listOfLinksField],
      schemaId: caseSchema.id
    };

    const stateOperation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
      tenantId: this.ctx.tenantId,
      case: caseValue,
      schemaId: workflow.id
    });

    this.workflowStateId = stateOperation.targetId;

    await this.workflowStateService.updateStatus(<UpdateStatusCommand>{
      statusId: inProgress.id,
      tenantId: this.ctx.tenantId,
      workflowStateId: stateOperation.targetId,
      schemaId: workflow.id
    });
  }

  async test(): Promise<TestResult> {
    let rawData = await this.dynamicEntityService.getById(this.ctx.tenantId, this.rawDataId, this.rawDataSchemaId, AreaTypeEnum.rawData);

    if (rawData.statusId === this.statusIds[1]) {
      return TestResult.success();
    }

    return TestResult.failure('Test Failed');
  }

  async cleanup(): Promise<void> {
    await this.dynamicEntityService.deleteById(this.ctx.tenantId, this.rawDataId, this.rawDataSchemaId, AreaTypeEnum.rawData);
    await super.cleanup();
  }
}

@Injectable()
export class CaseFieldsPersistOnCaseStatusUpdate2TestService extends WorkflowActionEventsBaseTestService {
  private rawDataId: string;
  private rawDataSchemaId: string;
  private listOfLinksField: ListOfLinkFieldValueDto;

  constructor(
    schemaHelper: SchemaHelper,
    workflowHelper: WorkflowHelper,
    workflowStateService: WorkflowStateService,
    processStepEntityService: ProcessStepEntityService,
    tenantFieldHelper: TenantFieldsHelper,
    statusHelper: StatusHelper,
    processStepLinkService: ProcessStepLinkService,
    private dynamicEntityService: DynamicEntitiesService
  ) {
    super(
      processStepEntityService,
      tenantFieldHelper,
      schemaHelper,
      workflowHelper,
      statusHelper,
      workflowStateService,
      processStepLinkService
    );
  }

  async initialize(ctx: TestContext): Promise<void> {
    await super.initialize(ctx);

    const rawDataStringTenantField = await this.tenantFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.StringField,
      [AreaTypeEnum.rawData],
      'coolField',
      'coolField',
      []
    );
    const caseStringTenantField = await this.tenantFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.StringField,
      [AreaTypeEnum.case],
      'coolField',
      'coolField',
      []
    );
    const rawDataSchema = await this.schemaHelper.createSchema(
      this.ctx.tenantId,
      'rawData',
      AreaTypeEnum.rawData,
      [rawDataStringTenantField],
      []
    );

    this.rawDataSchemaId = rawDataSchema.id;

    const rawDataLinkField = await this.tenantFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.ListOfLinksField,
      [AreaTypeEnum.case],
      'rawDataIds',
      'rawDataIds',
      [],
      {
        position: 0,
        schemaId: rawDataSchema.id,
        schemaAreaType: rawDataSchema.areaType
      }
    );

    this.fieldIds.push(rawDataStringTenantField.id, caseStringTenantField.id, rawDataLinkField.id);

    const rawDataOperation = await this.dynamicEntityService.create(<CreateDynamicEntityDto>{
      appId: this.ctx.appId,
      areaType: rawDataSchema.areaType,
      fields: [
        <StringFieldValueDto>{
          id: rawDataStringTenantField.fieldName,
          type: FieldTypeIds.StringField,
          value: 'im from rawData'
        }
      ],
      schemaId: rawDataSchema.id,
      tenantId: this.ctx.tenantId
    });
    this.rawDataId = rawDataOperation.targetId;

    const listOfLinksField = <ListOfLinkFieldValueDto>{
      id: rawDataLinkField.fieldName,
      type: FieldTypeIds.ListOfLinksField,
      value: [rawDataOperation.targetId]
    };
    this.listOfLinksField = listOfLinksField;
    const caseSchema = await this.schemaHelper.createSchema(
      this.ctx.tenantId,
      'caseSchema',
      AreaTypeEnum.case,
      [caseStringTenantField, rawDataLinkField],
      []
    );
    this.caseSchemaIds.push(caseSchema.id);

    const caseDE: CreateDynamicEntityDto = {
      appId: this.ctx.appId,
      areaType: AreaTypeEnum.case,
      tenantId: this.ctx.tenantId,
      fields: [
        listOfLinksField,
        <StringFieldValueDto>{
          id: caseStringTenantField.fieldName,
          type: FieldTypeIds.StringField,
          value: 'im from case'
        }
      ],
      schemaId: caseSchema.id
    };

    const resolutions: WorkflowResolutionDto[] = [
      {
        name: 'Success'
      },
      {
        name: 'Fail'
      }
    ];
    const stepSchema = await this.schemaHelper.createSchema(this.ctx.tenantId, 'stepSchema', AreaTypeEnum.stepForm, [], []);
    const step = await this.createProcessStepEntity('stepEntity', stepSchema.id, resolutions);
    const stepDE: CreateDynamicEntityDto = {
      areaType: stepSchema.areaType,
      fields: [],
      appId: this.ctx.appId,
      schemaId: stepSchema.id,
      tenantId: this.ctx.tenantId
    };

    this.stepSchemaIds.push(stepSchema.id);

    const open = await this.statusHelper.createStatus(this.ctx.tenantId, 'Open', 0);
    const inProgress = await this.statusHelper.createStatus(this.ctx.tenantId, 'In Progress', 1);

    this.statusIds.push(open.id, inProgress.id);

    const workflow = await this.workflowHelper.createWorkflow(
      'workflow',
      this.ctx.tenantId,
      caseSchema.id,
      [open.id, inProgress.id],
      [],
      [],
      [],
      [],
      [
        <UpdateStatusBasedOnStepAddedEvent>{
          name: 'setToInprogressOnStepAdded',
          eventType: EventTypes.UpdateStatusBasedOnStepAdded,
          statusId: inProgress.id
        }
      ]
    );

    this.workflowId = workflow.id;

    this.stepLinkIds.push(
      (
        await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
          workflowId: workflow.id,
          workflowStatusId: undefined,
          refName: 'stepEntity',
          processStepEntityId: step.id,
          tenantId: this.ctx.tenantId,
          defaultOverride: <ProcessStepLinkBaseOverrideDto>{
            rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanResolve, WorkflowRightsEnum.CanDelete],
            expression: {},
            numberOfInstances: 1,
            onProcessStepResolvedEvents: []
          }
        })
      ).targetId
    );

    const stateOperation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
      tenantId: this.ctx.tenantId,
      case: caseDE,
      schemaId: workflow.id
    });

    let visualElements: VisualElement[] = [
      {
        id: 'idGeneratedFromFrontEnd1',
        index: 0
      }
    ];

    const createStepCommand = <UpdateStepCommand>{
      stepDynamicEntities: [],
      refName: 'stepEntity',
      resolution: '',
      stepSchemaId: stepSchema.id,
      schemaId: workflow.id,
      tenantId: this.ctx.tenantId,
      workflowStateId: stateOperation.targetId,
      visualElements: visualElements,
      visualElementId: visualElements[0].id
    };

    this.deleteStepCommands.push(<DeleteStepCommand>createStepCommand);

    await this.workflowStateService.addStep(createStepCommand);

    const stepEntityPublicId = await this.workflowHelper.getStepDePublicId(
      'stepEntity',
      stateOperation.targetId,
      this.ctx.tenantId,
      workflow.id
    );

    if (stepEntityPublicId) {
      await this.workflowStateService.updateStep(<UpdateStepCommand>{
        ...createStepCommand,
        stepDynamicEntities: [{ dynamicEntity: { ...stepDE, publicId: stepEntityPublicId } }]
      });
      this.workflowStateId = stateOperation.targetId;
    }
  }

  async test(): Promise<TestResult> {
    const query: GetWorkflowStateQuery = {
      id: this.workflowStateId,
      tenant: this.ctx.tenantId,
      schemaId: this.workflowId
    };

    let state = await this.workflowStateService.get(query);
    if (
      state.currentStatus.id === this.statusIds[1] &&
      state.case.fields.length === 2 &&
      state.case.fields.find((field) => {
        return field.id === this.listOfLinksField.id && field.value?.length;
      })
    ) {
      return TestResult.success();
    }
    return TestResult.failure('Test Failed');
  }

  async cleanup(): Promise<void> {
    await this.dynamicEntityService.deleteById(this.ctx.tenantId, this.rawDataId, this.rawDataSchemaId, AreaTypeEnum.rawData);
    await super.cleanup();
  }
}

@Injectable()
export class CaseFieldsPersistOnCaseStatusUpdateTestService extends WorkflowActionEventsBaseTestService {
  private rawDataId: string;
  private rawDataSchemaId: string;
  private listOfLinksField: ListOfLinkFieldValueDto;

  constructor(
    schemaHelper: SchemaHelper,
    workflowHelper: WorkflowHelper,
    workflowStateService: WorkflowStateService,
    processStepEntityService: ProcessStepEntityService,
    tenantFieldHelper: TenantFieldsHelper,
    statusHelper: StatusHelper,
    processStepLinkService: ProcessStepLinkService,
    private dynamicEntityService: DynamicEntitiesService
  ) {
    super(
      processStepEntityService,
      tenantFieldHelper,
      schemaHelper,
      workflowHelper,
      statusHelper,
      workflowStateService,
      processStepLinkService
    );
  }

  async initialize(ctx: TestContext): Promise<void> {
    await super.initialize(ctx);

    const rawDataStringTenantField = await this.tenantFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.StringField,
      [AreaTypeEnum.rawData],
      'coolField',
      'coolField',
      []
    );
    const caseStringTenantField = await this.tenantFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.StringField,
      [AreaTypeEnum.case],
      'coolField',
      'coolField',
      []
    );
    const rawDataSchema = await this.schemaHelper.createSchema(
      this.ctx.tenantId,
      'rawData',
      AreaTypeEnum.rawData,
      [rawDataStringTenantField],
      []
    );

    this.rawDataSchemaId = rawDataSchema.id;

    const rawDataLinkField = await this.tenantFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.ListOfLinksField,
      [AreaTypeEnum.case],
      'rawDataIds',
      'rawDataIds',
      [],
      {
        position: 0,
        schemaId: rawDataSchema.id,
        schemaAreaType: rawDataSchema.areaType
      }
    );
    this.fieldIds.push(caseStringTenantField.id, rawDataStringTenantField.id, rawDataLinkField.id);

    const rawDataOperation = await this.dynamicEntityService.create(<CreateDynamicEntityDto>{
      appId: this.ctx.appId,
      areaType: rawDataSchema.areaType,
      fields: [
        <StringFieldValueDto>{
          id: rawDataStringTenantField.fieldName,
          type: FieldTypeIds.StringField,
          value: 'im from rawData'
        }
      ],
      schemaId: rawDataSchema.id,
      tenantId: this.ctx.tenantId
    });

    this.rawDataId = rawDataOperation.targetId;

    const listOfLinksField = <ListOfLinkFieldValueDto>{
      id: rawDataLinkField.fieldName,
      type: FieldTypeIds.ListOfLinksField,
      value: [rawDataOperation.targetId]
    };

    this.listOfLinksField = listOfLinksField;

    const caseSchema = await this.schemaHelper.createSchema(
      this.ctx.tenantId,
      'caseSchema',
      AreaTypeEnum.case,
      [caseStringTenantField, rawDataLinkField],
      []
    );

    this.caseSchemaIds.push(caseSchema.id);

    const caseDE: CreateDynamicEntityDto = {
      appId: this.ctx.appId,
      areaType: AreaTypeEnum.case,
      tenantId: this.ctx.tenantId,
      fields: [
        listOfLinksField,
        <StringFieldValueDto>{
          id: caseStringTenantField.fieldName,
          type: FieldTypeIds.StringField,
          value: 'im from case'
        }
      ],
      schemaId: caseSchema.id
    };

    const resolutions: WorkflowResolutionDto[] = [
      {
        name: 'Success'
      },
      {
        name: 'Fail'
      }
    ];
    const stepSchema = await this.schemaHelper.createSchema(this.ctx.tenantId, 'stepSchema', AreaTypeEnum.stepForm, [], []);
    this.stepSchemaIds.push(stepSchema.id);

    const step = await this.createProcessStepEntity('stepEntity', stepSchema.id, resolutions);
    const stepDE: CreateDynamicEntityDto = {
      areaType: stepSchema.areaType,
      fields: [],
      appId: this.ctx.appId,
      schemaId: stepSchema.id,
      tenantId: this.ctx.tenantId
    };

    const open = await this.statusHelper.createStatus(this.ctx.tenantId, 'Open', 0);
    const workflow = await this.workflowHelper.createWorkflow('workflow', this.ctx.tenantId, caseSchema.id, [open.id]);

    this.statusIds.push(open.id);
    this.workflowId = workflow.id;

    this.stepLinkIds.push(
      (
        await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
          workflowId: workflow.id,
          workflowStatusId: undefined,
          refName: 'stepEntity',
          processStepEntityId: step.id,
          tenantId: this.ctx.tenantId,
          defaultOverride: <ProcessStepLinkBaseOverrideDto>{
            rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanResolve, WorkflowRightsEnum.CanDelete],
            expression: {},
            numberOfInstances: 1,
            onProcessStepResolvedEvents: [
              <UpdateCaseStatusBasedOnStepResolutionEventDto>{
                eventType: EventTypes.UpdateCaseStatusBasedOnStepResolution,
                name: 'testName',
                refName: 'stepEntity',
                resolutions: ['Success'],
                schemaId: step.schemaId,
                statusId: open.id
              }
            ]
          }
        })
      ).targetId
    );

    const stateOperation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
      tenantId: this.ctx.tenantId,
      case: caseDE,
      schemaId: workflow.id
    });

    let visualElements: VisualElement[] = [
      {
        id: 'idGeneratedFromFrontEnd1',
        index: 0
      }
    ];

    const createStepCommand = <UpdateStepCommand>{
      stepDynamicEntities: [],
      refName: 'stepEntity',
      resolution: '',
      stepSchemaId: stepSchema.id,
      schemaId: workflow.id,
      tenantId: this.ctx.tenantId,
      workflowStateId: stateOperation.targetId,
      visualElements: visualElements,
      visualElementId: visualElements[0].id
    };

    this.deleteStepCommands.push(<DeleteStepCommand>createStepCommand);

    await this.workflowStateService.addStep(createStepCommand);

    const stepEntityPublicId = await this.workflowHelper.getStepDePublicId(
      'stepEntity',
      stateOperation.targetId,
      this.ctx.tenantId,
      workflow.id
    );

    if (stepEntityPublicId) {
      await this.workflowStateService.updateStep(<UpdateStepCommand>{
        ...createStepCommand,
        stepDynamicEntities: [{ dynamicEntity: { ...stepDE, publicId: stepEntityPublicId } }],
        resolution: resolutions[0].name
      });
      const workflowStateId = stateOperation.targetId;

      this.workflowStateId = workflowStateId;
    }
  }

  async test(): Promise<TestResult> {
    const query: GetWorkflowStateQuery = {
      id: this.workflowStateId,
      tenant: this.ctx.tenantId,
      schemaId: this.workflowId
    };

    let state = await this.workflowStateService.get(query);
    if (
      state.currentStatus.id === this.statusIds[0] &&
      state.case.fields.length === 2 &&
      state.case.fields.find((field) => {
        return field.id === this.listOfLinksField.id && field.value?.length;
      })
    ) {
      return TestResult.success();
    }

    return TestResult.failure('Test Failed');
  }

  async cleanup(): Promise<void> {
    await this.dynamicEntityService.deleteById(this.ctx.tenantId, this.rawDataId, this.rawDataSchemaId, AreaTypeEnum.rawData);
    await super.cleanup();
  }
}

@Injectable()
export class UpdateCaseStatusBasedOnStepResolutionTestService extends WorkflowActionEventsBaseTestService {
  constructor(
    schemaHelper: SchemaHelper,
    workflowHelper: WorkflowHelper,
    workflowStateService: WorkflowStateService,
    processStepEntityService: ProcessStepEntityService,
    tenantFieldHelper: TenantFieldsHelper,
    statusHelper: StatusHelper,
    processStepLinkService: ProcessStepLinkService
  ) {
    super(
      processStepEntityService,
      tenantFieldHelper,
      schemaHelper,
      workflowHelper,
      statusHelper,
      workflowStateService,
      processStepLinkService
    );
  }

  async initialize(ctx: TestContext): Promise<void> {
    await super.initialize(ctx);

    const resolutions: WorkflowResolutionDto[] = [
      {
        name: 'Success'
      },
      {
        name: 'Fail'
      }
    ];
    const stepSchema = await this.schemaHelper.createSchema(ctx.tenantId, 'stepSchema', AreaTypeEnum.stepForm, [], []);
    const step = await this.createProcessStepEntity('stepEntity', stepSchema.id, resolutions);
    const stepDE: CreateDynamicEntityDto = {
      areaType: stepSchema.areaType,
      fields: [],
      appId: this.ctx.appId,
      schemaId: stepSchema.id,
      tenantId: ctx.tenantId
    };

    this.stepSchemaIds.push(stepSchema.id);

    const caseSchema = await this.schemaHelper.createSchema(ctx.tenantId, 'caseSchema', AreaTypeEnum.case, [], []);
    const caseDE: CreateDynamicEntityDto = {
      appId: this.ctx.appId,
      areaType: AreaTypeEnum.case,
      fields: [],
      schemaId: caseSchema.id,
      tenantId: ctx.tenantId
    };

    this.caseSchemaIds.push(caseSchema.id);

    const open = await this.statusHelper.createStatus(ctx.tenantId, 'Open', 0);
    const workflow = await this.workflowHelper.createWorkflow('workflow', ctx.tenantId, caseSchema.id, [open.id]);

    this.statusIds.push(open.id);

    this.workflowId = workflow.id;

    this.stepLinkIds.push(
      (
        await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
          workflowId: workflow.id,
          workflowStatusId: undefined,
          refName: 'stepEntity',
          processStepEntityId: step.id,
          tenantId: ctx.tenantId,
          defaultOverride: <ProcessStepLinkBaseOverrideDto>{
            rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanResolve, WorkflowRightsEnum.CanDelete],
            expression: {},
            numberOfInstances: 1,
            onProcessStepResolvedEvents: [
              <UpdateCaseStatusBasedOnStepResolutionEventDto>{
                eventType: EventTypes.UpdateCaseStatusBasedOnStepResolution,
                name: 'testName',
                refName: 'stepEntity',
                resolutions: ['Success'],
                schemaId: step.schemaId,
                statusId: open.id
              }
            ]
          }
        })
      ).targetId
    );

    const stateOperation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
      tenantId: ctx.tenantId,
      case: caseDE,
      schemaId: workflow.id
    });

    this.workflowStateId = stateOperation.targetId;

    let visualElements: VisualElement[] = [
      {
        id: 'idGeneratedFromFrontEnd1',
        index: 0
      }
    ];

    const createStepCommand = <UpdateStepCommand>{
      stepDynamicEntities: [],
      refName: 'stepEntity',
      resolution: '',
      stepSchemaId: stepSchema.id,
      schemaId: workflow.id,
      tenantId: ctx.tenantId,
      workflowStateId: stateOperation.targetId,
      visualElements: visualElements,
      visualElementId: visualElements[0].id
    };

    this.deleteStepCommands.push(<DeleteStepCommand>createStepCommand);

    await this.workflowStateService.addStep(createStepCommand);

    const stepEntityPublicId = await this.workflowHelper.getStepDePublicId(
      'stepEntity',
      stateOperation.targetId,
      this.ctx.tenantId,
      workflow.id
    );

    if (stepEntityPublicId) {
      await this.workflowStateService.updateStep(<UpdateStepCommand>{
        ...createStepCommand,
        stepDynamicEntities: [{ dynamicEntity: { ...stepDE, publicId: stepEntityPublicId } }],
        resolution: resolutions[0].name
      });
    }
  }
  async test(): Promise<TestResult> {
    const query: GetWorkflowStateQuery = {
      id: this.workflowStateId,
      tenant: this.ctx.tenantId,
      schemaId: this.workflowId
    };

    let state = await this.workflowStateService.get(query);

    if (state.currentStatus.id === this.statusIds[0]) {
      return TestResult.success();
    }

    return TestResult.failure('Test Failed');
  }
}

@Injectable()
export class DifferenceInWeighting2TestService extends WorkflowActionEventsBaseTestService {
  private firstWeightingStepDE: CreateDynamicEntityDto;
  private secondWeightingStepDE: CreateDynamicEntityDto;

  constructor(
    schemaHelper: SchemaHelper,
    workflowHelper: WorkflowHelper,
    workflowStateService: WorkflowStateService,
    processStepEntityService: ProcessStepEntityService,
    tenantFieldHelper: TenantFieldsHelper,
    statusHelper: StatusHelper,
    processStepLinkService: ProcessStepLinkService
  ) {
    super(
      processStepEntityService,
      tenantFieldHelper,
      schemaHelper,
      workflowHelper,
      statusHelper,
      workflowStateService,
      processStepLinkService
    );
  }

  async initialize(ctx: TestContext): Promise<void> {
    await super.initialize(ctx);

    const resolutions: WorkflowResolutionDto[] = [
      {
        name: 'Success'
      },
      {
        name: 'Fail'
      }
    ];

    // Tenant fields
    var firstWeightingTenantField = await this.tenantFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.IntField,
      [AreaTypeEnum.stepForm, AreaTypeEnum.case],
      'firstWeighting',
      'First weighting',
      []
    );
    var secondWeightingTenantField = await this.tenantFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.IntField,
      [AreaTypeEnum.stepForm, AreaTypeEnum.case],
      'secondWeighting',
      'Second weighting',
      []
    );
    var differenceWeightingTenantField = await this.tenantFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.IntField,
      [AreaTypeEnum.stepForm, AreaTypeEnum.case],
      'differenceWeighing',
      'Difference Weighing',
      []
    );

    this.fieldIds.push(firstWeightingTenantField.id, secondWeightingTenantField.id, differenceWeightingTenantField.id);

    // First Step
    const firstWeightingSchema = await this.schemaHelper.createSchema(
      this.ctx.tenantId,
      'firstWeightingSchema',
      AreaTypeEnum.stepForm,
      [firstWeightingTenantField],
      []
    );
    const firstWeightingStep = await this.createProcessStepEntity('firstWeightingStepEntity', firstWeightingSchema.id, resolutions);
    const firstWeightingStepDE: CreateDynamicEntityDto = {
      areaType: firstWeightingSchema.areaType,
      fields: [
        <IntFieldValueDto>{
          id: firstWeightingTenantField.fieldName,
          type: FieldTypeIds.IntField,
          value: 1003
        }
      ],
      appId: this.ctx.appId,
      schemaId: firstWeightingSchema.id,
      tenantId: this.ctx.tenantId
    };
    this.firstWeightingStepDE = firstWeightingStepDE;

    // Second Step
    const secondWeightingSchema = await this.schemaHelper.createSchema(
      this.ctx.tenantId,
      'secondWeightingSchema',
      AreaTypeEnum.stepForm,
      [secondWeightingTenantField],
      []
    );
    this.stepSchemaIds.push(firstWeightingSchema.id, secondWeightingSchema.id);

    const secondWeightingStep = await this.createProcessStepEntity('secondWeightingStepEntity', secondWeightingSchema.id, resolutions);

    const secondWeightingStepDE: CreateDynamicEntityDto = {
      areaType: secondWeightingSchema.areaType,
      fields: [
        <IntFieldValueDto>{
          id: secondWeightingTenantField.fieldName,
          type: FieldTypeIds.IntField,
          value: 506
        }
      ],
      appId: this.ctx.appId,
      schemaId: secondWeightingSchema.id,
      tenantId: this.ctx.tenantId
    };

    this.secondWeightingStepDE = secondWeightingStepDE;
    // Case
    const caseSchema = await this.schemaHelper.createSchema(
      this.ctx.tenantId,
      'caseSchema',
      AreaTypeEnum.case,
      [differenceWeightingTenantField, secondWeightingTenantField],
      []
    );
    this.caseSchemaIds.push(caseSchema.id);

    const caseDE: CreateDynamicEntityDto = {
      appId: this.ctx.appId,
      areaType: AreaTypeEnum.case,
      fields: [],
      schemaId: caseSchema.id,
      tenantId: this.ctx.tenantId
    };

    const open = await this.statusHelper.createStatus(this.ctx.tenantId, 'Open', 0);
    const workflow = await this.workflowHelper.createWorkflow('workflow', this.ctx.tenantId, caseSchema.id, [open.id]);

    this.statusIds.push(open.id);
    this.workflowId = workflow.id;

    this.stepLinkIds.push(
      (
        await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
          workflowId: workflow.id,
          refName: 'firstWeightingStep',
          processStepEntityId: firstWeightingStep.id,
          tenantId: this.ctx.tenantId,
          defaultOverride: {
            rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanResolve, WorkflowRightsEnum.CanDelete],
            expression: {},
            numberOfInstances: 1,
            onProcessStepResolvedEvents: []
          }
        })
      ).targetId
    );

    const processStepFields = {};
    processStepFields['p1_field1'] = <PropertyPath>{ path: ['firstWeightingStep', 'firstWeighting'] };
    processStepFields['p2_field2'] = <PropertyPath>{ path: ['secondWeightingStep', 'secondWeighting'] };

    this.stepLinkIds.push(
      (
        await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
          workflowId: workflow.id,
          refName: 'secondWeightingStep',
          processStepEntityId: secondWeightingStep.id,
          tenantId: this.ctx.tenantId,
          defaultOverride: {
            rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanResolve, WorkflowRightsEnum.CanDelete],
            numberOfInstances: 1,
            onProcessStepResolvedEvents: [
              <MathExpressionCalculationEvent>{
                id: undefined,
                eventType: EventTypes.MathExpressionCalculation,
                name: 'setSecondWeighingInCase',
                formula: 'p2_field2 - p1_field1',
                processStepFields: processStepFields,
                caseResultField: <PropertyPath>{ path: ['differenceWeighing'] }
              }
            ]
          }
        })
      ).targetId
    );

    const stateOperation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
      tenantId: this.ctx.tenantId,
      case: caseDE,
      schemaId: workflow.id
    });

    this.workflowStateId = stateOperation.targetId;

    let visualElements: VisualElement[] = [
      {
        id: 'idGeneratedFromFrontEnd1',
        index: 0
      },
      {
        id: 'idGeneratedFromFrontEnd2',
        index: 1
      }
    ];

    const createStepCommand = <UpdateStepCommand>{
      stepDynamicEntities: [],
      refName: 'firstWeightingStep',
      resolution: '',
      stepSchemaId: firstWeightingSchema.id,
      schemaId: workflow.id,
      tenantId: this.ctx.tenantId,
      workflowStateId: stateOperation.targetId,
      visualElements: visualElements,
      visualElementId: visualElements[0].id
    };

    await this.workflowStateService.addStep(createStepCommand);

    const stepFirstWeighingPublicId = await this.workflowHelper.getStepDePublicId(
      'firstWeightingStep',
      stateOperation.targetId,
      this.ctx.tenantId,
      workflow.id
    );

    if (stepFirstWeighingPublicId) {
      await this.workflowStateService.updateStep(<UpdateStepCommand>{
        ...createStepCommand,
        stepDynamicEntities: [{ dynamicEntity: { ...firstWeightingStepDE, publicId: stepFirstWeighingPublicId } }],
        resolution: resolutions[0].name
      });

      const createStepCommand2 = <UpdateStepCommand>{
        stepDynamicEntities: [],
        refName: 'secondWeightingStep',
        resolution: '',
        stepSchemaId: secondWeightingSchema.id,
        schemaId: workflow.id,
        tenantId: this.ctx.tenantId,
        workflowStateId: stateOperation.targetId,
        visualElements: visualElements,
        visualElementId: visualElements[1].id
      };

      this.deleteStepCommands.push(<DeleteStepCommand>createStepCommand, <DeleteStepCommand>createStepCommand2);

      await this.workflowStateService.addStep(createStepCommand2);

      const stepSecondWeighingPublicId = await this.workflowHelper.getStepDePublicId(
        'secondWeightingStep',
        stateOperation.targetId,
        this.ctx.tenantId,
        workflow.id
      );

      if (stepSecondWeighingPublicId) {
        await this.workflowStateService.updateStep(<UpdateStepCommand>{
          ...createStepCommand2,
          stepDynamicEntities: [{ dynamicEntity: { ...secondWeightingStepDE, publicId: stepSecondWeighingPublicId } }],
          resolution: resolutions[0].name
        });
      }
    }
  }

  async test(): Promise<TestResult> {
    const query: GetWorkflowStateQuery = {
      id: this.workflowStateId,
      tenant: this.ctx.tenantId,
      schemaId: this.workflowId
    };

    let state = await this.workflowStateService.get(query);
    const expectedResult = Number(this.secondWeightingStepDE.fields[0].value) - Number(this.firstWeightingStepDE.fields[0].value);
    const result = Number(state.case.fields.find((x) => x.id === 'differenceWeighing').value);

    if (result === expectedResult) {
      return TestResult.success();
    }

    return TestResult.failure('Test Failed');
  }
}

@Injectable()
export class MathOperationActionTestTestService extends WorkflowActionEventsBaseTestService {
  private firstWeightingStepDE: CreateDynamicEntityDto;
  private secondWeightingStepDE: CreateDynamicEntityDto;

  constructor(
    schemaHelper: SchemaHelper,
    workflowHelper: WorkflowHelper,
    workflowStateService: WorkflowStateService,
    processStepEntityService: ProcessStepEntityService,
    tenantFieldHelper: TenantFieldsHelper,
    statusHelper: StatusHelper,
    processStepLinkService: ProcessStepLinkService
  ) {
    super(
      processStepEntityService,
      tenantFieldHelper,
      schemaHelper,
      workflowHelper,
      statusHelper,
      workflowStateService,
      processStepLinkService
    );
  }

  async initialize(ctx: TestContext): Promise<void> {
    await super.initialize(ctx);

    const resolutions: WorkflowResolutionDto[] = [
      {
        name: 'Success'
      },
      {
        name: 'Fail'
      }
    ];

    // Tenant fields
    var firstWeightingTenantField = await this.tenantFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.DecimalField,
      [AreaTypeEnum.stepForm, AreaTypeEnum.case],
      'firstWeighting',
      'First weighting',
      []
    );
    var secondWeightingTenantField = await this.tenantFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.DecimalField,
      [AreaTypeEnum.stepForm, AreaTypeEnum.case],
      'secondWeighting',
      'Second weighting',
      []
    );
    var differenceWeightingTenantField = await this.tenantFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.DecimalField,
      [AreaTypeEnum.stepForm, AreaTypeEnum.case],
      'differenceWeighing',
      'Difference Weighing',
      []
    );

    this.fieldIds.push(firstWeightingTenantField.id, secondWeightingTenantField.id, differenceWeightingTenantField.id);

    // First Step
    const firstWeightingSchema = await this.schemaHelper.createSchema(
      this.ctx.tenantId,
      'firstWeightingSchema',
      AreaTypeEnum.stepForm,
      [firstWeightingTenantField],
      []
    );
    const firstWeightingStep = await this.createProcessStepEntity('firstWeightingStepEntity', firstWeightingSchema.id, resolutions);
    const firstWeightingStepDE: CreateDynamicEntityDto = {
      areaType: firstWeightingSchema.areaType,
      fields: [
        <DecimalFieldValueDto>{
          id: firstWeightingTenantField.fieldName,
          type: FieldTypeIds.DecimalField,
          value: 50.56
        }
      ],
      appId: this.ctx.appId,
      schemaId: firstWeightingSchema.id,
      tenantId: this.ctx.tenantId
    };

    this.firstWeightingStepDE = firstWeightingStepDE;

    // Second Step
    const secondWeightingSchema = await this.schemaHelper.createSchema(
      this.ctx.tenantId,
      'secondWeightingSchema',
      AreaTypeEnum.stepForm,
      [secondWeightingTenantField],
      []
    );

    this.stepSchemaIds.push(firstWeightingSchema.id, secondWeightingSchema.id);

    const secondWeightingStep = await this.createProcessStepEntity('secondWeightingStepEntity', secondWeightingSchema.id, resolutions);

    const secondWeightingStepDE: CreateDynamicEntityDto = {
      areaType: secondWeightingSchema.areaType,
      fields: [
        <DecimalFieldValueDto>{
          id: secondWeightingTenantField.fieldName,
          type: FieldTypeIds.DecimalField,
          value: 100.89
        }
      ],
      appId: this.ctx.appId,
      schemaId: secondWeightingSchema.id,
      tenantId: this.ctx.tenantId
    };
    this.secondWeightingStepDE = secondWeightingStepDE;

    // Case
    const caseSchema = await this.schemaHelper.createSchema(
      this.ctx.tenantId,
      'caseSchema',
      AreaTypeEnum.case,
      [differenceWeightingTenantField, secondWeightingTenantField],
      []
    );
    this.caseSchemaIds.push(caseSchema.id);

    const caseDE: CreateDynamicEntityDto = {
      appId: this.ctx.appId,
      areaType: AreaTypeEnum.case,
      fields: [],
      schemaId: caseSchema.id,
      tenantId: this.ctx.tenantId
    };

    const open = await this.statusHelper.createStatus(this.ctx.tenantId, 'Open', 0);
    const workflow = await this.workflowHelper.createWorkflow('workflow', this.ctx.tenantId, caseSchema.id, [open.id]);

    this.statusIds.push(open.id);
    this.workflowId = workflow.id;

    this.stepLinkIds.push(
      (
        await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
          workflowId: workflow.id,
          refName: 'firstWeightingStep',
          processStepEntityId: firstWeightingStep.id,
          tenantId: this.ctx.tenantId,
          defaultOverride: {
            rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanResolve, WorkflowRightsEnum.CanDelete],
            expression: {},
            numberOfInstances: 1,
            onProcessStepResolvedEvents: []
          }
        })
      ).targetId
    );

    const processStepFields = {};
    processStepFields['p1_field1'] = <PropertyPath>{ path: ['firstWeightingStep', 'firstWeighting'] };
    processStepFields['p2_field2'] = <PropertyPath>{ path: ['secondWeightingStep', 'secondWeighting'] };

    this.stepLinkIds.push(
      (
        await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
          workflowId: workflow.id,
          refName: 'secondWeightingStep',
          processStepEntityId: secondWeightingStep.id,
          tenantId: this.ctx.tenantId,
          defaultOverride: {
            rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanResolve, WorkflowRightsEnum.CanDelete],
            numberOfInstances: 1,
            onProcessStepResolvedEvents: [
              <MathExpressionCalculationEvent>{
                id: undefined,
                eventType: EventTypes.MathExpressionCalculation,
                name: 'setSecondWeighingInCase',
                formula: '(p2_field2 - p1_field1)/p2_field2',
                processStepFields: processStepFields,
                caseResultField: <PropertyPath>{ path: ['differenceWeighing'] }
              }
            ]
          }
        })
      ).targetId
    );

    const stateOperation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
      tenantId: this.ctx.tenantId,
      case: caseDE,
      schemaId: workflow.id
    });

    this.workflowStateId = stateOperation.targetId;

    let visualElements: VisualElement[] = [
      {
        id: 'idGeneratedFromFrontEnd1',
        index: 0
      },
      {
        id: 'idGeneratedFromFrontEnd2',
        index: 1
      }
    ];

    const createStepCommand = <UpdateStepCommand>{
      stepDynamicEntities: [],
      refName: 'firstWeightingStep',
      resolution: '',
      stepSchemaId: firstWeightingSchema.id,
      schemaId: workflow.id,
      tenantId: this.ctx.tenantId,
      workflowStateId: stateOperation.targetId,
      visualElements: visualElements,
      visualElementId: visualElements[0].id
    };

    await this.workflowStateService.addStep(createStepCommand);

    const stepFirstWeighingPublicId = await this.workflowHelper.getStepDePublicId(
      'firstWeightingStep',
      stateOperation.targetId,
      this.ctx.tenantId,
      workflow.id
    );

    if (stepFirstWeighingPublicId) {
      await this.workflowStateService.updateStep(<UpdateStepCommand>{
        ...createStepCommand,
        stepDynamicEntities: [{ dynamicEntity: { ...firstWeightingStepDE, publicId: stepFirstWeighingPublicId } }],
        resolution: resolutions[0].name
      });

      const createStepCommand2 = <UpdateStepCommand>{
        stepDynamicEntities: [],
        refName: 'secondWeightingStep',
        resolution: '',
        stepSchemaId: secondWeightingSchema.id,
        schemaId: workflow.id,
        tenantId: this.ctx.tenantId,
        workflowStateId: stateOperation.targetId,
        visualElements: visualElements,
        visualElementId: visualElements[1].id
      };

      this.deleteStepCommands.push(<DeleteStepCommand>createStepCommand, <DeleteStepCommand>createStepCommand2);

      await this.workflowStateService.addStep(createStepCommand2);

      const stepSecondWeighingPublicId = await this.workflowHelper.getStepDePublicId(
        'secondWeightingStep',
        stateOperation.targetId,
        this.ctx.tenantId,
        workflow.id
      );

      if (stepSecondWeighingPublicId) {
        await this.workflowStateService.updateStep(<UpdateStepCommand>{
          ...createStepCommand2,
          stepDynamicEntities: [{ dynamicEntity: { ...secondWeightingStepDE, publicId: stepSecondWeighingPublicId } }],
          resolution: resolutions[0].name
        });
      }
    }
  }

  async test(): Promise<TestResult> {
    const query: GetWorkflowStateQuery = {
      id: this.workflowStateId,
      tenant: this.ctx.tenantId,
      schemaId: this.workflowId
    };

    let state = await this.workflowStateService.get(query);

    const field1 = Number(this.secondWeightingStepDE.fields[0].value);
    const field2 = Number(this.firstWeightingStepDE.fields[0].value);
    const expectedResult = (field1 - field2) / field1;

    const result = Number(state.case.fields.find((x) => x.id === 'differenceWeighing').value);

    if (result === expectedResult) {
      return TestResult.success();
    }

    return TestResult.failure('Test Failed');
  }
}

@Injectable()
export class DifferenceInWeightingTestService extends WorkflowActionEventsBaseTestService {
  private differenceWeightingTenantField: IFieldBaseDto;
  private firstWeightingStepDE: CreateDynamicEntityDto;
  private secondWeightingStepDE: CreateDynamicEntityDto;

  constructor(
    schemaHelper: SchemaHelper,
    workflowHelper: WorkflowHelper,
    workflowStateService: WorkflowStateService,
    processStepEntityService: ProcessStepEntityService,
    tenantFieldHelper: TenantFieldsHelper,
    statusHelper: StatusHelper,
    processStepLinkService: ProcessStepLinkService
  ) {
    super(
      processStepEntityService,
      tenantFieldHelper,
      schemaHelper,
      workflowHelper,
      statusHelper,
      workflowStateService,
      processStepLinkService
    );
  }

  async initialize(ctx: TestContext): Promise<void> {
    await super.initialize(ctx);

    const resolutions: WorkflowResolutionDto[] = [
      {
        name: 'Success'
      },
      {
        name: 'Fail'
      }
    ];

    // Tenant fields
    var firstWeightingTenantField = await this.tenantFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.IntField,
      [AreaTypeEnum.stepForm, AreaTypeEnum.case],
      'firstWeighting',
      'First weighting',
      []
    );
    var secondWeightingTenantField = await this.tenantFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.IntField,
      [AreaTypeEnum.stepForm, AreaTypeEnum.case],
      'secondWeighting',
      'Second weighting',
      []
    );
    var differenceWeightingTenantField = await this.tenantFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.IntField,
      [AreaTypeEnum.stepForm, AreaTypeEnum.case],
      'differenceWeighing',
      'Difference Weighing',
      []
    );

    this.fieldIds.push(firstWeightingTenantField.id, secondWeightingTenantField.id, differenceWeightingTenantField.id);

    // First Step
    const firstWeightingSchema = await this.schemaHelper.createSchema(
      this.ctx.tenantId,
      'firstWeightingSchema',
      AreaTypeEnum.stepForm,
      [firstWeightingTenantField],
      []
    );
    const firstWeightingStep = await this.createProcessStepEntity('firstWeightingStepEntity', firstWeightingSchema.id, resolutions);
    const firstWeightingStepDE: CreateDynamicEntityDto = {
      areaType: firstWeightingSchema.areaType,
      fields: [
        <IntFieldValueDto>{
          id: firstWeightingTenantField.fieldName,
          type: FieldTypeIds.IntField,
          value: 1003
        }
      ],
      appId: this.ctx.appId,
      schemaId: firstWeightingSchema.id,
      tenantId: this.ctx.tenantId
    };

    this.firstWeightingStepDE = firstWeightingStepDE;

    // Second Step
    const secondWeightingSchema = await this.schemaHelper.createSchema(
      this.ctx.tenantId,
      'secondWeightingSchema',
      AreaTypeEnum.stepForm,
      [secondWeightingTenantField],
      []
    );

    this.stepSchemaIds.push(firstWeightingSchema.id, secondWeightingSchema.id);

    const secondWeightingStep = await this.createProcessStepEntity('secondWeightingStepEntity', secondWeightingSchema.id, resolutions);
    const secondWeightingStepDE: CreateDynamicEntityDto = {
      areaType: secondWeightingSchema.areaType,
      fields: [
        <IntFieldValueDto>{
          id: secondWeightingTenantField.fieldName,
          type: FieldTypeIds.IntField,
          value: 506
        }
      ],
      appId: this.ctx.appId,
      schemaId: secondWeightingSchema.id,
      tenantId: this.ctx.tenantId
    };

    this.secondWeightingStepDE = secondWeightingStepDE;

    // Case
    const caseSchema = await this.schemaHelper.createSchema(
      this.ctx.tenantId,
      'caseSchema',
      AreaTypeEnum.case,
      [differenceWeightingTenantField, secondWeightingTenantField],
      []
    );

    this.caseSchemaIds.push(caseSchema.id);

    const caseDE: CreateDynamicEntityDto = {
      appId: this.ctx.appId,
      areaType: AreaTypeEnum.case,
      fields: [],
      schemaId: caseSchema.id,
      tenantId: this.ctx.tenantId
    };

    const open = await this.statusHelper.createStatus(this.ctx.tenantId, 'Open', 0);
    const workflow = await this.workflowHelper.createWorkflow('workflow', this.ctx.tenantId, caseSchema.id, [open.id]);

    this.statusIds.push(open.id);
    this.workflowId = workflow.id;

    this.stepLinkIds.push(
      (
        await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
          workflowId: workflow.id,
          refName: 'firstWeightingStep',
          processStepEntityId: firstWeightingStep.id,
          tenantId: this.ctx.tenantId,
          defaultOverride: {
            rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanResolve, WorkflowRightsEnum.CanDelete],
            expression: {},
            numberOfInstances: 1,
            onProcessStepResolvedEvents: []
          }
        })
      ).targetId
    );

    this.stepLinkIds.push(
      (
        await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
          workflowId: workflow.id,
          refName: 'secondWeightingStep',
          processStepEntityId: secondWeightingStep.id,
          tenantId: this.ctx.tenantId,
          defaultOverride: {
            rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanResolve, WorkflowRightsEnum.CanDelete],
            numberOfInstances: 1,
            onProcessStepResolvedEvents: [
              <StepToCaseEventDto>{
                id: undefined,
                eventType: EventTypes.StepToCase,
                name: 'setSecondWeighingInCase',
                sourceToDestination: [
                  {
                    source: { path: [secondWeightingTenantField.fieldName] },
                    destination: { path: [secondWeightingTenantField.fieldName] }
                  }
                ]
              },
              <DifferenceCalculationEventDto>{
                eventType: EventTypes.DifferenceCalculation,
                name: 'testName',
                firstStep: {
                  path: ['firstWeightingStep', firstWeightingTenantField.fieldName]
                },
                secondStep: {
                  path: ['secondWeightingStep', secondWeightingTenantField.fieldName]
                },
                caseResultField: differenceWeightingTenantField.fieldName
              }
            ]
          }
        })
      ).targetId
    );

    const stateOperation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
      tenantId: this.ctx.tenantId,
      case: caseDE,
      schemaId: workflow.id
    });

    this.workflowStateId = stateOperation.targetId;

    let visualElements: VisualElement[] = [
      {
        id: 'idGeneratedFromFrontEnd1',
        index: 0
      },
      {
        id: 'idGeneratedFromFrontEnd2',
        index: 1
      }
    ];

    const createStepCommand = <UpdateStepCommand>{
      stepDynamicEntities: [],
      refName: 'firstWeightingStep',
      resolution: '',
      stepSchemaId: firstWeightingSchema.id,
      schemaId: workflow.id,
      tenantId: this.ctx.tenantId,
      workflowStateId: stateOperation.targetId,
      visualElements: visualElements,
      visualElementId: visualElements[0].id
    };

    await this.workflowStateService.addStep(createStepCommand);

    const stepFirstWeighingPublicId = await this.workflowHelper.getStepDePublicId(
      'firstWeightingStep',
      stateOperation.targetId,
      this.ctx.tenantId,
      workflow.id
    );

    if (stepFirstWeighingPublicId) {
      await this.workflowStateService.updateStep(<UpdateStepCommand>{
        ...createStepCommand,
        stepDynamicEntities: [{ dynamicEntity: { ...firstWeightingStepDE, publicId: stepFirstWeighingPublicId } }],
        resolution: resolutions[0].name
      });

      const createStepCommand2 = <UpdateStepCommand>{
        stepDynamicEntities: [],
        refName: 'secondWeightingStep',
        resolution: '',
        stepSchemaId: secondWeightingSchema.id,
        schemaId: workflow.id,
        tenantId: this.ctx.tenantId,
        workflowStateId: stateOperation.targetId,
        visualElements: visualElements,
        visualElementId: visualElements[1].id
      };

      await this.workflowStateService.addStep(createStepCommand2);

      const stepSecondWeighingPublicId = await this.workflowHelper.getStepDePublicId(
        'secondWeightingStep',
        stateOperation.targetId,
        this.ctx.tenantId,
        workflow.id
      );

      this.deleteStepCommands.push(<DeleteStepCommand>createStepCommand, <DeleteStepCommand>createStepCommand2);

      if (stepSecondWeighingPublicId) {
        await this.workflowStateService.updateStep(<UpdateStepCommand>{
          ...createStepCommand2,
          stepDynamicEntities: [{ dynamicEntity: { ...secondWeightingStepDE, publicId: stepSecondWeighingPublicId } }],
          resolution: resolutions[0].name
        });
      }
    }
  }

  async test(): Promise<TestResult> {
    const query: GetWorkflowStateQuery = {
      id: this.workflowStateId,
      tenant: this.ctx.tenantId,
      schemaId: this.workflowId
    };
    let state = await this.workflowStateService.get(query);

    const expectedResult = Number(this.secondWeightingStepDE.fields[0].value) - Number(this.firstWeightingStepDE.fields[0].value);
    const result = Number(state.case.fields.find((x) => x.id === this.differenceWeightingTenantField.fieldName).value);

    if (
      result === expectedResult &&
      state.case.fields.find((field) => {
        return field.id === 'secondWeighting' && field.value;
      })
    ) {
      return TestResult.success();
    }

    return TestResult.failure('Test Failed');
  }
}

@Injectable()
export class AutoAddStepsTestService extends WorkflowActionEventsBaseTestService {
  private harvesterDynamicEntityCmd: CreateDynamicEntityDto;
  private resolutions: WorkflowResolutionDto[] = [];

  constructor(
    schemaHelper: SchemaHelper,
    workflowHelper: WorkflowHelper,
    workflowStateService: WorkflowStateService,
    processStepEntityService: ProcessStepEntityService,
    tenantFieldHelper: TenantFieldsHelper,
    statusHelper: StatusHelper,
    processStepLinkService: ProcessStepLinkService
  ) {
    super(
      processStepEntityService,
      tenantFieldHelper,
      schemaHelper,
      workflowHelper,
      statusHelper,
      workflowStateService,
      processStepLinkService
    );
  }

  async initialize(ctx: TestContext): Promise<void> {
    await super.initialize(ctx);

    const caseSchema = await this.schemaHelper.createSchema(this.ctx.tenantId, 'case-schema1234456', AreaTypeEnum.case, [], []);

    this.caseSchemaIds.push(caseSchema.id);

    const workflowStatusOperation = await this.workflowHelper.createStatusWithUniqueName(<CreateStatusCommand>{
      name: 'statusForWorkflowSchema',
      tenantId: this.ctx.tenantId,
      position: 0,
      configuration: <StatusConfiguration>{
        color: 'green',
        label: 'done'
      }
    });

    this.statusIds.push(workflowStatusOperation.targetId);

    const workflow = await this.workflowHelper.createWorkflow('workflow', this.ctx.tenantId, caseSchema.id, [
      workflowStatusOperation.targetId
    ]);

    this.workflowId = workflow.id;

    await this.workflowHelper.setDefaultStatus(workflow.id, workflowStatusOperation.targetId, this.ctx.tenantId);

    const resolutions: WorkflowResolutionDto[] = [
      {
        name: 'Success'
      },
      {
        name: 'Fail'
      }
    ];

    this.resolutions = resolutions;

    const stepToBeAddedSchema = await this.schemaHelper.createSchema(
      this.ctx.tenantId,
      'stepToBeAddedSchema',
      AreaTypeEnum.stepForm,
      [],
      []
    );

    const stepToBeAdded = await this.createProcessStepEntity('stepToBeAdded', stepToBeAddedSchema.id, resolutions);

    const harvesterSchema = await this.schemaHelper.createSchema(this.ctx.tenantId, 'schemaForHarvester', AreaTypeEnum.stepForm, [], []);
    this.stepSchemaIds.push(harvesterSchema.id, stepToBeAddedSchema.id);

    const harvesterStep = await this.createProcessStepEntity('Harvester', harvesterSchema.id, resolutions);

    this.stepLinkIds.push(
      (
        await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
          workflowId: workflow.id,
          workflowStatusId: undefined,
          refName: 'stepToBeAdded',
          processStepEntityId: stepToBeAdded.id,
          tenantId: this.ctx.tenantId,
          defaultOverride: {
            rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanResolve, WorkflowRightsEnum.CanDelete],
            expression: {},
            numberOfInstances: 1
          }
        })
      ).targetId
    );

    this.stepLinkIds.push(
      (
        await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
          workflowId: workflow.id,
          refName: 'harvester',
          processStepEntityId: harvesterStep.id,
          tenantId: this.ctx.tenantId,

          // when the actions are inside the overrides they seem not to be triggered (when they are in 'defaultOverride', they are triggered)

          overrides: [
            {
              rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanResolve, WorkflowRightsEnum.CanDelete],
              numberOfInstances: 1,

              onProcessStepResolvedEvents: [
                <AutomaticAddStepsEventDto>{
                  name: 'testAction',
                  eventType: EventTypes.AutomaticAddSteps,
                  steps: ['stepToBeAdded']
                }
              ]
            }
          ]
        })
      ).targetId
    );

    const caseEntity: CreateDynamicEntityDto = {
      appId: this.ctx.appId,
      areaType: AreaTypeEnum.case,
      tenantId: this.ctx.tenantId,
      fields: [],
      schemaId: caseSchema.id
    };

    const harvesterDynamicEntityCmd: CreateDynamicEntityDto = {
      areaType: harvesterSchema.areaType,
      fields: [],
      appId: this.ctx.appId,
      schemaId: harvesterSchema.id,
      tenantId: this.ctx.tenantId
    };

    this.harvesterDynamicEntityCmd = harvesterDynamicEntityCmd;

    const stateOperation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
      tenantId: this.ctx.tenantId,
      case: caseEntity,
      schemaId: workflow.id
    });

    this.workflowStateId = stateOperation.targetId;
  }

  async test(): Promise<TestResult> {
    const query: GetWorkflowStateQuery = {
      id: this.workflowStateId,
      tenant: this.ctx.tenantId,
      schemaId: this.workflowId
    };

    let state = await this.workflowStateService.get(query);
    console.log('workflowState created', state);

    let visualElements: VisualElement[] = [
      {
        id: 'idGeneratedFromFrontEnd1',
        index: 0
      }
    ];

    const createStepCommand = <UpdateStepCommand>{
      stepDynamicEntities: [],
      refName: 'harvester',
      resolution: '',
      stepSchemaId: this.stepSchemaIds[0],
      schemaId: this.workflowId,
      tenantId: this.ctx.tenantId,
      workflowStateId: this.workflowStateId,
      visualElements: visualElements,
      visualElementId: visualElements[0].id
    };

    await this.workflowStateService.addStep(createStepCommand);

    const stepHarvesterPublicId = await this.workflowHelper.getStepDePublicId(
      'harvester',
      this.workflowStateId,
      this.ctx.tenantId,
      this.workflowId
    );

    if (stepHarvesterPublicId) {
      await this.workflowStateService.updateStep(<UpdateStepCommand>{
        ...createStepCommand,
        stepDynamicEntities: [{ dynamicEntity: { ...this.harvesterDynamicEntityCmd, publicId: stepHarvesterPublicId } }],
        resolution: this.resolutions[0].name
      });

      const state = await this.workflowStateService.get(query);

      if (state.fields.length > 1) {
        return TestResult.success();
      }
    }
    return TestResult.failure('Test Failed');
  }
}

@Injectable()
export class EmbeddedFieldMathOperationActionTestTestService extends WorkflowActionEventsBaseTestService {
  private firstWeightingStepDEPublicId: string;
  private secondWeightingStepDE: CreateDynamicEntityDto;
  private caseDE: CreateDynamicEntityDto;
  private firstWeightingSchemaId: string;

  constructor(
    schemaHelper: SchemaHelper,
    workflowHelper: WorkflowHelper,
    workflowStateService: WorkflowStateService,
    processStepEntityService: ProcessStepEntityService,
    tenantFieldHelper: TenantFieldsHelper,
    statusHelper: StatusHelper,
    processStepLinkService: ProcessStepLinkService,
    private schemaService: SchemasService,
    private dynamicEntityService: DynamicEntitiesService
  ) {
    super(
      processStepEntityService,
      tenantFieldHelper,
      schemaHelper,
      workflowHelper,
      statusHelper,
      workflowStateService,
      processStepLinkService
    );
  }

  async initialize(ctx: TestContext): Promise<void> {
    await super.initialize(ctx);

    const resolutions: WorkflowResolutionDto[] = [
      {
        name: 'Success'
      },
      {
        name: 'Fail'
      }
    ];

    // Tenant fields
    var firstWeightingTenantField = await this.tenantFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.DecimalField,
      [AreaTypeEnum.stepForm, AreaTypeEnum.case],
      'firstWeighting',
      'First weighting',
      []
    );
    var secondWeightingTenantField = await this.tenantFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.DecimalField,
      [AreaTypeEnum.stepForm, AreaTypeEnum.case],
      'secondWeighting',
      'Second weighting',
      []
    );
    var differenceWeightingTenantField = await this.tenantFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.DecimalField,
      [AreaTypeEnum.stepForm, AreaTypeEnum.case],
      'differenceWeighing',
      'Difference Weighing',
      []
    );

    this.fieldIds.push(firstWeightingTenantField.id, secondWeightingTenantField.id, differenceWeightingTenantField.id);

    // Nested Schema
    const embeddedSchemaFields = await this.schemaHelper.createSchemaFields([differenceWeightingTenantField]);

    const simpleSchema = await this.schemaHelper.createSchema(
      this.ctx.tenantId,
      'embeddedSchema',
      AreaTypeEnum.stepForm,
      embeddedSchemaFields,
      []
    );

    const embbededSchemaField = await this.tenantFieldHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.EmbededField,
      [AreaTypeEnum.stepForm],
      'embbededSchemaField',
      'Embedded Schema Field',
      [],
      <IBaseFieldConfiguration>{
        schemaId: simpleSchema.id,
        schemaAreaType: simpleSchema.areaType
      }
    );
    const firstWeightingSchemaFields = await this.schemaHelper.createSchemaFields([embbededSchemaField]);

    // First Step
    const firstWeightingSchema = await this.schemaHelper.createSchema(
      this.ctx.tenantId,
      'firstWeightingSchema',
      AreaTypeEnum.stepForm,
      firstWeightingSchemaFields,
      []
    );

    this.firstWeightingSchemaId = firstWeightingSchema.id;

    this.fieldIds.push(embbededSchemaField.id);

    const firstWeightingStep = await this.createProcessStepEntity('firstWeightingStepEntity', firstWeightingSchema.id, resolutions);

    // Second Step
    const secondWeightingSchemaFields = await this.schemaHelper.createSchemaFields([secondWeightingTenantField]);

    const secondWeightingSchema = await this.schemaHelper.createSchema(
      this.ctx.tenantId,
      'secondWeightingSchema',
      AreaTypeEnum.stepForm,
      secondWeightingSchemaFields,
      []
    );

    this.stepSchemaIds.push(firstWeightingSchema.id, secondWeightingSchema.id);

    const secondWeightingStep = await this.createProcessStepEntity('secondWeightingStepEntity', secondWeightingSchema.id, resolutions);

    const secondWeightingStepDE: CreateDynamicEntityDto = {
      areaType: secondWeightingSchema.areaType,
      fields: [
        <DecimalFieldValueDto>{
          id: secondWeightingTenantField.fieldName,
          type: FieldTypeIds.DecimalField,
          value: 100.89
        }
      ],
      appId: this.ctx.appId,
      schemaId: secondWeightingSchema.id,
      tenantId: this.ctx.tenantId
    };
    this.secondWeightingStepDE = secondWeightingStepDE;

    // Case
    const caseSchemaFields = await this.schemaHelper.createSchemaFields([firstWeightingTenantField]);

    const caseSchema = await this.schemaHelper.createSchema(this.ctx.tenantId, 'caseSchema', AreaTypeEnum.case, caseSchemaFields, []);
    this.caseSchemaIds.push(caseSchema.id);

    this.caseDE = {
      appId: this.ctx.appId,
      areaType: AreaTypeEnum.case,
      fields: [
        <DecimalFieldValueDto>{
          id: firstWeightingTenantField.fieldName,
          type: FieldTypeIds.DecimalField,
          value: 50.56
        }
      ],
      schemaId: caseSchema.id,
      tenantId: this.ctx.tenantId
    };

    const open = await this.statusHelper.createStatus(this.ctx.tenantId, 'Open', 0);
    const workflow = await this.workflowHelper.createWorkflow('workflow', this.ctx.tenantId, caseSchema.id, [open.id]);

    this.statusIds.push(open.id);
    this.workflowId = workflow.id;

    this.stepLinkIds.push(
      (
        await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
          workflowId: workflow.id,
          refName: 'firstWeightingStep',
          processStepEntityId: firstWeightingStep.id,
          tenantId: this.ctx.tenantId,
          defaultOverride: {
            expression: {},
            numberOfInstances: 1,
            onProcessStepResolvedEvents: [],
            rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanResolve, WorkflowRightsEnum.CanDelete]
          }
        })
      ).targetId
    );

    const processStepFields = {};
    processStepFields['p2_field2'] = <PropertyPath>{ path: ['secondWeightingStep', 'secondWeighting'] };

    const caseFields = {};
    processStepFields['p1_field1'] = <PropertyPath>{ path: ['firstWeighting'] };

    this.stepLinkIds.push(
      (
        await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
          workflowId: workflow.id,
          refName: 'secondWeightingStep',
          processStepEntityId: secondWeightingStep.id,
          tenantId: this.ctx.tenantId,
          defaultOverride: {
            numberOfInstances: 1,
            rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanResolve, WorkflowRightsEnum.CanDelete],
            onProcessStepResolvedEvents: [
              <MathExpressionCalculationEvent>{
                id: undefined,
                eventType: EventTypes.MathExpressionCalculation,
                name: 'setDifferenceWeighing',
                formula: '(p2_field2 - p1_field1)/p2_field2',
                processStepFields: processStepFields,
                caseFields: caseFields,
                processStepResultField: <PropertyPath>{ path: ['firstWeightingStep', 'embbededSchemaField', 'differenceWeighing'] }
              }
            ]
          }
        })
      ).targetId
    );

    const stateOperation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
      tenantId: this.ctx.tenantId,
      case: this.caseDE,
      schemaId: workflow.id
    });

    this.workflowStateId = stateOperation.targetId;

    let visualElements: VisualElement[] = [
      {
        id: 'idGeneratedFromFrontEnd1',
        index: 0
      },
      {
        id: 'idGeneratedFromFrontEnd2',
        index: 1
      }
    ];

    const createStepCommand = <UpdateStepCommand>{
      stepDynamicEntities: [],
      refName: 'firstWeightingStep',
      resolution: '',
      stepSchemaId: firstWeightingSchema.id,
      schemaId: workflow.id,
      tenantId: this.ctx.tenantId,
      workflowStateId: stateOperation.targetId,
      visualElements: visualElements,
      visualElementId: visualElements[0].id
    };

    // add a step, do not fill any field value, it shall be done by postaction

    await this.workflowStateService.addStep(createStepCommand);

    this.firstWeightingStepDEPublicId = await this.workflowHelper.getStepDePublicId(
      'firstWeightingStep',
      stateOperation.targetId,
      this.ctx.tenantId,
      workflow.id
    );

    const createStepCommand2 = <UpdateStepCommand>{
      stepDynamicEntities: [],
      refName: 'secondWeightingStep',
      resolution: '',
      stepSchemaId: secondWeightingSchema.id,
      schemaId: workflow.id,
      tenantId: this.ctx.tenantId,
      workflowStateId: stateOperation.targetId,
      visualElements: visualElements,
      visualElementId: visualElements[1].id
    };

    this.deleteStepCommands.push(<DeleteStepCommand>createStepCommand, <DeleteStepCommand>createStepCommand2);

    await this.workflowStateService.addStep(createStepCommand2);

    const stepSecondWeighingPublicId = await this.workflowHelper.getStepDePublicId(
      'secondWeightingStep',
      stateOperation.targetId,
      this.ctx.tenantId,
      workflow.id
    );

    if (stepSecondWeighingPublicId) {
      // resolve the step to trigger mathExpression action
      await this.workflowStateService.updateStep(<UpdateStepCommand>{
        ...createStepCommand2,
        stepDynamicEntities: [{ dynamicEntity: { ...secondWeightingStepDE, publicId: stepSecondWeighingPublicId } }],
        resolution: resolutions[0].name
      });
    }
  }

  async test(): Promise<TestResult> {
    const field2 = Number(<any>this.secondWeightingStepDE.fields[0].value);

    const field1 = Number(this.caseDE.fields[0].value);
    const expectedResult = (field2 - field1) / field2;

    // nested schema field in firstWeighing step shall hold the result of mathOperation
    const stepHoldingNestedTargetField = await this.dynamicEntityService.getById(
      this.ctx.tenantId,
      this.firstWeightingStepDEPublicId,
      this.firstWeightingSchemaId,
      AreaTypeEnum.stepForm
    );

    const embeddedSchemaField = <EmbededFieldValueDto>stepHoldingNestedTargetField.fields.find((x) => x.id === 'embbededSchemaField');

    const result = Number(embeddedSchemaField?.value.find((x) => x.id === 'differenceWeighing')?.value);

    if (result && result === expectedResult) {
      return TestResult.success();
    }

    return TestResult.failure('Test Failed');
  }
}
