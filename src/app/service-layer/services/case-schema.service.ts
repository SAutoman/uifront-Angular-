import { Injectable } from '@angular/core';
import { FieldTypeIds } from '../models';
import { AreaTypeEnum } from '../models/area-type.enum';
import { IBaseFieldConfiguration, ICreateTenantFieldDto, IFieldBaseDto } from '../models/field-base.dto';
import { Operation } from '../models/operation';
import { SchemaDto, SchemaFieldDto, UpdateSchemaCommand } from '../models/schema';
import { AdminTenantFieldsService } from './admin-tenant-fields.service';
import { SchemasService } from './schemas-service';

@Injectable({
  providedIn: 'root'
})
export class CaseSchemaService {
  BASE_URL = 'admin/schemas';

  rawDataSchema: SchemaDto;

  constructor(private tenantFieldService: AdminTenantFieldsService, private schemaService: SchemasService) {}

  public async deleteRawDataSchema(): Promise<Operation> {
    if (this.rawDataSchema) {
      return await this.schemaService.deleteById(this.rawDataSchema.id, this.rawDataSchema.tenantId, AreaTypeEnum.rawData);
    }
  }

  public async createCaseSchema(cmd: SchemaDto): Promise<Operation> {
    if (!cmd.fields.find((x) => x.name === 'rawDataIds')) {
      const operationRawData = await this.schemaService.create(<SchemaDto>{
        areaType: AreaTypeEnum.rawData,
        name: 'rawDataSchema',
        tenantId: cmd.tenantId
      });
      this.rawDataSchema = await this.schemaService.getById(operationRawData.targetId, cmd.tenantId, AreaTypeEnum.rawData);
      let rawDataListOfLinkField = await this.createListOfLinkField(this.rawDataSchema, 'Raw Data Ids', 'rawDataIds', AreaTypeEnum.rawData);
      cmd.fields.push(rawDataListOfLinkField);
    }

    const caseSchemaOperation = await this.schemaService.create(cmd);

    return caseSchemaOperation;
  }

  public async getCaseSchema(caseSchemaId: string, tenantId: string): Promise<SchemaDto> {
    return await this.schemaService.getById(caseSchemaId, tenantId, AreaTypeEnum.case);
  }

  public async updateCaseSchema(cmd: UpdateSchemaCommand, tenantId: string): Promise<Operation> {
    return await this.schemaService.update(cmd, tenantId, AreaTypeEnum.case);
  }

  private async createListOfLinkField(
    schema: SchemaDto,
    displayName: string,
    fieldName: string,
    childAreaType: AreaTypeEnum,
    toBeCascadeDeleted?: boolean
  ): Promise<SchemaFieldDto> {
    let listFieldDto = <ICreateTenantFieldDto>{
      fieldName: fieldName,
      displayName: displayName,
      areaTypes: [AreaTypeEnum.case],
      type: FieldTypeIds.ListOfLinksField,
      configuration: {
        position: 0,
        schemaId: schema.id,
        schemaAreaType: childAreaType
      },
      isCustom: true,
      tenantId: schema.tenantId,
      id: undefined
    };
    if (toBeCascadeDeleted) {
      // dynamic entities referenced in this field will be removed if the parent dynamic entity is removed
      listFieldDto['cascade'] = true;
    }

    const fieldOperation = await this.tenantFieldService.create(listFieldDto);
    const field = await this.tenantFieldService.getById(schema.tenantId, fieldOperation.targetId);

    return this.mapTenantFieldToSchemaField(field);
  }

  private mapTenantFieldToSchemaField(tenantField: IFieldBaseDto, schemaSpecificConfig?: IBaseFieldConfiguration): SchemaFieldDto {
    let mergedConfiguration = {
      ...tenantField.configuration,
      ...schemaSpecificConfig
    };
    const mappedField: SchemaFieldDto = {
      ...tenantField,
      configuration: mergedConfiguration,
      schemaFieldConfiguration: undefined
    };
    return mappedField;
  }
}
