// /**
//  * global
//  */
// import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
// import { FormBuilder } from '@angular/forms';

// /**
//  * project
//  */
// import { FieldTypeIds, FieldMetadataDto, FieldValueDtoBase, FieldDtoUI } from '../../../service-layer';
// import { FieldControlApiData, FieldControlApiValue, BaseFieldComponent, WrapperComponent } from '../case-fields/field-control-api-value';

// /**
//  * local
//  */

// @Component({
//   selector: 'app-case-field-wrapper',
//   templateUrl: './case-field-wrapper.component.html',
//   styleUrls: ['./case-field-wrapper.component.scss']
// })
// export class CaseFieldWrapperComponent extends BaseFieldComponent implements WrapperComponent, OnInit, FieldControlApiValue {
//   _field: FieldDtoUI;
//   fieldControlData: FieldControlApiData;

//   @Input() canEditCase: boolean;

//   @Output() onFieldUpdated = new EventEmitter();

//   get wrapper(): CaseFieldWrapperComponent {
//     return this;
//   }

//   _baseField: FieldControlApiValue;

//   set baseField(value: FieldControlApiValue) {
//     this._baseField = value;
//   }

//   readonly: boolean;

//   setBaseField(value: FieldControlApiValue): void {
//     this.baseField = value;
//   }

//   getFieldChanged(): EventEmitter<any> {
//     return this.onFieldUpdated;
//   }

//   get FieldTypeIds(): typeof FieldTypeIds {
//     return FieldTypeIds;
//   }

//   @Input() set field(value: FieldDtoUI) {
//     if (value) {
//       this._field = value;
//       this.fieldControlData = <FieldControlApiData>{
//         fieldValue: this._field.value,
//         fieldMetadata: this._field.metadata,
//         funcFieldProps: this._field.metadata.funcFieldProps
//       };
//     }
//   }

//   get field(): FieldDtoUI {
//     return this._field;
//   }

//   constructor(formBuilder: FormBuilder) {
//     super(formBuilder);
//   }

//   ngOnInit(): void {
//     this.readonly = this.canEditCase;
//   }

//   getFieldMetadataDto(): FieldMetadataDto {
//     if (!this._baseField) {
//       return null;
//     }
//     return this._baseField.getFieldMetadataDto();
//   }

//   getValueAndUpdate(): Promise<FieldValueDtoBase> {
//     if (!this._baseField) {
//       return null;
//     }
//     return this._baseField.getValueAndUpdate();
//   }

//   onFieldChanged(data: FieldValueDtoBase): void {
//     this.onFieldUpdated.emit(data);
//   }

//   isChanged(): boolean {
//     return this._baseField.isChanged();
//   }

//   isValid(): boolean {
//     return this._baseField.isValid();
//   }
// }
