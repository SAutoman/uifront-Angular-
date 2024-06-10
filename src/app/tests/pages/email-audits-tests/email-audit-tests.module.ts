/**
 * global
 */
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

/**
 * project
 */
import { TestUiModule } from '@wfm/tests/modules/test-ui/test-ui.module';

import { ServiceLayerModule } from '@wfm/service-layer/service-layer.module';

/**
 * local
 */
import { EmailAuditTestsComponent } from './email-audit-tests.component';
import {
  DeleteAllEmailAuditsOlderThanTestService,
  GetCaseByIdTestService,
  GetCaseEmailAuditCountTestService,
  GetCaseEmailAuditIdsTestService,
  GetCaseEmailAuditsTestService,
  GetCaseEmailAuditTestService,
  GetRawDataByIdTestService,
  GetRawDataEmailAuditCountTestService,
  GetRawDataEmailAuditIdsTestService,
  GetRawDataEmailAuditsTestService,
  GetRawDataEmailAuditTestService,
  SearchCaseTestService,
  SearchRawDataTestService
} from './email-audits-test.service';

@NgModule({
  declarations: [EmailAuditTestsComponent],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: EmailAuditTestsComponent,
        pathMatch: 'full'
      }
    ]),
    ServiceLayerModule,
    TestUiModule
  ],
  exports: [RouterModule, EmailAuditTestsComponent],
  providers: [
    GetRawDataEmailAuditIdsTestService,
    GetRawDataEmailAuditTestService,
    GetRawDataEmailAuditCountTestService,
    GetCaseEmailAuditIdsTestService,
    GetCaseEmailAuditTestService,
    GetCaseEmailAuditCountTestService,
    SearchRawDataTestService,
    GetRawDataByIdTestService,
    SearchCaseTestService,
    GetCaseByIdTestService,
    GetCaseEmailAuditsTestService,
    GetRawDataEmailAuditsTestService,
    DeleteAllEmailAuditsOlderThanTestService
  ]
})
export class EmailAuditTestsModule {}
