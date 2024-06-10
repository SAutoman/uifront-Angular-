/**
 * global
 */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { cloneDeep } from 'lodash-core';
/**
 * project
 */
import { WorkflowDto } from '@wfm/service-layer';
import {
  CaseToStepEventDto,
  CopyDataBetweenEntitiesEventDto,
  DestinationFieldManipulation,
  EventAreaScopes,
  EventTypes,
  SourceToDestinationWithPath
} from '@wfm/service-layer/models/actionDto';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store';
/**
 * local
 */
import { CopyActionData } from '../copy-fields-action/copy-fields-action.component';

export interface CaseToStepData {
  destinationFieldManipulations?: DestinationFieldManipulation[];
  sourceToDestination: SourceToDestinationWithPath[];
  isValid: boolean;
}
@Component({
  selector: 'app-case-to-step-action',
  templateUrl: './case-to-step-action.component.html',
  styleUrls: ['./case-to-step-action.component.scss']
})
export class CaseToStepActionComponent extends TenantComponent implements OnInit {
  @Input() workflow: WorkflowDto;
  @Input() actionDto: CaseToStepEventDto;
  @Input() actionScope?: EventAreaScopes;
  @Output() outputEmitter: EventEmitter<CaseToStepData> = new EventEmitter();
  copyActionDto: CopyDataBetweenEntitiesEventDto;

  caseToStepOutputData: CaseToStepData;

  get eventTypes() {
    return EventTypes;
  }

  constructor(private store: Store<ApplicationState>) {
    super(store);
  }

  ngOnInit() {
    this.caseToStepOutputData = {
      destinationFieldManipulations: [],
      sourceToDestination: [],
      isValid: false
    };
    if (this.actionDto) {
      this.populateActionData();
    }
  }

  populateActionData(): void {
    this.copyActionDto = {
      ...this.actionDto
    };
  }

  emitToParent(): void {
    let data = cloneDeep(this.caseToStepOutputData);
    this.outputEmitter.emit(data);
  }

  copyFieldsActionDataUpdated(data: CopyActionData) {
    this.caseToStepOutputData = {
      ...data
    };

    this.emitToParent();
  }
}
