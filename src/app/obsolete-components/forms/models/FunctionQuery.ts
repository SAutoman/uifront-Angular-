// /**
//  * global
//  */

// /**
//  * project
//  */
// import { DataEntity, FormFieldModel, FieldValueDtoBase, ListItemDto } from '../../../service-layer';
// import { ProcessStepFormDto } from '../../process-step/models';

// /**
//  * local
//  */

// export enum FieldPropertyType {
//   Unknown = 0,
//   Visible = 1,
//   Editable = 2,
//   DefaultValues = 3,
//   HintMessage = 4
// }

// export interface AllowedFieldProperties {
//   propertyType: FieldPropertyType;
//   propertyName: string;
//   isSelected: boolean;
// }

// export interface Expression extends DataEntity {
//   name: string;
//   function: RuleSetCustom;
//   // fields: FormFieldModel[];
//   outputFields: OutputField[];
//   outputForms: OutputField[];
//   expanded: boolean;
// }

// export interface OutputField {
//   propertyTypes: FieldPropertyType[];
//   fieldName: string;
//   fieldRef: FormFieldModel;

//   formName: string;
//   formId: string;

//   hintMessage: string;
//   defaultValue: FieldValueDtoBase;
//   isForm: boolean;
// }

// export interface RuleSetCustom {
//   condition: string;
//   rules: CustomRule[];
// }

// export interface CustomRule extends Rule {
//   fieldRef: FormFieldModel;
//   formRef: ProcessStepFormDto;
// }

// export interface CustomOption extends Option {
//   listItemsRef: ListItemDto;
// }
