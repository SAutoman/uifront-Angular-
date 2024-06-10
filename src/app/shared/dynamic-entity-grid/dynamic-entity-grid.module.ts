import { DynamicEntityCreatorComponent } from '@wfm/dynamic-entities/dynamic-entity-creator/dynamic-entity-creator.component';
import { SharedModule } from '@wfm/shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridModule } from '@progress/kendo-angular-grid';
import { MaterialModule } from '@wfm/material-module';
import { FormBuilderComponentsModule } from '@wfm/common/form-builder-components';
import { MatDialogRef } from '@angular/material/dialog';
import { DynamicEntityGridComponent } from './dynamic-entity-grid.component';
import { DynamicEntitySearchMaskModule } from '../dynamic-entity-search-mask/dynamic-entity-search-mask.module';
import { CaseCreatorWrapperComponent } from '@wfm/dynamic-entities/case-creator-wrapper/case-creator-wrapper.component';
import { DynamicGridRawDataRefComponent } from './dynamic-grid-raw-data-ref/dynamic-grid-raw-data-ref.component';
import { CasePrintPreviewModule } from '@wfm/workflow-state/case-print-preview/case-print-preview.module';
import { FailedRulesComponent } from './failed-rules/failed-rules.component';

export const dialogFunc = {
  close: () => {
    close();
  }
};

@NgModule({
  declarations: [
    DynamicEntityGridComponent,
    DynamicEntityCreatorComponent,
    CaseCreatorWrapperComponent,
    DynamicGridRawDataRefComponent,
    FailedRulesComponent
  ],
  imports: [
    CommonModule,
    GridModule,
    MaterialModule,
    SharedModule,
    FormBuilderComponentsModule,
    DynamicEntitySearchMaskModule,
    CasePrintPreviewModule
  ],
  exports: [DynamicEntityGridComponent, DynamicEntityCreatorComponent, FormBuilderComponentsModule],
  providers: [
    {
      provide: MatDialogRef,
      useValue: dialogFunc
    }
  ]
})
export class DynamicEntityGridModule {}
