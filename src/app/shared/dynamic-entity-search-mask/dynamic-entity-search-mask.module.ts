/**
 * global
 */
import { NgModule } from '@angular/core';
/**
 * local
 */
import { DynamicEntityFieldComponent } from '../dynamic-entity-field/dynamic-entity-field.component';
import { DynamicEntityFieldsModule } from '../dynamic-entity-fields/dynamic-entity-fields.module';
import { SearchButtonsComponent } from '../search-buttons/search-buttons.component';
import { SharedModule } from '../shared.module';
import { DynamicEntitySearchMaskComponent } from './dynamic-entity-search-mask.component';

@NgModule({
  imports: [SharedModule, DynamicEntityFieldsModule],
  declarations: [DynamicEntityFieldComponent, DynamicEntitySearchMaskComponent, SearchButtonsComponent],
  exports: [DynamicEntityFieldsModule, DynamicEntityFieldComponent, DynamicEntitySearchMaskComponent, SearchButtonsComponent],
  providers: []
})
export class DynamicEntitySearchMaskModule {}
