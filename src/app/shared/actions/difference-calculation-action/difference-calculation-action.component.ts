import { Component, Input, OnInit, EventEmitter, Output, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
import { DifferenceCalculationEventDto } from '@wfm/service-layer/models/actionDto';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { workflowProcessStepLinkList } from '@wfm/store/workflow-builder';
import { take, takeUntil } from 'rxjs/operators';
import { DiffActionData } from '../actions.component';
import { FieldPathInput, FieldPathOutput, PropertyPathExtended } from '../field-path-generator/FieldPathModels';
import { TranslateService } from '@ngx-translate/core';

export interface StepDataWithRefName extends ProcessStepEntityDto {
  refName: string;
}

/**
 * component nests path generators for First Step, Second Step and Result field,
 * gets the output back and stores them in the respective formControls and emits it up to parent component
 */

@Component({
  selector: 'app-difference-calculation-action',
  templateUrl: './difference-calculation-action.component.html',
  styleUrls: ['./difference-calculation-action.component.scss']
})
export class DifferenceCalculationActionComponent extends TenantComponent implements OnInit, OnDestroy {
  @Input() workflow: WorkflowDto;
  @Input() actionDto: DifferenceCalculationEventDto;
  @Input() currentProcessStep?: ProcessStepEntityDto;
  @Output() outputEmitter: EventEmitter<DiffActionData> = new EventEmitter();
  links: ProcessStepLinkDto[];
  steps: StepDataWithRefName[];

  actionForm: FormGroup;
  minuendData: FieldPathInput = {
    fieldKey: 'secondStep',
    allowedAreaTypes: [AreaTypeEnum.stepForm]
  };
  subtrahendData: FieldPathInput = {
    fieldKey: 'firstStep',
    allowedAreaTypes: [AreaTypeEnum.stepForm]
  };
  resultData: FieldPathInput = {
    fieldKey: 'resultField',
    allowedAreaTypes: [AreaTypeEnum.case, AreaTypeEnum.rawData, AreaTypeEnum.stepForm]
  };
  allowedTypes: FieldTypeIds[] = [FieldTypeIds.IntField, FieldTypeIds.DecimalField];

  get subtrahend() {
    if (this.actionForm?.get('firstStep')?.value?.path?.length) {
      return this.actionForm.get('firstStep').value.path.join(': ');
    }
    return '____';
  }

  get minuend() {
    if (this.actionForm?.get('secondStep')?.value?.path?.length) {
      return this.actionForm.get('secondStep').value.path.join(': ');
    }
    return '____';
  }

  get result() {
    if (this.actionForm?.get('caseResultField')?.value) {
      return this.actionForm.get('caseResultField').value;
    } else if (this.actionForm?.get('rawdataResultField')?.value) {
      return this.actionForm.get('rawdataResultField').value?.path.join(': ');
    } else if (this.actionForm?.get('stepResultField')?.value) {
      return this.actionForm.get('stepResultField').value?.path.join(': ');
    }
    return '____';
  }

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
    this.populateStepsData();
    this.actionForm = this.fb.group({
      firstStep: [null, Validators.required],
      secondStep: [null, Validators.required],
      resultField: [null, Validators.required],
      caseResultField: [null],
      rawdataResultField: [null],
      stepResultField: [null]
    });
    this.actionForm.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((formData) => {
      let areAllFieldTypesSame: boolean = this.checkIfAllFieldTypesAreSame(formData);
      let outputData: DiffActionData = {
        ...formData,
        caseResultField: formData?.caseResultField,
        rawdataResultField: formData?.rawdataResultField,
        stepResultField: formData?.stepResultField,
        isValid: areAllFieldTypesSame
      };
      const dataAfterRemovingType = this.removeFieldTypeFormData(cloneDeep(outputData));
      this.outputEmitter.emit(dataAfterRemovingType);
    });
    if (this.actionDto) {
      this.updateFormData();
    }
  }

  removeFieldTypeFormData(data: DiffActionData): DiffActionData {
    if (data?.firstStep) {
      delete data.firstStep.type;
    }
    if (data?.secondStep) {
      delete data.secondStep.type;
    }
    if (data?.caseResultField) {
      delete data['resultFieldType'];
      delete data['resultField'];
      delete data['rawdataResultField'];
      delete data['stepResultField'];
    }
    if (data?.rawdataResultField) {
      delete data['resultFieldType'];
      delete data['resultField'];
      delete data['caseResultField'];
      delete data['stepResultField'];
    }
    if (data?.stepResultField) {
      delete data['resultFieldType'];
      delete data['resultField'];
      delete data['rawdataResultField'];
      delete data['caseResultField'];
    }
    return data;
  }

  checkIfAllFieldTypesAreSame(formData: any): boolean {
    if (
      formData?.firstStep &&
      formData?.secondStep &&
      (formData?.caseResultField || formData?.rawdataResultField || formData?.stepResultField)
    ) {
      const resultFieldType = this.actionForm.controls?.resultFieldType?.value;
      if (formData.firstStep.type && formData.secondStep.type && resultFieldType) {
        if (formData.firstStep.type === formData.secondStep.type && formData.firstStep.type === resultFieldType) return true;
        else this.snackbar.open(this.ts.instant('Field types should be same'), 'Ok', { duration: 3000 });
      }
    } else return false;
  }

  updateFormData() {
    this.actionForm.patchValue(
      {
        firstStep: cloneDeep(this.actionDto.firstStep),
        secondStep: cloneDeep(this.actionDto.secondStep),
        resultField: cloneDeep(this.actionDto?.caseResultField || this.actionDto?.rawdataResultField || this.actionDto?.stepResultField),
        caseResultField: cloneDeep(this.actionDto?.caseResultField),
        rawdataResultField: cloneDeep(this.actionDto?.rawdataResultField),
        stepResultField: cloneDeep(this.actionDto?.stepResultField)
      },
      { onlySelf: false }
    );

    this.minuendData = {
      ...this.minuendData,
      entityType: AreaTypeEnum.stepForm,
      fieldPaths: [cloneDeep(this.actionDto.secondStep)]
    };

    this.subtrahendData = {
      ...this.subtrahendData,
      entityType: AreaTypeEnum.stepForm,
      fieldPaths: [cloneDeep(this.actionDto.firstStep)]
    };
    const resultFieldData = this.actionDto?.caseResultField || this.actionDto?.rawdataResultField || this.actionDto?.stepResultField;
    const entityType: AreaTypeEnum = this.getEntityType();
    this.resultData = {
      ...this.resultData,
      entityType: entityType,
      fieldPaths: [
        entityType === AreaTypeEnum.case
          ? {
              path: [cloneDeep(resultFieldData)]
            }
          : cloneDeep(resultFieldData)
      ]
    };
  }

  getEntityType(): AreaTypeEnum {
    if (this.actionDto?.caseResultField) return AreaTypeEnum.case;
    if (this.actionDto?.rawdataResultField) return AreaTypeEnum.rawData;
    if (this.actionDto?.stepResultField) return AreaTypeEnum.stepForm;
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

  fieldPathUpdated(outputData: FieldPathOutput) {
    if (outputData?.fieldKey) {
      let fieldValue: PropertyPathExtended | string = outputData.fieldPaths && outputData.fieldPaths[0];
      //reset values

      this.actionForm.patchValue(
        {
          caseResultField: null,
          rawdataResultField: null,
          stepResultField: null,
          resultField: null,
          resultFieldType: null
        },
        { emitEvent: false }
      );

      if (fieldValue && outputData.entityType) {
        // in DifferenceCalculationEventDto, caseResultField is a string (it shall be one of the case fields)
        if (outputData.entityType === AreaTypeEnum.case) fieldValue = fieldValue.path[0];
        if (!this.actionForm.controls.resultFieldType) {
          this.actionForm.addControl('resultFieldType', new FormControl(outputData.fieldPaths[0].type));
        } else this.actionForm.controls.resultFieldType.patchValue(outputData.fieldPaths[0].type, { emitEvent: false });
        this.actionForm.patchValue(
          {
            resultFieldType: outputData.fieldPaths[0].type
          },
          { emitEvent: false }
        );
      }
      if (outputData.fieldKey === this.resultData.fieldKey) {
        if (outputData.entityType === AreaTypeEnum.case)
          this.actionForm.controls.caseResultField.patchValue(fieldValue, { emitEvent: false });
        else if (outputData.entityType === AreaTypeEnum.rawData)
          this.actionForm.controls.rawdataResultField.patchValue(fieldValue, { emitEvent: false });
        else if (outputData.entityType === AreaTypeEnum.stepForm)
          this.actionForm.controls.stepResultField.patchValue(fieldValue, { emitEvent: false });
      }
      this.actionForm.patchValue({
        [outputData.fieldKey]: fieldValue || null
      });
    }
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.outputEmitter.emit(null);
  }
}
