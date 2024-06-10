import { Injectable } from '@angular/core';
import { AreaTypeEnum, CaseStatus, IFieldBaseDto, Operation, SchemaDto, SchemaFieldDto, SchemasService } from '@wfm/service-layer';
import { Expression } from '@wfm/service-layer/models/expressionModel';
import { CaseSchemaService } from '@wfm/service-layer/services/case-schema.service';
import { DateTime } from 'luxon';

@Injectable()
export class SchemaHelper {
  constructor(private schemasService: SchemasService, private caseSchemaService: CaseSchemaService) {}

  async removeRawDataSchema() {
    return await this.caseSchemaService.deleteRawDataSchema();
  }

  async createCaseSchema(tenantId: string, name: string, areaType: AreaTypeEnum, fields: IFieldBaseDto[], expressions: Expression[]) {
    const mappedFields = await this.createSchemaFields(fields);

    const cmd: SchemaDto = {
      id: undefined,
      status: CaseStatus.Open,
      name: name,
      functions: expressions,
      areaType: areaType,
      tenantId: tenantId,
      fields: mappedFields
    };

    const operation = await this.caseSchemaService.createCaseSchema(cmd);

    const caseSchema = await this.schemasService.getById(operation.targetId, tenantId, AreaTypeEnum.case);

    return caseSchema;
  }

  async createSchema(tenantId: string, name: string, areaType: AreaTypeEnum, fields: IFieldBaseDto[], expressions: Expression[]) {
    const mappedFields = await this.createSchemaFields(fields);

    const cmd: SchemaDto = {
      id: undefined,
      status: CaseStatus.Open,
      name: `${name} - ${DateTime.now().toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)}`,
      functions: expressions,
      areaType: areaType,
      tenantId: tenantId,
      fields: mappedFields
    };

    const operation = await this.schemasService.create(cmd);
    const schema = await this.schemasService.getById(operation.targetId, tenantId, cmd.areaType);
    return schema;
  }

  async createSchemaFields(fields: IFieldBaseDto[]): Promise<SchemaFieldDto[]> {
    return fields.map((x) => {
      const mapped: SchemaFieldDto = {
        ...x,
        configuration: x.configuration || {
          position: 0
        },
        schemaFieldConfiguration: undefined
      };

      return mapped;
    });
  }

  async getSchema(tenantId: string, schemaId: string, area: AreaTypeEnum): Promise<SchemaDto> {
    return this.schemasService.getById(schemaId, tenantId, area);
  }

  async deleteSchema(tenantId: string, schemaId: string, area: AreaTypeEnum): Promise<Operation> {
    return await this.schemasService.deleteById(schemaId, tenantId, area);
  }
}
