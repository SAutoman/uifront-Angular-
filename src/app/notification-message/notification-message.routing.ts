/**
 * global
 */
import { Routes, RouterModule } from '@angular/router';

import { NgModule } from '@angular/core';

/**
 * project
 */

/**
 * local
 */
import { NotificationComponent } from './notifications/notifications.component';
import { MessageComponent } from './messages/messages.component';

export const notificationMainRoute = 'notification-message';
export const messageRoute = 'messages';
export const NotificationsRoute = 'notifications';

export const NotificationMessageRoutes: Routes = [
  {
    path: NotificationsRoute,
    component: NotificationComponent
  },
  {
    path: messageRoute,
    component: MessageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(NotificationMessageRoutes)],
  exports: [RouterModule]
})
export class NotificationRoutingModule {}
