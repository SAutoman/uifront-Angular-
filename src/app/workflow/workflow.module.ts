/**
 * global
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { GridModule } from '@progress/kendo-angular-grid';

/**
 * project
 */
import { SharedModule } from '@wfm/shared/shared.module';
import { AdminRawDataFieldSettingsVisibilityService } from '@wfm/tenant-admin/raw-data-fields/services/field-settings-visibility/admin-raw-data-field-settings-visibility.service';
import { AdminRawDataFieldsService } from '@wfm/tenant-admin/raw-data-fields/services/field/admin-raw-data-fields.service';

/**
 * local
 */
import { WorkflowRoutingModule } from './workflow.routing';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    WorkflowRoutingModule,
    DragDropModule,
    Ng2SearchPipeModule,
    GridModule
  ],
  declarations: [],
  exports: [],
  providers: [AdminRawDataFieldSettingsVisibilityService, AdminRawDataFieldsService]
})
export class WorkflowModule {}
