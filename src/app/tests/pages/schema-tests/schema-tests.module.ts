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
import { SchemaTestsComponent } from './schema-tests.components';

@NgModule({
  declarations: [SchemaTestsComponent],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: SchemaTestsComponent,
        pathMatch: 'full'
      }
    ]),

    ServiceLayerModule,
    TestUiModule
  ],
  exports: [RouterModule, SchemaTestsComponent]
})
export class SchemaTestsModule {}
