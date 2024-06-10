import { DatasourceField, DatasourceFieldsTree } from '@wfm/report/report-datasource.model';
import { PropertyPathTypeEnum, RawDataPath } from '@wfm/service-layer/models/expressionModel';
import { GridSystemFieldsEnum } from '@wfm/shared/dynamic-entity-grid/dynamic-grid-system-fields';

export interface PrintPreviewFieldsTree extends DatasourceFieldsTree {
  rawDataSchemaFields?: DatasourceField[];
  commentSchemaFields?: DatasourceField[];
}

export function getSystemFieldsForPreview(path: PropertyPathTypeEnum, refFieldName?: string) {
  const systemFields = [];
  systemFields.push({
    id: null,
    fieldName: GridSystemFieldsEnum.CREATED_AT,
    displayName: 'Created At',
    type: 12,
    propertyPath: {
      path: [GridSystemFieldsEnum.CREATED_AT],
      pathType: path,
      rawDataFieldName: path === PropertyPathTypeEnum.RawDataPath ? refFieldName : null,
      commentFieldName: path === PropertyPathTypeEnum.CommentPath ? refFieldName : null
    },
    pathSchemaFieldIds: [],
    position: null
  });

  systemFields.push({
    id: null,
    fieldName: GridSystemFieldsEnum.UPDATED_AT,
    displayName: 'Updated At',
    type: 12,
    propertyPath: {
      path: [GridSystemFieldsEnum.UPDATED_AT],
      pathType: path,
      rawDataFieldName: path === PropertyPathTypeEnum.RawDataPath ? refFieldName : null,
      commentFieldName: path === PropertyPathTypeEnum.CommentPath ? refFieldName : null
    },
    pathSchemaFieldIds: [],
    position: null
  });

  if (path === PropertyPathTypeEnum.RawDataPath) {
    systemFields.push({
      id: null,
      fieldName: GridSystemFieldsEnum.SUPPLIERS,
      displayName: 'Suppliers',
      type: 2,
      propertyPath: <RawDataPath>{
        path: [GridSystemFieldsEnum.SUPPLIERS],
        pathType: path,
        rawDataFieldName: path === PropertyPathTypeEnum.RawDataPath ? refFieldName : null
      },
      pathSchemaFieldIds: [],
      position: null
    });
    systemFields.push({
      id: null,
      fieldName: GridSystemFieldsEnum.AUDITORS,
      displayName: 'Auditors',
      type: 2,
      propertyPath: {
        path: [GridSystemFieldsEnum.AUDITORS],
        pathType: path,
        rawDataFieldName: path === PropertyPathTypeEnum.RawDataPath ? refFieldName : null
      },
      pathSchemaFieldIds: [],
      position: null
    });
  }
  return systemFields;
}
