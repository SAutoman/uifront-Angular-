// export enum FilterType {
//   None = 0,
//   Search,
//   Range
// }

// export interface Filter {
//   fieldName: string;
//   type: FilterType;
// }

// export interface RangeFilter extends Filter {
//   from: any;
//   to: any;
// }

// export interface SearchFilter extends Filter {
//   value: any;
// }

// export function createSearchFilter(fieldName: string, value: any): SearchFilter {
//   return <SearchFilter>{
//     type: FilterType.Search,
//     value: value,
//     fieldName: fieldName
//   };
// }

// export function createRangeFilter(fieldName: string, from: any, to: any): RangeFilter {
//   return <RangeFilter>{
//     type: FilterType.Range,
//     from: from,
//     to: to,
//     fieldName: fieldName
//   };
// }
