/**
 * global
 */
import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { cloneDeep } from 'lodash-core';

/**
 * project
 */
import {
  CreateWorkflowStateCommand,
  DeleteStepCommand,
  GetWorkflowStateQuery,
  UpdateStatusCommand,
  UpdateStepCommand,
  VisualElement,
  WorkflowStateDto
} from '@wfm/service-layer/models/workflowState';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import {
  AdminTenantFieldsService,
  APP_CLIENT_ID,
  AreaTypeEnum,
  CreateDynamicEntityDto,
  CreateListDto,
  CreateProcessStepEntityCmd,
  CreateProcessStepLinkDtoNew,
  CreateStatusCommand,
  CreateWorkflowCommand,
  CreateWorkflowTransitionDto,
  ConditionedProcessStepLinkOverrideDto,
  DynamicEntitiesService,
  FieldRenderTypeEnum,
  FieldTypeIds,
  IBaseFieldConfiguration,
  ICreateTenantFieldDto,
  IFieldBaseDto,
  ListDto,
  ListItemDto,
  ListsService,
  ProcessStepEntityDto,
  ProcessStepEntityService,
  ProcessStepLinkBaseOverrideDto,
  ProcessStepLinkDto,
  ProcessStepLinkService,
  Roles,
  SchemaDto,
  SchemaFieldDto,
  SchemasService,
  StatusConfiguration,
  WorkflowDto,
  WorkflowService,
  WorkflowStateService,
  WorkflowStatusDto,
  WorkflowStatusService,
  WorkflowTransitionDto,
  WorkflowTransitionService,
  DataSeedService,
  SchemaTitleSettingModel,
  TenantSettingsDto,
  keyForSchemaTitleSettings,
  TenantSettingsService,
  TenantProfile,
  RepeatableSettings
} from '@wfm/service-layer';
import { Test, TestResult } from '@wfm/tests/models';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { Expression, ExpressionDef } from '@wfm/service-layer/models/expressionModel';

/**
 * local
 */
import * as yard from './becker';
import * as gdcConfig from './gdc';
import * as porscheConfig from './porsche-direct';
import {
  ConfigTitleSettings,
  ScriptCreateListDto,
  ScriptField,
  ScriptNotificationTopic,
  ScriptSchema,
  ScriptWorkflow,
  StepConfig
} from './script-types';
import {
  BaseActionType,
  EventTypes,
  UpdateCaseStatusBasedOnStepResolutionEventDto,
  UpdateStatusBasedOnStepAddedEvent
} from '@wfm/service-layer/models/actionDto';
import { FetchTenantSettingsAction } from '@wfm/store/auth/auth.actions';
import { convertTenantName, roleConverter } from '@wfm/shared/utils';
import { authUserProfileSelector, tenantNameKey, tenantRoleKey } from '@wfm/store';
import { take } from 'rxjs/operators';
import { TestUiPageComponent } from '@wfm/tests/modules/test-ui/test-ui-page/test-ui-page.component';
import { WorkflowHelper } from '../helpers/workflowHelper';
import { NotificationTemplateService } from '@wfm/service-layer/services/notification-template.service';
import { NotificationTopicDto, NotificationTopicService } from '@wfm/service-layer/services/notification-topic.service';
import { DateTime } from 'luxon';

interface ListMap {
  [key: string]: ListDto;
}

interface FieldMap {
  [key: string]: IFieldBaseDto;
}

interface SchemaMap {
  [key: string]: SchemaDto;
}

interface ProcessStepMap {
  [key: string]: ProcessStepEntityDto;
}

@Component({
  selector: 'app-tests',
  template: '<app-test-ui-page #test></app-test-ui-page>'
})
export class DataSeedComponent extends TenantComponent implements AfterViewInit {
  @ViewChild('test') testsComp: TestUiPageComponent;

  title: string = 'Data Seed';

  // private confirmationPassword: string = '0230cf11-4f83-4e5f-9e40-ef9e21116761';
  private confirmationPassword: string = 'Hello World!';
  private workflowSchema: WorkflowDto;

  constructor(
    @Inject(APP_CLIENT_ID) readonly appId: string,
    private tenantFieldsService: AdminTenantFieldsService,
    private schemasService: SchemasService,
    private workflowService: WorkflowService,
    private dynamicEntityService: DynamicEntitiesService,
    private workflowStatusService: WorkflowStatusService,
    private processStepEntityService: ProcessStepEntityService,
    private processStepLinkService: ProcessStepLinkService,
    private transitionService: WorkflowTransitionService,
    private workflowStateService: WorkflowStateService,
    private listsService: ListsService,
    private dynamicEntitiesService: DynamicEntitiesService,
    private dataSeedService: DataSeedService,
    private tenantSettingsService: TenantSettingsService,
    private store: Store<ApplicationState>,
    private workflowHelper: WorkflowHelper,
    private notificationTemplateService: NotificationTemplateService,
    private notificationTopicService: NotificationTopicService
  ) {
    super(store);
  }

  ngAfterViewInit(): void {
    const tenantName = localStorage.getItem(tenantNameKey);

    this.testsComp.init(this.title, [
      <Test>{
        name: 'Seed GDC Data',
        function: async () => await this.seedData(gdcConfig)
      },
      <Test>{
        name: 'Seed Yard Data',
        function: async () => await this.seedData(tenantName === 'Becker Stahl' ? yard.getYardConfig('de') : yard.getYardConfig('en'))
      },
      <Test>{
        name: 'Seed Porsche Data',
        function: async () => await this.seedData(porscheConfig)
      },
      <Test>{
        name: 'Test for Becker postActions (dataseed Becker before running this)',
        function: async () => this.postActionsAfterSeed(yard.getYardConfig('en'))
      },
      <Test>{
        name: 'Create WorkflowState should not take too long for GDC',
        function: async () => await this.createWithTimeLimit(gdcConfig)
      },
      <Test>{
        name: 'Server side Clear All Data',
        function: async () => await this.serverSideClearAllData()
      }
    ]);
  }

  private async seedData(config): Promise<TestResult> {
    let isSuccess = false;

    let listsMap: ListMap;
    let tenantFieldsMap: FieldMap = {};
    let rawDataSchemasMap: SchemaMap;
    let caseSchemasMap: SchemaMap;
    let stepSchemasMap: SchemaMap;
    let commentsSchemasMap: SchemaMap;
    let nestedStepSchemasMap: SchemaMap = {};
    let processStepsMap: ProcessStepMap;

    try {
      // create list entites and map them in map-like object

      listsMap = await this.createLists(config.listEntites);
      console.log('Lists created:', listsMap);
      let configFields = [...config.tenantFields];

      await this.processFieldsInPortions(configFields, tenantFieldsMap, listsMap);

      console.log('Tenant Fields created:', tenantFieldsMap);

      // create raw data schema and store its ID
      rawDataSchemasMap = await this.createSimpleSchemas(config.rawDataSchemas, tenantFieldsMap);
      console.log('Raw Data Schemas created:', rawDataSchemasMap);

      // create comment schemas and store them
      commentsSchemasMap = await this.createSimpleSchemas(config.commentSchemas, tenantFieldsMap);
      console.log('Comments Schemas created:', commentsSchemasMap);

      // create case schema and reference the raw data schema in it sraw data id field, store the case schema id
      caseSchemasMap = await this.createCaseSchemas(config.caseSchemas, tenantFieldsMap, rawDataSchemasMap, commentsSchemasMap);
      console.log('Case Schemas created: ', caseSchemasMap);

      // create process steps schemas
      stepSchemasMap = await this.createSimpleSchemas(config.stepSchemas, tenantFieldsMap);

      // create process step entities
      console.log('Step Schemas created:', stepSchemasMap);

      if (config.nestedStepSchemas?.length) {
        nestedStepSchemasMap = await this.createNestedStepSchemas(config.nestedStepSchemas, tenantFieldsMap, stepSchemasMap);
        console.log('Nested Step Schemas created:', nestedStepSchemasMap);
      }

      stepSchemasMap = {
        ...stepSchemasMap,
        ...nestedStepSchemasMap
      };

      processStepsMap = await this.createProcessStepEntities(config.processSteps, stepSchemasMap);
      console.log('Process Step Entities created:', processStepsMap);

      //create workflow schema
      const workflow = await this.createWorkflow(config.workflow, config.processSteps, processStepsMap, caseSchemasMap, stepSchemasMap);
      this.workflowSchema = workflow;
      console.log('Workflow created:', workflow);

      if (config.titleSettings?.length) {
        await this.setTitleSettings(config.titleSettings, caseSchemasMap, stepSchemasMap);
      }
      const notificationTopics = await this.createNotificationTopics(config.notificationTopics);
      console.log('Notification Topics created:', notificationTopics);

      // create workflowState/case
      // const wfState = await this.createWorkflowState(workflow, config.workflow, caseSchemasMap, rawDataSchemasMap);
      // console.log('WorkflowState created:', wfState);
      console.log('Seeding was successful');
      isSuccess = true;
    } catch (error) {
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure('create failed error' + error);
    }

    return TestResult.success();
  }

  async processFieldsInPortions(configFields, tenantFieldsMap, listsMap) {
    // create tenant fields and map them in a map like object
    if (configFields.length > 20) {
      await this.createTenantFields(configFields.splice(0, 20), listsMap, tenantFieldsMap);
      if (configFields.length > 0) {
        await this.processFieldsInPortions(configFields, tenantFieldsMap, listsMap);
      }
    } else {
      await this.createTenantFields(configFields, listsMap, tenantFieldsMap);
    }
  }

  private async createLists(listsConfig: ScriptCreateListDto[]): Promise<ListMap> {
    let listsMap = {};
    for (const list of listsConfig) {
      const dto = await this.createList(list);
      listsMap[list.key] = { ...dto };
    }
    return listsMap;
  }

  // TODO: parentList relation is not yet developed
  // will need to create the parent lists before creating the child lists
  private async createList(list: ScriptCreateListDto): Promise<ListDto> {
    let cmd: CreateListDto = {
      name: list.title,
      parentListId: '',

      listItems: <ListItemDto[]>list.listItems.map((item, index) => {
        return {
          listId: '',
          item: item,
          parentListItemId: '',
          position: index
        };
      })
    };

    const listDto = await this.listsService.createListWithItems(this.tenant, cmd);
    return listDto;
  }

  private async createTenantFields(fields: ScriptField[], listsMap: ListMap, tenantFieldsMap: FieldMap): Promise<void> {
    let promises = [];
    for (const field of fields) {
      promises.push(this.createTenantField(field, listsMap));
    }
    return Promise.all(promises)
      .then((fieldsDto) => {
        fieldsDto.forEach((fieldDto) => {
          tenantFieldsMap[fieldDto.fieldName] = { ...fieldDto };
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  private async createSimpleSchemas(schemas: ScriptSchema[], fields: FieldMap): Promise<SchemaMap> {
    let schemasMap = {};
    for (const schemaConfig of schemas) {
      const dto = await this.createSchema(schemaConfig, fields);
      schemasMap[dto.name] = { ...dto };
    }
    return schemasMap;
  }

  private async createCaseSchemas(
    schemas: ScriptSchema[],
    fields: FieldMap,
    rawDataSchemas: SchemaMap,
    commentSchemas: SchemaMap
  ): Promise<SchemaMap> {
    try {
      let schemasMap = {};
      for (const schemaConfig of schemas) {
        let rawDataListOfLinkField = await this.createListOfLinkField(
          rawDataSchemas[schemaConfig.rawDataSchemaName],
          'Raw Data Ids',
          'rawDataIds',
          rawDataSchemas[schemaConfig.rawDataSchemaName].areaType
        );

        let commentsListOfLinkField = await this.createListOfLinkField(
          commentSchemas[schemaConfig.commentSchemaName],
          'Comment Ids',
          'commentIds',
          commentSchemas[schemaConfig.commentSchemaName].areaType,
          true
        );

        const dto = await this.createSchema(schemaConfig, fields, [rawDataListOfLinkField, commentsListOfLinkField]);
        schemasMap[dto.name] = { ...dto };
      }
      return schemasMap;
    } catch (error) {
      console.log(error);
    }
  }

  private async createListOfLinkField(
    schema: SchemaDto,
    displayName: string,
    fieldName: string,
    childAreaType: AreaTypeEnum,
    toBeCascadeDeleted?: boolean
  ): Promise<SchemaFieldDto> {
    let listFieldDto = {
      fieldName: fieldName,
      displayName: displayName,
      areaType: [AreaTypeEnum.case],
      type: FieldTypeIds.ListOfLinksField,
      configuration: {
        position: 0,
        schemaId: schema.id,
        schemaAreaType: childAreaType
      }
    };
    if (toBeCascadeDeleted) {
      // dynamic entities referenced in this field will be removed if the parent dynamic entity is removed
      listFieldDto['cascade'] = true;
    }

    let field = await this.createTenantField(listFieldDto);
    return this.mapTenantFieldToSchemaField(field);
  }

  private async createEmbeddedSchemaField(schemaConfig: ScriptSchema, stepSchemas: SchemaMap): Promise<SchemaFieldDto[]> {
    let schemaFields = [];
    try {
      for (const field of schemaConfig.fields) {
        if (field.configuration?.schemaName) {
          let foundSchema = stepSchemas[field.configuration.schemaName];
          if (foundSchema) {
            let schemaFieldDto = {
              id: undefined,
              tenantId: this.tenant,
              isSystem: false,
              fieldName: field.name,
              displayName: foundSchema.name,
              areaTypes: [AreaTypeEnum.stepForm],
              type: FieldTypeIds.EmbededField,
              configuration: {
                position: field.configuration.position || 0,
                schemaId: foundSchema.id,
                schemaAreaType: foundSchema.areaType
              }
            };

            const operation = await this.tenantFieldsService.create(schemaFieldDto);
            const result = await this.tenantFieldsService.getById(this.tenant, operation.targetId);

            schemaFields.push(this.mapTenantFieldToSchemaField(result));
          }
        }
      }
      return schemaFields;
    } catch (error) {
      console.log(error);
    }
  }

  private async createNestedStepSchemas(schemas: ScriptSchema[], fields: FieldMap, stepSchemas: SchemaMap): Promise<SchemaMap> {
    try {
      let schemasMap = {};
      for (const schemaConfig of schemas) {
        let schemaFields = await this.createEmbeddedSchemaField(schemaConfig, stepSchemas);
        const dto = await this.createSchema(schemaConfig, fields, schemaFields);
        schemasMap[dto.name] = { ...dto };
      }
      return schemasMap;
    } catch (error) {
      console.log(error);
    }
  }

  private async createProcessStepEntities(stepConfigs: any[], stepSchemas: SchemaMap): Promise<ProcessStepMap> {
    let processStepMap = {};
    for (const stepConfig of stepConfigs) {
      let stepSchem = stepSchemas[stepConfig.schema];
      const dto: ProcessStepEntityDto = await this.createProcessStepEntity(stepConfig, stepSchem?.id);
      processStepMap[stepConfig.refName] = {
        ...dto,
        refName: stepConfig.refName
      };
    }
    return processStepMap;
  }

  // This maps the fields so no need for createSchemaField
  private mapTenantFieldToSchemaField(tenantField: IFieldBaseDto, schemaSpecificConfig?: IBaseFieldConfiguration): SchemaFieldDto {
    let mergedConfiguration = {
      ...tenantField.configuration,
      ...schemaSpecificConfig
    };
    const mappedField: SchemaFieldDto = {
      ...tenantField,
      configuration: mergedConfiguration,
      schemaFieldConfiguration: undefined
    };
    return mappedField;
  }

  private async createTenantField(field: ScriptField, listsMap?: ListMap): Promise<IFieldBaseDto> {
    let cmd: ICreateTenantFieldDto;

    if (field.type !== FieldTypeIds.EmbededField) {
      cmd = {
        id: undefined,
        tenantId: this.tenant,
        type: field.type,
        areaTypes: field.areaType,
        configuration: field.configuration || {
          position: 0,
          validators: []
        },
        displayName: field.displayName,
        fieldName: field.fieldName,
        isSystem: false
      };

      if (field.type === FieldTypeIds.ListField) {
        let list = listsMap[field.configuration.listName];
        if (list) {
          cmd.configuration.listId = list.id;
          cmd.configuration.renderType = field.configuration.renderType || FieldRenderTypeEnum.select;
        }
      } else if (field.type === FieldTypeIds.BoolField) {
        cmd.configuration.renderType = field.configuration.renderType || FieldRenderTypeEnum.checkbox;
      }
    }

    const operation = await this.tenantFieldsService.create(cmd);
    const result = await this.tenantFieldsService.getById(this.tenant, operation.targetId);
    return result;
  }

  private mapFunctionForLists(schemaFunction: Expression, item: ListItemDto): Expression {
    let func: Expression = { ...schemaFunction };
    // RADO TODO: extend it to be usable for all function rules
    func.ruleSet.rules[0].value = item.id;
    return func;
  }

  private async getListItem(schemaFunction: Expression, fields: FieldMap): Promise<ListItemDto> {
    let item: ListItemDto;
    const functionField = schemaFunction?.ruleSet?.rules[0]?.propertyPath?.path[0];
    const listId = fields[functionField]?.configuration?.listId;

    if (functionField && listId) {
      const listItems = (await this.listsService.getListItems(this.tenant, listId)).items;
      const functionValue = schemaFunction.ruleSet?.rules[0]?.value;
      item = listItems.find((i) => i.item === functionValue);
    }

    return item;
  }

  private async createSchema(schema: ScriptSchema, fields: FieldMap, customFields: SchemaFieldDto[] = []): Promise<SchemaDto> {
    let mappedFields = [];

    for (const field of schema.fields) {
      let tenantField;
      if (!field.configuration.isSchema) {
        tenantField = fields[field.name];
        if (tenantField) {
          mappedFields.push(this.mapTenantFieldToSchemaField(tenantField, field.configuration));
        } else {
          alert('field with this fieldName was not found: ' + field.name);
        }
      }
    }

    if (schema.functions.length) {
      for (const func of schema.functions) {
        if (func.forMappingLists) {
          const item = await this.getListItem(func, fields);
          this.mapFunctionForLists(func, item);
        }
      }

      console.log('Mapped Functions: ', schema.functions);
    }

    const cmd: SchemaDto = {
      id: undefined,
      status: schema.status,
      name: schema.name,
      areaType: schema.areaType,
      tenantId: this.tenant,
      functions: schema.functions,
      fields: [...mappedFields, ...customFields]
    };

    const operation = await this.schemasService.create(cmd);
    const result = await this.schemasService.getById(operation.targetId, this.tenant, schema.areaType);

    return result;
  }

  private async createStatus(name: string, position: number, configuration: StatusConfiguration): Promise<WorkflowStatusDto> {
    const cmd: CreateStatusCommand = {
      name: name,
      position: position,
      tenantId: this.tenant,
      configuration: configuration
    };

    const operation = await this.workflowStatusService.create(cmd);
    const result = await this.workflowStatusService.get(this.tenant, operation.targetId);
    return result;
  }

  private async createProcessStepEntity(
    stepConfig: StepConfig,
    schemaId: string,
    actions?: BaseActionType[]
  ): Promise<ProcessStepEntityDto> {
    const cmd: CreateProcessStepEntityCmd = {
      name: stepConfig.name,
      // refName: stepConfig.refName,
      schemaId: schemaId,
      resolutions: stepConfig.resolution,
      tenantId: this.tenant
    };

    const operation = await this.processStepEntityService.create(cmd);
    const result = await this.processStepEntityService.get(this.tenant, operation.targetId);

    return result;
  }

  private async createProcessStepLink(
    workflowId: string,
    processStepEntityId: string,
    refName: string,
    parentId?: string,
    defaultOverride?: ProcessStepLinkBaseOverrideDto,
    overrides?: ConditionedProcessStepLinkOverrideDto[],
    repeatableSettings?: RepeatableSettings
  ): Promise<ProcessStepLinkDto> {
    const cmd: CreateProcessStepLinkDtoNew = {
      refName: refName,
      tenantId: this.tenant,
      workflowId: workflowId,
      processStepEntityId: processStepEntityId
    };
    if (parentId) {
      cmd.parentId = parentId;
    }
    if (overrides) {
      cmd.overrides = overrides;
    }
    if (defaultOverride) {
      cmd.defaultOverride = defaultOverride;
    }
    if (repeatableSettings) {
      cmd.processStepLinkRepeatableSettings = repeatableSettings;
    }

    const operation = await this.processStepLinkService.createNew(cmd);
    const result = await this.processStepLinkService.get(this.tenant, operation.targetId);

    return result;
  }

  private async createTransition(
    name: string,
    statusId: string,
    toStatusId: string,
    workflowId: string,
    expression?: ExpressionDef
  ): Promise<WorkflowTransitionDto> {
    const cmd: CreateWorkflowTransitionDto = {
      name: name,
      statusId: statusId,
      toStatusId: toStatusId,
      workflowId: workflowId,
      tenantId: this.tenant
    };

    if (expression) {
      cmd.expression = expression;
    }
    const operation = await this.transitionService.create(cmd);
    const result = await this.transitionService.get(this.tenant, operation.targetId);
    return result;
  }

  private async createWorkflow(
    workflowConf: ScriptWorkflow,
    processStepsConf: StepConfig[],
    processSteps: ProcessStepMap,
    caseSchemasMap: SchemaMap,
    processSchemasMap: SchemaMap
  ): Promise<WorkflowDto> {
    let createdLinks: ProcessStepLinkDto[] = [];
    const caseSchema = caseSchemasMap[workflowConf.caseName];
    let workflowStatuses: WorkflowStatusDto[] = [];
    // create statuses
    for (const status of workflowConf.statuses) {
      const wfStatus = await this.createStatus(status.name, status.position, status.configuration);
      workflowStatuses.push(wfStatus);
    }
    console.log('workflowStatuses', workflowStatuses);

    // if there are stepAddedEvents in tenant config, replace the status name with the already created status's id, that's what backend expects
    if (workflowConf.onStepAddedEvents && workflowConf.onStepAddedEvents.length) {
      let statusName = (<UpdateStatusBasedOnStepAddedEvent>workflowConf.onStepAddedEvents[0]).statusId;
      (<UpdateStatusBasedOnStepAddedEvent>workflowConf.onStepAddedEvents[0]).statusId =
        workflowStatuses.find((status) => {
          return status.name === statusName;
        })?.id || statusName;
    }
    // create workflow
    const cmd: CreateWorkflowCommand = {
      name: workflowConf.name,
      caseSchemaId: caseSchema.id,
      tenantId: this.tenant,
      onCreateEvents: workflowConf.onCreateEvents,
      onDeleteEvents: workflowConf.onDeleteEvents,
      onUpdateCase: workflowConf.onUpdateCase,
      onStepAddedEvents: workflowConf.onStepAddedEvents,
      statusEvents: workflowConf.statusEvents,
      statuses: workflowStatuses.map((status) => status.id)
    };

    let workflowOperation = await this.workflowService.create(cmd);

    // set default status
    let defaultStatus = workflowStatuses.find((status) => {
      return status.position === 0;
    });
    await this.workflowService.setDefaultStatus(workflowOperation.targetId, defaultStatus.id, this.tenant);

    // create transition entities
    for (const trnSchema of workflowConf.transitions) {
      let toStatusId: string;
      let fromStatusId: string = '';
      workflowStatuses.forEach((status) => {
        if (status.name === trnSchema.toStatus) {
          toStatusId = status.id;
        } else if (status.name === trnSchema.fromStatus) {
          fromStatusId = status.id;
        }
      });
      await this.createTransition(trnSchema.name, fromStatusId, toStatusId, workflowOperation.targetId, trnSchema.expression);
    }

    for (const stepConf of processStepsConf) {
      const processStepEntity = processSteps[stepConf.refName];

      let link = { ...stepConf.link };
      if (link.parentStepName) {
        // parentId is the parent step's link id
        let parentLink = createdLinks.find((l) => l.refName === link.parentStepName);
        link.parentId = parentLink?.id || null;
      }

      if (link.defaultOverride?.actions) {
        link.defaultOverride.onProcessStepResolvedEvents = this.populateOverrideActions(
          link.defaultOverride.actions,
          processSchemasMap,
          workflowStatuses
        );
        delete link.defaultOverride.actions;
      }
      let defaultOverride = { ...link.defaultOverride } || null;
      let overrides = null;
      if (link.overrides && link.overrides.length) {
        overrides = link.overrides.map((ov) => {
          let dto: ConditionedProcessStepLinkOverrideDto = {
            name: ov.name || ''
          };
          if (ov.numberOfInstances) {
            dto.numberOfInstances = ov.numberOfInstances;
          }
          if (ov.status) {
            let stt = workflowStatuses.find((status) => {
              return status.name === ov.status;
            });
            dto.workflowStatusId = stt.id;
          }
          if (ov.expression) {
            dto.expression = ov.expression;
          }
          if (ov.rights) {
            dto.rights = ov.rights;
          }

          if (ov.disallowedRights) {
            dto.disallowedRights = ov.disallowedRights;
          }

          if (ov.actions) {
            dto.onProcessStepResolvedEvents = this.populateOverrideActions(ov.actions, processSchemasMap, workflowStatuses);
          }
          return dto;
        });
      }
      const newLink = await this.createProcessStepLink(
        workflowOperation.targetId,
        processStepEntity.id,
        processStepEntity['refName'],
        link.parentId || null,
        defaultOverride,
        overrides,
        link.processStepLinkRepeatableSettings
      );
      createdLinks.push(newLink);
    }

    // get the final workflow entity after all the child entities are added
    return await this.workflowService.get(workflowOperation.targetId, this.tenant);
  }

  private populateOverrideActions(
    actions: BaseActionType[],
    processSchemasMap: SchemaMap,
    workflowStatuses: WorkflowStatusDto[]
  ): BaseActionType[] {
    actions.forEach((actionItem) => {
      if (actionItem.eventType === EventTypes.UpdateCaseStatusBasedOnStepResolution) {
        let schemaName = (<UpdateCaseStatusBasedOnStepResolutionEventDto>actionItem)?.schemaId;
        let statusName = (<UpdateCaseStatusBasedOnStepResolutionEventDto>actionItem)?.statusId;

        (<UpdateCaseStatusBasedOnStepResolutionEventDto>actionItem).schemaId = processSchemasMap[schemaName]?.id;
        (<UpdateCaseStatusBasedOnStepResolutionEventDto>actionItem).statusId = workflowStatuses.find(
          (status) => status.name === statusName
        )?.id;
      }
    });
    return cloneDeep(actions);
  }

  private async updateStatus(statusId: string, workflowStateId: string): Promise<void> {
    const cmd: UpdateStatusCommand = {
      role: Roles.TenantAdmin,
      statusId: statusId,
      tenantId: this.tenant,
      workflowStateId: workflowStateId,
      schemaId: this.workflowSchema.id
    };
    await this.workflowStateService.updateStatus(cmd);
  }

  private async createWorkflowState(
    workflow: WorkflowDto,
    workflowConf: ScriptWorkflow,
    caseSchemas: SchemaMap,
    rawSchemas: SchemaMap
  ): Promise<WorkflowStateDto> {
    let caseSchema = caseSchemas[workflowConf.caseName];
    let rawSchemaId: string;

    if (caseSchema) {
      rawSchemaId = caseSchema.fields.find((field) => {
        return field.type === FieldTypeIds.ListOfLinksField && field.configuration.schemaAreaType === AreaTypeEnum.rawData;
      })?.configuration?.schemaId;

      if (rawSchemaId) {
        let rawSchema;
        Object.keys(rawSchemas).forEach((key) => {
          let schema = rawSchemas[key];
          if (schema.id === rawSchemaId) {
            rawSchema = schema;
          }
        });
        let rawDataItem: CreateDynamicEntityDto = {
          appId: this.appId,
          tenantId: this.tenant,
          schemaId: rawSchemaId,
          areaType: AreaTypeEnum.rawData,
          fields: rawSchema.fields?.map((field: SchemaFieldDto) => {
            switch (field.type) {
              case FieldTypeIds.StringField:
                return {
                  id: field.fieldName,
                  type: field.type,
                  value: 'raw data text'
                };
              case FieldTypeIds.IntField:
                return {
                  id: field.fieldName,
                  type: field.type,
                  value: 55
                };
              default:
                return {
                  id: field.fieldName,
                  type: field.type,
                  value: undefined
                };
            }
          })
        };
        let operation = await this.dynamicEntitiesService.create(rawDataItem);

        const caseDE: CreateDynamicEntityDto = {
          appId: this.appId,
          areaType: AreaTypeEnum.case,
          tenantId: this.tenant,
          fields: caseSchema.fields?.map((field: SchemaFieldDto) => {
            switch (field.type) {
              // case FieldTypeIds.StringField:
              //   return {
              //     id: field.fieldName,
              //     type: field.type,
              //     value: 'case text'
              //   };
              // case FieldTypeIds.IntField:
              //   return {
              //     id: field.fieldName,
              //     type: field.type,
              //     value: 150
              //   };
              case FieldTypeIds.ListOfLinksField:
                if (field.configuration.schemaAreaType === AreaTypeEnum.rawData) {
                  return {
                    id: field.fieldName,
                    type: field.type,
                    value: [operation.targetId]
                  };
                }
                return {
                  id: field.fieldName,
                  type: field.type,
                  value: undefined
                };
              default:
                return {
                  id: field.fieldName,
                  type: field.type,
                  value: undefined
                };
            }
          }),
          schemaId: workflow.caseSchemaId
        };

        const cmd: CreateWorkflowStateCommand = {
          tenantId: this.tenant,
          case: caseDE,
          schemaId: workflow.id
        };

        const state = await this.workflowStateService.create(cmd);
        const query: GetWorkflowStateQuery = { id: state.targetId, tenant: this.tenant, schemaId: workflow.id };
        return await this.workflowStateService.get(query);
      }
    }
  }

  private async postActionsAfterSeed(config): Promise<TestResult> {
    let isSuccess = false;

    try {
      console.log('Running post actions test now...');

      const workflowSchemas = await this.workflowService.search(this.tenant, { skip: 0, take: 1000 });
      const workflow = workflowSchemas.items.find((wf) => wf.name === 'Yard');
      const rawDataSchemas = await this.schemasService.search(this.tenant, AreaTypeEnum.rawData, { skip: 0, take: 1000 });
      let rawDataSchemasMap = {};
      rawDataSchemas.items.forEach((schema) => {
        rawDataSchemasMap[schema.name] = schema;
      });
      const caseSchemas = await this.schemasService.search(this.tenant, AreaTypeEnum.case, { skip: 0, take: 1000 });

      const caseSchemaMap = {};
      caseSchemas.items.forEach((schema) => {
        caseSchemaMap[schema.name] = schema;
      });
      const stepFormSchemas = await this.schemasService.search(this.tenant, AreaTypeEnum.stepForm, { skip: 0, take: 1000 });

      const stepSchemasMap = {};
      stepFormSchemas.items.forEach((schema) => {
        stepSchemasMap[schema.name] = schema;
      });

      for (let i = 0; i < 10; i++) {
        console.log('iteration number: ', i);
        let wfState = await this.createWorkflowState(workflow, config.workflow, caseSchemaMap, rawDataSchemasMap);
        console.log('Workflow State Created (Case): ', wfState.id);

        let visualElements: VisualElement[] = [
          {
            id: 'idGeneratedFromFrontEnd',
            index: 0
          }
        ];
        console.log('Resolving First Weighing step');
        let firstStepSchema = stepSchemasMap['Weighing Schema'];

        // add step

        const firstStepCreateCmd: UpdateStepCommand = {
          stepDynamicEntities: [],
          refName: config.processSteps[0].refName,
          resolution: '',
          stepSchemaId: firstStepSchema.id,
          schemaId: workflow.id,
          tenantId: this.tenant,
          workflowStateId: wfState.id,
          visualElements: visualElements,
          visualElementId: visualElements[0].id
        };

        await this.workflowStateService.addStep(firstStepCreateCmd);
        // update the added step
        const deForFirstStep = this.getDynamicEntity(firstStepSchema);

        const firstStepPublicId = await this.workflowHelper.getStepDePublicId(
          config.processSteps[0].refName,
          wfState.id,
          this.tenant,
          workflow.id
        );

        const firstStepUpdateCmd: UpdateStepCommand = {
          ...firstStepCreateCmd,
          stepDynamicEntities: [
            {
              dynamicEntity: {
                ...deForFirstStep,
                publicId: firstStepPublicId
              }
            }
          ],
          resolution: wfState.steps[0].resolutions[0].name
        };
        await this.workflowStateService.updateStep(firstStepUpdateCmd);

        const query: GetWorkflowStateQuery = {
          id: wfState.id,
          tenant: this.tenant,
          schemaId: workflow.id
        };
        wfState = await this.workflowStateService.get(query);
        if (wfState.fields.length !== 2 || !wfState.case.fields.find((field) => field.id === 'firstWeighing' && field.value === 1.12)) {
          isSuccess = false;
          console.log('First Weighing actions firing failed');
          break;
        } else {
          console.log('First Weighing actions fired ok');
          console.log('******');

          console.log('Resolving Packing List Check step');

          let secondStepSchema = stepSchemasMap['Packing List Check Schema'];
          // add packingListCheck step

          const secondStepCreateCmd: UpdateStepCommand = {
            stepDynamicEntities: [],
            refName: 'packingListCheck',
            resolution: '',
            stepSchemaId: secondStepSchema.id,
            schemaId: workflow.id,
            tenantId: this.tenant,
            workflowStateId: wfState.id,
            visualElements: wfState.visualElements,
            visualElementId: wfState.fields[1].entities[0].visualElementId
          };

          await this.workflowStateService.addStep(secondStepCreateCmd);
          // resolve  packingListCheck step
          const deForSecondtStep = this.getDynamicEntity(secondStepSchema);

          const secondStepPublicId = await this.workflowHelper.getStepDePublicId('packingListCheck', wfState.id, this.tenant, workflow.id);

          const secondStepUpdateCmd: UpdateStepCommand = {
            ...secondStepCreateCmd,
            stepDynamicEntities: [{ dynamicEntity: { ...deForSecondtStep, publicId: secondStepPublicId } }],
            resolution: wfState.steps[0].resolutions[0].name
          };
          await this.workflowStateService.updateStep(secondStepUpdateCmd);

          const query: GetWorkflowStateQuery = {
            id: wfState.id,
            tenant: this.tenant,
            schemaId: workflow.id
          };
          wfState = await this.workflowStateService.get(query);

          const rawDataSchemaId = caseSchemaMap['Case Schema - Yard'].fields.find(
            (f) => f.type === FieldTypeIds.ListOfLinksField && f.fieldName === 'rawDataIds'
          )?.configuration?.schemaId;

          const rawDataDeId = wfState.case.fields.find((f) => f.type === FieldTypeIds.ListOfLinksField && f.id === 'rawDataIds')?.value[0];

          if (!rawDataDeId) {
            isSuccess = false;
            console.log('Packing List Check actions fired ok');
            break;
          }

          const rawDataDEItem = await this.dynamicEntityService.getById(this.tenant, rawDataDeId, rawDataSchemaId, AreaTypeEnum.rawData);
          if (
            wfState.fields.length !== 4 ||
            !wfState.case.fields.find((field) => field.id === 'firstWeighing' && field.value === 1.12) ||
            !wfState.case.fields.find((field) => field.id === 'xNumber' && field.value === 'test value') ||
            !rawDataDEItem.fields.find((field) => field.id === 'xNumber' && field.value === 'test value')
          ) {
            isSuccess = false;
            console.log('Packing List Check actions firing failed');

            break;
          } else {
            console.log('Packing List Check actions fired ok');
            console.log('******');

            console.log('Resolving Unloading Begin step');

            let thirdStepSchema = stepSchemasMap['TimeStamp Schema'];
            // add  unloadingBegin step
            const thirdStepCreateCmd: UpdateStepCommand = {
              stepDynamicEntities: [],
              refName: 'unloadingBegin',
              resolution: '',
              stepSchemaId: thirdStepSchema.id,
              schemaId: workflow.id,
              tenantId: this.tenant,
              workflowStateId: wfState.id,
              visualElements: wfState.visualElements,
              visualElementId: wfState.fields[2].entities[0].visualElementId
            };

            await this.workflowStateService.addStep(thirdStepCreateCmd);
            // resolve  unloadingBegin step
            const deForThirdStep = this.getDynamicEntity(thirdStepSchema);

            const thirdStepPublicId = await this.workflowHelper.getStepDePublicId('unloadingBegin', wfState.id, this.tenant, workflow.id);
            const thirdStepUpdateCmd: UpdateStepCommand = {
              ...thirdStepCreateCmd,
              stepDynamicEntities: [{ dynamicEntity: { ...deForThirdStep, publicId: thirdStepPublicId } }],
              resolution: wfState.steps[0].resolutions[0].name
            };

            await this.workflowStateService.updateStep(thirdStepUpdateCmd);

            const query: GetWorkflowStateQuery = {
              id: wfState.id,
              tenant: this.tenant,
              schemaId: workflow.id
            };
            wfState = await this.workflowStateService.get(query);
            if (
              wfState.fields.length !== 5 ||
              !wfState.case.fields.find((field) => field.id === 'firstWeighing' && field.value === 1.12) ||
              !wfState.case.fields.find((field) => field.id === 'xNumber' && field.value === 'test value') ||
              !wfState.case.fields.find((field) => field.id === 'unloadingBegin' && field.value)
            ) {
              isSuccess = false;
              console.log('Unloading Begin actions firing failed');

              break;
            } else {
              console.log('Unloading Begin actions fired ok');
              console.log('******');

              console.log('Removing workflowState: ', wfState.id);
              console.log('-----------------------');
              await this.workflowStateService.delete({ id: wfState.id, tenant: this.tenant, schemaId: wfState.workflowId });
            }
          }
        }

        isSuccess = true;
        console.log('post actions successful');
        console.log('-----------------------');
      }
    } catch (error) {
      console.log('post actions failed', error);
      isSuccess = false;

      return TestResult.failure('post actions failed: ' + error);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('post actions failed');
  }

  private getDynamicEntity(schema: SchemaDto): CreateDynamicEntityDto {
    let dateValue = DateTime.utc(2021, 10, 14, 15, 0, 0, 0).toJSDate();

    return {
      areaType: schema.areaType,
      fields: schema.fields?.map((field: SchemaFieldDto) => {
        switch (field.type) {
          case FieldTypeIds.StringField:
            return {
              id: field.fieldName,
              type: field.type,
              value: 'test value'
            };
          case FieldTypeIds.IntField:
            return {
              id: field.fieldName,
              type: field.type,
              value: 12
            };
          case FieldTypeIds.DecimalField:
            return {
              id: field.fieldName,
              type: field.type,
              value: 1.12
            };
          case FieldTypeIds.DateTimeField:
            return {
              id: field.fieldName,
              type: field.type,
              value: dateValue
            };
          default:
            return {
              id: field.fieldName,
              type: field.type,
              value: undefined
            };
        }
      }),
      appId: this.appId,
      schemaId: schema.id,
      tenantId: this.tenant
    };
  }

  private async serverSideClearAllData(): Promise<TestResult> {
    let input = prompt('You are about to delete all data. Please provide the password to continue !');

    if (input === null || input === '') {
      alert('No password provided. Cancelling method !');
      return TestResult.failure('No password provided. Cancelling method !');
    }

    // Loop checking if the right password is provided
    while (input !== this.confirmationPassword) {
      if (input === null || input === '') {
        alert('No password provided. Cancelling method !');
        return TestResult.failure('No password provided. Cancelling method !');
      }

      alert('Wrong Password!');
      input = prompt('You are about to delete all data. Please provide the password to continue !');
    }
    // If everything is ok, continue...

    let isSuccess = false;

    try {
      await this.dataSeedService.deleteAllData(this.tenant);
      isSuccess = true;
    } catch (error) {
      console.log(error);
      isSuccess = false;

      return TestResult.failure(error);
    }

    return TestResult.success();
  }

  async setTitleSettings(configTitleSettings: ConfigTitleSettings[], caseSchemas: SchemaMap, stepSchemas: SchemaMap): Promise<void> {
    for (const titleSetting of configTitleSettings) {
      if (titleSetting.area === AreaTypeEnum.case) {
        await this.updateTenantsSettings(titleSetting.schemaTitles, caseSchemas[titleSetting.schemaName].id, AreaTypeEnum.case);
      } else if (titleSetting.area === AreaTypeEnum.stepForm) {
        await this.updateTenantsSettings(titleSetting.schemaTitles, stepSchemas[titleSetting.schemaName].id, AreaTypeEnum.stepForm);
      }
    }
    this.store.pipe(select(authUserProfileSelector), take(1)).subscribe((x) => {
      const role = localStorage.getItem(tenantRoleKey);
      this.store.dispatch(
        new FetchTenantSettingsAction({
          tenant: <TenantProfile>{
            tenantId: this.tenant,
            role: role,
            tenantName: convertTenantName(localStorage.getItem(tenantNameKey)),
            roleNum: roleConverter(role)
          },
          userId: x.id
        })
      );
    });
  }

  async updateTenantsSettings(titles: SchemaTitleSettingModel[], schemaId: string, areaType: AreaTypeEnum): Promise<void> {
    let titleSettings: TenantSettingsDto = {
      settings: [
        {
          key: `${keyForSchemaTitleSettings}_${schemaId}_${areaType}`,
          value: {
            schemaTitles: titles
          },
          id: null,
          fromGroup: null,
          fromUser: null,
          isUnique: false
        }
      ],
      tenantId: this.tenant,
      id: null
    };
    await this.tenantSettingsService.update(titleSettings);
  }

  // WFM-2066
  private async createWithTimeLimit(config): Promise<TestResult> {
    try {
      const workflowSchemas = await this.workflowService.search(this.tenant, { skip: 0, take: 1000 });
      const workflow = workflowSchemas.items.find((wf) => wf.name === 'GDC');

      const rawDataSchemas = await this.schemasService.search(this.tenant, AreaTypeEnum.rawData, { skip: 0, take: 1000 });
      let rawDataSchemasMap = {};
      rawDataSchemas.items.forEach((schema) => {
        rawDataSchemasMap[schema.name] = schema;
      });

      const caseSchemas = await this.schemasService.search(this.tenant, AreaTypeEnum.case, { skip: 0, take: 1000 });
      const caseSchemaMap = {};
      caseSchemas.items.forEach((schema) => {
        caseSchemaMap[schema.name] = schema;
      });

      const stepFormSchemas = await this.schemasService.search(this.tenant, AreaTypeEnum.stepForm, { skip: 0, take: 1000 });
      const stepSchemasMap = {};
      stepFormSchemas.items.forEach((schema) => {
        stepSchemasMap[schema.name] = schema;
      });

      let isCreated = false;
      let isStepAdded = false;
      let timeLimitReached = false;
      const createTimeoutId = setTimeout(async () => {
        if (!isCreated) {
          timeLimitReached = true;
        }
      }, 5000);

      let wfState = await this.createWorkflowState(workflow, config.workflow, caseSchemaMap, rawDataSchemasMap);
      if (wfState && !timeLimitReached) {
        isCreated = true;
        clearTimeout(createTimeoutId);

        // add a step, it also triggers performance issues
        let visualElements: VisualElement[] = [
          {
            id: 'idGeneratedFromFrontEnd',
            index: 0
          }
        ];

        let firstStepSchema = stepSchemasMap['GDC Direct Supplier Schema'];

        const firstStepCreateCmd: UpdateStepCommand = {
          stepDynamicEntities: [],
          refName: config.processSteps[0].refName,
          resolution: '',
          stepSchemaId: firstStepSchema.schemaId,
          schemaId: workflow.id,
          tenantId: this.tenant,
          workflowStateId: wfState.id,
          visualElements: visualElements,
          visualElementId: visualElements[0].id
        };

        await this.workflowStateService.addStep(firstStepCreateCmd);

        const deForFirstStep = {
          areaType: firstStepSchema.areaType,
          fields: [],
          appId: this.appId,
          schemaId: firstStepSchema.id,
          tenantId: this.tenant
        };

        const firstStepPublicId = await this.workflowHelper.getStepDePublicId(
          config.processSteps[0].refName,
          wfState.id,
          this.tenant,
          workflow.id
        );

        const firstStepUpdateCmd: UpdateStepCommand = {
          ...firstStepCreateCmd,
          stepDynamicEntities: [{ dynamicEntity: { ...deForFirstStep, publicId: firstStepPublicId } }],
          resolution: wfState.steps[0].resolutions[0].name
        };

        const stepTimeoutId = setTimeout(async () => {
          if (!isStepAdded) {
            timeLimitReached = true;
          }
        }, 5000);

        const stepAddedOperation = await this.workflowStateService.updateStep(firstStepUpdateCmd);
        if (stepAddedOperation && !timeLimitReached) {
          isStepAdded = true;
          clearTimeout(stepTimeoutId);
          return TestResult.success();
        }
      }
    } catch (error) {
      console.log('post actions failed', error);
      return TestResult.failure('post actions failed: ' + error);
    }
    return TestResult.failure('Creating a case or adding a step took too long');
  }

  private async createNotificationTopics(topics: ScriptNotificationTopic[]): Promise<NotificationTopicDto[]> {
    const createdNotificationTopics: NotificationTopicDto[] = [];
    for (const topic of topics) {
      const result = await this.createNotificationTopic(topic);
      if (result) {
        createdNotificationTopics.push(result);
      }
    }

    return createdNotificationTopics;
  }

  private async createNotificationTopic(topic: ScriptNotificationTopic): Promise<NotificationTopicDto> {
    const existingTopic = await this.notificationTopicService.getByName(this.tenant, topic.topicName);
    if (existingTopic) {
      return existingTopic;
    }
    const template = await this.notificationTemplateService.create({
      template: topic.template.template,
      name: topic.template.name,
      logoId: topic.template.logoId,
      tenantId: this.tenant
    });

    if (template) {
      const topicOperation = await this.notificationTopicService.create(this.tenant, {
        topicTemplateId: template.targetId,
        name: topic.topicName,
        topicKind: topic.topicKind,
        topicSendType: topic.topicSendType,
        subject: topic.subject,
        description: topic.description,
        days: topic.days,
        roles: topic.roles,
        userGroups: topic.userGroups
      });
      if (topicOperation) {
        const result = await this.notificationTopicService.get(this.tenant, topicOperation.targetId);
        return result;
      }
    }
    return null;
  }
}
