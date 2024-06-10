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
import { ExpressionsTestsComponent } from './expressions-tests.components';

@NgModule({
  declarations: [ExpressionsTestsComponent],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: ExpressionsTestsComponent,
        pathMatch: 'full'
      }
    ]),

    ServiceLayerModule,
    TestUiModule
  ],
  exports: [RouterModule, ExpressionsTestsComponent]
})
export class ExpressionsTestsModule {}
