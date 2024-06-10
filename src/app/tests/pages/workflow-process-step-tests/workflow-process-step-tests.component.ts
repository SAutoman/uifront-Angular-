/**
 * global
 */
import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';

import {
  allRights,
  APP_CLIENT_ID,
  AreaTypeEnum,
  CreateDynamicEntityDto,
  CreateProcessStepEntityCmd,
  CreateProcessStepLinkDtoNew,
  CreateWorkflowStateCommand,
  DeleteStepCommand,
  DeleteWorkflowStateCommand,
  DynamicEntitiesService,
  FieldTypeIds,
  GetWorkflowStateQuery,
  OperationStatus,
  ProcessStepEntityDto,
  ProcessStepEntityService,
  ProcessStepLinkBaseOverrideDto,
  ProcessStepLinkService,
  SchemasService,
  UpdateStatusCommand,
  UpdateStepCommand,
  VisualElement,
  WorkflowResolutionDto,
  WorkflowService,
  WorkflowStateService,
  WorkflowStatusService
} from '@wfm/service-layer';

/**
 * local
 */

import { SchemaHelper } from '../helpers/schemaHelper';
import { TenantFieldsHelper } from '../helpers/tenantFieldsHelper';
import { WorkflowHelper } from '../helpers/workflowHelper';
import { RuleCustomOperatorEnum, RuleSetCustomCondition } from '@wfm/service-layer/models/expressionModel';
import { StatusHelper } from '../helpers/statusHelper';
import { ListOfLinkFieldValueDto } from '@wfm/service-layer/models/FieldValueDto';
import { TestUiPageComponent } from '@wfm/tests/modules/test-ui/test-ui-page/test-ui-page.component';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { Store } from '@ngrx/store';
import { Test, TestResult } from '@wfm/tests/models';

@Component({
  selector: 'workflow-process-step-tests',
  template: '<app-test-ui-page #test></app-test-ui-page>'
})
export class WorkflowProcessStepTestsComponent extends TenantComponent implements AfterViewInit {
  @ViewChild('test') testsComp: TestUiPageComponent;

  title = 'Workflow process step tests';

  constructor(
    @Inject(APP_CLIENT_ID) readonly appId: string,
    private statusHelper: StatusHelper,
    private schemaService: SchemasService,
    private workflowStatusService: WorkflowStatusService,
    private schemaHelper: SchemaHelper,
    private tenantFieldHelper: TenantFieldsHelper,
    private processStepLinkService: ProcessStepLinkService,
    private workflowHelper: WorkflowHelper,
    private workflowService: WorkflowService,
    private dynamicEntitiesService: DynamicEntitiesService,
    private workflowStateService: WorkflowStateService,
    private processStepEntityService: ProcessStepEntityService,
    store: Store<ApplicationState>
  ) {
    super(store);
  }

  ngAfterViewInit(): void {
    this.testsComp.init(this.title, [
      <Test>{
        name: 'Create',
        function: async () => await this.create()
      },
      <Test>{
        name: 'Get',
        function: async () => await this.get()
      },
      <Test>{
        name: 'Delete',
        function: async () => await this.delete()
      },
      <Test>{
        name: 'Delete step - single instance',
        function: async () => await this.deleteStepSingleInstance()
      },
      <Test>{
        name: 'Delete step - multiple instance',
        function: async () => await this.deleteStepMultipleInstance()
      },
      <Test>{
        name: 'Add step - multiple instance',
        function: async () => await this.addStepMultipleInstance()
      },
      <Test>{
        name: 'Hide step',
        function: async () => await this.hideStep()
      },
      <Test>{
        name: 'Repeatable step: there should be 2 stepForms in stepEntity (2 rawDatas in the case)',
        function: async () => await this.repeatableStep()
      },
      <Test>{
        name: 'Non-Repeatable step: there should be 1 stepForm in stepEntity (2 rawDatas in the case)',
        function: async () => await this.nonRepeatableStep()
      }
    ]);
  }

  private async create(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const schema = await this.schemaHelper.createSchema(this.tenant, 'someName123', AreaTypeEnum.stepForm, [], []);
      const cmd: CreateProcessStepEntityCmd = {
        name: 'DirectSupplier',
        // refName: 'directSupplier',
        schemaId: schema.id,
        resolutions: [],
        actions: [],
        tenantId: this.tenant
      };
      const operation = await this.processStepEntityService.create(cmd);
      const operationStatusEnum: OperationStatus = OperationStatus[operation.status.toString()];

      if (operationStatusEnum === OperationStatus.Success) {
        isSuccess = true;
        const entity = await this.processStepEntityService.get(this.tenant, operation.targetId);

        await this.schemaService.deleteById(schema.id, this.tenant, schema.areaType);
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Create';

      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async get(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const schema = await this.schemaHelper.createSchema(this.tenant, 'someName123', AreaTypeEnum.stepForm, [], []);
      const cmd: CreateProcessStepEntityCmd = {
        name: 'DirectSupplier',
        // refName: 'directSupplier',
        schemaId: schema.id,
        resolutions: [],
        actions: [],
        tenantId: this.tenant
      };

      const createOperation = await this.processStepEntityService.create(cmd);
      const operationStatusEnum: OperationStatus = OperationStatus[createOperation.status.toString()];
      if (operationStatusEnum === OperationStatus.Success) {
        const workflowProcessStep = await this.processStepEntityService.get(this.tenant, createOperation.targetId);
        if (workflowProcessStep.name === 'DirectSupplier') {
          isSuccess = true;
          await this.schemaService.deleteById(schema.id, this.tenant, schema.areaType);
        }
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Get';

      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async delete(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const schema = await this.schemaHelper.createSchema(this.tenant, 'someName123', AreaTypeEnum.stepForm, [], []);
      const cmd: CreateProcessStepEntityCmd = {
        name: 'DirectSupplier',
        // refName: 'directSupplier',
        schemaId: schema.id,
        resolutions: [],
        actions: [],
        tenantId: this.tenant
      };

      const createOperation = await this.processStepEntityService.create(cmd);
      const deleteOperation = await this.processStepEntityService.delete(this.tenant, createOperation.targetId);
      const operationStatusEnum: OperationStatus = OperationStatus[deleteOperation.status.toString()];

      if (operationStatusEnum === OperationStatus.Success) {
        isSuccess = true;
        await this.schemaService.deleteById(schema.id, this.tenant, schema.areaType);
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Delete';

      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async hideStep(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const caseSchema = await this.schemaHelper.createCaseSchema(this.tenant, 'someSchemaName123', AreaTypeEnum.case, [], []);
      const harvesterSchema = await this.schemaHelper.createSchema(this.tenant, 'schemaForHarvester', AreaTypeEnum.stepForm, [], []);

      const rawDataSchema = await this.schemaHelper.createSchema(this.tenant, 'rawDataSchema', AreaTypeEnum.rawData, [], []);

      const rawDataDynamicEntityOperation = await this.dynamicEntitiesService.create(<CreateDynamicEntityDto>{
        areaType: AreaTypeEnum.rawData,
        schemaId: rawDataSchema.id,
        tenantId: this.tenant
      });

      const caseValue: CreateDynamicEntityDto = {
        appId: this.appId,
        areaType: AreaTypeEnum.case,
        tenantId: this.tenant,
        fields: [
          <ListOfLinkFieldValueDto>{
            id: 'rawDataIds',
            type: FieldTypeIds.ListOfLinksField,
            value: [rawDataDynamicEntityOperation.targetId]
          }
        ],
        schemaId: caseSchema.id
      };

      const open = await this.statusHelper.createStatus(this.tenant, 'Open', 0);
      const inProgress = await this.statusHelper.createStatus(this.tenant, 'InProgress', 1);
      const workflow = await this.workflowHelper.createWorkflow('workflow-test1', this.tenant, caseSchema.id, [open.id, inProgress.id]);
      const resolutions: WorkflowResolutionDto[] = [
        {
          name: 'Success'
        },
        {
          name: 'Fail'
        }
      ];
      const harvesterStep = await this.createProcessStepEntity('Harvester', 'harvester', harvesterSchema.id, resolutions);

      await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        workflowId: workflow.id,
        workflowStatusId: open.id,
        refName: 'harvester',
        processStepEntityId: harvesterStep.id,
        expression: {},
        tenantId: this.tenant,
        numberOfInstances: 2,
        onProcessStepResolvedEvents: []
      });
      await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        workflowId: workflow.id,
        workflowStatusId: inProgress.id,
        refName: 'harvester',
        tenantId: this.tenant,
        processStepEntityId: harvesterStep.id,
        expression: {
          name: 'nameTest',
          ruleSet: {
            condition: RuleSetCustomCondition.And,
            rules: [
              {
                operator: RuleCustomOperatorEnum.Equal,
                propertyPath: {
                  path: ['status']
                },
                value: inProgress.name
              }
            ]
          },
          actionSettings: {
            config: {
              name: harvesterStep.name,
              hidden: true
            }
          }
        },
        numberOfInstances: 2,
        onProcessStepResolvedEvents: []
      });

      const stateOperation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
        tenantId: this.tenant,
        case: caseValue,
        schemaId: workflow.id
      });

      await this.workflowStateService.updateStatus(<UpdateStatusCommand>{
        statusId: open.id,
        tenantId: this.tenant,
        workflowStateId: stateOperation.targetId,
        schemaId: workflow.id
      });

      await this.workflowStateService.updateStatus(<UpdateStatusCommand>{
        statusId: inProgress.id,
        tenantId: this.tenant,
        workflowStateId: stateOperation.targetId,
        schemaId: workflow.id
      });

      const stateResult = await this.workflowStateService.get(<GetWorkflowStateQuery>{
        id: stateOperation.targetId,
        tenant: this.tenant,
        schemaId: workflow.id
      });

      if (stateResult.steps.some((x) => x.actionSettings !== null)) {
        isSuccess = true;
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Hide step';
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async deleteStepMultipleInstance(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const schemaFields = await this.schemaHelper.createSchemaFields([]);

      const caseSchema = await this.schemaHelper.createCaseSchema(this.tenant, 'someSchemaName123', AreaTypeEnum.case, [], []);
      const harvesterSchema = await this.schemaHelper.createSchema(
        this.tenant,
        'schemaForHarvester',
        AreaTypeEnum.stepForm,
        schemaFields,
        []
      );

      // Define workflow with steps
      const open = await this.statusHelper.createStatus(this.tenant, 'open', 0);
      const workflow = await this.workflowHelper.createWorkflow('workflow-test1', this.tenant, caseSchema.id, [open.id]);
      const resolutions: WorkflowResolutionDto[] = [
        {
          name: 'Success'
        },
        {
          name: 'Fail'
        }
      ];
      const harvesterStep = await this.createProcessStepEntity('Harvester', 'harvester', harvesterSchema.id, resolutions);

      await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        workflowId: workflow.id,
        workflowStatusId: open.id,
        tenantId: this.tenant,
        refName: 'harvester',
        processStepEntityId: harvesterStep.id,
        expression: {},
        defaultOverride: {
          numberOfInstances: 2,
          onProcessStepResolvedEvents: [],
          rights: allRights
        }
      });

      const rawDataSchema = await this.schemaHelper.createSchema(this.tenant, 'rawDataSchema', AreaTypeEnum.rawData, [], []);

      const rawDataDynamicEntityOperation = await this.dynamicEntitiesService.create(<CreateDynamicEntityDto>{
        areaType: AreaTypeEnum.rawData,
        schemaId: rawDataSchema.id,
        tenantId: this.tenant
      });

      const caseValue: CreateDynamicEntityDto = {
        appId: this.appId,
        areaType: AreaTypeEnum.case,
        tenantId: this.tenant,
        fields: [
          <ListOfLinkFieldValueDto>{
            id: 'rawDataIds',
            type: FieldTypeIds.ListOfLinksField,
            value: [rawDataDynamicEntityOperation.targetId]
          }
        ],
        schemaId: caseSchema.id
      };

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

      const stateOperation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
        tenantId: this.tenant,
        case: caseValue,
        schemaId: workflow.id
      });

      const createStepCommand = <UpdateStepCommand>{
        stepDynamicEntities: [],
        refName: 'harvester',
        resolution: '',
        stepSchemaId: harvesterSchema.id,
        schemaId: workflow.id,
        tenantId: this.tenant,
        workflowStateId: stateOperation.targetId,
        visualElements: visualElements,
        visualElementId: visualElements[0].id
      };

      await this.workflowStateService.addStep(createStepCommand);

      const stepHarvesterPublicId = await this.workflowHelper.getStepDePublicId(
        'harvester',
        stateOperation.targetId,
        this.tenant,
        workflow.id
      );

      if (stepHarvesterPublicId) {
        await this.workflowStateService.updateStep(<UpdateStepCommand>{
          ...createStepCommand,
          stepDynamicEntities: [
            {
              dynamicEntity: {
                publicId: stepHarvesterPublicId,
                areaType: harvesterSchema.areaType,
                fields: [],
                appId: this.appId,
                schemaId: harvesterSchema.id,
                tenantId: this.tenant
              }
            }
          ],
          resolution: resolutions[0].name
        });

        await this.workflowStateService.deleteStep(<DeleteStepCommand>{
          refName: 'harvester',
          tenantId: this.tenant,
          workflowStateId: stateOperation.targetId,
          visualElementId: visualElements[0].id,
          schemaId: workflow.id
        });

        const stateResult = await this.workflowStateService.get(<GetWorkflowStateQuery>{
          id: stateOperation.targetId,
          tenant: this.tenant,
          schemaId: workflow.id
        });

        if (stateResult.fields.length === 0) {
          isSuccess = true;
          await this.workflowStateService.delete(<DeleteWorkflowStateCommand>{
            id: stateOperation.targetId,
            tenant: this.tenant,
            schemaId: workflow.id
          });
          await this.workflowService.delete(workflow.id, this.tenant);
        }
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Delete step multiple instance';

      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async deleteStepSingleInstance(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const harvesterSchema = await this.schemaHelper.createSchema(this.tenant, 'schemaForHarvester', AreaTypeEnum.stepForm, [], []);
      const caseSchema = await this.schemaHelper.createCaseSchema(this.tenant, 'caseSchema123', AreaTypeEnum.case, [], []);

      const open = await this.statusHelper.createStatus(this.tenant, 'Open', 0);
      const workflow = await this.workflowHelper.createWorkflow('workflow-test1', this.tenant, caseSchema.id, [open.id]);
      const resolutions: WorkflowResolutionDto[] = [
        {
          name: 'Success'
        },
        {
          name: 'Fail'
        }
      ];
      const harvesterStep = await this.createProcessStepEntity('Harvester', 'harvester', harvesterSchema.id, resolutions);
      await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        workflowId: workflow.id,
        workflowStatusId: undefined,
        refName: 'harvester',
        tenantId: this.tenant,
        processStepEntityId: harvesterStep.id,
        expression: {},
        onProcessStepResolvedEvents: [],
        numberOfInstances: 1,
        defaultOverride: <ProcessStepLinkBaseOverrideDto>{ rights: allRights }
      });

      const rawDataSchema = await this.schemaHelper.createSchema(this.tenant, 'rawDataSchema', AreaTypeEnum.rawData, [], []);

      const rawDataDynamicEntityOperation = await this.dynamicEntitiesService.create(<CreateDynamicEntityDto>{
        areaType: AreaTypeEnum.rawData,
        schemaId: rawDataSchema.id,
        tenantId: this.tenant
      });

      const stateOperation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
        tenantId: this.tenant,
        case: {
          appId: this.appId,
          areaType: AreaTypeEnum.case,
          tenantId: this.tenant,
          fields: [
            <ListOfLinkFieldValueDto>{
              id: 'rawDataIds',
              type: FieldTypeIds.ListOfLinksField,
              value: [rawDataDynamicEntityOperation.targetId]
            }
          ],
          schemaId: caseSchema.id
        },
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
        refName: 'harvester',
        resolution: '',
        stepSchemaId: harvesterSchema.id,
        schemaId: workflow.id,
        tenantId: this.tenant,
        workflowStateId: stateOperation.targetId,
        visualElements: visualElements,
        visualElementId: visualElements[0].id
      };

      await this.workflowStateService.addStep(createStepCommand);

      const stepHarvesterPublicId = await this.workflowHelper.getStepDePublicId(
        'harvester',
        stateOperation.targetId,
        this.tenant,
        workflow.id
      );

      if (stepHarvesterPublicId) {
        await this.workflowStateService.updateStep(<UpdateStepCommand>{
          ...createStepCommand,
          stepDynamicEntities: [
            {
              dynamicEntity: {
                publicId: stepHarvesterPublicId,
                areaType: harvesterSchema.areaType,
                fields: [],
                appId: this.appId,
                schemaId: harvesterSchema.id,
                tenantId: this.tenant
              }
            }
          ],
          resolution: resolutions[0].name
        });

        await this.workflowStateService.deleteStep(<DeleteStepCommand>{
          refName: 'harvester',
          tenantId: this.tenant,
          workflowStateId: stateOperation.targetId,
          visulalElementId: visualElements[0].id,
          schemaId: workflow.id
        });

        const state = await this.workflowStateService.get({
          id: stateOperation.targetId,
          tenant: this.tenant,
          schemaId: workflow.id
        });

        if (state.fields.length == 0) {
          isSuccess = true;
        }
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Delete step single instance';

      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async addStepMultipleInstance(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const harvesterSchema = await this.schemaHelper.createSchema(this.tenant, 'schemaForHarvester', AreaTypeEnum.stepForm, [], []);
      const caseSchema = await this.schemaHelper.createCaseSchema(this.tenant, 'caseSchema123', AreaTypeEnum.case, [], []);

      const open = await this.statusHelper.createStatus(this.tenant, 'open', 0);
      const workflow = await this.workflowHelper.createWorkflow('workflow-test1', this.tenant, caseSchema.id, [open.id]);
      const resolutions: WorkflowResolutionDto[] = [
        {
          name: 'Success'
        },
        {
          name: 'Fail'
        }
      ];
      const harvesterStep = await this.createProcessStepEntity('Harvester', 'harvester', harvesterSchema.id, resolutions);

      await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        workflowId: workflow.id,
        workflowStatusId: open.id,
        refName: 'harvester',
        processStepEntityId: harvesterStep.id,
        tenantId: this.tenant,
        defaultOverride: {
          rights: allRights,
          numberOfInstances: 2,
          onProcessStepResolvedEvents: []
        }
      });

      const rawDataSchema = await this.schemaHelper.createSchema(this.tenant, 'rawDataSchema', AreaTypeEnum.rawData, [], []);

      const rawDataDynamicEntityOperation = await this.dynamicEntitiesService.create(<CreateDynamicEntityDto>{
        areaType: AreaTypeEnum.rawData,
        schemaId: rawDataSchema.id,
        tenantId: this.tenant
      });

      const caseEntity: CreateDynamicEntityDto = {
        appId: this.appId,
        areaType: AreaTypeEnum.case,
        tenantId: this.tenant,
        fields: [
          <ListOfLinkFieldValueDto>{
            id: 'rawDataIds',
            type: FieldTypeIds.ListOfLinksField,
            value: [rawDataDynamicEntityOperation.targetId]
          }
        ],
        schemaId: caseSchema.id
      };

      const stateOperation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
        tenantId: this.tenant,
        case: caseEntity,
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

      const createStepCommand = <UpdateStepCommand>{
        stepDynamicEntities: [],
        refName: 'harvester',
        resolution: '',
        stepSchemaId: harvesterSchema.id,
        schemaId: workflow.id,
        tenantId: this.tenant,
        workflowStateId: stateOperation.targetId,
        visualElements: visualElements,
        visualElementId: visualElements[0].id
      };

      await this.workflowStateService.addStep(createStepCommand);

      const stepHarvesterPublicId = await this.workflowHelper.getStepDePublicId(
        'harvester',
        stateOperation.targetId,
        this.tenant,
        workflow.id
      );

      if (stepHarvesterPublicId) {
        await this.workflowStateService.updateStep(<UpdateStepCommand>{
          ...createStepCommand,
          stepDynamicEntities: [
            {
              dynamicEntity: {
                publicId: stepHarvesterPublicId,
                areaType: harvesterSchema.areaType,
                fields: [],
                appId: this.appId,
                schemaId: harvesterSchema.id,
                tenantId: this.tenant
              }
            }
          ],
          resolution: resolutions[0].name
        });

        const createStepCommand2 = <UpdateStepCommand>{
          stepDynamicEntities: [],
          refName: 'harvester',
          resolution: '',
          stepSchemaId: harvesterSchema.id,
          schemaId: workflow.id,
          tenantId: this.tenant,
          workflowStateId: stateOperation.targetId,
          visualElements: visualElements,
          visualElementId: visualElements[1].id
        };

        await this.workflowStateService.addStep(createStepCommand2);

        const stepHarvesterPublicId2 = await this.workflowHelper.getStepDePublicId(
          'harvester',
          stateOperation.targetId,
          this.tenant,
          workflow.id
        );

        if (stepHarvesterPublicId2) {
          await this.workflowStateService.updateStep(<UpdateStepCommand>{
            ...createStepCommand2,
            stepDynamicEntities: [
              {
                dynamicEntity: {
                  publicId: stepHarvesterPublicId2,
                  areaType: harvesterSchema.areaType,
                  fields: [],
                  appId: this.appId,
                  schemaId: harvesterSchema.id,
                  tenantId: this.tenant
                }
              }
            ],
            resolution: resolutions[0].name
          });

          const stateResult = await this.workflowStateService.get(<GetWorkflowStateQuery>{
            id: stateOperation.targetId,
            tenant: this.tenant,
            schemaId: workflow.id
          });

          if (stateResult.fields.find((x) => x.refName == 'harvester').entities.length == 2) {
            isSuccess = true;
            await this.workflowStateService.delete(<DeleteWorkflowStateCommand>{
              id: stateOperation.targetId,
              tenant: this.tenant,
              schemaId: workflow.id
            });
            await this.workflowService.delete(workflow.id, this.tenant);
          }
        }
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Repeatable step test failed';

      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async repeatableStep(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const harvesterSchema = await this.schemaHelper.createSchema(this.tenant, 'schemaForHarvester', AreaTypeEnum.stepForm, [], []);
      const caseSchema = await this.schemaHelper.createCaseSchema(this.tenant, 'caseSchema123', AreaTypeEnum.case, [], []);

      const open = await this.statusHelper.createStatus(this.tenant, 'open', 0);
      const workflow = await this.workflowHelper.createWorkflow('workflow-test1', this.tenant, caseSchema.id, [open.id]);
      const resolutions: WorkflowResolutionDto[] = [
        {
          name: 'Success'
        },
        {
          name: 'Fail'
        }
      ];
      const harvesterStep = await this.createProcessStepEntity('Harvester', 'harvester', harvesterSchema.id, resolutions);

      await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        workflowId: workflow.id,
        workflowStatusId: open.id,
        refName: 'harvester',
        processStepEntityId: harvesterStep.id,
        tenantId: this.tenant,
        defaultOverride: {
          rights: allRights,
          numberOfInstances: 1,
          onProcessStepResolvedEvents: []
        },
        processStepLinkRepeatableSettings: {
          isRepeatable: true,
          resolveAtOnce: true,
          // linkedRawDataFieldNames: [],
          linkedRawDataSettings: null
        }
      });

      const rawDataSchema = await this.schemaHelper.createSchema(this.tenant, 'rawDataSchema', AreaTypeEnum.rawData, [], []);

      const rawDataDynamicEntityOperation1 = await this.dynamicEntitiesService.create(<CreateDynamicEntityDto>{
        areaType: AreaTypeEnum.rawData,
        schemaId: rawDataSchema.id,
        tenantId: this.tenant
      });

      const rawDataDynamicEntityOperation2 = await this.dynamicEntitiesService.create(<CreateDynamicEntityDto>{
        areaType: AreaTypeEnum.rawData,
        schemaId: rawDataSchema.id,
        tenantId: this.tenant
      });

      const caseEntity: CreateDynamicEntityDto = {
        appId: this.appId,
        areaType: AreaTypeEnum.case,
        tenantId: this.tenant,
        fields: [
          <ListOfLinkFieldValueDto>{
            id: 'rawDataIds',
            type: FieldTypeIds.ListOfLinksField,
            value: [rawDataDynamicEntityOperation1.targetId, rawDataDynamicEntityOperation2.targetId]
          }
        ],
        schemaId: caseSchema.id
      };

      const stateOperation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
        tenantId: this.tenant,
        case: caseEntity,
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
        refName: 'harvester',
        resolution: '',
        stepSchemaId: harvesterSchema.id,
        schemaId: workflow.id,
        tenantId: this.tenant,
        workflowStateId: stateOperation.targetId,
        visualElements: visualElements,
        visualElementId: visualElements[0].id
      };

      await this.workflowStateService.addStep(createStepCommand);

      const stateResult = await this.workflowStateService.get(<GetWorkflowStateQuery>{
        id: stateOperation.targetId,
        tenant: this.tenant,
        schemaId: workflow.id
      });

      if (stateResult.fields.find((x) => x.refName == 'harvester')?.entities[0]?.stepDynamicEntities?.length === 2) {
        isSuccess = true;
        await this.workflowStateService.delete(<DeleteWorkflowStateCommand>{
          id: stateOperation.targetId,
          tenant: this.tenant,
          schemaId: workflow.id
        });
        await this.workflowService.delete(workflow.id, this.tenant);
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Add step multiple instance';

      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async nonRepeatableStep(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const harvesterSchema = await this.schemaHelper.createSchema(this.tenant, 'schemaForHarvester', AreaTypeEnum.stepForm, [], []);
      const caseSchema = await this.schemaHelper.createCaseSchema(this.tenant, 'caseSchema123', AreaTypeEnum.case, [], []);

      const open = await this.statusHelper.createStatus(this.tenant, 'open', 0);
      const workflow = await this.workflowHelper.createWorkflow('workflow-test1', this.tenant, caseSchema.id, [open.id]);
      const resolutions: WorkflowResolutionDto[] = [
        {
          name: 'Success'
        },
        {
          name: 'Fail'
        }
      ];
      const harvesterStep = await this.createProcessStepEntity('Harvester', 'harvester', harvesterSchema.id, resolutions);

      await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        workflowId: workflow.id,
        workflowStatusId: open.id,
        refName: 'harvester',
        processStepEntityId: harvesterStep.id,
        tenantId: this.tenant,
        defaultOverride: {
          rights: allRights,
          numberOfInstances: 1,
          onProcessStepResolvedEvents: []
        }
        // no repeatableSettings provided
      });

      const rawDataSchema = await this.schemaHelper.createSchema(this.tenant, 'rawDataSchema', AreaTypeEnum.rawData, [], []);

      const rawDataDynamicEntityOperation1 = await this.dynamicEntitiesService.create(<CreateDynamicEntityDto>{
        areaType: AreaTypeEnum.rawData,
        schemaId: rawDataSchema.id,
        tenantId: this.tenant
      });

      const rawDataDynamicEntityOperation2 = await this.dynamicEntitiesService.create(<CreateDynamicEntityDto>{
        areaType: AreaTypeEnum.rawData,
        schemaId: rawDataSchema.id,
        tenantId: this.tenant
      });

      const caseEntity: CreateDynamicEntityDto = {
        appId: this.appId,
        areaType: AreaTypeEnum.case,
        tenantId: this.tenant,
        fields: [
          <ListOfLinkFieldValueDto>{
            id: 'rawDataIds',
            type: FieldTypeIds.ListOfLinksField,
            value: [rawDataDynamicEntityOperation1.targetId, rawDataDynamicEntityOperation2.targetId]
          }
        ],
        schemaId: caseSchema.id
      };

      const stateOperation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
        tenantId: this.tenant,
        case: caseEntity,
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
        refName: 'harvester',
        resolution: '',
        stepSchemaId: harvesterSchema.id,
        schemaId: workflow.id,
        tenantId: this.tenant,
        workflowStateId: stateOperation.targetId,
        visualElements: visualElements,
        visualElementId: visualElements[0].id
      };

      await this.workflowStateService.addStep(createStepCommand);

      const stateResult = await this.workflowStateService.get(<GetWorkflowStateQuery>{
        id: stateOperation.targetId,
        tenant: this.tenant,
        schemaId: workflow.id
      });
      if (stateResult.fields.find((x) => x.refName == 'harvester').entities[0].stepDynamicEntities.length === 1) {
        isSuccess = true;
        await this.workflowStateService.delete(<DeleteWorkflowStateCommand>{
          id: stateOperation.targetId,
          tenant: this.tenant,
          schemaId: workflow.id
        });
        await this.workflowService.delete(workflow.id, this.tenant);
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Non Repeatable test failed';

      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  // Help methods
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
      tenantId: this.tenant
    };
    const operation = await this.processStepEntityService.create(cmd);
    const result = await this.processStepEntityService.get(this.tenant, operation.targetId);

    return result;
  }
}
