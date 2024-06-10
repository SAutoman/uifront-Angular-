/**
 * global
 */
import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';

/**
 * project
 */
import {
  AreaTypeEnum,
  CreateDynamicEntityDto,
  FieldTypeIds,
  APP_CLIENT_ID,
  DynamicEntitiesService,
  SchemasService,
  UpdateDynamicEntityDto,
  CaseStatus,
  UpdateSchemaCommand,
  OperationStatus
} from '@wfm/service-layer';

import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store/application/application.reducer';

/**
 * local
 */
import { TenantFieldsHelper } from '../helpers/tenantFieldsHelper';
import { SchemaHelper } from '../helpers/schemaHelper';
import { ListOfLinkFieldValueDto } from '@wfm/service-layer/models/FieldValueDto';
import { TestUiPageComponent } from '@wfm/tests/modules/test-ui/test-ui-page/test-ui-page.component';
import { Test, TestResult } from '@wfm/tests/models';

@Component({
  selector: 'dynamic-entity-tests',
  template: '<app-test-ui-page #test></app-test-ui-page>'
})
export class DynamicEntityTestsComponent extends TenantComponent implements AfterViewInit {
  @ViewChild('test') testsComp: TestUiPageComponent;

  title = 'Dynamic entity tests';

  constructor(
    store: Store<ApplicationState>,
    @Inject(APP_CLIENT_ID) readonly appId: string,
    private schemaHelper: SchemaHelper,
    private tenantFieldsHelper: TenantFieldsHelper,
    private dynamicEntitiesService: DynamicEntitiesService,
    private schemasService: SchemasService
  ) {
    super(store);
  }

  ngAfterViewInit(): void {
    this.testsComp.init(this.title, [
      <Test>{
        name: 'Create',
        function: async () => await this.create(AreaTypeEnum.rawData)
      },
      <Test>{
        name: 'GET',
        function: async () => this.getById(AreaTypeEnum.rawData)
      },
      <Test>{
        name: 'GET many',
        function: async () => this.getMany(AreaTypeEnum.rawData)
      },
      <Test>{
        name: 'DELETE',
        function: async () => this.delete(AreaTypeEnum.rawData)
      },
      <Test>{
        name: 'UPDATE',
        function: async () => this.update(AreaTypeEnum.case)
      },
      <Test>{
        name: 'SEARCH',
        function: async () => this.search(AreaTypeEnum.case)
      },
      <Test>{
        name: 'Get case entity with rawData fields by id',
        function: async () => this.getCaseWithRawDataFieldsById(AreaTypeEnum.case)
      }
    ]);
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
      const schema = await this.schemaHelper.createSchema(this.tenant, 'mySchema321', areaType, [intTenantField], []);

      const cmd: CreateDynamicEntityDto = {
        appId: this.appId,
        tenantId: this.tenant,
        areaType,
        schemaId: schema.id,
        fields: [
          {
            id: intTenantField.fieldName,
            type: intTenantField.type,
            value: 11
          }
        ]
      };

      const operation = await this.dynamicEntitiesService.create(cmd);
      const operationStatusEnum: OperationStatus = OperationStatus[operation.status.toString()];

      if (operationStatusEnum === OperationStatus.Success) {
        const result = await this.dynamicEntitiesService.getById(this.tenant, operation.targetId, schema.id, areaType);
        if (result) {
          isSuccess = true;
          await this.dynamicEntitiesService.deleteById(this.tenant, result.id, schema.id, cmd.areaType);
          await this.schemasService.deleteById(schema.id, this.tenant, cmd.areaType);
        }
      }

      isSuccess = true;
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Create';
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async getById(areaType: AreaTypeEnum): Promise<TestResult> {
    let isSuccess = false;

    try {
      const schema = await this.schemaHelper.createSchema(this.tenant, 'mySchema321', areaType, [], []);

      const dynamicCmd: CreateDynamicEntityDto = {
        appId: this.appId,
        tenantId: this.tenant,
        areaType,
        schemaId: schema.id,
        fields: []
      };

      const operation = await this.dynamicEntitiesService.create(dynamicCmd);
      const operationStatusEnum: OperationStatus = OperationStatus[operation.status.toString()];

      if (operationStatusEnum === OperationStatus.Success) {
        const result = await this.dynamicEntitiesService.getById(this.tenant, operation.targetId, schema.id, areaType);

        if (result) {
          isSuccess = true;
          await this.dynamicEntitiesService.deleteById(this.tenant, operation.targetId, schema.id, areaType);
          await this.schemasService.deleteById(schema.id, this.tenant, areaType);
        }
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Get';

      console.warn('get failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async getCaseWithRawDataFieldsById(areaType: AreaTypeEnum): Promise<TestResult> {
    let isSuccess = false;

    try {
      const schema = await this.schemaHelper.createCaseSchema(this.tenant, 'mySchema321', areaType, [], []);

      const rawDataSchema = await this.schemaHelper.createSchema(this.tenant, 'rawDataSchema', AreaTypeEnum.rawData, [], []);

      const rawDataEntityOperation = await this.dynamicEntitiesService.create(<CreateDynamicEntityDto>{
        areaType: AreaTypeEnum.rawData,
        fields: [],
        schemaId: rawDataSchema.id,
        tenantId: this.tenant
      });

      const dynamicCmd: CreateDynamicEntityDto = {
        appId: this.appId,
        tenantId: this.tenant,
        areaType,
        schemaId: schema.id,
        fields: [
          <ListOfLinkFieldValueDto>{ id: 'rawDataIds', type: FieldTypeIds.ListOfLinksField, value: [rawDataEntityOperation.targetId] }
        ]
      };

      const operation = await this.dynamicEntitiesService.create(dynamicCmd);
      const operationStatusEnum: OperationStatus = OperationStatus[operation.status.toString()];

      if (operationStatusEnum === OperationStatus.Success) {
        const result = await this.dynamicEntitiesService.getById(this.tenant, operation.targetId, schema.id, areaType);

        if (result && result.fields.filter((x) => x.id == 'rawDataIds')[0].value == rawDataEntityOperation.targetId) {
          isSuccess = true;
          await this.dynamicEntitiesService.deleteById(this.tenant, operation.targetId, schema.id, areaType);
          await this.schemasService.deleteById(schema.id, this.tenant, areaType);
        }
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Get';

      console.warn('get failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async delete(areaType: AreaTypeEnum): Promise<TestResult> {
    let isSuccess = false;

    try {
      const schema = await this.schemaHelper.createSchema(this.tenant, 'mySchema321', areaType, [], []);

      const dynamicCmd: CreateDynamicEntityDto = {
        appId: this.appId,
        tenantId: this.tenant,
        areaType,
        schemaId: schema.id,
        fields: []
      };

      const operation = await this.dynamicEntitiesService.create(dynamicCmd);
      const operationStatusEnum: OperationStatus = OperationStatus[operation.status.toString()];

      if (operationStatusEnum === OperationStatus.Success) {
        const deleteOperation = await this.dynamicEntitiesService.deleteById(this.tenant, operation.targetId, schema.id, areaType);
        const deleteOperationStatusEnum: OperationStatus = OperationStatus[deleteOperation.status.toString()];

        if (deleteOperationStatusEnum === OperationStatus.Success) {
          isSuccess = true;
          await this.schemasService.deleteById(schema.id, this.tenant, areaType);
        }
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Get many';
      console.warn('delete failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async update(areaType: AreaTypeEnum): Promise<TestResult> {
    let isSuccess = false;

    try {
      const schema = await this.schemaHelper.createCaseSchema(this.tenant, 'mySchema321', areaType, [], []);

      const dynamicCmd: CreateDynamicEntityDto = {
        appId: this.appId,
        tenantId: this.tenant,
        areaType,
        schemaId: schema.id,
        fields: []
      };

      const createOperation = await this.dynamicEntitiesService.create(dynamicCmd);
      const createOperationStatusEnum: OperationStatus = OperationStatus[createOperation.status.toString()];

      if (createOperationStatusEnum === OperationStatus.Success) {
        const intTenantField = await this.tenantFieldsHelper.createTenantField(
          this.tenant,
          FieldTypeIds.IntField,
          [areaType],
          'intFieldCreate',
          'intFieldCreate',
          []
        );
        const fields = await this.schemaHelper.createSchemaFields([intTenantField]);

        const updateSchemaCmd: UpdateSchemaCommand = {
          id: schema.id,
          newTemplate: {
            id: undefined,
            name: 'create',
            status: CaseStatus.Open,
            areaType: areaType,
            tenantId: this.tenant,
            functions: [],
            fields: fields
          }
        };
        await this.schemasService.update(updateSchemaCmd, this.tenant, areaType);

        const updateDynamicCmd: UpdateDynamicEntityDto = {
          ...dynamicCmd,
          fields: [
            {
              id: intTenantField.fieldName,
              type: intTenantField.type,
              value: 11
            }
          ],
          publicId: createOperation.targetId
        };

        const updateOperation = await this.dynamicEntitiesService.update(updateDynamicCmd);
        const updateOperationStatusEnum: OperationStatus = OperationStatus[updateOperation.status.toString()];

        if (updateOperationStatusEnum === OperationStatus.Success) {
          const updatedDynamicEntity = await this.dynamicEntitiesService.getById(
            this.tenant,
            createOperation.targetId,
            schema.id,
            areaType
          );

          if (updatedDynamicEntity.fields.length > 0) {
            isSuccess = true;
            await this.dynamicEntitiesService.deleteById(this.tenant, createOperation.targetId, schema.id, areaType);
            await this.schemasService.deleteById(schema.id, this.tenant, areaType);
          }
        }
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Delete';

      console.warn('update failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async search(areaType: AreaTypeEnum): Promise<TestResult> {
    let isSuccess = false;

    try {
      const schema = await this.schemaHelper.createCaseSchema(this.tenant, 'mySchema321', areaType, [], []);

      const dynamicCmd: CreateDynamicEntityDto = {
        appId: this.appId,
        tenantId: this.tenant,
        areaType,
        schemaId: schema.id,
        fields: []
      };

      const operation = await this.dynamicEntitiesService.create(dynamicCmd);
      const operationStatusEnum: OperationStatus = OperationStatus[operation.status.toString()];

      if (operationStatusEnum === OperationStatus.Success) {
        const result = await this.dynamicEntitiesService.search(areaType, this.tenant, schema.id);

        if (result.total > 0) {
          isSuccess = true;
          await this.dynamicEntitiesService.deleteById(this.tenant, operation.targetId, schema.id, areaType);
          await this.schemasService.deleteById(schema.id, this.tenant, areaType);
        }
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Update';

      console.warn('search failed error', { error });
      isSuccess = false;
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async getMany(areaType: AreaTypeEnum): Promise<TestResult> {
    let isSuccess = false;

    try {
      const schema = await this.schemaHelper.createSchema(this.tenant, 'mySchema321', areaType, [], []);
      const dynamicCmd: CreateDynamicEntityDto = {
        appId: this.appId,
        tenantId: this.tenant,
        areaType,
        schemaId: schema.id,
        fields: []
      };

      const dynamicEntityOperationFirst = await this.dynamicEntitiesService.create(dynamicCmd);
      const dynamicEntityOperationSecond = await this.dynamicEntitiesService.create(dynamicCmd);

      const operationStatusEnumFirst: OperationStatus = OperationStatus[dynamicEntityOperationFirst.status.toString()];
      const operationStatusEnumSecond: OperationStatus = OperationStatus[dynamicEntityOperationSecond.status.toString()];

      if (operationStatusEnumFirst === OperationStatus.Success && operationStatusEnumSecond === OperationStatus.Success) {
        const ids: string[] = [dynamicEntityOperationFirst, dynamicEntityOperationSecond].map((x) => x.targetId);

        const result = await this.dynamicEntitiesService.getMany(this.tenant, areaType, schema.id, ids);

        if (result.total === 2) {
          isSuccess = true;
          await this.dynamicEntitiesService.deleteById(this.tenant, ids[0], schema.id, areaType);
          await this.dynamicEntitiesService.deleteById(this.tenant, ids[1], schema.id, areaType);
          await this.schemasService.deleteById(schema.id, this.tenant, areaType);
        }
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Search';

      console.warn('get failed error', { error });
      isSuccess = false;
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }
}
