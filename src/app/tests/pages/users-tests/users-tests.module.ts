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
import { UsersTestsComponent } from './users-tests.component';
import {
  CreateUserTestService,
  DeactivateUserTestService,
  GetDeactivatedUsersTestService,
  InviteSupplierTestService,
  InviteTenantAdminTestService,
  ReactivateUserTestService,
  UnsubscribeUserEmailTestService
} from './users-tests.service';

/**
 * local
 */

@NgModule({
  declarations: [UsersTestsComponent],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: UsersTestsComponent,
        pathMatch: 'full'
      }
    ]),
    ServiceLayerModule,
    TestUiModule
  ],
  providers: [
    InviteTenantAdminTestService,
    InviteSupplierTestService,
    CreateUserTestService,
    DeactivateUserTestService,
    GetDeactivatedUsersTestService,
    ReactivateUserTestService,
    UnsubscribeUserEmailTestService
  ],
  exports: [RouterModule, UsersTestsComponent]
})
export class UsersTestsModule {}
