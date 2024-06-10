/**
 * global
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * project
 */
import { SharedModule } from '@wfm/shared/shared.module';
/**
 * local
 */
import { NotificationComponent } from './notifications/notifications.component';
import { NotificationRoutingModule } from './notification-message.routing';
import { MessageComponent } from './messages/messages.component';
import { MaterialModule } from '../material-module';

@NgModule({
  declarations: [NotificationComponent, MessageComponent],
  imports: [CommonModule, MaterialModule, NotificationRoutingModule, SharedModule],
  exports: [NotificationComponent, MessageComponent]
})
export class NotificationMessageModule {}
