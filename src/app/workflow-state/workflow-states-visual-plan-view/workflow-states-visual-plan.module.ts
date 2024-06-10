/**
 * global
 */
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MissingTranslationHandler, TranslateModule } from '@ngx-translate/core';

/**
 * project
 */
import { MaterialModule } from '@wfm/material-module';
import { FilterFieldsService } from '@wfm/shared/dynamic-entity-field/filter-fields.service';
import { DynamicEntitySearchMaskModule } from '@wfm/shared/dynamic-entity-search-mask/dynamic-entity-search-mask.module';
import { IconModule } from '@wfm/shared/icon/icon.module';
import { SharedModule } from '@wfm/shared/shared.module';
import { MissingTranslationHandlerService } from '@wfm/translate/missingtranslationhandler.service';
import { MissingTranslationSaverService } from '@wfm/translate/missingtranslationsaver.service';

/**
 * local
 */
import { PlanEditorCanvasComponent } from './plan-editor/plan-editor-canvas/plan-editor-canvas.component';
import { PlanUnitDataBindingComponent } from './plan-editor/plan-unit-data-binding/plan-unit-data-binding.component';
import { PlanUnitPropertiesComponent } from './plan-editor/plan-unit-properties/plan-unit-properties.component';
import { PlanViewerComponent } from './plan-viewer/plan-viewer.component';
import { CanvasHelperService } from './services/canvas.helper.service';
import { WorkflowStatesVisualPlanViewComponent } from './workflow-states-visual-plan-view.component';
import { ConnectorFieldOptionLabelSettingsModule } from '@wfm/common/field/connector-field-editor/connector-field-option-label-settings/connector-field-option-label-settings.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    DragDropModule,
    ReactiveFormsModule,
    FormsModule,
    DynamicEntitySearchMaskModule,
    IconModule,
    ConnectorFieldOptionLabelSettingsModule,
    TranslateModule.forChild({
      extend: true,
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useExisting: MissingTranslationHandlerService,
        deps: [MissingTranslationSaverService]
      }
    })
  ],
  declarations: [
    WorkflowStatesVisualPlanViewComponent,
    PlanEditorCanvasComponent,
    PlanUnitDataBindingComponent,
    PlanViewerComponent,
    PlanUnitPropertiesComponent
  ],
  providers: [
    CanvasHelperService,
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} },
    FilterFieldsService
  ],
  exports: [WorkflowStatesVisualPlanViewComponent]
})
export class WorkflowStatesVisualPlanModule {}
