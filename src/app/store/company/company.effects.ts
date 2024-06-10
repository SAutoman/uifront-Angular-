/**
 * global
 */
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { exhaustMap, switchMap } from 'rxjs/operators';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';

/**
 * project
 */

import { Company, CompanyService, UsersService } from '../../service-layer';

/**
 * local
 */

import {
  CompanyActionTypes,
  CreateCompany,
  CreateCompanySuccess,
  CreateCompanyFail,
  SearchAllCompanyEntities,
  SearchAllCompanyEntitiesSuccess,
  LoadCompanyById,
  LoadCompanyByIdSuccess,
  LoadCompanyByIdFail,
  UpdateCompany,
  UpdateCompanySuccess,
  UpdateCompanyFail,
  DeleteCompanyById,
  DeleteCompanyByIdSuccess,
  DeleteCompanyByIdFail,
  GetAuditorCompanies,
  GetAuditorCompaniesFail,
  GetAuditorCompaniesSuccess,
  GetSupplierCompanies,
  GetSupplierCompaniesFail,
  GetSupplierCompaniesSuccess,
  GetTenantMappingCompanies,
  GetTenantMappingCompaniesFail,
  GetTenantMappingCompaniesSuccess
} from './company.actions';
import { CompanyBriefInfo, UserWithCompany } from '@wfm/service-layer/models/mappings';
import { GetAssociatedCompanies, GetAssociatedCompaniesFail, GetAssociatedCompaniesSuccess } from '.';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';

@Injectable()
export class CompanyEffects {
  constructor(
    private actions$: Actions,
    private service: CompanyService,
    private usersService: UsersService,
    private errorHandlerService: ErrorHandlerService
  ) {}

  // ========================================= CREATE
  create: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<CreateCompany>(CompanyActionTypes.CreateCompany),
      exhaustMap(async (action) => {
        try {
          const result = await this.service.create(action.payload.company);
          return new CreateCompanySuccess({ result });
        } catch (error) {
          return new CreateCompanyFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  // ========================================= SEARCH
  // @Effect()
  // search: Observable<Action> = this.actions$
  // .pipe(
  //     ofType<SearchAllCompanyEntities>(CompanyActionTypes.SearchAllCompanyEntities),
  //     // Use the state's filtering and pagination values in this search call
  //     // here if desired:
  //     exhaustMap(() =>
  //       this.service.search().pipe(
  //         map((entities: Array<Company>) =>
  //           new SearchAllCompanyEntitiesSuccess({ result: entities })
  //         ),
  //         catchError(({ message }) =>
  //           of(new SearchAllCompanyEntitiesFail({ error: message }))
  //         )
  //       )
  //     )
  //   );

  search: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<SearchAllCompanyEntities>(CompanyActionTypes.SearchAllCompanyEntities),
      switchMap(async (action) => {
        try {
          const result = await this.service.search(null, null);
          return new SearchAllCompanyEntitiesSuccess({ result: result.items });
        } catch (error) {
          return new LoadCompanyByIdFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  // ========================================= LOAD BY ID
  loadById: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<LoadCompanyById>(CompanyActionTypes.LoadCompanyById),
      switchMap(async (action) => {
        try {
          const result = await this.service.getById(action.payload.id);
          return new LoadCompanyByIdSuccess({ result });
        } catch (error) {
          return new LoadCompanyByIdFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  // ========================================= UPDATE
  update: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<UpdateCompany>(CompanyActionTypes.UpdateCompany),
      exhaustMap(async (action) => {
        try {
          const company = await this.service.update(action.payload.company);
          return new UpdateCompanySuccess({ update: { id: company.id, changes: company } as Update<Company> });
        } catch (error) {
          return new UpdateCompanyFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  // ========================================= DELETE
  delete: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<DeleteCompanyById>(CompanyActionTypes.DeleteCompanyById),
      exhaustMap(async (action) => {
        try {
          const data = await this.service.deleteById(action.payload.id);
          return new DeleteCompanyByIdSuccess({ id: CompanyActionTypes.DeleteCompanyById });
        } catch (error) {
          return new DeleteCompanyByIdFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  // ========================================= QUERY

  // paging: Observable<Action> = createEffect(()=>
  // this.actions$.pipe(
  //   ofType<SetCompanySearchQuery>(CompanyActionTypes.SetSearchQuery),
  //   tap((action) => {
  //     // do stuff with: action.payload.limit & action.payload.page
  //   })
  // ),
  // {dispatch: false}
  // );

  // ========================================= SELECTED ID

  // selectedId: Observable<Action> = createEffect(()=>
  // this.actions$.pipe(
  //   ofType<SelectCompanyById>(CompanyActionTypes.SelectCompanyById),
  //   tap((action) => {
  //     // do stuff with: action.payload.id
  //   })
  // ),
  // {dispatch: false}

  // );

  GetSupplierCompanies: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetSupplierCompanies>(CompanyActionTypes.GetSupplierCompanies),
      exhaustMap(async (action) => {
        try {
          const supplierUsers = await this.usersService.getSupplierCompanies(action.payload.tenantId);
          const supplierCompanies = this.getUniqueCompaniesFromUsers(supplierUsers);

          return new GetSupplierCompaniesSuccess({ result: supplierCompanies });
        } catch (error) {
          return new GetSupplierCompaniesFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  GetAuditorCompanies: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetAuditorCompanies>(CompanyActionTypes.GetAuditorCompanies),
      exhaustMap(async (action) => {
        try {
          const users = await this.usersService.getAuditorCompanies(action.payload.tenantId);
          const companies = this.getUniqueCompaniesFromUsers(users);

          return new GetAuditorCompaniesSuccess({ result: companies });
        } catch (error) {
          return new GetAuditorCompaniesFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  GetAssociatedCompanies: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetAssociatedCompanies>(CompanyActionTypes.GetAssociatedCompanies),
      exhaustMap(async (action) => {
        try {
          const companies = await this.service.getCompaniesByTenantWithUsers(action.payload.tenantId);
          return new GetAssociatedCompaniesSuccess({ result: companies });
        } catch (error) {
          return new GetAssociatedCompaniesFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  GetTenantCompanies: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetTenantMappingCompanies>(CompanyActionTypes.GetTenantMappingCompanies),
      exhaustMap(async (action) => {
        try {
          const companies = await this.service.getCompaniesByTenantAndNoUserCompanies(action.payload.tenantId);
          return new GetTenantMappingCompaniesSuccess({ result: companies });
        } catch (error) {
          return new GetTenantMappingCompaniesFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  private getUniqueCompaniesFromUsers(users: UserWithCompany[]): CompanyBriefInfo[] {
    const companies = users
      .map((user: UserWithCompany) => {
        return {
          companyPublicId: user.companyPublicId,
          companyName: user.companyName
        };
      })
      .reduce((uniqueCompanies, comp) => {
        if (!uniqueCompanies.find((item) => item.companyPublicId === comp.companyPublicId) && comp.companyName && comp.companyPublicId) {
          uniqueCompanies.push(comp);
        }
        return uniqueCompanies;
      }, []);
    return companies;
  }
}
