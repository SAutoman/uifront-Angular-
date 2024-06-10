/**
 * global
 */
import { Injectable } from '@angular/core';

/**
 * project
 */
import {
  PagedData,
  ApplicationHttpClientService,
  IFieldBaseDto,
  OperationService,
  Operation
  // FormFieldModel
} from '../service-layer';
import { Paging, Sorting } from '../service-layer';
import { SearchFieldModel } from '@wfm/service-layer/models/dynamic-entity-models';
import { environment } from '../../environments/environment.base';
import { FieldDtoAdmin, TenantFieldDto } from '@wfm/service-layer/models/FieldInfo';

/**
 * local
 */

@Injectable({
  providedIn: 'root'
})
export class TenantAdminFieldsService {
  private BASE_URL = 'admin/Fields';
  private appId = environment.appId;

  constructor(private httpClient: ApplicationHttpClientService, private operationsService: OperationService) {}

  getAdminFieldsByTenant(): Promise<PagedData<FieldDtoAdmin>> {
    return this.httpClient.get<PagedData<FieldDtoAdmin>>(`${this.BASE_URL}`);
  }

  getFieldsByAppId(paging?: Paging, sorting?: Sorting[], filters?: SearchFieldModel[]): Promise<PagedData<IFieldBaseDto>> {
    return this.httpClient.post<PagedData<IFieldBaseDto>>(
      `${this.BASE_URL}/Application/${this.appId}`,
      this.httpClient.buildSearchParams(paging, sorting, filters)
    );
  }
  //  the below methods are moved here from AdminFieldsService and FormFieldsService: all 3 are created for the same endpoint group 'admin/fields'

  getFormFieldsByTenant(paging?: Paging, sorting?: Sorting[], filters?: SearchFieldModel[]): Promise<PagedData<IFieldBaseDto>> {
    // tslint:disable-next-line: max-line-length
    return this.httpClient.post<PagedData<IFieldBaseDto>>(
      `${this.BASE_URL}/search`,
      this.httpClient.buildSearchParams(paging, sorting, filters)
    );
  }

  // getFormFieldsModels(tenant: string, id: string): Promise<FormFieldModel[]> {
  //   return this.httpClient.get<FormFieldModel[]>(`admin/Forms/${tenant}/${id}/fields`);
  // }

  // getFormField(id: string): Promise<FormFieldModel> {
  //   return this.httpClient.get<FormFieldModel>(`${this.BASE_URL}/formfields/${id}`);
  // }

  async createField(field: TenantFieldDto): Promise<TenantFieldDto> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL}`, field);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

    return this.getTenantField(operation.targetId);
  }

  async updateField(id: string, field: TenantFieldDto): Promise<TenantFieldDto> {
    let operation = await this.httpClient.put<Operation>(`${this.BASE_URL}/${id}`, field);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

    return this.getTenantField(id);
  }

  async deleteField(id: string): Promise<Operation> {
    let operation = await this.httpClient.delete<Operation>(`${this.BASE_URL}/${id}`);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

    return operation;
  }

  getTenantField(id: string): Promise<TenantFieldDto> {
    return this.httpClient.get<TenantFieldDto>(`${this.BASE_URL}/${id}`);
  }
}
