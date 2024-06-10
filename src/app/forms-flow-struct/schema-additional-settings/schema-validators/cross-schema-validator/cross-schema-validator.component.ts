import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IConfigurableListItem } from '@wfm/common/models';
import {
  AreaTypeEnum,
  CrossSchemaValidatorDto,
  DynamicRuleSet,
  SchemaDto,
  SchemaValidatorEnum,
  ValidatorActionEnum
} from '@wfm/service-layer';
import { BaseFieldConverter } from '@wfm/service-layer/helpers';
import { WorkflowSchemaConnectorEntity, WorkflowSchemaItem } from '@wfm/service-layer/models/orchestrator';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';
import { DynamicRuleOutput } from '@wfm/tenant-admin/workflows/dynamic-rules-builder/dynamic-rules-builder.component';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { cloneDeep } from 'lodash-core';
import { RuleSetCustomCondition } from '@wfm/service-layer/models/expressionModel';

export interface CrossSchemaValidatorOutput extends CrossSchemaValidatorDto {
  isValid: boolean;
}

@Component({
  selector: 'app-cross-schema-validator',
  templateUrl: './cross-schema-validator.component.html',
  styleUrls: ['./cross-schema-validator.component.scss']
})
export class CrossSchemaValidatorComponent implements OnInit {
  @Input() validatorData: CrossSchemaValidatorOutput;
  @Input() currentSchemaFields: IConfigurableListItem[];
  @Input() currentSchema: SchemaDto;
  @Input() workflowConnectors: WorkflowSchemaConnectorEntity[];
  @Output() emitter: EventEmitter<CrossSchemaValidatorOutput> = new EventEmitter();
  form: FormGroup;
  selectedConnector: WorkflowSchemaConnectorEntity;
  connectorSchemaFields: IConfigurableListItem[];
  validatorRuleSet: DynamicRuleSet;
  valueSchema: SchemaDto;

  get validationActionEnum() {
    return ValidatorActionEnum;
  }

  get condition() {
    return RuleSetCustomCondition;
  }

  constructor(private fb: FormBuilder, private adminSchemasService: AdminSchemasService, private errorHandler: ErrorHandlerService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      connector: [null, Validators.required],
      workflowSchema: [null, Validators.required],
      ruleSet: [null, Validators.required],
      validationAction: [ValidatorActionEnum.BLOCK, Validators.required],
      validationMessage: ['', Validators.required],
      summaryCondition: [RuleSetCustomCondition.And, Validators.required]
    });

    let isFirstChange = true;

    this.form.valueChanges.pipe(distinctUntilChanged(), debounceTime(300)).subscribe(() => {
      if (!isFirstChange) {
        this.emit();
      }
      isFirstChange = false;
    });

    let isFirstConnectorChange = true;

    this.form
      .get('connector')
      .valueChanges.pipe(distinctUntilChanged())
      .subscribe((selectedConnector: string) => {
        this.selectedConnector = null;
        this.selectedConnector = this.workflowConnectors.find((c) => c.id === selectedConnector);

        if (!isFirstConnectorChange) {
          this.form.get('workflowSchema').patchValue(null);
          this.form.get('ruleSet').patchValue(null);
        }
        isFirstConnectorChange = false;
      });

    this.form
      .get('workflowSchema')
      .valueChanges.pipe(distinctUntilChanged())
      .subscribe(async (wfId: string) => {
        this.connectorSchemaFields = null;
        if (wfId) {
          const wf =
            this.selectedConnector.workflowSchemaDestination.id === wfId
              ? this.selectedConnector.workflowSchemaDestination
              : this.selectedConnector.workflowSchemaSource;

          try {
            this.valueSchema = await this.adminSchemasService.getSchema(wf.tenantId, AreaTypeEnum.case, wf.caseSchemaId);

            this.connectorSchemaFields = this.valueSchema?.fields.map((f) => BaseFieldConverter.toUi(f));
          } catch (error) {
            this.errorHandler.getAndShowErrorMsg(error);
          }
        }
      });

    if (this.validatorData) {
      this.form.patchValue({
        name: this.validatorData?.name,
        connector: this.validatorData?.workflowSchemaConnectorId,
        workflowSchema: this.validatorData?.workflowSchemaId,
        ruleSet: this.validatorData?.ruleSet,
        validationAction: this.validatorData?.validationAction || ValidatorActionEnum.BLOCK,
        validationMessage: this.validatorData?.message,
        summaryCondition: this.validatorData?.ruleSet?.summaryCondition || RuleSetCustomCondition.And
      });

      this.validatorRuleSet = cloneDeep(this.validatorData?.ruleSet);
    }
  }

  ruleEmitted(data: DynamicRuleOutput): void {
    this.form.get('ruleSet').patchValue(data);
    this.emit();
  }

  emit(): void {
    const formValue = this.form.value;
    const data: CrossSchemaValidatorOutput = {
      name: formValue.name,
      type: SchemaValidatorEnum.CrossSchemaValidator,
      workflowSchemaConnectorId: formValue.connector,
      workflowSchemaId: formValue.workflowSchema,
      ruleSet: {
        ...formValue.ruleSet?.data,
        summaryCondition: formValue.summaryCondition
      },
      isValid: this.form.valid && formValue.ruleSet?.isValid,
      validationAction: formValue.validationAction,
      message: formValue.validationMessage
    };
    this.emitter.emit(data);
  }
}
