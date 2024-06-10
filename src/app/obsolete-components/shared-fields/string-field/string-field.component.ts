// /**
//  * global
//  */
// import { Input, Output, EventEmitter, Component, OnInit } from '@angular/core';

// import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';

// /**
//  * project
//  */
// import { IMinMaxValidatorUi } from '@wfm/service-layer';

// /**
//  * local
//  */
// @Component({
//   selector: 'app-string-field',
//   templateUrl: './string-field.component.html',
//   styleUrls: ['./string-field.component.scss']
// })
// export class StringFieldComponent implements OnInit {
//   @Input() model: IMinMaxValidatorUi<number>;
//   @Output() isChanged: EventEmitter<boolean> = new EventEmitter();
//   validatorForm: FormGroup;
//   componentId = '8751cfb4-1e20-43fe-8fa3-13ed7b8782d1';

//   constructor() {}

//   ngOnInit() {
//     this.model.isValid = true;
//     this.validatorForm = new FormGroup({
//       min: new FormControl(this.model.min, [Validators.required, Validators.min(1)]),
//       max: new FormControl(this.model.max, [Validators.required, Validators.min(1)])
//     });
//   }

//   get min(): AbstractControl {
//     return this.validatorForm.get('min');
//   }
//   get max(): AbstractControl {
//     return this.validatorForm.get('max');
//   }

//   onChange(): void {
//     this.model.isValid = false;
//     if (!this.min.invalid && !this.max.invalid) {
//       this.model.min = this.min.value;
//       this.model.max = this.max.value;
//       this.model.isValid = true;
//     }
//     this.isChanged.emit(true);
//   }
// }
