import { IConfigurableListItem } from '@wfm/common/models';
import { FieldTypeIds, Roles } from '@wfm/service-layer';

export enum ExpressionSystemFieldEnum {
  userGroups = 'userGroups',
  companies = 'companies',
  roles = 'roles',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  statusId = 'statusId'
}

export interface CurrentUserData {
  userGroups: string[];
  companyId: string;
  role: Roles;
}

export const currentUserGroupField: IConfigurableListItem = {
  id: ExpressionSystemFieldEnum.userGroups,
  type: FieldTypeIds.MultiselectListField,
  name: 'userGroups',
  viewName: "Current User's Groups",
  configuration: {
    position: 0,
    options: [],
    forExpressions: true
  }
};
export const currentCompaniesField: IConfigurableListItem = {
  id: ExpressionSystemFieldEnum.companies,
  type: FieldTypeIds.MultiselectListField,
  name: 'companies',
  viewName: "Current User's Company",
  configuration: {
    position: 0,
    options: [],
    forExpressions: true
  }
};
export const currentRolesField: IConfigurableListItem = {
  id: ExpressionSystemFieldEnum.roles,
  type: FieldTypeIds.MultiselectListField,
  name: 'roles',
  viewName: "Current User's Role",
  configuration: {
    position: 0,
    options: [],
    forExpressions: true
  }
};

export const createdAtField: IConfigurableListItem = {
  id: ExpressionSystemFieldEnum.createdAt,
  type: FieldTypeIds.DateTimeField,
  name: 'createdAt',
  viewName: 'Created At',
  configuration: {
    position: 0,
    options: [],
    forExpressions: true
  }
};

export const updatedAtField: IConfigurableListItem = {
  id: ExpressionSystemFieldEnum.updatedAt,
  type: FieldTypeIds.DateTimeField,
  name: 'updatedAt',
  viewName: 'Updated At',
  configuration: {
    position: 0,
    options: [],
    forExpressions: true
  }
};

export const statusField: IConfigurableListItem = {
  id: ExpressionSystemFieldEnum.statusId,
  type: FieldTypeIds.MultiselectListField,
  name: 'statusId',
  viewName: 'Status',
  configuration: {
    position: 0,
    options: [],
    forExpressions: true
  }
};

export function getSystemFields(): IConfigurableListItem[] {
  return [currentUserGroupField, currentCompaniesField, currentRolesField, createdAtField, updatedAtField, statusField];
}
