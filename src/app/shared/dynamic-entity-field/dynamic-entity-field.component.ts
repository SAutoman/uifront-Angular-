/**
 * global
 */
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
/**
 * project
 */
import { FieldTypeIds, FieldRenderTypeEnum, IFieldBaseDto } from '../../service-layer/models';
import {
  SearchType,
  SearchFieldModel,
  CustomSearchType,
  RangeFilter,
  EqualToFilter,
  ListSearchFilter,
  LikeFilter,
  ExternalKeySearchFilter,
  CustomSuppliersAuditorsFilter,
  CustomSearchFilter,
  ConnectorFieldSearchModel,
  DateTimeRangeFilter
} from '@wfm/service-layer/models/dynamic-entity-models';

/**
 * local
 */

export interface FieldWithSearchModel extends IFieldBaseDto {
  searchFieldModel: SearchFieldModel;
}
@Component({
  selector: 'app-dynamic-entity-field',
  templateUrl: './dynamic-entity-field.component.html',
  styleUrls: []
})
export class DynamicEntityFieldComponent implements OnInit {
  @Input() field: FieldWithSearchModel;
  @Input() showDynamicViewOption?: boolean;
  searchType: SearchType;
  customSearchType: CustomSearchType;

  get searchTypes(): typeof SearchType {
    return SearchType;
  }
  get customSearchTypes(): typeof CustomSearchType {
    return CustomSearchType;
  }
  get fieldTypeIds(): typeof FieldTypeIds {
    return FieldTypeIds;
  }

  @Output() isFieldChanged: EventEmitter<boolean> = new EventEmitter();

  constructor() {}

  ngOnInit(): void {
    this.searchType = this.field.allowedSearchTypes[0];

    if (this.field.allowedSearchTypes.length > 1 && this.field.searchFieldModel?.searchType) {
      this.searchType = this.field.searchFieldModel?.searchType;
    }

    const model = this.createModel(this.field, this.searchType);

    this.field.searchFieldModel = {
      ...model,
      ...this.field.searchFieldModel
    };

    this.customSearchType = this.searchType === SearchType.Custom ? this.field.searchFieldModel.customSearchType : CustomSearchType.Unknown;
  }

  onSearchTypeOut(event: SearchType): void {
    this.searchType = event;
    this.field.searchFieldModel.isValid = false;
    this.addOrUpdateModel();
  }

  onFieldChanged(): void {
    this.isFieldChanged.emit(true);
  }

  private addOrUpdateModel(): void {
    const model = this.createModel(this.field, this.searchType);
    this.field.searchFieldModel = {
      ...this.field.searchFieldModel,
      ...model
    };
  }

  private createModel(field: FieldWithSearchModel, searchType: SearchType): SearchFieldModel {
    switch (searchType) {
      case SearchType.Like:
        return this.createLikeModel(field, searchType);
      case SearchType.Range:
        return this.createRangeModel(field, searchType);
      case SearchType.EqualTo:
        return this.createEqualToModel(field, searchType);
      case SearchType.List:
        return this.createListModel(field, searchType);
      case SearchType.Custom:
        if (field.type === FieldTypeIds.ConnectorField) {
          return this.createConnectorFieldFilter(field);
        } else if (field.fieldName === 'statusId') {
          //status filtering
          return this.createStatusModel(field);
        } else if (field.customSearchType === CustomSearchType.ExternalKey) {
          return this.createExternalKeyModel(field);
        } else if (field.customSearchType === CustomSearchType.SupplierIds || field.customSearchType === CustomSearchType.AuditorIds) {
          return this.createSuppliersOrAuditorsFilter(field);
        }
    }
  }

  private createLikeModel(field: FieldWithSearchModel, searchType: SearchType): SearchFieldModel {
    if (field.type === FieldTypeIds.StringField || field.type === FieldTypeIds.TextareaField) {
      return <LikeFilter<string>>{
        // valuetype is the same both for StringField and TextareField (backend implementation)
        valueType: FieldTypeIds.StringField,
        fieldName: field.fieldName,
        displayName: field.displayName,
        searchType: searchType,
        id: field.id,
        propertyPath: field.propertyPath
      };
    }

    throw new Error('Invalid operation');
  }

  private createRangeModel(field: FieldWithSearchModel, searchType: SearchType): SearchFieldModel {
    switch (field.type) {
      case FieldTypeIds.DecimalField:
        return <RangeFilter<number>>{
          valueType: field.type,
          fieldName: field.fieldName,
          displayName: field.displayName,
          searchType: searchType,
          id: field.id,
          propertyPath: field.propertyPath
        };
      case FieldTypeIds.IntField:
        return <RangeFilter<number>>{
          valueType: field.type,
          fieldName: field.fieldName,
          displayName: field.displayName,
          searchType: searchType,
          id: field.id,
          propertyPath: field.propertyPath
        };
      case FieldTypeIds.DateField:
        return <DateTimeRangeFilter<Date>>{
          valueType: field.type,
          fieldName: field.fieldName,
          displayName: field.displayName,
          searchType: searchType,
          id: field.id,
          propertyPath: field.propertyPath
        };
      case FieldTypeIds.TimeField:
        return <DateTimeRangeFilter<Date>>{
          valueType: field.type,
          fieldName: field.fieldName,
          displayName: field.displayName,
          searchType: searchType,
          id: field.id,
          propertyPath: field.propertyPath
        };
      case FieldTypeIds.DateTimeField:
        return <DateTimeRangeFilter<Date>>{
          valueType: field.type,
          fieldName: field.fieldName,
          displayName: field.displayName,
          searchType: searchType,
          id: field.id,
          propertyPath: field.propertyPath
        };
    }
    throw new Error('Invalid operation');
  }

  private createEqualToModel(field: FieldWithSearchModel, searchType: SearchType): SearchFieldModel {
    switch (field.type) {
      case FieldTypeIds.BoolField:
        return <EqualToFilter<boolean>>{
          valueType: field.type,
          fieldName: field.fieldName,
          displayName: field.displayName,
          searchType: searchType,
          id: field.id,
          value: false,
          propertyPath: field.propertyPath
        };
      case FieldTypeIds.DecimalField:
        return <EqualToFilter<number>>{
          valueType: field.type,
          fieldName: field.fieldName,
          displayName: field.displayName,
          searchType: searchType,
          id: field.id,
          propertyPath: field.propertyPath
        };
      case FieldTypeIds.IntField:
        return <EqualToFilter<number>>{
          valueType: field.type,
          fieldName: field.fieldName,
          displayName: field.displayName,
          searchType: searchType,
          id: field.id,
          propertyPath: field.propertyPath
        };
      case FieldTypeIds.DateField:
        return <EqualToFilter<Date>>{
          valueType: field.type,
          fieldName: field.fieldName,
          displayName: field.displayName,
          searchType: searchType,
          id: field.id,
          propertyPath: field.propertyPath
        };
      case FieldTypeIds.TimeField:
        return <EqualToFilter<String>>{
          valueType: field.type,
          fieldName: field.fieldName,
          displayName: field.displayName,
          searchType: searchType,
          id: field.id,
          propertyPath: field.propertyPath
        };
      case FieldTypeIds.DateTimeField:
        return <EqualToFilter<Date>>{
          valueType: field.type,
          fieldName: field.fieldName,
          displayName: field.displayName,
          searchType: searchType,
          id: field.id,
          propertyPath: field.propertyPath
        };
    }

    throw new Error('Invalid operation');
  }

  private createListModel(field: FieldWithSearchModel, searchType: SearchType) {
    if (field.type === FieldTypeIds.ListField || field.type === FieldTypeIds.MultiselectListField) {
      let listFilter = <ListSearchFilter<string>>{
        listId: field.configuration?.listId,
        parentListId: field.configuration?.parentListId,
        valueType: field.type,
        fieldName: field.fieldName,
        displayName: field.displayName,
        searchType: searchType,
        id: field.id,
        renderType: field.configuration?.renderType || FieldRenderTypeEnum.select,
        propertyPath: field.propertyPath
      };
      return listFilter;
    }
    throw new Error('Invalid operation');
  }

  private createStatusModel(field: FieldWithSearchModel): CustomSearchFilter {
    return <CustomSearchFilter>{
      valueType: field.type,
      fieldName: field.fieldName,
      displayName: field.displayName,
      searchType: SearchType.Custom,
      customSearchType: CustomSearchType.Status,
      id: field.id,
      propertyPath: field.propertyPath
    };
  }

  private createExternalKeyModel(field: FieldWithSearchModel): ExternalKeySearchFilter {
    return <ExternalKeySearchFilter>{
      valueType: field.type,
      fieldName: field.fieldName,
      displayName: field.displayName,
      searchType: SearchType.Custom,
      customSearchType: CustomSearchType.ExternalKey,
      id: field.id,
      propertyPath: field.propertyPath
    };
  }

  private createSuppliersOrAuditorsFilter(field: FieldWithSearchModel): CustomSuppliersAuditorsFilter {
    return <CustomSuppliersAuditorsFilter>{
      valueType: field.type,
      fieldName: field.fieldName,
      displayName: field.displayName,
      searchType: SearchType.Custom,
      customSearchType: field.customSearchType,
      id: field.id,
      propertyPath: field.propertyPath
    };
  }

  private createConnectorFieldFilter(field: FieldWithSearchModel): ConnectorFieldSearchModel {
    return <ConnectorFieldSearchModel>{
      valueType: field.type,
      fieldName: field.fieldName,
      displayName: field.displayName,
      searchType: SearchType.Custom,
      customSearchType: CustomSearchType.Connector,
      id: field.id,
      propertyPath: field.propertyPath
    };
  }
}
