import { FieldRenderTypeEnum } from '@wfm/service-layer';
import { SearchFieldModel } from './SearchFieldModel';

export interface ListSearchFilter<T> extends SearchFieldModel {
  listId: string;
  parentListId?: string;
  items: T[];
  renderType?: FieldRenderTypeEnum;
}
