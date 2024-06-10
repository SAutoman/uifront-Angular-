/**
 * global
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridModule } from '@progress/kendo-angular-grid';

/**
 * project
 */
import { ServiceLayerModule } from '../service-layer/service-layer.module';
import { MaterialModule } from '../material-module';

/**
 * local
 */
import { CompaniesKendoGridComponent } from './companies-kendo-grid/companies-kendo-grid.component';
import { CompanyGridService } from './companies-kendo-grid/company-grid.service';
import { CompaniesRoutingModule } from './companies.routing';
import { SharedModule } from '@wfm/shared/shared.module';

@NgModule({
  declarations: [CompaniesKendoGridComponent],
  imports: [CommonModule, MaterialModule, GridModule, ServiceLayerModule, CompaniesRoutingModule, SharedModule],
  providers: [CompanyGridService],
  exports: [CompaniesKendoGridComponent]
})
export class CompaniesModule {}
