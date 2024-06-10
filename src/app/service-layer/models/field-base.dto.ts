/**
 * global
 */
import { KeyValue } from '@angular/common';

/**
 * project
 */
import {
  DefaultValueTypeEnum,
  DynamicValueTypeEnum,
  SystemEventTypes,
  SystemValueTypeEnum
} from '@wfm/common/field/field-default-value/FieldDefaultValues';
import { NumberFormatSettings } from '@wfm/common/field/number-field-format/i-number-field-format-output-event';
import { ConnectorFieldConfiguration } from '@wfm/common/models/connector-field';
import { ListItemDisplayEnum, ListItemDto } from '@wfm/service-layer/models/list-item.dto';

/**
 * local
 */
import { AreaTypeEnum } from './area-type.enum';
import { FieldTypeIds } from './FieldTypeIds';
import { ValidatorDtoType, ValidatorType } from './FieldValidator';
import { DataEntity } from './model';
import { BaseFieldValueType } from './FieldValueDto';
import { VirtualFieldValueDto } from './schema';
import { HyperLinkVisibiltySettingEnum } from '@wfm/common/field/field-hyperlink-settings/field-hyperlink-settings.component';
import { FileNameSettingEnum } from '@wfm/common/field/file-name-settings/file-name-settings.component';

export enum FieldRenderTypeEnum {
  select = 'select',
  radio = 'radio',
  checkbox = 'checkbox'
}

export interface IFieldBaseDto extends DataEntity {
  type: FieldTypeIds;
  /**
   * this is tmp field for save compatibility with preview models
   */
  name?: string;
  /**
   * normalized, js valid field name
   */
  fieldName?: string;
  /**
   * input user entered field name
   */
  displayName?: string;
  isSystem?: boolean;
  configuration?: IBaseFieldConfiguration;
  areaTypes?: AreaTypeEnum[];
  /**
   * true for fields created for some specific schema (in schema builder)
   */
  isCustom?: boolean;
  valueInfo?: IBaseFieldConfiguration;
  [key: string]: any;
}
export interface IBaseFieldConfiguration {
  position: number;
  type?: FieldTypeIds;
  label?: string;
  placeholder?: string;
  readonly?: boolean;
  isExternalIdentifier?: boolean;
  listId?: string;
  parentListId?: string;
  options?: ListItemDto[];
  validators?: KeyValue<ValidatorType, ValidatorDtoType>[];
  labelProp?: string;
  valueProp?: string;
  value?: IFieldValueDto;
  schemaId?: string;
  schemaAreaType?: AreaTypeEnum;
  renderType?: FieldRenderTypeEnum;
  // a flag used by backend to decide whether child dynamic entity is to be deleted when parent dynamic entity is removed
  cascade?: boolean;
  defaultValueType?: DefaultValueTypeEnum;
  dynamicValue?: DynamicValueTypeEnum;
  isSystemDefault?: boolean;
  systemDefaultType?: SystemValueTypeEnum;
  systemDefaultEvent?: SystemEventTypes;
  numberFormatting?: NumberFormatSettings;
  allowHighlighting?: boolean;
  highlightColor?: string;
  listItemDisplaySetting?: ListItemDisplayEnum;
  isHyperlink?: boolean;
  hyperlinkTemplate?: string;
  hyperLinkVisibility?: HyperLinkVisibiltySettingEnum;
  customHyperLinkLabel?: string;
  // ui props
  disabledByRule?: boolean;
  hiddenByRyRule?: boolean;
  fieldPath?: string[];
  showTooltip?: boolean;
  /**
   * connectorField related  settings
   */
  connectorFieldConfiguration?: ConnectorFieldConfiguration;
  exposedFieldsData?: VirtualFieldValueDto<BaseFieldValueType>;
  /**
   * Auto Increment Field
   */
  isAutoIncremented?: boolean;
  defaultIncrementValue?: number;

  [key: string]: any;
  /**
   * Thumbnail Settings
   */
  thumbnailEnabled?: boolean;
  imageMaxSize?: number;
  aspectRatio?: string;
  fileNameSetting?: FileNameSettingEnum;
}

interface IFieldValue {
  /**
   * use js valid user field name for it with transformation
   * @example "Some User * field (Name)" => "some_user_field_name"
   * @example "a) Some User * field (Name)" => "a_some_user_field_name"
   */
  id: string;
  type: FieldTypeIds;
}

export interface IFieldValueDto<T = any> extends IFieldValue {
  value?: T;
}

export interface ICreateTenantFieldDto extends IFieldBaseDto {
  tenantId: string;
}

export interface IUpdateTenantFieldDto {
  targetId: string;
  tenantId: string;
  newField: IFieldBaseDto;
}

export interface DeleteTenantFieldByPublicIdCommand {
  publicId: string;
  tenantId: string;
}
