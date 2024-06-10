import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailAuditComponent } from './email-audit/email-audit.component';
import { EmailAuditRoutingModule } from './email-audit.routing';
import { ServiceLayerModule } from '@wfm/service-layer/service-layer.module';
import { MaterialModule } from '@wfm/material-module';
import { SharedModule } from '@wfm/shared/shared.module';

@NgModule({
  declarations: [EmailAuditComponent],
  imports: [CommonModule, EmailAuditRoutingModule, SharedModule, MaterialModule, ServiceLayerModule],
  exports: [EmailAuditComponent]
})
export class EmailAuditModule {}
