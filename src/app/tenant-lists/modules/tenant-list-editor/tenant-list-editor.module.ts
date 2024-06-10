import { NgModule } from '@angular/core';
import { EditableListItemModule } from '@wfm/common/list-items';
import { SharedModule } from '@wfm/shared/shared.module';

import { TenantListEditorComponent } from './tenant-list-editor/tenant-list-editor.component';
import { InnerTenantListComponent } from './inner-tenant-list/inner-tenant-list.component';

@NgModule({
  declarations: [TenantListEditorComponent, InnerTenantListComponent],
  imports: [SharedModule, EditableListItemModule],
  exports: [TenantListEditorComponent]
})
export class TenantListEditorModule {}
