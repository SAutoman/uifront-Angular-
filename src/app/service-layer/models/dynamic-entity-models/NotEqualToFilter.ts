import { SearchFieldModel } from './SearchFieldModel';

export interface NotEqualToFilter<T> extends SearchFieldModel {
  value: T;
}
