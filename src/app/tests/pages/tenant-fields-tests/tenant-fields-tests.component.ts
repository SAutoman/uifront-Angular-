/**
 * global
 */
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { KeyValue } from '@angular/common';

/**
 * project
 */
import {
  FieldTypeIds,
  AreaTypeEnum,
  ValidatorType,
  ICreateTenantFieldDto,
  IUpdateTenantFieldDto,
  IMinMaxValidatorDto,
  IRequiredValidatorDto,
  IFilter,
  IFieldBaseDto,
  AdminTenantFieldsService,
  Paging,
  Sorting,
  OperationStatus
} from '@wfm/service-layer';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { environment } from '@src/environments/environment.base';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { SearchType } from '@wfm/service-layer/models/dynamic-entity-models';
import { TestUiPageComponent } from '@wfm/tests/modules/test-ui/test-ui-page/test-ui-page.component';
import { Test, TestResult } from '@wfm/tests/models';

@Component({
  selector: 'tenant-fields-tests',
  template: '<app-test-ui-page #test></app-test-ui-page>'
})
export class TenantFieldsTestsComponent extends TenantComponent implements AfterViewInit {
  @ViewChild('test') testsComp: TestUiPageComponent;

  title = 'Tenant fields tests';
  appId: string = environment.appId;

  constructor(private tenantFieldsService: AdminTenantFieldsService, store: Store<ApplicationState>) {
    super(store);
  }

  ngAfterViewInit(): void {
    this.testsComp.init(this.title, [
      <Test>{
        name: 'CREATE - int',
        function: async () => await this.create(FieldTypeIds.IntField, [])
      },
      <Test>{
        name: 'CREATE - string',
        function: async () => await this.create(FieldTypeIds.StringField, [])
      },
      <Test>{
        name: 'CREATE - decimal',
        function: async () => await this.create(FieldTypeIds.DecimalField, [])
      },
      <Test>{
        name: 'CREATE - bool',
        function: async () => await this.create(FieldTypeIds.BoolField, [])
      },
      <Test>{
        name: 'CREATE - list',
        function: async () => await this.create(FieldTypeIds.ListField, [])
      },
      <Test>{
        name: 'CREATE - multiselect list',
        function: async () => await this.create(FieldTypeIds.MultiselectListField, [])
      },
      <Test>{
        name: 'CREATE - date',
        function: async () => await this.create(FieldTypeIds.DateField, [])
      },
      <Test>{
        name: 'CREATE - file',
        function: async () => await this.create(FieldTypeIds.FileField, [])
      },
      <Test>{
        name: 'CREATE - text area',
        function: async () => await this.create(FieldTypeIds.TextareaField, [])
      },
      <Test>{
        name: 'CREATE - datetime',
        function: async () => await this.create(FieldTypeIds.DateTimeField, [])
      },
      <Test>{
        name: 'CREATE - validator - Required',
        function: async () =>
          await this.create(FieldTypeIds.StringField, [
            {
              key: ValidatorType.Required,
              value: {
                required: true
              }
            }
          ])
      },
      <Test>{
        name: 'UPDATE - updating name',
        function: async () => await this.update(FieldTypeIds.StringField, [])
      },
      <Test>{
        name: 'GET - by id',
        function: async () => await this.getById(FieldTypeIds.StringField, [])
      },
      <Test>{
        name: 'GET - by area type',
        function: async () => await this.getByAreaType(FieldTypeIds.StringField, [])
      },
      <Test>{
        name: 'DELETE - by id',
        function: async () => await this.deleteById(FieldTypeIds.StringField, [])
      },
      <Test>{
        name: 'SEARCH - with filter',
        function: async () => await this.searchWithFilters()
      },
      <Test>{
        name: 'SEARCH - with sorting',
        function: async () => await this.searchFieldsWithSorting()
      },
      <Test>{
        name: 'SEARCH - with paging',
        function: async () => await this.searchFieldsWithPaging()
      },
      <Test>{
        name: 'GET - fields types',
        function: async () => await this.getFieldsTypes()
      },
      <Test>{
        name: 'UPDATE - several fields',
        function: async () => await this.updateTenantFields()
      }
    ]);
  }

  private async create(type: FieldTypeIds, validators: KeyValue<ValidatorType, any>[]): Promise<TestResult> {
    let isSuccess = false;

    try {
      const cmd: ICreateTenantFieldDto = {
        id: undefined,
        tenantId: this.tenant,
        type: type,
        areaTypes: [AreaTypeEnum.rawData, AreaTypeEnum.case],
        configuration: {
          position: 0,
          validators: validators
        },
        displayName: `testField${type.toString()}`,
        fieldName: `testField${type.toString()}`,
        isSystem: false
      };

      const operation = await this.tenantFieldsService.create(cmd);
      const operationStatusEnum: OperationStatus = OperationStatus[operation.status.toString()];

      if (operationStatusEnum === OperationStatus.Success) {
        const result = await this.tenantFieldsService.getById(this.tenant, operation.targetId);
        if (result.fieldName === cmd.fieldName) {
          isSuccess = true;
          await this.tenantFieldsService.deleteById(operation.targetId, this.tenant);
        }
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Create - ' + type.toString();
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async update(type: FieldTypeIds, validators: KeyValue<ValidatorType, any>[]): Promise<TestResult> {
    let isSuccess = false;

    try {
      const createCmd: ICreateTenantFieldDto = {
        id: undefined,
        tenantId: this.tenant,
        configuration: {
          position: 1,
          validators: validators
        },
        displayName: 'update',
        fieldName: 'update',
        areaTypes: [AreaTypeEnum.rawData, AreaTypeEnum.case],
        isSystem: false,
        type: type
      };

      const createOperation = await this.tenantFieldsService.create(createCmd);
      const createOperationStatusEnum: OperationStatus = OperationStatus[createOperation.status.toString()];

      if (createOperationStatusEnum === OperationStatus.Success) {
        const updateCmd: IUpdateTenantFieldDto = {
          targetId: createOperation.targetId,
          tenantId: this.tenant,
          newField: {
            ...createCmd,
            fieldName: 'updateShouldWork',
            displayName: 'updateShouldWork'
          }
        };

        const updateOperation = await this.tenantFieldsService.update(updateCmd);
        const updateOperationStatusEnum: OperationStatus = OperationStatus[updateOperation.status.toString()];

        if (updateOperationStatusEnum === OperationStatus.Success) {
          const result = await this.tenantFieldsService.getById(this.tenant, updateOperation.targetId);
          if (result.fieldName === updateCmd.newField.fieldName) {
            isSuccess = true;
            await this.tenantFieldsService.deleteById(createOperation.targetId, this.tenant);
          }
        }
      }

      await this.tenantFieldsService.deleteById(createOperation.targetId, this.tenant);
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Update - updating name';
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async getById(type: FieldTypeIds, validators: KeyValue<ValidatorType, any>[]): Promise<TestResult> {
    let isSuccess = false;

    try {
      const cmd: ICreateTenantFieldDto = {
        id: undefined,
        tenantId: this.tenant,
        configuration: {
          position: 1,
          validators: validators
        },
        displayName: 'getById',
        fieldName: 'getById',
        areaTypes: [AreaTypeEnum.rawData, AreaTypeEnum.case],
        isSystem: false,
        type: type
      };

      const operation = await this.tenantFieldsService.create(cmd);
      const operationStatusEnum: OperationStatus = OperationStatus[operation.status.toString()];

      if (operationStatusEnum === OperationStatus.Success) {
        const result = await this.tenantFieldsService.getById(this.tenant, operation.targetId);
        if (result.fieldName === cmd.fieldName) {
          isSuccess = true;
          await this.tenantFieldsService.deleteById(operation.targetId, this.tenant);
        }
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Get by id';
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async deleteById(type: FieldTypeIds, validators: KeyValue<ValidatorType, any>[]): Promise<TestResult> {
    let isSuccess = false;

    try {
      const cmd: ICreateTenantFieldDto = {
        id: undefined,
        tenantId: this.tenant,
        configuration: {
          position: 1,
          validators: validators
        },
        displayName: 'deleteById',
        fieldName: 'deleteById',
        areaTypes: [AreaTypeEnum.rawData, AreaTypeEnum.case],
        isSystem: false,
        type: type
      };

      const operation = await this.tenantFieldsService.create(cmd);
      const operationStatusEnum: OperationStatus = OperationStatus[operation.status.toString()];

      if (operationStatusEnum === OperationStatus.Success) {
        const deleteOperation = await this.tenantFieldsService.deleteById(operation.targetId, this.tenant);
        const deleteOperationStatusEnum: OperationStatus = OperationStatus[deleteOperation.status.toString()];

        if (deleteOperationStatusEnum === OperationStatus.Success) {
          isSuccess = true;
        }
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Delete by id';
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async getByAreaType(type: FieldTypeIds, validators: KeyValue<ValidatorType, any>[]): Promise<TestResult> {
    let isSuccess = false;

    try {
      const cmd: ICreateTenantFieldDto = {
        id: undefined,
        tenantId: this.tenant,
        configuration: {
          position: 1,
          validators: validators
        },
        displayName: 'getByAreaType',
        fieldName: 'getByAreaType',
        areaTypes: [AreaTypeEnum.rawData, AreaTypeEnum.case],
        isSystem: false,
        type: type
      };

      const createOperation = await this.tenantFieldsService.create(cmd);
      const fieldsByUsage = await this.tenantFieldsService.getFieldsByAreaType(this.tenant, AreaTypeEnum.rawData);

      if (fieldsByUsage.total > 0) {
        isSuccess = true;
        await this.tenantFieldsService.deleteById(createOperation.targetId, this.tenant);
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Get by area type';
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async searchWithFilters(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const cmd: ICreateTenantFieldDto = {
        id: undefined,
        tenantId: this.tenant,
        configuration: {
          position: 1,
          validators: [
            {
              key: ValidatorType.MinMax,
              value: <IMinMaxValidatorDto<number>>{
                fieldType: 1,
                max: 15,
                min: 10
              }
            },
            {
              key: ValidatorType.Required,
              value: <IRequiredValidatorDto>{
                required: true
              }
            }
          ]
        },
        displayName: 'testNameSearch',
        fieldName: 'testNameSearch',
        areaTypes: [AreaTypeEnum.all],
        isSystem: false,
        type: FieldTypeIds.IntField
      };
      const operation = await this.tenantFieldsService.create(cmd);

      const filters: IFilter[] = [
        {
          valueType: FieldTypeIds.StringField,
          searchType: SearchType.Like,
          fieldName: 'testNameSearch'
        }
      ];
      const result = await this.tenantFieldsService.search(this.tenant, null, null, filters);
      const operationStatusEnum: OperationStatus = OperationStatus[operation.status.toString()];

      if (operationStatusEnum === OperationStatus.Success) {
        if ((result.total = 1)) {
          isSuccess = true;
          await this.tenantFieldsService.deleteById(operation.targetId, this.tenant);
        }
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Search with filters';
      console.warn('search failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async searchFieldsWithSorting(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const sorting: Sorting = {
        propertyName: 'fieldName',
        sort: 1
      };

      const result = await this.tenantFieldsService.search(this.tenant, null, [sorting], []);
      const sortedArray = result.items.sort((n1, n2) => {
        if (n1.name > n2.name) {
          return 1;
        }

        if (n1.name < n2.name) {
          return -1;
        }

        return 0;
      });

      if (sortedArray[0].name === result.items[0].name) {
        isSuccess = true;
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Search with sorting';
      console.warn('search failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async searchFieldsWithPaging(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const paging: Paging = {
        skip: 0,
        take: 5
      };

      const result = await this.tenantFieldsService.search(this.tenant, paging, null, []);

      if ((result.total = paging.take)) {
        isSuccess = true;
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Search with paging';
      console.warn('search failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async getFieldsTypes(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const result = await this.tenantFieldsService.getFieldsTypes(this.tenant);

      if (result.length === 15) {
        isSuccess = true;
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Get fields types';
      console.warn('search failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async updateTenantFields(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const createCmdFirst: ICreateTenantFieldDto = {
        id: undefined,
        tenantId: this.tenant,
        configuration: {
          position: 1,
          validators: [
            {
              key: ValidatorType.MinMax,
              value: <IMinMaxValidatorDto<number>>{
                fieldType: 1,
                max: 15,
                min: 10
              }
            },
            {
              key: ValidatorType.Required,
              value: <IRequiredValidatorDto>{
                required: true
              }
            }
          ]
        },
        displayName: 'testNameUpdateFirst',
        fieldName: 'testNameUpdateFirst',
        areaTypes: [AreaTypeEnum.rawData],
        isSystem: false,
        type: FieldTypeIds.IntField
      };

      const createCmdSecond: ICreateTenantFieldDto = {
        id: undefined,
        tenantId: this.tenant,
        configuration: {
          position: 2,
          validators: [
            {
              key: ValidatorType.MinMax,
              value: <IMinMaxValidatorDto<number>>{
                fieldType: 1,
                max: 15,
                min: 10
              }
            },
            {
              key: ValidatorType.Required,
              value: <IRequiredValidatorDto>{
                required: true
              }
            }
          ]
        },
        displayName: 'testNameUpdateSecond',
        fieldName: 'testNameUpdateSecond',
        areaTypes: [AreaTypeEnum.case],
        isSystem: false,
        type: FieldTypeIds.IntField
      };

      const createOperationFirst = await this.tenantFieldsService.create(createCmdFirst);
      const createOperationSecond = await this.tenantFieldsService.create(createCmdSecond);

      const operationStatusEnumFirst: OperationStatus = OperationStatus[createOperationFirst.status.toString()];
      const operationStatusEnumSecond: OperationStatus = OperationStatus[createOperationSecond.status.toString()];

      if (operationStatusEnumFirst === OperationStatus.Success && operationStatusEnumSecond === OperationStatus.Success) {
        const newFieldFirst: IFieldBaseDto = {
          ...createCmdFirst,
          fieldName: 'updateFirstFieldShouldWork',
          displayName: 'updateFirstFieldShouldWork'
        };

        const updateCmdFirst: IUpdateTenantFieldDto = {
          targetId: createOperationFirst.targetId,
          tenantId: this.tenant,
          newField: newFieldFirst
        };

        const newFieldSecond: IFieldBaseDto = {
          ...createCmdSecond,
          fieldName: 'updateSecondFieldShouldWork',
          displayName: 'updateSecondFieldShouldWork'
        };

        const updateCmdSecond: IUpdateTenantFieldDto = {
          targetId: createOperationSecond.targetId,
          tenantId: this.tenant,
          newField: newFieldSecond
        };

        const updateFields: IUpdateTenantFieldDto[] = [updateCmdFirst, updateCmdSecond];
        const updateOperation = await this.tenantFieldsService.bulkUpdate(this.tenant, updateFields);

        const updateOperationStatusEnum: OperationStatus = OperationStatus[updateOperation.status.toString()];

        if (updateOperationStatusEnum === OperationStatus.Success) {
          isSuccess = true;
          await this.tenantFieldsService.deleteById(createOperationFirst.targetId, this.tenant);
          await this.tenantFieldsService.deleteById(createOperationSecond.targetId, this.tenant);
        }
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Update several fields';
      console.warn('search failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }
}
