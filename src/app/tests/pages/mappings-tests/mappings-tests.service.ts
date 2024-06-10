import { Injectable } from '@angular/core';
import {
  Company,
  FieldTypeIds,
  AreaTypeEnum,
  CompanyService,
  MappingsService,
  IFieldBaseDto,
  IFilter,
  RawDataImportCreate,
  DynamicEntitiesService,
  RawDataImportService,
  CreateWorkflowStateCommand,
  WorkflowStateService,
  DeleteWorkflowStateCommand
} from '@wfm/service-layer';
import {
  CustomSearchType,
  CustomSuppliersAuditorsFilter,
  MappingSearchFieldModel,
  SearchType
} from '@wfm/service-layer/models/dynamic-entity-models';
import { BaseFieldValueType, ListOfLinkFieldValueDto } from '@wfm/service-layer/models/FieldValueDto';
import { CreateMappingDto } from '@wfm/service-layer/models/mappings';
import { TestResult } from '@wfm/tests/models';
import { DateTime } from 'luxon';
import { ITestService, TestContext } from '../app-tests/create-app-test.service';
import { SchemaHelper } from '../helpers/schemaHelper';
import { StatusHelper } from '../helpers/statusHelper';
import { TenantFieldsHelper } from '../helpers/tenantFieldsHelper';
import { WorkflowHelper } from '../helpers/workflowHelper';

export class MappingsTestService implements ITestService {
  protected ctx: TestContext;
  protected companyId: string;
  protected stringField: IFieldBaseDto;
  protected intField: IFieldBaseDto;

  constructor(protected companyHelper: CompanyService, protected tenantFieldsHelper: TenantFieldsHelper) {}

  async initialize(ctx: TestContext): Promise<void> {
    this.ctx = ctx;

    const company: Company = {
      name: `mytestcomp-${new Date().getTime()}`,
      number: '123',
      vatNr: '123',
      email: 'some@mail.zz',
      country: 'USA ',
      city: 'NY',
      address: '123',
      phone: '123',
      contactPersonId: undefined,
      notes: '123',
      publicId: undefined,
      id: undefined,
      zip: '123'
    };

    const comp = await this.companyHelper.create(company);
    this.companyId = comp.id;

    const textField = await this.tenantFieldsHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.StringField,
      [AreaTypeEnum.rawData],
      'textField',
      'textField',
      []
    );
    this.stringField = textField;

    const intTenantField = await this.tenantFieldsHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.IntField,
      [AreaTypeEnum.rawData],
      'intField',
      'intField',
      []
    );
    this.intField = intTenantField;
  }
  async test(): Promise<TestResult> {
    throw new Error('This method is not implemented');
  }

  async cleanup(): Promise<void> {
    await this.companyHelper.deleteById(this.companyId);
    await this.tenantFieldsHelper.deleteTenantField(this.stringField.id, this.ctx.tenantId);
    await this.tenantFieldsHelper.deleteTenantField(this.intField.id, this.ctx.tenantId);
  }
}

@Injectable()
export class CreateMappingsTestService implements ITestService {
  private ctx: TestContext;
  private companyId: string;
  private stringField: IFieldBaseDto;
  private intField: IFieldBaseDto;
  private schemaId: string;
  private mappingId: string;

  constructor(
    private companyHelper: CompanyService,
    private tenantFieldsHelper: TenantFieldsHelper,
    private mappingsService: MappingsService,
    private schemaHelper: SchemaHelper
  ) {}

  async initialize(ctx: TestContext): Promise<void> {
    this.ctx = ctx;

    const company: Company = {
      name: `mytestcomp-${new Date().getTime()}`,
      number: '123',
      vatNr: '123',
      email: 'some@mail.zz',
      country: 'USA ',
      city: 'NY',
      address: '123',
      phone: '123',
      contactPersonId: undefined,
      notes: '123',
      publicId: undefined,
      id: undefined,
      zip: '123'
    };

    const comp = await this.companyHelper.create(company);
    this.companyId = comp.id;

    const textField = await this.tenantFieldsHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.StringField,
      [AreaTypeEnum.case],
      'textField',
      'textField',
      []
    );
    this.stringField = textField;

    const intTenantField = await this.tenantFieldsHelper.createTenantField(
      this.ctx.tenantId,
      FieldTypeIds.IntField,
      [AreaTypeEnum.case],
      'intField',
      'intField',
      []
    );
    this.intField = intTenantField;

    const schemaFields = await this.schemaHelper.createSchemaFields([this.stringField, this.intField]);

    const schema = await this.schemaHelper.createSchema(this.ctx.tenantId, 'randName', AreaTypeEnum.case, schemaFields, []);
    this.schemaId = schema.id;
  }
  async test(): Promise<TestResult> {
    const cmd: CreateMappingDto = {
      tenantId: this.ctx.tenantId,
      schemaId: this.schemaId,
      areaType: AreaTypeEnum.case,
      companyId: this.companyId,
      searchMask: {
        filters: <MappingSearchFieldModel[]>[
          {
            valueType: this.stringField.type,
            fieldName: this.stringField.fieldName,
            searchType: SearchType.EqualTo,
            id: this.stringField.id,
            value: 'some value'
          },
          {
            valueType: this.intField.type,
            fieldName: this.intField.fieldName,
            searchType: SearchType.EqualTo,
            id: this.intField.id,
            value: 20
          }
        ]
      }
    };

    const operation = await this.mappingsService.createSupplier(this.ctx.tenantId, cmd);

    this.mappingId = operation.targetId;

    return TestResult.success();
  }

  async cleanup(): Promise<void> {
    await this.mappingsService.deleteSupplier(this.ctx.tenantId, this.mappingId);
    await this.schemaHelper.deleteSchema(this.ctx.tenantId, this.schemaId, AreaTypeEnum.case);
    await this.companyHelper.deleteById(this.companyId);
    await this.tenantFieldsHelper.deleteTenantField(this.stringField.id, this.ctx.tenantId);
    await this.tenantFieldsHelper.deleteTenantField(this.intField.id, this.ctx.tenantId);
  }
}

@Injectable()
export class GetMappingsTestService implements ITestService {
  private ctx: TestContext;
  private companyId: string;
  private schemaId: string;
  private cmd: CreateMappingDto;
  private mappingId: string;

  constructor(private companyHelper: CompanyService, private schemaHelper: SchemaHelper, private mappingsService: MappingsService) {}

  async initialize(ctx: TestContext): Promise<void> {
    this.ctx = ctx;

    const company: Company = {
      name: `mytestcomp-${new Date().getTime()}`,
      number: '123',
      vatNr: '123',
      email: 'some@mail.zz',
      country: 'USA ',
      city: 'NY',
      address: '123',
      phone: '123',
      contactPersonId: undefined,
      notes: '123',
      publicId: undefined,
      id: undefined,
      zip: '123'
    };

    const comp = await this.companyHelper.create(company);

    this.companyId = comp.id;

    const schema = await this.schemaHelper.createSchema(this.ctx.tenantId, 'randName', AreaTypeEnum.case, [], []);

    this.schemaId = schema.id;

    const cmd: CreateMappingDto = {
      tenantId: this.ctx.tenantId,
      schemaId: schema.id,
      areaType: AreaTypeEnum.case,
      companyId: comp.id,
      searchMask: {
        filters: <MappingSearchFieldModel[]>[
          {
            valueType: FieldTypeIds.StringField,
            fieldName: 'name',
            searchType: SearchType.EqualTo,
            id: 'name',
            value: 'Mapping Value'
          }
        ]
      }
    };

    this.cmd = cmd;
    const operation = await this.mappingsService.createSupplier(this.ctx.tenantId, this.cmd);
    this.mappingId = operation.targetId;
  }
  async test(): Promise<TestResult> {
    const allCaseMappings = await this.mappingsService.getSuppliers(this.ctx.tenantId, null, null, [
      <IFilter>{ fieldName: 'areaType', valueType: FieldTypeIds.IntField, value: AreaTypeEnum.case, searchType: SearchType.EqualTo }
    ]);

    if (
      allCaseMappings.items.every((item) => item.hasOwnProperty('areaType') && item.areaType === AreaTypeEnum.case) &&
      allCaseMappings.items[0].tenantId === this.cmd.tenantId
    ) {
      return TestResult.success();
    }
  }
  async cleanup(): Promise<void> {
    await this.mappingsService.deleteSupplier(this.ctx.tenantId, this.mappingId);
    await this.companyHelper.deleteById(this.companyId);
    await this.schemaHelper.deleteSchema(this.ctx.tenantId, this.schemaId, AreaTypeEnum.case);
  }
}

@Injectable()
export class SupplierMappingsRawDataTestService extends MappingsTestService {
  private schemaId: string;
  private mappingId: string;

  constructor(
    companyHelper: CompanyService,
    tenantFieldsHelper: TenantFieldsHelper,
    private mappingsService: MappingsService,
    private rawDataImportService: RawDataImportService,
    private dynamicEntitiesService: DynamicEntitiesService,
    private schemaHelper: SchemaHelper
  ) {
    super(companyHelper, tenantFieldsHelper);
  }

  async initialize(ctx: TestContext): Promise<void> {
    await super.initialize(ctx);

    const rawDataSchema = await this.schemaHelper.createSchema(
      this.ctx.tenantId,
      'randName',
      AreaTypeEnum.rawData,
      [this.stringField, this.intField],
      []
    );

    this.schemaId = rawDataSchema.id;

    const cmd: CreateMappingDto = {
      tenantId: this.ctx.tenantId,
      schemaId: rawDataSchema.id,
      areaType: AreaTypeEnum.rawData,
      companyId: this.companyId,
      searchMask: {
        filters: <MappingSearchFieldModel[]>[
          {
            valueType: this.stringField.type,
            fieldName: this.stringField.fieldName,
            searchType: SearchType.Like,
            id: this.stringField.id,
            value: '1001'
          },
          {
            valueType: this.intField.type,
            fieldName: this.intField.fieldName,
            searchType: SearchType.EqualTo,
            id: this.intField.id,
            value: 20
          }
        ]
      }
    };

    this.mappingId = (await this.mappingsService.createSupplier(this.ctx.tenantId, cmd)).targetId;
  }
  async test(): Promise<TestResult> {
    // 1st rawData (which is to be returned: it meets the mapping searchMask filters)
    const deFields: BaseFieldValueType[] = [
      {
        value: '1001',
        type: this.stringField.type,
        id: this.stringField.fieldName
      },
      {
        value: 20,
        type: this.intField.type,
        id: this.intField.fieldName
      }
    ];

    const rawDataImportCmd: RawDataImportCreate = {
      tenantId: this.ctx.tenantId,
      rawDataSchemaId: this.schemaId,
      extRef: this.intField.fieldName,
      records: [
        {
          fields: deFields,
          createdAt: DateTime.now().toJSDate(),
          updatedAt: DateTime.now().toJSDate(),
          id: null
        }
      ]
    };

    // 2nd rawData (which is NOT to be returned because of the mapping)
    const deFields2: BaseFieldValueType[] = [
      {
        value: 'Some Value',
        type: this.stringField.type,
        id: this.stringField.fieldName
      },
      {
        value: 15,
        type: this.intField.type,
        id: this.intField.fieldName
      }
    ];

    const rawDataImportCmd2: RawDataImportCreate = {
      tenantId: this.ctx.tenantId,
      rawDataSchemaId: this.schemaId,
      extRef: this.intField.fieldName,
      records: [
        {
          fields: deFields2,
          createdAt: DateTime.now().toJSDate(),
          updatedAt: DateTime.now().toJSDate(),
          id: null
        }
      ]
    };
    let errMessage1 = await this.rawDataImportService.importNew(rawDataImportCmd, this.ctx.tenantId);
    let errMessage2 = await this.rawDataImportService.importNew(rawDataImportCmd2, this.ctx.tenantId);

    if (!errMessage1 && !errMessage2) {
      // check if the supplier sees the correctly mapped data, if no, the test should fail
      const rawDataItems = await this.dynamicEntitiesService.search(AreaTypeEnum.rawData, this.ctx.tenantId, this.schemaId);

      if (rawDataItems.items.find((rawData) => rawData.suppliers?.indexOf(this.companyId) >= 0)) {
        return TestResult.success();
      }
    }
    return TestResult.failure('Test failed.');
  }
  async cleanup(): Promise<void> {
    await this.mappingsService.deleteSupplier(this.ctx.tenantId, this.mappingId);
    await this.schemaHelper.deleteSchema(this.ctx.tenantId, this.schemaId, AreaTypeEnum.rawData);
    await super.cleanup();
  }
}

@Injectable()
export class SupplierMappingsCaseTestService extends MappingsTestService {
  private schemaId: string;
  private caseSchemaId: string;
  private mappingId: string;
  private statusId: string;
  private worklfowSchemaId: string;
  private workflowIds: string[] = [];

  constructor(
    companyHelper: CompanyService,
    tenantFieldsHelper: TenantFieldsHelper,
    private mappingsService: MappingsService,
    private schemaHelper: SchemaHelper,
    private rawDataImportService: RawDataImportService,
    private dynamicEntitiesService: DynamicEntitiesService,
    private statusHelper: StatusHelper,
    private workflowHelper: WorkflowHelper,
    private workflowStateService: WorkflowStateService
  ) {
    super(companyHelper, tenantFieldsHelper);
  }

  async initialize(ctx: TestContext): Promise<void> {
    await super.initialize(ctx);

    const rawDataSchema = await this.schemaHelper.createSchema(
      this.ctx.tenantId,
      'randName',
      AreaTypeEnum.rawData,
      [this.stringField, this.intField],
      []
    );

    this.schemaId = rawDataSchema.id;

    const cmd: CreateMappingDto = {
      tenantId: this.ctx.tenantId,
      schemaId: rawDataSchema.id,
      areaType: AreaTypeEnum.rawData,
      companyId: this.companyId,
      searchMask: {
        filters: <MappingSearchFieldModel[]>[
          {
            valueType: this.stringField.type,
            fieldName: this.stringField.fieldName,
            searchType: SearchType.Like,
            id: this.stringField.id,
            value: 'GDC'
          },
          {
            valueType: this.intField.type,
            fieldName: this.intField.fieldName,
            searchType: SearchType.Range,
            from: 3,
            to: 5,
            id: this.intField.id
          }
        ]
      }
    };

    this.mappingId = (await this.mappingsService.createSupplier(this.ctx.tenantId, cmd)).targetId;
  }
  async test(): Promise<TestResult> {
    // 1st rawData (which is to be returned: it meets the mapping searchMask filters)
    const deFields: BaseFieldValueType[] = [
      {
        value: 'GDC',
        type: this.stringField.type,
        id: this.stringField.fieldName
      },
      {
        value: 4,
        type: this.intField.type,
        id: this.intField.fieldName
      }
    ];

    // 2nd rawData (which is NOT to be returned because of the mapping filters)
    const deFields2: BaseFieldValueType[] = [
      {
        value: 'Some Tenant',
        type: this.stringField.type,
        id: this.stringField.fieldName
      },
      {
        value: 15,
        type: this.intField.type,
        id: this.intField.fieldName
      }
    ];

    const rawDataImportCmd: RawDataImportCreate = {
      tenantId: this.ctx.tenantId,
      rawDataSchemaId: this.schemaId,
      extRef: this.intField.fieldName,
      records: [
        {
          fields: deFields,
          createdAt: DateTime.now().toJSDate(),
          updatedAt: DateTime.now().toJSDate(),
          id: null
        },
        {
          fields: deFields2,
          createdAt: DateTime.now().toJSDate(),
          updatedAt: DateTime.now().toJSDate(),
          id: null
        }
      ]
    };

    let errMessage1 = await this.rawDataImportService.importNew(rawDataImportCmd, this.ctx.tenantId);

    if (!errMessage1) {
      const rawDataItems = await this.dynamicEntitiesService.search(AreaTypeEnum.rawData, this.ctx.tenantId, this.schemaId);
      const filteredBySupplier = rawDataItems.items.filter((rawData) => rawData.suppliers?.indexOf(this.companyId) >= 0);

      if (filteredBySupplier.length === 1) {
        const rawDataIdsField = await this.tenantFieldsHelper.createTenantField(
          this.ctx.tenantId,
          FieldTypeIds.ListOfLinksField,
          [AreaTypeEnum.case],
          'rawDataIds',
          'rawDataIds',
          [],
          {
            position: 0,
            schemaAreaType: AreaTypeEnum.rawData,
            schemaId: this.schemaId
          }
        );

        const caseSchema = await this.schemaHelper.createSchema(this.ctx.tenantId, 'caseSchema', AreaTypeEnum.case, [rawDataIdsField], []);

        this.caseSchemaId = caseSchema.id;

        const open = await this.statusHelper.createStatus(this.ctx.tenantId, 'Open', 0);

        this.statusId = open.id;

        const workflow = await this.workflowHelper.createWorkflow('someWorkflow', this.ctx.tenantId, caseSchema.id, [open.id]);

        this.worklfowSchemaId = workflow.id;

        await this.workflowHelper.setDefaultStatus(workflow.id, open.id, this.ctx.tenantId);

        // create 2 workflowStates one with rawData mapped to supplier, and one with the opposite
        const operation = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
          tenantId: this.ctx.tenantId,
          case: {
            appId: this.ctx.appId,
            areaType: AreaTypeEnum.case,
            fields: [
              <ListOfLinkFieldValueDto>{
                id: rawDataIdsField.fieldName,
                type: rawDataIdsField.type,
                value: [rawDataItems.items[0].id]
              }
            ],
            schemaId: caseSchema.id,
            tenantId: this.ctx.tenantId
          },
          schemaId: workflow.id
        });

        this.workflowIds.push(operation.targetId);

        const operation2 = await this.workflowStateService.create(<CreateWorkflowStateCommand>{
          tenantId: this.ctx.tenantId,
          case: {
            appId: this.ctx.appId,
            areaType: AreaTypeEnum.case,
            fields: [
              <ListOfLinkFieldValueDto>{
                id: rawDataIdsField.fieldName,
                type: rawDataIdsField.type,
                value: [rawDataItems.items[1].id]
              }
            ],
            schemaId: caseSchema.id,
            tenantId: this.ctx.tenantId
          },
          schemaId: workflow.id
        });

        this.workflowIds.push(operation2.targetId);

        const caseItems = await this.dynamicEntitiesService.search(AreaTypeEnum.case, this.ctx.tenantId, caseSchema.id);

        if (caseItems.items[0].suppliers?.indexOf(this.companyId) >= 0) {
          return TestResult.success();
        }
      }
    }
    return TestResult.failure('Test failed.');
  }
  async cleanup(): Promise<void> {
    await Promise.all(
      this.workflowIds.map((x) =>
        this.workflowStateService.delete(<DeleteWorkflowStateCommand>{ id: x, tenant: this.ctx.tenantId, schemaId: this.worklfowSchemaId })
      )
    );
    await this.workflowHelper.deleteWorkflow(this.ctx.tenantId, this.worklfowSchemaId);
    await this.schemaHelper.deleteSchema(this.ctx.tenantId, this.caseSchemaId, AreaTypeEnum.case);
    await this.statusHelper.deleteStatus(this.ctx.tenantId, this.statusId);
    await this.mappingsService.deleteSupplier(this.ctx.tenantId, this.mappingId);
    await this.schemaHelper.deleteSchema(this.ctx.tenantId, this.schemaId, AreaTypeEnum.rawData);
    await super.cleanup();
  }
}

@Injectable()
export class SupplierMappingsFilterTestService extends MappingsTestService {
  private schemaId: string;
  private mappingId: string;

  constructor(
    companyHelper: CompanyService,
    tenantFieldsHelper: TenantFieldsHelper,
    private mappingsService: MappingsService,
    private schemaHelper: SchemaHelper,
    private rawDataImportService: RawDataImportService,
    private dynamicEntitiesService: DynamicEntitiesService
  ) {
    super(companyHelper, tenantFieldsHelper);
  }

  async initialize(ctx: TestContext): Promise<void> {
    await super.initialize(ctx);
    const rawDataSchema = await this.schemaHelper.createSchema(
      this.ctx.tenantId,
      'randName',
      AreaTypeEnum.rawData,
      [this.stringField, this.intField],
      []
    );

    this.schemaId = rawDataSchema.id;

    const cmd: CreateMappingDto = {
      tenantId: this.ctx.tenantId,
      areaType: AreaTypeEnum.rawData,
      schemaId: this.schemaId,
      companyId: this.companyId,
      searchMask: {
        filters: <MappingSearchFieldModel[]>[
          {
            valueType: this.stringField.type,
            fieldName: this.stringField.fieldName,
            searchType: SearchType.Like,
            id: this.stringField.id,
            value: 'KFC'
          }
        ]
      }
    };

    this.mappingId = (await this.mappingsService.createSupplier(this.ctx.tenantId, cmd)).targetId;
  }
  async test(): Promise<TestResult> {
    // 1st rawData (which is to be returned: it meets the mapping searchMask filters)
    const deFields: BaseFieldValueType[] = [
      {
        value: 'KFC',
        type: this.stringField.type,
        id: this.stringField.fieldName
      },
      {
        value: 1,
        type: this.intField.type,
        id: this.intField.fieldName
      }
    ];

    const rawDataImportCmd: RawDataImportCreate = {
      tenantId: this.ctx.tenantId,
      rawDataSchemaId: this.schemaId,
      extRef: this.intField.fieldName,
      records: [
        {
          fields: deFields,
          createdAt: DateTime.now().toJSDate(),
          updatedAt: DateTime.now().toJSDate(),
          id: null
        }
      ]
    };

    // 2nd rawData (which is NOT to be returned because of the mapping)
    const deFields2: BaseFieldValueType[] = [
      {
        value: 'Burger King',
        type: this.stringField.type,
        id: this.stringField.fieldName
      },
      {
        value: 2,
        type: this.intField.type,
        id: this.intField.fieldName
      }
    ];

    const rawDataImportCmd2: RawDataImportCreate = {
      tenantId: this.ctx.tenantId,
      rawDataSchemaId: this.schemaId,
      extRef: this.intField.fieldName,
      records: [
        {
          fields: deFields2,
          createdAt: DateTime.now().toJSDate(),
          updatedAt: DateTime.now().toJSDate(),
          id: null
        }
      ]
    };
    let errMessage1 = await this.rawDataImportService.importNew(rawDataImportCmd, this.ctx.tenantId);
    let errMessage2 = await this.rawDataImportService.importNew(rawDataImportCmd2, this.ctx.tenantId);
    if (!errMessage1 && !errMessage2) {
      // checking Suppliers filtering

      const supplierSearchFilter: CustomSuppliersAuditorsFilter = {
        valueType: FieldTypeIds.ListField,
        fieldName: 'suppliers',
        displayName: 'Suppliers',
        searchType: SearchType.Custom,
        customSearchType: CustomSearchType.SupplierIds,
        id: '',
        items: [this.companyId],
        isValid: true
      };

      const rawDataItems = await this.dynamicEntitiesService.search(AreaTypeEnum.rawData, this.ctx.tenantId, this.schemaId, null, null, [
        supplierSearchFilter
      ]);

      console.log(rawDataItems.total);

      if (rawDataItems.items[0].suppliers?.indexOf(this.companyId) >= 0) {
        return TestResult.success();
      }
    }
    return TestResult.failure('Test failed.');
  }
  async cleanup(): Promise<void> {
    await this.mappingsService.deleteSupplier(this.ctx.tenantId, this.mappingId);
    await this.schemaHelper.deleteSchema(this.ctx.tenantId, this.schemaId, AreaTypeEnum.rawData);
    await super.cleanup();
  }
}
