// /**
//  * global
//  */
// import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
// import { MatSnackBar } from '@angular/material/snack-bar';

// /**
//  * project
//  */
// import {
//   ValidatorType,
//   IFormFieldValidatorUi,
//   FieldTypeIds,
//   IRequiredValidatorUi,
//   IAllowedTypesValidatorUi,
//   IMinMaxNumberValidator,
//   MinMaxDateValidator,
//   IRegExValidatorUi,
//   IEmailValidatorUi,
//   IListValidatorUi,
//   ListItemDto,
//   IMinMaxValidatorUi
// } from '@wfm/service-layer';

// /**
//  * local
//  */

// @Component({
//   selector: 'app-form-field-wrapper',
//   templateUrl: './form-field-wrapper.component.html',
//   styleUrls: ['./form-field-wrapper.component.scss']
// })
// export class FormFieldWrapperComponent implements OnInit {
//   allowedValidatorTypes: ValidatorType[] = [];
//   validators_: IFormFieldValidatorUi[];
//   componentId = 'de1091ac-af06-4b76-a628-35b7470180da';

//   @Input() set validators(value: IFormFieldValidatorUi[]) {
//     this.validators_ = value;
//   }
//   get validators() {
//     return this.validators_;
//   }

//   _fieldType: FieldTypeIds;
//   @Input() set fieldType(value: FieldTypeIds) {
//     if (value) {
//       this._fieldType = value;
//     }
//     this.allowedValidatorTypes = this.initializeValidators(this._fieldType);
//   }
//   @Input() fieldId: string;
//   @Input() listItems: ListItemDto[];
//   @Output() currentFieldId: EventEmitter<string> = new EventEmitter();

//   selectedValidator: ValidatorType;
//   get ValidatorType() {
//     return ValidatorType;
//   }
//   get FieldTypeIds() {
//     return FieldTypeIds;
//   }
//   get fieldType() {
//     return this._fieldType;
//   }

//   constructor(private snackBar: MatSnackBar) {}

//   ngOnInit(): void {}

//   onChange(event?: any): void {
//     this.currentFieldId.emit(this.fieldId);
//   }

//   onValidatorSelected(event: { value: ValidatorType }): void {
//     if (this.validators.findIndex((v) => event.value === v.validatorType) !== -1) {
//       return;
//     }

//     switch (event.value) {
//       case ValidatorType.Required:
//         this.validators.push(<IRequiredValidatorUi>{ required: true, validatorType: event.value });
//         break;
//       case ValidatorType.MinMax:
//         this.validators.push(this.getMinMaxValidator(this.fieldType));
//         break;
//       case ValidatorType.AllowedTypes:
//         this.validators.push(<IAllowedTypesValidatorUi>{ allowedFileTypes: [], validatorType: event.value });
//         break;
//       case ValidatorType.RegEx:
//         this.validators.push(<IRegExValidatorUi>{ regEx: null, validatorType: event.value });
//         break;
//       case ValidatorType.Email:
//         this.validators.push(<IEmailValidatorUi>{ enabled: true, validatorType: event.value });
//         break;
//       case ValidatorType.List:
//         this.validators.push(<IListValidatorUi>{ allowedListItemIds: [], validatorType: event.value });
//     }

//     this.snackBar.open('Validator Added Successfully', 'CLOSE', {
//       duration: 3000
//     });
//   }

//   getMinMaxValidator(type: FieldTypeIds): IMinMaxValidatorUi<number | Date | string> {
//     switch (type) {
//       case FieldTypeIds.StringField:
//       case FieldTypeIds.IntField:
//       case FieldTypeIds.DecimalField:
//       case FieldTypeIds.FileField:
//       case FieldTypeIds.TextareaField:
//       case FieldTypeIds.TimeField:
//       case FieldTypeIds.DateField:
//         const validator: IMinMaxValidatorUi<number | Date | string> = {
//           min: null,
//           max: null,
//           fieldType: type,
//           validatorType: ValidatorType.MinMax
//         };
//         return validator;
//     }
//   }

//   validatorTypeConverter(validatorType: ValidatorType): string {
//     switch (validatorType) {
//       case ValidatorType.MinMax:
//         return 'MinMax';
//       case ValidatorType.Required:
//         return 'Required';
//       case ValidatorType.AllowedTypes:
//         return 'Allowed Types';
//       case ValidatorType.RegEx:
//         return 'RegEx';
//       case ValidatorType.Email:
//         return 'Email';
//       case ValidatorType.List:
//         return 'List';
//     }
//   }

//   initializeValidators(type: FieldTypeIds): ValidatorType[] {
//     switch (type) {
//       case FieldTypeIds.StringField:
//         return [ValidatorType.Required, ValidatorType.MinMax, ValidatorType.RegEx, ValidatorType.Email];

//       case FieldTypeIds.IntField:
//       case FieldTypeIds.DecimalField:
//       case FieldTypeIds.DateField:
//       case FieldTypeIds.TextareaField:
//       case FieldTypeIds.TimeField:
//         return [ValidatorType.Required, ValidatorType.MinMax];

//       case FieldTypeIds.BoolField:
//         return [ValidatorType.Required];

//       case FieldTypeIds.ListField:
//         return [ValidatorType.Required, ValidatorType.List];

//       case FieldTypeIds.FileField:
//         return [ValidatorType.AllowedTypes, ValidatorType.Required, ValidatorType.MinMax];
//     }
//   }

//   onRemove(validator: IFormFieldValidatorUi): void {
//     this.selectedValidator = null;
//     this.validators.splice(this.validators.indexOf(validator), 1);

//     this.snackBar.open('Validator Removed', 'CLOSE', {
//       duration: 3000
//     });
//   }
// }
