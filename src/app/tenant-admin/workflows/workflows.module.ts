import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { WorkflowsListComponent } from './workflows-list/workflows-list.component';
import { WorkflowCreateComponent } from './workflow-create/workflow-create.component';
import { SharedModule } from '@wfm/shared/shared.module';
import { CreateTransitionComponent } from './create-transition/create-transition.component';
import { CreateProcessStepLinksComponent } from './create-process-step-links/create-process-step-links.component';
import { LinkOverrideComponent } from './create-process-step-links/link-override/link-override.component';
import { RepeatableStepSettingsComponent } from './create-process-step-links/repeatable-step-settings/repeatable-step-settings.component';
import { WorkflowFieldLinkComponent } from './workflow-field-link/workflow-field-link.component';
import { FieldLinkOverrideComponent } from './workflow-field-link/field-link-override/field-link-override.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { RawDataLinkComponent } from './rawData-link/raw-data-link.component';
import { RawDataLinkOverrideComponent } from './rawData-link/raw-data-link-override/raw-data-link-override.component';
import { AggregationValidationComponent } from './rawData-link/aggregation-validation/aggregation-validation.component';
import { AggregationExpressionItemComponent } from './rawData-link/aggregation-validation/aggregation-expression-item/aggregation-expression-item.component';
import { RulesBuilderModule } from './rules-builder/rules-builder.module';
import { AggregationSourceModule } from '@wfm/shared/actions/aggregation-action/aggregate-source/aggregation-source.module';
import { ExpressionBuilderModule } from './expression-builder/expression-builder.module';
import { FormlyModule } from '@ngx-formly/core';

const routes: Route[] = [
  { path: 'create', component: WorkflowCreateComponent },
  { path: 'update/:id', component: WorkflowCreateComponent },
  { path: 'fix/:incorrectItemId', component: WorkflowCreateComponent },
  { path: 'list', component: WorkflowsListComponent },
  { path: '', component: WorkflowsListComponent }
];

@NgModule({
  declarations: [
    WorkflowCreateComponent,
    WorkflowsListComponent,
    CreateTransitionComponent,
    CreateProcessStepLinksComponent,
    LinkOverrideComponent,
    RepeatableStepSettingsComponent,
    WorkflowFieldLinkComponent,
    FieldLinkOverrideComponent,
    RawDataLinkComponent,
    RawDataLinkOverrideComponent,
    AggregationValidationComponent,
    AggregationExpressionItemComponent
  ],
  // entryComponents: [],
  imports: [
    SharedModule,
    RouterModule.forChild(routes),
    DragDropModule,
    RulesBuilderModule,
    AggregationSourceModule,
    ExpressionBuilderModule,
    FormlyModule.forRoot({
      extras: {
        checkExpressionOn: 'changeDetectionCheck'
      }
    })
  ]
})
export class WorkflowsModule {}
