/**
 * global
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridModule } from '@progress/kendo-angular-grid';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { ResizableModule } from 'angular-resizable-element';
/**
 * project
 */
import { MaterialModule } from '@wfm/material-module';
import { SharedModule } from '@wfm/shared/shared.module';
import { FormBuilderComponentsModule } from '@wfm/common/form-builder-components';
import { DynamicEntitySearchMaskModule } from '@wfm/shared/dynamic-entity-search-mask/dynamic-entity-search-mask.module';
/**
 * local
 */
import { WorkflowStatesRoutingModule } from './workflow-state.routing.module';
import { WorkflowStateStepSearchComponent } from './workflow-state-step-search/workflow-state-step-search.component';
import { WorkflowStateStatusComponent } from './workflow-state-status/workflow-state-status.component';
import { WorkflowStateCaseStepComponent } from './workflow-state-case-step/workflow-state-case-step.component';
import { WorkflowStatesListComponent } from './workflow-states-list/workflow-states-list.component';
import { WorkflowStatesKanbanComponent } from './workflow-states-kanban/workflow-states-kanban.component';
import { WorkflowStateRenameComponent } from './workflow-state-rename/workflow-state-rename.component';
import { SelectResolutionComponent } from './workflow-state-case-step/select-resolution/select-resolution.component';
import { ConfirmActionComponent } from './confirm-action/confirm-action.component';
import { WorkflowStateRawDataComponent } from './workflow-state-raw-data/workflow-state-raw-data.component';
import { WorkflowStatesGridComponent } from './workflow-states-grid/workflow-states-grid.component';
import { WorkflowStateCaseComponent } from './workflow-state-case/workflow-state-case.component';
import { WorkflowStateCaseActivityComponent } from './workflow-state-case-activity/workflow-state-case-activity/workflow-state-case-activity.component';
import { WorkflowStateCaseActivityHistoryComponent } from './workflow-state-case-activity/workflow-state-case-activity-history/workflow-state-case-activity-history.component';
import { DynamicEntityGridModule } from '@wfm/shared/dynamic-entity-grid/dynamic-entity-grid.module';
import { WorkflowStateComponent } from './workflow-state.component';
import { RepeatableStepTitleComponent } from './workflow-state-case-step/repeatable-step-title/repeatable-step-title.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { WorkflowStateCaseEditComponent } from './workflow-state-case-edit/workflow-state-case-edit.component';
import { WorkflowStatesVisualPlanModule } from './workflow-states-visual-plan-view/workflow-states-visual-plan.module';
import { CasePrintPreviewModule } from './case-print-preview/case-print-preview.module';

@NgModule({
  imports: [
    CommonModule,
    WorkflowStatesRoutingModule,
    SharedModule,
    MaterialModule,
    DragDropModule,
    GridModule,
    Ng2SearchPipeModule,
    NgxMaterialTimepickerModule,
    ResizableModule,
    DynamicEntityGridModule,
    FormBuilderComponentsModule,
    DynamicEntitySearchMaskModule,
    WorkflowStatesVisualPlanModule,
    CasePrintPreviewModule
  ],
  declarations: [
    WorkflowStateStepSearchComponent,
    WorkflowStateCaseStepComponent,
    WorkflowStateStatusComponent,
    WorkflowStatesListComponent,
    WorkflowStatesKanbanComponent,
    WorkflowStateRenameComponent,
    SelectResolutionComponent,
    ConfirmActionComponent,
    WorkflowStateRawDataComponent,
    WorkflowStatesGridComponent,
    WorkflowStateCaseComponent,
    WorkflowStateCaseActivityComponent,
    WorkflowStateCaseActivityHistoryComponent,
    WorkflowStateComponent,
    RepeatableStepTitleComponent,
    WorkflowStateCaseEditComponent
  ],
  // entryComponents: [SelectResolutionComponent, ConfirmActionComponent],
  providers: [
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} }
  ]
})
export class WorkflowStateModule {}
