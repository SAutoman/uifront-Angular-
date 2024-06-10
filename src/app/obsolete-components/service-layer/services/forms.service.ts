// /**
//  * global
//  */
// import { Injectable, Inject } from '@angular/core';

// /**
//  * project
//  */
// import { PagedData, DataEntity, Paging, Sorting, Form, FormFieldModel } from '../models';
// import { SearchFieldModel } from '@wfm/service-layer/models/dynamic-entity-models';
// import { Expression } from '../../obsolete-components/forms/models/FunctionQuery';

// /**
//  * local
//  */
// import { HttpClientService } from './application-http-client.service';
// import { OperationService } from './operation.service';
// import { Operation, OperationStatus } from '../models/operation';

// export interface UpdateFormCommandDTO extends DataEntity {
//   name: string;
//   documentId: string;

//   newFields: FormFieldModel[];
//   updatedFields: FormFieldModel[];
//   deletedFields: string[];
//   functions: Expression[];
// }

// @Injectable({
//   providedIn: 'root'
// })
// /**
//  * @deprecated  use TemplateFieldsService instance of it
//  */
// export class FormsService {
//   BASE_URL = '';

//   constructor(@Inject('HttpClientService') private httpClient: HttpClientService, private operationsService: OperationService) {}

//   getForms(tenant: string, paging?: Paging, sorting?: Sorting[], filters?: SearchFieldModel[]): Promise<PagedData<Form>> {
//     // tslint:disable-next-line: max-line-length
//     return this.httpClient.post<PagedData<Form>>(
//       `${this.BASE_URL}admin/forms/${tenant}`,
//       this.httpClient.buildSearchParams(paging, sorting, filters)
//     );
//   }

//   getFormById(tenant: string, id: string): Promise<Form> {
//     return this.httpClient.get<Form>(`${this.BASE_URL}admin/forms/${tenant}/${id}`);
//   }

//   async createForm(
//     tenant: string,
//     name: string,
//     maxFileCount: number,
//     allowedFileType: string,
//     fields: FormFieldModel[],
//     documentId: string,
//     functions: Expression[]
//   ): Promise<Form> {
//     const dto: Form = {
//       name,
//       maxFileCount,
//       allowedFileType,
//       tenantPublicId: tenant,
//       fields,
//       documentId,
//       functions
//     };

//     let operation = await this.httpClient.post<Operation>(`${this.BASE_URL}admin/forms/${tenant}/create-form`, dto);
//     operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

//     return this.getFormById(tenant, operation.targetId);
//   }

//   async deleteForm(id: string, tenant: string): Promise<Operation> {
//     let operation = await this.httpClient.delete<Operation>(`${this.BASE_URL}admin/forms/${tenant}/${id}`);
//     operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

//     return operation;
//   }

//   async deleteFormField(tenant: string, id: string) {
//     let operation = await this.httpClient.delete<Operation>(`${this.BASE_URL}admin/forms/fields/${tenant}/${id}`);
//     operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

//     return operation;
//   }

//   getFormFields(tenant: string, formId: string): Promise<Form> {
//     return this.httpClient.get<Form>(`${this.BASE_URL}admin/Forms/${tenant}/${formId}/fields`);
//   }

//   async updateForm(tenant: string, command: UpdateFormCommandDTO): Promise<Form> {
//     let operation = await this.httpClient.put<Operation>(`${this.BASE_URL}admin/Forms/update/${tenant}`, command);
//     operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

//     return this.getFormById(tenant, operation.targetId);
//   }
// }
