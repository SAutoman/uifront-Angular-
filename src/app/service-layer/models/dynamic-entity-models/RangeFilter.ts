import { DateTimeSearchFieldModel, SearchFieldModel } from './SearchFieldModel';
// filters with generics
export interface RangeFilter<T> extends SearchFieldModel {
  from: T;
  to: T;
}

export interface DateTimeRangeFilter<T> extends DateTimeSearchFieldModel {
  from: T;
  to: T;
}
