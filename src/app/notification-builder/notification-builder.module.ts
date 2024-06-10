import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@wfm/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NotificationBuilderRoutingModule } from './notification-builder.routing';
import { NotificationTopicComponent } from './notification-builder-settings/notification-builder-settings.component';
import { NotificationTemplateComponent } from './notification-template/notification-template.component';
import { NotificationTopicsListComponent } from './notification-topics-list/notification-topics-list.component';
import { TemplatesListComponent } from './templates-list/templates-list.component';

@NgModule({
  declarations: [NotificationTopicComponent, NotificationTemplateComponent, NotificationTopicsListComponent, TemplatesListComponent],
  imports: [CommonModule, SharedModule, FormsModule, ReactiveFormsModule, NotificationBuilderRoutingModule]
})
export class NotificationBuilderModule {}
