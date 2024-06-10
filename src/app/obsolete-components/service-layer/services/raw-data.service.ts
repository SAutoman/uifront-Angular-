// /**
//  * global
//  */
// import { Inject, Injectable } from '@angular/core';

// /**
//  * project
//  */
// import { Sorting } from '..';
// import { Operation } from '../models/operation';
// import { RawDataEntity } from '../models/RawDataEntity';
// import { RawDataNewCreate, RawDataNewUpdate } from '../models/RawDataImport';

// /**
//  * local
//  */
// import { HttpClientService } from './application-http-client.service';
// import { OperationService } from './operation.service';

// @Injectable()
// /**
//  * @deprecated  use DynamicEntitiesService instance of it
//  */
// export class RawDataService {
//   BASE_URL = 'admin/newRawData';

//   constructor(private operationsService: OperationService, @Inject('HttpClientService') private httpClient: HttpClientService) {}

//   // async create(cmd: RawDataNewCreate): Promise<Operation> {
//   //   let operation = await this.httpClient.post<Operation>(`${this.BASE_URL}`, cmd);
//   //   operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
//   //   return operation;
//   // }

//   // async update(cmd: RawDataNewUpdate): Promise<Operation> {
//   //   let operation = await this.httpClient.put<Operation>(`${this.BASE_URL}`, cmd);
//   //   operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
//   //   return operation;
//   // }

//   // async getById(tenant: string, id: string): Promise<RawDataEntity> {
//   //   return await this.httpClient.get<RawDataEntity>(`${this.BASE_URL}/${tenant}/${id}`);
//   // }

//   // async deleteById(tenant: string, id: string): Promise<Operation> {
//   //   let operation = await this.httpClient.delete<Operation>(`${this.BASE_URL}/${tenant}/${id}`);
//   //   operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
//   //   return operation;
//   // }

//   // async search(tenantId: string, paging?: Paging, sorting?: Sorting[]): Promise<PagedData<RawDataEntity>> {
//   //   const obj = { paging: paging, sorting: sorting, tenantId: tenantId };
//   //   return this.httpClient.post<PagedData<RawDataEntity>>(`${this.BASE_URL}/search`, obj);
//   // }
// }
