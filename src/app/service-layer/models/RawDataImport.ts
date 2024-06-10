import { BaseFieldValueType } from './FieldValueDto';
import { DynamicEntityFieldInfo } from './FieldInfo';

export interface RawDataImport {
  appId: string;
  tenantId: string;
  records: [
    {
      externalSystemRef: string;
      data: BaseFieldValueType[];
    }
  ];
}

export interface RawDataCreateUpdate {
  appId: string;
  tenantId: string;
  records: {
    externalSystemRef: string;
    data: BaseFieldValueType[];
  };
  publicId?: string;
}

export interface RawDataImportCreate {
  tenantId: string;
  rawDataSchemaId: string;
  extRef: string;
  records: Record[];
}

export interface Record {
  fields: BaseFieldValueType[];
  createdAt: Date;
  updatedAt: Date;
  id: string;
}

// new
export interface RawDataNewCreate {
  appId: string;
  tenantId: string;
  externalSystemRef: string; // This should be removed and should be send inside 'Fields' property below
  fields: DynamicEntityFieldInfo[];
  publicId?: string;
}

export interface RawDataNewUpdate extends RawDataNewCreate {
  publicId: string;
}
