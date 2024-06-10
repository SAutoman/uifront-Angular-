// import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
// import {
//   CustomSearchType,
//   EqualToFilter,
//   ExternalKeySearchFilter,
//   LikeFilter,
//   ListSearchFilter,
//   RangeFilter,
//   RawDataFieldInfoUI,
//   RawDataFieldInfoWithCustomSearch,
//   SearchFieldModel,
//   SearchType,
//   StatusSearchFilter
// } from '@wfm/service-layer/models/dynamic-entity-models';
// import { FieldTypeIds, RawDataFieldInfo } from '@wfm/service-layer';

// @Component({
//   selector: 'app-template-field',
//   templateUrl: './template-field.component.html',
//   styleUrls: ['./template-field.component.scss']
// })
// export class TemplateFieldComponent implements OnInit {
//   @Input() field: RawDataFieldInfoUI;
//   searchType: SearchType;
//   customSearchType: CustomSearchType;
//   hardCodedListId = 'D74C627BAC2F3F40B8C1EB4C00EA3ED7';

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
//     this.searchType = this.field.allowedSearchTypes[0];
//     const model = this.createModel(this.field, this.searchType);
//     this.field.searchFieldModel = model;

//     this.customSearchType =
//       this.searchType === SearchType.Custom ? (<RawDataFieldInfoWithCustomSearch>this.field).customSearchType : CustomSearchType.Unknown;
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

//   private createModel(field: RawDataFieldInfoUI, searchType: SearchType): SearchFieldModel {
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
//         switch ((<RawDataFieldInfoWithCustomSearch>field).customSearchType) {
//           case CustomSearchType.Status:
//             return this.createStatusModel(field);
//           case CustomSearchType.ExternalKey:
//             return this.createExternalKeyModel(field);
//           default:
//             throw new Error('Invalid CustomSearchType ' + this.customSearchType.toString());
//         }
//     }
//   }

//   private createLikeModel(field: RawDataFieldInfo, searchType: SearchType): SearchFieldModel {
//     if (field.valueType === FieldTypeIds.StringField) {
//       return <LikeFilter<string>>{
//         valueType: field.valueType,
//         fieldName: field.name,
//         searchType: searchType,
//         id: field.id
//       };
//     }

//     throw new Error('Invalid operation');
//   }

//   private createRangeModel(field: RawDataFieldInfo, searchType: SearchType): SearchFieldModel {
//     switch (field.valueType) {
//       case FieldTypeIds.DecimalField:
//         return <RangeFilter<number>>{
//           valueType: field.valueType,
//           fieldName: field.name,
//           searchType: searchType,
//           id: field.id
//         };
//       case FieldTypeIds.IntField:
//         return <RangeFilter<number>>{
//           valueType: field.valueType,
//           fieldName: field.name,
//           searchType: searchType,
//           id: field.id
//         };
//       case FieldTypeIds.DateField:
//         return <RangeFilter<Date>>{
//           valueType: field.valueType,
//           fieldName: field.name,
//           searchType: searchType,
//           id: field.id
//         };
//       case FieldTypeIds.TimeField:
//         return <RangeFilter<Date>>{
//           valueType: field.valueType,
//           fieldName: field.name,
//           searchType: searchType,
//           id: field.id
//         };
//       case FieldTypeIds.DateTimeField:
//         return <RangeFilter<Date>>{
//           valueType: field.valueType,
//           fieldName: field.name,
//           searchType: searchType,
//           id: field.id
//         };
//     }
//     throw new Error('Invalid operation');
//   }

//   private createEqualToModel(field: RawDataFieldInfo, searchType: SearchType): SearchFieldModel {
//     switch (field.valueType) {
//       case FieldTypeIds.BoolField:
//         return <EqualToFilter<boolean>>{
//           valueType: field.valueType,
//           fieldName: field.name,
//           searchType: searchType,
//           id: field.id,
//           value: false
//         };
//       case FieldTypeIds.DecimalField:
//         return <EqualToFilter<number>>{
//           valueType: field.valueType,
//           fieldName: field.name,
//           searchType: searchType,
//           id: field.id
//         };
//       case FieldTypeIds.IntField:
//         return <EqualToFilter<number>>{
//           valueType: field.valueType,
//           fieldName: field.name,
//           searchType: searchType,
//           id: field.id
//         };
//       case FieldTypeIds.DateField:
//         return <EqualToFilter<Date>>{
//           valueType: field.valueType,
//           fieldName: field.name,
//           searchType: searchType,
//           id: field.id
//         };
//       case FieldTypeIds.TimeField:
//         return <EqualToFilter<String>>{
//           valueType: field.valueType,
//           fieldName: field.name,
//           searchType: searchType,
//           id: field.id
//         };
//       case FieldTypeIds.DateTimeField:
//         return <EqualToFilter<Date>>{
//           valueType: field.valueType,
//           fieldName: field.name,
//           searchType: searchType,
//           id: field.id
//         };
//     }

//     throw new Error('Invalid operation');
//   }

//   private createListModel(field: RawDataFieldInfo, searchType: SearchType): ListSearchFilter<string> {
//     if (field.valueType === FieldTypeIds.ListField) {
//       return <ListSearchFilter<string>>{
//         listId: this.hardCodedListId,
//         valueType: field.valueType,
//         fieldName: field.name,
//         searchType: searchType,
//         id: field.id
//       };
//     }

//     throw new Error('Invalid operation');
//   }

//   private createStatusModel(field: RawDataFieldInfoUI): StatusSearchFilter {
//     return <StatusSearchFilter>{
//       valueType: field.valueType,
//       fieldName: field.name,
//       searchType: SearchType.Custom,
//       customSearchType: CustomSearchType.Status,
//       id: field.id
//     };
//   }

//   private createExternalKeyModel(field: RawDataFieldInfoUI): ExternalKeySearchFilter {
//     return <ExternalKeySearchFilter>{
//       valueType: field.valueType,
//       fieldName: field.name,
//       searchType: SearchType.Custom,
//       customSearchType: CustomSearchType.ExternalKey,
//       id: field.id
//     };
//   }
// }
