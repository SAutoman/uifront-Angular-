/**
 * global
 */
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';

/**
 * project
 */
import { Company } from '../../service-layer/models/Company';

/**
 * local
 */
import { CompanySearchQuery } from './company.reducer';
import { CompanyBriefInfo } from '@wfm/service-layer/models/mappings';

export enum CompanyActionTypes {
  CreateCompany = '[Company] Create',
  CreateCompanySuccess = '[Company] Insert Success',
  CreateCompanyFail = '[Company] Insert Fail',

  SearchAllCompanyEntities = '[Company] Search',
  SearchAllCompanyEntitiesSuccess = '[Company] Search Success',
  SearchAllCompanyEntitiesFail = '[Company] Search Fail',

  LoadCompanyById = '[Company] Load By ID',
  LoadCompanyByIdSuccess = '[Company] Load Success',
  LoadCompanyByIdFail = '[Company] Load Fail',

  UpdateCompany = '[Company] Update',
  UpdateCompanySuccess = '[Company] Update Success',
  UpdateCompanyFail = '[Company] Update Fail',

  DeleteCompanyById = '[Company] Delete By ID',
  DeleteCompanyByIdSuccess = '[Company] Delete Success',
  DeleteCompanyByIdFail = '[Company] Delete Fail',

  SetSearchQuery = '[Company] Set Search Query',
  SelectCompanyById = '[Company] Select By ID',

  GetSupplierCompanies = '[Company] Get Supplier Companies',
  GetSupplierCompaniesSuccess = '[Company] Get Supplier Companies Success',
  GetSupplierCompaniesFail = '[Company] Get Supplier Companies Fail',

  GetAuditorCompanies = '[Company] Get Auditor Companies',
  GetAuditorCompaniesSuccess = '[Company] Get Auditor Companies Success',
  GetAuditorCompaniesFail = '[Company] Get Auditor Companies Fail',

  GetAssociatedCompanies = '[Company] Get Companies Associated With Tenant',
  GetAssociatedCompaniesSuccess = '[Company] Get Companies Associated With Tenant Success',
  GetAssociatedCompaniesFail = '[Company] Get Companies Associated With Tenant Fail',

  GetTenantMappingCompanies = '[Company] Get Tenant Mapping Companies',
  GetTenantMappingCompaniesSuccess = '[Company] Get Tenant Mapping Companies Success',
  GetTenantMappingCompaniesFail = '[Company] Get Tenant Mapping Companies Fail'
}

// ========================================= CREATE

export class CreateCompany implements Action {
  readonly type = CompanyActionTypes.CreateCompany;
  constructor(public payload: { company: Company }) {}
}

export class CreateCompanySuccess implements Action {
  readonly type = CompanyActionTypes.CreateCompanySuccess;
  constructor(public payload: { result: Company }) {}
}

export class CreateCompanyFail implements Action {
  readonly type = CompanyActionTypes.CreateCompanyFail;
  constructor(public payload: { error: string }) {}
}

// ========================================= SEARCH

export class SearchAllCompanyEntities implements Action {
  readonly type = CompanyActionTypes.SearchAllCompanyEntities;
}

export class SearchAllCompanyEntitiesSuccess implements Action {
  readonly type = CompanyActionTypes.SearchAllCompanyEntitiesSuccess;
  constructor(public payload: { result: Array<Company> }) {}
}

export class SearchAllCompanyEntitiesFail implements Action {
  readonly type = CompanyActionTypes.SearchAllCompanyEntitiesFail;
  constructor(public payload: { error: string }) {}
}

// ========================================= LOAD BY ID

export class LoadCompanyById implements Action {
  readonly type = CompanyActionTypes.LoadCompanyById;
  constructor(public payload: { id: string }) {}
}

export class LoadCompanyByIdSuccess implements Action {
  readonly type = CompanyActionTypes.LoadCompanyByIdSuccess;
  constructor(public payload: { result: Company }) {}
}

export class LoadCompanyByIdFail implements Action {
  readonly type = CompanyActionTypes.LoadCompanyByIdFail;
  constructor(public payload: { error: string }) {}
}

// ========================================= UPDATE

export class UpdateCompany implements Action {
  readonly type = CompanyActionTypes.UpdateCompany;
  constructor(public payload: { company: Company }) {}
}

export class UpdateCompanySuccess implements Action {
  readonly type = CompanyActionTypes.UpdateCompanySuccess;
  constructor(public payload: { update: Update<Company> }) {}
}

export class UpdateCompanyFail implements Action {
  readonly type = CompanyActionTypes.UpdateCompanyFail;
  constructor(public payload: { error: string }) {}
}

// ========================================= DELETE

export class DeleteCompanyById implements Action {
  readonly type = CompanyActionTypes.DeleteCompanyById;
  constructor(public payload: { id: string }) {}
}

export class DeleteCompanyByIdSuccess implements Action {
  readonly type = CompanyActionTypes.DeleteCompanyByIdSuccess;
  constructor(public payload: { id: string }) {}
}

export class DeleteCompanyByIdFail implements Action {
  readonly type = CompanyActionTypes.DeleteCompanyByIdFail;
  constructor(public payload: { error: string }) {}
}

// ========================================= QUERY

export class SetCompanySearchQuery implements Action {
  readonly type = CompanyActionTypes.SetSearchQuery;
  constructor(public payload: Partial<CompanySearchQuery>) {}
}

// ========================================= SELECTED ID

export class SelectCompanyById implements Action {
  readonly type = CompanyActionTypes.SelectCompanyById;
  constructor(public payload: { id: string }) {}
}

// ================================= Get Supplier Companies

export class GetSupplierCompanies implements Action {
  readonly type = CompanyActionTypes.GetSupplierCompanies;
  constructor(public payload: { tenantId: string }) {}
}

export class GetSupplierCompaniesSuccess implements Action {
  readonly type = CompanyActionTypes.GetSupplierCompaniesSuccess;
  constructor(public payload: { result: CompanyBriefInfo[] }) {}
}

export class GetSupplierCompaniesFail implements Action {
  readonly type = CompanyActionTypes.GetSupplierCompaniesFail;
  constructor(public payload: { error: string }) {}
}

// ================================= Get Auditor Companies

export class GetAuditorCompanies implements Action {
  readonly type = CompanyActionTypes.GetAuditorCompanies;
  constructor(public payload: { tenantId: string }) {}
}

export class GetAuditorCompaniesSuccess implements Action {
  readonly type = CompanyActionTypes.GetAuditorCompaniesSuccess;
  constructor(public payload: { result: CompanyBriefInfo[] }) {}
}

export class GetAuditorCompaniesFail implements Action {
  readonly type = CompanyActionTypes.GetAuditorCompaniesFail;
  constructor(public payload: { error: string }) {}
}

// ================================= Get Auditor Companies

export class GetAssociatedCompanies implements Action {
  readonly type = CompanyActionTypes.GetAssociatedCompanies;
  constructor(public payload: { tenantId: string }) {}
}

export class GetAssociatedCompaniesSuccess implements Action {
  readonly type = CompanyActionTypes.GetAssociatedCompaniesSuccess;
  constructor(public payload: { result: Company[] }) {}
}

export class GetAssociatedCompaniesFail implements Action {
  readonly type = CompanyActionTypes.GetAssociatedCompaniesFail;
  constructor(public payload: { error: string }) {}
}

// ================================== Get Tenant Companies

export class GetTenantMappingCompanies implements Action {
  readonly type = CompanyActionTypes.GetTenantMappingCompanies;
  constructor(public payload: { tenantId: string }) {}
}

export class GetTenantMappingCompaniesSuccess implements Action {
  readonly type = CompanyActionTypes.GetTenantMappingCompaniesSuccess;
  constructor(public payload: { result: Company[] }) {}
}

export class GetTenantMappingCompaniesFail implements Action {
  readonly type = CompanyActionTypes.GetTenantMappingCompaniesFail;
  constructor(public payload: { error: string }) {}
}

export type CompanyActions =
  | CreateCompany
  | CreateCompanySuccess
  | CreateCompanyFail
  | SearchAllCompanyEntities
  | SearchAllCompanyEntitiesSuccess
  | SearchAllCompanyEntitiesFail
  | LoadCompanyById
  | LoadCompanyByIdSuccess
  | LoadCompanyByIdFail
  | UpdateCompany
  | UpdateCompanySuccess
  | UpdateCompanyFail
  | DeleteCompanyById
  | DeleteCompanyByIdSuccess
  | DeleteCompanyByIdFail
  | SetCompanySearchQuery
  | SelectCompanyById
  | GetSupplierCompanies
  | GetSupplierCompaniesSuccess
  | GetSupplierCompaniesFail
  | GetAuditorCompanies
  | GetAuditorCompaniesSuccess
  | GetAuditorCompaniesFail
  | GetAssociatedCompanies
  | GetAssociatedCompaniesSuccess
  | GetAssociatedCompaniesFail
  | GetTenantMappingCompanies
  | GetTenantMappingCompaniesSuccess
  | GetTenantMappingCompaniesFail;
