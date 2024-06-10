// /**
//  * global
//  */
// import { Component, OnInit, Input } from '@angular/core';
// import { FormBuilder, ValidatorFn, Validators } from '@angular/forms';

// /**
//  * project
//  */
// import {
//   ValidatorType,
//   FieldValueDto,
//   FieldMetadataDto,
//   FieldValueDtoBase,
//   IMinMaxNumberValidator,
//   IFormFieldValidatorUi
// } from '@wfm/service-layer';
// import { CaseFieldWrapperComponent } from '../../case-field-wrapper/case-field-wrapper.component';
// import { FieldControlApiData, BaseFieldComponent, FieldControlApiValue } from '../field-control-api-value';

// /**
//  * local
//  */

// @Component({
//   selector: 'app-textarea-field-case-wrapper',
//   templateUrl: './textarea-field.component.html',
//   styleUrls: ['./textarea-field.component.scss']
// })
// export class TextareaFieldComponent extends BaseFieldComponent implements OnInit, FieldControlApiValue {
//   @Input() canEditField: boolean;
//   _fieldControlApiData: FieldControlApiData;
//   get ValidatorType() {
//     return ValidatorType;
//   }
//   fieldValue: string;
//   componentId = '34ddddb3-f8f8-4e8a-9561-f2d98c8435fe';

//   @Input() set fieldControlApiData(value: FieldControlApiData) {
//     if (!value) {
//       return;
//     }

//     this._fieldControlApiData = value;
//     if (this.fieldControlApiData.fieldValue) {
//       this.fieldValue = (<FieldValueDto<string>>this.fieldControlApiData.fieldValue).value;
//     }
//     const defaultValue = <FieldValueDto<string>>this.fieldControlApiData.fieldMetadata.funcFieldProps.defaultValue;

//     if (!this.stepForm) {
//       this.createControl(
//         this.fieldValue ? this.fieldValue : defaultValue ? defaultValue.value : null,
//         value.fieldMetadata.position,
//         this.createValidators(value.fieldMetadata)
//       );
//     } else {
//       if (!this.stepForm.controls[value.fieldMetadata.position].value && defaultValue) {
//         this.stepForm.controls[value.fieldMetadata.position].setValue(defaultValue.value);
//       }
//     }
//   }

//   get controlName(): string {
//     return this._fieldControlApiData.fieldMetadata.position.toString();
//   }

//   get fieldControlApiData(): FieldControlApiData {
//     return this._fieldControlApiData;
//   }

//   constructor(formBuilder: FormBuilder) {
//     super(formBuilder);
//   }

//   ngOnInit(): void {}

//   getFieldMetadataDto(): FieldMetadataDto {
//     return this.fieldControlApiData.fieldMetadata;
//   }

//   async getValueAndUpdate(): Promise<FieldValueDtoBase> {
//     return <FieldValueDto<string>>{
//       id: this.fieldControlApiData.fieldMetadata.id,
//       type: this.fieldControlApiData.fieldMetadata.type,
//       value: this.formControl.value
//     };
//   }

//   async onChange(): Promise<void> {
//     this.fieldControlApiData.fieldValue = await this.getValueAndUpdate();
//     this.setChanged(this.fieldControlApiData);
//   }

//   createValidators(field: FieldMetadataDto): ValidatorFn[] {
//     const validators: ValidatorFn[] = [];
//     field.validators.forEach((v) => {
//       switch (v.validatorType) {
//         case ValidatorType.Required:
//           validators.push(Validators.required);
//           break;
//         case ValidatorType.MinMax:
//           validators.push(Validators.minLength((<IMinMaxNumberValidator>v).min));
//           validators.push(Validators.maxLength((<IMinMaxNumberValidator>v).max));
//           break;
//       }
//     });

//     return validators;
//   }

//   getValidatorValueForErrorMessage(validatorType: ValidatorType): IFormFieldValidatorUi {
//     const tempValidator = this.fieldControlApiData.fieldMetadata.validators.find((v) => v.validatorType === validatorType);
//     return <IMinMaxNumberValidator>tempValidator;
//   }
// }
