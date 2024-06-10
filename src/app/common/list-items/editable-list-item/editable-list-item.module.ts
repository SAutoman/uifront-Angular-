import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { EditableListItemComponent } from './editable-list-item/editable-list-item.component';
import { SharedModule } from '@wfm/shared/shared.module';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [EditableListItemComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatTooltipModule,
    FormlyModule.forChild(),
    FormlyMaterialModule,
    DragDropModule,
    SharedModule
  ],
  exports: [EditableListItemComponent]
})
export class EditableListItemModule {}
