// import { EnumConverter, IKeyValueView, KeyValueView } from '../../common/models';

// export enum RawDataStatus {
//   Unknown = 0,
//   Unassigned = 1,
//   Open = 2,
//   InProgress = 3,
//   Done = 4,
//   Approved = 5
// }
// export const RawDataStatusNameMap: {
//   get: (type: RawDataStatus | string) => IKeyValueView<string, RawDataStatus>;
//   has: (type: RawDataStatus | string) => boolean;
//   is: (value: RawDataStatus | string, type: RawDataStatus) => boolean;
// } = (() => {
//   const map = new Map<RawDataStatus, IKeyValueView<string, RawDataStatus>>();
//   const converter = new EnumConverter(RawDataStatus);

//   const setItem = (type: RawDataStatus, viewValue: string) => {
//     const kv = converter.getKeyValue(type);
//     map.set(kv.value, new KeyValueView(kv.key, kv.value, viewValue));
//   };

//   setItem(RawDataStatus.Unknown, 'Unknown');
//   setItem(RawDataStatus.Unassigned, 'Unassigned');
//   setItem(RawDataStatus.Open, 'Open');
//   setItem(RawDataStatus.InProgress, 'InProgress');
//   setItem(RawDataStatus.Done, 'Done');
//   setItem(RawDataStatus.Approved, 'Approved');

//   const has = (type: RawDataStatus | string) => {
//     const kv = converter.getKeyValue(type);
//     if (!kv) {
//       return false;
//     }
//     return map.has(kv.value);
//   };

//   const getKv = (type: RawDataStatus | string) => {
//     if (!has(type)) {
//       return { ...map.get(RawDataStatus.Unknown) };
//     }
//     const kv = converter.getKeyValue(type);
//     return { ...map.get(kv.value) };
//   };

//   const is = (value: RawDataStatus | string, type: RawDataStatus): boolean => {
//     if (!has(value)) {
//       return false;
//     }
//     const kv = converter.getKeyValue(value);
//     return kv.value === type;
//   };

//   return {
//     get: getKv,
//     has,
//     is
//   };
// })();
