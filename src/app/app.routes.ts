/**
 * global
 */
import { Routes } from '@angular/router';

/**
 * project
 */

/**
 * local
 */

import { TenantsMenuComponent } from './tenants/tenants-menu/tenants-menu.component';
import { SuperAdminGuard } from './tenants/super-admin-guard/super-admin.guard';
import { CreateTenantComponent } from './tenants/create-tenant/create-tenant.component';
import { TenantsListComponent } from './tenants/tenants-list/tenants-list.component';
import { FieldsComponent } from './tenants/fields/fields.component';
import {
  appSettingsRoute,
  documentManagementRoute,
  errorRoute,
  fieldsAdminRoute,
  notificationsRoute,
  tenantCreateRoute,
  tenantEditRoute,
  tenantsMainRoute,
  tenantsViewRoute,
  invitationsRoute
} from './tenants/tenants.routing';
import { UnknownUserComponent } from './unknown-user/unknown-user.component';
import { InvitationsComponent } from './tenants/invitations/invitations.component';

import { AuthCallbackComponent } from './layouts/authcallback/authcallback.component';
import { unknownUserRoute, callBackRoute, callbackUnsubscribeRoute, externaLinkRoute, userRegistrationRoute } from './app.route.static';
import { companiesMainRoute } from './companies/companies.routing';
import { NotificationSettingsComponent } from './tenants/notification-settings/notification-settings.component';
import { EmailUnsubscribeCallbackComponent } from './email-unsubscribe-callback/email-unsubscribe-callback.component';
import { DocumentManagementComponent } from './tenants/document-management/document-management.component';
import { ExternalLinkParserComponent } from './external-link-parser/external-link-parser.component';
import { RegistrationComponent } from './users/registration/registration.component';
import { RegistrationGuard } from './shared/registration-guard';
import { AppSettingsComponent } from './tenants/app-settings/app-settings.component';
import { AppSettingGuard } from './tenants/app-setting.guard';

export const AppRoutes: Routes = [
  {
    path: tenantsMainRoute,
    component: TenantsMenuComponent,
    children: [
      {
        path: tenantCreateRoute,
        component: CreateTenantComponent
      },
      {
        path: `${tenantEditRoute}/:id`,
        component: CreateTenantComponent
      },
      {
        path: tenantsViewRoute,
        component: TenantsListComponent
      },
      // {
      //   path: fieldsAdminRoute,
      //   component: FieldsComponent
      // },
      {
        path: companiesMainRoute,
        loadChildren: () => import('./companies/companies.module').then((m) => m.CompaniesModule)
      },
      {
        path: notificationsRoute,
        component: NotificationSettingsComponent
      },
      {
        path: documentManagementRoute,
        component: DocumentManagementComponent
      },
      {
        path: appSettingsRoute,
        component: AppSettingsComponent,
        canActivate: [AppSettingGuard]
      },
      {
        path: invitationsRoute,
        component: InvitationsComponent
      }
    ],
    canActivate: [SuperAdminGuard]
  },
  {
    path: unknownUserRoute,
    component: UnknownUserComponent
  },
  {
    path: callBackRoute,
    component: AuthCallbackComponent
  },
  {
    path: callbackUnsubscribeRoute,
    component: EmailUnsubscribeCallbackComponent
  },
  {
    path: externaLinkRoute,
    component: ExternalLinkParserComponent
  },
  {
    path: userRegistrationRoute,
    component: RegistrationComponent,
    canActivate: [RegistrationGuard]
  },
  {
    path: errorRoute,
    loadChildren: () => import('./error/error.module').then((x) => x.ErrorModule)
  },
  {
    path: '**',
    redirectTo: 'error/404'
  }
];
