/**
 * Global
 */
import { KeyValue } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { filter, takeUntil } from 'rxjs/operators';
import { cloneDeep } from 'lodash-core';
/**
 * Project
 */
import { SchemaDto, WorkflowDto } from '@wfm/service-layer';
import {
  OrchestratorActionHandlerTypes,
  OrchestratorActionHandlerTypesEnum,
  WorkflowSchemaConnectorEntity
} from '@wfm/service-layer/models/orchestrator';
import { TenantComponent } from '@wfm/shared/tenant.component';

/**
 * Local
 */
import { StepHandlerData } from './process-step-manipulation-handler/process-step-manipulation-handler.component';
import { CaseHandlerData } from './case-manipulation-handler/case-manipulation-handler.component';
@Component({
  selector: 'app-orchestrator-action-handler',
  templateUrl: './orchestrator-action-handler.component.html',
  styleUrls: ['./orchestrator-action-handler.component.scss']
})
export class OrchestratorActionHandlerComponent extends TenantComponent implements OnInit, OnChanges {
  @Input() destination: WorkflowDto;
  @Input() source: WorkflowDto;
  @Input() config: OrchestratorActionHandlerTypes;
  @Input() connector: WorkflowSchemaConnectorEntity;
  @Output() actionHandlerDataEmitter: EventEmitter<OrchestratorActionHandlerTypes> = new EventEmitter();
  handlerStepSchema: SchemaDto;
  processStepManipulationData: StepHandlerData;

  caseManipulationData: CaseHandlerData;

  get handlerTypes() {
    return OrchestratorActionHandlerTypesEnum;
  }

  actionHandlerForm: FormGroup;
  actionTypes: KeyValue<OrchestratorActionHandlerTypesEnum, string>[] = [
    {
      key: OrchestratorActionHandlerTypesEnum.ProcessStepManipulation,
      value: 'Process Step Manipulation'
    },
    {
      key: OrchestratorActionHandlerTypesEnum.CaseManipulation,
      value: 'Case Manipulation'
    }
  ];

  constructor(private store: Store<any>, private fb: FormBuilder) {
    super(store);
    this.actionHandlerForm = this.fb.group({
      actionType: [null, Validators.required],
      name: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.actionHandlerForm.valueChanges
      .pipe(
        filter((x) => !!x),
        takeUntil(this.destroyed$)
      )
      .subscribe((x) => {
        this.emitActionHandlerData();
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.config?.currentValue) {
      this.actionHandlerForm.reset();
      this.processStepManipulationData = null;
      this.caseManipulationData = null;
      this.updateConfig();
      this.emitActionHandlerData();
    }
  }

  emitActionHandlerData(): void {
    const formValue = this.actionHandlerForm.value;

    let data = <OrchestratorActionHandlerTypes>{
      destinationHandlerType: formValue.actionType,
      id: this.config?.id,
      name: formValue.name
    };
    switch (formValue.actionType) {
      case OrchestratorActionHandlerTypesEnum.ProcessStepManipulation:
        data = <OrchestratorActionHandlerTypes>{
          ...data,
          ...this.processStepManipulationData
        };
        break;
      case OrchestratorActionHandlerTypesEnum.CaseManipulation:
        data = <OrchestratorActionHandlerTypes>{
          ...data,
          ...this.caseManipulationData
        };
        break;

      default:
        break;
    }

    this.actionHandlerDataEmitter.emit(data);
  }

  updateConfig(): void {
    if (this.config) {
      this.actionHandlerForm.patchValue({
        actionType: this.config.destinationHandlerType,
        name: this.config.name
      });
      if (this.config.destinationHandlerType === this.handlerTypes.ProcessStepManipulation) {
        this.processStepManipulationData = {
          destinationStepLinkRef: this.config['destinationStepLinkRef'],
          manipulations: this.config.manipulations
        };
      } else if (this.config.destinationHandlerType === this.handlerTypes.CaseManipulation) {
        this.caseManipulationData = {
          side: this.config['side'],
          manipulations: this.config.manipulations
        };
      }
    }
  }

  stepHandlerDataUpdated(data: StepHandlerData): void {
    this.processStepManipulationData = cloneDeep(data);
    this.emitActionHandlerData();
  }

  caseHandlerDataUpdated(data): void {
    this.caseManipulationData = cloneDeep(data);
    this.emitActionHandlerData();
  }
}
