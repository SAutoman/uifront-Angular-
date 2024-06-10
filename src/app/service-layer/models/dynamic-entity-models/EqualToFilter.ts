import { SearchFieldModel } from './SearchFieldModel';

export interface EqualToFilter<T> extends SearchFieldModel {
  value: T;
}
