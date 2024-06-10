/**
 * global
 */
import { NgModule } from '@angular/core';

/**
 * project
 */
import { ServiceLayerModule } from '../service-layer/service-layer.module';
import { OperationService } from '../service-layer/services/operation.service';
import { SharedModule } from '../shared/shared.module';
import { OperationsRoutingModule } from './operations.routing';
import { OperationsComponent } from './operations/operations.component';
import { OperationsSearchComponent } from './operations-search/operations-search.component';

/**
 * local
 */

@NgModule({
  declarations: [OperationsComponent, OperationsSearchComponent],
  providers: [OperationService],
  imports: [ServiceLayerModule, OperationsRoutingModule, SharedModule]
})
export class OperationsModule {}
