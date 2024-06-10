// /**
//  * global
//  */
// import { Component, OnInit, Input } from '@angular/core';
// import { FormBuilder, Validators, ValidatorFn } from '@angular/forms';

// /**
//  * project
//  */
// import { BaseFieldComponent, FieldControlApiValue, FieldControlApiData } from '../field-control-api-value';
// import { ValidatorType, FieldValueDto, FieldMetadataDto, FieldValueDtoBase, RenderType } from '@wfm/service-layer';
// import { CaseFieldWrapperComponent } from '../../case-field-wrapper/case-field-wrapper.component';

// /**
//  * local
//  */

// @Component({
//   selector: 'app-bool-field-case-wrapper',
//   templateUrl: './bool-field.component.html',
//   styleUrls: ['./bool-field.component.scss']
// })
// export class BoolFieldComponent extends BaseFieldComponent implements OnInit, FieldControlApiValue {
//   @Input() canEditField: boolean;
//   /**
//    * @override
//    */
//   @Input()
//   private _fieldWrapper: CaseFieldWrapperComponent;
//   public get fieldWrapper(): CaseFieldWrapperComponent {
//     return this._fieldWrapper;
//   }
//   public set fieldWrapper(value: CaseFieldWrapperComponent) {
//     this._fieldWrapper = value;
//   }
//   _fieldControlApiData: FieldControlApiData;

//   componentId = 'c5c503ae-97f9-40d8-8cd0-3a30542b64c6';

//   get ValidatorType(): typeof ValidatorType {
//     return ValidatorType;
//   }
//   get RenderType(): typeof RenderType {
//     return RenderType;
//   }
//   fieldValue: boolean;

//   @Input() set fieldControlApiData(value: FieldControlApiData) {
//     if (!value) {
//       return;
//     }

//     this._fieldControlApiData = value;
//     if (this.fieldControlApiData.fieldValue) {
//       this.fieldValue = (<FieldValueDto<boolean>>this.fieldControlApiData.fieldValue).value;
//     }
//     const defaultValue = <FieldValueDto<boolean>>this.fieldControlApiData.fieldMetadata.funcFieldProps.defaultValue;

//     if (!this.stepForm) {
//       this.createControl(
//         this.fieldValue !== null ? this.fieldValue : defaultValue ? defaultValue.value : null,
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
//     return <FieldValueDto<boolean>>{
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
//     if (!field.validators.length) {
//       return;
//     }
//     validators.push(Validators.required);
//     return validators;
//   }
// }
