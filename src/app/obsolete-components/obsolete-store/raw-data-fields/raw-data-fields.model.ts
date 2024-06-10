// import { RawDataField } from '../../service-layer';

// // for testing
// export const generateRawDataFields = (idOverride?: string): RawDataField =>
//   <any>{
//     id: idOverride || (Math.floor(Math.random() * 100) + 1).toString(),
//     name: 'Test name',
//     description: 'Test description'
//   };

// export const generateRawDataFieldsArray = (count = 10): RawDataField[] =>
//   // Overwrite random id generation to prevent duplicate IDs:
//   Array.apply(null, Array(count)).map((value, index) => generateRawDataFields(index + 1));

// export const generateRawDataFieldsMap = (
//   RawDataFieldsArray: Array<RawDataField> = generateRawDataFieldsArray()
// ): { names: Array<string>; entities: any } => ({
//   entities: RawDataFieldsArray.reduce(
//     (RawDataFieldsMap, RawDataFields) => ({ ...RawDataFieldsMap, [RawDataFields.name]: RawDataFields }),
//     {}
//   ),
//   names: RawDataFieldsArray.map((RawDataFields) => RawDataFields.name)
// });
