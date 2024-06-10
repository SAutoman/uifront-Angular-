import { FieldTypeIds } from '@wfm/service-layer/models/';
import { SearchType } from './SearchType';
import { CustomSearchType } from './CustomSearchType';
import { PropertyPath } from '../expressionModel';

export interface SearchFieldModel {
  valueType: FieldTypeIds;
  fieldName: string;
  displayName?: string;
  searchType: SearchType;
  customSearchType?: CustomSearchType;
  id: string;
  isValid: boolean;
  value?: any;
  from?: any;
  to?: any;
  isValidRange?: boolean;
  propertyPath?: PropertyPath;
}

export enum PickerViewEnum {
  STATIC = 1,
  DYNAMIC
}

export enum DynamicDateTimeRangeTypeEnum {
  DAYS = 'days',
  MINUTES = 'minutes'
}

export enum DynamicDateTimeRangeKeysEnum {
  FROM = 'from',
  To = 'to',
  DAYS_BEFORE = 'daysBefore',
  DAYS_AFTER = 'daysAfter',
  TIME_BEFORE = 'timeBefore',
  TIME_AFTER = 'timeAfter'
}

export enum DynamicDateTimeSearchValuesEnum {
  Date = 0,
  DateTime = 1,
  Time = 2
}

export interface MappingSearchFieldModel {
  customSearchType?: CustomSearchType;
  value: any;
  from?: any;
  to?: any;
  valueType: FieldTypeIds;
  fieldName: string;
  searchType: SearchType;
  id: string;
}

export interface CustomSuppliersAuditorsFilter extends SearchFieldModel {
  items: string[];
}

export interface ListSearchFieldModel extends SearchFieldModel {
  items?: string[];
}

export interface StatusFieldModel extends SearchFieldModel {
  items?: string[];
}

export interface ConnectorFieldSearchModel extends SearchFieldModel {
  customSearchType: CustomSearchType.Connector;
  searchType: SearchType.Custom;
  valueType: FieldTypeIds.ConnectorField;
  values?: string[];
}

export interface DateTimeSearchFieldModel extends SearchFieldModel {
  viewOption?: PickerViewEnum;
  beforeValue?: string;
  afterValue?: string;
  before?: number;
  after?: number;
  dynamicDateTimeRangeType?: DynamicDateTimeRangeTypeEnum;
  dynamicSearchValue?: DynamicDateTimeSearchValuesEnum;
}
