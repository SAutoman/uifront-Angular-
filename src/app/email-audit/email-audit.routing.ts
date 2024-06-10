/**
 * global
 */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmailAuditComponent } from './email-audit/email-audit.component';

export const emailAuditsMainRoute = 'email-audits';
export const emailAuditsListRoute = 'list';
export const rawDataAuditListRoute = 'raw-data';
export const casesAuditListRoute = 'cases';

export const EmailAuditRoutes: Routes = [
  {
    path: '',
    redirectTo: rawDataAuditListRoute,
    pathMatch: 'full'
  },
  {
    path: rawDataAuditListRoute,
    component: EmailAuditComponent
  },
  {
    path: casesAuditListRoute,
    component: EmailAuditComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(EmailAuditRoutes)],
  exports: [RouterModule]
})
export class EmailAuditRoutingModule {}
