// import { Inject, Injectable } from '@angular/core';
// import { from, Observable, of } from 'rxjs';
// import { map, switchMap, take } from 'rxjs/operators';

// import { CaseBuilderDto, UpdateCaseBuilderDto } from '../models/case-builder';
// import { PagedData, Paging, SortDirection, Sorting } from '../models/model';
// import { Operation } from '../models/operation';
// import { HttpClientService } from './application-http-client.service';
// import { OperationService } from './operation.service';

// @Injectable({
//   providedIn: 'root'
// })
// /**
//  * @deprecated  use TemplateFieldsService instance of it
//  */
// export class CaseBuilderService {
//   BASE_URL = 'admin/casebuilder';

//   constructor(@Inject('HttpClientService') private httpClient: HttpClientService, private operationsService: OperationService) {}

//   async update(cmd: UpdateCaseBuilderDto): Promise<Operation> {
//     let operation = await this.httpClient.put<Operation>(`${this.BASE_URL}/${cmd.tenantId}/${cmd.caseBuilderPublicId}`, cmd);
//     operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
//     return operation;
//   }

//   async create(casebuilder: CaseBuilderDto): Promise<Operation> {
//     let operation = await this.httpClient.post<Operation>(`${this.BASE_URL}`, casebuilder);
//     operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
//     return operation;
//   }
//   /**
//    *
//    * @param dto
//    * @returns taskId use OperationService for getResult
//    */
//   create$(dto: CaseBuilderDto): Observable<string> {
//     return from(this.httpClient.post<Operation>(`${this.BASE_URL}`, dto)).pipe(
//       take(1),
//       map((x) => x.id)
//     );
//   }
//   createWithWaitResult$(dto: CaseBuilderDto, delay = 300): Observable<Operation> {
//     return this.create$(dto).pipe(switchMap((taskId) => this.operationsService.waitTask(taskId, delay)));
//   }

//   getPage(appId: string, tenantId: string, paging: Paging, sorting?: Sorting[]): Observable<PagedData<CaseBuilderDto>> {
//     return of(true).pipe(
//       switchMap(() => from(this.getByTenantOrAppId(appId, tenantId, paging, sorting))),
//       take(1)
//     );
//   }

//   async getByTenantOrAppId(appId: string, tenantId: string, paging: Paging, sorting?: Sorting[]): Promise<PagedData<CaseBuilderDto>> {
//     let sortDirection = SortDirection.asc;
//     if (sorting && sorting[0] && sorting[0].propertyName === 'name') {
//       sortDirection = sorting[0].sort;
//     }

//     const result = await this.httpClient.post<Promise<PagedData<CaseBuilderDto>>>(`${this.BASE_URL}/by-tenant-app`, {
//       appId,
//       tenantId,
//       skip: paging.skip,
//       take: paging.take,
//       sortDirection
//     });
//     return result;
//   }

//   async getById(id: string): Promise<CaseBuilderDto> {
//     const result = await this.httpClient.get<CaseBuilderDto>(`${this.BASE_URL}/${id}`);
//     return result;
//   }

//   async deleteById(id: string): Promise<Operation> {
//     let operation = await this.httpClient.delete<Operation>(`${this.BASE_URL}/${id}`);
//     operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
//     return operation;
//   }

//   all(paging?: Paging): Promise<PagedData<CaseBuilderDto>> {
//     return this.httpClient.post<PagedData<CaseBuilderDto>>(`${this.BASE_URL}/all`, { skip: paging.skip, take: paging.take });
//   }
// }
