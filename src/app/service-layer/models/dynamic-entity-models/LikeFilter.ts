import { SearchFieldModel } from './SearchFieldModel';

export interface LikeFilter<T> extends SearchFieldModel {
  value: T;
}
