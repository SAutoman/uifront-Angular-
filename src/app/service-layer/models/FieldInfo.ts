import { FieldTypeIds } from './FieldTypeIds';
import { FieldValueDto, ListValue } from './FieldValueDto';
import { DataEntity } from './model';

export interface DynamicEntityFieldInfo {
  id: string;
  publicId: string;
  name: string;
  valueType: FieldTypeIds;
  listId?: string;
  rawDataFieldPublicId: string;
  isSystem?: boolean;
  isCustom?: boolean;
  configuration: any;
  value?: any;
  listValue?: FieldValueDto<ListValue>;
  isValid?: boolean;
  fieldName?: string;
  displayName?: string;
  type?: number;
  schemaFieldConfiguration?: {};
}

export interface FieldDtoAdmin extends DataEntity {
  appPublicId: string;
  name: string;
  type: FieldTypeIds;
}

export interface TenantFieldDto extends DataEntity {
  appPublicId: string;
  name: string;
  type: FieldTypeIds;
  tenantId?: string;
}
