/**
 * global
 */
import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  APP_CLIENT_ID,
  AreaTypeEnum,
  CreateDynamicEntityDto,
  CreateWorkflowStateCommand,
  CreateWorkflowTransitionDto,
  DeleteWorkflowStateCommand,
  DynamicEntitiesService,
  FieldTypeIds,
  GetWorkflowStateQuery,
  OperationStatus,
  Roles,
  UpdateStateCase,
  UpdateStatusCommand,
  UserGroupsService,
  WorkflowService,
  WorkflowStateService,
  WorkflowTransitionService
} from '@wfm/service-layer';
import { BaseFieldValueType, ListOfLinkFieldValueDto } from '@wfm/service-layer/models/FieldValueDto';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store/application-state';
import { Test, TestResult } from '@wfm/tests/models';
import { TestUiPageComponent } from '@wfm/tests/modules/test-ui/test-ui-page/test-ui-page.component';

/**
 * local
 */
import { SchemaHelper } from '../helpers/schemaHelper';
import { StatusHelper } from '../helpers/statusHelper';
import { TenantFieldsHelper } from '../helpers/tenantFieldsHelper';
import { WorkflowHelper } from '../helpers/workflowHelper';

@Component({
  selector: 'workflow-state-tests',
  template: '<app-test-ui-page #test></app-test-ui-page>'
})
export class WorkflowStateTestsComponent extends TenantComponent implements AfterViewInit {
  @ViewChild('test') testsComp: TestUiPageComponent;

  title: string = 'Workflow State Test';

  constructor(
    @Inject(APP_CLIENT_ID) readonly appId: string,
    private statusHelper: StatusHelper,
    private workflowService: WorkflowService,
    private workflowStateService: WorkflowStateService,
    private schemaHelper: SchemaHelper,
    private userGroupService: UserGroupsService,
    private workflowHelper: WorkflowHelper,
    private transitionService: WorkflowTransitionService,
    private tenantFieldsHelper: TenantFieldsHelper,
    private dynamicEntitiesService: DynamicEntitiesService,
    store: Store<ApplicationState>
  ) {
    super(store);
  }

  ngAfterViewInit(): void {
    this.testsComp.init(this.title, [
      <Test>{
        name: 'Test',
        function: async () => await this.test()
      },
      <Test>{
        name: 'Create',
        function: async () => await this.create()
      },
      <Test>{
        name: 'Update Case Real Life',
        function: async () => await this.updateCaseReal()
      },
      <Test>{
        name: 'Update',
        function: async () => await this.update()
      },
      <Test>{
        name: 'Update Case',
        function: async () => await this.updateCase()
      },
      <Test>{
        name: 'Delete',
        function: async () => await this.delete()
      },
      <Test>{
        name: 'Get',
        function: async () => await this.get()
      },
      <Test>{
        name: 'Status Configuration in WorkflowState',
        function: async () => await this.statusConfigurationToBeReturned()
      }
    ]);
  }

  private async test(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const caseSchema = await this.schemaHelper.createSchema(this.tenant, 'someName321', AreaTypeEnum.case, [], []);

      const open = await this.statusHelper.createStatus(this.tenant, 'Open', 0);
      const inProgress = await this.statusHelper.createStatus(this.tenant, 'In Progress', 1);
      const done = await this.statusHelper.createStatus(this.tenant, 'Done', 2);

      const workflow = await this.workflowHelper.createWorkflow('someWorkflow', this.tenant, caseSchema.id, [
        open.id,
        inProgress.id,
        done.id
      ]);

      await this.workflowHelper.setDefaultStatus(workflow.id, open.id, this.tenant);

      // Should be ran with cargoclix tenant to work because this user is in group for tenantId = 2 -> cargoclix
      const userGroups = (await this.userGroupService.getUserGroups(this.tenant)).items
        .filter((x) => x.users.some((c) => c.email === 'nikolay.borisov@cargoclix.com'))
        .map((x) => x.id);

      await this.transitionService.create(<CreateWorkflowTransitionDto>{
        name: 'OpenToInProgress',
        statusId: open.id,
        toStatusId: inProgress.id,
        tenantId: this.tenant,
        workflowId: workflow.id,
        expression: {
          userRoles: [Roles.TenantAdmin, Roles.Tenant],
          userGroups: userGroups
        }
      });

      await this.transitionService.create(<CreateWorkflowTransitionDto>{
        name: 'InProgressDone',
        statusId: inProgress.id,
        toStatusId: done.id,
        tenantId: this.tenant,
        workflowId: workflow.id
      });

      const operation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
        tenantId: this.tenant,
        case: {
          appId: this.appId,
          areaType: AreaTypeEnum.case,
          fields: [],
          schemaId: caseSchema.id,
          tenantId: this.tenant
        },
        schemaId: workflow.id
      });

      await this.workflowStateService.updateStatus(<UpdateStatusCommand>{
        statusId: inProgress.id,
        tenantId: this.tenant,
        workflowStateId: operation.targetId,
        schemaId: workflow.id
      });

      let query: GetWorkflowStateQuery = {
        id: operation.targetId,
        tenant: this.tenant,
        schemaId: workflow.id
      };

      let state = await this.workflowStateService.get(query);
      if (state.currentStatus.id == inProgress.id) {
        isSuccess = true;
      }
    } catch (error) {
      console.warn('update state error', error);
      isSuccess = false;

      return TestResult.failure(error);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async create(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const caseSchema = await this.schemaHelper.createSchema(this.tenant, 'someName321', AreaTypeEnum.case, [], []);

      const open = await this.statusHelper.createStatus(this.tenant, 'Open', 0);
      const inProgress = await this.statusHelper.createStatus(this.tenant, 'In Progress', 1);
      const done = await this.statusHelper.createStatus(this.tenant, 'Done', 2);

      const workflow = await this.workflowHelper.createWorkflow('someWorkflow', this.tenant, caseSchema.id, [
        open.id,
        inProgress.id,
        done.id
      ]);

      await this.workflowHelper.setDefaultStatus(workflow.id, open.id, this.tenant);
      await this.transitionService.create(<CreateWorkflowTransitionDto>{
        name: 'OpenToInProgress',
        statusId: open.id,
        toStatusId: inProgress.id,
        tenantId: this.tenant,
        workflowId: workflow.id
      });

      await this.transitionService.create(<CreateWorkflowTransitionDto>{
        name: 'InProgressDone',
        statusId: inProgress.id,
        toStatusId: done.id,
        tenantId: this.tenant,
        workflowId: workflow.id
      });

      const operation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
        tenantId: this.tenant,
        case: {
          appId: this.appId,
          areaType: AreaTypeEnum.case,
          fields: [],
          schemaId: caseSchema.id,
          tenantId: this.tenant
        },
        schemaId: workflow.id
      });

      await this.workflowStateService.updateStatus(<UpdateStatusCommand>{
        statusId: open.id,
        tenantId: this.tenant,
        workflowStateId: operation.targetId,
        schemaId: workflow.id
      });

      const operationStatusEnum: OperationStatus = OperationStatus[operation.status.toString()];

      if (operationStatusEnum === OperationStatus.Success) {
        isSuccess = true;
        await this.workflowStateService.delete(<DeleteWorkflowStateCommand>{
          id: operation.targetId,
          tenant: this.tenant,
          schemaId: workflow.id
        });
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Create';

      console.warn('update state error', error);
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async updateCaseReal(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const intTenantField = await this.tenantFieldsHelper.createTenantField(
        this.tenant,
        FieldTypeIds.IntField,
        [AreaTypeEnum.case, AreaTypeEnum.rawData, AreaTypeEnum.comment],
        'intFieldCreate',
        'intFieldCreate',
        []
      );

      const rawDataSchema = await this.schemaHelper.createSchema(this.tenant, 'rawDataSchema', AreaTypeEnum.rawData, [intTenantField], []);
      const commentSchema = await this.schemaHelper.createSchema(this.tenant, 'commentSchema', AreaTypeEnum.comment, [intTenantField], []);

      const rawDataIds = await this.tenantFieldsHelper.createTenantField(
        this.tenant,
        FieldTypeIds.ListOfLinksField,
        [AreaTypeEnum.case],
        'rawDataIds',
        'rawDataIds',
        [],
        {
          position: 0,
          schemaAreaType: AreaTypeEnum.rawData,
          schemaId: rawDataSchema.id
        }
      );

      const commentIds = await this.tenantFieldsHelper.createTenantField(
        this.tenant,
        FieldTypeIds.ListOfLinksField,
        [AreaTypeEnum.case],
        'commentIds',
        'commentIds',
        [],
        {
          position: 0,
          schemaAreaType: AreaTypeEnum.comment,
          schemaId: commentSchema.id
        }
      );
      const caseSchema = await this.schemaHelper.createSchema(
        this.tenant,
        'someName321',
        AreaTypeEnum.case,
        [rawDataIds, commentIds, intTenantField],
        []
      );

      const open = await this.statusHelper.createStatus(this.tenant, 'Open', 0);

      const workflow = await this.workflowHelper.createWorkflow('someWorkflow', this.tenant, caseSchema.id, [open.id]);

      await this.workflowHelper.setDefaultStatus(workflow.id, open.id, this.tenant);

      let rawDataItem = await this.dynamicEntitiesService.create(<CreateDynamicEntityDto>{
        areaType: AreaTypeEnum.rawData,
        fields: [
          {
            id: intTenantField.fieldName,
            type: intTenantField.type,
            value: 10
          }
        ],
        schemaId: rawDataSchema.id,
        tenantId: this.tenant
      });

      const operation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
        tenantId: this.tenant,
        case: {
          appId: this.appId,
          areaType: AreaTypeEnum.case,
          fields: [
            <ListOfLinkFieldValueDto>{
              id: commentIds.fieldName,
              type: commentIds.type,
              value: []
            },
            <ListOfLinkFieldValueDto>{
              id: rawDataIds.fieldName,
              type: rawDataIds.type,
              value: [rawDataItem.targetId]
            }
          ],
          schemaId: caseSchema.id,
          tenantId: this.tenant
        },
        schemaId: workflow.id
      });

      const operationStatusEnum: OperationStatus = OperationStatus[operation.status.toString()];

      if (operationStatusEnum === OperationStatus.Success) {
        let state = await this.workflowStateService.get(<GetWorkflowStateQuery>{
          id: operation.targetId,
          tenant: this.tenant,
          schemaId: workflow.id
        });

        // adding a new raw data into the existing case
        let rawDataItem2 = await this.dynamicEntitiesService.create(<CreateDynamicEntityDto>{
          areaType: AreaTypeEnum.rawData,
          fields: [
            {
              id: intTenantField.fieldName,
              type: intTenantField.type,
              value: 1000
            }
          ],
          schemaId: rawDataSchema.id,
          tenantId: this.tenant
        });

        const cmd: UpdateStateCase = {
          workflowStateId: operation.targetId,
          tenantId: this.tenant,
          caseDynamicEntity: {
            appId: this.appId,
            tenantId: this.tenant,
            schemaId: caseSchema.id,
            areaType: AreaTypeEnum.case,
            fields: [
              <ListOfLinkFieldValueDto>{
                id: commentIds.fieldName,
                type: commentIds.type,
                value: []
              },
              <ListOfLinkFieldValueDto>{
                id: rawDataIds.fieldName,
                type: rawDataIds.type,
                value: [rawDataItem.targetId, rawDataItem2.targetId]
              },
              {
                id: intTenantField.fieldName,
                type: intTenantField.type,
                value: 5
              }
            ]
          },
          schemaId: workflow.id
        };

        const updateOperation = await this.workflowStateService.updateCase(cmd);
        const updateOperationStatusEnum: OperationStatus = OperationStatus[updateOperation.status.toString()];

        if (updateOperationStatusEnum === OperationStatus.Success) {
          const caseDE_updated = await this.dynamicEntitiesService.getById(
            this.tenant,
            operation.targetId,
            caseSchema.id,
            AreaTypeEnum.case
          );
          // caseDE_update shall have 3 fields and in one ofthe fields there should be 2 rawDataItemIds
          if (
            caseDE_updated.fields.length === 3 &&
            caseDE_updated.fields.find((f) => {
              return f.id === rawDataIds.fieldName && (<ListOfLinkFieldValueDto>f).value.length === 2;
            })
          ) {
            isSuccess = true;
          }
        }
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Create';

      console.warn('update state error', error);
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async statusConfigurationToBeReturned(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const caseSchema = await this.schemaHelper.createSchema(this.tenant, 'someName321', AreaTypeEnum.case, [], []);

      const open = await this.statusHelper.createStatus(this.tenant, 'Open', 0, { label: 'Open Label', color: 'blue' });
      const inProgress = await this.statusHelper.createStatus(this.tenant, 'In Progress', 1, { label: 'inProgress Label', color: 'green' });
      const done = await this.statusHelper.createStatus(this.tenant, 'Done', 2, { label: 'done Label', color: 'red' });

      const workflow = await this.workflowHelper.createWorkflow('someWorkflow', this.tenant, caseSchema.id, [
        open.id,
        inProgress.id,
        done.id
      ]);

      await this.workflowHelper.setDefaultStatus(workflow.id, open.id, this.tenant);
      await this.transitionService.create(<CreateWorkflowTransitionDto>{
        name: 'OpenToInProgress',
        statusId: open.id,
        toStatusId: inProgress.id,
        tenantId: this.tenant,
        workflowId: workflow.id
      });

      await this.transitionService.create(<CreateWorkflowTransitionDto>{
        name: 'InProgressDone',
        statusId: inProgress.id,
        toStatusId: done.id,
        tenantId: this.tenant,
        workflowId: workflow.id
      });

      const operation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
        tenantId: this.tenant,
        case: {
          appId: this.appId,
          areaType: AreaTypeEnum.case,
          fields: [],
          schemaId: caseSchema.id,
          tenantId: this.tenant
        },
        schemaId: workflow.id
      });

      await this.workflowStateService.updateStatus(<UpdateStatusCommand>{
        statusId: open.id,
        tenantId: this.tenant,
        workflowStateId: operation.targetId,
        schemaId: workflow.id
      });

      let query: GetWorkflowStateQuery = {
        id: operation.targetId,
        tenant: this.tenant,
        schemaId: workflow.id
      };

      let updatedState = await this.workflowStateService.get(query);
      if (
        updatedState.statuses.some((status) => {
          return status.enabled && status.configuration.label;
        })
      ) {
        isSuccess = true;
        await this.workflowStateService.delete(<DeleteWorkflowStateCommand>{
          id: operation.targetId,
          tenant: this.tenant,
          schemaId: workflow.id
        });
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Status configuration in workflow state';

      console.warn('update state error', error);
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async get(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const caseSchema = await this.schemaHelper.createSchema(this.tenant, 'someName321', AreaTypeEnum.case, [], []);
      const open = await this.statusHelper.createStatus(this.tenant, 'open', 0);
      const workflow = await this.workflowHelper.createWorkflow('someWorkflow', this.tenant, caseSchema.id, [open.id]);
      const operation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
        tenantId: this.tenant,
        case: {
          appId: this.appId,
          areaType: AreaTypeEnum.case,
          fields: [],
          schemaId: caseSchema.id,
          tenantId: this.tenant
        },
        schemaId: workflow.id
      });

      const operationStatusEnum: OperationStatus = OperationStatus[operation.status.toString()];

      if (operationStatusEnum === OperationStatus.Success) {
        const result = await this.workflowStateService.get(<GetWorkflowStateQuery>{
          id: operation.targetId,
          tenant: this.tenant,
          schemaId: workflow.id
        });

        if (result) {
          isSuccess = true;

          await this.workflowStateService.delete(<DeleteWorkflowStateCommand>{
            id: operation.targetId,
            tenant: this.tenant,
            schemaId: workflow.id
          });
        }
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Get';

      console.warn('update state error', error);
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async update(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const caseSchema = await this.schemaHelper.createSchema(this.tenant, 'someName321', AreaTypeEnum.case, [], []);
      const open = await this.statusHelper.createStatus(this.tenant, 'open', 0);
      const workflow = await this.workflowHelper.createWorkflow('someWorkflow', this.tenant, caseSchema.id, [open.id]);
      const operation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
        tenantId: this.tenant,
        workflowId: workflow.id,
        case: {
          appId: this.appId,
          areaType: AreaTypeEnum.case,
          fields: [],
          schemaId: caseSchema.id,
          tenantId: this.tenant
        },
        schemaId: workflow.id
      });
      const operationStatusEnum: OperationStatus = OperationStatus[operation.status.toString()];

      if (operationStatusEnum === OperationStatus.Success) {
        const status = await this.statusHelper.createStatus(this.tenant, 'Open', 0);
        const cmd: UpdateStatusCommand = {
          statusId: status.id,
          tenantId: this.tenant,
          workflowStateId: operation.targetId,
          schemaId: workflow.id
        };

        const updateOperation = await this.workflowStateService.updateStatus(cmd);
        const updateOperationStatusEnum: OperationStatus = OperationStatus[updateOperation.status.toString()];

        if (updateOperationStatusEnum === OperationStatus.Success) {
          const state = await this.workflowStateService.get(<GetWorkflowStateQuery>{
            id: operation.targetId,
            tenant: this.tenant,
            schemaId: workflow.id
          });

          if (state.currentStatus.name === status.name) {
            isSuccess = true;
            await this.workflowStateService.delete(<DeleteWorkflowStateCommand>{
              id: operation.targetId,
              tenant: this.tenant,
              schemaId: workflow.id
            });
          }
        }
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Update';

      console.warn('update state error', error);
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async updateCase(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const intTenantField = await this.tenantFieldsHelper.createTenantField(
        this.tenant,
        FieldTypeIds.IntField,
        [AreaTypeEnum.case],
        'intFieldCreate',
        'intFieldCreate',
        []
      );
      const caseSchema = await this.schemaHelper.createSchema(this.tenant, 'someName321', AreaTypeEnum.case, [intTenantField], []);
      const openStatus = await this.statusHelper.createStatus(this.tenant, 'Open', 0);
      const doneStatus = await this.statusHelper.createStatus(this.tenant, 'Done', 1);

      const workflow = await this.workflowHelper.createWorkflow('someWorkflow', this.tenant, caseSchema.id, [openStatus.id, doneStatus.id]);
      await this.workflowHelper.setDefaultStatus(workflow.id, openStatus.id, this.tenant);

      const operation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
        tenantId: this.tenant,
        workflowId: workflow.id,
        case: {
          appId: this.appId,
          areaType: AreaTypeEnum.case,
          fields: [],
          schemaId: caseSchema.id,
          tenantId: this.tenant
        },
        schemaId: workflow.id
      });

      const caseDE = await this.dynamicEntitiesService.getById(this.tenant, operation.targetId, caseSchema.id, AreaTypeEnum.case);
      // case should have the default status
      if (caseDE.statusId) {
        const operationStatusEnum: OperationStatus = OperationStatus[operation.status.toString()];

        if (operationStatusEnum === OperationStatus.Success) {
          const cmd: UpdateStateCase = {
            workflowStateId: operation.targetId,
            tenantId: this.tenant,
            caseDynamicEntity: {
              appId: this.appId,
              tenantId: this.tenant,
              schemaId: caseSchema.id,
              areaType: AreaTypeEnum.case,
              fields: [
                <BaseFieldValueType>{
                  id: intTenantField.fieldName,
                  type: intTenantField.type,
                  value: 100
                }
              ]
            },
            schemaId: workflow.id
          };

          const updateOperation = await this.workflowStateService.updateCase(cmd);
          const updateOperationStatusEnum: OperationStatus = OperationStatus[updateOperation.status.toString()];

          if (updateOperationStatusEnum === OperationStatus.Success) {
            const caseDE_updated = await this.dynamicEntitiesService.getById(
              this.tenant,
              operation.targetId,
              caseSchema.id,
              AreaTypeEnum.case
            );

            // case dynamic entity still should have a status after the update
            if (caseDE_updated.fields[0] && caseDE_updated.fields[0].value === 100 && caseDE_updated.statusId === openStatus.id) {
              isSuccess = true;
              await this.workflowStateService.delete(<DeleteWorkflowStateCommand>{
                id: operation.targetId,
                tenant: this.tenant,
                schemaId: workflow.id
              });
            }
          }
        }
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Update';

      console.warn('update state error', error);
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async delete(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const caseSchema = await this.schemaHelper.createSchema(this.tenant, 'someName321', AreaTypeEnum.case, [], []);
      const open = await this.statusHelper.createStatus(this.tenant, 'open', 0);
      const workflow = await this.workflowHelper.createWorkflow('someWorkflow', this.tenant, caseSchema.id, [open.id]);

      const checkWorkflow = await this.workflowService.get(workflow.id, this.tenant);

      const operation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
        tenantId: this.tenant,
        case: {
          appId: this.appId,
          areaType: AreaTypeEnum.case,
          fields: [],
          schemaId: caseSchema.id,
          tenantId: this.tenant
        },
        schemaId: workflow.id
      });

      const operationStatusEnum: OperationStatus = OperationStatus[operation.status.toString()];

      if (operationStatusEnum === OperationStatus.Success) {
        const deleteOperation = await this.workflowStateService.delete(<DeleteWorkflowStateCommand>{
          id: operation.targetId,
          tenant: this.tenant,
          schemaId: workflow.id
        });
        const deleteOperationStatusEnum: OperationStatus = OperationStatus[deleteOperation.status.toString()];
        if (deleteOperationStatusEnum === OperationStatus.Success) {
          isSuccess = true;
        }

        try {
          const checkWorkflow = await this.workflowService.get(workflow.id, this.tenant);
          if (checkWorkflow.id) {
            isSuccess = true;
          }
        } catch (error) {
          isSuccess = false;
        }
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Delete';

      console.warn('update state error', error);
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }
}
