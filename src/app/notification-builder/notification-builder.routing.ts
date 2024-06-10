import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotificationTopicRoute, NotificationTemplatesRoute } from './notification-builder-constants';
import { NotificationTopicComponent } from './notification-builder-settings/notification-builder-settings.component';
import { NotificationTemplateComponent } from './notification-template/notification-template.component';
import { NotificationTopicsListComponent } from './notification-topics-list/notification-topics-list.component';
import { TemplatesListComponent } from './templates-list/templates-list.component';

export const NotificationBuilderRoutes: Routes = [
  {
    path: `${NotificationTopicRoute}/create`,
    component: NotificationTopicComponent
  },
  {
    path: `${NotificationTopicRoute}/edit/:id`,
    component: NotificationTopicComponent
  },
  {
    path: `${NotificationTopicRoute}/list`,
    component: NotificationTopicsListComponent
  },
  {
    path: `${NotificationTemplatesRoute}/create`,
    component: NotificationTemplateComponent
  },
  {
    path: `${NotificationTemplatesRoute}/edit/:id`,
    component: NotificationTemplateComponent
  },
  {
    path: `${NotificationTemplatesRoute}/list`,
    component: TemplatesListComponent
  },
  {
    path: NotificationTemplatesRoute,
    component: TemplatesListComponent
  },
  {
    path: NotificationTopicRoute,
    component: NotificationTopicsListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(NotificationBuilderRoutes)],
  exports: [RouterModule]
})
export class NotificationBuilderRoutingModule {}
