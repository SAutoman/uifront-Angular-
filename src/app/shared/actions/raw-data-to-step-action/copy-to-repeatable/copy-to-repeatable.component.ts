import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import {
  AreaTypeEnum,
  FieldTypeIds,
  LinkedRawDataSettings,
  ProcessStepEntityService,
  ProcessStepLinkDto,
  WorkflowDto
} from '@wfm/service-layer';
import { SourceToDestinationWithPath } from '@wfm/service-layer/models/actionDto';
import { FieldPathInput, FieldPathOutput, PropertyPathExtended } from '../../field-path-generator/FieldPathModels';
import { cloneDeep } from 'lodash-core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { workflowProcessStepLinkList } from '@wfm/store/workflow-builder';
import { takeUntil } from 'rxjs/operators';
import { pathSeparator } from '../../field-path-generator/field-path-generator.component';
import { StepDataWithRefName } from '../../difference-calculation-action/difference-calculation-action.component';
import { ProcessStepPath } from '@wfm/service-layer/models/expressionModel';

interface SourceToDestinationFieldPathInputs {
  source: FieldPathInput;
  destination: FieldPathInput;
}

export interface CopyToRepeatableData {
  sourceToDestination: SourceToDestinationWithPath[];
  isValid: boolean;
}

interface SelectOptions {
  id: string;
  refName: string;
  value: ProcessStepLinkDto;
}
@Component({
  selector: 'app-copy-to-repeatable',
  templateUrl: './copy-to-repeatable.component.html',
  styleUrls: ['./copy-to-repeatable.component.scss']
})
export class CopyToRepeatableComponent extends TenantComponent implements OnInit {
  @Input() actionDto: CopyToRepeatableData;
  @Input() workflow: WorkflowDto;
  @Output() outputEmitter: EventEmitter<CopyToRepeatableData> = new EventEmitter();
  sourceTitle: string;
  destinationTitle: string;

  stepSelector = new FormControl('', Validators.required);
  selectedStep: ProcessStepLinkDto;
  linkedRawDataSettings: LinkedRawDataSettings;

  repeatableSteps: SelectOptions[] = [];

  sourceToDestinationFieldPathInputs: SourceToDestinationFieldPathInputs[];

  steps: StepDataWithRefName[] = [];

  copyToRepeatableOutput: CopyToRepeatableData;

  constructor(
    private snackbar: MatSnackBar,
    private ts: TranslateService,
    private store: Store<ApplicationState>,
    private processStepEntityService: ProcessStepEntityService
  ) {
    super(store);
  }

  ngOnInit(): void {
    this.store
      .select(workflowProcessStepLinkList)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(async (links) => {
        if (links && links.length) {
          for (const stepLink of links) {
            if (stepLink.processStepLinkRepeatableSettings?.isRepeatable) {
              const stepEnt = await this.processStepEntityService.get(this.tenant, stepLink.processStepEntityId);
              this.steps.push({
                ...stepEnt,
                refName: stepLink.refName
              });
              this.repeatableSteps.push({
                refName: stepLink.refName,
                id: stepLink.processStepEntityId,
                value: stepLink
              });
            }
          }
          this.subscribeToFormChanges();
          this.initData();
        }
      });
  }

  subscribeToFormChanges(): void {
    this.stepSelector.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((stepRefName) => {
      if (stepRefName && this.selectedStep && this.selectedStep.refName !== stepRefName) {
        this.resetSourceToDestinationData();
        this.emitToParent;
      }
      this.selectedStep = this.repeatableSteps.find((step) => step.refName === stepRefName)?.value;
      if (this.selectedStep) {
        this.linkedRawDataSettings = this.selectedStep.processStepLinkRepeatableSettings.linkedRawDataSettings;

        if (!this.actionDto?.sourceToDestination?.length && !this.sourceToDestinationFieldPathInputs?.length) {
          this.addNewSourceToDestination();
        }
      }
    });
  }

  initData(): void {
    this.sourceTitle = this.ts.instant('Which RawData Field To Copy');
    this.destinationTitle = this.ts.instant('In Which Step Field To Paste');
    if (this.actionDto) {
      this.copyToRepeatableOutput = {
        sourceToDestination: cloneDeep(this.actionDto.sourceToDestination),
        isValid: true
      };

      const refName = (<ProcessStepPath>this.actionDto.sourceToDestination[0]?.destination)?.processStepRefName;
      this.stepSelector.setValue(refName);
      this.sourceToDestinationFieldPathInputs = [];

      this.actionDto.sourceToDestination?.forEach((sourceToDestination: SourceToDestinationWithPath) => {
        this.addNewSourceToDestination(sourceToDestination);
      });
    } else {
      this.resetSourceToDestinationData();
    }
  }

  resetSourceToDestinationData(): void {
    this.sourceToDestinationFieldPathInputs = [];

    this.copyToRepeatableOutput = {
      sourceToDestination: [],
      isValid: false
    };
  }

  sourcePathUpdated(fieldPathData: FieldPathOutput, index: number): void {
    if (fieldPathData) {
      if (!this.copyToRepeatableOutput.sourceToDestination[index]) {
        this.copyToRepeatableOutput.sourceToDestination[index] = {
          source: null,
          destination: null
        };
      }
      const currentGroup = this.copyToRepeatableOutput.sourceToDestination[index];
      currentGroup.source = fieldPathData.fieldPaths && fieldPathData.fieldPaths[0];
      if (fieldPathData.fieldPaths && fieldPathData.fieldPaths[0]?.type)
        this.copyToRepeatableOutput.sourceToDestination[index].source.type = fieldPathData.fieldPaths[0].type;
      this.checkActionDataValidityAndEmit();
    } else this.emitToParent();
  }

  destinationPathUpdated(fieldPathData: FieldPathOutput, index: number): void {
    if (fieldPathData) {
      if (!this.copyToRepeatableOutput.sourceToDestination[index]) {
        this.copyToRepeatableOutput.sourceToDestination[index] = {
          source: null,
          destination: null
        };
      }
      const currentGroup = this.copyToRepeatableOutput.sourceToDestination[index];
      currentGroup.destination = fieldPathData.fieldPaths && fieldPathData.fieldPaths[0];
      if (fieldPathData.fieldPaths && fieldPathData.fieldPaths[0]?.type)
        this.copyToRepeatableOutput.sourceToDestination[index].destination.type = fieldPathData.fieldPaths[0].type;
      this.checkActionDataValidityAndEmit();
    } else this.emitToParent();
  }

  addNewSourceToDestination(existingSourceToDestination?: SourceToDestinationWithPath): void {
    const rawDataRefPath = this.linkedRawDataSettings?.linkedRawDataReference?.path;

    let sourceField: FieldPathInput = {
      fieldKey: `source${this.sourceToDestinationFieldPathInputs.length + 1}`,
      allowedAreaTypes: [AreaTypeEnum.rawData],
      entityRefName: rawDataRefPath?.join(pathSeparator),
      disableEntitySelector: true
    };
    let destinationField: FieldPathInput = {
      fieldKey: `destination${this.sourceToDestinationFieldPathInputs.length + 1}`,
      allowedAreaTypes: [AreaTypeEnum.stepForm],
      entityRefName: this.selectedStep.refName,
      disableEntitySelector: true
    };

    if (existingSourceToDestination) {
      const sourceFieldPath = cloneDeep(existingSourceToDestination.source);
      this.normalizeRawDataFieldPath(sourceFieldPath, rawDataRefPath);

      sourceField = {
        ...sourceField,
        entityType: AreaTypeEnum.rawData,
        fieldPaths: [sourceFieldPath]
      };

      destinationField = {
        ...destinationField,
        entityType: AreaTypeEnum.stepForm,
        fieldPaths: [cloneDeep(existingSourceToDestination.destination)]
      };
    }

    this.sourceToDestinationFieldPathInputs.push({
      source: sourceField,
      destination: destinationField
    });
    this.checkActionDataValidityAndEmit();
  }

  normalizeRawDataFieldPath(sourceFieldPath: PropertyPathExtended, rawDataRefPath: string[]): void {
    //sourceFieldPath may include items from rawDataRefPath, the are to be removed
    rawDataRefPath.forEach((pathSplit) => {
      if (sourceFieldPath.path[0] === pathSplit) {
        sourceFieldPath.path.splice(0, 1);
      }
    });
  }

  removeSourceToDestination(index: number): void {
    this.sourceToDestinationFieldPathInputs.splice(index, 1);
    this.copyToRepeatableOutput.sourceToDestination.splice(index, 1);
    this.checkActionDataValidityAndEmit();
  }

  checkActionDataValidityAndEmit(): void {
    let isValid = true;
    const sourceToDestination = this.copyToRepeatableOutput.sourceToDestination;
    if (sourceToDestination.length > 0) {
      for (let index = 0; index < sourceToDestination.length; index++) {
        const currentGroup = sourceToDestination[index];
        if (currentGroup.source && currentGroup.destination) {
          if (currentGroup.source.type && currentGroup.destination.type && currentGroup.source.type !== currentGroup.destination.type) {
            isValid = false;
            if (currentGroup.source.type === FieldTypeIds.StringField && currentGroup.destination.type === FieldTypeIds.RichTextField) {
              isValid = true;
            } else this.snackbar.open(this.ts.instant('Source and Destination should have a same field type'), 'Ok', { duration: 3000 });
            break;
          }
        } else {
          isValid = false;
        }
      }
    }

    if (!sourceToDestination.length) {
      isValid = false;
    }
    this.copyToRepeatableOutput.isValid = isValid;
    this.emitToParent();
  }

  emitToParent(): void {
    this.outputEmitter.emit(this.copyToRepeatableOutput);
  }
}
