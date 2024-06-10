// /**
//  * global
//  */
// import { Injectable, Inject } from '@angular/core';

// /**
//  * project
//  */
// import {
//   SubmitCaseProcessStepFormCommandDto,
//   CaseProcessStepFormResponse,
//   CreateCaseNoteDto,
//   CaseNoteDto,
//   CaseEventHistoryDto
// } from '../models';
// import { CaseProcessStepForm, UpdateCaseProcessStepPositionsDto } from '../models/CaseProcessStepForm';
// import { Operation } from '../models/operation';

// /**
//  * local
//  */
// import { HttpClientService } from './application-http-client.service';
// import { OperationService } from './operation.service';

// @Injectable({
//   providedIn: 'root'
// })
// export class CaseProcessStepFormService {
//   BASE_URL = '';

//   constructor(@Inject('HttpClientService') private httpClient: HttpClientService, private operationsService: OperationService) {}

//   async create(tenantId: string, dto: CaseProcessStepForm): Promise<CaseProcessStepForm> {
//     let operation = await this.httpClient.post<Operation>(
//       `${this.BASE_URL}admin/CaseProcessStepForm/create-case-process-step/${tenantId}`,
//       dto
//     );
//     operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

//     return this.httpClient.get<CaseProcessStepForm>(`${this.BASE_URL}admin/CaseProcessStepForm/${operation.targetId}`);
//   }

//   async submitProcessStepData(tenantId: string, dto: SubmitCaseProcessStepFormCommandDto): Promise<CaseProcessStepFormResponse> {
//     let operation = await this.httpClient.post<Operation>(`${this.BASE_URL}admin/CaseProcessStepForm/data/submit/${tenantId}`, dto);
//     operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

//     return this.getProcessStepData(tenantId, operation.targetId);
//   }

//   getProcessStepData(tenantId: string, contentId: string): Promise<CaseProcessStepFormResponse> {
//     return this.httpClient.get<CaseProcessStepFormResponse>(`${this.BASE_URL}admin/CaseProcessStepForm/data/${tenantId}/${contentId}`);
//   }

//   getAllProcessStepsInCase(tenantId: string, caseId: string): Promise<CaseProcessStepForm[]> {
//     const id = caseId;
//     return this.httpClient.get<CaseProcessStepForm[]>(`${this.BASE_URL}admin/CaseProcessStepForm/case/${tenantId}/${id}`);
//   }

//   delete(tenantId: string, id: string): Promise<void> {
//     return this.httpClient.delete<void>(`admin/CaseProcessStepForm/${tenantId}/${id}`);
//   }

//   async createNote(tenantId: string, dto: CreateCaseNoteDto): Promise<CreateCaseNoteDto> {
//     let operation = await this.httpClient.post<Operation>(`${this.BASE_URL}admin/CaseProcessStepForm/case/note/${tenantId}`, dto);
//     operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

//     const result = (await this.getNotes(tenantId, dto.caseId)).find((x) => x.id == operation.targetId);
//     return result;
//   }

//   getNotes(tenantId: string, caseId: string): Promise<CaseNoteDto[]> {
//     return this.httpClient.get<CaseNoteDto[]>(`${this.BASE_URL}admin/CaseProcessStepForm/case/note/${tenantId}/${caseId}`);
//   }

//   async deleteNote(tenantId: string, id: string): Promise<Operation> {
//     let operation = await this.httpClient.delete<Operation>(`${this.BASE_URL}admin/CaseProcessStepForm/case/note/${tenantId}/${id}`);
//     operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

//     return operation;
//   }

//   getEvents(tenantId: string, caseId: string): Promise<CaseEventHistoryDto[]> {
//     return this.httpClient.get<CaseEventHistoryDto[]>(`${this.BASE_URL}admin/CaseProcessStepForm/case/events/${tenantId}/${caseId}`);
//   }

//   updatePositions(tenantId: string, dto: UpdateCaseProcessStepPositionsDto): Promise<CaseProcessStepForm[]> {
//     return this.httpClient.put<CaseProcessStepForm[]>(`${this.BASE_URL}admin/CaseProcessStepForm/case/${tenantId}/update-positions`, dto);
//   }
// }
