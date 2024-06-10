/**
 * global
 */
import { Inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { cloneDeep, sortBy } from 'lodash-core';

/**
 * project
 */
import { APP_CLIENT_ID, FieldTypeIds, ListDto, ListItemDto, ListsService, PagedData } from '@wfm/service-layer';
import { IConfigurableListItem, KeyValueView } from '@wfm/common/models';

/**
 * local
 */

import {
  TenantListsActionTypes,
  GetTenantLists,
  TenantListsError,
  GetTenantListsSuccess,
  AddOrUpdateTenantList,
  AddOrUpdateTenantListSuccess,
  RemoveTenantList
} from './tenant-lists.actions';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';

@Injectable()
export class TenantListsEffects {
  constructor(
    private actions$: Actions,
    private listsService: ListsService,
    @Inject(APP_CLIENT_ID) readonly appId: string,
    private store: Store<any>,
    private errorHandlerService: ErrorHandlerService
  ) {}

  getLists: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetTenantLists>(TenantListsActionTypes.GetTenantLists),
      switchMap((action) => this.listsService.getLists$(action.payload.paging, action.payload.sorting, action.payload.filters)),
      switchMap((response: PagedData<ListDto>) => {
        const total = response.total;
        const lists = !!response?.items?.length ? response.items : [];
        const listMap = new Map<string, IConfigurableListItem>();
        lists.forEach((x, idx) => {
          const listItem: IConfigurableListItem = {
            id: x.id,
            name: x.name,
            viewName: x.name,
            type: FieldTypeIds.ListField,
            configuration: {
              listId: x.id,
              parentListId: x.parentListId,
              position: idx,
              labelProp: 'viewValue',
              listItemKeyEnabled: x.listItemKeyEnabled
            }
          };

          listMap.set(x.id, listItem);
        });

        const listIds = [...listMap.keys()];
        return this.listsService.getListsOptions$(listIds).pipe(
          map((allOptionKeyValues) => {
            const lists = allOptionKeyValues
              .filter((x) => listMap.has(x.key))
              .map((keyValue) => {
                const listUi = listMap.get(keyValue.key);
                const options = keyValue.value || [];
                const uiOptions = options.map((x) => new KeyValueView(x.id, x, x.item));
                listUi.configuration.options = uiOptions;
                return listUi;
              });
            return new GetTenantListsSuccess({
              total,
              items: sortBy(lists, [(x) => x.configuration.position])
            });
          })
        );
      }),
      catchError((error) => of(new TenantListsError({ error: this.errorHandlerService.getAndShowErrorMsg(error) })))
    )
  );

  addOrUpdate: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<AddOrUpdateTenantList>(TenantListsActionTypes.AddOrUpdateTenantList),
      switchMap((action) => {
        const item = cloneDeep(action.payload.item);
        const listDto: ListDto = {
          id: item.id,
          name: item.name,
          parentListId: item.configuration?.parentListId,
          inUse: true,
          tenantPublicId: undefined,
          listItemKeyEnabled: item.configuration?.listItemKeyEnabled || false
        };
        // result options from ui
        const options = item.configuration.options.map((x) => x.value) as ListItemDto[];
        // update
        if (!item.isClientId) {
          // update definition of list

          const updateList$ = this.listsService.updateList$(listDto);

          const currentOptions$ = this.listsService.getListOptions$(item.id);

          const crudOperations$ = currentOptions$.pipe(
            switchMap((dbOptions) => {
              const removedOptionMap = new Map<string, ListItemDto>();

              const updatedOptions: ListItemDto[] = [];
              const createdOptions: ListItemDto[] = [];
              const removeIds: string[] = [];

              const updateOptionMap = new Map<string, ListItemDto>();
              const dbOptionMap = new Map<string, ListItemDto>();
              dbOptions.forEach((x) => dbOptionMap.set(x.id, x));

              options.forEach((x) => {
                if (!x.id) {
                  createdOptions.push(x);
                } else {
                  updatedOptions.push(x);
                }
              });

              updatedOptions.forEach((x) => {
                updateOptionMap.set(x.id, x);
              });
              dbOptionMap.forEach((x) => {
                if (!updateOptionMap.has(x.id)) {
                  removedOptionMap.set(x.id, x);
                }
              });

              [...removedOptionMap.values()].forEach((x) => {
                removeIds.push(x.id);
              });

              let removeOptions$ = of(true);
              let updateOptions$ = of(true);
              let createOptions$ = of(true);

              if (updatedOptions.length) {
                updateOptions$ = this.listsService.editListItems$(updatedOptions);
              }
              if (createdOptions.length) {
                createOptions$ = this.listsService.addListItems$(item.id, createdOptions);
              }
              if (removeIds.length) {
                removeOptions$ = this.listsService.deleteListItems$(item.id, removeIds);
              }

              return forkJoin([removeOptions$, createOptions$, updateOptions$]);
            })
          );

          return forkJoin([updateList$, crudOperations$]).pipe(
            map(() => {
              return new AddOrUpdateTenantListSuccess({
                item: cloneDeep(item),
                isUpdate: true
              });
            })
          );
        } else {
          return this.listsService.createList$(listDto, options).pipe(
            map((newListId) => {
              item.id = newListId;
              return new AddOrUpdateTenantListSuccess({
                item: cloneDeep(item),
                isUpdate: false
              });
            })
          );
        }
      }),
      catchError((error) => of(new TenantListsError({ error: this.errorHandlerService.getAndShowErrorMsg(error) })))
    )
  );

  addOrUpdateTenantListSuccess = createEffect(() =>
    this.actions$.pipe(
      ofType<AddOrUpdateTenantListSuccess>(TenantListsActionTypes.AddOrUpdateTenantListSuccess),
      switchMap(async (action) => {
        try {
          return new GetTenantLists();
        } catch (error) {
          return new TenantListsError({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  removeList: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<RemoveTenantList>(TenantListsActionTypes.RemoveTenantList),
      switchMap(async (action) => {
        try {
          const operation = await this.listsService.deleteList$(action.payload.id).toPromise();
          if (operation.status.toString() === 'Success') {
            return new GetTenantLists();
          }
        } catch (error) {
          return new TenantListsError({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );
}
