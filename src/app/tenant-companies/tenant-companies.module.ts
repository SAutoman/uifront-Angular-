import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@wfm/shared/shared.module';
import { MaterialModule } from '@wfm/material-module';
import { TenantCompaniesListComponent } from './tenant-companies-list/tenant-companies-list.component';
import { TenantcompaniesRoutingModule } from './tenant-companies.routing';

@NgModule({
  declarations: [TenantCompaniesListComponent],
  imports: [CommonModule, SharedModule, MaterialModule, TenantcompaniesRoutingModule],
  exports: [TenantCompaniesListComponent]
})
export class TenantCompaniesModule {}
