import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApiClientsRoutingModule } from './api-clients-routing.module';
import { ApiClientCreateComponent } from './api-client-create/api-client-create.component';
import { ApiClientsListComponent } from './api-clients-list/api-clients-list.component';
import { SharedModule } from '@wfm/shared/shared.module';

@NgModule({
  declarations: [ApiClientCreateComponent, ApiClientsListComponent],
  imports: [CommonModule, ApiClientsRoutingModule, SharedModule]
})
export class ApiClientsModule {}
