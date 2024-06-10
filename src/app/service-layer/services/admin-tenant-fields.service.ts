/**
 * global
 */
import { Injectable, Inject } from '@angular/core';
import { Store } from '@ngrx/store';

import { from, Observable, of } from 'rxjs';
import { filter, switchMap, take } from 'rxjs/operators';

/**
 * project
 */

import { currentTenantSelector } from '@wfm/store/auth/auth.selectors';
import {
  AreaTypeEnum,
  ICreateTenantFieldDto,
  IFieldBaseDto,
  IFilter,
  IUpdateTenantFieldDto,
  Operation,
  Sorting,
  IAreaSearchRequest,
  ITenantFieldsTypesDto,
  DeleteTenantFieldByPublicIdCommand,
  PagedData,
  Paging
} from '@wfm/service-layer/models';
import { SearchType } from '@wfm/service-layer/models/dynamic-entity-models';
import { FieldTypeIds } from '@wfm/service-layer/models/FieldTypeIds';
/**
 * local
 */
import { HttpClientService } from './application-http-client.service';
import { OperationService } from './operation.service';

interface GetTenantFields2Query {
  areaType: AreaTypeEnum;
  tenantId: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminTenantFieldsService {
  private BASE_URL = (tenantId) => `tenant/${tenantId}/tenantFields`;

  constructor(
    @Inject('HttpClientService') private httpClient: HttpClientService,
    private operationsService: OperationService,
    private store: Store<any>
  ) {}

  async create(cmd: ICreateTenantFieldDto): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL(cmd.tenantId)}/create`, cmd);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

    return operation;
  }

  async update(cmd: IUpdateTenantFieldDto): Promise<Operation> {
    let operation = await this.httpClient.put<Operation>(`${this.BASE_URL(cmd.tenantId)}/update`, cmd);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    operation.targetId = cmd.targetId;
    return operation;
  }

  async getById(tenantId: string, id: string): Promise<IFieldBaseDto> {
    return await this.httpClient.get<IFieldBaseDto>(`${this.BASE_URL(tenantId)}/${id}`);
  }

  async deleteById(id: string, tenantId: string): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL(tenantId)}/delete/${id}`, <DeleteTenantFieldByPublicIdCommand>{
      publicId: id,
      tenantId
    });
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

    return operation;
  }

  async deleteFieldAndItsSettings(id: string, tenant: string): Promise<Operation> {
    let operation = await this.httpClient.delete<Operation>(`${this.BASE_URL(tenant)}/delete/${id}`);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

    return operation;
  }

  async getFieldsByAreaType(
    tenantId: string,
    areaType: AreaTypeEnum,
    paging?: Paging,
    sorting?: Sorting[]
  ): Promise<PagedData<IFieldBaseDto>> {
    const result = await this.httpClient.post<PagedData<IFieldBaseDto>>(`${this.BASE_URL(tenantId)}/byAreaType`, <GetTenantFields2Query>{
      areaType: areaType,
      tenantId: tenantId,
      paging: paging
    });
    return result;
  }

  async search(tenantId: string, paging?: Paging, sorting?: Sorting[], filters?: IFilter[]): Promise<PagedData<IFieldBaseDto>> {
    const result = await this.httpClient.post<PagedData<IFieldBaseDto>>(
      `${this.BASE_URL(tenantId)}/search`,
      this.httpClient.buildSearchParams(paging, sorting, filters)
    );

    return result;
  }

  async bulkUpdate(tenantId: string, fields: IUpdateTenantFieldDto[]): Promise<Operation> {
    let operation = await this.httpClient.put<Operation>(`${this.BASE_URL(tenantId)}/bulk-update`, { fields });
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return operation;
  }

  async getFieldsTypes(tenantId: string): Promise<ITenantFieldsTypesDto[]> {
    const result = await this.httpClient.get<ITenantFieldsTypesDto[]>(`${this.BASE_URL(tenantId)}/types`);
    return result;
  }

  search$(tenantId: string, paging?: Paging, sorting?: Sorting[], filters?: IFilter[]): Observable<PagedData<IFieldBaseDto>> {
    return of(true).pipe(
      switchMap(() => {
        const url = `${this.BASE_URL(tenantId)}/search`;
        const queryParams = { paging } as any;
        if (sorting) {
          queryParams.sorting = { sorting };
        }
        if (filters) {
          queryParams.filters = { filters };
        }
        return from(this.httpClient.post<PagedData<IFieldBaseDto>>(url, queryParams));
      })
    );
  }
  searchByAreaType$(
    areaType: AreaTypeEnum,
    tenantId: string,
    paging?: Paging,
    sorting?: Sorting[],
    filters?: IFilter[]
  ): Observable<PagedData<IFieldBaseDto>> {
    const tenant$ = tenantId ? of(tenantId) : this.getCurrentTenantId$();
    return tenant$.pipe(
      switchMap((tenantId) => {
        const url = `${this.BASE_URL(tenantId)}/search`;
        const queryParams: IAreaSearchRequest = { paging, areaType, tenantId };
        if (sorting) {
          queryParams.sorting = { sorting };
        }
        if (filters) {
          queryParams.filters = { filters };
        }
        return from(this.httpClient.post<PagedData<IFieldBaseDto>>(url, queryParams));
      })
    );
  }

  getAll$(tenantId: string): Observable<PagedData<IFieldBaseDto>> {
    // filter out the  tenant fields related to schema types (embedded,listOfLinks)
    // we do not need them in the list of tenant fields
    const filter: IFilter[] = [
      {
        fieldName: 'type',
        searchType: SearchType.NotEqualTo,
        valueType: FieldTypeIds.IntField,
        value: FieldTypeIds.EmbededField
      },
      {
        fieldName: 'type',
        searchType: SearchType.NotEqualTo,
        valueType: FieldTypeIds.IntField,
        value: FieldTypeIds.ListOfLinksField
      },
      {
        fieldName: 'isCustom',
        searchType: SearchType.NotEqualTo,
        valueType: FieldTypeIds.BoolField,
        value: true
      }
    ];
    const paging: Paging = {
      skip: 0,
      take: 999
    };

    return this.search$(tenantId, paging, null, filter);
  }

  delete$(fieldId: string, tenantId: string): Observable<Operation> {
    return of(true).pipe(switchMap(() => from(this.deleteById(fieldId, tenantId))));
  }

  update$(entity: IFieldBaseDto): Observable<Operation> {
    const dto: IUpdateTenantFieldDto = {
      newField: entity,
      targetId: entity.id,
      tenantId: entity.tenantId
    };
    return of(true).pipe(switchMap(() => from(this.update(dto))));
  }
  get$(tenantId: string, entityId: string): Observable<IFieldBaseDto> {
    return of(true).pipe(switchMap(() => from(this.getById(tenantId, entityId))));
  }

  create$(entity: IFieldBaseDto): Observable<Operation> {
    return this.getCurrentTenantId$().pipe(
      switchMap((tenantId) => {
        const dto: ICreateTenantFieldDto = {
          ...entity,
          tenantId
        };
        return from(this.create(dto));
      })
    );
  }

  private getCurrentTenantId$(): Observable<string> {
    return this.store.select(currentTenantSelector).pipe(
      filter((x) => !!x),
      take(1)
    );
  }
}
