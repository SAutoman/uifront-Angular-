import { KeyValue } from '@angular/common';
import { Injectable } from '@angular/core';
import {
  AdminTenantFieldsService,
  AreaTypeEnum,
  FieldTypeIds,
  IBaseFieldConfiguration,
  ICreateTenantFieldDto,
  ValidatorDtoType,
  ValidatorType
} from '@wfm/service-layer';

@Injectable()
export class TenantFieldsHelper {
  constructor(private tenantFieldsService: AdminTenantFieldsService) {}

  async deleteTenantField(id: string, tenantId: string): Promise<void> {
    await this.tenantFieldsService.deleteById(id, tenantId);
  }

  async createTenantField(
    tenantId: string,
    type: FieldTypeIds,
    areaTypes: AreaTypeEnum[],
    fieldName: string,
    displayName: string,
    validators: KeyValue<ValidatorType, ValidatorDtoType>[],
    configuration?: IBaseFieldConfiguration
  ) {
    if (!configuration) {
      configuration = {
        position: 0,
        validators
      };
    }

    const cmd: ICreateTenantFieldDto = {
      id: undefined,
      tenantId: tenantId,
      type,
      areaTypes: areaTypes,
      configuration: configuration,
      fieldName: fieldName,
      displayName: displayName,
      isSystem: false,
      isCustom: true
    };

    const operation = await this.tenantFieldsService.create(cmd);
    const result = await this.tenantFieldsService.getById(tenantId, operation.targetId);
    return result;
  }
}
