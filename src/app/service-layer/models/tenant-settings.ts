import { UiAreasEnum } from '.';
import { DataEntity } from './model';
import { Settings } from './user-settings';

export const rawDataOnSingleCase = 'rawDataOnSingleCase';
export const ADMIN_CASE_FIELDS_VISIBILITY_KEY = 'adminCaseFieldsVisibility';
export const ADMIN_RAW_DATA_FIELDS_VISIBILITY_KEY = 'adminRawDataFieldsVisibility';

export const processStepNameFormat = 'processStepNameFormat';
export const allowManualCreation = 'allowManualCreation';
export const extRefIdRequired = 'extRefIdRequired';
export const applicationTheme = 'applicationTheme';
export const keyForSchemaTitleSettings = 'schemaTitleSettings';

export interface TenantSettingsDto extends DataEntity {
  settings: Settings[];
  tenantId: string;
}

export interface FieldsInProcessStepName {
  index: number;
  truncateSymbols: number;
  showFieldName: boolean;
}

export interface CreateTenantSettings {
  tenantId: string;
  key: string;
  SettingsJson: any;
}

export interface RemoveTenantSettingsCommand {
  publicId: string;
  tenantId: string;
}

export interface SchemaTitleSettings {
  schemaId: string;
  schemaTitles: SchemaTitleSettingModel[];
}
export interface AdditionalSettingItem {
  fieldName: string;
  numberOfSymbolsFieldName: number;
  numberOfSymbolsFieldValue?: number;
  position?: number;
}
export interface AdditionalSettings {
  [key: string]: AdditionalSettingItem;
}

export interface SchemaTitleSettingModel {
  area: UiAreasEnum;
  fields: string[];
  keyValueSeparator: string;
  fieldSeparator: string;
  additionalSettings?: AdditionalSettings;
}

export interface UserSelectedRolesData {
  tenantAdmin: SchemaRightsEnum[];
  tenantUser: SchemaRightsEnum[];
  supplier: SchemaRightsEnum[];
  auditor: SchemaRightsEnum[];
}

export enum SchemaRightsEnum {
  Unknown = 0,
  Add = 'add',
  Edit = 'edit',
  Delete = 'delete',
  HideGridSelectbox = 'hideGridSelection',
  EnableLayout = 'enableLayoutAndGridOptions',
  HideSchemaFromMenu = 'isSchemaHidden',
  ShowVisualViewButton = 'showVisualView'
}

export interface RightsData {
  name: string;
  id: SchemaRightsEnum;
}

export const SchemaRights: { [key: string]: RightsData } = {
  [SchemaRightsEnum.Add]: { name: 'Add', id: SchemaRightsEnum.Add },
  [SchemaRightsEnum.Edit]: { name: 'Edit', id: SchemaRightsEnum.Edit },
  [SchemaRightsEnum.Delete]: { name: 'Delete', id: SchemaRightsEnum.Delete },
  [SchemaRightsEnum.HideGridSelectbox]: { name: 'Hide grid selection', id: SchemaRightsEnum.HideGridSelectbox },
  [SchemaRightsEnum.EnableLayout]: { name: 'Enable layout and grid options', id: SchemaRightsEnum.EnableLayout },
  [SchemaRightsEnum.HideSchemaFromMenu]: { name: 'Hide Schema From Menu', id: SchemaRightsEnum.HideSchemaFromMenu },
  [SchemaRightsEnum.ShowVisualViewButton]: { name: 'Show visual view', id: SchemaRightsEnum.ShowVisualViewButton }
};
