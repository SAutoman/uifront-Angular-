/**
 * global
 */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { cloneDeep } from 'lodash-core';
import { filter, takeUntil } from 'rxjs/operators';

/**
 * project
 */

import { WorkflowDto, SchemaDto, AreaTypeEnum, WorkflowStatusDto, FieldTypeIds } from '@wfm/service-layer';
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
import { FieldValues } from '../process-step-manipulation-handler/process-step-manipulation-handler.component';
import { SourceToDestinationWithPath } from '@wfm/service-layer/models/actionDto';

export interface CaseHandlerData {
  side: ConnectorSide;
  manipulations: {
    addOrUpdateFields?: BaseFieldValueType[];
    addOrUpdateDynamicValue?: DynamicValueForConnectorField[];
    status?: string;
    copyFields?: SourceToDestinationWithPath[];
  };
}

@Component({
  selector: 'app-case-manipulation-handler',
  templateUrl: './case-manipulation-handler.component.html',
  styleUrls: ['./case-manipulation-handler.component.scss']
})
export class CaseManipulationHandlerComponent extends BaseComponent implements OnInit {
  @Input() handlerData: CaseHandlerData;
  @Input() destination: WorkflowDto;
  @Input() source: WorkflowDto;
  @Input() connector: WorkflowSchemaConnectorEntity;
  @Output() handlerDataEmitter: EventEmitter<CaseHandlerData> = new EventEmitter();

  handlerForm: FormGroup;
  fieldsList: BaseFieldValueType[] = [];
  copyFields: SourceToDestinationWithPath[];
  caseSchema: SchemaDto;
  statusList: WorkflowStatusDto[];
  constructor(private fb: FormBuilder, private schemaService: AdminSchemasService, private dialog: MatDialog) {
    super();
  }

  ngOnInit(): void {
    this.handlerForm = this.fb.group({
      side: ['', Validators.required],
      status: []
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
      this.getCaseData(this.handlerData.side);
      this.fieldsList = [
        ...(this.handlerData?.manipulations?.addOrUpdateFields || []),
        ...(this.handlerData?.manipulations?.addOrUpdateDynamicValue || [])
      ];
      this.copyFields = this.handlerData.manipulations.copyFields;
      this.handlerForm.patchValue({
        side: this.handlerData.side,
        status: this.handlerData.manipulations?.status
      });
    }
  }

  onSideChange(event: MatSelectChange): void {
    this.resetStatus();
    this.fieldsList = [];
    this.copyFields = null;
    this.getCaseData(event.value);
  }

  getCaseData(connectorSide: ConnectorSide): void {
    if (connectorSide === ConnectorSide.Destination) {
      this.statusList = this.destination.statuses;
      this.getCaseSchema(this.destination.caseSchemaId, this.destination.tenantId);
    } else if (connectorSide === ConnectorSide.Source) {
      this.statusList = this.source.statuses;
      this.getCaseSchema(this.source.caseSchemaId, this.source.tenantId);
    }
  }

  async openFieldBuilder(): Promise<void> {
    if (this.caseSchema) {
      const dialogRef = this.dialog.open(OrchestratorFieldsBuilderComponent, { width: '600px' });
      dialogRef.componentInstance.schema = cloneDeep(this.caseSchema);
      dialogRef.componentInstance.connector = cloneDeep(this.connector);
      dialogRef.componentInstance.caseUpdateSide = this.handlerForm.get('side').value;
      dialogRef.componentInstance.showCopyFieldsTab = true;
      // allow setting dynamic connectorField value only for destinations
      if (this.handlerForm.get('side').value === ConnectorSide.Destination) {
        dialogRef.componentInstance.allowDynamicConnectorFieldValue = true;
      }

      if (this.fieldsList) {
        dialogRef.componentInstance.fieldsDto = this.fieldsList;
      }

      if (this.copyFields) {
        dialogRef.componentInstance.copyFieldsDto = this.copyFields;
      }
      dialogRef.afterClosed().subscribe((result: FieldsBuilderOutput) => {
        if (result) {
          this.fieldsList = result.addOrUpdateFields;
          this.copyFields = result.copyFields;
          this.emitActionHandlerData();
        }
      });
    }
  }

  resetStatus(): void {
    this.handlerForm.get('status').setValue(null);
  }

  async getCaseSchema(schemaId: string, tenantId: string): Promise<void> {
    try {
      this.caseSchema = await this.schemaService.getSchema(tenantId, AreaTypeEnum.case, schemaId);
    } catch (error) {
      console.log(error);
    }
  }

  emitActionHandlerData(): void {
    const formValue = this.handlerForm.value;
    const fieldValues = this.processFieldValues();
    const data: CaseHandlerData = {
      side: formValue.side,
      manipulations: {
        addOrUpdateFields: fieldValues.staticValues,
        addOrUpdateDynamicValue: fieldValues.dynamicValues,
        status: formValue.status,
        copyFields: this.copyFields
      }
    };
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
