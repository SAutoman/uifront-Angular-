/**
 * global
 */
import { Route, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

/**
 * project
 */

/**
 * local
 */
import { PageFormBuilderComponent } from './page-form-builder/page-form-builder.component';
import { FormsFlowStructComponent } from './forms-flow-struct/forms-flow-struct.component';
import { PageFormBuilderUnsavedDataGuard } from './page-form-builder/page-form-builder-unsaved-data.guard';
import { SchemasListComponent } from './schemas-list/schemas-list.component';

const routes: Route[] = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  {
    path: 'map',
    pathMatch: 'full',
    component: FormsFlowStructComponent
  },
  {
    path: 'build',
    component: PageFormBuilderComponent,
    canDeactivate: [PageFormBuilderUnsavedDataGuard]
  },
  { path: 'list', component: SchemasListComponent },
  {
    path: 'edit/:id',
    component: PageFormBuilderComponent,
    canDeactivate: [PageFormBuilderUnsavedDataGuard]
  }
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class FormsFlowStructRoutingModule {}
