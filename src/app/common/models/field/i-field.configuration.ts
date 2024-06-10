import { KeyValue } from '@angular/common';
import {
  ComputedValueTriggerEventEnum,
  DefaultValueTypeEnum,
  DynamicValueTypeEnum,
  SystemEventTypes,
  SystemValueTypeEnum
} from '@wfm/common/field/field-default-value/FieldDefaultValues';
import { NumberFormatSettings } from '@wfm/common/field/number-field-format/i-number-field-format-output-event';
import { IMinMax } from '@wfm/common/models';
import { FieldRenderTypeEnum, FieldTypeIds, ListItemDisplayEnum, ValidatorModelUi, VirtualFieldValueDto } from '@wfm/service-layer';
import { ConnectorFieldConfiguration } from '../connector-field';
import { KeyValueView } from '../i-key-value-view';
import { BaseFieldValueType } from '@wfm/service-layer/models/FieldValueDto';
import { HyperLinkVisibiltySettingEnum } from '@wfm/common/field/field-hyperlink-settings/field-hyperlink-settings.component';
import { FileNameSettingEnum } from '@wfm/common/field/file-name-settings/file-name-settings.component';

export interface IFieldConfiguration extends IMinMax {
  // base fields
  position: number;
  typeId?: FieldTypeIds;
  /**
   * label/name
   */
  label?: string;
  placeholder?: string;

  readonly?: boolean;
  isExternalIdentifier?: boolean;
  /**
   * for select fields
   */
  listId?: string;
  parentListId?: string;
  options?: (KeyValue<string, any> | KeyValueView<string, any>)[];
  /**
   * for select option field - view value
   */
  labelProp?: string;
  /**
   * for select option field - id or key of option
   */
  valueProp?: string | number;

  // validation
  required?: boolean;
  min?: number | string;
  max?: number | string;
  minMax?: IMinMax;
  date?: Date | string;
  time?: Date | string;
  dateTime?: Date | string;

  value?: any;

  regExp?: string;
  email?: boolean;
  integer?: boolean;
  decimal?: boolean;
  validators?: ValidatorModelUi[];
  renderType?: FieldRenderTypeEnum;
  /**
   * default value props
   */
  defaultValueType?: DefaultValueTypeEnum;
  dynamicValue?: DynamicValueTypeEnum;
  isSystemDefault?: boolean;
  systemDefaultType?: SystemValueTypeEnum;
  systemDefaultEvent?: SystemEventTypes;
  computeDefaultValueFormula?: string;
  computeTriggerEvent?: ComputedValueTriggerEventEnum;
  numberFormatting?: NumberFormatSettings;
  /**
   * field highlighting props
   */
  allowHighlighting?: boolean;
  highlightColor?: string;
  /**
   * ListItemKey Display
   */
  listItemDisplaySetting?: ListItemDisplayEnum;
  /**
   * hyperLink settings - 2706
   */
  isHyperlink?: boolean;
  hyperlinkTemplate?: string;
  hyperLinkVisibility?: HyperLinkVisibiltySettingEnum;
  customHyperLinkLabel?: string;
  /**
   * connectorField related  settings
   */
  connectorFieldConfiguration?: ConnectorFieldConfiguration;
  exposedFieldsData?: VirtualFieldValueDto<BaseFieldValueType>;
  /**
   * Auto Increment settings
   */
  isAutoIncremented?: boolean;
  defaultIncrementValue?: number;
  /**
   * Thumbnail Settings
   */
  thumbnailEnabled?: boolean;
  imageMaxSize?: number;
  aspectRatio?: string;
  /** File Name Setting */
  fileNameSetting?: FileNameSettingEnum;
  /**
   * ui prop
   */
  fieldPath?: string[];
  showTooltip?: boolean;

  [key: string]: any;
}
