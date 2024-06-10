// /**
//  * global
//  */
// import { Injectable, Inject } from '@angular/core';

// /**
//  * project
//  */

// import {
//   CreateCaseWithRawData,
//   UpdateCaseRawData,
//   CaseWithRawData,
//   UpdateCaseStatusDto,
//   ProcessStepName,
//   UpdateCaseNameModel,
//   PagedData,
//   Paging,
//   Sorting,
//   CaseDto
// } from './../models';

// import { SearchFieldModel } from '@wfm/service-layer/models/dynamic-entity-models';

// /**
//  * local
//  */
// import { HttpClientService } from './application-http-client.service';
// import { Operation } from '../models/operation';
// import { OperationService } from './operation.service';

// @Injectable({
//   providedIn: 'root'
// })
// export class CasesService {
//   BASE_URL = '';

//   constructor(@Inject('HttpClientService') private httpClient: HttpClientService, private operationsService: OperationService) {}

//   getCasesWithRawData(
//     tenant: string,
//     paging?: Paging,
//     sorting?: Sorting[],
//     filters?: SearchFieldModel[]
//   ): Promise<PagedData<CaseWithRawData>> {
//     return this.httpClient.post<PagedData<CaseWithRawData>>(
//       `${this.BASE_URL}admin/cases/${tenant}/with-raw-data-items`,
//       this.httpClient.buildSearchParams(paging, sorting, filters)
//     );
//   }

//   getCasesWithoutRawData(tenant: string, paging?: Paging, sorting?: Sorting[], filters?: SearchFieldModel[]): Promise<PagedData<CaseDto>> {
//     // filter by name
//     // filters =
//     //   {
//     //     id: 'Name',
//     //     type: FieldTypeIds.StringField,
//     //     searchType: SearchType.Like,
//     //     value: 'Case 9'
//     //   } as LikeFilter<string>
//     // ];

//     // filter by status
//     // filters = [
//     //   {
//     //     id: 'Status',
//     //     searchType: SearchType.Custom,
//     //     value: CaseStatus.InProgress,
//     //     customSearchType: CustomSearchType.CaseStatus
//     //   } as CaseStatusSearchFilter
//     // ];

//     // filter by date creatred
//     // filters = [
//     //   {
//     //     id: 'CreatedAt',
//     //     type: FieldTypeIds.DateField,
//     //     searchType: SearchType.Range,
//     //     from: new Date('2020-01-17'),
//     //     to: new Date('2020-01-21'),
//     //   } as RangeFilter<Date>
//     // ];
//     // filter by author first name
//     // filters = [
//     //   {
//     //     id: 'AuthorFirstName',
//     //     type: FieldTypeIds.StringField,
//     //     searchType: SearchType.Like,
//     //     value: 'Gergana'
//     //   } as LikeFilter<string>
//     // ];
//     // tslint:disable-next-line: max-line-length
//     return this.httpClient.post<PagedData<CaseDto>>(
//       `${this.BASE_URL}admin/cases/${tenant}/without-raw-data-items`,
//       this.httpClient.buildSearchParams(paging, sorting, filters)
//     );
//   }

//   getCaseById2(tenant: string, caseId: string): Promise<CaseWithRawData> {
//     return this.httpClient.get<CaseWithRawData>(`${this.BASE_URL}admin/Cases2/${tenant}/${caseId}/raw-data-items`);
//   }

//   getCaseById(tenant: string, caseId: string): Promise<CaseWithRawData> {
//     return this.httpClient.get<CaseWithRawData>(`${this.BASE_URL}admin/Cases/${tenant}/${caseId}/raw-data-items`);
//   }

//   getProcessStepNames(tenant: string, caseId: string): Promise<ProcessStepName[]> {
//     return this.httpClient.get<ProcessStepName[]>(`${this.BASE_URL}admin/Cases/${tenant}/${caseId}/processsteps-names`);
//   }

//   async create2(tenant: string, cmd: CreateCaseWithRawData): Promise<Operation> {
//     let operation = await this.httpClient.post<Operation>(`${this.BASE_URL}admin/Cases2/${tenant}/create-case-with-raw-data`, cmd);
//     operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

//     return operation;
//   }

//   async create(tenant: string, cmd: CreateCaseWithRawData): Promise<Operation> {
//     let operation = await this.httpClient.post<Operation>(`${this.BASE_URL}admin/Cases/${tenant}/create-case-with-raw-data`, cmd);
//     operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

//     return operation;
//   }

//   delete(tenant: string, id: string): Promise<void> {
//     return this.httpClient.delete<void>(`${this.BASE_URL}admin/Cases/${tenant}/${id}`);
//   }

//   updateCaseStatus(tenant: string, dto: UpdateCaseStatusDto): any {
//     return this.httpClient.post<UpdateCaseStatusDto>(`${this.BASE_URL}admin/Cases/${tenant}/update-case-status`, dto);
//   }

//   update(tenant: string, supplierId: string, rawDataIds: string[], name: string, caseId: string): Promise<CreateCaseWithRawData> {
//     const dto = <CreateCaseWithRawData>{
//       supplierId,
//       rawDataIds,
//       name
//     };
//     return this.httpClient.put<CreateCaseWithRawData>(`${this.BASE_URL}admin/cases/${tenant}/${caseId}/update-case-with-raw-data`, dto);
//   }

//   updateCaseRawData(tenant: string, caseId: string, dto: UpdateCaseRawData): Promise<UpdateCaseRawData> {
//     return this.httpClient.put<UpdateCaseRawData>(`${this.BASE_URL}admin/cases/${tenant}/${caseId}/update-case-raw-data`, dto);
//   }

//   deleteCaseRawData(tenant: string, caseId: string, rawDataId: string) {
//     return this.httpClient.delete<void>(`${this.BASE_URL}admin/cases/${tenant}/${caseId}/delete-case-raw-data/${rawDataId}`);
//   }
//   updateCaseName(dto: UpdateCaseNameModel) {
//     return this.httpClient.put<UpdateCaseNameModel>(`${this.BASE_URL}admin/Cases/${dto.tenantId}/${dto.caseId}/update-case-name`, dto);
//   }
// }
