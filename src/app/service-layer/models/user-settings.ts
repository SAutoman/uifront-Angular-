import { DataEntity } from './model';
import { GridSettingsBase, ColumnSettingsBase } from './grid-settings';
import { Roles } from './user-profile';
import { TimePeriodFormat } from './TimePeriodFormat';
import { CaseViewEnum } from '@wfm/workflow-state/workflow-states-list/workflow-states-list.component';
import { DynamicEntityCreateAnotherSetting } from '@wfm/tenants/manual-creation-settings-by-schema/create-another/create-another.component';
import { CommentPath, ProcessStepPath, PropertyPath, RawDataPath } from './expressionModel';

export enum StartPage {
  Unknown = 0,
  RawDataList = 1,
  CasesList = 2
}

export enum SortingSettingEnum {
  default = 0,
  oldestFirst,
  newestFirst
}

export enum EvokedAnswerSettingsEnum {
  AskEveryTime = 0,
  Yes,
  No
}

export enum EvokedSettingsTitlesEnum {
  ForPostCreateAction = 'Do you want to get redirected to case details?',
  ForStepResolutionConfirmation = 'Do you want to avoid confirmation for every step resolution?'
}

export const appStartPage = 'appStartPage';
export const appRawDataSearchProfile = 'appRawDataSearchProfile';
export const appCaseSearchProfile = 'appCaseSearchProfile';
export const appReportSearchProfile = 'appReportSearchProfile';
export const appTemplateFieldSearchProfile = 'appTemplateFieldSearchProfile';
// export const appGridLayout = 'appGridLayout';
// export const appCaseViewLayout = 'appCaseViewLayout';
export const appUsersGridSettings = 'appUsersGridSettings';

export const appCreateUserGroupGridSetting = 'appCreateUserGroupGridSettings';
export const appExistingUserGroupGridSetting = 'appExistingUserGroupGridSetting';
export const appDateFormatKey = 'appDateFormat';
export const appProcessNameFormat = 'appProcessNameFormat';
export const startOfWeekSettingsKey = 'appStartOfWeek';

export const rawDataGridSettings = 'rawDataGridSettings';
export const dynamicGridSettingsKey = 'dynamicGridSettings';
export const reportGridSettingsKey = 'reportGridSettings';
export const dynamicGridCasesSettingsKey = 'dynamicGridCasesSettings';
export const usersGridSettings = 'usersGridSettings';
export const createUserGroupGridSetting = 'createUserGroupGridSettings';
export const existingUserGroupGridSetting = 'existingUserGroupGridSetting';
export const selectedLayout = 'selectedLayout';
// previous key 'schemasGridSettings'
export const schemasGridSettingsKey = 'schemasGridSetting';
//previous key - 'schemaGridState'
export const schemasGridStateKey = 'schemasGridState';
export const processStepsGridSettings = 'processStepsGridSettings';
export const invitationsGridSettings = 'invitationsGridSettings';
export const registeredUsersGridSettings = 'registeredUsersGridSettings';
export const gridLayout = 'gridLayout';
export const profilePicture = 'profilePicture';
export const tenantLogo = 'tenantLogo';
export const dynamicCardSettingsKey = 'dynamicCardSettings';
export const sortingSettingsKey = 'userSortingSettings';
export const evokedAnswerSettingsKey = 'evokedAnswerSettingsKey';
export const searchTimeRangeKey = 'searchTimeRangeKey';
export const tenantDocumentManagementSettingKey = 'documentManagementSetting';

export interface PermissionSettings {
  add: boolean;
  edit: boolean;
  delete: boolean;
  hideGridSelection?: boolean;
  enableLayoutAndGridOptions?: boolean;
  allowGridStatusChange?: boolean;
  allowedSearchProfiles?: string[];
  defaultSearchProfile?: string;
  isSchemaHidden?: boolean;
  showVisualView?: boolean;
  disableMultiCreation?: boolean;
  defaultLayout?: string;
  statusesWithDisabledDelete?: string[];
  loadSearchAutomatically?: boolean;
}

export interface Settings extends DataEntity {
  key: string; // would be the column in the table
  value: any; // would be settings json
  fromUser: string;
  fromGroup: string;
  isUnique: boolean;
}

export interface UserSettingsDto extends DataEntity {
  settings: Settings[];
  userId: string;
  tenantId: string;
}

export interface SettingsUI {
  key: string;
  value: any;
  id: string;
  isUnique?: boolean;
}

export interface SettingsKeys {
  keys: string[];
  isExclusive: boolean;
}

export interface GridSettingsDto {
  gridSettings: GridSettingsBase;
  columnSettings: ColumnSettingsBase[];
}

export interface ManualCreationSettings {
  rolePermissions: RoleManualCreation[];
  userGroupPermissions?: UserGroupManualCreation[];
  disableMultiCreation?: boolean;
  caseViewSetting?: CaseViewEnum;
  createAnotherSetting?: DynamicEntityCreateAnotherSetting;
  allowGridStatusChange?: boolean;
  loadSearchAutomatically?: boolean;
}

export interface PermissionsModel {
  permission: PermissionSettings;
}

export interface UserGroupManualCreation extends PermissionsModel {
  groupId: string;
}

export interface RoleManualCreation extends PermissionsModel {
  role: Roles;
}

export interface UserCaseCardsDto {
  state: boolean;
  width: string;
}

export interface UserCardsSettings {
  open: UserCaseCardsDto;
  inProgress: UserCaseCardsDto;
  done: UserCaseCardsDto;
  approved: UserCaseCardsDto;
  reopened: UserCaseCardsDto;
}

export interface UserSettingsLayout {
  id: string;
  name: string;
  searchModel: any;
  statuses: UserCardsSettings;
}

export interface FieldSetting {
  field: string;
  timePeriod: TimePeriodFormat;
  from?: string;
  to?: string;
}

export interface PrintSettingField {
  treePathString: string;
  propertyPath: PropertyPath | ProcessStepPath | RawDataPath | CommentPath;
}

export interface PrintPreviewSettingValues {
  rawDataSchemaFields: PrintSettingField[];
  caseSchemaFields: PrintSettingField[];
  processStepSchemaFields: PrintSettingField[];
  commentSchemaFields: PrintSettingField[];
}

export interface PrintPreviewSetting {
  settings: PrintPreviewSettingValues;
}
