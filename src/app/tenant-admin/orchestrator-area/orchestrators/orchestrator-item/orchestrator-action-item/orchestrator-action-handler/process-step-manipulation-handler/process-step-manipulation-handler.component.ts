/**
 * global
 */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { cloneDeep } from 'lodash-core';
import { filter, takeUntil } from 'rxjs/operators';

/**
 * project
 */
import { WorkflowDto, AreaTypeEnum, SchemaDto, ProcessStepEntityService, FieldTypeIds } from '@wfm/service-layer';
import { BaseFieldValueType } from '@wfm/service-layer/models/FieldValueDto';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { BaseComponent } from '@wfm/shared/base.component';
import { ConnectorSide, DynamicValueForConnectorField, WorkflowSchemaConnectorEntity } from '@wfm/service-layer/models/orchestrator';

/**
 * local
 */
import {
  FieldsBuilderOutput,
  OrchestratorFieldsBuilderComponent
} from '../orchestrator-fields-builder/orchestrator-fields-builder.component';

export interface StepHandlerData {
  destinationStepLinkRef: string;
  manipulations: {
    createStepIfNotExist?: boolean;
    addOrUpdateFields?: BaseFieldValueType[];
    addOrUpdateDynamicValue?: DynamicValueForConnectorField[];
    resolution?: string;
  };
}

export interface FieldValues {
  staticValues: BaseFieldValueType[];
  dynamicValues: DynamicValueForConnectorField[];
}

@Component({
  selector: 'app-process-step-manipulation-handler',
  templateUrl: './process-step-manipulation-handler.component.html',
  styleUrls: ['./process-step-manipulation-handler.component.scss']
})
export class ProcessStepManipulationHandlerComponent extends BaseComponent implements OnInit {
  @Input() handlerData: StepHandlerData;
  @Input() destination: WorkflowDto;
  @Input() connector: WorkflowSchemaConnectorEntity;
  @Output() handlerDataEmitter: EventEmitter<StepHandlerData> = new EventEmitter();

  handlerForm: FormGroup;
  resolutionsList: { name: string; id: string }[];
  fieldsList: BaseFieldValueType[] = [];
  stepSchema: SchemaDto;

  constructor(
    private fb: FormBuilder,
    private schemaService: AdminSchemasService,
    private processStepService: ProcessStepEntityService,
    private dialog: MatDialog
  ) {
    super();
  }

  ngOnInit(): void {
    this.handlerForm = this.fb.group({
      processStepLink: ['', Validators.required],
      createStepIfNotExist: [false],
      resolutionId: []
    });
    this.handlerForm.valueChanges
      .pipe(
        filter((x) => !!x),
        takeUntil(this.destroyed$)
      )
      .subscribe((x) => {
        this.emitActionHandlerData();
      });

    if (this.handlerData) {
      this.handlerForm.patchValue({
        processStepLink: this.handlerData.destinationStepLinkRef,
        createStepIfNotExist: this.handlerData.manipulations?.createStepIfNotExist,
        resolutionId: this.handlerData.manipulations?.resolution
      });
      this.getStepResolutions(this.handlerData.destinationStepLinkRef);
      this.fieldsList = [
        ...(this.handlerData?.manipulations?.addOrUpdateFields || []),
        ...(this.handlerData?.manipulations?.addOrUpdateDynamicValue || [])
      ];
    }
  }

  onStepChange(event: MatSelectChange): void {
    this.getStepResolutions(event.value);
    this.handlerForm.patchValue({
      createStepIfNotExist: false,
      resolutionId: null
    });
    this.fieldsList = [];
  }

  getStepResolutions(refName: string): void {
    if (refName) {
      const ps = this.destination.processStepLinks.find((x) => x.refName === refName);
      this.getStepEntity(ps.processStepEntityId);
    }
  }

  async getStepEntity(id: string): Promise<void> {
    const tenantId = this.destination.tenantId;
    try {
      const step = await this.processStepService.get(tenantId, id);
      this.resolutionsList = step.resolutions.map((y) => {
        return { name: y.name, id: y.id };
      });
      this.getStepSchema(step.schemaId);
    } catch (error) {
      console.log(error);
    }
  }

  async openFieldBuilder(): Promise<void> {
    if (this.stepSchema) {
      const dialogRef = this.dialog.open(OrchestratorFieldsBuilderComponent, { width: '600px' });
      dialogRef.componentInstance.schema = cloneDeep(this.stepSchema);
      dialogRef.componentInstance.connector = this.connector;
      dialogRef.componentInstance.allowDynamicConnectorFieldValue = true;
      dialogRef.componentInstance.showCopyFieldsTab = false;
      if (this.fieldsList) {
        dialogRef.componentInstance.fieldsDto = this.fieldsList;
      }
      dialogRef.afterClosed().subscribe((result: FieldsBuilderOutput) => {
        if (result) {
          this.fieldsList = result.addOrUpdateFields;
          this.emitActionHandlerData();
        }
      });
    }
  }

  async getStepSchema(schemaId: string): Promise<void> {
    try {
      this.stepSchema = await this.schemaService.getSchema(this.destination.tenantId, AreaTypeEnum.stepForm, schemaId);
    } catch (error) {
      console.log(error);
    }
  }

  resetResolution(): void {
    this.handlerForm.get('resolutionId').setValue(null);
  }

  emitActionHandlerData(): void {
    const formValue = this.handlerForm.value;
    const fieldValues = this.processFieldValues();
    const data: StepHandlerData = {
      destinationStepLinkRef: formValue.processStepLink,
      manipulations: {
        createStepIfNotExist: formValue.createStepIfNotExist,
        addOrUpdateFields: fieldValues.staticValues,
        addOrUpdateDynamicValue: fieldValues.dynamicValues,
        resolution: formValue.resolutionId
      }
    };
    console.log('processStepHandler data:', data);

    this.handlerDataEmitter.emit(data);
  }

  /**
   * static value setting commands to be separated out from dynamic value set commands
   */
  processFieldValues(): FieldValues {
    const staticValues: BaseFieldValueType[] = [];
    const dynamicValues: DynamicValueForConnectorField[] = [];
    if (this.fieldsList?.length) {
      this.fieldsList.forEach((f) => {
        if (f.type !== FieldTypeIds.ConnectorField) {
          staticValues.push(f);
        } else {
          const connectorValue = f.value as string[];
          let data = {
            id: f.id,
            type: f.type,
            value: null
          };

          if (connectorValue?.includes(ConnectorSide.Source)) {
            dynamicValues.push({
              ...data,
              value: ConnectorSide.Source
            });
          } else if (connectorValue?.includes(ConnectorSide.Destination)) {
            dynamicValues.push({
              ...data,
              value: ConnectorSide.Destination
            });
          } else {
            staticValues.push(f);
          }
        }
      });
    }

    return {
      staticValues,
      dynamicValues
    };
  }
}
