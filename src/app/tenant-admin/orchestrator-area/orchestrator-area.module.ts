import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { SharedModule } from '@wfm/shared/shared.module';
import { ConnectorItemComponent } from './connectors/connector-item/connector-item.component';
import { ConnectorsListComponent } from './connectors/connectors-list/connectors-list.component';
import { OrchestratorActionEventComponent } from './orchestrators/orchestrator-item/orchestrator-action-item/orchestrator-action-event/orchestrator-action-event.component';
import { OrchestratorActionHandlerComponent } from './orchestrators/orchestrator-item/orchestrator-action-item/orchestrator-action-handler/orchestrator-action-handler.component';
import { OrchestratorActionItemComponent } from './orchestrators/orchestrator-item/orchestrator-action-item/orchestrator-action-item.component';
import { OrchestratorItemComponent } from './orchestrators/orchestrator-item/orchestrator-item.component';
import { OrchestratorsListComponent } from './orchestrators/orchestrators-list/orchestrators-list.component';
import { OrchestratorFieldsBuilderComponent } from './orchestrators/orchestrator-item/orchestrator-action-item/orchestrator-action-handler/orchestrator-fields-builder/orchestrator-fields-builder.component';
import { ProcessStepManipulationHandlerComponent } from './orchestrators/orchestrator-item/orchestrator-action-item/orchestrator-action-handler/process-step-manipulation-handler/process-step-manipulation-handler.component';
import { CaseManipulationHandlerComponent } from './orchestrators/orchestrator-item/orchestrator-action-item/orchestrator-action-handler/case-manipulation-handler/case-manipulation-handler.component';
import { FieldPathGeneratorModule } from '@wfm/shared/actions/field-path-generator/field-path-generator.module';
import { RulesBuilderModule } from '../workflows/rules-builder/rules-builder.module';

const routes: Route[] = [
  { path: 'connectors', component: ConnectorsListComponent },
  { path: 'list', component: OrchestratorsListComponent },
  { path: 'create', component: OrchestratorItemComponent },
  { path: 'edit/:id', component: OrchestratorItemComponent },
  { path: '', redirectTo: 'list', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    ConnectorsListComponent,
    ConnectorItemComponent,
    OrchestratorsListComponent,
    OrchestratorItemComponent,
    OrchestratorActionItemComponent,
    OrchestratorActionEventComponent,
    OrchestratorActionHandlerComponent,
    OrchestratorFieldsBuilderComponent,
    ProcessStepManipulationHandlerComponent,
    CaseManipulationHandlerComponent
  ],
  imports: [SharedModule, RouterModule.forChild(routes), FieldPathGeneratorModule, RulesBuilderModule]
})
export class OrchestratorAreaModule {}
