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
import { ValidatorsTestsComponent } from './validators-tests.component';

@NgModule({
  declarations: [ValidatorsTestsComponent],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: ValidatorsTestsComponent,
        pathMatch: 'full'
      }
    ]),
    ServiceLayerModule,
    TestUiModule
  ],
  exports: [RouterModule, ValidatorsTestsComponent]
})
export class ValidatorsTestsModule {}
