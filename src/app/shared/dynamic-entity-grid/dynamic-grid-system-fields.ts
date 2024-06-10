import { FieldTypeIds } from '@wfm/service-layer';

export enum GridSystemFieldsEnum {
  STATUS = 'status',
  EMAIL_COUNT = 'emailCount',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  SUPPLIERS = 'suppliers',
  AUDITORS = 'auditors',
  INFO = 'info',
  ACTIONS = 'actions',
  STATUS_ID = 'statusId'
}

export interface SystemFieldsTitleFormatter {
  id: GridSystemFieldsEnum;
  type: FieldTypeIds;
  value: string;
}

export const GridSystemFields: string[] = [
  GridSystemFieldsEnum.STATUS,
  GridSystemFieldsEnum.EMAIL_COUNT,
  GridSystemFieldsEnum.CREATED_AT,
  GridSystemFieldsEnum.UPDATED_AT,
  GridSystemFieldsEnum.SUPPLIERS,
  GridSystemFieldsEnum.AUDITORS
];
