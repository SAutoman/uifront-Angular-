import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedModule } from '@wfm/shared/shared.module';

import { ListItemComponent } from './list-item/list-item.component';

@NgModule({
  declarations: [ListItemComponent],
  imports: [MatChipsModule, CommonModule, MatIconModule, MatButtonModule, MatInputModule, MatTooltipModule, DragDropModule, SharedModule],
  exports: [ListItemComponent]
})
export class ListItemModule {}
