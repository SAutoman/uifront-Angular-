/**
 * global
 */
import { KeyValue } from '@angular/common';

/**
 * project
 */
import { IKeyValueView } from '@wfm/common/models';
import { ConnectorFieldConfiguration } from '@wfm/common/models/connector-field';
import { FieldTypeIds, ListFullData, ListItemDisplayEnum, VirtualFieldValueDto } from '@wfm/service-layer';

/**
 * local
 */
import { DateTimeAdapterEnum } from '../date-time/date-time-adapter.enum';
import { BaseFieldValueType } from '@wfm/service-layer/models/FieldValueDto';

export interface FormVariableDto {
  type: FieldTypeIds;
  value: any;
  /**
   * field property name
   */
  name: string;
  label: string;

  valueInfo?: {
    options?: (KeyValue<string, any> | IKeyValueView<string, any>)[];
    /**
     * the picker type to be used (datePicker, dateTimePicker,timePicker)
     */
    dateTimeAdapterType?: DateTimeAdapterEnum;
    /**
     * list related props
     */
    labelProp?: string;
    valueProp?: string | number;
    parentListId?: string;
    listId?: string;
    listData?: ListFullData;
    listItemDisplaySetting?: ListItemDisplayEnum;
    tenantId?: string;
    fieldPath?: string[];
    /**
     * for connector field
     */
    ownerSchemaId?: string;
    schemaFieldId?: string;
    dynamicEntityId?: string;
    connectorFieldConfiguration?: ConnectorFieldConfiguration;
    exposedFieldsData?: VirtualFieldValueDto<BaseFieldValueType>;
    [attribute: string]: any;
  };

  required?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  autocomplete?: boolean;
  min?: any;
  max?: any;
  isCascadeSelect?: boolean;
  canResetSelection?: boolean;
  showSearchInput?: boolean;
  [attribute: string]: any;
}
