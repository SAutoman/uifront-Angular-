/**
 * global
 */
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';

/**
 * project
 */
import { TenantSettingsService } from '@wfm/service-layer/services/tenant-settings.service';
import { CreateTenantSettings, TenantSettingsDto } from '@wfm/service-layer/models/tenant-settings';

/**
 * local
 */
import { Test, TestResult } from '@tests/models';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { Store } from '@ngrx/store';
import { Settings } from '@wfm/service-layer/models/user-settings';
import { LikeFilter, SearchType } from '@wfm/service-layer/models/dynamic-entity-models';
import { FieldTypeIds, OperationStatus, Paging } from '@wfm/service-layer';
import { TestUiPageComponent } from '@wfm/tests/modules/test-ui/test-ui-page/test-ui-page.component';

@Component({
  selector: 'tenant-settings-tests',
  template: '<app-test-ui-page #test></app-test-ui-page>'
})
export class TenantSettingsComponent extends TenantComponent implements AfterViewInit {
  @ViewChild('test') testsComp: TestUiPageComponent;

  title: string = 'Tenant settings tests';

  constructor(store: Store<ApplicationState>, private tenantSettingsService: TenantSettingsService) {
    super(store);
  }

  ngAfterViewInit(): void {
    this.testsComp.init(this.title, [
      <Test>{
        name: 'Create',
        function: async () => await this.create()
      },
      <Test>{
        name: 'Update',
        function: async () => await this.update()
      },
      <Test>{
        name: 'Delete',
        function: async () => await this.delete()
      },
      <Test>{
        name: 'Get by tenant',
        function: async () => await this.getByTenant()
      },
      <Test>{
        name: 'Get by id',
        function: async () => await this.getById()
      },
      <Test>{
        name: 'Search',
        function: async () => await this.search()
      }
    ]);
  }

  private async create(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const cmd: CreateTenantSettings = {
        key: 'createSetting',
        tenantId: this.tenant,
        SettingsJson: {
          fieldId: 'someFieldId2',
          setting: {
            details: true,
            overview: true
          }
        }
      };

      const operation = await this.tenantSettingsService.create(cmd);
      const operationStatusEnum: OperationStatus = OperationStatus[operation.status.toString()];

      if (operationStatusEnum === OperationStatus.Success) {
        const result = await this.tenantSettingsService.getById(this.tenant, operation.targetId);
        if (result.value.toString() == cmd.SettingsJson.toString()) {
          isSuccess = true;
          await this.tenantSettingsService.delete(this.tenant, result.id);
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

  // Search with filter Like
  private async search(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const cmd: CreateTenantSettings = {
        key: 'test.Rawdata',
        tenantId: this.tenant,
        SettingsJson: {
          fieldId: 'someFieldId2',
          setting: {
            details: true,
            overview: true
          }
        }
      };
      const cmd2: CreateTenantSettings = {
        key: 'test.Case',
        tenantId: this.tenant,
        SettingsJson: {
          fieldId: 'someFieldId2',
          setting: {
            details: true,
            overview: true
          }
        }
      };

      const operation = await this.tenantSettingsService.create(cmd);
      const operation2 = await this.tenantSettingsService.create(cmd2);

      const paging: Paging = {
        skip: 0,
        take: 15
      };
      const likeFilter: LikeFilter<string> = {
        customSearchType: undefined,
        id: undefined,
        isValid: undefined,
        fieldName: 'Key',
        value: 'test',
        searchType: SearchType.Like,
        valueType: FieldTypeIds.StringField
      };

      const result = await this.tenantSettingsService.search(this.tenant, paging, undefined, [likeFilter]);
      if (result.total >= 2) {
        isSuccess = true;
        await this.tenantSettingsService.delete(this.tenant, operation.targetId);
        await this.tenantSettingsService.delete(this.tenant, operation2.targetId);
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Search';
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async update(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const createCmd: CreateTenantSettings = {
        key: 'updateSetting',
        tenantId: this.tenant,
        SettingsJson: {
          fieldId: 'someFieldId',
          setting: {
            details: true,
            overview: true
          }
        }
      };

      const createOperation = await this.tenantSettingsService.create(createCmd);
      const createResult = await this.tenantSettingsService.getById(this.tenant, createOperation.targetId);

      // update old settings
      const updatedSettings = { ...createResult };
      updatedSettings.value = {
        fieldId: 'updatedFieldId',
        setting: {
          details: true,
          overview: true
        }
      };

      // add new settings
      const newSettings: Settings = {
        key: 'newSettings123',
        value: {
          fieldId: 'newFieldsad',
          setting: {
            details: true,
            overview: true
          }
        },
        fromGroup: undefined,
        fromUser: undefined,
        id: undefined,
        isUnique: false
      };

      const updateCmd: TenantSettingsDto = {
        id: undefined,
        settings: [updatedSettings, newSettings],
        tenantId: this.tenant
      };

      await this.tenantSettingsService.update(updateCmd);

      // Check if update is working
      const result1 = await this.tenantSettingsService.getById(this.tenant, createOperation.targetId);
      if (result1.value.toString() === updatedSettings.value.toString()) {
        const newSetting = (await this.tenantSettingsService.getByTenant(this.tenant)).settings.find((x) => x.key === newSettings.key);
        if (newSetting) {
          isSuccess = true;
          await this.tenantSettingsService.delete(this.tenant, newSetting.id);
          await this.tenantSettingsService.delete(this.tenant, createOperation.targetId);
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

  private async delete(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const cmd: CreateTenantSettings = {
        key: 'deleteSetting',
        tenantId: this.tenant,
        SettingsJson: {
          fieldId: 'someFieldId',
          setting: {
            details: true,
            overview: true
          }
        }
      };

      const operation = await this.tenantSettingsService.create(cmd);
      const result = await this.tenantSettingsService.getById(this.tenant, operation.targetId);
      const deleteOperation = await this.tenantSettingsService.delete(this.tenant, result.id);
      const operationStatusEnum: OperationStatus = OperationStatus[deleteOperation.status.toString()];

      if (operationStatusEnum === OperationStatus.Success) {
        isSuccess = true;
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Delete';
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async getByTenant(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const cmd1: CreateTenantSettings = {
        key: 'getbytenantSetting',
        tenantId: this.tenant,
        SettingsJson: {
          fieldId: 'someFieldId',
          setting: {
            details: true,
            overview: true
          }
        }
      };
      const cmd2: CreateTenantSettings = {
        key: 'getbytenant-test2',
        tenantId: this.tenant,
        SettingsJson: {
          fieldId: 'someFieldId',
          setting: {
            details: true,
            overview: true
          }
        }
      };

      const operation1 = await this.tenantSettingsService.create(cmd1);
      const result1 = await this.tenantSettingsService.getById(this.tenant, operation1.targetId);

      const operation2 = await this.tenantSettingsService.create(cmd2);
      const result2 = await this.tenantSettingsService.getById(this.tenant, operation2.targetId);

      const settings = (await this.tenantSettingsService.getByTenant(this.tenant)).settings;

      if (settings.length > 1) {
        isSuccess = true;
        await this.tenantSettingsService.delete(this.tenant, result1.id);
        await this.tenantSettingsService.delete(this.tenant, result2.id);
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Get by tenant';
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }

  private async getById(): Promise<TestResult> {
    let isSuccess = false;

    try {
      const cmd: CreateTenantSettings = {
        key: 'getbyIdSetting',
        tenantId: this.tenant,
        SettingsJson: {
          fieldId: 'someFieldId',
          setting: {
            details: true,
            overview: true
          }
        }
      };

      const operation = await this.tenantSettingsService.create(cmd);
      const result = await this.tenantSettingsService.getById(this.tenant, operation.targetId);

      if (result) {
        isSuccess = true;
        await this.tenantSettingsService.delete(this.tenant, result.id);
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Get by id';
      console.warn('create failed error', { error });
      isSuccess = false;

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }
}
