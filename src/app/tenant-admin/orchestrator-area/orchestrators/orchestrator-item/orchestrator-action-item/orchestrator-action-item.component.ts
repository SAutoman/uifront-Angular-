/**
 * Global
 */
import { KeyValue } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { cloneDeep } from 'lodash-core';
import { TranslateService } from '@ngx-translate/core';

/**
 * Project
 */
import { WorkflowDto, WorkflowService } from '@wfm/service-layer';
import {
  CreateOrchestratorActionEntityDto,
  OrchestratorActionEventTypesEnum,
  OrchestratorActionHandlerTypes,
  WorkflowSchemaConnectorEntity,
  OrchestratorActionTriggerEventTypes,
  UpdateOrchestratorActionEntityDto,
  ProcessStepManipulationHandler,
  OrchestratorActionHandlerTypesEnum,
  CaseManipulationHandler
} from '@wfm/service-layer/models/orchestrator';
import { WorkflowsConnectorService } from '@wfm/service-layer/services/workflows-connector.service';
import { ConfirmDialogComponent } from '@wfm/confirm-dialog/confirm-dialog.component';

/**
 * Local
 */

@Component({
  selector: 'app-orchestrator-action-item',
  templateUrl: './orchestrator-action-item.component.html',
  styleUrls: ['./orchestrator-action-item.component.scss']
})
export class OrchestratorActionItemComponent implements OnInit, OnChanges {
  @Input() actionDto: CreateOrchestratorActionEntityDto;
  @Input() events: KeyValue<OrchestratorActionEventTypesEnum, string>[];
  @Input() connectors: WorkflowSchemaConnectorEntity[];
  @Input() order: number;
  @Output() OrchestratorActionEmitter: EventEmitter<CreateOrchestratorActionEntityDto | UpdateOrchestratorActionEntityDto> =
    new EventEmitter(null);

  triggererConfig: OrchestratorActionTriggerEventTypes;
  handlerConfig: OrchestratorActionHandlerTypes;
  form: FormGroup;
  source: WorkflowDto;
  destination: WorkflowDto;
  actionEventData: OrchestratorActionTriggerEventTypes;
  actionJsonConfig: {
    trigger?: OrchestratorActionTriggerEventTypes;
    handlers?: OrchestratorActionHandlerTypes[];
  };
  handlersList: OrchestratorActionHandlerTypes[] = [];
  selectedConnector: WorkflowSchemaConnectorEntity;
  constructor(
    private fb: FormBuilder,
    private connectorService: WorkflowsConnectorService,
    private workflowService: WorkflowService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private ts: TranslateService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      eventType: ['', Validators.required],
      connector: ['', Validators.required]
    });

    this.form.get('connector').valueChanges.subscribe((selectedConnectorId) => {
      this.selectedConnector = null;
      this.handlersList = [];
      if (selectedConnectorId) {
        this.form.patchValue({
          eventType: null
        });
        this.populateConnectorData(selectedConnectorId);
      }
    });
    if (this.actionDto) {
      this.updateForm();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.actionDto?.currentValue) {
      this.updateForm();
    }
  }

  loadActionConfig(): void {
    try {
      if (this.actionDto?.orchestratorActionConfigurationJson?.length) {
        this.actionJsonConfig = JSON.parse(this.actionDto.orchestratorActionConfigurationJson);
        if (this.actionJsonConfig?.handlers?.length) {
          const tempHandlerData = cloneDeep(this.actionJsonConfig.handlers);
          this.handlersList = tempHandlerData.map((x: ProcessStepManipulationHandler, index: number) => {
            return { ...x, id: index + 1 };
          });
        }
      }
    } catch (error) {
      console.log('error while parsing orchestrator action config', error);
      this.actionJsonConfig = null;
    }
  }

  async populateConnectorData(id: string): Promise<void> {
    try {
      const connector = await this.connectorService.get(id);
      if (connector) {
        this.selectedConnector = connector;
        const data = await Promise.all([
          this.workflowService.get(connector.workflowSchemaSource.id, connector.workflowSchemaSource.tenantId),
          this.workflowService.get(connector.workflowSchemaDestination.id, connector.workflowSchemaDestination.tenantId)
        ]);
        this.source = data[0];
        this.destination = data[1];
        this.loadActionConfig();
      }
    } catch (error) {
      console.log(error);
    }
  }

  updateForm(): void {
    this.form?.patchValue({
      name: this.actionDto.name,
      connector: this.actionDto.workflowSchemaConnectorId
    });
    this.form?.controls.eventType.setValue(this.actionDto.orchestratorActionEventType);
  }

  async onSubmit(): Promise<void> {
    if (this.handlersList?.length && !this.areHandlersValid()) {
      return;
    }
    const dto = this.populateDto();
    this.OrchestratorActionEmitter.emit(dto);
  }

  populateDto(): CreateOrchestratorActionEntityDto | UpdateOrchestratorActionEntityDto {
    const dto: CreateOrchestratorActionEntityDto = {
      name: this.form.get('name').value,
      order: this.actionDto ? this.actionDto.order : this.order,
      orchestratorActionEventType: this.form.get('eventType').value,
      workflowSchemaConnectorId: this.form.get('connector').value,
      orchestratorActionConfigurationJson: null
    };

    const orchestratorConfig = {
      trigger: this.actionEventData,
      handlers: this.handlersList
    };

    dto.orchestratorActionConfigurationJson = JSON.stringify(orchestratorConfig);

    if (this.actionDto) {
      (<UpdateOrchestratorActionEntityDto>dto).id = this.actionDto['id'];
    }
    return dto;
  }

  isDataValid(): boolean {
    return this.form.valid;
  }

  areHandlersValid(): boolean {
    for (let index = 0; index < this.handlersList?.length; index++) {
      const handler = this.handlersList[index];
      switch (handler.destinationHandlerType) {
        case OrchestratorActionHandlerTypesEnum.ProcessStepManipulation:
          const stepHandler = handler as ProcessStepManipulationHandler;
          if (this.isStepHandlerInvalid(stepHandler)) {
            this.snackBar.open(this.ts.instant(`Handler ${index + 1} not valid.`), this.ts.instant('Ok'), { duration: 3000 });
            return false;
          }
          break;
        case OrchestratorActionHandlerTypesEnum.CaseManipulation:
          const caseHandler = handler as CaseManipulationHandler;
          if (this.isCaseHandlerInvalid(caseHandler)) {
            this.snackBar.open(this.ts.instant(`Handler ${index + 1} not valid.`), this.ts.instant('Ok'), { duration: 3000 });
            return false;
          }
          break;
        default:
          break;
      }
    }
    return true;
  }

  eventDataUpdated(data: OrchestratorActionTriggerEventTypes): void {
    this.actionEventData = cloneDeep(data);
  }

  handlerDataUpdated(data: OrchestratorActionHandlerTypes): void {
    const item = this.handlersList.find((x) => x.id === data.id);
    if (item) {
      item.destinationHandlerType = data.destinationHandlerType;
      item.name = data.name;
      if (item.destinationHandlerType === OrchestratorActionHandlerTypesEnum.ProcessStepManipulation) {
        item['destinationStepLinkRef'] = (<ProcessStepManipulationHandler>data).destinationStepLinkRef;
        item['manipulations'] = (<ProcessStepManipulationHandler>data).manipulations;
      } else if (item.destinationHandlerType === OrchestratorActionHandlerTypesEnum.CaseManipulation) {
        item['side'] = (<CaseManipulationHandler>data).side;
        item['manipulations'] = (<CaseManipulationHandler>data).manipulations;
      }
    }
  }

  addActionHandler(): void {
    let handlerInitData = <OrchestratorActionHandlerTypes>{
      name: '',
      destinationHandlerType: null,
      id: this.handlersList.length + 1
    };
    this.handlersList.push(handlerInitData);
  }

  confirmRemovingHandler(event: Event, index: number): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.afterClosed().subscribe((x) => {
      if (x) {
        this.removeHandler(index);
      }
    });
  }

  isCaseHandlerInvalid(item: CaseManipulationHandler): boolean {
    return (
      !item.side ||
      !item.name ||
      (!item.manipulations.addOrUpdateFields?.length &&
        !item.manipulations.addOrUpdateDynamicValue?.length &&
        !item.manipulations.status &&
        !item.manipulations.copyFields?.every((group) => group.destination?.path?.length && group.source?.path?.length))
    );
  }

  isStepHandlerInvalid(item: ProcessStepManipulationHandler): boolean {
    return (
      !item.destinationStepLinkRef ||
      !item.name ||
      !(
        item.manipulations.addOrUpdateFields?.length ||
        item.manipulations.addOrUpdateDynamicValue?.length ||
        item.manipulations.createStepIfNotExist ||
        item.manipulations.resolution?.length
      )
    );
  }

  removeHandler(index: number): void {
    this.handlersList.splice(index, 1);
  }
}
