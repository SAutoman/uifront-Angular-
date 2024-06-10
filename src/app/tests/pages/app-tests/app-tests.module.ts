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
import { AppTestsComponent } from './app-tests.component';

@NgModule({
  declarations: [AppTestsComponent],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: AppTestsComponent,
        pathMatch: 'full'
      }
    ]),
    ServiceLayerModule,
    TestUiModule
  ],
  exports: [RouterModule, AppTestsComponent]
})
export class AppTestsModule {}
