/**
 * global
 */
import { Injectable, Inject } from '@angular/core';

/**
 * project
 */
import { Company, Paging, Sorting, PagedData, User, InvoiceDetails, Invoice, TenantCompaniesWithUsers } from '../models';
import { Operation } from '../models/operation';

/**
 * local
 */
import { HttpClientService } from './application-http-client.service';
import { OperationService } from './operation.service';

interface CompanyUsers {
  name: string;
  users: User[];
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  BASE_URL = 'Companies';

  constructor(@Inject('HttpClientService') private httpClient: HttpClientService, private operationsService: OperationService) {}

  async create(company: Company): Promise<Company> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL}`, { ...company, id: null });
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

    return await this.getById(operation.targetId);
  }

  async search(paging?: Paging, sorting?: Sorting[]): Promise<PagedData<Company>> {
    return await this.httpClient.post<PagedData<Company>>(
      `${this.BASE_URL}/get-companies`,
      this.httpClient.buildSearchParams(paging, sorting, [])
    );
  }

  async getById(id: string): Promise<Company> {
    return await this.httpClient.get<Company>(`${this.BASE_URL}/${id}`);
  }

  async update(company: Company): Promise<Company> {
    let operation = await this.httpClient.put<Operation>(`${this.BASE_URL}/${company.id}`, company);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

    return this.getById(operation.targetId);
  }

  async deleteById(id: string): Promise<Operation> {
    let operation = await this.httpClient.delete<Operation>(`${this.BASE_URL}/${id}`);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

    return operation;
  }

  async getCompaniesByDomain(value: string, paging?: Paging, sorting?: Sorting[]): Promise<PagedData<Company>> {
    return await this.httpClient.post<PagedData<Company>>(
      `${this.BASE_URL}/companies-per-domain?value=${value}`,
      this.httpClient.buildSearchParams(paging, sorting, [])
    );
  }

  async getCompaniesByTenantWithUsers(tenantId: string): Promise<Company[]> {
    return await this.httpClient.get<Company[]>(`${this.BASE_URL}/tenantWithUsers/${tenantId}`);
  }

  async getUsersByCompany(companyId: string): Promise<CompanyUsers> {
    return await this.httpClient.get<CompanyUsers>(`${this.BASE_URL}/${companyId}/users`);
  }

  async createInvoiceAddress(details: InvoiceDetails, companyId: string): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL}/${companyId}/create-invoice-address`, details);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async updateInvoiceAddress(details: Invoice): Promise<Operation> {
    let operation = await this.httpClient.put<Operation>(`${this.BASE_URL}/invoice-address/${details?.id}/update`, details);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async getTenantCompanies(tenantId: string, paging?: Paging): Promise<PagedData<TenantCompaniesWithUsers>> {
    return await this.httpClient.post<PagedData<TenantCompaniesWithUsers>>(`${this.BASE_URL}/company-users-detail/${tenantId}`, {
      paging: paging
    });
  }

  async getCompaniesByTenantAndNoUserCompanies(tenantId: string): Promise<Company[]> {
    return await this.httpClient.get<Company[]>(`${this.BASE_URL}/tenantCompanies-and-noUsersCompanies/${tenantId}`);
  }
}
