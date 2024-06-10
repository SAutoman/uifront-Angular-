// /**
//  * global
//  */
// import { Component, OnInit, Input } from '@angular/core';
// import { FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
// import { MomentDateAdapter } from '@angular/material-moment-adapter';
// import { Store } from '@ngrx/store';

// /**
//  * project
//  */
// import {
//   FieldValueDtoBase,
//   ValidatorType,
//   FieldValueDto,
//   FieldMetadataDto,
//   MinMaxDateValidator,
//   IFormFieldValidatorUi
// } from '@wfm/service-layer';
// import DateTimeFormatHelper from '@wfm/shared/dateTimeFormatHelper';
// import { ApplicationState } from '@wfm/store';
// import { CaseFieldWrapperComponent } from '../../case-field-wrapper/case-field-wrapper.component';

// import { BaseFieldComponent, FieldControlApiValue, FieldControlApiData } from '../field-control-api-value';
// import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';

// @Component({
//   selector: 'app-date-field-case-wrapper',
//   templateUrl: './date-field.component.html',
//   styleUrls: ['./date-field.component.scss'],
//   providers: [
//     { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
//     { provide: MAT_DATE_FORMATS, useValue: DateTimeFormatHelper.getDateFormatConfig() }
//   ]
// })
// export class DateFieldComponent extends BaseFieldComponent implements OnInit, FieldControlApiValue {
//   @Input() canEditField: boolean;
//   _fieldControlApiData: FieldControlApiData;
//   get ValidatorType() {
//     return ValidatorType;
//   }
//   fieldValue: Date;
//   minDate: Date;
//   maxDate: Date;

//   componentId = '24833963-e2c2-410a-adf7-b9c19292940c';

//   @Input() set fieldControlApiData(value: FieldControlApiData) {
//     if (!value) {
//       return;
//     }

//     this._fieldControlApiData = value;
//     if (this.fieldControlApiData.fieldValue) {
//       this.fieldValue = (<FieldValueDto<Date>>this.fieldControlApiData.fieldValue).value;
//     }
//     const defaultValue = <FieldValueDto<Date>>this.fieldControlApiData.fieldMetadata.funcFieldProps.defaultValue;

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

//   constructor(formBuilder: FormBuilder, private store: Store<ApplicationState>) {
//     super(formBuilder);
//   }

//   ngOnInit(): void {
//     if (this._fieldControlApiData && this._fieldControlApiData.fieldValue) {
//       const val = this._fieldControlApiData.fieldValue[`value`];
//       if (val) {
//         this.stepForm.controls[this._fieldControlApiData.fieldMetadata.position].setValue(val);
//       }
//     }
//   }

//   getFieldMetadataDto(): FieldMetadataDto {
//     return this.fieldControlApiData.fieldMetadata;
//   }

//   async getValueAndUpdate(): Promise<FieldValueDtoBase> {
//     return <FieldValueDto<Date>>{
//       id: this.fieldControlApiData.fieldMetadata.id,
//       type: this.fieldControlApiData.fieldMetadata.type,
//       value: this.formControl.value
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
//           this.minDate = moment((<MinMaxDateValidator>v).min).toDate();
//           this.maxDate = moment((<MinMaxDateValidator>v).max).toDate();
//           validators.push((c) => this.dateValidator(c));
//           break;
//       }
//     });
//     return validators;
//   }

//   async onChange(): Promise<void> {
//     this.fieldControlApiData.fieldValue = await this.getValueAndUpdate();
//     this.setChanged(this.fieldControlApiData);
//   }

//   dateValidator(c: AbstractControl): { [key: string]: boolean } {
//     const value = c.value;

//     if (moment(value).isBefore(this.minDate) || moment(value).isAfter(this.maxDate)) {
//       return { dateInvalid: true };
//     }

//     return null;
//   }

//   getValidatorValueForErrorMessage(validatorType: ValidatorType): IFormFieldValidatorUi {
//     const tempValidator = this.fieldControlApiData.fieldMetadata.validators.find((v) => v.validatorType === validatorType);
//     switch (validatorType) {
//       case ValidatorType.MinMax:
//         return <MinMaxDateValidator>tempValidator;
//     }
//   }
// }
