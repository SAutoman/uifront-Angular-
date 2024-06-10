// /**
//  * global
//  */

// /**
//  * project
//  */
// import { FieldValueDtoBase, FormDtoUI, FieldDtoUI, ListItemDto } from '../../../service-layer';
// import { Expression } from '../../forms/models';

// /**
//  * local
//  */
// import { ProcessStepFieldModel } from './ProcessStepFieldModel';
// import { ProcessStepFormDto } from './ProcessStepFormDto';

// export interface ProcessStepUIModel {
//   id?: string;
//   name: string;
//   caseFormWrapper: CaseFormWrapper[];
//   contentId: string;
//   version: number;
//   isLoaded: boolean;
//   functions: Expression[];
//   isFreeFields: boolean;
// }

// export enum CaseFormFieldType {
//   Unknown = 0,
//   Field = 1,
//   Form = 2
// }

// export interface CaseFormWrapper {
//   elementType: CaseFormFieldType;
//   field: FieldDtoUI;
//   form: FormDtoUI;
//   position: number;
// }

// // FIELD WITH VALUES ON EXPAND
// export interface FieldsValuesModel extends ProcessStepFieldModel {
//   listItems?: ListItemDto[];
//   value: FieldValueDtoBase;
//   files?: File[];
// }

// export interface ProcessStepFormDtoFields extends ProcessStepFormDto {
//   fields: FieldsValuesModel[];
//   image: string;
// }

// export interface ProcessStepFieldModelValue<T> extends ProcessStepFieldModel {
//   value: T;
// }

// export interface ProcessStepFieldModelValueNumber extends ProcessStepFieldModelValue<number> {}

// export interface ProcessStepFieldModelValueString extends ProcessStepFieldModelValue<string> {}

// export interface ProcessStepFieldModelValueDate extends ProcessStepFieldModelValue<Date> {}
