/**
 * global
 */
import { Component, Input, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DynamicEntityFieldInfo } from '@wfm/service-layer/models/FieldInfo';
import { FieldDtoAdmin } from '@wfm/service-layer/models/FieldInfo';

/**
 * project
 */
import { FieldTypeIds } from './../../../service-layer';

/**
 * local
 */

@Component({
  selector: 'app-edit-field',
  templateUrl: './edit-field.component.html',
  styleUrls: ['./edit-field.component.scss']
})
export class EditFieldComponent implements OnInit {
  @Input() field: FieldDtoAdmin | DynamicEntityFieldInfo;

  types: string[] = [];
  buttonText: string;

  name: string;
  type: string;
  get fieldTypeIds(): typeof FieldTypeIds {
    return FieldTypeIds;
  }

  constructor(private dialogRef: MatDialogRef<EditFieldComponent>) {}

  ngOnInit(): void {
    this.setTypes();
  }

  setTypes(): void {
    for (let i = 0; i <= 12; i++) {
      if (!this.types.includes(this.fieldTypeIds[i]) && this.fieldTypeIds[i] !== undefined) {
        this.types.push(this.fieldTypeIds[i].split('Field')[0]);
      }
    }
  }

  onUpdateClicked(): void {
    if (this.name && this.type) {
      const model = {
        name: this.name,
        type: this.type
      };

      this.dialogRef.close(model);
    } else {
      this.dialogRef.close(true);
    }
  }
}
