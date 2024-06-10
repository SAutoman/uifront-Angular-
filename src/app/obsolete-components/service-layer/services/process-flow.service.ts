// /**
//  * global
//  */
// import { Injectable, Inject } from '@angular/core';

// /**
//  * project
//  */
// import { SearchFieldModel } from '@wfm/service-layer/models/dynamic-entity-models';
// import { Expression } from '../../obsolete-components/forms/models';

// import { ProcessStep, ProcessStepNames, PagedData, Paging, Sorting } from '../models';

// /**
//  * local
//  */
// import { HttpClientService } from './application-http-client.service';
// import { OperationService } from './operation.service';
// import { Operation } from '../models/operation';
// import {
//   CreateProcessStepModel,
//   ProcessStepFieldModel,
//   ProcessStepFormDto,
//   ProcessStepUpdateModel
// } from '@wfm/obsolete-components/process-step/models';

// @Injectable({
//   providedIn: 'root'
// })
// export class ProcessFlowService {
//   BASE_URL = 'admin/';

//   constructor(@Inject('HttpClientService') private httpClient: HttpClientService, private operationsService: OperationService) {}

//   getAllProcessSteps(tenant: string, paging?: Paging, sorting?: Sorting[], filters?: any[]): Promise<PagedData<ProcessStep>> {
//     // tslint:disable-next-line: max-line-length
//     return this.httpClient.post<PagedData<ProcessStep>>(
//       `${this.BASE_URL}ProcessSteps/${tenant}`,
//       this.httpClient.buildSearchParams(paging, sorting, filters)
//     );
//   }

//   getProcessStepById(tenant: string, id: string): Promise<ProcessStep> {
//     const a = this.httpClient.get<ProcessStep>(`${this.BASE_URL}ProcessSteps/${tenant}/${id}`);
//     return a;
//   }

//   async createProcessStep(
//     tenant: string,
//     name: string,
//     workflowsId: string,
//     fields: ProcessStepFieldModel[],
//     forms: ProcessStepFormDto[],
//     functions: Expression[]
//   ): Promise<CreateProcessStepModel> {
//     const dto: CreateProcessStepModel = {
//       name,
//       workflowsId,
//       fields,
//       forms,
//       functions
//     } as CreateProcessStepModel;

//     let operation = await this.httpClient.post<Operation>(`${this.BASE_URL}ProcessSteps/${tenant}/create-process-step`, dto);
//     operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

//     const result = await this.getProcessStepById(tenant, operation.targetId);

//     return <CreateProcessStepModel>{
//       fields: result.fields,
//       forms: result.forms,
//       functions: result.functions,
//       id: result.id,
//       name: result.name
//     };
//   }

//   async updateProcessStep(tenant: string, command: ProcessStepUpdateModel, stepId: string): Promise<ProcessStepUpdateModel> {
//     let operation = await this.httpClient.put<Operation>(`${this.BASE_URL}ProcessSteps/${tenant}/${stepId}`, command);
//     operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

//     return command;
//   }

//   async create(tenant: string, processStep: ProcessStep): Promise<ProcessStep> {
//     let operation = await this.httpClient.post<Operation>(`${this.BASE_URL}ProcessSteps/${tenant}/create-process-step`, {
//       ...processStep,
//       id: null
//     });
//     operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

//     let result = { ...processStep };
//     result.id = operation.targetId;
//     return result;
//   }

//   async update(tenant: string, processStep: ProcessStep): Promise<ProcessStep> {
//     let operation = await this.httpClient.put<Operation>(`${this.BASE_URL}ProcessSteps/${tenant}`, processStep);
//     operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

//     return processStep;
//   }

//   async deleteById(tenant: string, id: string): Promise<Operation> {
//     let operation = await this.httpClient.delete<Operation>(`${this.BASE_URL}ProcessSteps/${tenant}/${id}`);
//     operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

//     return operation;
//   }

//   getProcessStepNames(
//     tenant: string,
//     paging?: Paging,
//     sorting?: Sorting[],
//     filters?: SearchFieldModel[]
//   ): Promise<PagedData<ProcessStepNames>> {
//     return this.httpClient.post<PagedData<ProcessStepNames>>(
//       `${this.BASE_URL}ProcessSteps/${tenant}/names`,
//       this.httpClient.buildSearchParams(paging, sorting, filters)
//     );
//   }
// }
