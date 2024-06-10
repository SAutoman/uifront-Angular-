/**
 * global
 */
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

/**
 * project
 */
import { MappingsComponent } from './mappings/mappings.component';
import { MappingEditorComponent } from './mapping-editor/mapping-editor.component';
import { MappingsUnsavedDataGuard } from './mappings-unsaved-data-guard';
import { MappingSettingsComponent } from './mapping-settings/mapping-settings.component';
import { MappingSettingBaseComponent } from './mapping-setting-base/mapping-setting-base.component';

/**
 * local
 */

export const mappingsMainRoute = 'mappings';
export const caseMappingRoute = 'cases';
export const rawDataMappingRoute = 'rawData';
export const mappingSettings = 'settings';

export const suppliersMainRoute = 'suppliers';
export const suppliersGridRoute = 'grid';
export const editSupplier = 'edit/:id';
export const createSupplier = 'create';

export const auditorsMainRoute = 'auditors';
export const auditorsGridRoute = 'grid';
export const editAuditor = 'edit/:id';
export const createAuditor = 'create';

export const MappingsRoutes: Routes = [
  {
    path: `${rawDataMappingRoute}`,
    children: [
      {
        path: `${suppliersMainRoute}`,
        component: MappingsComponent
      },
      {
        path: `${suppliersMainRoute}/${editSupplier}`,
        component: MappingEditorComponent,
        canDeactivate: [MappingsUnsavedDataGuard]
      },
      {
        path: `${suppliersMainRoute}/${createSupplier}`,
        component: MappingEditorComponent,
        canDeactivate: [MappingsUnsavedDataGuard]
      },
      {
        path: `${auditorsMainRoute}`,
        component: MappingsComponent
      },
      {
        path: `${auditorsMainRoute}/${editAuditor}`,
        component: MappingEditorComponent,
        canDeactivate: [MappingsUnsavedDataGuard]
      },
      {
        path: `${auditorsMainRoute}/${createAuditor}`,
        component: MappingEditorComponent,
        canDeactivate: [MappingsUnsavedDataGuard]
      },
      {
        path: mappingSettings,
        component: MappingSettingBaseComponent,
        canDeactivate: [MappingsUnsavedDataGuard]
      }
    ]
  },
  {
    path: `${caseMappingRoute}`,
    children: [
      {
        path: `${suppliersMainRoute}`,
        component: MappingsComponent
      },
      {
        path: `${suppliersMainRoute}/${editSupplier}`,
        component: MappingEditorComponent,
        canDeactivate: [MappingsUnsavedDataGuard]
      },
      {
        path: `${suppliersMainRoute}/${createSupplier}`,
        component: MappingEditorComponent,
        canDeactivate: [MappingsUnsavedDataGuard]
      },
      {
        path: `${auditorsMainRoute}`,
        component: MappingsComponent
      },
      {
        path: `${auditorsMainRoute}/${editAuditor}`,
        component: MappingEditorComponent,
        canDeactivate: [MappingsUnsavedDataGuard]
      },
      {
        path: `${auditorsMainRoute}/${createAuditor}`,
        component: MappingEditorComponent,
        canDeactivate: [MappingsUnsavedDataGuard]
      },
      {
        path: mappingSettings,
        component: MappingSettingBaseComponent,
        canDeactivate: [MappingsUnsavedDataGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(MappingsRoutes)],
  exports: [RouterModule]
})
export class MappingsRoutingModule {}
