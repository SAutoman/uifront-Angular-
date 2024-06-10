import { IConfigurableListItem, IFieldConfiguration } from '@wfm/common/models';

import { BehaviorSubject } from 'rxjs';
import { cloneDeep } from 'lodash-core';
import { TenantListsState } from '@wfm/store/tenant-lists';

export class TenantListsStateWrapper {
  loading: boolean;
  silent: boolean;
  error?: any;
  workItems$ = new BehaviorSubject<IConfigurableListItem<IFieldConfiguration>[]>([]);
  private items: IConfigurableListItem<IFieldConfiguration>[];

  constructor(state: TenantListsState) {
    this.loading = state.loading;
    this.silent = state.silent;
    this.error = state.error;
    this.items = this.initItems(state?.page?.items || []);
  }

  filter(searchTerm?: any): void {
    if (!searchTerm) {
      this.workItems$.next(this.items);
    } else {
      const value = ((searchTerm as string) || '').toString().toLowerCase();
      const filteredItems = this.items.filter((x) => (x.name || '').toLowerCase().indexOf(value) > -1);

      this.workItems$.next(filteredItems);
    }
  }

  get allFields(): IConfigurableListItem<IFieldConfiguration>[] {
    return this.items;
  }

  private initItems(items: IConfigurableListItem<IFieldConfiguration>[]): IConfigurableListItem<IFieldConfiguration>[] {
    return items.map((x) => {
      const item: IConfigurableListItem<IFieldConfiguration> = cloneDeep(x);
      item.isChanged = false;
      return item;
    });
  }
}
