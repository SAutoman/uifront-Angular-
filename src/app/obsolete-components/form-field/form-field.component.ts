// /**
//  * global
//  */
// import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
// import { FormGroup, FormBuilder, Validators } from '@angular/forms';

// import { MatSnackBar } from '@angular/material/snack-bar';

// /**
//  * project
//  */
// import { ProcessStepFormDto } from '../process-step/models';

// /**
//  * local
//  */
// @Component({
//   selector: 'app-form-field',
//   templateUrl: './form-field.component.html',
//   styleUrls: ['./form-field.component.scss']
// })
// export class FormFieldComponent implements OnInit {
//   @Input() model: ProcessStepFormDto;
//   @Output() currentFormId: EventEmitter<string> = new EventEmitter();

//   fieldForm: FormGroup;
//   componentId = 'e766403c-768d-4fe4-87d5-a398795d3351';

//   constructor(private formBuilder: FormBuilder, public snackBar: MatSnackBar) {}

//   ngOnInit() {
//     this.fieldForm = this.formBuilder.group({
//       min: [this.model.min ? this.model.min : '', [Validators.required]],
//       max: [this.model.max ? this.model.max : '', [Validators.required]]
//     });
//   }

//   openSnackBar(message: string, action: string) {
//     this.snackBar.open(message, action, {
//       duration: 2000
//     });
//   }

//   onSubmit(formValue) {
//     this.model.min = formValue.min;
//     this.model.max = formValue.max;

//     this.currentFormId.emit(this.model.formId);
//     this.openSnackBar('Form Values Saved Successfully', 'CLOSE');
//   }

//   get min() {
//     return this.fieldForm.get('min');
//   }

//   get max() {
//     return this.fieldForm.get('max');
//   }
// }
