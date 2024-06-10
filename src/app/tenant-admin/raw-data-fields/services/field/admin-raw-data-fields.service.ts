/**
 * global
 */
import { Injectable } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { IConfigurableListItem } from '@wfm/common/models';

import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

/**
 * project
 */
import { PagedData, Paging } from '@wfm/service-layer';
import { GetTenantFields, GetTenantFieldsSuccess, TenantFieldsActionTypes } from '@wfm/store/tenant-fields';

/**
 * local
 */

@Injectable()
export class AdminRawDataFieldsService {
  constructor(private store: Store<any>, private actions$: Actions) {}

  /**
   *
   * @param tenantId null
   * @param paging  null
   */
  getList(tenantId?: string, paging?: Paging): Observable<PagedData<IConfigurableListItem>> {
    this.store.dispatch(new GetTenantFields({ tenantId }));
    return this.actions$.pipe(
      ofType<GetTenantFieldsSuccess>(TenantFieldsActionTypes.GetTenantFieldsSuccess),
      take(1),
      map((x) => x.payload?.items || []),
      map((items) => items.filter((x) => !!x?.useInObj?.rawData)),
      map((items) => {
        return {
          total: items.length,
          items
        };
      })
    );
  }
}
