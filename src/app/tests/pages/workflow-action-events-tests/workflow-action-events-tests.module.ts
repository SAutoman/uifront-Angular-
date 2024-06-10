/**
 * global
 */
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

/**
 * project
 */
import { TestUiModule } from '@wfm/tests/modules/test-ui/test-ui.module';

import { ServiceLayerModule } from '@wfm/service-layer/service-layer.module';

/**
 * local
 */
import { WorkflowActionEventsTestsComponent } from './workflow-action-events-tests.component';
import {
  RawDataToCaseTestService,
  ResetStepToCaseTestSerivce,
  StepToCaseTestService,
  ChangeStatusWhenStepAddedTestService,
  StepToRawDataTestService,
  StepToRawDataAndCaseTestService,
  MultipleStepsTestService,
  UpdateRawDataBasedOnCaseTestService,
  CaseFieldsPersistOnCaseStatusUpdate2TestService,
  CaseFieldsPersistOnCaseStatusUpdateTestService,
  UpdateCaseStatusBasedOnStepResolutionTestService,
  DifferenceInWeighting2TestService,
  MathOperationActionTestTestService,
  DifferenceInWeightingTestService,
  AutoAddStepsTestService,
  EmbeddedFieldMathOperationActionTestTestService
} from './workflow-action-events-tests.service';

@NgModule({
  declarations: [WorkflowActionEventsTestsComponent],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: WorkflowActionEventsTestsComponent,
        pathMatch: 'full'
      }
    ]),
    ServiceLayerModule,
    TestUiModule
  ],
  providers: [
    RawDataToCaseTestService,
    ResetStepToCaseTestSerivce,
    StepToCaseTestService,
    ChangeStatusWhenStepAddedTestService,
    StepToRawDataTestService,
    StepToRawDataAndCaseTestService,
    MultipleStepsTestService,
    UpdateRawDataBasedOnCaseTestService,
    CaseFieldsPersistOnCaseStatusUpdate2TestService,
    CaseFieldsPersistOnCaseStatusUpdateTestService,
    UpdateCaseStatusBasedOnStepResolutionTestService,
    DifferenceInWeighting2TestService,
    MathOperationActionTestTestService,
    DifferenceInWeightingTestService,
    AutoAddStepsTestService,
    EmbeddedFieldMathOperationActionTestTestService
  ],
  exports: [RouterModule, WorkflowActionEventsTestsComponent]
})
export class WorkflowActionTestsModule {}
