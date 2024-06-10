/**
 * global
 */
import { Injectable, Inject } from '@angular/core';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { forkJoin, from, Observable, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { KeyValue } from '@angular/common';

/**
 * project
 */
import { CreateListDto, ListDto, ListItemDto, PagedData, Paging, Sorting, Operation, ListOptionDto } from '@wfm/service-layer/models';
import { SearchFieldModel } from '@wfm/service-layer/models/dynamic-entity-models';
import { currentTenantSelector } from '@wfm/store/auth/auth.selectors';

/**
 * local
 */
import { HttpClientService } from './application-http-client.service';
import { OperationService } from './operation.service';
import { ListFullData, ListsCacheService } from './lists-cache.service';

interface IOptionRequestDto {
  tenant: string;
  listIds: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ListsService {
  BASE_URL = (tenantId) => `tenant/${tenantId}/lists`;

  constructor(
    @Inject('HttpClientService') private httpClient: HttpClientService,
    private operationsService: OperationService,
    private store: Store<any>,
    private listsCacheService: ListsCacheService
  ) {}

  search(tenantId: string, paging?: Paging, sorting?: Sorting[], filters?: SearchFieldModel[]): Promise<PagedData<ListDto>> {
    return this.httpClient.post<PagedData<ListDto>>(
      `${this.BASE_URL(tenantId)}/search-list`,
      this.httpClient.buildSearchParams(paging, sorting, filters)
    );
  }

  /**
   * @deprecated Incorrect return value, use getListsOptions$ instance of it
   * @param tenantId
   * @param listIds
   */
  getOptions(tenantId: string): Promise<ListOptionDto[]> {
    const url = `${this.BASE_URL(tenantId)}/options`;

    const dto: IOptionRequestDto = {
      tenant: tenantId,
      listIds: []
    };
    return this.httpClient.post<ListOptionDto[]>(url, dto);
  }

  getLists(tenantId: string, paging?: Paging, sorting?: Sorting[], filters?: SearchFieldModel[]): Promise<PagedData<ListDto>> {
    // tslint:disable-next-line: max-line-length
    return this.httpClient.post<PagedData<ListDto>>(
      `${this.BASE_URL(tenantId)}/with-parent-data`,
      this.httpClient.buildSearchParams(paging, sorting, filters)
    );
  }

  getLists$(paging?: Paging, sorting?: Sorting[], filters?: SearchFieldModel[]): Observable<PagedData<ListDto>> {
    return this.getCurrentTenantId$().pipe(switchMap((tenantId) => from(this.getLists(tenantId, paging, sorting, filters))));
  }

  //the payload is wrong, it should be CreateListDTO as per Swagger, needs to be fixed here and wherever this endpoint is used

  async createList(tenantId: string, data: ListDto): Promise<ListDto> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL(tenantId)}/create-list`, data);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

    return this.getListById(tenantId, operation.targetId);
  }

  async createListWithItems(tenantId: string, data: CreateListDto): Promise<ListDto> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL(tenantId)}/create-list`, data);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    return this.getListById(tenantId, operation.targetId);
  }

  /**
   *
   * @param data
   * @param children
   * @returns created listId
   */
  createList$(data: ListDto, children: ListItemDto[]): Observable<string> {
    return this.getCurrentTenantId$().pipe(
      switchMap((tenantId) => {
        const url = `${this.BASE_URL(tenantId)}/create-list`;
        const dto: CreateListDto = {
          name: data.name,
          parentListId: data.parentListId,
          listItems: children || [],
          listItemKeyEnabled: data.listItemKeyEnabled
        };
        return from(this.httpClient.post<Operation>(url, dto));
      }),
      switchMap((operation) => this.operationsService.waitTask(operation.id)),
      map((operation) => operation.targetId)
    );
  }
  /**
   * get list, will also return the parent list id if any
   */

  getListById(tenantId: string, listId: string): Promise<ListDto> {
    return this.httpClient.get<ListDto>(`${this.BASE_URL(tenantId)}/by-id/${listId}`);
  }

  async updateList(tenantId: string, listId: string, data: ListDto): Promise<ListDto> {
    let operation = await this.httpClient.put<Operation>(`${this.BASE_URL(tenantId)}/by-id/${listId}`, data);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

    return this.getListById(tenantId, operation.targetId);
  }

  updateList$(listDto: ListDto): Observable<ListDto> {
    return this.getCurrentTenantId$().pipe(
      switchMap((tenantId) => {
        return from(this.updateList(tenantId, listDto.id, listDto));
      })
    );
  }

  async deleteList(tenantId: string, id: string): Promise<Operation> {
    let operation = await this.httpClient.delete<Operation>(`${this.BASE_URL(tenantId)}/by-id/${id}`);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

    return operation;
  }

  deleteList$(listId: string): Observable<Operation> {
    return this.getCurrentTenantId$().pipe(switchMap((tenantId) => from(this.deleteList(tenantId, listId))));
  }

  /**
   * get list items of specific list
   *  if parentListItemId is provided we will get only that parentListItem's child items
   */

  getListItems(tenantId: string, listId: string, parentListItemId?: string): Promise<PagedData<ListItemDto>> {
    let url = `${this.BASE_URL(tenantId)}/${listId}/items`;
    if (parentListItemId) {
      url += `?parentListItemId=${parentListItemId}`;
    }
    return this.httpClient.get<PagedData<ListItemDto>>(url);
  }

  /**
   *
   * @param listIds if none or empty - return all,
   * TODO Fix listIds when BE stop throw error if value present
   */
  getListsOptions$(listIds: string[]): Observable<KeyValue<string, ListItemDto[]>[]> {
    return this.store.select(currentTenantSelector).pipe(
      switchMap((tenantId) => {
        const url = `${this.BASE_URL(tenantId)}/options`;

        const dto: IOptionRequestDto = {
          tenant: tenantId,
          listIds: [] // listIds|| [] TODO Fix listIds when BE stop throw error if value present
        };

        return from(this.httpClient.post<KeyValue<string, ListItemDto[]>[]>(url, dto)).pipe(
          map((data) => {
            const inputLists = listIds || [];
            if (!inputLists.length) {
              return data;
            }
            const inputListMap = new Map<string, string>();
            inputLists.forEach((x) => inputListMap.set(x, x));
            const output: KeyValue<string, ListItemDto[]>[] = data.filter((x) => inputListMap.has(x.key));
            return output;
          })
        );
      })
    );
  }

  getListOptions$(listId: string, parentListItemId?: string, listTenantId?: string): Observable<ListItemDto[]> {
    return this.store.select(currentTenantSelector).pipe(
      take(1),
      switchMap((currentTenantId) => {
        if (!listTenantId) {
          listTenantId = currentTenantId;
        }
        const cachedListData = this.listsCacheService.listMap.get(listId);
        if (cachedListData?.value) {
          return of(cachedListData.value.items);
        }
        return from(this.getListItems(listTenantId, listId, parentListItemId)).pipe(
          map((x) => {
            return x?.items || [];
          })
        );
      })
    );
  }

  async addListItem(tenantId: string, listId: string, item: ListItemDto): Promise<ListItemDto> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL(tenantId)}/${listId}/items`, item);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    this.listsCacheService.removeFromCache(listId);

    const result = (await this.getListItems(tenantId, listId)).items.find((x) => x.id == operation.targetId);
    return result;
  }

  addListItem$(listId: string, listOption: ListItemDto): Observable<ListItemDto> {
    return this.getCurrentTenantId$().pipe(
      switchMap((tenantId) => {
        return from(this.addListItem(tenantId, listId, listOption));
      })
    );
  }

  addListItems$(listId: string, listOptions: ListItemDto[], delay = 2000): Observable<boolean> {
    return this.getCurrentTenantId$().pipe(
      switchMap((tenantId) => {
        const obs$ = listOptions.map((optionItem) => {
          const url = `${this.BASE_URL(tenantId)}/${listId}/items`;
          return from(this.httpClient.post<Operation>(url, optionItem));
        });

        return forkJoin(obs$);
      }),
      switchMap((operations) => {
        this.listsCacheService.removeFromCache(listId);

        const taskIds = operations.map((x) => x.id);
        return this.operationsService.waitMany$(taskIds, delay);
      }),
      map(() => true)
    );
  }

  async editListItem(tenantId: string, listId: string, listItemId: string, listOption: ListItemDto): Promise<ListItemDto> {
    let operation = await this.httpClient.put<Operation>(`${this.BASE_URL(tenantId)}/${listId}/items/${listItemId}`, listOption);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    this.listsCacheService.removeFromCache(listId);

    const result = (await this.getListItems(tenantId, listId)).items.find((x) => x.id == operation.targetId);
    return result;
  }

  editListItems$(listOptions: ListItemDto[]): Observable<boolean> {
    let listId: string;
    return this.getCurrentTenantId$().pipe(
      switchMap((tenantId) => {
        const obs$ = listOptions.map((optionItem) => {
          listId = optionItem.listId;
          const url = `${this.BASE_URL(tenantId)}/${listId}/items/${optionItem.id}`;
          return from(this.httpClient.put<Operation>(url, optionItem));
        });

        return forkJoin(obs$);
      }),
      switchMap((operations) => {
        this.listsCacheService.removeFromCache(listId);

        const taskIds = operations.map((x) => x.id);
        return this.operationsService.waitMany$(taskIds);
      }),
      map(() => true)
    );
  }

  async deleteListItem(tenantId: string, listId: string, listOptionId: string): Promise<Operation> {
    let operation = await this.httpClient.delete<Operation>(`${this.BASE_URL(tenantId)}/${listId}/items/${listOptionId}`);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);
    this.listsCacheService.removeFromCache(listId);

    return operation;
  }

  deleteListItems$(listId: string, listOptionIds: string[]): Observable<boolean> {
    if (!listOptionIds?.length) {
      return of(true);
    }
    return this.getCurrentTenantId$().pipe(
      switchMap((tenantId) => {
        const obs$ = listOptionIds.map((optionId) => {
          const url = `${this.BASE_URL(tenantId)}/${listId}/items/${optionId}`;
          return from(this.httpClient.delete<Operation>(url));
        });
        return forkJoin(obs$);
      }),
      switchMap((operations) => {
        this.listsCacheService.removeFromCache(listId);

        const taskIds = operations.map((x) => x.id);
        return this.operationsService.waitMany$(taskIds);
      }),
      map(() => true)
    );
  }

  async getListData(tenantId: string, listId: string): Promise<ListFullData> {
    try {
      const listData = await Promise.all([this.getListById(tenantId, listId), this.getListOptions$(listId, null, tenantId).toPromise()]);
      return <ListFullData>{
        list: listData[0],
        items: listData[1]
      };
    } catch (error) {
      return null;
    }
  }

  private getCurrentTenantId$(): Observable<string> {
    return this.store.select(currentTenantSelector).pipe(
      filter((x) => !!x),
      take(1)
    );
  }
}
