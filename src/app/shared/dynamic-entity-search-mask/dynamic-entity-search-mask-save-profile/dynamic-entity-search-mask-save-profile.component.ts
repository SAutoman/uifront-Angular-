/**
 * global
 */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';

/**
 * project
 */

/**
 * local
 */

@Component({
  selector: 'app-dynamic-entity-search-mask-save-profile',
  templateUrl: './dynamic-entity-search-mask-save-profile.component.html',
  styleUrls: ['./dynamic-entity-search-mask-save-profile.component.scss'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true }
    }
  ]
})
export class DynamicEntitySearchMaskSaveProfileComponent implements OnInit {
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;

  constructor(private formBuilder: FormBuilder, public dialogRef: MatDialogRef<DynamicEntitySearchMaskSaveProfileComponent>) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.firstFormGroup = this.formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this.formBuilder.group({
      secondCtrl: ['', Validators.required]
    });
  }

  onDoneCloseClicked(): void {
    this.dialogRef.close();
  }

  onSubmit(first, second): void {
    const data = { ...first, ...second };
    console.log(data);
  }
}
