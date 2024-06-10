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
import { MappingsTestsComponent } from './mappings-tests.component';
import {
  CreateMappingsTestService,
  GetMappingsTestService,
  SupplierMappingsCaseTestService,
  SupplierMappingsFilterTestService,
  SupplierMappingsRawDataTestService
} from './mappings-tests.service';

/**
 * local
 */

@NgModule({
  declarations: [MappingsTestsComponent],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: MappingsTestsComponent,
        pathMatch: 'full'
      }
    ]),

    ServiceLayerModule,
    TestUiModule
  ],
  providers: [
    CreateMappingsTestService,
    GetMappingsTestService,
    SupplierMappingsRawDataTestService,
    SupplierMappingsCaseTestService,
    SupplierMappingsFilterTestService
  ],
  exports: [RouterModule, MappingsTestsComponent]
})
export class MappingsTestsModule {}
