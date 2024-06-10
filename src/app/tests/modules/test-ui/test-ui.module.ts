import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';

import { TestUiPageComponent } from './test-ui-page/test-ui-page.component';

// SharedModule, ServiceLayerModule
@NgModule({
  declarations: [TestUiPageComponent],
  imports: [CommonModule, MatButtonModule, MatDividerModule, MatIconModule, MatProgressBarModule],
  exports: [TestUiPageComponent]
})
export class TestUiModule {}
