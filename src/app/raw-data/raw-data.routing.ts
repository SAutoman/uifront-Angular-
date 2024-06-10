/**
 * global
 */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/**
 * project
 */
import { RawDataGridComponent } from './raw-data-grid/raw-data-grid.component';
import { RawDataMenuGuard } from './raw-data-menu.guard';

/**
 * local
 */

export const dataMainRoute = 'data';
export const dataViewRoute = 'list';
export const dataListRoute = 'data/list';

export const RawDataRoutes: Routes = [
  {
    path: `${dataViewRoute}/:rawDataSchemaId`,
    component: RawDataGridComponent,
    canActivate: [RawDataMenuGuard]
  },
  {
    path: dataViewRoute,
    component: RawDataGridComponent,
    canActivate: [RawDataMenuGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(RawDataRoutes)],
  exports: [RouterModule]
})
/**
 * @deprecated
 */
export class RawDataRoutingModule {}
