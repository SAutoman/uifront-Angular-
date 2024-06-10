/**
 * global
 */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/**
 * local
 */
import { ReportDatasourceComponent } from './report-datasource/report-datasource.component';
import { DatasourceBuilderComponent } from './datasource-builder/datasource-builder.component';

export const reportsMainRoute = 'reports';
export const reportsListRoute = 'list';
export const reportsCreateRoute = 'create';

export const ReportsRoutes: Routes = [
  {
    path: `${reportsCreateRoute}`,
    component: DatasourceBuilderComponent,
    canActivate: []
  },
  {
    path: `:reportId`,
    component: ReportDatasourceComponent,
    canActivate: []
  }
];

@NgModule({
  imports: [RouterModule.forChild(ReportsRoutes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule {}
