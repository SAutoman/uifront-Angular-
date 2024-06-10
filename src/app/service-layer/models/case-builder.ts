import { FieldTypeIds } from './FieldTypeIds';

export interface CaseBuilderDto {
  id?: string;
  name: string;
  appId: string;
  tenantId: string;
  functions: [];
  validators: [];
  fields: CaseBuilderFieldDto[];
  contentId: string;
}

export interface CaseBuilderFieldDto {
  name: string;
  isCustom: boolean;
  publicId: string;
  position: number;
  type: FieldTypeIds;
}

export interface UpdateCaseBuilderDto {
  name: string;
  appId: string;
  tenantId: string;
  functions: [];
  validators: [];
  caseBuilderPublicId: string;
  newFields: CaseBuilderFieldDto[];
  updatedFields: CaseBuilderFieldDto[];
  deletedFields: string[];
}
