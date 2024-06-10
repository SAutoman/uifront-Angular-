/**
 * global
 */
import { NgModule } from '@angular/core';

/**
 * project
 */
import { SharedModule } from '../shared/shared.module';

/**
 * local
 */

import { MappingsRoutingModule } from './mappings.routing';

import { MappingsComponent } from './mappings/mappings.component';
import { MappingEditorComponent } from './mapping-editor/mapping-editor.component';
import { DynamicEntitySearchMaskModule } from '@wfm/shared/dynamic-entity-search-mask/dynamic-entity-search-mask.module';
import { MappingManualTriggerComponent } from './mapping-manual-trigger/mapping-manual-trigger.component';
import { MappingSettingsComponent } from './mapping-settings/mapping-settings.component';
import { MappingSettingBaseComponent } from './mapping-setting-base/mapping-setting-base.component';
import { MappingSettingsItemComponent } from './mapping-settings-item/mapping-settings-item.component';

@NgModule({
  declarations: [
    MappingsComponent,
    MappingEditorComponent,
    MappingManualTriggerComponent,
    MappingSettingsComponent,
    MappingSettingBaseComponent,
    MappingSettingsItemComponent
  ],
  imports: [DynamicEntitySearchMaskModule, SharedModule, MappingsRoutingModule]
})
export class MappingsModule {}
