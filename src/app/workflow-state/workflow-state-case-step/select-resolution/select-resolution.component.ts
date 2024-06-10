import { Component, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { WorkflowResolutionDto } from '@wfm/service-layer';

export interface Resolution {
  key: string;
  title: string;
}

@Component({
  selector: 'app-select-resolution',
  templateUrl: './select-resolution.component.html',
  styleUrls: ['./select-resolution.component.scss']
})
export class SelectResolutionComponent implements OnInit {
  @Input() resolutionOptions: WorkflowResolutionDto[];
  @Input() stepName: string;
  resolutionControl: FormControl;
  headerTxt: string;
  acceptTxt: string;
  declineTxt: string;
  checked: boolean;

  constructor(private dialogRef: MatDialogRef<SelectResolutionComponent>) {}

  ngOnInit(): void {
    // this.headerTxt = this.resolutionOptions?.length === 1 ? 'Are you sure you want to resolve step' : 'Resolve';
    this.headerTxt = this.resolutionOptions?.length === 1 ? 'Are you sure you want to complete the information for the step' : 'Resolve';
    this.acceptTxt = this.resolutionOptions?.length === 1 ? 'Yes' : 'OK';
    this.declineTxt = this.resolutionOptions?.length === 1 ? 'No' : 'Cancel';

    this.resolutionControl = new FormControl('', [Validators.required]);
    if (this.resolutionOptions?.length === 1) {
      this.resolutionControl.setValue(this.resolutionOptions[0].name);
    }
  }

  submit(): void {
    if (this.resolutionControl.valid) {
      this.dialogRef.close({ resolution: this.resolutionControl.value, checked: this.checked });
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
