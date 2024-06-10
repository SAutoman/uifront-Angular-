// /**
//  * global
//  */
// import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
// import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';

// /**
//  * project
//  */
// import { allowedFileTypes } from '@wfm/shared/utils';
// import { IAllowedTypesValidatorUi, AllowedFileType } from '@wfm/service-layer';

// /**
//  * local
//  */

// @Component({
//   selector: 'app-file-field',
//   templateUrl: './file-field.component.html',
//   styleUrls: ['./file-field.component.scss']
// })
// export class FileFieldComponent implements OnInit {
//   // @Input() model: FileFormFieldModel;
//   @Input() model: IAllowedTypesValidatorUi;
//   @Output() isChanged: EventEmitter<boolean> = new EventEmitter();
//   fieldForm: FormGroup;

//   selectableAllowedfiletypes: AllowedFileType[] = allowedFileTypes();
//   componentId = '93c91118-dcc1-40b0-ae8f-ead5d5a695fa';

//   public gender: { text: string; value: number };
//   get allowedfiletypes(): AbstractControl {
//     return this.fieldForm.get('allowedfiletypes');
//   }
//   constructor(private formBuilder: FormBuilder) {}

//   ngOnInit(): void {
//     this.model.isValid = true;
//     this.fieldForm = this.formBuilder.group({
//       allowedfiletypes: [this.model.allowedFileTypes ? this.model.allowedFileTypes : null, [Validators.required]]
//     });
//   }

//   onChange(fileTypes: string[]): void {
//     this.model.allowedFileTypes = fileTypes;
//     this.isChanged.emit(true);
//   }
// }
