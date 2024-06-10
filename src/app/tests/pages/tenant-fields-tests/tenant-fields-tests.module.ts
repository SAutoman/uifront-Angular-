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
import { TenantFieldsTestsComponent } from './tenant-fields-tests.component';

@NgModule({
  declarations: [TenantFieldsTestsComponent],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: TenantFieldsTestsComponent,
        pathMatch: 'full'
      }
    ]),

    ServiceLayerModule,
    TestUiModule
  ],
  exports: [RouterModule, TenantFieldsTestsComponent]
})
export class TenantFieldsTestsModule {}
