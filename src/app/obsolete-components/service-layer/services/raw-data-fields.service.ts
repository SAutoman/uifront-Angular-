// /**
//  * global
//  */
// import { Injectable, Inject } from '@angular/core';

// /**
//  * project
//  */
// import { RawDataFieldInfo } from '../models';
// import { RawDataFieldsModel, CreateRawDataFieldModel } from '@wfm/service-layer/models/dynamic-entity-models';

// /**
//  * local
//  */
// import { HttpClientService } from './application-http-client.service';
// import { OperationService } from './operation.service';
// import { Operation } from '../models/operation';

// @Injectable({
//   providedIn: 'root'
// })
// /**
//  * @deprecated  use DynamicEntitiesService instance of it
//  */
// export class RawDataFieldsService {
//   private BASE_URL = 'RawDataFields';

//   constructor(@Inject('HttpClientService') private httpClient: HttpClientService, private operationsService: OperationService) {}

//   async getFieldsByTenant(tenant: string): Promise<RawDataFieldInfo[]> {
//     return this.httpClient.get<RawDataFieldInfo[]>(`${this.BASE_URL}/tenant/${tenant}`);
//   }

//   async getRawdataFieldById(id: string): Promise<RawDataFieldsModel> {
//     return this.httpClient.get<RawDataFieldsModel>(`${this.BASE_URL}/${id}`);
//   }
//   /**
//    *
//    * @param tenant
//    * @param RawDataField
//    * @returns not finished operation
//    */
//   async createItem(tenant: string, RawDataField: CreateRawDataFieldModel): Promise<Operation> {
//     return await this.httpClient.post<Operation>(`${this.BASE_URL}/${tenant}`, { ...RawDataField });
//   }
//   async waitOperation(operationId: string, delay = 300): Promise<Operation> {
//     return await this.operationsService.waitTask(operationId, delay).toPromise();
//   }

//   async create(tenant: string, RawDataField: CreateRawDataFieldModel): Promise<RawDataFieldsModel> {
//     let operation = await this.httpClient.post<Operation>(`${this.BASE_URL}/${tenant}`, { ...RawDataField });
//     operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

//     return this.getRawdataFieldById(operation.targetId);
//   }

//   async update(tenant: string, fieldId: string, data: CreateRawDataFieldModel): Promise<RawDataFieldsModel> {
//     let operation = await this.httpClient.put<Operation>(`${this.BASE_URL}/${tenant}/${fieldId}`, data);
//     operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
//     operation.targetId = fieldId;
//     return this.getRawdataFieldById(operation.targetId);
//   }

//   async deleteById(tenant: string, id: string): Promise<Operation> {
//     let operation = await this.httpClient.delete<Operation>(`${this.BASE_URL}/${tenant}/${id}`);
//     operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

//     return operation;
//   }

//   /**
//    * DELETE THIS GROUP AND USING AFTER DEMO
//    */
//   async crateDeleteMeAfterDemo(tenantId: string, RawDataField: CreateRawDataFieldModel): Promise<RawDataFieldsModel> {
//     return this.httpClient.post<RawDataFieldsModel>(`${this.BASE_URL}/${tenantId}`, {
//       ...RawDataField,
//       id: null
//     });
//   }
//   async updateDeleteMeAfterDemo(tenantId: string, fieldId: string, data: CreateRawDataFieldModel): Promise<RawDataFieldsModel> {
//     return this.httpClient.put<RawDataFieldsModel>(`${this.BASE_URL}/${tenantId}/${fieldId}`, data);
//   }
//   /**
//    *
//    * @param tenantId
//    * @param id RawDataFieldsModel.id
//    */
//   async deleteDeleteMeAfterDemo(tenantId: string, id: string): Promise<void> {
//     return this.httpClient.delete<void>(`${this.BASE_URL}/${tenantId}/${id}`);
//   }
// }
