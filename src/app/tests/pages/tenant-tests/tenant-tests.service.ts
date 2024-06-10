import { Injectable } from '@angular/core';
import {
  CompanyService,
  CopyTenantSettingsModel,
  CreateTenantModel,
  FieldTypeIds,
  IFilter,
  OperationStatus,
  Paging,
  SortDirection,
  Sorting,
  Tenant,
  TenantsService
} from '@wfm/service-layer';
import { TestResult } from '@wfm/tests/models';
import { ITestService, TestContext } from '../app-tests/create-app-test.service';
import { random } from 'lodash-core';
import { SearchType } from '@wfm/service-layer/models/dynamic-entity-models';
import { GDCInvitationsTemplate } from '@wfm/notification-templates/gdc-invitation-template-file';

export class TenantTestsService implements ITestService {
  protected ctx: TestContext;
  protected testTenantId: string;

  constructor(protected tenantService: TenantsService, protected companyService: CompanyService) {}

  async initialize(ctx: TestContext): Promise<void> {
    this.ctx = ctx;

    const company = await this.companyService.create({
      email: 'gergana.naydenova@cargoclix.com',
      // email: 'nikolay.borisov@cargoclix.com',
      name: `mytestcomp-${new Date().getTime()}`,
      address: '123',
      city: '123',
      contactPersonId: null,
      country: '123',
      id: '123',
      notes: '123',
      number: '123',
      phone: '123',
      publicId: '123',
      vatNr: '123',
      zip: '123'
    });

    const createTenantModel: CreateTenantModel = {
      name: `createTest${random(0, 100)}`,
      appPublicId: this.ctx.appId,
      companyId: company.id,
      invitationTemplate: GDCInvitationsTemplate,
      timeZone: 'Europe/Berlin'
    };

    const tenant = await this.tenantService.create(createTenantModel);

    this.testTenantId = tenant.id;
  }
  async test(): Promise<TestResult> {
    throw new Error('Method not implemented.');
  }
  async cleanup(): Promise<void> {
    await this.tenantService.deleteById(this.testTenantId);
  }
}

@Injectable()
export class CreateTenantTestService extends TenantTestsService {
  constructor(tenantService: TenantsService, companyService: CompanyService) {
    super(tenantService, companyService);
  }

  async test(): Promise<TestResult> {
    const result = await this.tenantService.getById(this.testTenantId);

    if (result) {
      return TestResult.success();
    }

    return TestResult.failure('Test Failed');
  }
}

@Injectable()
export class UpdateTenantTestService extends TenantTestsService {
  constructor(tenantService: TenantsService, companyService: CompanyService) {
    super(tenantService, companyService);
  }

  async test(): Promise<TestResult> {
    const updateTenantModel: Tenant = {
      name: `updateTest${random(0, 100)}`,
      appPublicId: this.ctx.appId,
      id: this.testTenantId,
      timeZone: 'Europe/Berlin'
    };

    const updateOperation = await this.tenantService.update(updateTenantModel);

    if (updateOperation.name === updateTenantModel.name) {
      return TestResult.success();
    }

    return TestResult.failure('Test failed');
  }
}

@Injectable()
export class GetTenantByIdTestService extends TenantTestsService {
  constructor(tenantService: TenantsService, companyService: CompanyService) {
    super(tenantService, companyService);
  }
  async test(): Promise<TestResult> {
    const result = await this.tenantService.getById(this.testTenantId);

    if (result) {
      return TestResult.success();
    }

    return TestResult.failure('Test Failed');
  }
}

@Injectable()
export class DeleteTenantByIdTestService extends TenantTestsService {
  constructor(tenantService: TenantsService, companyService: CompanyService) {
    super(tenantService, companyService);
  }
  async test(): Promise<TestResult> {
    const deleteOperation = await this.tenantService.deleteById(this.testTenantId);

    const currentResult = deleteOperation.status.toString().toLowerCase();
    const expectedResult = 'success';

    if (currentResult === expectedResult) {
      return TestResult.success();
    }

    return TestResult.failure('Test failed');
  }

  async cleanup(): Promise<void> {}
}

@Injectable()
export class GetAllTenantsTestService implements ITestService {
  constructor(private tenantService: TenantsService) {}
  async initialize(ctx: TestContext): Promise<void> {}
  async test(): Promise<TestResult> {
    const result = await this.tenantService.search();

    if (result.items.length) {
      return TestResult.success();
    }

    return TestResult.failure('Test failed');
  }

  async cleanup(): Promise<void> {}
}

@Injectable()
export class SearchWithPagingTestService implements ITestService {
  constructor(private tenantService: TenantsService) {}

  async initialize(ctx: TestContext): Promise<void> {}
  async test(): Promise<TestResult> {
    const paging: Paging = {
      skip: 0,
      take: 5
    };

    const result = await this.tenantService.search(paging);
    const expectedResult = 5;

    if (result.items.length === expectedResult) {
      return TestResult.success();
    }

    return TestResult.failure('Test failed');
  }
  async cleanup(): Promise<void> {}
}

@Injectable()
export class SearchWithSortingTestService implements ITestService {
  constructor(private tenantService: TenantsService) {}

  async initialize(ctx: TestContext): Promise<void> {}
  async test(): Promise<TestResult> {
    const sorting: Sorting = {
      sort: SortDirection.desc,
      propertyName: 'name'
    };

    const result = await this.tenantService.search(<Paging>{ skip: 0, take: 25 }, [sorting]);
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
      return TestResult.success();
    }

    return TestResult.failure('Test failed');
  }
  async cleanup(): Promise<void> {}
}

@Injectable()
export class SearchWithFilterTestService implements ITestService {
  constructor(private tenantService: TenantsService) {}

  async initialize(ctx: TestContext): Promise<void> {}
  async test(): Promise<TestResult> {
    const filters: IFilter = {
      fieldName: 'name',
      searchType: SearchType.Like,
      value: 'Dr. Meier & Schmidt',
      valueType: FieldTypeIds.StringField
    };

    const result = await this.tenantService.search(<Paging>{ skip: 0, take: 25 }, null, [filters]);
    const expectedResult = 1;

    if (result.items.length === expectedResult) {
      return TestResult.success();
    }
    return TestResult.failure('Test failed');
  }
  async cleanup(): Promise<void> {}
}

@Injectable()
export class CopyTenantSettingsTestService extends TenantTestsService {
  constructor(tenantService: TenantsService, companyService: CompanyService) {
    super(tenantService, companyService);
  }

  async test(): Promise<TestResult> {
    const tenantModel = <CopyTenantSettingsModel>{
      oldTenantId: this.ctx.tenantId,
      newTenantId: this.testTenantId,
      invitationTemplate: GDCInvitationsTemplate
    };
    await this.tenantService.copySettingsFromTenant(tenantModel);
    return TestResult.success();
  }
}
