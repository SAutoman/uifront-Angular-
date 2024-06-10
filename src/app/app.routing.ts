/**
 * core
 */
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { UsersModule } from './users/users.module';
import { AppRoutes } from './app.routes';

@NgModule({
  imports: [RouterModule.forRoot(AppRoutes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule, UsersModule],
  providers: []
})
export class AppRoutingModule {}
