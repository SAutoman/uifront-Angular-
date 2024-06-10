import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface SchemaValidationPopupData {
  failedValidators: Array<{ name: string; message: string }>;
  isAlert: boolean;
}

@Component({
  selector: 'app-schema-validation-popup',
  templateUrl: './schema-validation-popup.component.html',
  styleUrls: ['./schema-validation-popup.component.scss']
})
export class SchemaValidationPopupComponent implements OnInit {
  componentId = 'e081cd90-3937-4ad4-a07e-42bebf4ec91d';

  constructor(
    private dialogRef: MatDialogRef<SchemaValidationPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SchemaValidationPopupData
  ) {}

  ngOnInit(): void {}

  onResponse(response: boolean): void {
    this.dialogRef.close(response);
  }
}
