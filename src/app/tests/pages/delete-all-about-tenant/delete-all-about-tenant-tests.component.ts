/**
 * global
 */
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';

/**
 * local
 */
import { Test, TestResult } from '@tests/models';
import { Paging, WorkflowService } from '@wfm/service-layer';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { TestUiPageComponent } from '@wfm/tests/modules/test-ui/test-ui-page/test-ui-page.component';

@Component({
  selector: 'app-delete-all-about-tenant',
  template: '<app-test-ui-page #test></app-test-ui-page>'
})
export class DeleteAllAboutTenantComponent extends TenantComponent implements AfterViewInit {
  @ViewChild('test') testsComp: TestUiPageComponent;

  title: string = 'App tests';

  constructor(store: Store<any>, private workflowsService: WorkflowService) {
    super(store);
  }

  ngAfterViewInit(): void {
    this.testsComp.init(this.title, [
      <Test>{
        name: 'Remove all Workflow Schemas by current tenant id',
        function: async () => await this.deleteWorkflowSchemasByCurrentTenant()
      }
    ]);
  }

  private async deleteWorkflowSchemasByCurrentTenant(): Promise<TestResult> {
    let isSuccess = false;

    try {
      let result = await this.workflowsService.search(this.tenant, <Paging>{ skip: 0, take: 999999 });

      result.items.forEach(async (element) => {
        await this.workflowsService.delete(element.id, this.tenant);
      });

      result = await this.workflowsService.search(this.tenant, <Paging>{ skip: 0, take: 999999 });

      if (result.total === 0) {
        isSuccess = true;
      }
    } catch (error) {
      error.failedTest = this.title + ' ' + 'Remove all workflow schemas by current tenant id';
      console.warn('create failed error', { error });

      return TestResult.failure(error.failedTest);
    }

    return isSuccess ? TestResult.success() : TestResult.failure('Test Failed');
  }
}
