// /**
//  * global
//  */

// /**
//  * project
//  */
// import { Expression } from '../../obsolete-components/forms/models';

// /**
//  * local
//  */
// import { FuncFieldProps } from './case-form';
// import { ListItemDto } from './list-item.dto';
// import { FieldTypeIds } from './FieldTypeIds';
// import { IFormFieldValidatorUi } from './FormFieldValidator';
// import { RenderType } from './FormFieldModel';

// export interface CaseProcessStepForm {
//   contentId?: string;
//   tenantId?: string;
//   caseId?: string;
//   processStepId?: string;
//   position?: number;
//   id?: string;

//   fieldsMetadata: FieldMetadataDto[];
//   formsMetadata: FormMetadataDto[];
//   functions: Expression[];
// }

// export interface FieldMetadataDto {
//   id: string;
//   position: number;
//   type: FieldTypeIds;
//   name: string;
//   validators: IFormFieldValidatorUi[];
//   isCustom: boolean;
//   sourceFieldId: string;
//   sourceListId: string;
//   renderType: RenderType;
// }
// export interface FieldId {
//   id: string;
//   formId: string;
// }

// /**
//  * the field is not from a nested form, but a low level field
//  * @param x
//  */
// export function isFreeField(x: FieldId) {
//   return !x.formId;
// }

// export interface FieldMetadataDtoUI extends FieldMetadataDto {
//   fieldId: FieldId;
//   funcFieldProps: FuncFieldProps;
//   listItems?: ListItemDto[];
// }

// export interface FormMetadataDto {
//   id: string;
//   documentId: string;
//   position: number;
//   name: string;
//   fields: FieldMetadataDto[];
//   functions: Expression[];
// }

// export interface FormMetadataDtoUI {
//   id: string;
//   documentId: string;
//   position: number;
//   name: string;
//   fields: FieldMetadataDtoUI[];
//   functions: Expression[];
// }

// export interface UpdateCaseProcessStepPositionsDto {
//   caseId: string;
//   caseProcessStepIds: string[];
// }

// export interface ProcessStepName {
//   id: string;
//   name: string;
//   position: number;
//   contentId: string;
// }
