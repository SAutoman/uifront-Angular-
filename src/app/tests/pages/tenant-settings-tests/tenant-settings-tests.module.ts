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
import { TenantSettingsComponent } from './tenant-settings-tests.components';

@NgModule({
  declarations: [TenantSettingsComponent],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: TenantSettingsComponent,
        pathMatch: 'full'
      }
    ]),
    ServiceLayerModule,
    TestUiModule
  ],
  exports: [RouterModule, TenantSettingsComponent]
})
export class TenantSettingsModule {}
