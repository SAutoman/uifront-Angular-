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
import { DeleteAllAboutTenantComponent } from './delete-all-about-tenant-tests.component';

@NgModule({
  declarations: [DeleteAllAboutTenantComponent],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: DeleteAllAboutTenantComponent,
        pathMatch: 'full'
      }
    ]),

    ServiceLayerModule,
    TestUiModule
  ],
  exports: [RouterModule, DeleteAllAboutTenantComponent]
})
export class DeleteAllAboutTenantTestsModule {}
