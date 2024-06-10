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
import { ListsTestsComponent } from './lists-tests.component';

@NgModule({
  declarations: [ListsTestsComponent],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: ListsTestsComponent,
        pathMatch: 'full'
      }
    ]),

    ServiceLayerModule,
    TestUiModule
  ],
  exports: [RouterModule, ListsTestsComponent]
})
export class ListsTestsModule {}
