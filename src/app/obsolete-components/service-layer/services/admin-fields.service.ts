// /**
//  * global
//  */
// import { Injectable, Inject } from '@angular/core';
// import { IFieldBaseDto } from '../models';

// /**
//  * project
//  */

// import { Operation } from '../models/operation';

// /**
//  * local
//  */
// import { HttpClientService } from './application-http-client.service';
// import { OperationService } from './operation.service';

// @Injectable({
//   providedIn: 'root'
// })
// /**
//  * @deprecated  use AdminTenantFieldsService instance of it
//  */
// export class AdminFieldsService {
//   private BASE_URL = 'admin/fields';

//   constructor(@Inject('HttpClientService') private httpClient: HttpClientService, private operationsService: OperationService) {}

//   async create(cmd: IFieldBaseDto): Promise<Operation> {
//     let operation = await this.httpClient.post<Operation>(`${this.BASE_URL}`, cmd);
//     operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

//     return operation;
//   }

//   async getById(id: string): Promise<IFieldBaseDto> {
//     return await this.httpClient.get<IFieldBaseDto>(`${this.BASE_URL}/${id}`);
//   }

//   async deleteById(id: string): Promise<Operation> {
//     let operation = await this.httpClient.delete<Operation>(`${this.BASE_URL}/${id}`);
//     operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

//     return operation;
//   }
// }
