import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IConfigurableListItem } from '@wfm/common/models';
import { SchemaDto, SchemaValidator, SchemaValidatorEnum } from '@wfm/service-layer';
import { WorkflowSchemaConnectorEntity } from '@wfm/service-layer/models/orchestrator';
import { WorkflowsConnectorService } from '@wfm/service-layer/services/workflows-connector.service';
import { CrossSchemaValidatorOutput } from './cross-schema-validator/cross-schema-validator.component';

export interface SchemaValidatorsOutput {
  isValid: boolean;
  data: SchemaValidator[];
}

@Component({
  selector: 'app-schema-validators',
  templateUrl: './schema-validators.component.html',
  styleUrls: ['./schema-validators.component.scss']
})
export class SchemaValidatorsComponent implements OnInit {
  @Input() schemaValidators: SchemaValidator[];
  @Input() fields: IConfigurableListItem[];
  @Input() schema: SchemaDto;
  @Output() emitData: EventEmitter<SchemaValidatorsOutput> = new EventEmitter();
  crossSchemaValidators: CrossSchemaValidatorOutput[] = [];
  workflowConnectors: WorkflowSchemaConnectorEntity[];

  constructor(private workflowConnectorsService: WorkflowsConnectorService) {}

  ngOnInit(): void {
    this.getAllConnectors();
    if (this.schemaValidators?.length) {
      this.schemaValidators.forEach((val) => {
        this.addValidator(val);
      });
    }
  }

  async getAllConnectors(): Promise<void> {
    this.workflowConnectors = await this.workflowConnectorsService.getAll();
  }

  addValidator(val?: SchemaValidator): void {
    const data = val?.crossSchemaValidator;

    this.crossSchemaValidators.push({
      name: data?.name,
      type: SchemaValidatorEnum.CrossSchemaValidator,
      workflowSchemaConnectorId: data?.workflowSchemaConnectorId,
      workflowSchemaId: data?.workflowSchemaId,
      ruleSet: data?.ruleSet,
      validationAction: data?.validationAction,
      message: data?.message,
      isValid: data ? true : false
    });

    this.emit();
  }

  removeValidator(index: number): void {
    this.crossSchemaValidators.splice(index, 1);
    this.emit();
  }

  validatorEmitted(data: CrossSchemaValidatorOutput, index: number): void {
    const val = this.crossSchemaValidators[index];
    val.name = data.name;
    val.workflowSchemaConnectorId = data.workflowSchemaConnectorId;
    val.workflowSchemaId = data.workflowSchemaId;
    val.ruleSet = data.ruleSet;
    val.validationAction = data.validationAction;
    val.isValid = data.isValid;
    val.message = data.message;
    this.emit();
  }

  emit(): void {
    const output = {
      isValid: this.crossSchemaValidators.every((v) => v.isValid),
      data: this.crossSchemaValidators.map((val) => {
        return {
          crossSchemaValidator: val
        };
      })
    };
    this.emitData.emit(output);
  }
}
