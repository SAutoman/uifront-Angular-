import { Injectable } from '@angular/core';
import { AreaTypeEnum, CreateDynamicEntityDto, DynamicEntitiesService, DynamicEntityDto } from '@wfm/service-layer';
import { BaseFieldValueType } from '@wfm/service-layer/models/FieldValueDto';

@Injectable()
export class DynamicEntityHelper {
  constructor(private dynamicEntitiesService: DynamicEntitiesService) {}

  async createDynamicEntity(
    schemaId: string,
    appId: string,
    tenantId: string,
    areaType: AreaTypeEnum,
    fields: BaseFieldValueType[]
  ): Promise<DynamicEntityDto> {
    const dynamicCmd: CreateDynamicEntityDto = {
      appId: appId,
      tenantId: tenantId,
      areaType: areaType,
      schemaId: schemaId,
      fields: fields
    };

    const dynamicEntityOperation = await this.dynamicEntitiesService.create(dynamicCmd);
    const result = await this.dynamicEntitiesService.getById(tenantId, dynamicEntityOperation.targetId, schemaId, dynamicCmd.areaType);
    return result;
  }
}
