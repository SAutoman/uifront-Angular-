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

// import { FieldTypeIds } from './FieldTypeIds';
// import { FormMetadataDto, FieldMetadataDto, FormMetadataDtoUI, FieldMetadataDtoUI } from './CaseProcessStepForm';
// import { CaseStatus } from './CaseStatus';

// // POST - DRAG AND DROP
// export interface FormDto {
//   metadata: FormMetadataDto;
//   fields: CaseProcessStepFieldValueDto[];
// }

// export interface FormDtoUI {
//   metadata: FormMetadataDtoUI;
//   fields: CaseProcessStepFieldValueDtoUI[];
//   visible: boolean;
//   editable: boolean;
//   expanded: boolean;
//   isFormHasAnyValues: boolean;
//   isValid: boolean;
// }

// export interface FieldDto {
//   metadata: FieldMetadataDto;
//   value: FieldValueDtoBase;
// }

// export interface FuncFieldProps {
//   visible: boolean;
//   editable: boolean;
//   hintMessage: string;
//   defaultValue: FieldValueDtoBase;
// }

// export interface FieldValueDtoBase {
//   id: string;
//   type: FieldTypeIds;
// }

// export interface FieldValueDto<T> extends FieldValueDtoBase {
//   value: T;
// }

// export interface FieldDtoUI {
//   metadata: FieldMetadataDtoUI;
//   value: FieldValueDtoBase;
// }

// export interface CaseProcessStepFieldValueDto {
//   position: number;
//   field: FieldValueDtoBase;
// }

// export interface CaseProcessStepFieldValueDtoUI extends FieldDtoUI {
//   position: number;
// }

// // GET ON EXPANDED STEP
// export interface CaseProcessStepFormResponse {
//   version: number;
//   status: CaseStatus;
//   forms: FormDto[];
//   fields: FieldDto[];
//   functions: Expression[];
// }

// // POST - SUBMIT FORM
// export interface CaseProcessFormDataDto {
//   position: number;
//   formId: string;
//   fields: CaseProcessStepFieldValueDto[];
// }

// export interface CaseProcessFormFieldValueDto {
//   field: FieldValueDtoBase;
//   position: number;
// }

// export interface SubmitCaseProcessStepFormCommandDto {
//   contentId: string;
//   tenantId: string;
//   version: number;
//   formValues: CaseProcessFormDataDto[];
//   fieldValues: CaseProcessStepFieldValueDto[];
// }
