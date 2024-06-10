// /**
//  * global
//  */
// import { Component, OnInit, Input } from '@angular/core';
// import { Validators, FormBuilder, ValidatorFn } from '@angular/forms';

// /**
//  * project
//  */
// import {
//   FieldValueDtoBase,
//   FieldValueDto,
//   ValidatorType,
//   IMinMaxNumberValidator,
//   IRegExValidatorUi,
//   FieldMetadataDto,
//   IFormFieldValidatorUi
// } from '@wfm/service-layer';

// import { CaseFieldWrapperComponent } from '@wfm/obsolete-components/shared-case-field-wrapper/case-field-wrapper/case-field-wrapper.component';
// import { FieldControlApiData, FieldControlApiValue, BaseFieldComponent } from '../field-control-api-value';

// /**
//  * local
//  */

// @Component({
//   selector: 'app-string-field-case-wrapper',
//   templateUrl: './string-field.component.html',
//   styleUrls: ['./string-field.component.scss']
// })
// export class StringFieldComponent extends BaseFieldComponent implements OnInit, FieldControlApiValue {
//   @Input() canEditField: boolean;

//   componentId = '0e7ada1b-4a03-401c-9f2d-5b2ebc6dd30d';

//   _fieldControlApiData: FieldControlApiData;
//   get ValidatorType() {
//     return ValidatorType;
//   }
//   fieldValue: string;

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
//         case ValidatorType.Email:
//           validators.push(Validators.email);
//           break;
//         case ValidatorType.RegEx:
//           validators.push(Validators.pattern((<IRegExValidatorUi>v).regEx));
//       }
//     });

//     return validators;
//   }

//   getValidatorValueForErrorMessage(validatorType: ValidatorType): IFormFieldValidatorUi {
//     const tempValidator = this.fieldControlApiData.fieldMetadata.validators.find((v) => v.validatorType === validatorType);
//     switch (validatorType) {
//       case ValidatorType.MinMax:
//         return <IMinMaxNumberValidator>tempValidator;
//       case ValidatorType.RegEx:
//         return <IRegExValidatorUi>tempValidator;
//     }
//   }
// }
