/**
 * Global
 */
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
/**
 * Project
 */
import {
  AreaTypeEnum,
  ProcessStepEntityService,
  SchemaDto,
  WorkflowDto,
  WorkflowTransitionDto,
  WorkflowTransitionService
} from '@wfm/service-layer';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import {
  CaseCreateEvent,
  CaseUpdateEvent,
  OrchestratorActionEventTypesEnum,
  OrchestratorActionTriggerEventTypes,
  ProcessStepResolutionEvent,
  StatusTransitionEvent
} from '@wfm/service-layer/models/orchestrator';

/**
 * Local
 */

import { ExpressionConfig, ExpressionDefOutput } from '../../../../../workflows/rules-builder/rules-builder.component';

@Component({
  selector: 'app-orchestrator-action-event',
  templateUrl: './orchestrator-action-event.component.html',
  styleUrls: ['./orchestrator-action-event.component.scss']
})
export class OrchestratorActionEventComponent implements OnInit, OnChanges {
  @Input() triggerType: OrchestratorActionEventTypesEnum;
  @Input() source: WorkflowDto;
  @Input() config: OrchestratorActionTriggerEventTypes;
  @Output() actionEventDataEmitter: EventEmitter<OrchestratorActionTriggerEventTypes> = new EventEmitter();

  get eventTypes() {
    return OrchestratorActionEventTypesEnum;
  }

  actionEventForm: FormGroup;
  resolutionsList: { name: string; id: string }[];
  statusTransitionsList: WorkflowTransitionDto[] = [];
  sourceCaseSchema: SchemaDto;

  expression: ExpressionDefOutput;
  caseExpressionConfig: ExpressionConfig = {
    title: '',
    rules: true,
    rulesLabel: 'Add Rules For Specific Fields',
    userRolesLabel: '',
    userGroupsLabel: '',
    buttons: false
  };

  constructor(
    private processStepService: ProcessStepEntityService,
    private wfTransition: WorkflowTransitionService,
    private fb: FormBuilder,
    private adminSchemasService: AdminSchemasService
  ) {
    this.actionEventForm = this.fb.group({
      processStepLinkId: [],
      stepResolutions: [],
      statusTransition: []
    });
  }

  ngOnInit() {}

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes?.source?.currentValue) {
      this.actionEventForm?.reset();
    }
    if (changes.triggerType?.currentValue) {
      this.actionEventForm?.reset();
      if (this.triggerType === OrchestratorActionEventTypesEnum.StatusChange) {
        this.getStatusTransitions();
      } else if (this.triggerType === OrchestratorActionEventTypesEnum.CaseUpdate) {
        await this.getCaseSchema();
      } else if (this.triggerType === OrchestratorActionEventTypesEnum.CaseCreate) {
        await this.getCaseSchema();
      }
      this.emitValue();
    }
    if (changes?.config?.currentValue) {
      this.updateConfig(this.triggerType, this.config);
      this.emitValue();
    }
  }

  updateConfig(type: OrchestratorActionEventTypesEnum, data: OrchestratorActionTriggerEventTypes): void {
    switch (type) {
      case OrchestratorActionEventTypesEnum.ProcessStepResolution:
        const processStepResolutionConfig = data as ProcessStepResolutionEvent;
        if (processStepResolutionConfig) {
          this.getStepResolutions(processStepResolutionConfig?.sourceStepLinkRef);
        }
        this.actionEventForm.patchValue({
          processStepLinkId: processStepResolutionConfig?.sourceStepLinkRef,
          stepResolutions: processStepResolutionConfig?.sourceResolutions
        });
        break;
      case OrchestratorActionEventTypesEnum.StatusChange:
        const statusChangeConfig = data as StatusTransitionEvent;
        this.actionEventForm.patchValue({
          statusTransition: statusChangeConfig?.sourceStatusTransitionId
        });
        break;
      case OrchestratorActionEventTypesEnum.CaseUpdate:
        const caseUpdateConfig = data as CaseUpdateEvent;
        this.expression = {
          data: {
            ruleSet: caseUpdateConfig.ruleSet
          },
          isValid: true
        };
        break;
      case OrchestratorActionEventTypesEnum.CaseCreate:
        const caseCreateConfig = data as CaseCreateEvent;
        this.expression = {
          data: {
            ruleSet: caseCreateConfig.ruleSet
          },
          isValid: true
        };
        break;
      default:
        break;
    }
  }

  onStepChange(event: MatSelectChange): void {
    this.getStepResolutions(event.value);
  }

  getStepResolutions(id: string): void {
    if (id) {
      const ps = this.source.processStepLinks.find((x) => x.refName === id);
      this.loadStepResolutions(ps.processStepEntityId);
      this.emitValue();
    }
  }

  async loadStepResolutions(id: string): Promise<void> {
    try {
      const tenantId = this.source.tenantId;
      const step = await this.processStepService.get(tenantId, id);
      this.resolutionsList = step.resolutions.map((y) => {
        return { name: y.name, id: y.id };
      });
    } catch (error) {
      console.log(error);
      this.resolutionsList = [];
    }
  }

  async getStatusTransitions(): Promise<void> {
    try {
      this.statusTransitionsList = await this.wfTransition.getList(this.source?.tenantId, this.source?.id);
    } catch (error) {
      console.log(error);
      this.statusTransitionsList = [];
    }
  }

  emitValue(): void {
    const value = this.actionEventForm?.value;
    let outputData: OrchestratorActionTriggerEventTypes;
    switch (this.triggerType) {
      case OrchestratorActionEventTypesEnum.ProcessStepResolution:
        outputData = <ProcessStepResolutionEvent>{
          sourceEventType: this.triggerType,
          sourceResolutions: value?.stepResolutions,
          sourceStepLinkRef: value?.processStepLinkId
        };
        break;
      case OrchestratorActionEventTypesEnum.StatusChange:
        outputData = <StatusTransitionEvent>{
          sourceEventType: this.triggerType,
          sourceStatusTransitionId: value?.statusTransition
        };

      case OrchestratorActionEventTypesEnum.CaseUpdate:
        outputData = <CaseUpdateEvent>{
          sourceEventType: this.triggerType,
          ruleSet: this.expression?.data?.ruleSet
        };

      case OrchestratorActionEventTypesEnum.CaseCreate:
        outputData = <CaseCreateEvent>{
          sourceEventType: this.triggerType,
          ruleSet: this.expression?.data?.ruleSet
        };
      default:
        break;
    }
    this.actionEventDataEmitter.emit(outputData);
  }

  async getCaseSchema(): Promise<void> {
    this.sourceCaseSchema = await this.adminSchemasService.getSchema(this.source.tenantId, AreaTypeEnum.case, this.source.caseSchemaId);
  }

  expressionUpdated(event: ExpressionDefOutput): void {
    this.expression = { ...event };
    this.emitValue();
  }
}
