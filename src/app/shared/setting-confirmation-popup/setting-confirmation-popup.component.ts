import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmActionComponent } from '@wfm/workflow-state/confirm-action/confirm-action.component';

@Component({
  selector: 'app-setting-confirmation-popup',
  templateUrl: './setting-confirmation-popup.component.html',
  styleUrls: ['./setting-confirmation-popup.component.scss']
})
export class SettingConfirmationPopupComponent implements OnInit {
  componentId = 'e081cd90-3937-4ad4-a07e-42bebf4ec132';
  checked: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<ConfirmActionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string; dynamicMessage?: string }
  ) {}

  ngOnInit(): void {}

  onResponse(response: boolean): void {
    this.dialogRef.close({ rememberMe: this.checked, proceed: response });
  }
}
