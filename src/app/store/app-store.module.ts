/**
 * global
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * project
 */
import { ServiceLayerModule } from '../service-layer/service-layer.module';

/**
 * local
 */

@NgModule({
  declarations: [],
  imports: [CommonModule, ServiceLayerModule]
})
export class AppStoreModule {}
