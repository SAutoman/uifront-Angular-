import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WebHooksBuilderRoutingModule } from './webhooks-builder.routing';
import { WebhookCreateComponent } from './webhook-create/webhook-create.component';
import { WebhookListComponent } from './webhook-list/webhook-list.component';
import { SharedModule } from '@wfm/shared/shared.module';
import { AuthDetailsComponent } from './auth-details/auth-details.component';

@NgModule({
  declarations: [WebhookCreateComponent, WebhookListComponent, AuthDetailsComponent],
  imports: [CommonModule, SharedModule, FormsModule, ReactiveFormsModule, WebHooksBuilderRoutingModule]
})
export class WebhooksBuilderModule {}
