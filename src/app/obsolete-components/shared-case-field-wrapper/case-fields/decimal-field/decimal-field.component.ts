// /**
//  * global
//  */
// import { Component, OnInit, Input } from '@angular/core';
// import { FormBuilder, Validators, ValidatorFn } from '@angular/forms';

// /**
//  * project
//  */
// import { BaseFieldComponent, FieldControlApiValue, FieldControlApiData } from '../field-control-api-value';
// import {
//   ValidatorType,
//   FieldValueDto,
//   FieldMetadataDto,
//   FieldValueDtoBase,
//   IMinMaxNumberValidator,
//   IFormFieldValidatorUi
// } from '@wfm/service-layer';

// import { CaseFieldWrapperComponent } from '@wfm/obsolete-components/shared-case-field-wrapper/case-field-wrapper/case-field-wrapper.component';

// /**
//  * local
//  */
// @Component({
//   selector: 'app-decimal-field-case-wrapper',
//   templateUrl: './decimal-field.component.html',
//   styleUrls: ['./decimal-field.component.scss']
// })
// export class DecimalFieldComponent extends BaseFieldComponent implements OnInit, FieldControlApiValue {
//   @Input() canEditField: boolean;
//   _fieldControlApiData: FieldControlApiData;
//   get ValidatorType() {
//     return ValidatorType;
//   }
//   fieldValue: number;
//   componentId = '76055d25-35db-4956-8d63-ba806c25ed3b';

//   @Input() set fieldControlApiData(value: FieldControlApiData) {
//     if (!value) {
//       return;
//     }

//     this._fieldControlApiData = value;
//     if (this.fieldControlApiData.fieldValue) {
//       this.fieldValue = (<FieldValueDto<number>>this.fieldControlApiData.fieldValue).value;
//     }
//     const defaultValue = <FieldValueDto<number>>this.fieldControlApiData.fieldMetadata.funcFieldProps.defaultValue;

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

//   get fieldControlApiData() {
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
//     return <FieldValueDto<number>>{
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
//           validators.push(Validators.min((<IMinMaxNumberValidator>v).min));
//           validators.push(Validators.max((<IMinMaxNumberValidator>v).max));
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
