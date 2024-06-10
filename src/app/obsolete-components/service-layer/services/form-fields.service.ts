// /**
//  * global
//  */
// import { Injectable, Inject } from '@angular/core';

// /**
//  * project
//  */
// import { PagedData, Paging, Sorting, FormFieldModel, IFieldBaseDto, Operation } from '../models';
// import { SearchFieldModel } from '@wfm/service-layer/models/dynamic-entity-models';
// import { TenantFieldDto } from '../models/RawDataFieldInfo';

// /**
//  * local
//  */
// import { HttpClientService } from './application-http-client.service';
// import { OperationService } from './operation.service';

// @Injectable({
//   providedIn: 'root'
// })
// /**
//  * @deprecated  use TemplateFieldsService instance of it
//  */
// export class FormFieldsService {
//   private BASE_URL = 'admin/Fields';

//   constructor(@Inject('HttpClientService') private httpClient: HttpClientService, private operationsService: OperationService) {}

//   // getFormFieldsByTenant(paging?: Paging, sorting?: Sorting[], filters?: SearchFieldModel[]): Promise<PagedData<IFieldBaseDto>> {
//   //   // tslint:disable-next-line: max-line-length
//   //   return this.httpClient.post<PagedData<IFieldBaseDto>>(
//   //     `${this.BASE_URL}/search`,
//   //     this.httpClient.buildSearchParams(paging, sorting, filters)
//   //   );
//   // }

//   // getFieldsByAppId(appId: string, paging?: Paging, sorting?: Sorting[], filters?: SearchFieldModel[]): Promise<PagedData<IFieldBaseDto>> {
//   //   return this.httpClient.post<PagedData<IFieldBaseDto>>(
//   //     `${this.BASE_URL}/application/${appId}`,
//   //     this.httpClient.buildSearchParams(paging, sorting, filters)
//   //   );
//   // }

//   // getFormFieldsModels(tenant: string, id: string): Promise<FormFieldModel[]> {
//   //   return this.httpClient.get<FormFieldModel[]>(`admin/Forms/${tenant}/${id}/fields`);
//   // }

//   // async createFormField(field: IFieldBaseDto): Promise<FormFieldModel> {
//   //   let operation = await this.httpClient.post<Operation>(`${this.BASE_URL}`, field);
//   //   operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

//   //   return this.getFormField(operation.targetId);
//   // }

//   // getFormField(id: string): Promise<FormFieldModel> {
//   //   return this.httpClient.get<FormFieldModel>(`${this.BASE_URL}/formfields/${id}`);
//   // }

//   // getTenantField(id: string): Promise<TenantFieldDto> {
//   //   return this.httpClient.get<TenantFieldDto>(`${this.BASE_URL}/${id}`);
//   // }

//   // moved to tenant-admin-service.ts

//   // async createField(field: TenantFieldDto): Promise<TenantFieldDto> {
//   //   let operation = await this.httpClient.post<Operation>(`${this.BASE_URL}`, field);
//   //   operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

//   //   return this.getTenantField(operation.targetId);
//   // }

//   // async updateField(id: string, field: TenantFieldDto): Promise<TenantFieldDto> {
//   //   let operation = await this.httpClient.put<Operation>(`${this.BASE_URL}/${id}`, field);
//   //   operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

//   //   return this.getTenantField(id);
//   // }

//   // async deleteField(id: string): Promise<Operation> {
//   //   let operation = await this.httpClient.delete<Operation>(`${this.BASE_URL}/${id}`);
//   //   operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

//   //   return operation;
//   // }
// }
