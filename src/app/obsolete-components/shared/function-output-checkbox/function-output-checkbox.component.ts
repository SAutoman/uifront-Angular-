// /**
//  * global
//  */
// import { Component, OnInit, Input, ViewChildren, QueryList } from '@angular/core';

// /**
//  * project
//  */
// import { FieldDto, FieldValueDtoBase, FieldMetadataDtoUI, FuncFieldProps } from '../../service-layer/models';
// import { AllowedFieldProperties, FieldPropertyType, OutputField } from '../../obsolete-components/forms/models/FunctionQuery';
// import { CaseFieldWrapperComponent } from '../../shared-case-field-wrapper/case-field-wrapper/case-field-wrapper.component';

// import { FunctionFieldModel } from '../function-builder-wrapper/function-builder-wrapper.component';

// /**
//  * local
//  */
// @Component({
//   selector: 'app-function-output-checkbox',
//   templateUrl: './function-output-checkbox.component.html',
//   styleUrls: ['./function-output-checkbox.component.scss']
// })
// export class FunctionOutputCheckboxComponent implements OnInit {
//   @Input() currentField: OutputField;
//   wrapperField: FieldDto;
//   _currentFieldDefault: FunctionFieldModel;
//   isValid: boolean = false;
//   @ViewChildren(CaseFieldWrapperComponent) wrapperFields: QueryList<CaseFieldWrapperComponent>;

//   hintMessage: string;
//   isDefaultValues: boolean = false;
//   isHintMessage: boolean = false;
//   componentId = '2c7a18d4-4adf-4301-8bf7-94501b9e8808';

//   @Input() set currentFieldDefault(value: FunctionFieldModel) {
//     if (value?.field) {
//       this.wrapperField = this.mapCurrentFieldDefault(value);
//     }
//   }

//   @Input() set allowedFieldPropertiesIn(value: FieldPropertyType[]) {
//     if (value) {
//       this.setCheckedProperty(value);
//     }
//   }

//   get FieldPropertyType(): typeof FieldPropertyType {
//     return FieldPropertyType;
//   }

//   allowedFieldPropertiesFields: AllowedFieldProperties[] = [
//     { propertyType: FieldPropertyType.Visible, propertyName: 'Visible', isSelected: true },
//     { propertyType: FieldPropertyType.Editable, propertyName: 'Editable', isSelected: true },
//     { propertyType: FieldPropertyType.DefaultValues, propertyName: 'Default Value', isSelected: false },
//     { propertyType: FieldPropertyType.HintMessage, propertyName: 'Hint Message', isSelected: false }
//   ];

//   allowedFieldPropertiesForms: AllowedFieldProperties[] = [
//     { propertyType: FieldPropertyType.Visible, propertyName: 'Visible', isSelected: true },
//     { propertyType: FieldPropertyType.Editable, propertyName: 'Editable', isSelected: true }
//   ];

//   constructor() {}

//   ngOnInit(): void {}

//   setCheckedProperty(x: FieldPropertyType[]): AllowedFieldProperties[] {
//     if (this.currentField?.isForm) {
//       this.allowedFieldPropertiesFields = this.allowedFieldPropertiesForms;
//     }

//     const temp: AllowedFieldProperties[] = [...this.allowedFieldPropertiesFields];

//     temp.forEach((z) => {
//       const foundType = x.find((j) => j === z.propertyType);
//       z.isSelected = foundType ? true : false;

//       this.isHintMessage = z.propertyType === FieldPropertyType.HintMessage ? true : this.isHintMessage;
//       this.isDefaultValues = z.propertyType === FieldPropertyType.DefaultValues ? true : this.isDefaultValues;
//     });
//     return temp;
//   }

//   onPropertyType(event, item: FieldPropertyType): void {
//     if (event.value && !this.currentField.propertyTypes.includes(item)) {
//       this.currentField.propertyTypes.push(item);
//       this.isDefaultValues = item === FieldPropertyType.DefaultValues ? true : this.isDefaultValues;
//       this.isHintMessage = item === FieldPropertyType.HintMessage ? true : this.isHintMessage;
//     } else {
//       this.currentField.propertyTypes = this.currentField.propertyTypes.filter((x) => x !== item);
//       this.isDefaultValues = item === FieldPropertyType.DefaultValues ? false : this.isDefaultValues;
//       this.isHintMessage = item === FieldPropertyType.HintMessage ? false : this.isHintMessage;
//     }
//   }

//   mapCurrentFieldDefault(x: FunctionFieldModel): FieldDto {
//     const metadata = <FieldMetadataDtoUI>(<any>{ ...x.field });
//     metadata.type = x.field.typeField;
//     metadata.sourceFieldId = x.field.fieldPublicId;
//     metadata.sourceListId = x.field.listPublicId;
//     metadata.name = x.field.fieldName;
//     metadata.position = 0;
//     metadata.listItems = x.listItems;
//     if (!metadata.id) {
//       metadata.id = x.field.fieldPublicId || x.field.listPublicId || x.field.id;
//     }
//     metadata.funcFieldProps = <FuncFieldProps>{
//       visible: true,
//       editable: true,
//       defaultValue: null,
//       hintMessage: null
//     };

//     const value = <FieldValueDtoBase>{
//       id: x.field.id,
//       type: x.field.typeField
//     };

//     return <FieldDto>{ metadata, value: this.currentField.defaultValue ? this.currentField.defaultValue : value };
//   }

//   async onFieldChanged(event?: any): Promise<void> {
//     const wrapperFields = this.wrapperFields.toArray();
//     this.isValid = wrapperFields.filter((f) => !f.isValid()).length === 0;

//     const field = await wrapperFields[0].getValueAndUpdate();
//     this.currentField.defaultValue = field;
//   }
// }
