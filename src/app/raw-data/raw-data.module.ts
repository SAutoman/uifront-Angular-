/**
 * global
 */
import { NgModule } from '@angular/core';

/**
 * project
 */
import { SharedModule } from '@wfm/shared/shared.module';
import { StatePersistingService } from '@wfm/service-layer';
import { DynamicEntitySearchMaskModule } from '@wfm/shared/dynamic-entity-search-mask/dynamic-entity-search-mask.module';
import { DynamicEntityGridModule } from '@wfm/shared/dynamic-entity-grid/dynamic-entity-grid.module';
/**
 * local
 */
import { RawDataGridComponent } from './raw-data-grid/raw-data-grid.component';
import { RawDataRoutingModule } from './raw-data.routing';

@NgModule({
  declarations: [RawDataGridComponent],
  imports: [RawDataRoutingModule, SharedModule, DynamicEntityGridModule, DynamicEntitySearchMaskModule],
  providers: [StatePersistingService],
  exports: [RawDataGridComponent]
})
export class RawDataModule {}
