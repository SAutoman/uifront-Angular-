/**
 * global
 */
import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';

/**
 * project
 */
import {
  allRights,
  APP_CLIENT_ID,
  AreaTypeEnum,
  ConditionedProcessStepLinkOverrideDto,
  CreateDynamicEntityDto,
  CreateProcessStepEntityCmd,
  CreateProcessStepLinkDtoNew,
  CreateWorkflowStateCommand,
  DeleteStepCommand,
  DynamicEntitiesService,
  FieldTypeIds,
  GetWorkflowStateQuery,
  IFieldBaseDto,
  OperationStatus,
  ProcessStepEntityDto,
  ProcessStepEntityService,
  ProcessStepLinkService,
  Roles,
  SchemaFieldDto,
  SchemasService,
  UpdateStatusCommand,
  UpdateStepCommand,
  UserGroupsService,
  VisualElement,
  WorkflowResolutionDto,
  WorkflowRightsEnum,
  WorkflowStateService
} from '@wfm/service-layer';

import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store/application/application.reducer';

/**
 * local
 */
import { ExpressionDef, RuleCustomOperatorEnum, RuleSetCustomCondition } from '@wfm/service-layer/models/expressionModel';
import {
  BaseFieldValueType,
  BoolFieldValueDto,
  DecimalFieldValueDto,
  IntFieldValueDto,
  ListOfLinkFieldValueDto,
  StringFieldValueDto
} from '@wfm/service-layer/models/FieldValueDto';
import { TenantFieldsHelper } from '../helpers/tenantFieldsHelper';
import { SchemaHelper } from '../helpers/schemaHelper';
import { WorkflowHelper } from '../helpers/workflowHelper';
import { StatusHelper } from '../helpers/statusHelper';
import { TransitionHelper } from '../helpers/transitionHelper';
import { AutomaticAddStepsEventDto, EventTypes } from '@wfm/service-layer/models/actionDto';
import { TestUiPageComponent } from '@wfm/tests/modules/test-ui/test-ui-page/test-ui-page.component';
import { Test, TestResult } from '@wfm/tests/models';

@Component({
  selector: 'demo-tests',
  template: '<app-test-ui-page #test></app-test-ui-page>',
  styles: [':host { display: block; height: 100%; overflow-y: auto; }']
})
export class ExpressionsTestsComponent extends TenantComponent implements AfterViewInit {
  @ViewChild('test') testsComp: TestUiPageComponent;

  title = 'Expressions tests';

  constructor(
    private schemaHelper: SchemaHelper,
    private schemasService: SchemasService,
    private workflowHelper: WorkflowHelper,
    private statusHelper: StatusHelper,
    private workflowStateService: WorkflowStateService,
    private processStepEntityService: ProcessStepEntityService,
    private tenantsFieldHelper: TenantFieldsHelper,
    private userGroupService: UserGroupsService,
    private processStepLinkService: ProcessStepLinkService,
    private transitionHelper: TransitionHelper,
    private dynamicEntitiesService: DynamicEntitiesService,
    store: Store<ApplicationState>,
    @Inject(APP_CLIENT_ID) readonly appId: string
  ) {
    super(store);
  }

  ngAfterViewInit(): void {
    this.testsComp.init(this.title, [
      <Test>{
        name: 'Step links with rights',
        function: async () => await this.stepLinksWithRights()
      },
      <Test>{
        name: 'Step links with rights 2',
        function: async () => await this.stepLinksWithRights2()
      },
      <Test>{
        name: 'Expression with User Groups',
        function: async () => await this.expressionWithUserGroups()
      },
      <Test>{
        name: 'Expression with User Roles',
        function: async () => await this.expressionWithUserRoles()
      },
      <Test>{
        name: 'Create Condition For Backend',
        function: async () => await this.createBackendCondition()
      },
      <Test>{
        name: 'Create Condition For Frontend',
        function: async () => await this.createFrontendCondition()
      },
      <Test>{
        name: 'Expression with Can add restriction - 1',
        function: async () => await this.canAddExpressionForSteps()
      },
      <Test>{
        name: 'Expression with Can add restriction - 2',
        function: async () => await this.canAddExpressionForSteps2()
      },
      <Test>{
        name: 'Step links with role and disallowed rights 2',
        function: async () => await this.stepLinkOverrideWithRoleAndDisallowedRights2()
      },
      <Test>{
        name: 'Step links with role and disallowed rights',
        function: async () => await this.stepLinkOverrideWithRoleAndDisallowedRights()
      },
      <Test>{
        name: 'Expression with Can delete',
        function: async () => await this.canDeleteExpressionForSteps()
      },
      <Test>{
        name: 'Step links for different expressions',
        function: async () => await this.testForSat()
      },
      <Test>{
        name: 'Step field value is to be saved',
        function: async () => await this.stepFieldValueToBeSaved()
      },
      <Test>{
        name: 'Step links for canEdit expressions',
        function: async () => await this.canEditExpression()
      },
      <Test>{
        name: 'Step links for canAdd expressions',
        function: async () => await this.canAddExpression()
      },
      <Test>{
        name: 'Step links for canUnresolve expressions',
        function: async () => await this.canUnresolveExpression()
      },
      <Test>{
        name: 'Step links no overrides',
        function: async () => await this.stepLinkNoOverrides()
      },
      <Test>{
        name: 'Step links with overrides and role',
        function: async () => await this.stepLinkOverrideWithRole()
      }
    ]);
  }

  private async testForSat(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const resolutions: WorkflowResolutionDto[] = [
        {
          name: 'Success'
        },
        {
          name: 'Fail'
        }
      ];

      // Schemas
      const step1Schema = await this.schemaHelper.createSchema(this.tenant, 'step1Schema', AreaTypeEnum.stepForm, [], []);
      const step2Schema = await this.schemaHelper.createSchema(this.tenant, 'step2Schema', AreaTypeEnum.stepForm, [], []);
      const caseSchema = await this.schemaHelper.createCaseSchema(this.tenant, 'caseSchema123', AreaTypeEnum.case, [], []);

      // Workflow
      const open = await this.statusHelper.createStatus(this.tenant, 'Open', 0);
      const workflow = await this.workflowHelper.createWorkflow('workflow-test1', this.tenant, caseSchema.id, [open.id]);

      // Steps
      const step1 = await this.createProcessStepEntity('Step1', 'step1', step1Schema.id, resolutions);
      const step2 = await this.createProcessStepEntity('Step2', 'step2', step2Schema.id, resolutions);

      // Step1 link
      await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        workflowId: workflow.id,
        refName: 'step1',
        processStepEntityId: step1.id,
        expression: {},
        tenantId: this.tenant,
        numberOfInstances: 1,
        onProcessStepResolvedEvents: []
      });

      // Step 2 New way
      // 1. Default link - everything is allowed, and with overrides of the link we set what we whant explicitly.
      // 2. Can add Link - settings for can add
      // 3. Can edit Link - settings for can add
      // 4. Can delete Link - settings for can add

      // Default
      await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        workflowId: workflow.id,
        refName: 'step2',
        processStepEntityId: step2.id,
        expression: {},
        tenantId: this.tenant,
        numberOfInstances: 1,
        parentId: step1.id,
        onProcessStepResolvedEvents: []
      });

      // Can add link settings
      await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        workflowId: workflow.id,
        refName: 'step2',
        processStepEntityId: step2.id,
        expression: {
          ruleSet: {
            condition: RuleSetCustomCondition.And,
            rules: [
              {
                operator: RuleCustomOperatorEnum.Equal,
                propertyPath: {
                  path: ['steps', 'step1', 'resolution']
                },
                value: 'Success'
              }
            ]
          },
          userRoles: [Roles.TenantAdmin, Roles.Tenant, Roles.Supplier]
        },
        rights: [WorkflowRightsEnum.CanAdd],
        tenantId: this.tenant,
        numberOfInstances: 1,
        onProcessStepResolvedEvents: []
      });

      // Can Edit link settings
      await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        workflowId: workflow.id,
        refName: 'step2',
        processStepEntityId: step2.id,
        expression: {
          userRoles: [Roles.Supplier]
        },
        rights: [WorkflowRightsEnum.CanEdit],
        tenantId: this.tenant,
        numberOfInstances: 1,
        onProcessStepResolvedEvents: []
      });

      // Can Delete link settings
      await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        workflowId: workflow.id,
        refName: 'step2',
        processStepEntityId: step2.id,
        expression: {
          ruleSet: {
            condition: RuleSetCustomCondition.And,
            rules: [
              {
                operator: RuleCustomOperatorEnum.Equal,
                propertyPath: {
                  path: ['steps', 'step1', 'resolution']
                },
                value: 'Failed'
              }
            ]
          },
          userRoles: [Roles.TenantAdmin, Roles.Tenant]
        },
        rights: [WorkflowRightsEnum.CanDelete],
        tenantId: this.tenant,
        numberOfInstances: 1,
        onProcessStepResolvedEvents: []
      });

      const rawDataSchema = await this.schemaHelper.createSchema(this.tenant, 'rawDataSchema', AreaTypeEnum.rawData, [], []);

      const rawDataEntityOperation = await this.dynamicEntitiesService.create(<CreateDynamicEntityDto>{
        areaType: AreaTypeEnum.rawData,
        fields: [],
        schemaId: rawDataSchema.id,
        tenantId: this.tenant
      });

      // State
      const stateOperation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
        tenantId: this.tenant,
        workflowId: workflow.id,
        case: {
          appId: this.appId,
          areaType: AreaTypeEnum.case,
          tenantId: this.tenant,
          fields: [
            <ListOfLinkFieldValueDto>{ id: 'rawDataIds', type: FieldTypeIds.ListOfLinksField, value: [rawDataEntityOperation.targetId] }
          ],
          schemaId: caseSchema.id
        },
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
        refName: 'step1',
        resolution: '',
        stepSchemaId: step1Schema.id,
        schemaId: workflow.id,
        tenantId: this.tenant,
        workflowStateId: stateOperation.targetId,
        visualElements: visualElements,
        visualElementId: visualElements[0].id
      };

      await this.workflowStateService.addStep(createStepCommand);

      const stepDePublicId = await this.workflowHelper.getStepDePublicId('step1', stateOperation.targetId, this.tenant, workflow.id);

      if (stepDePublicId) {
        await this.workflowStateService.updateStep(<UpdateStepCommand>{
          ...createStepCommand,
          stepDynamicEntities: [
            {
              dynamicEntity: {
                publicId: stepDePublicId,
                areaType: step1Schema.areaType,
                fields: [],
                appId: this.appId,
                schemaId: step1Schema.id,
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

        // Step 1 Rights will look like:
        // CanAdd - False because (numberOfInstances = 1, isParent=true)
        // CanEdit - True because (no restrictions)
        // CanDelete - False because (isParent=true)

        // Step 2 Rights will look like:
        // CanAdd - True because step1.resolution = "Success"
        if (stateResult.steps.find((step) => step.refName === 'step2' && step.canAdd)) {
          isSuccess = true;
        }
      }
    } catch (error) {
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure('create failed error: ' + error);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async canEditExpression(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const open = await this.statusHelper.createStatus(this.tenant, 'Open', 0);
      const inProgress = await this.statusHelper.createStatus(this.tenant, 'InProgress', 1);
      const resolutions: WorkflowResolutionDto[] = [
        {
          name: 'Success'
        },
        {
          name: 'Fail'
        }
      ];

      // Schemas
      const step1Schema = await this.schemaHelper.createSchema(this.tenant, 'step1Schema', AreaTypeEnum.stepForm, [], []);
      const step2Schema = await this.schemaHelper.createSchema(this.tenant, 'step2Schema', AreaTypeEnum.stepForm, [], []);
      const caseSchema = await this.schemaHelper.createCaseSchema(this.tenant, 'caseSchema123', AreaTypeEnum.case, [], []);

      // Workflow
      const workflow = await this.workflowHelper.createWorkflow('workflow-test1', this.tenant, caseSchema.id, [open.id, inProgress.id]);

      // Steps
      const step1 = await this.createProcessStepEntity('Step1', 'step1', step1Schema.id, resolutions);
      const step2 = await this.createProcessStepEntity('Step2', 'step2', step2Schema.id, resolutions);

      // Step1 link
      let linkOperation = await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        workflowId: workflow.id,
        refName: 'step1',
        processStepEntityId: step1.id,
        tenantId: this.tenant,
        defaultOverride: {
          expression: {},
          numberOfInstances: 1,
          rights: allRights
        }
      });

      // Default
      await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        workflowId: workflow.id,
        refName: 'step2',
        processStepEntityId: step2.id,
        overrides: [
          <ConditionedProcessStepLinkOverrideDto>{
            expression: {
              userRoles: [Roles.TenantAdmin]
            },
            rights: [WorkflowRightsEnum.CanEdit],
            numberOfInstances: 1
          },
          <ConditionedProcessStepLinkOverrideDto>{
            processStepEntityId: step2.id,
            disallowedRights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete],
            workflowStatusId: inProgress.id,
            numberOfInstances: 1
          }
        ],
        tenantId: this.tenant,
        parentId: linkOperation.targetId
      });

      const rawDataSchema = await this.schemaHelper.createSchema(this.tenant, 'rawDataSchema', AreaTypeEnum.rawData, [], []);

      const rawDataEntityOperation = await this.dynamicEntitiesService.create(<CreateDynamicEntityDto>{
        areaType: AreaTypeEnum.rawData,
        fields: [],
        schemaId: rawDataSchema.id,
        tenantId: this.tenant
      });

      // State
      const stateOperation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
        tenantId: this.tenant,
        case: {
          appId: this.appId,
          areaType: AreaTypeEnum.case,
          tenantId: this.tenant,
          fields: [
            <ListOfLinkFieldValueDto>{ id: 'rawDataIds', type: FieldTypeIds.ListOfLinksField, value: [rawDataEntityOperation.targetId] }
          ],
          schemaId: caseSchema.id
        },
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

      const firstStepCommand = <UpdateStepCommand>{
        stepDynamicEntities: [],
        refName: 'step1',
        resolution: '',
        stepSchemaId: step1Schema.id,
        schemaId: workflow.id,
        tenantId: this.tenant,
        workflowStateId: stateOperation.targetId,
        visualElements: visualElements,
        visualElementId: visualElements[0].id
      };

      await this.workflowStateService.addStep(firstStepCommand);

      const step1PublicId = await this.workflowHelper.getStepDePublicId('step1', stateOperation.targetId, this.tenant, workflow.id);
      if (step1PublicId) {
        await this.workflowStateService.updateStep(<UpdateStepCommand>{
          ...firstStepCommand,
          stepDynamicEntities: [
            {
              dynamicEntity: {
                publicId: step1PublicId,
                areaType: step1Schema.areaType,
                fields: [],
                appId: this.appId,
                schemaId: step1Schema.id,
                tenantId: this.tenant
              }
            }
          ],
          resolution: resolutions[0].name
        });

        const secondStepCommand = <UpdateStepCommand>{
          stepDynamicEntities: [],
          refName: 'step2',
          resolution: '',
          stepSchemaId: step2Schema.id,
          schemaId: workflow.id,
          tenantId: this.tenant,
          workflowStateId: stateOperation.targetId,
          visualElements: visualElements,
          visualElementId: visualElements[1].id
        };

        await this.workflowStateService.addStep(secondStepCommand);
        const step2PublicId = await this.workflowHelper.getStepDePublicId('step2', stateOperation.targetId, this.tenant, workflow.id);

        if (step2PublicId) {
          await this.workflowStateService.updateStep(<UpdateStepCommand>{
            ...secondStepCommand,
            stepDynamicEntities: [
              {
                dynamicEntity: {
                  publicId: step2PublicId,
                  areaType: step2Schema.areaType,
                  fields: [],
                  appId: this.appId,
                  schemaId: step2Schema.id,
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
          // Step 2 Rights should look like:
          // CanEdit - true, because tenantAdmins are allowed to edit
          if (stateResult.fields.find((field) => field.refName === 'step2' && field.entities[0].rights.canEdit)) {
            isSuccess = true;
          }
        }
      }
    } catch (error) {
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure('create failed error: ' + error);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async canAddExpression(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const open = await this.statusHelper.createStatus(this.tenant, 'Open', 0);
      const inProgress = await this.statusHelper.createStatus(this.tenant, 'InProgress', 1);
      const resolutions: WorkflowResolutionDto[] = [
        {
          name: 'Success'
        },
        {
          name: 'Fail'
        }
      ];

      // Schemas
      const step1Schema = await this.schemaHelper.createSchema(this.tenant, 'step1Schema', AreaTypeEnum.stepForm, [], []);
      const step2Schema = await this.schemaHelper.createSchema(this.tenant, 'step2Schema', AreaTypeEnum.stepForm, [], []);
      const caseSchema = await this.schemaHelper.createCaseSchema(this.tenant, 'caseSchema123', AreaTypeEnum.case, [], []);

      // Workflow
      const workflow = await this.workflowHelper.createWorkflow('workflow-test1', this.tenant, caseSchema.id, [open.id, inProgress.id]);

      // Steps
      const step1 = await this.createProcessStepEntity('Step1', 'step1', step1Schema.id, resolutions);
      const step2 = await this.createProcessStepEntity('Step2', 'step2', step2Schema.id, resolutions);

      const op = await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        workflowId: workflow.id,
        refName: 'step1',
        processStepEntityId: step1.id,
        tenantId: this.tenant,
        defaultOverride: {
          numberOfInstances: 1
        },
        overrides: [
          <ConditionedProcessStepLinkOverrideDto>{
            expression: {
              userRoles: [Roles.TenantAdmin, Roles.Tenant]
            },
            rights: [WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete],
            numberOfInstances: 1
          },
          //canAdd is not allowed for tenant and tenantAdmin in any status
          <ConditionedProcessStepLinkOverrideDto>{
            expression: {
              userRoles: [Roles.TenantAdmin, Roles.Tenant]
            },
            disallowedRights: [WorkflowRightsEnum.CanAdd],
            numberOfInstances: 1
          }
        ]
      });
      // step2 can be added by tenant and tenantAdmin if step1 has resolution "Success"
      await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        parentId: op.targetId,
        workflowId: workflow.id,
        refName: 'step2',
        processStepEntityId: step2.id,
        defaultOverride: {
          disallowedRights: [WorkflowRightsEnum.CanAdd]
        },
        overrides: [
          <ConditionedProcessStepLinkOverrideDto>{
            expression: {
              ruleSet: {
                condition: RuleSetCustomCondition.And,
                rules: [
                  {
                    operator: RuleCustomOperatorEnum.Equal,
                    propertyPath: {
                      path: ['steps', 'step1', 'resolution']
                    },
                    value: 'Success'
                  }
                ]
              },
              userRoles: [Roles.TenantAdmin, Roles.Tenant]
            },
            rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete],
            numberOfInstances: 1
          }
        ],
        tenantId: this.tenant
      });

      const rawDataSchema = await this.schemaHelper.createSchema(this.tenant, 'rawDataSchema', AreaTypeEnum.rawData, [], []);

      const rawDataEntityOperation = await this.dynamicEntitiesService.create(<CreateDynamicEntityDto>{
        areaType: AreaTypeEnum.rawData,
        fields: [],
        schemaId: rawDataSchema.id,
        tenantId: this.tenant
      });

      // State
      const stateOperation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
        tenantId: this.tenant,
        workflowId: workflow.id,
        case: {
          appId: this.appId,
          areaType: AreaTypeEnum.case,
          tenantId: this.tenant,
          fields: [
            <ListOfLinkFieldValueDto>{ id: 'rawDataIds', type: FieldTypeIds.ListOfLinksField, value: [rawDataEntityOperation.targetId] }
          ],
          schemaId: caseSchema.id
        },
        schemaId: workflow.id
      });

      // adding and updatinf step1 resolution 'Fail'
      let visualElements: VisualElement[] = [
        {
          id: 'idGeneratedFromFrontEnd1',
          index: 0
        }
      ];

      const stepCommand = <UpdateStepCommand>{
        stepDynamicEntities: [],
        refName: 'step1',
        resolution: '',
        stepSchemaId: step1Schema.id,
        schemaId: workflow.id,
        tenantId: this.tenant,
        workflowStateId: stateOperation.targetId,
        visualElements: visualElements,
        visualElementId: visualElements[0].id
      };
      await this.workflowStateService.addStep(stepCommand);

      const stepPublicId = await this.workflowHelper.getStepDePublicId('step1', stateOperation.targetId, this.tenant, workflow.id);

      if (stepPublicId) {
        await this.workflowStateService.updateStep({
          ...stepCommand,
          stepDynamicEntities: [
            {
              dynamicEntity: {
                publicId: stepPublicId,
                areaType: step1Schema.areaType,
                fields: [],
                appId: this.appId,
                schemaId: step1Schema.id,
                tenantId: this.tenant
              }
            }
          ]
        });

        const stateResult = await this.workflowStateService.get(<GetWorkflowStateQuery>{
          id: stateOperation.targetId,
          tenant: this.tenant,
          schemaId: workflow.id
        });
        // we should get
        // step2.canAdd = false, because step1 is not resolved successfully
        if (stateResult.steps.find((step) => step.refName === 'step2' && !step.canAdd)) {
          isSuccess = true;
        }
      }
    } catch (error) {
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure('create failed error: ' + error);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async canUnresolveExpression(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const open = await this.statusHelper.createStatus(this.tenant, 'Open', 0);
      const inProgress = await this.statusHelper.createStatus(this.tenant, 'InProgress', 1);
      const resolutions: WorkflowResolutionDto[] = [
        {
          name: 'Success'
        },
        {
          name: 'Fail'
        }
      ];

      // Schemas
      const step1Schema = await this.schemaHelper.createSchema(this.tenant, 'step1Schema', AreaTypeEnum.stepForm, [], []);

      const caseSchema = await this.schemaHelper.createCaseSchema(this.tenant, 'caseSchema123', AreaTypeEnum.case, [], []);

      // Workflow
      const workflow = await this.workflowHelper.createWorkflow('workflow-test1', this.tenant, caseSchema.id, [open.id, inProgress.id]);

      // Steps
      const step1 = await this.createProcessStepEntity('Step1', 'step1', step1Schema.id, resolutions);
      // Step1 Default link
      await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        workflowId: workflow.id,
        refName: 'step1',
        processStepEntityId: step1.id,
        expression: {},
        tenantId: this.tenant,
        numberOfInstances: 1,
        onProcessStepResolvedEvents: []
      });

      // Step1 default link
      // CanUnresolve userRoles
      await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        workflowId: workflow.id,
        refName: 'step1',
        processStepEntityId: step1.id,
        expression: {
          userRoles: [Roles.Supplier]
        },
        rights: [WorkflowRightsEnum.CanResolve, WorkflowRightsEnum.CanUnresolve],
        tenantId: this.tenant,
        numberOfInstances: 1,
        onProcessStepResolvedEvents: []
      });

      let visualElements: VisualElement[] = [
        {
          id: 'idGeneratedFromFrontEnd1',
          index: 0
        }
      ];

      const rawDataSchema = await this.schemaHelper.createSchema(this.tenant, 'rawDataSchema', AreaTypeEnum.rawData, [], []);

      const rawDataEntityOperation = await this.dynamicEntitiesService.create(<CreateDynamicEntityDto>{
        areaType: AreaTypeEnum.rawData,
        fields: [],
        schemaId: rawDataSchema.id,
        tenantId: this.tenant
      });

      // State
      const stateOperation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
        tenantId: this.tenant,
        case: {
          appId: this.appId,
          areaType: AreaTypeEnum.case,
          tenantId: this.tenant,
          fields: [
            <ListOfLinkFieldValueDto>{ id: 'rawDataIds', type: FieldTypeIds.ListOfLinksField, value: [rawDataEntityOperation.targetId] }
          ],
          schemaId: caseSchema.id
        },
        schemaId: workflow.id
      });

      const stepCommand = <UpdateStepCommand>{
        stepDynamicEntities: [],
        refName: 'step1',
        resolution: '',
        stepSchemaId: step1Schema.id,
        schemaId: workflow.id,
        tenantId: this.tenant,
        workflowStateId: stateOperation.targetId,
        visualElements: visualElements,
        visualElementId: visualElements[0].id
      };
      await this.workflowStateService.addStep(stepCommand);

      const step1PublicId = await this.workflowHelper.getStepDePublicId('step1', stateOperation.targetId, this.tenant, workflow.id);

      if (step1PublicId) {
        await this.workflowStateService.updateStep(<UpdateStepCommand>{
          ...stepCommand,
          stepDynamicEntities: [
            {
              dynamicEntity: {
                publicId: step1PublicId,
                areaType: step1Schema.areaType,
                fields: [],
                appId: this.appId,
                schemaId: step1Schema.id,
                tenantId: this.tenant
              }
            }
          ]
        });

        const stateResult = await this.workflowStateService.get(<GetWorkflowStateQuery>{
          id: stateOperation.targetId,
          tenant: this.tenant,
          schemaId: workflow.id
        });

        if (stateResult.fields.find((step) => step.refName === 'step1' && !step.entities[0].rights.canUnresolve)) {
          isSuccess = true;
        }
      }
    } catch (error) {
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure('create failed error: ' + error);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async stepLinkNoOverrides(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const open = await this.statusHelper.createStatus(this.tenant, 'Open', 0);
      const inProgress = await this.statusHelper.createStatus(this.tenant, 'InProgress', 1);
      const resolutions: WorkflowResolutionDto[] = [
        {
          name: 'Success'
        },
        {
          name: 'Fail'
        }
      ];

      const step1Schema = await this.schemaHelper.createSchema(this.tenant, 'step1Schema', AreaTypeEnum.stepForm, [], []);
      const caseSchema = await this.schemaHelper.createCaseSchema(this.tenant, 'caseSchema123', AreaTypeEnum.case, [], []);

      const workflow = await this.workflowHelper.createWorkflow('workflow-test1', this.tenant, caseSchema.id, [open.id, inProgress.id]);

      const step1 = await this.createProcessStepEntity('Step1', 'step1', step1Schema.id, resolutions);

      await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        workflowId: workflow.id,
        refName: 'step1',
        processStepEntityId: step1.id,
        tenantId: this.tenant
      });

      const rawDataSchema = await this.schemaHelper.createSchema(this.tenant, 'rawDataSchema', AreaTypeEnum.rawData, [], []);

      const rawDataEntityOperation = await this.dynamicEntitiesService.create(<CreateDynamicEntityDto>{
        areaType: AreaTypeEnum.rawData,
        fields: [],
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
            <ListOfLinkFieldValueDto>{ id: 'rawDataIds', type: FieldTypeIds.ListOfLinksField, value: [rawDataEntityOperation.targetId] }
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

      const stepCommand = <UpdateStepCommand>{
        stepDynamicEntities: [],
        refName: 'step1',
        resolution: '',
        stepSchemaId: step1Schema.id,
        schemaId: workflow.id,
        tenantId: this.tenant,
        workflowStateId: stateOperation.targetId,
        visualElements: visualElements,
        visualElementId: visualElements[0].id
      };

      await this.workflowStateService.addStep(stepCommand);

      const step1PublicId = await this.workflowHelper.getStepDePublicId('step1', stateOperation.targetId, this.tenant, workflow.id);

      if (step1PublicId) {
        await this.workflowStateService.updateStep(<UpdateStepCommand>{
          ...stepCommand,
          stepDynamicEntities: [
            {
              dynamicEntity: {
                publicId: step1PublicId,
                areaType: step1Schema.areaType,
                fields: [],
                appId: this.appId,
                schemaId: step1Schema.id,
                tenantId: this.tenant
              }
            }
          ]
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

        if (
          stateResult.fields.find(
            (field) =>
              field.refName === 'step1' &&
              !field.entities[0].rights.canEdit &&
              !field.entities[0].rights.canUnresolve &&
              !field.entities[0].rights.canDelete
            // default is false if not set otherwise
          )
        ) {
          isSuccess = true;
        }
      }
    } catch (error) {
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure('create failed error: ' + error);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async stepLinkOverrideWithRoleAndDisallowedRights2(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const open = await this.statusHelper.createStatus(this.tenant, 'Open', 0);
      const inProgress = await this.statusHelper.createStatus(this.tenant, 'InProgress', 1);
      const resolutions: WorkflowResolutionDto[] = [
        {
          name: 'Success'
        },
        {
          name: 'Fail'
        }
      ];

      const step1Schema = await this.schemaHelper.createSchema(this.tenant, 'step1Schema', AreaTypeEnum.stepForm, [], []);
      const step2Schema = await this.schemaHelper.createSchema(this.tenant, 'step2Schema', AreaTypeEnum.stepForm, [], []);
      const caseSchema = await this.schemaHelper.createCaseSchema(this.tenant, 'caseSchema123', AreaTypeEnum.case, [], []);

      const workflow = await this.workflowHelper.createWorkflow('workflow-test1', this.tenant, caseSchema.id, [open.id, inProgress.id]);

      const step1 = await this.createProcessStepEntity('Step1', 'step1', step1Schema.id, resolutions);
      const step2 = await this.createProcessStepEntity('Step2', 'step2', step2Schema.id, resolutions);

      await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        workflowId: workflow.id,
        refName: 'step1',
        defaultOverride: {
          rights: [WorkflowRightsEnum.CanDelete],
          disallowedRights: [WorkflowRightsEnum.CanEdit]
        },
        overrides: [
          {
            expression: {
              notInUserRoles: [Roles.TenantAdmin],
              userRoles: [Roles.Supplier]
            },
            rights: [WorkflowRightsEnum.CanResolve],
            disallowedRights: [WorkflowRightsEnum.CanUnresolve],
            onProcessStepResolvedEvents: [
              <AutomaticAddStepsEventDto>{
                id: undefined,
                name: 'addStepsOnResolved',
                eventType: EventTypes.AutomaticAddSteps,
                steps: [step2.id] // refName of the step that will be autoAdded
              }
            ]
          },
          {
            expression: {
              notInUserRoles: [Roles.Supplier],
              userRoles: [Roles.TenantAdmin]
            },
            rights: [WorkflowRightsEnum.CanUnresolve],
            disallowedRights: [WorkflowRightsEnum.CanEdit]
          }
        ],
        processStepEntityId: step1.id,
        tenantId: this.tenant
      });

      const rawDataSchema = await this.schemaHelper.createSchema(this.tenant, 'rawDataSchema', AreaTypeEnum.rawData, [], []);

      const rawDataEntityOperation = await this.dynamicEntitiesService.create(<CreateDynamicEntityDto>{
        areaType: AreaTypeEnum.rawData,
        fields: [],
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
            <ListOfLinkFieldValueDto>{ id: 'rawDataIds', type: FieldTypeIds.ListOfLinksField, value: [rawDataEntityOperation.targetId] }
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

      const stepCommand = <UpdateStepCommand>{
        stepDynamicEntities: [],
        refName: 'step1',
        resolution: '',
        stepSchemaId: step1Schema.id,
        schemaId: workflow.id,
        tenantId: this.tenant,
        workflowStateId: stateOperation.targetId,
        visualElements: visualElements,
        visualElementId: visualElements[0].id
      };

      await this.workflowStateService.addStep(stepCommand);

      const step1PublicId = await this.workflowHelper.getStepDePublicId('step1', stateOperation.targetId, this.tenant, workflow.id);

      if (step1PublicId) {
        await this.workflowStateService.updateStep(<UpdateStepCommand>{
          ...stepCommand,
          stepDynamicEntities: [
            {
              dynamicEntity: {
                publicId: step1PublicId,
                areaType: step1Schema.areaType,
                fields: [],
                appId: this.appId,
                schemaId: step1Schema.id,
                tenantId: this.tenant
              }
            }
          ]
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

        if (
          stateResult.fields.find(
            (field) => field.refName === 'step1' && !field.entities[0].rights.canEdit && field.entities[0].rights.canUnresolve
          )
        ) {
          isSuccess = true;
        }
      }
    } catch (error) {
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure('create failed error: ' + error);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async stepLinkOverrideWithRoleAndDisallowedRights(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const open = await this.statusHelper.createStatus(this.tenant, 'Open', 0);
      const inProgress = await this.statusHelper.createStatus(this.tenant, 'InProgress', 1);
      const resolutions: WorkflowResolutionDto[] = [
        {
          name: 'Success'
        },
        {
          name: 'Fail'
        }
      ];

      const step1Schema = await this.schemaHelper.createSchema(this.tenant, 'step1Schema', AreaTypeEnum.stepForm, [], []);
      const caseSchema = await this.schemaHelper.createCaseSchema(this.tenant, 'caseSchema123', AreaTypeEnum.case, [], []);

      const workflow = await this.workflowHelper.createWorkflow('workflow-test1', this.tenant, caseSchema.id, [open.id, inProgress.id]);

      const step1 = await this.createProcessStepEntity('Step1', 'step1', step1Schema.id, resolutions);

      await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        workflowId: workflow.id,
        refName: 'step1',
        defaultOverride: {
          rights: [WorkflowRightsEnum.CanDelete],
          disallowedRights: [WorkflowRightsEnum.CanEdit]
        },
        overrides: [
          {
            expression: {
              notInUserRoles: [Roles.TenantAdmin],
              userRoles: [Roles.Supplier]
            },
            rights: [WorkflowRightsEnum.CanResolve],
            disallowedRights: [WorkflowRightsEnum.CanUnresolve]
          }
        ],
        processStepEntityId: step1.id,
        tenantId: this.tenant
      });

      const rawDataSchema = await this.schemaHelper.createSchema(this.tenant, 'rawDataSchema', AreaTypeEnum.rawData, [], []);

      const rawDataEntityOperation = await this.dynamicEntitiesService.create(<CreateDynamicEntityDto>{
        areaType: AreaTypeEnum.rawData,
        fields: [],
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
            <ListOfLinkFieldValueDto>{ id: 'rawDataIds', type: FieldTypeIds.ListOfLinksField, value: [rawDataEntityOperation.targetId] }
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
        refName: 'step1',
        resolution: '',
        stepSchemaId: step1Schema.id,
        schemaId: workflow.id,
        tenantId: this.tenant,
        workflowStateId: stateOperation.targetId,
        visualElements: visualElements,
        visualElementId: visualElements[0].id
      };

      await this.workflowStateService.addStep(createStepCommand);

      const step1PublicId = await this.workflowHelper.getStepDePublicId('step1', stateOperation.targetId, this.tenant, workflow.id);

      if (step1PublicId) {
        await this.workflowStateService.updateStep(<UpdateStepCommand>{
          ...createStepCommand,
          stepDynamicEntities: [
            {
              dynamicEntity: {
                publicId: step1PublicId,
                areaType: step1Schema.areaType,
                fields: [],
                appId: this.appId,
                schemaId: step1Schema.id,
                tenantId: this.tenant
              }
            }
          ]
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

        if (stateResult.fields.find((field) => field.refName === 'step1' && !field.entities[0].rights.canEdit)) {
          isSuccess = true;
        }
      }
    } catch (error) {
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure('create failed error: ' + error);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async stepLinkOverrideWithRole(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const open = await this.statusHelper.createStatus(this.tenant, 'Open', 0);
      const inProgress = await this.statusHelper.createStatus(this.tenant, 'InProgress', 1);
      const resolutions: WorkflowResolutionDto[] = [
        {
          name: 'Success'
        },
        {
          name: 'Fail'
        }
      ];

      const step1Schema = await this.schemaHelper.createSchema(this.tenant, 'step1Schema', AreaTypeEnum.stepForm, [], []);
      const caseSchema = await this.schemaHelper.createCaseSchema(this.tenant, 'caseSchema123', AreaTypeEnum.case, [], []);

      const workflow = await this.workflowHelper.createWorkflow('workflow-test1', this.tenant, caseSchema.id, [open.id, inProgress.id]);

      const step1 = await this.createProcessStepEntity('Step1', 'step1', step1Schema.id, resolutions);

      await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        workflowId: workflow.id,
        refName: 'step1',
        defaultOverride: {
          rights: [WorkflowRightsEnum.CanDelete],
          disallowedRights: [WorkflowRightsEnum.CanEdit]
        },
        processStepEntityId: step1.id,
        tenantId: this.tenant
      });

      const rawDataSchema = await this.schemaHelper.createSchema(this.tenant, 'rawDataSchema', AreaTypeEnum.rawData, [], []);

      const rawDataEntityOperation = await this.dynamicEntitiesService.create(<CreateDynamicEntityDto>{
        areaType: AreaTypeEnum.rawData,
        fields: [],
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
            <ListOfLinkFieldValueDto>{ id: 'rawDataIds', type: FieldTypeIds.ListOfLinksField, value: [rawDataEntityOperation.targetId] }
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
        refName: 'step1',
        resolution: '',
        stepSchemaId: step1Schema.id,
        schemaId: workflow.id,
        tenantId: this.tenant,
        workflowStateId: stateOperation.targetId,
        visualElements: visualElements,
        visualElementId: visualElements[0].id
      };

      await this.workflowStateService.addStep(createStepCommand);

      const step1PublicId = await this.workflowHelper.getStepDePublicId('step1', stateOperation.targetId, this.tenant, workflow.id);

      if (step1PublicId) {
        await this.workflowStateService.updateStep(<UpdateStepCommand>{
          ...createStepCommand,
          stepDynamicEntities: [
            {
              dynamicEntity: {
                publicId: step1PublicId,
                areaType: step1Schema.areaType,
                fields: [],
                appId: this.appId,
                schemaId: step1Schema.id,
                tenantId: this.tenant
              }
            }
          ]
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

        if (
          stateResult.fields.find(
            (field) => field.refName === 'step1' && !field.entities[0].rights.canEdit && field.entities[0].rights.canDelete
          )
        ) {
          isSuccess = true;
        }
      }
    } catch (error) {
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error);
    }
    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  // WFM-1693
  private async stepLinksWithRights(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const open = await this.statusHelper.createStatus(this.tenant, 'Open', 0);
      const inProgress = await this.statusHelper.createStatus(this.tenant, 'InProgress', 1);
      const resolutions: WorkflowResolutionDto[] = [
        {
          name: 'Success'
        },
        {
          name: 'Fail'
        }
      ];

      const step1Schema = await this.schemaHelper.createSchema(this.tenant, 'step1Schema', AreaTypeEnum.stepForm, [], []);
      const caseSchema = await this.schemaHelper.createCaseSchema(this.tenant, 'caseSchema123', AreaTypeEnum.case, [], []);

      const workflow = await this.workflowHelper.createWorkflow('workflow-test1', this.tenant, caseSchema.id, [open.id, inProgress.id]);

      const step1 = await this.createProcessStepEntity('Step1', 'step1', step1Schema.id, resolutions);

      const activeOverrideName = 'supplierInactive';

      // defaultOverride is empty since it hasn't been specified
      // if the role is supplier the active override will be 'supplierActive'
      // if not 'supplierInactive'
      // in the backend we also check the workflowStatusId
      await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        workflowId: workflow.id,
        refName: 'step1',
        processStepEntityId: step1.id,
        overrides: [
          <ConditionedProcessStepLinkOverrideDto>{
            workflowStatusId: inProgress.id,
            expression: <ExpressionDef>{
              notInUserRoles: [Roles.Supplier]
            },
            numberOfInstances: 1,
            name: activeOverrideName
          },
          <ConditionedProcessStepLinkOverrideDto>{
            workflowStatusId: inProgress.id,
            expression: <ExpressionDef>{
              userRoles: [Roles.Supplier]
            },
            numberOfInstances: 1,
            name: 'supplierActive'
          }
        ],
        tenantId: this.tenant
      });

      const rawDataSchema = await this.schemaHelper.createSchema(this.tenant, 'rawDataSchema', AreaTypeEnum.rawData, [], []);

      const rawDataEntityOperation = await this.dynamicEntitiesService.create(<CreateDynamicEntityDto>{
        areaType: AreaTypeEnum.rawData,
        fields: [],
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
            <ListOfLinkFieldValueDto>{ id: 'rawDataIds', type: FieldTypeIds.ListOfLinksField, value: [rawDataEntityOperation.targetId] }
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
        refName: 'step1',
        resolution: '',
        stepSchemaId: step1Schema.id,
        schemaId: workflow.id,
        tenantId: this.tenant,
        workflowStateId: stateOperation.targetId,
        visualElements: visualElements,
        visualElementId: visualElements[0].id
      };

      await this.workflowStateService.addStep(createStepCommand);

      const step1PublicId = await this.workflowHelper.getStepDePublicId('step1', stateOperation.targetId, this.tenant, workflow.id);

      if (step1PublicId) {
        await this.workflowStateService.updateStep(<UpdateStepCommand>{
          ...createStepCommand,
          stepDynamicEntities: [
            {
              dynamicEntity: {
                publicId: step1PublicId,
                areaType: step1Schema.areaType,
                fields: [],
                appId: this.appId,
                schemaId: step1Schema.id,
                tenantId: this.tenant
              }
            }
          ]
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

        // check to see if the active link is correct - since we want the one with role not supplier -> correct
        if (stateResult.fields.find((field) => field.refName === 'step1' && field.entities[0].activeRule[0] === activeOverrideName)) {
          isSuccess = true;
        }
      }
    } catch (error) {
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure('create failed error' + error);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async stepLinksWithRights2(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const open = await this.statusHelper.createStatus(this.tenant, 'Open', 0);
      const inProgress = await this.statusHelper.createStatus(this.tenant, 'InProgress', 1);
      const done = await this.statusHelper.createStatus(this.tenant, 'Done', 2);

      const resolutions: WorkflowResolutionDto[] = [
        {
          name: 'Success'
        },
        {
          name: 'Fail'
        }
      ];

      // Schemas
      const step1Schema = await this.schemaHelper.createSchema(this.tenant, 'step1Schema', AreaTypeEnum.stepForm, [], []);
      const caseSchema = await this.schemaHelper.createCaseSchema(this.tenant, 'caseSchema123', AreaTypeEnum.case, [], []);

      // Workflow
      const workflow = await this.workflowHelper.createWorkflow('workflow-test1', this.tenant, caseSchema.id, [
        open.id,
        inProgress.id,
        done.id
      ]);

      const step1 = await this.createProcessStepEntity('Step1', 'step1', step1Schema.id, resolutions);

      const overrideName = 'notSupplierOverride';

      await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        workflowId: workflow.id,
        refName: 'step1',
        processStepEntityId: step1.id,
        overrides: [
          {
            workflowStatusId: inProgress.id,
            name: 'supplierOverride',
            expression: {
              userRoles: [Roles.Supplier]
            },
            numberOfInstances: 1
          },
          {
            name: overrideName,
            expression: {
              notInUserRoles: [Roles.Supplier]
            },
            disallowedRights: [
              WorkflowRightsEnum.CanAdd,
              WorkflowRightsEnum.CanEdit,
              WorkflowRightsEnum.CanDelete,
              WorkflowRightsEnum.CanResolve,
              WorkflowRightsEnum.CanUnresolve
            ],
            numberOfInstances: 1
          }
        ],
        tenantId: this.tenant
      });

      const rawDataSchema = await this.schemaHelper.createSchema(this.tenant, 'rawDataSchema', AreaTypeEnum.rawData, [], []);

      const rawDataEntityOperation = await this.dynamicEntitiesService.create(<CreateDynamicEntityDto>{
        areaType: AreaTypeEnum.rawData,
        fields: [],
        schemaId: rawDataSchema.id,
        tenantId: this.tenant
      });

      // State
      const stateOperation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
        tenantId: this.tenant,
        case: {
          appId: this.appId,
          areaType: AreaTypeEnum.case,
          tenantId: this.tenant,
          fields: [
            <ListOfLinkFieldValueDto>{ id: 'rawDataIds', type: FieldTypeIds.ListOfLinksField, value: [rawDataEntityOperation.targetId] }
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
        refName: 'step1',
        resolution: '',
        stepSchemaId: step1Schema.id,
        schemaId: workflow.id,
        tenantId: this.tenant,
        workflowStateId: stateOperation.targetId,
        visualElements: visualElements,
        visualElementId: visualElements[0].id
      };

      await this.workflowStateService.addStep(createStepCommand);

      const step1PublicId = await this.workflowHelper.getStepDePublicId('step1', stateOperation.targetId, this.tenant, workflow.id);

      if (step1PublicId) {
        await this.workflowStateService.updateStep(<UpdateStepCommand>{
          ...createStepCommand,
          stepDynamicEntities: [
            {
              dynamicEntity: {
                publicId: step1PublicId,
                areaType: step1Schema.areaType,
                fields: [],
                appId: this.appId,
                schemaId: step1Schema.id,
                tenantId: this.tenant
              }
            }
          ]
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

        // STEP1 rights should be
        // CanAdd/CanEdit/etc - false because case is in "InProgress" status, and for that status only supplier (and not tenantAdmin) is authorized to all those rights (default link)
        if (
          stateResult.fields.find((field) => {
            return field.refName === 'step1' && field.entities[0].activeRule[0] === overrideName;
          })
        ) {
          isSuccess = true;
        }
      }
    } catch (error) {
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure('create failed error' + error);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async stepFieldValueToBeSaved(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const intTenantField = await this.tenantsFieldHelper.createTenantField(
        this.tenant,
        FieldTypeIds.IntField,
        [AreaTypeEnum.stepForm],
        'age',
        'Age',
        []
      );

      const resolutions: WorkflowResolutionDto[] = [
        {
          name: 'Success'
        },
        {
          name: 'Fail'
        }
      ];

      // Schemas
      const step1Schema = await this.schemaHelper.createSchema(this.tenant, 'step1Schema', AreaTypeEnum.stepForm, [intTenantField], []);
      const step2Schema = await this.schemaHelper.createSchema(this.tenant, 'step2Schema', AreaTypeEnum.stepForm, [intTenantField], []);
      const caseSchema = await this.schemaHelper.createCaseSchema(this.tenant, 'caseSchema123', AreaTypeEnum.case, [], []);

      // Workflow
      const open = await this.statusHelper.createStatus(this.tenant, 'Open', 0);
      const workflow = await this.workflowHelper.createWorkflow('workflow-test1', this.tenant, caseSchema.id, [open.id]);

      // Steps
      const step1 = await this.createProcessStepEntity('Step1', 'step1', step1Schema.id, resolutions);
      const step2 = await this.createProcessStepEntity('Step2', 'step2', step2Schema.id, resolutions);

      // Step1 link
      await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        workflowId: workflow.id,
        refName: 'step1',
        processStepEntityId: step1.id,
        expression: {},
        tenantId: this.tenant,
        numberOfInstances: 1,
        onProcessStepResolvedEvents: []
      });

      await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        workflowId: workflow.id,
        refName: 'step2',
        processStepEntityId: step2.id,
        expression: {},
        tenantId: this.tenant,
        numberOfInstances: 1,
        parentId: step1.id,
        onProcessStepResolvedEvents: []
      });

      // Can add link settings
      await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        workflowId: workflow.id,
        refName: 'step2',
        processStepEntityId: step2.id,
        expression: {
          ruleSet: {
            condition: RuleSetCustomCondition.And,
            rules: [
              {
                operator: RuleCustomOperatorEnum.Equal,
                propertyPath: {
                  path: ['steps', 'step1', 'resolution']
                },
                value: 'Success'
              }
            ]
          },
          userRoles: [Roles.TenantAdmin, Roles.Tenant, Roles.Supplier]
        },
        rights: [WorkflowRightsEnum.CanAdd],
        tenantId: this.tenant,
        numberOfInstances: 1,
        onProcessStepResolvedEvents: []
      });

      // Can Edit link settings
      await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        workflowId: workflow.id,
        refName: 'step2',
        processStepEntityId: step2.id,
        expression: {
          userRoles: [Roles.Supplier]
        },
        rights: [WorkflowRightsEnum.CanEdit],
        tenantId: this.tenant,
        numberOfInstances: 1,
        onProcessStepResolvedEvents: []
      });

      // Can Delete link settings
      await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        workflowId: workflow.id,
        refName: 'step2',
        processStepEntityId: step2.id,
        expression: {
          ruleSet: {
            condition: RuleSetCustomCondition.And,
            rules: [
              {
                operator: RuleCustomOperatorEnum.Equal,
                propertyPath: {
                  path: ['steps', 'step1', 'resolution']
                },
                value: 'Failed'
              }
            ]
          },
          userRoles: [Roles.TenantAdmin, Roles.Tenant]
        },
        rights: [WorkflowRightsEnum.CanDelete],
        tenantId: this.tenant,
        numberOfInstances: 1,
        onProcessStepResolvedEvents: []
      });

      const rawDataSchema = await this.schemaHelper.createSchema(this.tenant, 'rawDataSchema', AreaTypeEnum.rawData, [], []);

      const rawDataEntityOperation = await this.dynamicEntitiesService.create(<CreateDynamicEntityDto>{
        areaType: AreaTypeEnum.rawData,
        fields: [],
        schemaId: rawDataSchema.id,
        tenantId: this.tenant
      });

      // State
      const stateOperation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
        tenantId: this.tenant,
        case: {
          appId: this.appId,
          areaType: AreaTypeEnum.case,
          tenantId: this.tenant,
          fields: [
            <ListOfLinkFieldValueDto>{ id: 'rawDataIds', type: FieldTypeIds.ListOfLinksField, value: [rawDataEntityOperation.targetId] }
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

      //user drags the step into the case

      await this.workflowStateService.addStep(<UpdateStepCommand>{
        stepDynamicEntities: [],
        refName: 'step1',
        resolution: '',
        stepSchemaId: step1Schema.id,
        schemaId: workflow.id,
        tenantId: this.tenant,
        workflowStateId: stateOperation.targetId,
        visualElements: visualElements,
        visualElementId: visualElements[0].id
      });

      const step1PublicId = await this.workflowHelper.getStepDePublicId('step1', stateOperation.targetId, this.tenant, workflow.id);

      if (step1PublicId) {
        //  the user tries to update the same step with some value (55)
        await this.workflowStateService.updateStep(<UpdateStepCommand>{
          stepDynamicEntities: [
            {
              dynamicEntity: {
                publicId: step1PublicId,
                areaType: step1Schema.areaType,
                fields: [
                  {
                    id: intTenantField.fieldName,
                    type: intTenantField.type,
                    value: 55
                  }
                ],
                appId: this.appId,
                schemaId: step1Schema.id,
                tenantId: this.tenant
              }
            }
          ]
        });

        const stateResult = await this.workflowStateService.get(<GetWorkflowStateQuery>{
          id: stateOperation.targetId,
          tenant: this.tenant,
          schemaId: workflow.id
        });

        let deId = stateResult.fields[0]?.entities[0]?.stepDynamicEntities[0]?.dynamicEntityId;
        let dynamicEntity = await this.dynamicEntitiesService.getById(
          this.tenant,
          deId,
          stateResult.fields[0].schemaId,
          AreaTypeEnum.stepForm
        );

        if (dynamicEntity.fields[0]?.value) {
          isSuccess = true;
        }
      }
    } catch (error) {
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async canDeleteExpressionForSteps(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const caseSchema = await this.schemaHelper.createCaseSchema(this.tenant, 'case-schema1234456', AreaTypeEnum.case, [], []);

      const open = await this.statusHelper.createStatus(this.tenant, 'Open', 0);
      const workflow = await this.workflowHelper.createWorkflow('workflow', this.tenant, caseSchema.id, [open.id]);

      const resolutions: WorkflowResolutionDto[] = [
        {
          name: 'Success'
        },
        {
          name: 'Fail'
        }
      ];

      // Step Schemas
      const step1Schema = await this.schemaHelper.createSchema(this.tenant, 'step1Schema', AreaTypeEnum.stepForm, [], []);
      const step2Schema = await this.schemaHelper.createSchema(this.tenant, 'step1Schema', AreaTypeEnum.stepForm, [], []);

      // Steps
      const step1 = await this.createProcessStepEntity('step1', 'step1', step1Schema.id, resolutions);
      const step2 = await this.createProcessStepEntity('step2', 'step2', step2Schema.id, resolutions);

      // Step1 link
      let linkOperation = await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        workflowId: workflow.id,
        refName: 'step1',
        processStepEntityId: step1.id,
        tenantId: this.tenant,
        defaultOverride: {
          expression: {},
          numberOfInstances: 1
        }
      });

      // Step2 link
      await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        workflowId: workflow.id,
        refName: 'step2',
        parentId: linkOperation.targetId,
        processStepEntityId: step2.id,
        tenantId: this.tenant,
        defaultOverride: {
          expression: {},
          numberOfInstances: 1
        }
      });

      const rawDataSchema = await this.schemaHelper.createSchema(this.tenant, 'rawDataSchema', AreaTypeEnum.rawData, [], []);

      const rawDataEntityOperation = await this.dynamicEntitiesService.create(<CreateDynamicEntityDto>{
        areaType: AreaTypeEnum.rawData,
        fields: [],
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
            <ListOfLinkFieldValueDto>{ id: 'rawDataIds', type: FieldTypeIds.ListOfLinksField, value: [rawDataEntityOperation.targetId] }
          ],
          schemaId: caseSchema.id
        },
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
        refName: 'step1',
        resolution: '',
        stepSchemaId: step1Schema.id,
        schemaId: workflow.id,
        tenantId: this.tenant,
        workflowStateId: stateOperation.targetId,
        visualElements: visualElements,
        visualElementId: visualElements[0].id
      };

      await this.workflowStateService.addStep(createStepCommand);

      const step1PublicId = await this.workflowHelper.getStepDePublicId('step1', stateOperation.targetId, this.tenant, workflow.id);

      if (step1PublicId) {
        await this.workflowStateService.updateStep(<UpdateStepCommand>{
          ...createStepCommand,
          stepDynamicEntities: [
            {
              dynamicEntity: {
                publicId: step1PublicId,
                areaType: step1Schema.areaType,
                fields: [],
                appId: this.appId,
                schemaId: step1Schema.id,
                tenantId: this.tenant
              }
            }
          ],
          resolution: resolutions[0].name
        });

        const createStepCommand2 = <UpdateStepCommand>{
          stepDynamicEntities: [],
          refName: 'step2',
          resolution: '',
          stepSchemaId: step2Schema.id,
          schemaId: workflow.id,
          tenantId: this.tenant,
          workflowStateId: stateOperation.targetId,
          visualElements: visualElements,
          visualElementId: visualElements[1].id
        };

        await this.workflowStateService.addStep(createStepCommand2);

        const step2PublicId = await this.workflowHelper.getStepDePublicId('step2', stateOperation.targetId, this.tenant, workflow.id);

        if (step2PublicId) {
          await this.workflowStateService.updateStep(<UpdateStepCommand>{
            ...createStepCommand2,
            stepDynamicEntities: [
              {
                dynamicEntity: {
                  publicId: step2PublicId,
                  areaType: step2Schema.areaType,
                  fields: [],
                  appId: this.appId,
                  schemaId: step2Schema.id,
                  tenantId: this.tenant
                }
              }
            ],
            resolution: resolutions[0].name
          });

          try {
            // THIS SHOULD FAIL - cannot delete step which is parent of another step.
            await this.workflowStateService.deleteStep(<DeleteStepCommand>{
              refName: 'step1',
              tenantId: this.tenant,
              workflowStateId: stateOperation.targetId,
              visualElementId: visualElements[0].id,
              visualElements: visualElements,
              schemaId: workflow.id
            });
          } catch (innerError) {
            isSuccess = true;
          }
        }
      }
    } catch (error) {
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async canAddExpressionForSteps2(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const resolutions: WorkflowResolutionDto[] = [
        {
          name: 'Success'
        },
        {
          name: 'Fail'
        }
      ];

      // Schemas
      const step1Schema = await this.schemaHelper.createSchema(this.tenant, 'step1Schema', AreaTypeEnum.stepForm, [], []);
      const step2Schema = await this.schemaHelper.createSchema(this.tenant, 'step2Schema', AreaTypeEnum.stepForm, [], []);
      const caseSchema = await this.schemaHelper.createCaseSchema(this.tenant, 'caseSchema123', AreaTypeEnum.case, [], []);

      // Workflow
      const open = await this.statusHelper.createStatus(this.tenant, 'Open', 0);
      const workflow = await this.workflowHelper.createWorkflow('workflow-test1', this.tenant, caseSchema.id, [open.id]);

      // Steps
      const step1 = await this.createProcessStepEntity('Step1', 'step1', step1Schema.id, resolutions);
      const step2 = await this.createProcessStepEntity('Step2', 'step2', step2Schema.id, resolutions);

      // Step1 has no restrictions
      await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        workflowId: workflow.id,
        refName: 'step1',
        processStepEntityId: step1.id,
        overrides: [
          <ConditionedProcessStepLinkOverrideDto>{
            numberOfInstances: 1,
            expression: {
              userRoles: [Roles.TenantAdmin, Roles.Tenant, Roles.Supplier]
            },
            rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanDelete, WorkflowRightsEnum.CanEdit]
          }
        ],
        tenantId: this.tenant
      });

      // Step2 can be added only if step1.Resolution = "Success"
      await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        workflowId: workflow.id,
        refName: 'step2',
        processStepEntityId: step2.id,
        overrides: [
          {
            expression: {
              ruleSet: {
                condition: RuleSetCustomCondition.And,
                rules: [
                  {
                    operator: RuleCustomOperatorEnum.Equal,
                    propertyPath: {
                      path: ['steps', 'step1', 'resolution']
                    },
                    value: 'Success'
                  }
                ]
              },
              userRoles: [Roles.TenantAdmin, Roles.Tenant, Roles.Supplier]
            },
            rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanDelete, WorkflowRightsEnum.CanEdit],
            numberOfInstances: 1
          }
        ],
        tenantId: this.tenant
      });

      const rawDataSchema = await this.schemaHelper.createSchema(this.tenant, 'rawDataSchema', AreaTypeEnum.rawData, [], []);

      const rawDataEntityOperation = await this.dynamicEntitiesService.create(<CreateDynamicEntityDto>{
        areaType: AreaTypeEnum.rawData,
        fields: [],
        schemaId: rawDataSchema.id,
        tenantId: this.tenant
      });

      // State
      const stateOperation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
        tenantId: this.tenant,
        workflowId: workflow.id,
        case: {
          appId: this.appId,
          areaType: AreaTypeEnum.case,
          tenantId: this.tenant,
          fields: [
            <ListOfLinkFieldValueDto>{ id: 'rawDataIds', type: FieldTypeIds.ListOfLinksField, value: [rawDataEntityOperation.targetId] }
          ],
          schemaId: caseSchema.id
        },
        schemaId: workflow.id
      });

      const stateResult1 = await this.workflowStateService.get(<GetWorkflowStateQuery>{
        id: stateOperation.targetId,
        tenant: this.tenant,
        schemaId: workflow.id
      });
      // the first step should be available for adding, second - not yet
      if (
        !stateResult1.steps.find((step) => step.refName === 'step1' && step.canAdd) ||
        !stateResult1.steps.find((step) => step.refName === 'step2' && !step.canAdd)
      ) {
        isSuccess = false;
      } else {
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

        // Add step1
        const createStepCommand = <UpdateStepCommand>{
          stepDynamicEntities: [],
          refName: 'step1',
          resolution: '',
          stepSchemaId: step1Schema.id,
          schemaId: workflow.id,
          tenantId: this.tenant,
          workflowStateId: stateOperation.targetId,
          visualElements: visualElements,
          visualElementId: visualElements[0].id
        };

        await this.workflowStateService.addStep(createStepCommand);

        const step1PublicId = await this.workflowHelper.getStepDePublicId('step1', stateOperation.targetId, this.tenant, workflow.id);
        // resolve it

        if (step1PublicId) {
          await this.workflowStateService.updateStep(<UpdateStepCommand>{
            ...createStepCommand,
            stepDynamicEntities: [
              {
                dynamicEntity: {
                  publicId: step1PublicId,
                  areaType: step1Schema.areaType,
                  fields: [],
                  appId: this.appId,
                  schemaId: step1Schema.id,
                  tenantId: this.tenant
                }
              }
            ],
            resolution: resolutions[0].name // Success
          });

          const stateResult = await this.workflowStateService.get(<GetWorkflowStateQuery>{
            id: stateOperation.targetId,
            tenant: this.tenant,
            schemaId: workflow.id
          });

          if (
            stateResult.steps.find((step) => step.refName === 'step1' && !step.canAdd) &&
            stateResult.steps.find((step) => step.refName === 'step2' && step.canAdd)
          ) {
            isSuccess = true;
            console.log(stateResult);
          }
        }
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'test failed';
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async canAddExpressionForSteps(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const resolutions: WorkflowResolutionDto[] = [
        {
          name: 'Success'
        },
        {
          name: 'Fail'
        }
      ];

      // Schemas
      const step1Schema = await this.schemaHelper.createSchema(this.tenant, 'step1Schema', AreaTypeEnum.stepForm, [], []);
      const step2Schema = await this.schemaHelper.createSchema(this.tenant, 'step2Schema', AreaTypeEnum.stepForm, [], []);
      const caseSchema = await this.schemaHelper.createCaseSchema(this.tenant, 'caseSchema123', AreaTypeEnum.case, [], []);

      // Workflow
      const open = await this.statusHelper.createStatus(this.tenant, 'Open', 0);
      const workflow = await this.workflowHelper.createWorkflow('workflow-test1', this.tenant, caseSchema.id, [open.id]);

      // Steps
      const step1 = await this.createProcessStepEntity('Step1', 'step1', step1Schema.id, resolutions);
      const step2 = await this.createProcessStepEntity('Step2', 'step2', step2Schema.id, resolutions);

      // Step1 has no restrictions
      await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        workflowId: workflow.id,
        refName: 'step1',
        processStepEntityId: step1.id,
        overrides: [
          {
            expression: {
              userRoles: [Roles.TenantAdmin, Roles.Tenant, Roles.Supplier]
            },
            numberOfInstances: 1
          }
        ],
        tenantId: this.tenant
      });

      // Step2 can be added only if step1.Resolution = "Success"
      await this.processStepLinkService.createNew(<CreateProcessStepLinkDtoNew>{
        workflowId: workflow.id,
        refName: 'step2',
        processStepEntityId: step2.id,
        overrides: [
          <ConditionedProcessStepLinkOverrideDto>{
            expression: {
              ruleSet: {
                condition: RuleSetCustomCondition.And,
                rules: [
                  {
                    operator: RuleCustomOperatorEnum.Equal,
                    propertyPath: {
                      path: ['steps', 'step1', 'resolution']
                    },
                    value: 'Success'
                  }
                ]
              },
              userRoles: [Roles.TenantAdmin, Roles.Tenant, Roles.Supplier]
            },
            numberOfInstances: 1
          }
        ],
        tenantId: this.tenant
      });

      const rawDataSchema = await this.schemaHelper.createSchema(this.tenant, 'rawDataSchema', AreaTypeEnum.rawData, [], []);

      const rawDataEntityOperation = await this.dynamicEntitiesService.create(<CreateDynamicEntityDto>{
        areaType: AreaTypeEnum.rawData,
        fields: [],
        schemaId: rawDataSchema.id,
        tenantId: this.tenant
      });

      // State
      const stateOperation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
        tenantId: this.tenant,
        workflowId: workflow.id,
        case: {
          appId: this.appId,
          areaType: AreaTypeEnum.case,
          tenantId: this.tenant,
          fields: [
            <ListOfLinkFieldValueDto>{ id: 'rawDataIds', type: FieldTypeIds.ListOfLinksField, value: [rawDataEntityOperation.targetId] }
          ],
          schemaId: caseSchema.id
        },
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

      // Add step1
      const createStepCommand = <UpdateStepCommand>{
        stepDynamicEntities: [],
        refName: 'step1',
        resolution: '',
        stepSchemaId: step1Schema.id,
        schemaId: workflow.id,
        tenantId: this.tenant,
        workflowStateId: stateOperation.targetId,
        visualElements: visualElements,
        visualElementId: visualElements[0].id
      };

      await this.workflowStateService.addStep(createStepCommand);

      // resolve it

      const step1PublicId = await this.workflowHelper.getStepDePublicId('step1', stateOperation.targetId, this.tenant, workflow.id);

      if (step1PublicId) {
        await this.workflowStateService.updateStep(<UpdateStepCommand>{
          ...createStepCommand,
          stepDynamicEntities: [
            {
              dynamicEntity: {
                publicId: step1PublicId,
                areaType: step1Schema.areaType,
                fields: [],
                appId: this.appId,
                schemaId: step1Schema.id,
                tenantId: this.tenant
              }
            }
          ],
          resolution: resolutions[1].name // Fail,
        });

        const stateResult = await this.workflowStateService.get(<GetWorkflowStateQuery>{
          id: stateOperation.targetId,
          tenant: this.tenant,
          schemaId: workflow.id
        });
        if (
          stateResult.steps.find((step) => step.refName === 'step1' && !step.canAdd) &&
          stateResult.steps.find((step) => step.refName === 'step2' && !step.canAdd)
        ) {
          isSuccess = true;
          console.log(stateResult);
        }
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'test failed';
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async expressionWithUserRoles(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const open = await this.statusHelper.createStatus(this.tenant, 'Open', 0);
      const inProgress = await this.statusHelper.createStatus(this.tenant, 'InProgress', 1);

      const caseSchema = await this.schemaHelper.createCaseSchema(this.tenant, 'someName321', AreaTypeEnum.case, [], []);
      const workflow = await this.workflowHelper.createWorkflow('someWorkflow', this.tenant, caseSchema.id, [open.id, inProgress.id]);

      await this.workflowHelper.setDefaultStatus(workflow.id, open.id, this.tenant);

      await this.transitionHelper.create('nothingToOpen', open.id, inProgress.id, this.tenant, workflow.id, {
        name: 'test1',
        userRoles: [Roles.TenantAdmin]
      });

      const rawDataSchema = await this.schemaHelper.createSchema(this.tenant, 'rawDataSchema', AreaTypeEnum.rawData, [], []);

      const rawDataEntityOperation = await this.dynamicEntitiesService.create(<CreateDynamicEntityDto>{
        areaType: AreaTypeEnum.rawData,
        fields: [],
        schemaId: rawDataSchema.id,
        tenantId: this.tenant
      });

      const stateOperation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
        tenantId: this.tenant,
        workflowId: workflow.id,
        case: {
          appId: this.appId,
          areaType: AreaTypeEnum.case,
          fields: [{ id: 'rawDataIds', type: FieldTypeIds.ListOfLinksField, value: [rawDataEntityOperation.targetId] }],
          schemaId: caseSchema.id,
          tenantId: this.tenant
        },
        schemaId: workflow.id
      });

      await this.workflowStateService.updateStatus(<UpdateStatusCommand>{
        statusId: inProgress.id,
        tenantId: this.tenant,
        workflowStateId: stateOperation.targetId,
        schemaId: workflow.id
      });

      var state = await this.workflowStateService.get(<GetWorkflowStateQuery>{
        id: stateOperation.targetId,
        tenant: this.tenant,
        schemaId: workflow.id
      });

      if (state.currentStatus.id === inProgress.id) {
        isSuccess = true;
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Expression with User Roles';
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async expressionWithUserGroups(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const open = await this.statusHelper.createStatus(this.tenant, 'Open', 0);
      const inProgress = await this.statusHelper.createStatus(this.tenant, 'InProgress', 1);

      const caseSchema = await this.schemaHelper.createCaseSchema(this.tenant, 'someName321', AreaTypeEnum.case, [], []);
      const workflow = await this.workflowHelper.createWorkflow('someWorkflow', this.tenant, caseSchema.id, [open.id, inProgress.id]);

      await this.workflowHelper.setDefaultStatus(workflow.id, inProgress.id, this.tenant);

      // Should be with cargoclix tenant to work
      const userGroups = (await this.userGroupService.getUserGroups(this.tenant)).items
        .filter((x) => x.users.some((c) => c.email === 'nikolay.borisov@cargoclix.com'))
        .map((x) => x.id);

      await this.transitionHelper.create('nothingToOpen', open.id, inProgress.id, this.tenant, workflow.id, {
        name: 'test1',
        userGroups: userGroups
      });

      const rawDataSchema = await this.schemaHelper.createSchema(this.tenant, 'rawDataSchema', AreaTypeEnum.rawData, [], []);

      const rawDataEntityOperation = await this.dynamicEntitiesService.create(<CreateDynamicEntityDto>{
        areaType: AreaTypeEnum.rawData,
        fields: [],
        schemaId: rawDataSchema.id,
        tenantId: this.tenant
      });

      const stateOperation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
        tenantId: this.tenant,
        case: {
          appId: this.appId,
          areaType: AreaTypeEnum.case,
          fields: [{ id: 'rawDataIds', type: FieldTypeIds.ListOfLinksField, value: [rawDataEntityOperation.targetId] }],
          schemaId: caseSchema.id,
          tenantId: this.tenant
        },
        schemaId: workflow.id
      });

      await this.workflowStateService.updateStatus(<UpdateStatusCommand>{
        statusId: inProgress.id,
        tenantId: this.tenant,
        workflowStateId: stateOperation.targetId,
        schemaId: workflow.id
      });

      var state = await this.workflowStateService.get(<GetWorkflowStateQuery>{
        id: stateOperation.targetId,
        tenant: this.tenant,
        schemaId: workflow.id
      });

      if (state.currentStatus.id === inProgress.id) {
        isSuccess = true;
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Expression with User Groups';
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    this.schemaHelper.removeRawDataSchema();
    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async createBackendCondition(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const tenantFields = await this.createTenantFieldsAsync();
      const expressions = [
        {
          name: 'expression-1',
          forBackend: true,
          ruleSet: {
            condition: RuleSetCustomCondition.And,
            rules: [
              {
                operator: RuleCustomOperatorEnum.Equal,
                propertyPath: {
                  path: ['age']
                },
                value: 11
              },
              {
                operator: RuleCustomOperatorEnum.Equal,
                propertyPath: {
                  path: ['name']
                },
                value: 'testName'
              },
              {
                operator: RuleCustomOperatorEnum.NotEqual,
                propertyPath: {
                  path: ['money']
                },
                value: 15.0
              },
              {
                operator: RuleCustomOperatorEnum.NotEqual,
                propertyPath: {
                  path: ['restricted']
                },
                value: false
              }
            ]
          }
        }
      ];

      const schema = await this.schemaHelper.createCaseSchema(
        this.tenant,
        'SchemaExpressionTests',
        AreaTypeEnum.case,
        tenantFields,
        expressions
      );

      const rawDataSchema = await this.schemaHelper.createSchema(this.tenant, 'rawDataSchema', AreaTypeEnum.rawData, [], []);

      const rawDataEntityOperation = await this.dynamicEntitiesService.create(<CreateDynamicEntityDto>{
        areaType: AreaTypeEnum.rawData,
        fields: [],
        schemaId: rawDataSchema.id,
        tenantId: this.tenant
      });

      // Dynamic entity
      const caseEntityCmd: CreateDynamicEntityDto = {
        appId: this.appId,
        tenantId: this.tenant,
        areaType: AreaTypeEnum.case,
        schemaId: schema.id,
        fields: this.mapSchemaToDynamicFields(schema.fields, rawDataEntityOperation.targetId)
      };

      const operation = await this.dynamicEntitiesService.create(caseEntityCmd);
      const operationStatusEnum: OperationStatus = OperationStatus[operation.status.toString()];
      if (operationStatusEnum === OperationStatus.Success) {
        const result = await this.dynamicEntitiesService.getById(this.tenant, operation.targetId, schema.id, AreaTypeEnum.case);

        if (schema.functions[0].hasOwnProperty('forBackend') && schema.functions[0].forBackend === true) {
          if (result) {
            isSuccess = true;
            await this.schemasService.deleteById(schema.id, this.tenant, schema.areaType);
          }
        }
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Create Condition For Backend';
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async createFrontendCondition(): Promise<TestResult> {
    let isSuccess = false;

    try {
      // tenant fields
      const tenantFields = await this.createTenantFieldsAsync();

      const expressions = [
        {
          name: 'expression-1',
          forBackend: false,
          ruleSet: {
            condition: RuleSetCustomCondition.And,
            rules: [
              {
                operator: RuleCustomOperatorEnum.Equal,
                propertyPath: {
                  path: ['age']
                },
                value: 11
              },
              {
                operator: RuleCustomOperatorEnum.Equal,
                propertyPath: {
                  path: ['name']
                },
                value: 'testName'
              }
            ]
          },
          actionSettings: [
            {
              fieldPath: {
                path: ['money']
              },
              config: {
                name: 'money',
                hidden: true,
                disabled: false,
                useDefaultValue: true,
                defaultValue: 'Default text when all the rules are met',
                useHintMessage: false,
                hintMessage: '',
                visible: false,
                enabled: false
              }
            }
          ]
        }
      ];

      const schema = await this.schemaHelper.createCaseSchema(
        this.tenant,
        'SchemaExpressionTests',
        AreaTypeEnum.case,
        tenantFields,
        expressions
      );

      const rawDataSchema = await this.schemaHelper.createSchema(this.tenant, 'rawDataSchema', AreaTypeEnum.rawData, [], []);

      const rawDataEntityOperation = await this.dynamicEntitiesService.create(<CreateDynamicEntityDto>{
        areaType: AreaTypeEnum.rawData,
        fields: [],
        schemaId: rawDataSchema.id,
        tenantId: this.tenant
      });

      const dynamicEntityCmd: CreateDynamicEntityDto = {
        appId: this.appId,
        tenantId: this.tenant,
        areaType: AreaTypeEnum.case,
        schemaId: schema.id,
        fields: this.mapSchemaToDynamicFields(schema.fields, rawDataEntityOperation.targetId)
      };
      const operation = await this.dynamicEntitiesService.create(dynamicEntityCmd);
      const operationStatusEnum: OperationStatus = OperationStatus[operation.status.toString()];

      if (operationStatusEnum === OperationStatus.Success) {
        const result = await this.dynamicEntitiesService.getById(this.tenant, operation.targetId, schema.id, AreaTypeEnum.case);

        if (
          schema.functions[0]?.actionSettings &&
          schema.functions[0].hasOwnProperty('forBackend') &&
          schema.functions[0].forBackend === false
        ) {
          if (result) {
            isSuccess = true;
            await this.schemasService.deleteById(schema.id, this.tenant, schema.areaType);
          }
        }
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Create Condition For Frontend';
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private mapSchemaToDynamicFields(fields: SchemaFieldDto[], rawDataId?: string): BaseFieldValueType[] {
    return fields.map((x) => {
      switch (x.type) {
        case FieldTypeIds.IntField:
          return <IntFieldValueDto>{
            id: x.fieldName,
            type: x.type,
            value: 11
          };
        case FieldTypeIds.StringField:
          return <StringFieldValueDto>{
            id: x.fieldName,
            type: x.type,
            value: `testName`
          };
        case FieldTypeIds.DecimalField:
          return <DecimalFieldValueDto>{
            id: x.fieldName,
            type: x.type,
            value: 11.0
          };
        case FieldTypeIds.BoolField:
          return <BoolFieldValueDto>{
            id: x.fieldName,
            type: x.type,
            value: true
          };
        case FieldTypeIds.ListOfLinksField:
          return <ListOfLinkFieldValueDto>{
            id: x.fieldName,
            type: x.type,
            value: [rawDataId]
          };
        default:
          return undefined;
      }
    });
  }

  private async createTenantFieldsAsync(): Promise<IFieldBaseDto[]> {
    const intTenantField = await this.tenantsFieldHelper.createTenantField(
      this.tenant,
      FieldTypeIds.IntField,
      [AreaTypeEnum.rawData, AreaTypeEnum.case],
      'age',
      'Age',
      []
    );
    const stringTenantField = await this.tenantsFieldHelper.createTenantField(
      this.tenant,
      FieldTypeIds.StringField,
      [AreaTypeEnum.rawData, AreaTypeEnum.case],
      'name',
      'Name',
      []
    );
    const decimalTenantField = await this.tenantsFieldHelper.createTenantField(
      this.tenant,
      FieldTypeIds.DecimalField,
      [AreaTypeEnum.rawData, AreaTypeEnum.case],
      'money',
      'Money',
      []
    );
    const boolTenantField = await this.tenantsFieldHelper.createTenantField(
      this.tenant,
      FieldTypeIds.BoolField,
      [AreaTypeEnum.rawData, AreaTypeEnum.case],
      'restricted',
      'Restricted',
      []
    );

    return [intTenantField, stringTenantField, decimalTenantField, boolTenantField];
  }

  private async createTenantFieldsWithRawDataIdsFieldAsync(rawDataId?: string): Promise<IFieldBaseDto[]> {
    const intTenantField = await this.tenantsFieldHelper.createTenantField(
      this.tenant,
      FieldTypeIds.IntField,
      [AreaTypeEnum.rawData, AreaTypeEnum.case],
      'age',
      'Age',
      []
    );
    const stringTenantField = await this.tenantsFieldHelper.createTenantField(
      this.tenant,
      FieldTypeIds.StringField,
      [AreaTypeEnum.rawData, AreaTypeEnum.case],
      'name',
      'Name',
      []
    );
    const decimalTenantField = await this.tenantsFieldHelper.createTenantField(
      this.tenant,
      FieldTypeIds.DecimalField,
      [AreaTypeEnum.rawData, AreaTypeEnum.case],
      'money',
      'Money',
      []
    );
    const boolTenantField = await this.tenantsFieldHelper.createTenantField(
      this.tenant,
      FieldTypeIds.BoolField,
      [AreaTypeEnum.rawData, AreaTypeEnum.case],
      'restricted',
      'Restricted',
      []
    );

    const listOfLinksField = await this.tenantsFieldHelper.createTenantField(
      this.tenant,
      FieldTypeIds.ListOfLinksField,
      [AreaTypeEnum.rawData],
      'rawDataIds',
      'Raw Data Ids',
      []
    );
    return [intTenantField, stringTenantField, decimalTenantField, boolTenantField, listOfLinksField];
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
      tenantId: this.tenant
    };
    const operation = await this.processStepEntityService.create(cmd);
    const result = await this.processStepEntityService.get(this.tenant, operation.targetId);

    return result;
  }
}
