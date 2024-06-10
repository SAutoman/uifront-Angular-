// /**
//  * global
//  */
// import { Component, OnInit, Input } from '@angular/core';
// import { FormBuilder, ValidatorFn, Validators } from '@angular/forms';

// /**
//  * project
//  */
// import { ValidatorType, FieldValueDto, FieldMetadataDto, FieldValueDtoBase, MinMaxDateValidator } from '@wfm/service-layer';
// import { CaseFieldWrapperComponent } from '../../case-field-wrapper/case-field-wrapper.component';

// import { BaseFieldComponent, FieldControlApiValue, FieldControlApiData } from '../field-control-api-value';

// /**
//  * local
//  */
// @Component({
//   selector: 'app-time-field-case-wrapper',
//   templateUrl: './time-field.component.html',
//   styleUrls: ['./time-field.component.scss']
// })
// export class TimeFieldComponent extends BaseFieldComponent implements OnInit, FieldControlApiValue {
//   @Input() canEditField: boolean;
//   _fieldControlApiData: FieldControlApiData;
//   get ValidatorType() {
//     return ValidatorType;
//   }
//   fieldValue: string;
//   min: string;
//   max: string;
//   componentId = '2066122d-bc2f-465e-8914-ff72b62f59d1';

//   @Input() set fieldControlApiData(value: FieldControlApiData) {
//     if (!value) {
//       return;
//     }

//     this._fieldControlApiData = value;
//     if (this.fieldControlApiData.fieldValue) {
//       this.fieldValue = moment((<FieldValueDto<Date>>this.fieldControlApiData.fieldValue).value).format('LT');
//     }

//     const defaultValue = <FieldValueDto<Date>>this.fieldControlApiData.fieldMetadata.funcFieldProps.defaultValue;

//     if (!this.stepForm) {
//       this.createControl(
//         this.fieldValue ? this.fieldValue : defaultValue ? moment(defaultValue.value).format('LT') : null,
//         value.fieldMetadata.position,
//         this.createValidators(value.fieldMetadata)
//       );
//     } else {
//       if (!this.stepForm.controls[value.fieldMetadata.position].value && defaultValue) {
//         this.stepForm.controls[value.fieldMetadata.position].setValue(moment(defaultValue.value).format('LT'));
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

//   ngOnInit() {}

//   getFieldMetadataDto(): FieldMetadataDto {
//     return this.fieldControlApiData.fieldMetadata;
//   }

//   async getValueAndUpdate(): Promise<FieldValueDtoBase> {
//     const toDate = moment(this.formControl.value, 'LT').toDate();
//     return <FieldValueDto<Date>>{
//       id: this.fieldControlApiData.fieldMetadata.id,
//       type: this.fieldControlApiData.fieldMetadata.type,
//       value: toDate
//     };
//   }

//   createValidators(field: FieldMetadataDto): ValidatorFn[] {
//     const validators: ValidatorFn[] = [];
//     field.validators.forEach((v) => {
//       switch (v.validatorType) {
//         case ValidatorType.Required:
//           validators.push(Validators.required);
//           break;
//         case ValidatorType.MinMax:
//           this.min = moment((<MinMaxDateValidator>v).min).format('LT');
//           this.max = moment((<MinMaxDateValidator>v).max).format('LT');
//           break;
//       }
//     });
//     return validators;
//   }

//   async onChange() {
//     this.fieldControlApiData.fieldValue = await this.getValueAndUpdate();
//     this.setChanged(this.fieldControlApiData);
//   }
// }
