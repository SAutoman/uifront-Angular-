import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { FieldTypeIds } from '@wfm/service-layer';

@Component({
  selector: 'app-schema-embedding-type-select',
  templateUrl: './schema-embedding-type-select.component.html',
  styleUrls: ['./schema-embedding-type-select.component.scss']
})
export class SchemaEmbeddingTypeSelectComponent implements OnInit {
  componentId = '9fae6c5f-a66f-4845-a308-5d59fae45793';
  options: Array<{
    type: FieldTypeIds;
    title: string;
  }>;
  selectControl: FormControl;
  constructor(private dialogRef: MatDialogRef<SchemaEmbeddingTypeSelectComponent>) {}

  ngOnInit() {
    this.options = [
      {
        type: FieldTypeIds.EmbededField,
        title: 'Embed this schema as a nested form'
      },
      {
        type: FieldTypeIds.ListOfLinksField,
        title: 'Store references of entities created with this schema'
      }
    ];

    this.selectControl = new FormControl('', [Validators.required]);
  }

  select() {
    this.dialogRef.close(this.selectControl.value);
  }

  close() {
    this.dialogRef.close();
  }
}
