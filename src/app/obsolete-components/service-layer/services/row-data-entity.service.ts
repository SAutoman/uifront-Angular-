// /**
//  * global
//  */
// import { Injectable, Inject } from '@angular/core';

// /**
//  * project
//  */

// import { Paging, Sorting, PagedData, RawDataEntity, Roles } from '../models';
// import { SearchFieldModel } from '@wfm/service-layer/models/dynamic-entity-models';

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
// export class RawDataEntityService {
//   BASE_URL = 'RawData';

//   constructor(@Inject('HttpClientService') private httpClient: HttpClientService, private operationsService: OperationService) {}

//   async deleteItems(tenant: string, ids: string[]): Promise<string[]> {
//     let operation = await this.httpClient.post<Operation>(`${this.BASE_URL}/${tenant}/delete-items`, ids);
//     operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

//     return ids;
//   }

//   async create(tenant: string, rawDataEntity: RawDataEntity): Promise<RawDataEntity> {
//     let operation = await this.httpClient.post<Operation>(`${this.BASE_URL}/tenant`, { ...rawDataEntity, id: null });
//     operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

//     return this.getById(tenant, operation.targetId);
//   }

//   search(
//     tenant: string,
//     paging?: Paging,
//     sorting?: Sorting[],
//     filters?: SearchFieldModel[],
//     supplier?: string,
//     selectedRole?: Roles
//   ): Promise<PagedData<RawDataEntity>> {
//     // tslint:disable-next-line: max-line-length
//     return this.httpClient.post<PagedData<RawDataEntity>>(
//       `${this.BASE_URL}/${tenant}`,
//       this.httpClient.buildSearchParams(paging, sorting, filters)
//     );
//   }

//   getById(tenant: string, id: string): Promise<RawDataEntity> {
//     return this.httpClient.get<RawDataEntity>(`${this.BASE_URL}/${tenant}/${id}`);
//   }

//   async update(tenant: string, rawDataEntity: RawDataEntity): Promise<RawDataEntity> {
//     let operation = await this.httpClient.put<Operation>(`${this.BASE_URL}/tenant/${rawDataEntity.id}`, rawDataEntity);
//     operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

//     return this.getById(tenant, operation.targetId);
//   }

//   async deleteById(id: string): Promise<Operation> {
//     let operation = await this.httpClient.delete<Operation>(`${this.BASE_URL}/${id}`);
//     operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

//     return operation;
//   }

//   getSearchType(role: Roles, supplier: string) {
//     let searchType = '';
//     switch (role) {
//       case Roles.Supplier:
//         searchType = `/supplier/${supplier}`;
//         break;
//       case Roles.Auditor:
//         searchType = `/auditor/${supplier}`;
//         break;
//     }
//     return searchType;
//   }
// }
