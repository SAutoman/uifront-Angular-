/**
 * global
 */
import { NgModule } from '@angular/core';

/**
 * project
 */
import { ListItemModule } from '@wfm/common/list-items';
import { SharedModule } from '@wfm/shared/shared.module';

/**
 * local
 */
import { PageTenantListsComponent } from './page-tenant-lists/page-tenant-lists.component';
import { TenantListsRoutingModule } from './tenant-lists.routing';
import { TenantListEditorModule } from './modules';

@NgModule({
  declarations: [PageTenantListsComponent],
  imports: [SharedModule, TenantListsRoutingModule, ListItemModule, TenantListEditorModule]
})
export class TenantListsModule {}
