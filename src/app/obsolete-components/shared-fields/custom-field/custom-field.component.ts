// /**
//  * global
//  */
// import { Component, OnInit, Output, EventEmitter, ViewChild, Input } from '@angular/core';
// import { FormGroup, FormBuilder, Validators } from '@angular/forms';
// import { MatSnackBar } from '@angular/material/snack-bar';
// import { cloneDeep } from 'lodash-core';

// /**
//  * project
//  */
// import { FieldTypeIds, IFormFieldValidatorUi, FormFieldModel, ListItemDto } from '@wfm/service-layer';
// import { UIFormFieldModel } from '@wfm/obsolete-components/forms/models';

// /**
//  * local
//  */
// @Component({
//   selector: 'app-custom-field',
//   templateUrl: './custom-field.component.html',
//   styleUrls: ['./custom-field.component.scss']
// })
// export class CustomFieldComponent implements OnInit {
//   @Output() onFieldCreated: EventEmitter<UIFormFieldModel> = new EventEmitter();
//   @Output() onFieldUpdated: EventEmitter<UIFormFieldModel> = new EventEmitter();
//   @ViewChild('formRef') formRef;
//   @Input() isNew: boolean;
//   @Input() isCustom: boolean;
//   customField: FormGroup;
//   componentId = '96f40dbc-edfe-4527-aba9-9d0fb5815841';

//   _listItems: ListItemDto[] = [];
//   @Input() set listItems(value: ListItemDto[]) {
//     if (value) {
//       this._listItems = value;
//     }
//   }

//   get listItems() {
//     return this._listItems;
//   }

//   _field: UIFormFieldModel = <UIFormFieldModel>{};
//   @Input() set field(value: UIFormFieldModel) {
//     if (value) {
//       this._field = value;
//       this.validators = this._field.model.validators;
//       this.selectedFieldType = this._field.type;
//       this.listItems = this._field.listItems;
//     }
//   }

//   get field(): UIFormFieldModel {
//     return this._field;
//   }

//   validators: IFormFieldValidatorUi[] = [];
//   selectedFieldType: FieldTypeIds;
//   updatedFieldType: FieldTypeIds;

//   fieldTypes = [
//     { typeName: 'Integer', typeValue: FieldTypeIds.IntField },
//     { typeName: 'Text', typeValue: FieldTypeIds.StringField },
//     { typeName: 'Decimal', typeValue: FieldTypeIds.DecimalField },
//     { typeName: 'Yes/No or Radio Button', typeValue: FieldTypeIds.BoolField },
//     { typeName: 'Date', typeValue: FieldTypeIds.DateField },
//     { typeName: 'File / Attachment', typeValue: FieldTypeIds.FileField },
//     { typeName: 'Big Text', typeValue: FieldTypeIds.TextareaField },
//     { typeName: 'Time', typeValue: FieldTypeIds.TimeField }
//   ];

//   constructor(private formBuilder: FormBuilder, private snackBar: MatSnackBar) {
//     this._field = <UIFormFieldModel>{
//       model: <FormFieldModel>{
//         validators: [],
//         fieldName: '',
//         typeField: FieldTypeIds.Unknown
//       }
//     };
//   }

//   ngOnInit(): void {
//     this.customField = this.formBuilder.group({
//       name: [
//         {
//           value: this.field ? this.field.model.fieldName : '',
//           disabled: !this.isCustom && !this.isNew
//         },
//         Validators.required
//       ],

//       type: [
//         {
//           value: this.field ? this.field.model.typeField : '',
//           disabled: !this.isCustom && !this.isNew
//         },
//         Validators.required
//       ]
//     });
//   }

//   onSubmit(formValue: { name: string }): void {
//     this.field.model.fieldName = formValue.name;
//     this.field.model.validators = this.validators;
//     this.field.name = formValue.name;
//     this.field.isValid = true;

//     if (this.updatedFieldType) {
//       this.field.model.typeField = this.updatedFieldType;
//       this.field.type = this.updatedFieldType;
//     } else {
//       this.field.model.typeField = this.selectedFieldType;
//       this.field.type = this.selectedFieldType;
//     }

//     if (this.isNew) {
//       this.field.model.isCustom = true;
//       this.onFieldCreated.emit(cloneDeep(this.field));

//       this.formRef.resetForm();
//       this.customField.reset();
//       this.validators = [];
//       this.selectedFieldType = null;
//     } else {
//       this.field.changed = true;
//       this.onFieldUpdated.emit(this.field);
//       this.snackBar.open('Field Update Successfully', 'CLOSE', {
//         duration: 3000
//       });
//     }
//   }

//   onSelectedType(event): void {
//     this.updatedFieldType = event.value;
//     if (!this.isNew) {
//       this.field.model.validators = [];
//       this.validators = [];
//     }
//   }

//   onFieldEdited(id: string): void {
//     this.field.isValid = this.field.model.validators.every((x) => x.isValid) ? true : false;
//     this.field.changed = true;
//     this.onFieldUpdated.emit(this.field);
//   }
// }
