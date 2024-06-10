/**
 * global
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TranslateModule } from '@ngx-translate/core';

/**
 * project
 */

import { MaterialModule } from '../material-module';

/**
 * local
 */
import { TenantRoutingModule } from './tenant-admin.routing';

import { Ng2SearchPipeModule } from 'ng2-search-filter';

import { IconModule } from '@wfm/shared/icon/icon.module';
import { SharedModule } from '@wfm/shared/shared.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MaterialModule,
    DragDropModule,
    TenantRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    Ng2SearchPipeModule,
    SharedModule,
    IconModule
  ]
  // entryComponents: []
})
export class TenantAdminModule {}
