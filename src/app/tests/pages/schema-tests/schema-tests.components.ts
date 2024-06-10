/**
 * global
 */
import { AfterViewInit, Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';

/**
 * project
 */
import { environment } from '@src/environments/environment.base';
import { AdminTenantFieldsService } from '@wfm/service-layer/services/admin-tenant-fields.service';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store/application-state';
import {
  Paging,
  SchemaDto,
  AreaTypeEnum,
  UpdateSchemaCommand,
  FieldTypeIds,
  SchemasService,
  CaseStatus,
  OperationStatus,
  ListDto,
  ListsService,
  IBaseFieldConfiguration,
  IFieldBaseDto,
  DynamicEntityDto,
  DynamicEntitiesService,
  SchemaFieldDto
} from '@wfm/service-layer';

/**
 * local
 */
import { Test, TestResult } from '@tests/models';
import { SchemaHelper } from '../helpers/schemaHelper';
import { TenantFieldsHelper } from '../helpers/tenantFieldsHelper';
import { convertFieldName } from '@wfm/service-layer/helpers';
import {
  BaseFieldValueType,
  DateTimeFieldValueDto,
  EmbededFieldValueDto,
  LinkFieldValueDto,
  StringFieldValueDto,
  TextAreaTypeFieldValueDto
} from '@wfm/service-layer/models/FieldValueDto';
import { DynamicEntityHelper } from '../helpers/dynamicEntityHelper';
import { SystemEventTypes, SystemValueTypeEnum } from '@wfm/common/field/field-default-value/FieldDefaultValues';
import { TestUiPageComponent } from '@wfm/tests/modules/test-ui/test-ui-page/test-ui-page.component';
import { DateTime } from 'luxon';

@Component({
  selector: 'schemas-tests',
  template: '<app-test-ui-page #test></app-test-ui-page>'
})
export class SchemaTestsComponent extends TenantComponent implements AfterViewInit {
  @ViewChild('test') testsComp: TestUiPageComponent;

  title = 'Schemas tests';
  appId: string = environment.appId;

  constructor(
    store: Store<ApplicationState>,
    private schemaHelper: SchemaHelper,
    private listsService: ListsService,
    private dynamicEntityService: DynamicEntitiesService,
    private tenantFieldsHelper: TenantFieldsHelper,
    private tenantFieldsService: AdminTenantFieldsService,
    private schemasService: SchemasService,
    private dynamicEntityHelper: DynamicEntityHelper
  ) {
    super(store);
  }

  ngAfterViewInit(): void {
    this.testsComp.init(this.title, [
      <Test>{
        name: 'Cascade delete dynamic entities',
        function: async () => await this.cascadeDeleteDynamicEntities()
      },
      <Test>{
        name: 'Case schema with note schema',
        function: async () => await this.caseSchema()
      },
      <Test>{
        name: 'Create schema with system default values',
        function: async () => await this.systemDefaultValues()
      },
      <Test>{
        name: 'Get schema fields by list id',
        function: async () => await this.schemaFieldsByList(AreaTypeEnum.case)
      },
      <Test>{
        name: 'Get schemas by field id',
        function: async () => await this.schemasByFieldId(AreaTypeEnum.case)
      },
      <Test>{
        name: 'Create schema with static default value',
        function: async () => await this.createWithStaticValue(AreaTypeEnum.rawData)
      },
      <Test>{
        name: 'CREATE',
        function: async () => await this.create(AreaTypeEnum.rawData)
      },
      <Test>{
        name: 'UPDATE',
        function: async () => await this.update(AreaTypeEnum.case)
      },
      <Test>{
        name: 'Search',
        function: async () => await this.search(AreaTypeEnum.rawData)
      },
      <Test>{
        name: 'GET',
        function: async () => await this.getById(AreaTypeEnum.case)
      },
      <Test>{
        name: 'DELETE',
        function: async () => await this.deleteById(AreaTypeEnum.case)
      }
    ]);
  }

  private async caseSchema(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const tenantFields = await this.addTenantFields();
      const noteSchmea = await this.createNestedSchema(AreaTypeEnum.case, 'Note');
      const caseSchema = await this.createCaseSchema(tenantFields, noteSchmea);

      const dynamicEntity = await this.createDynamicEntity(caseSchema.id, convertFieldName(noteSchmea.name));
      console.log(dynamicEntity);

      if (dynamicEntity.fields.length === 4) {
        isSuccess = true;
      } else {
        isSuccess = false;
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Case schema with note schema';
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async cascadeDeleteDynamicEntities(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const noteSchema = await this.schemaHelper.createSchema(this.tenant, 'Note', AreaTypeEnum.case, [], []);
      const noteLinkTenantField = await this.tenantFieldsHelper.createTenantField(
        this.tenant,
        FieldTypeIds.LinkField,
        [AreaTypeEnum.case],
        'noteLinkField',
        'noteLinkField',
        [],
        <IBaseFieldConfiguration>{
          position: 0,
          cascade: true,
          schemaAreaType: noteSchema.areaType,
          schemaId: noteSchema.id
        }
      );
      const caseSchema = await this.schemaHelper.createSchema(this.tenant, 'Case', AreaTypeEnum.case, [noteLinkTenantField], []);

      const noteDynamic = await this.dynamicEntityHelper.createDynamicEntity(
        noteSchema.id,
        this.appId,
        this.tenant,
        noteSchema.areaType,
        []
      );
      const caseDynamic = await this.dynamicEntityHelper.createDynamicEntity(caseSchema.id, this.appId, this.tenant, caseSchema.areaType, [
        <LinkFieldValueDto>{
          id: noteLinkTenantField.fieldName,
          value: noteDynamic.id,
          type: FieldTypeIds.LinkField
        }
      ]);

      await this.dynamicEntityService.deleteById(this.tenant, caseDynamic.id, caseSchema.id, caseSchema.areaType);

      isSuccess = true;
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Casecade delete dynamic entity';
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async schemaFieldsByList(areaType: AreaTypeEnum): Promise<TestResult> {
    let isSuccess = false;

    try {
      const listDto = <ListDto>{
        inUse: false,
        name: 'newTestn12alks',
        tenantPublicId: this.tenant
      };

      const list = await this.listsService.createList(this.tenant, listDto);
      const listTenantField = await this.tenantFieldsHelper.createTenantField(
        this.tenant,
        FieldTypeIds.ListField,
        [areaType],
        'listTest',
        'listTest',
        [],
        {
          position: 0,
          listId: list.id
        }
      );

      const fields = await this.schemaHelper.createSchemaFields([listTenantField]);

      const cmd: SchemaDto = {
        id: undefined,
        status: CaseStatus.Open,
        name: `create${areaType.toString()}`,
        areaType: areaType,
        tenantId: this.tenant,
        functions: [],
        fields: fields
      };

      const schemaResult = await this.schemaHelper.createSchema(this.tenant, cmd.name, cmd.areaType, cmd.fields, []);
      const result = await this.schemasService.getSchemaFieldsByList(this.tenant, list.id);

      if (result.some((x) => x.configuration.listId === list.id)) {
        isSuccess = true;
        await this.listsService.deleteList(this.tenant, list.id);
        await this.schemasService.deleteById(schemaResult.id, this.tenant, areaType);
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Get schema field by list';
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async schemasByFieldId(areaType: AreaTypeEnum): Promise<TestResult> {
    let isSuccess = false;

    try {
      const intTenantField = await this.tenantFieldsHelper.createTenantField(
        this.tenant,
        FieldTypeIds.IntField,
        [areaType],
        'intFieldCreate',
        'intFieldCreate',
        []
      );

      const fields = await this.schemaHelper.createSchemaFields([intTenantField]);

      const cmd1: SchemaDto = {
        id: undefined,
        status: CaseStatus.Open,
        name: `create${areaType.toString()}`,
        areaType: areaType,
        tenantId: this.tenant,
        functions: [],
        fields: fields
      };

      const cmd2: SchemaDto = {
        id: undefined,
        status: CaseStatus.Open,
        name: `create${areaType.toString()}2`,
        areaType: areaType,
        tenantId: this.tenant,
        functions: [],
        fields: fields
      };

      const schema1 = await this.schemaHelper.createSchema(this.tenant, cmd1.name, cmd1.areaType, cmd1.fields, []);
      const schema2 = await this.schemaHelper.createSchema(this.tenant, cmd2.name, cmd2.areaType, cmd2.fields, []);

      const result = await this.schemasService.getSchemasByFieldId(this.tenant, intTenantField.id);

      if (result.some((x) => x.id === schema1.id) && result.some((x) => x.id === schema2.id)) {
        isSuccess = true;
        await this.tenantFieldsService.deleteById(intTenantField.id, this.tenant);
        await this.schemasService.deleteById(schema1.id, this.tenant, areaType);
        await this.schemasService.deleteById(schema2.id, this.tenant, areaType);
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Get schema by field id';
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async systemDefaultValues(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const currentUserTenantField = await this.tenantFieldsHelper.createTenantField(
        this.tenant,
        FieldTypeIds.StringField,
        [AreaTypeEnum.case],
        'currentUserId',
        'currentUserId',
        []
      );
      const currentUserField: SchemaFieldDto = {
        ...currentUserTenantField,
        configuration: {
          position: 0,
          isSystemDefault: true,
          systemDefaultType: SystemValueTypeEnum.currentUser,
          systemDefaultEvent: SystemEventTypes.Both
        },
        schemaFieldConfiguration: {
          position: 0
        }
      };

      const cmd: SchemaDto = {
        id: undefined,
        status: CaseStatus.Open,
        name: `schema`,
        areaType: AreaTypeEnum.case,
        tenantId: this.tenant,
        functions: [],
        fields: [currentUserField]
      };

      const schema = await this.schemaHelper.createSchema(this.tenant, cmd.name, cmd.areaType, cmd.fields, []);

      const de = await this.dynamicEntityHelper.createDynamicEntity(schema.id, this.appId, this.tenant, AreaTypeEnum.case, []);

      if (de.fields.some((x) => x.id === currentUserField.fieldName)) {
        isSuccess = true;
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Create schema with system default value';
      console.warn('create failed error', { error });
      isSuccess = false;
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async create(areaType: AreaTypeEnum): Promise<TestResult> {
    let isSuccess = false;

    try {
      const intTenantField = await this.tenantFieldsHelper.createTenantField(
        this.tenant,
        FieldTypeIds.IntField,
        [areaType],
        'intFieldCreate',
        'intFieldCreate',
        []
      );
      const stringTenantField = await this.tenantFieldsHelper.createTenantField(
        this.tenant,
        FieldTypeIds.StringField,
        [areaType],
        'stringFieldCreate',
        'stringFieldCreate',
        []
      );

      let fields = await this.schemaHelper.createSchemaFields([intTenantField, stringTenantField]);

      const cmd: SchemaDto = {
        id: undefined,
        status: CaseStatus.Open,
        name: `create${areaType.toString()}`,
        areaType: areaType,
        tenantId: this.tenant,
        functions: [],
        fields: fields
      };

      const schema = await this.schemaHelper.createSchema(this.tenant, cmd.name, cmd.areaType, cmd.fields, []);

      if (schema) {
        const entity = await this.schemasService.getById(schema.id, this.tenant, areaType);
        if (cmd.fields.length === entity.fields.length) {
          isSuccess = true;
          await this.schemasService.deleteById(schema.id, this.tenant, areaType);
          await this.tenantFieldsService.deleteById(intTenantField.id, this.tenant);
          await this.tenantFieldsService.deleteById(stringTenantField.id, this.tenant);
        }
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Create';
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async createWithStaticValue(areaType: AreaTypeEnum): Promise<TestResult> {
    let isSuccess = false;

    try {
      const intTenantField = await this.tenantFieldsHelper.createTenantField(
        this.tenant,
        FieldTypeIds.IntField,
        [areaType],
        'intFieldCreate',
        'intFieldCreate',
        [],
        {
          position: 0,
          value: {
            id: 'intFieldCreate',
            type: FieldTypeIds.IntField,
            value: 100
          }
        }
      );
      const stringTenantField = await this.tenantFieldsHelper.createTenantField(
        this.tenant,
        FieldTypeIds.StringField,
        [areaType],
        'stringFieldCreate',
        'stringFieldCreate',
        [],
        {
          position: 0,
          value: {
            id: 'stringFieldCreate',
            type: FieldTypeIds.StringField,
            value: 'Some Static Value'
          }
        }
      );
      const dateTenantField = await this.tenantFieldsHelper.createTenantField(
        this.tenant,
        FieldTypeIds.DateField,
        [areaType],
        'dateFieldCreate',
        'dateFieldCreate',
        [],
        {
          position: 0,
          value: {
            id: 'dateFieldCreate',
            type: FieldTypeIds.DateField,
            value: DateTime.now().toJSDate()
          }
        }
      );

      const fields = await this.schemaHelper.createSchemaFields([intTenantField, stringTenantField, dateTenantField]);
      const cmd: SchemaDto = {
        id: undefined,
        status: CaseStatus.Open,
        name: `create${areaType.toString()}`,
        areaType: areaType,
        tenantId: this.tenant,
        functions: [],
        fields: fields
      };

      const schema = await this.schemaHelper.createSchema(this.tenant, cmd.name, cmd.areaType, cmd.fields, []);

      if (schema) {
        const entity = await this.schemasService.getById(schema.id, this.tenant, areaType);
        if (cmd.fields.length === entity.fields.length && entity.fields.every((f) => f.configuration?.value?.value)) {
          isSuccess = true;
          await this.schemasService.deleteById(schema.id, this.tenant, areaType);
          await this.tenantFieldsService.deleteById(intTenantField.id, this.tenant);
          await this.tenantFieldsService.deleteById(stringTenantField.id, this.tenant);
        }
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Create schema with static default value';
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async update(areaType: AreaTypeEnum): Promise<TestResult> {
    let isSuccess = false;

    try {
      const intTenantField = await this.tenantFieldsHelper.createTenantField(
        this.tenant,
        FieldTypeIds.IntField,
        [areaType],
        'intFieldCreate',
        'intFieldCreate',
        []
      );
      const stringTenantField = await this.tenantFieldsHelper.createTenantField(
        this.tenant,
        FieldTypeIds.StringField,
        [areaType],
        'stringFieldCreate',
        'stringFieldCreate',
        []
      );
      const boolTenantField = await this.tenantFieldsHelper.createTenantField(
        this.tenant,
        FieldTypeIds.BoolField,
        [areaType],
        'boolFieldCreate',
        'boolFieldCreate',
        []
      );

      const fields = await this.schemaHelper.createSchemaFields([intTenantField, stringTenantField, boolTenantField]);

      const cmd: SchemaDto = {
        id: undefined,
        status: CaseStatus.Open,
        name: `update${areaType.toString()}`,
        areaType: areaType,
        tenantId: this.tenant,
        functions: [],
        fields: [fields[0], fields[1]]
      };

      const schema = await this.schemaHelper.createSchema(this.tenant, cmd.name, cmd.areaType, cmd.fields, []);

      if (schema) {
        const entity = await this.schemasService.getById(schema.id, this.tenant, areaType);

        if (cmd.fields.length === entity.fields.length) {
          entity.name = 'newName';
          entity.fields = [...entity.fields, fields[2]];
          const updateCmd: UpdateSchemaCommand = {
            id: schema.id,
            newTemplate: entity
          };

          const updateOperation = await this.schemasService.update(updateCmd, this.tenant, areaType);
          const updateOperationStatusEnum: OperationStatus = OperationStatus[updateOperation.status.toString()];

          if (updateOperationStatusEnum === OperationStatus.Success) {
            const updatedEntity = await this.schemasService.getById(updateOperation.targetId, this.tenant, areaType);
            if (updatedEntity.name.includes('newName') && updatedEntity.fields.length === entity.fields.length) {
              isSuccess = true;
              await this.schemasService.deleteById(schema.id, this.tenant, areaType);
              await this.tenantFieldsService.deleteById(intTenantField.id, this.tenant);
              await this.tenantFieldsService.deleteById(stringTenantField.id, this.tenant);
              await this.tenantFieldsService.deleteById(boolTenantField.id, this.tenant);
            }
          }
        }
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Update';
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async getById(areaType: AreaTypeEnum): Promise<TestResult> {
    let isSuccess = false;

    try {
      const cmd: SchemaDto = {
        id: undefined,
        status: CaseStatus.Open,
        name: `getById${areaType.toString()}`,
        areaType: areaType,
        tenantId: this.tenant,
        functions: [],
        fields: []
      };

      const schema = await this.schemaHelper.createSchema(this.tenant, cmd.name, cmd.areaType, cmd.fields, []);

      if (schema) {
        const entity = await this.schemasService.getById(schema.id, this.tenant, areaType);

        if (entity) {
          isSuccess = true;
          await this.schemasService.deleteById(schema.id, this.tenant, areaType);
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

  private async deleteById(areaType: AreaTypeEnum): Promise<TestResult> {
    let isSuccess = false;

    try {
      const cmd: SchemaDto = {
        id: undefined,
        status: CaseStatus.Open,
        name: `deleteById${areaType.toString()}`,
        areaType: areaType,
        tenantId: this.tenant,
        functions: [],
        fields: []
      };

      const schema = await this.schemaHelper.createSchema(this.tenant, cmd.name, cmd.areaType, cmd.fields, []);

      if (schema) {
        const entity = await this.schemasService.getById(schema.id, this.tenant, areaType);

        if (entity) {
          const deleteOperation = await this.schemasService.deleteById(schema.id, this.tenant, areaType);
          const deleteOperationStatusEnum: OperationStatus = OperationStatus[deleteOperation.status.toString()];

          if (deleteOperationStatusEnum === OperationStatus.Success) {
            isSuccess = true;
          }
        }
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Delete';
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async search(areaType: AreaTypeEnum): Promise<TestResult> {
    let isSuccess = false;

    try {
      const cmd: SchemaDto = {
        id: undefined,
        status: CaseStatus.Open,
        name: `getById-${areaType.toString()}`,
        areaType: areaType,
        tenantId: this.tenant,
        functions: [],
        fields: []
      };

      const paging: Paging = {
        skip: 0,
        take: 5
      };

      const schema = await this.schemaHelper.createSchema(this.tenant, cmd.name, cmd.areaType, cmd.fields, []);

      if (schema) {
        const result = await this.schemasService.search(this.tenant, areaType, paging);

        if (result.total > 0) {
          isSuccess = true;
          await this.schemasService.deleteById(schema.id, this.tenant, areaType);
        }
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Search';
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async createDynamicEntity(caseSchemaId: string, nestedSchemaName: string): Promise<DynamicEntityDto> {
    const fields: BaseFieldValueType[] = [
      <EmbededFieldValueDto>{
        id: nestedSchemaName,
        type: FieldTypeIds.EmbededField,
        value: [
          <StringFieldValueDto>{ id: 'Content', type: FieldTypeIds.StringField, value: 'thisIsContentValue' },
          <DateTimeFieldValueDto>{ id: 'DateTime', type: FieldTypeIds.DateTimeField, value: DateTime.now().toJSDate() },
          <LinkFieldValueDto>{ id: 'User', type: FieldTypeIds.LinkField, value: 'someIdForUser1234' }
        ]
      },
      {
        id: 'Name',
        type: FieldTypeIds.StringField,
        value: 'John Smith'
      },
      <LinkFieldValueDto>{
        id: 'SupplierCompany',
        type: FieldTypeIds.LinkField,
        value: 'someCompanyId'
      },
      <TextAreaTypeFieldValueDto>{
        id: 'description',
        type: FieldTypeIds.TextareaField,
        value: 'Some long text here....'
      }
    ];

    const dynamicEntity = await this.dynamicEntityHelper.createDynamicEntity(
      caseSchemaId,
      this.appId,
      this.tenant,
      AreaTypeEnum.case,
      fields
    );
    return dynamicEntity;
  }

  private async addTenantFields(): Promise<IFieldBaseDto[]> {
    const firstField = await this.tenantFieldsHelper.createTenantField(
      this.tenant,
      FieldTypeIds.StringField,
      [AreaTypeEnum.case],
      'name',
      'Name',
      []
    );
    const secondField = await this.tenantFieldsHelper.createTenantField(
      this.tenant,
      FieldTypeIds.StringField,
      [AreaTypeEnum.case],
      'supplierCompany',
      'Supplier Company',
      []
    );
    const thirdField = await this.tenantFieldsHelper.createTenantField(
      this.tenant,
      FieldTypeIds.LinkField,
      [AreaTypeEnum.case],
      'author',
      'Author',
      []
    );
    const fourthField = await this.tenantFieldsHelper.createTenantField(
      this.tenant,
      FieldTypeIds.TextareaField,
      [AreaTypeEnum.case],
      'description',
      'Description',
      []
    );
    const fifthField = await this.tenantFieldsHelper.createTenantField(
      this.tenant,
      FieldTypeIds.EmbededField,
      [AreaTypeEnum.case],
      'rawDataItems',
      'RawDataItems',
      []
    );

    const result = [firstField, secondField, thirdField, fourthField, fifthField];
    return result;
  }

  private async createCaseSchema(tenantFields: IFieldBaseDto[], nestedSchema: SchemaDto): Promise<SchemaDto> {
    const config: IBaseFieldConfiguration = {
      position: 0,
      schemaId: nestedSchema.id,
      schemaAreaType: nestedSchema.areaType
    };

    const schemaField = await this.tenantFieldsHelper.createTenantField(
      this.tenant,
      FieldTypeIds.EmbededField,
      [AreaTypeEnum.case],
      convertFieldName(nestedSchema.name),
      nestedSchema.name,
      [],
      config
    );

    tenantFields.push(schemaField);

    const schema = await this.schemaHelper.createSchema(this.tenant, 'Case', AreaTypeEnum.case, tenantFields, []);
    return schema;
  }

  private async createNestedSchema(area: AreaTypeEnum, schemaName): Promise<SchemaDto> {
    const firstField = await this.tenantFieldsHelper.createTenantField(
      this.tenant,
      FieldTypeIds.StringField,
      [AreaTypeEnum.case],
      'content',
      'Content',
      []
    );
    const secondField = await this.tenantFieldsHelper.createTenantField(
      this.tenant,
      FieldTypeIds.DateTimeField,
      [AreaTypeEnum.case],
      'dateTime',
      'DateTime',
      []
    );
    const thirdField = await this.tenantFieldsHelper.createTenantField(
      this.tenant,
      FieldTypeIds.LinkField,
      [AreaTypeEnum.case],
      'user',
      'User',
      []
    );

    const fields = [firstField, secondField, thirdField];
    const schema = await this.schemaHelper.createSchema(this.tenant, schemaName, area, fields, []);
    return schema;
  }
}
