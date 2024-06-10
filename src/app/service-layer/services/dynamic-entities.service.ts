/**
 * global
 */
import { Inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

/**
 * project
 */

import {
  Operation,
  AreaTypeEnum,
  IFilter,
  PagedData,
  Paging,
  Sorting,
  DynamicEntitiesSearch,
  CreateDynamicEntityDto,
  DynamicEntityDto,
  UpdateDynamicEntityDto,
  GetDynamicEntitiesRequestDto,
  UpdateManyDynamicEntityDto,
  UpdateManyDynamicEntitiesDto,
  FieldTypeIds,
  UpdateDynamicEntityVisualSettingsDto,
  DynamicEntityStatusUsage,
  AggregationConfig,
  PagedDataWithAggregations
} from '@wfm/service-layer/models';
import DateTimeFormatHelper from '@wfm/shared/dateTimeFormatHelper';
import { isUndefinedOrNull } from '@wfm/shared/utils';

/**
 * local
 */
import { HttpClientService } from './application-http-client.service';
import { OperationService } from './operation.service';
import {
  BaseFieldValueDto,
  BaseFieldValueType,
  BoolFieldValueDto,
  DateFieldValueDto,
  DateTimeFieldValueDto,
  DecimalFieldValueDto,
  IntFieldValueDto,
  LinkFieldValueDto,
  StringFieldValueDto,
  EmbededFieldValueDto,
  TextAreaTypeFieldValueDto,
  TimeFieldValueDto,
  ListValue,
  ListFieldValueDto,
  FileFieldValueDto,
  FieldValueDto,
  ConnectorFieldValueDto,
  MultiSelectListFieldValueDto,
  RichTextFieldValueDto,
  ListOfLinkFieldValueDto,
  YoutubeFieldValueDto,
  SignatureFieldValueDto
} from '../models/FieldValueDto';
import { ApplyMappingDto } from '../models/mappings';
import { SchemaValidatorQuery, SchemaValidatorsHelper } from '../helpers/schema-validators.helper';

export interface DeleteDynamicEntityDto {
  tenantId: string;
  id: string;
  schemaId: string;
  areaType: AreaTypeEnum;
}

export interface BulkDeleteDynamicEnitiesDto {
  ids: string[];
  tenantId: string;
  schemaId: string;
  areaType: AreaTypeEnum;
}

@Injectable()
export class DynamicEntitiesService {
  BASE_URL = (tenantId) => `tenant/${tenantId}/dynamicEntity`;

  constructor(
    private operationsService: OperationService,
    @Inject('HttpClientService') private httpClient: HttpClientService,
    private store: Store,
    private validators: SchemaValidatorsHelper
  ) {}

  async create(cmd: CreateDynamicEntityDto): Promise<Operation> {
    const validatorDto: SchemaValidatorQuery = {
      tenantId: cmd.tenantId,
      schemaId: cmd.schemaId,
      fields: cmd.fields
    };

    if (await this.validators.checkSchemaValidators(validatorDto)) {
      let operation = await this.httpClient.post<Operation>(
        `${this.BASE_URL(cmd.tenantId)}/schema/${cmd.schemaId}/area-type/${cmd.areaType.toString()}`,
        cmd
      );
      operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
      return operation;
    }

    throw new Error(`Create action stopped`);
  }

  async update(cmd: UpdateDynamicEntityDto): Promise<Operation> {
    const validatorDto: SchemaValidatorQuery = {
      tenantId: cmd.tenantId,
      schemaId: cmd.schemaId,
      fields: cmd.fields,
      id: cmd.publicId
    };

    if (await this.validators.checkSchemaValidators(validatorDto)) {
      let operation = await this.httpClient.put<Operation>(
        `${this.BASE_URL(cmd.tenantId)}/schema/${cmd.schemaId}/area-type/${cmd.areaType.toString()}`,
        cmd
      );
      operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
      return operation;
    }
    throw new Error(`Update action stopped`);
  }

  async getById(
    tenantId: string,
    id: string,
    schemaId: string,
    areaType: AreaTypeEnum,
    disableUiMapping?: boolean
  ): Promise<DynamicEntityDto> {
    const result = await this.httpClient.get<DynamicEntityDto>(
      `${this.BASE_URL(tenantId)}/schema/${schemaId}/area-type/${areaType.toString()}/${id}`
    );
    if (disableUiMapping) {
      return result;
    }
    let mappedToUi = this.getDynamicEntityFieldsUiValues(result);
    return mappedToUi;
  }

  async deleteById(tenantId: string, id: string, schemaId: string, areaType: AreaTypeEnum): Promise<Operation> {
    const dto: DeleteDynamicEntityDto = {
      areaType: areaType,
      id: id,
      tenantId: tenantId,
      schemaId: schemaId
    };
    let operation = await this.httpClient.post<Operation>(
      `${this.BASE_URL(tenantId)}/schema/${schemaId}/area-type/${areaType.toString()}/delete/${id}`,
      dto
    );
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async bulkDelete(entity: BulkDeleteDynamicEnitiesDto): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(
      `${this.BASE_URL(entity.tenantId)}/schema/${entity.schemaId}/area-type/${entity.areaType.toString()}/bulk-delete`,
      entity
    );
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async search(
    areaType: AreaTypeEnum,
    tenantId: string,
    schemaId: string,
    paging?: Paging,
    sorting?: Sorting[],
    filters?: IFilter[],
    aggregates?: AggregationConfig[]
  ): Promise<PagedDataWithAggregations<DynamicEntityDto>> {
    const searchParams = this.httpClient.buildSearchParams(paging, sorting, filters);
    const params: DynamicEntitiesSearch = {
      areaType,
      tenantId,
      schemaId: schemaId,
      sorting: searchParams.sorting,
      paging: searchParams.paging,
      filters: searchParams.filters
    };
    if (aggregates?.length) {
      params.aggregationConfig = aggregates;
    }
    const result = await this.httpClient.post<PagedDataWithAggregations<DynamicEntityDto>>(
      `${this.BASE_URL(tenantId)}/schema/${schemaId}/area-type/${areaType.toString()}/search`,
      params
    );
    let finalData = {
      ...result,
      items: result.items.map((item) => this.getDynamicEntityFieldsUiValues(item))
    };
    return finalData;
  }
  /**
   * get by id  for multiple entities
   * @param tenantId
   * @param areaType
   * @param schemaId
   * @param entities
   * @returns
   */
  async getMany(
    tenantId: string,
    areaType: AreaTypeEnum,
    schemaId: string,
    ids: string[],
    paging?: Paging,
    sorting?: Sorting[],
    filters?: IFilter[]
  ): Promise<PagedData<DynamicEntityDto>> {
    const params: GetDynamicEntitiesRequestDto = {
      tenantId: tenantId,
      areaType: areaType,
      schemaId: schemaId,
      ids: ids,
      paging: paging,
      sorting: sorting,
      filters: filters
    };
    const result = await this.httpClient.post<PagedData<DynamicEntityDto>>(
      `${this.BASE_URL(tenantId)}/schema/${schemaId}/area-type/${areaType.toString()}/bulk-get`,
      params
    );
    let finalData = {
      ...result,
      items: result.items.map((item) => this.getDynamicEntityFieldsUiValues(item))
    };
    return finalData;
  }

  async getVisualViewCases(
    tenantId: string,
    areaType: AreaTypeEnum,
    schemaId: string,
    ids: string[],
    paging?: Paging,
    sorting?: Sorting[],
    filters?: IFilter[]
  ): Promise<PagedData<DynamicEntityDto>> {
    const params: GetDynamicEntitiesRequestDto = {
      tenantId: tenantId,
      areaType: areaType,
      schemaId: schemaId,
      ids: ids,
      paging: paging,
      sorting: sorting,
      filters: filters
    };
    const result = await this.httpClient.post<PagedData<DynamicEntityDto>>(
      `${this.BASE_URL(tenantId)}/schema/${schemaId}/area-type/${areaType.toString()}/bulk-get-allCase`,
      params
    );
    let finalData = {
      ...result,
      items: result.items.map((item) => this.getDynamicEntityFieldsUiValues(item))
    };
    return finalData;
  }

  // not used
  async updateMany(tenantId: string, areaType: AreaTypeEnum, entities: UpdateManyDynamicEntityDto[], schemaId: string): Promise<Operation> {
    const params: UpdateManyDynamicEntitiesDto = { tenantId, areaType, entities, schemaId };
    const result = this.httpClient.post<Operation>(
      `${this.BASE_URL(tenantId)}/schema/${schemaId}/area-type/${areaType.toString()}/update-many`,
      params
    );
    return result;
  }

  /**
   * get pure value from complex field types (File, List, etc)
   * @param dynamicEntity
   * @returns
   */
  getDynamicEntityFieldsUiValues(dynamicEntity: DynamicEntityDto): DynamicEntityDto {
    dynamicEntity.fields.forEach((field: FieldValueDto<any>) => {
      if (field) {
        let uiValue;
        switch (field.type) {
          case FieldTypeIds.ListField:
            uiValue = (<ListValue>field.value)?.listItemId ? (<ListValue>field.value).listItemId : field.value;
            break;
          case FieldTypeIds.MultiselectListField:
            uiValue = field?.value?.length ? field.value : [];
            break;
          // case FieldTypeIds.FileField:
          //   uiValue = (<FileValue>field.value[0])?.documentId ? await this.populateFileFieldDetails(field) : field.value
          //   break;
          default:
            uiValue = field.value;
            break;
        }
        field.value = uiValue;
      }
    });
    return dynamicEntity;
  }

  async updateVisualSettings(cmd: UpdateDynamicEntityVisualSettingsDto): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(
      `${this.BASE_URL(cmd.tenantId)}/area-type/${cmd.areaType.toString()}/${cmd.dynamicEntityId}/visual-settings`,
      { visualSettings: cmd.visualSettings }
    );
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async applyMapping(tenantId: string, areaType: AreaTypeEnum, cmd: ApplyMappingDto): Promise<Operation> {
    let operation = await this.httpClient.put<Operation>(
      `${this.BASE_URL(tenantId)}/area-type/${areaType.toString()}/process-mappings`,
      cmd
    );

    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  getDynamicFieldValue(field: BaseFieldValueDto): BaseFieldValueType {
    switch (field.type) {
      case FieldTypeIds.BoolField:
        return <BoolFieldValueDto>field;
      case FieldTypeIds.DateField:
        return <DateFieldValueDto>field;
      case FieldTypeIds.DateTimeField:
        return <DateTimeFieldValueDto>field;
      case FieldTypeIds.DecimalField:
        return <DecimalFieldValueDto>field;
      case FieldTypeIds.IntField:
        return <IntFieldValueDto>field;
      case FieldTypeIds.LinkField:
        return <LinkFieldValueDto>field;
      case FieldTypeIds.StringField:
        return <StringFieldValueDto>field;
      case FieldTypeIds.EmbededField:
        return <EmbededFieldValueDto>field;
      case FieldTypeIds.TextareaField:
        return <TextAreaTypeFieldValueDto>field;
      case FieldTypeIds.TimeField:
        return <TimeFieldValueDto>field;
      case FieldTypeIds.ListField:
        return <ListFieldValueDto>field;
      case FieldTypeIds.FileField:
        return <FileFieldValueDto>field;
      case FieldTypeIds.ConnectorField:
        return <ConnectorFieldValueDto>field;
      case FieldTypeIds.MultiselectListField:
        return <MultiSelectListFieldValueDto>field;
      case FieldTypeIds.RichTextField:
        return <RichTextFieldValueDto>field;
      case FieldTypeIds.ListOfLinksField:
        return <ListOfLinkFieldValueDto>field;
      case FieldTypeIds.SignatureField:
        return <SignatureFieldValueDto>field;
      case FieldTypeIds.YouTubeEmbedField:
        return <YoutubeFieldValueDto>field;
      default:
        return undefined;
    }
  }

  async getDynamicEntityStatusUsage(
    tenantId: string,
    id: string,
    areaType: AreaTypeEnum,
    schemaId?: string
  ): Promise<DynamicEntityStatusUsage[]> {
    let url = `${this.BASE_URL(tenantId)}/area-type/${areaType}/status/${id}`;
    if (schemaId) {
      url += `?schemaId=${schemaId}`;
    }
    return this.httpClient.get<DynamicEntityStatusUsage[]>(url);
  }

  mapFieldTypeToBaseFieldValue(fieldType: FieldTypeIds, rawFieldValue: any): any {
    if (!isUndefinedOrNull(rawFieldValue)) {
      switch (fieldType) {
        case FieldTypeIds.StringField:
          return rawFieldValue.toString().trim();
        case FieldTypeIds.DateField:
          return DateTimeFormatHelper.getUTCJsDate(rawFieldValue);

        case FieldTypeIds.DateTimeField:
          return DateTimeFormatHelper.getUtcDateTimeWithNormalizedSeconds(rawFieldValue);

        case FieldTypeIds.ListField:
          rawFieldValue = <ListValue>{ listItemId: rawFieldValue };
          return rawFieldValue;

        case FieldTypeIds.MultiselectListField:
          rawFieldValue = <string[]>rawFieldValue;
          return rawFieldValue;

        default:
          return rawFieldValue;
      }
    } else {
      return rawFieldValue;
    }
  }
}
