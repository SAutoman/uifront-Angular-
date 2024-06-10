import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { cloneDeep } from 'lodash-core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  AreaTypeEnum,
  FieldTypeIds,
  ProcessStepEntityDto,
  ProcessStepEntityService,
  ProcessStepLinkDto,
  WorkflowDto
} from '@wfm/service-layer';
import { convertFieldName } from '@wfm/service-layer/helpers';
import { MathExpressionCalculationEvent } from '@wfm/service-layer/models/actionDto';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { workflowProcessStepLinkList } from '@wfm/store/workflow-builder';
import { take, takeUntil } from 'rxjs/operators';
import { StepDataWithRefName } from '../difference-calculation-action/difference-calculation-action.component';
import { sortBy, isEmpty } from 'lodash-core';
import { FieldPathInput, FieldPathOutput, PropertyPathExtended } from '../field-path-generator/FieldPathModels';
import { TranslateService } from '@ngx-translate/core';

export interface MathExpressionOutput {
  processStepFields?: { [key: string]: PropertyPathExtended };
  caseFields?: { [key: string]: PropertyPathExtended };
  formula: string;
  caseResultField?: PropertyPathExtended;
  processStepResultField?: PropertyPathExtended;
  isValid: boolean;
}

interface ExpressionFieldData extends FieldPathInput {
  index: number;
  ref: string;
}

@Component({
  selector: 'app-math-expression-action',
  templateUrl: './math-expression-action.component.html',
  styleUrls: ['./math-expression-action.component.scss']
})
export class MathExpressionActionComponent extends TenantComponent implements OnInit, OnDestroy {
  @Input() workflow: WorkflowDto;
  @Input() actionDto: MathExpressionCalculationEvent;
  @Input() currentProcessStep?: ProcessStepEntityDto;
  @Output() outputEmitter: EventEmitter<MathExpressionOutput> = new EventEmitter();
  links: ProcessStepLinkDto[];
  steps: StepDataWithRefName[];
  expressionFields: ExpressionFieldData[] = [];
  resultField: ExpressionFieldData;
  actionForm: FormGroup;
  processStepFieldsMap: { [key: string]: PropertyPathExtended } = {};
  caseFieldsMap: { [key: string]: PropertyPathExtended } = {};
  allowedTypes: FieldTypeIds[] = [FieldTypeIds.IntField, FieldTypeIds.DecimalField];

  constructor(
    private store: Store<ApplicationState>,
    private processStepEntityService: ProcessStepEntityService,
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private ts: TranslateService
  ) {
    super(store);
  }

  ngOnInit() {
    this.resultField = {
      fieldKey: 'result',
      index: 0,
      ref: '',
      allowedAreaTypes: [AreaTypeEnum.case, AreaTypeEnum.stepForm]
    };
    this.populateStepsData();
    this.actionForm = this.fb.group({
      formula: ['', Validators.required],
      resultField: [null]
    });

    this.actionForm.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((formData) => {
      const output = this.populateOutputData(formData);
      this.checkFieldTypes(output);
    });
    if (this.actionDto) {
      this.updateFormData();
    } else {
      this.addNewExpressionField();
    }
  }

  /**
   * populate data to emit to parent
   */
  populateOutputData(formData: any): MathExpressionOutput {
    let outputData: MathExpressionOutput = {
      formula: formData.formula || null,
      isValid:
        formData.formula && formData.resultField && (!isEmpty(this.processStepFieldsMap) || !isEmpty(this.caseFieldsMap)) ? true : false
    };
    if (!isEmpty(this.processStepFieldsMap)) {
      outputData.processStepFields = this.processStepFieldsMap;
    }
    if (!isEmpty(this.caseFieldsMap)) {
      outputData.caseFields = this.caseFieldsMap;
    }

    if (formData.resultField) {
      let resultData: FieldPathOutput = formData.resultField;

      if (resultData.entityType === AreaTypeEnum.case) {
        outputData.caseResultField = resultData.fieldPaths && resultData.fieldPaths[0];
      } else if (resultData.entityType === AreaTypeEnum.stepForm) {
        outputData.processStepResultField = resultData.fieldPaths[0];
      }
    }
    return outputData;
  }

  updateFormData() {
    this.actionForm.patchValue(
      {
        formula: this.actionDto.formula,
        resultField: this.actionDto.caseResultField || this.actionDto.processStepFields
      },
      { onlySelf: false }
    );
    if (this.actionDto.caseFields) {
      for (let key in this.actionDto.caseFields) {
        let inputData: FieldPathInput = {
          fieldKey: key,
          allowedAreaTypes: [AreaTypeEnum.case, AreaTypeEnum.stepForm],
          fieldPaths: [this.actionDto.caseFields[key]],
          entityType: AreaTypeEnum.case
        };
        this.addNewExpressionField(inputData);
      }
    }

    if (this.actionDto.processStepFields) {
      for (let key in this.actionDto.processStepFields) {
        let inputData: FieldPathInput = {
          fieldKey: key,
          allowedAreaTypes: [AreaTypeEnum.case, AreaTypeEnum.stepForm],
          fieldPaths: [this.actionDto.processStepFields[key]],
          entityType: AreaTypeEnum.stepForm
        };
        this.addNewExpressionField(inputData);
      }
    }

    this.expressionFields = sortBy(this.expressionFields, [(x) => x.fieldKey]);

    let inputData: FieldPathInput = {
      fieldKey: 'result',
      fieldPaths: [this.actionDto.caseResultField ? this.actionDto.caseResultField : this.actionDto.processStepResultField],
      entityType: this.actionDto.caseResultField ? AreaTypeEnum.case : AreaTypeEnum.stepForm,
      allowedAreaTypes: [AreaTypeEnum.case, AreaTypeEnum.stepForm]
    };

    this.resultField = {
      ...this.resultField,
      ...inputData
    };
  }

  /**
   * fired when child FieldPathGenerator emits value
   */

  expressionFieldPathUpdated(outputData: FieldPathOutput): void {
    if (outputData?.fieldKey) {
      if (outputData.entityType === AreaTypeEnum.case) {
        if (this.processStepFieldsMap[outputData.fieldKey]) {
          delete this.processStepFieldsMap[outputData.fieldKey];
        }
        outputData.fieldPaths?.length
          ? (this.caseFieldsMap[outputData.fieldKey] = outputData.fieldPaths[0])
          : delete this.caseFieldsMap[outputData.fieldKey];
      } else if (outputData.entityType === AreaTypeEnum.stepForm) {
        if (this.caseFieldsMap[outputData.fieldKey]) {
          delete this.caseFieldsMap[outputData.fieldKey];
        }
        outputData.fieldPaths?.length
          ? (this.processStepFieldsMap[outputData.fieldKey] = outputData.fieldPaths[0])
          : delete this.processStepFieldsMap[outputData.fieldKey];
      }
    }
    const output = this.populateOutputData(this.actionForm.value);
    this.checkFieldTypes(output);
  }
  /**
   * fired when child FieldPathGenerator emits value
   */
  resultFieldPathUpdated(outputData: FieldPathOutput): void {
    if (outputData?.fieldKey) {
      this.actionForm.patchValue({
        resultField: outputData.entityType && outputData.fieldPaths?.length ? outputData : null
      });
    }
    const output = this.populateOutputData(this.actionForm.value);
    this.checkFieldTypes(output);
  }

  addNewExpressionField(existingData?: FieldPathInput): void {
    let newField: ExpressionFieldData = {
      index: this.expressionFields.length + 1,
      fieldKey: `field${this.expressionFields.length + 1}`,
      ref: '',
      allowedAreaTypes: [AreaTypeEnum.stepForm, AreaTypeEnum.case]
    };
    if (existingData) {
      newField = {
        ...newField,
        ...existingData
      };
    }
    this.expressionFields.push(newField);
  }

  populateStepsData(): void {
    this.store
      .select(workflowProcessStepLinkList)
      .pipe(take(1))
      .subscribe(async (links) => {
        if (links && links.length) {
          this.links = [...links];
          let stepPromises = links.map((link) => {
            return this.processStepEntityService.get(this.tenant, link.processStepEntityId);
          });
          Promise.all(stepPromises)
            .then((stepsData: ProcessStepEntityDto[]) => {
              let stepDataWithRefname: StepDataWithRefName[] = [];
              stepsData.forEach((step, index) => {
                stepDataWithRefname.push({
                  ...step,
                  refName: links[index].refName
                });
              });
              // if we are adding a new link
              if (!links.find((l) => l.processStepEntityId === this.currentProcessStep.id)) {
                stepDataWithRefname.push({
                  ...this.currentProcessStep,
                  refName: convertFieldName(this.currentProcessStep.name)
                });
              }

              this.steps = [...stepDataWithRefname];
            })
            .catch((error) => {
              console.log(error);
            });
        }
      });
  }

  checkFieldTypes(data: MathExpressionOutput): void {
    let referenceType: FieldTypeIds;
    if ((data.processStepFields || data.caseFields) && (data.processStepResultField || data.caseResultField)) {
      if (data.processStepFields) {
        referenceType = Object.values(data.processStepFields)[0].type;
      } else if (data.caseFields) {
        referenceType = Object.values(data.caseFields)[0].type;
      } else if (data.processStepResultField) {
        referenceType = data.processStepResultField.type;
      } else if (data.caseResultField) {
        referenceType = data.caseResultField.type;
      }

      if (data.processStepFields) {
        const allFields = Object.values(data.processStepFields);
        if (!allFields.every((a) => a.type === referenceType)) {
          data.isValid = false;
          this.showInvalidFieldMessage();
        }
      }
      if (data.caseFields) {
        const allFields = Object.values(data.caseFields);
        if (!allFields.every((a) => a.type === referenceType)) {
          data.isValid = false;
          this.showInvalidFieldMessage();
        }
      }
      if (data.processStepResultField && data.processStepResultField.type && referenceType !== data.processStepResultField.type) {
        data.isValid = false;
        this.showInvalidFieldMessage();
      }
      if (data.caseResultField && data.caseResultField.type && referenceType !== data.caseResultField.type) {
        data.isValid = false;
        this.showInvalidFieldMessage();
      }
      const dataAfterRemovingType = this.removeFieldTypeFormData(cloneDeep(data));
      this.outputEmitter.emit(dataAfterRemovingType);
    }
  }

  showInvalidFieldMessage(): void {
    this.snackbar.open(this.ts.instant('Field types should be same'), 'Ok', { duration: 3000 });
  }

  removeFieldTypeFormData(data: MathExpressionOutput): MathExpressionOutput {
    if (data.processStepFields) {
      Object.values(data.processStepFields).forEach((field) => {
        delete field.type;
      });
    }
    if (data.caseFields) {
      Object.values(data.caseFields).forEach((field) => delete field.type);
    }
    if (data.processStepResultField) {
      delete data.processStepResultField.type;
    }
    if (data.caseResultField) {
      delete data.caseResultField.type;
    }
    return data;
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.outputEmitter.emit(null);
  }
}
