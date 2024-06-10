// import { SchemaFieldDto } from './../../service-layer/models/schema';
// /**
//  * global
//  */
// import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

// /**
//  * project
//  */
// import { FieldTypeIds, RawDataFieldInfo } from '../../service-layer/models/';
// import {
//   SearchType,
//   SearchFieldModel,
//   CustomSearchType,
//   RangeFilter,
//   RawDataFieldInfoUI,
//   EqualToFilter,
//   ListSearchFilter,
//   StatusSearchFilter,
//   RawDataFieldInfoWithCustomSearch,
//   LikeFilter,
//   ExternalKeySearchFilter
// } from '@wfm/service-layer/models/dynamic-entity-models';

// /**
//  * local
//  */

// @Component({
//   selector: 'app-raw-data-field',
//   templateUrl: './raw-data-field.component.html',
//   styleUrls: []
// })
// export class RawDataFieldComponent implements OnInit {
//   @Input() field: SchemaFieldDto;
//   searchType: SearchType;
//   customSearchType: CustomSearchType;

//   get searchTypes(): typeof SearchType {
//     return SearchType;
//   }
//   get customSearchTypes(): typeof CustomSearchType {
//     return CustomSearchType;
//   }
//   get fieldTypeIds(): typeof FieldTypeIds {
//     return FieldTypeIds;
//   }

//   @Output() isFieldChanged: EventEmitter<boolean> = new EventEmitter();

//   constructor() {}

//   ngOnInit(): void {
//     // this.field;
//     this.searchType = this.field.allowedSearchTypes[0];
//     const model = this.createModel(this.field, this.searchType);
//     this.field.searchFieldModel = model;
//     this.customSearchType = this.searchType === SearchType.Custom ? this.field.customSearchType : CustomSearchType.Unknown;
//   }

//   onSearchTypeOut(event: SearchType): void {
//     this.searchType = event;
//     this.addOrUpdateModel();
//   }

//   onFieldChanged(): void {
//     this.isFieldChanged.emit(true);
//   }

//   private addOrUpdateModel(): void {
//     const model = this.createModel(this.field, this.searchType);
//     this.field.searchFieldModel = model;
//   }

//   private createModel(field: SchemaFieldDto, searchType: SearchType): SearchFieldModel {
//     switch (searchType) {
//       case SearchType.Like:
//         return this.createLikeModel(field, searchType);

//       case SearchType.Range:
//         return this.createRangeModel(field, searchType);

//       case SearchType.EqualTo:
//         return this.createEqualToModel(field, searchType);
//       case SearchType.List:
//         return this.createListModel(field, searchType);
//       case SearchType.Custom:
//         switch (field.customSearchType) {
//           case CustomSearchType.Status:
//             return this.createStatusModel(field);
//           case CustomSearchType.ExternalKey:
//             return this.createExternalKeyModel(field);
//           default:
//             throw new Error('Invalid CustomSearchType ' + this.customSearchType.toString());
//         }
//     }
//   }

//   private createLikeModel(field: SchemaFieldDto, searchType: SearchType): SearchFieldModel {
//     if (field.type === FieldTypeIds.StringField) {
//       return <LikeFilter<string>>{
//         valueType: field.type,
//         fieldName: field.fieldName,
//         searchType: searchType,
//         id: field.id
//       };
//     }

//     throw new Error('Invalid operation');
//   }

//   private createRangeModel(field: SchemaFieldDto, searchType: SearchType): SearchFieldModel {
//     switch (field.type) {
//       case FieldTypeIds.DecimalField:
//         return <RangeFilter<number>>{
//           valueType: field.type,
//           fieldName: field.fieldName,
//           searchType: searchType,
//           id: field.id
//         };
//       case FieldTypeIds.IntField:
//         return <RangeFilter<number>>{
//           valueType: field.type,
//           fieldName: field.fieldName,
//           searchType: searchType,
//           id: field.id
//         };
//       case FieldTypeIds.DateField:
//         return <RangeFilter<Date>>{
//           valueType: field.type,
//           fieldName: field.fieldName,
//           searchType: searchType,
//           id: field.id
//         };
//       case FieldTypeIds.TimeField:
//         return <RangeFilter<Date>>{
//           valueType: field.type,
//           fieldName: field.fieldName,
//           searchType: searchType,
//           id: field.id
//         };
//       case FieldTypeIds.DateTimeField:
//         return <RangeFilter<Date>>{
//           valueType: field.type,
//           fieldName: field.fieldName,
//           searchType: searchType,
//           id: field.id
//         };
//     }
//     throw new Error('Invalid operation');
//   }

//   private createEqualToModel(field: SchemaFieldDto, searchType: SearchType): SearchFieldModel {
//     switch (field.type) {
//       case FieldTypeIds.BoolField:
//         return <EqualToFilter<boolean>>{
//           valueType: field.type,
//           fieldName: field.fieldName,
//           searchType: searchType,
//           id: field.id,
//           value: false
//         };
//       case FieldTypeIds.DecimalField:
//         return <EqualToFilter<number>>{
//           valueType: field.type,
//           fieldName: field.fieldName,
//           searchType: searchType,
//           id: field.id
//         };
//       case FieldTypeIds.IntField:
//         return <EqualToFilter<number>>{
//           valueType: field.type,
//           fieldName: field.fieldName,
//           searchType: searchType,
//           id: field.id
//         };
//       case FieldTypeIds.DateField:
//         return <EqualToFilter<Date>>{
//           valueType: field.type,
//           fieldName: field.fieldName,
//           searchType: searchType,
//           id: field.id
//         };
//       case FieldTypeIds.TimeField:
//         return <EqualToFilter<String>>{
//           valueType: field.type,
//           fieldName: field.fieldName,
//           searchType: searchType,
//           id: field.id
//         };
//       case FieldTypeIds.DateTimeField:
//         return <EqualToFilter<Date>>{
//           valueType: field.type,
//           fieldName: field.fieldName,
//           searchType: searchType,
//           id: field.id
//         };
//     }

//     throw new Error('Invalid operation');
//   }

//   private createListModel(field: SchemaFieldDto, searchType: SearchType) {
//     if (field.type === FieldTypeIds.ListField) {
//       return <ListSearchFilter<string>>{
//         listId: field.configuration?.listId,
//         parentListId: field.configuration?.parentListId,
//         valueType: field.type,
//         fieldName: field.fieldName,
//         searchType: searchType,
//         id: field.id,
//         renderType: field.configuration.renderType || 'select'
//       };
//     }

//     throw new Error('Invalid operation');
//   }

//   private createStatusModel(field: SchemaFieldDto): StatusSearchFilter {
//     return <StatusSearchFilter>{
//       valueType: field.type,
//       fieldName: field.fieldName,
//       searchType: SearchType.Custom,
//       customSearchType: CustomSearchType.Status,
//       id: field.id
//     };
//   }

//   private createExternalKeyModel(field: SchemaFieldDto): ExternalKeySearchFilter {
//     return <ExternalKeySearchFilter>{
//       valueType: field.type,
//       fieldName: field.fieldName,
//       searchType: SearchType.Custom,
//       customSearchType: CustomSearchType.ExternalKey,
//       id: field.id
//     };
//   }
// }
