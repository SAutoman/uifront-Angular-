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
import { DynamicEntityTestsComponent } from './dynamic-entity-tests.components';

@NgModule({
  declarations: [DynamicEntityTestsComponent],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: DynamicEntityTestsComponent,
        pathMatch: 'full'
      }
    ]),

    ServiceLayerModule,
    TestUiModule
  ],
  exports: [RouterModule, DynamicEntityTestsComponent]
})
export class DynamicEntityTestsModule {}
