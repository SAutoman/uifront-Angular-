import { IConfigurableListItem } from '@wfm/common/models';
import { AreaTypeEnum, FieldTypeIds } from '@wfm/service-layer';
import { PropertyPath } from '@wfm/service-layer/models/expressionModel';

export interface FieldPathOutput {
  /**
   * the key which identifies where the selected field is to be used (minuend, result, etc)
   */
  fieldKey: string;
  fieldPaths: PropertyPathExtended[];
  isValid: boolean;
  entityType: AreaTypeEnum;
}

export interface FieldPathInput {
  /**
   * the key which identifies where the selected field is to be used (minuend, result, etc)
   */
  fieldKey: string;
  allowedAreaTypes: AreaTypeEnum[];
  fieldPaths?: PropertyPath[];
  entityType?: AreaTypeEnum;
  entityRefName?: string;
  disableEntitySelector?: boolean;
}

export interface PropertyPathExtended extends PropertyPath {
  type?: FieldTypeIds;
  field?: IConfigurableListItem;
}
