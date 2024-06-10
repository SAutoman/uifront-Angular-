import { SearchType } from '@wfm/service-layer/models/dynamic-entity-models';
import { FieldTypeIds } from './FieldTypeIds';

export interface IFilter {
  fieldName: string;
  searchType?: SearchType;
  valueType?: FieldTypeIds;
  value?: any;
  to?: any;
  from?: any;
}
