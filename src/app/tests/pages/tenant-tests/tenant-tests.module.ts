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
import { TenantTestsComponent } from './tenant-tests.component';
import {
  CopyTenantSettingsTestService,
  CreateTenantTestService,
  DeleteTenantByIdTestService,
  GetTenantByIdTestService,
  SearchWithFilterTestService,
  SearchWithPagingTestService,
  SearchWithSortingTestService,
  UpdateTenantTestService
} from './tenant-tests.service';

@NgModule({
  declarations: [TenantTestsComponent],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: TenantTestsComponent,
        pathMatch: 'full'
      }
    ]),
    ServiceLayerModule,
    TestUiModule
  ],
  providers: [
    CopyTenantSettingsTestService,
    SearchWithFilterTestService,
    SearchWithPagingTestService,
    SearchWithSortingTestService,
    GetTenantByIdTestService,
    DeleteTenantByIdTestService,
    UpdateTenantTestService,
    CreateTenantTestService
  ],
  exports: [RouterModule, TenantTestsComponent]
})
export class TenantTestsModule {}
