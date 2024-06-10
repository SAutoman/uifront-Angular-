// /**
//  * global
//  */
// import { Input, EventEmitter, Directive } from '@angular/core';
// import { FormBuilder, FormGroup, FormControl, ValidatorFn } from '@angular/forms';

// /**
//  * project
//  */
// import { FieldValueDtoBase, FieldMetadataDto, FieldMetadataDtoUI, FormMetadataDto } from '../../../service-layer';

// /**
//  * local
//  */
// export function __isDevelop() {
//   return true;
// }

// export interface FieldControlApiValue {
//   getFieldMetadataDto(): FieldMetadataDto;
//   getValueAndUpdate(): Promise<FieldValueDtoBase>;
//   isValid(): boolean;
//   isDevelop(): boolean;

//   isChanged(): boolean;
// }

// export interface WrapperComponent {
//   setBaseField(value: FieldControlApiValue);

//   getFieldChanged(): EventEmitter<any>;
// }

// export class BaseFormComponent {
//   private _visible: boolean = true;
//   private _editable: boolean = true;

//   public set visible(value: boolean) {
//     this._visible = value;
//   }

//   public set editable(value: boolean) {
//     this._editable = value;
//   }

//   public get visible() {
//     return this._visible;
//   }
//   public get editable() {
//     return this._editable;
//   }
// }

// @Directive()
// export class BaseFieldComponent implements FieldControlApiValue {
//   private _isChanged: boolean;
//   public stepForm: FormGroup;
//   private _fieldChanged: EventEmitter<any>;
//   protected formControl: FormControl;

//   constructor(protected formBuilder: FormBuilder) {}
//   protected setChanged(field?: FieldControlApiData) {
//     this._isChanged = true;
//     this.validate();
//     this._fieldChanged.emit(field);
//   }

//   validate(): void {}

//   isChanged(): boolean {
//     return this._isChanged;
//   }

//   getFieldMetadataDto(): FieldMetadataDto {
//     throw new Error('Method not implemented.');
//   }
//   getValueAndUpdate(): Promise<FieldValueDtoBase> {
//     throw new Error('Method not implemented.');
//   }

//   isValid(): boolean {
//     return this.stepForm.valid;
//   }

//   isDevelop(): boolean {
//     return false;
//   }
//   /**
//    * FIXME (in Children it is field)
//    */
//   @Input() set fieldWrapper(value: WrapperComponent) {
//     if (value) {
//       value.setBaseField(<FieldControlApiValue>this);
//       this._fieldChanged = value.getFieldChanged();
//     }
//   }

//   protected createControl(fieldValue: any, position: number, validators: ValidatorFn[]): void {
//     const inputFields = {};
//     this.formControl = new FormControl(fieldValue, validators);
//     inputFields[position.toString()] = this.formControl;
//     this.stepForm = this.formBuilder.group(inputFields);
//   }
// }

// export interface FormControlApiValue {
//   getFormMetadataDto(): FormMetadataDto;
//   getValue(): FieldValueDtoBase[];
// }

// export interface FieldControlApiData {
//   fieldValue: FieldValueDtoBase;
//   fieldMetadata: FieldMetadataDtoUI;
// }

// export interface FormControlApiData {
//   id: string;
//   position: number;
//   name: string;
//   fields: FieldControlApiData[];
// }
