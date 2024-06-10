/**
 * global
 */
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmActionData } from '@wfm/service-layer/models/confirm-action';
import { Subject } from 'rxjs';

/**
 * project
 */

/**
 * local
 */
@Component({
  selector: 'app-confirm-action',
  templateUrl: './confirm-action.component.html'
})
export class ConfirmActionComponent implements OnInit {
  subject: Subject<boolean>;
  componentId = 'e081cd90-3937-4ad4-a07e-42bebf4ec91d';

  constructor(private dialogRef: MatDialogRef<ConfirmActionComponent>, @Inject(MAT_DIALOG_DATA) public data: ConfirmActionData) {}

  ngOnInit(): void {}

  onResponse(response: boolean): void {
    if (this.subject) {
      this.subject.next(response);
      this.subject.complete();
    }
    this.dialogRef.close(response);
  }
}
