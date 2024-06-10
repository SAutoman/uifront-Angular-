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
import { DataSeedComponent } from './data-seed.component';

/**
 * local
 */

@NgModule({
  declarations: [DataSeedComponent],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: DataSeedComponent,
        pathMatch: 'full'
      }
    ]),

    ServiceLayerModule,
    TestUiModule
  ],
  exports: [RouterModule]
})
export class DataSeedModule {}
