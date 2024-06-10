/**
 * global
 */
import { Observable } from 'rxjs';

/**
 * project
 */
import { PagedData, Paging } from '@wfm/service-layer';
import { TenantComponent } from '@wfm/shared/tenant.component';

/**
 * local
 */

import { IGridComponent } from './i-grid-component';
import { IViewList } from './i-view-list';

export interface IListComponent<TViewModel extends IViewList<TModel>, TModel> extends TenantComponent {
  view: TViewModel;
  registrate(elem: IGridComponent, view: TViewModel): void;
  onSaveGridSettings(view: TViewModel): void;
  onDelete(dataItem: TModel, view: TViewModel, elem: IGridComponent): void;
  loadData(view: TViewModel, paging: Paging): Observable<TViewModel>;
}
