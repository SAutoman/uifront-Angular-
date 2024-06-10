import { IFilter, VirtualFieldValueDto } from '.';
import { AreaTypeEnum } from './area-type.enum';
import { FieldTypeIds } from './FieldTypeIds';
import { BaseFieldValueDto, BaseFieldValueType } from './FieldValueDto';
import { DataEntity, Paging, Sorting } from './model';

export interface FieldVisualSettings {
  fieldPath: string[];
  isHighlighted?: boolean;
}
export interface DynamicEntityFieldDto {
  id: string;
  type: FieldTypeIds;
  value: BaseFieldValueDto;
}

export interface DynamicEntityDto extends BaseDynamicEntityDto {
  statusId: string;
  createdAt?: Date;
  updatedAt?: Date;
  suppliers?: string[];
  auditors?: string[];
  // fields highlights settings
  visualSettings?: FieldVisualSettings[];
  emailCount?: number;
  // added in UI to support multi RawData ListOfLinks fields
  schemaId?: string;
  virtualFields?: Array<VirtualFieldValueDto<BaseFieldValueType>>;
}

export interface BaseDynamicEntityDto extends DataEntity {
  fields: BaseFieldValueType[];
}

export interface CreateDynamicEntityDto {
  appId: string;
  tenantId: string;
  schemaId: string;
  areaType: AreaTypeEnum;
  fields: BaseFieldValueType[];
}

export interface UpdateDynamicEntityDto extends CreateDynamicEntityDto {
  publicId: string;
}

export interface GetDynamicEntitiesRequestDto {
  tenantId: string;
  areaType: AreaTypeEnum;
  schemaId: string;
  ids: string[];
  paging?: Paging;
  sorting?: Sorting[];
  filters?: IFilter[];
}

export interface UpdateManyDynamicEntityDto {
  fields: BaseFieldValueType[];
  id: string;
}

export interface UpdateManyDynamicEntitiesDto {
  tenantId: string;
  schemaId: string;
  areaType: AreaTypeEnum;
  entities: UpdateManyDynamicEntityDto[];
}

export interface UpdateDynamicEntityVisualSettingsDto {
  tenantId: string;
  areaType: AreaTypeEnum;
  dynamicEntityId: string;
  visualSettings: FieldVisualSettings[];
}

export interface DynamicEntityStatusUsage {
  createdAt: string;
  updatedAt: string;
  id: string;
}
