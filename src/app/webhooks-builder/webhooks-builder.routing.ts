import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WebhooksCreateRoute, WebhooksEditRoute, WebhooksListRoute } from './webhook-builder-constants';
import { WebhookCreateComponent } from './webhook-create/webhook-create.component';
import { WebhookListComponent } from './webhook-list/webhook-list.component';

export const WebHookBuilderRoutes: Routes = [
  {
    path: `${WebhooksCreateRoute}`,
    component: WebhookCreateComponent
  },
  {
    path: `${WebhooksEditRoute}/:id`,
    component: WebhookCreateComponent
  },
  {
    path: `${WebhooksListRoute}`,
    component: WebhookListComponent
  },
  { path: '', redirectTo: WebhooksListRoute, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(WebHookBuilderRoutes)],
  exports: [RouterModule]
})
export class WebHooksBuilderRoutingModule {}
