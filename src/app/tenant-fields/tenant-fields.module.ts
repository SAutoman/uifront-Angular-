/**
 * global
 */
import { NgModule } from '@angular/core';

/**
 * project
 */
import { SharedModule } from '@wfm/shared/shared.module';
import { ListItemModule } from '@wfm/common/list-items';
import { FieldModule } from '@wfm/common/field';

/**
 * local
 */
import { PageTenantFieldsComponent } from './page-tenant-fields/page-tenant-fields.component';
import { TenantFieldsRoutingModule } from './tenant-fields.routing';

@NgModule({
  declarations: [PageTenantFieldsComponent],
  imports: [SharedModule, TenantFieldsRoutingModule, ListItemModule, FieldModule]
})
export class TenantFieldsModule {}
