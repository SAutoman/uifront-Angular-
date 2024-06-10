/**
 * global
 */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { cloneDeep } from 'lodash-core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

/**
 * project
 */
import {
  WorkflowDto,
  ProcessStepLinkDto,
  ProcessStepEntityDto,
  ProcessStepEntityService,
  AreaTypeEnum,
  FieldTypeIds,
  DynamicEntitiesService
} from '@wfm/service-layer';
import {
  CopyDataBetweenEntitiesEventDto,
  DestinationFieldManipulation,
  EventAreaScopes,
  EventTypes,
  SourceToDestinationWithPath,
  StepToRawDataEventDto
} from '@wfm/service-layer/models/actionDto';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store';
import { workflowProcessStepLinkList } from '@wfm/store/workflow-builder';
/**
 * local
 */
import { StepDataWithRefName } from '../difference-calculation-action/difference-calculation-action.component';
import { FieldPathInput, FieldPathOutput, PropertyPathExtended } from '../field-path-generator/FieldPathModels';
import { BaseFieldValueType, ListValue } from '@wfm/service-layer/models/FieldValueDto';
import { FormBuilder, FormControl } from '@angular/forms';
import { IConfigurableListItem, IFormlyView } from '@wfm/common/models';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormVariableDto, FormlyFieldAdapterFactory } from '@wfm/common/vendor';
import { adapterToConfig } from '@wfm/forms-flow-struct/form-rule-builder/fields';
import { isUndefinedOrNull } from '@wfm/shared/utils';
import { LinkData } from '@wfm/tenant-admin/workflows/create-process-step-links/create-process-step-links.component';
import { pathSeparator } from '../field-path-generator/field-path-generator.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmActionData } from '@wfm/service-layer/models/confirm-action';
import { ConfirmActionComponent } from '@wfm/workflow-state/confirm-action/confirm-action.component';
import { MatCheckboxChange } from '@angular/material/checkbox';

export interface CopyActionData {
  type: EventTypes;
  sourceToDestination: SourceToDestinationWithPath[];
  destinationFieldManipulations: DestinationFieldManipulation[];
  isCopyAsRepeatableEnabled?: boolean;
  isValid: boolean;
}
interface SourceToDestinationFieldPathInputs {
  source: FieldPathInput;
  destination: FieldPathInput;
}

interface DestinationFieldManipulationInput {
  destination: FieldPathInput;
  value: BaseFieldValueType;
  fieldValueFormlyView?: IFormlyView;
}

@Component({
  selector: 'app-copy-fields-action',
  templateUrl: './copy-fields-action.component.html',
  styleUrls: ['./copy-fields-action.component.scss']
})
export class CopyFieldsActionComponent extends TenantComponent implements OnInit {
  @Input() type: EventTypes;
  @Input() workflow: WorkflowDto;
  @Input() actionDto: CopyDataBetweenEntitiesEventDto;
  @Input() actionScope?: EventAreaScopes;
  @Input() stepLinkData?: LinkData;
  @Output() outputEmitter: EventEmitter<CopyActionData> = new EventEmitter();
  links: ProcessStepLinkDto[];
  steps: StepDataWithRefName[];

  destinationFieldManipulationInputs: DestinationFieldManipulationInput[] = [];

  sourceToDestinationFieldPathInputs: SourceToDestinationFieldPathInputs[] = [];
  copyActionOutputData: CopyActionData;
  sourceTitle: string;
  destinationTitle: string;
  destinationManipulationTitle: string;
  showCopyFieldArea: boolean = false;

  enableRepeatableCopyingControl: FormControl;
  get eventTypes() {
    return EventTypes;
  }

  constructor(
    private store: Store<ApplicationState>,
    private processStepEntityService: ProcessStepEntityService,
    private snackbar: MatSnackBar,
    private ts: TranslateService,
    private fb: FormBuilder,
    private dynamicEntitiesService: DynamicEntitiesService,
    private dialog: MatDialog
  ) {
    super(store);
  }

  ngOnInit() {
    this.populateTitles();
    this.populateStepsData();
    if (this.type === EventTypes.StepToRawData) {
      this.enableRepeatableCopyingControl = new FormControl(false);
    }

    this.copyActionOutputData = {
      sourceToDestination: [],
      destinationFieldManipulations: [],
      isValid: false,
      type: this.type
    };
    if (this.actionDto) {
      this.populateActionData();
    }
    this.emitToParent();
  }

  populateTitles(): void {
    switch (this.type) {
      case EventTypes.StepToCase:
        this.sourceTitle = this.ts.instant('Which Step Field To Copy');
        this.destinationTitle = this.ts.instant('In Which Case Field To Paste');
        this.destinationManipulationTitle = this.ts.instant('Which Case Field To Update');
        break;
      case EventTypes.StepToRawData:
        this.sourceTitle = this.ts.instant('Which Step Field To Copy');
        this.destinationTitle = this.ts.instant('In Which RawData Field To Paste');
        this.destinationManipulationTitle = this.ts.instant('Which RawData Field To Update');

        break;
      case EventTypes.RawDataToCase:
        this.sourceTitle = this.ts.instant('Which RawData Field To Copy');
        this.destinationTitle = this.ts.instant('In Which Case Field To Paste');
        this.destinationManipulationTitle = this.ts.instant('Which Case Field To Update');

        break;
      case EventTypes.CaseToStep:
        this.sourceTitle = this.ts.instant('Which Case Field To Copy');
        this.destinationTitle = this.ts.instant('In Which Step Field To Paste');
        this.destinationManipulationTitle = this.ts.instant('Which Step Field To Update');
        break;

      default:
        break;
    }
  }

  populateActionData(): void {
    if (this.type === EventTypes.StepToRawData) {
      this.updateEnableRepeatableCopyingControl();
    }
    if (this.actionDto.sourceToDestination?.length) {
      this.actionDto.sourceToDestination.forEach((sourceToDestination: SourceToDestinationWithPath) => {
        this.addNewSourceToDestination(sourceToDestination);
      });
    }
    if (this.actionDto.destinationFieldManipulations?.length) {
      this.actionDto.destinationFieldManipulations.forEach((destinationFieldManipulation: DestinationFieldManipulation) => {
        this.addNewDestinationManipulation(destinationFieldManipulation);
      });
    }
  }

  addNewDestinationManipulation(existingDestination?: DestinationFieldManipulation): void {
    let destinationType;
    switch (this.type) {
      case EventTypes.StepToCase:
        destinationType = AreaTypeEnum.case;
        break;
      case EventTypes.StepToRawData:
        destinationType = AreaTypeEnum.rawData;
        break;
      case EventTypes.RawDataToCase:
        destinationType = AreaTypeEnum.case;
        break;
      case EventTypes.CaseToStep:
        destinationType = AreaTypeEnum.stepForm;
        break;
      default:
        break;
    }

    let destinationField: FieldPathInput = {
      fieldKey: `destinationManipulation${this.destinationFieldManipulationInputs.length + 1}`,
      allowedAreaTypes: [destinationType]
    };

    // for repeatableStep copy mode, destination can be only the  rawData schema linked to repeatable step

    if (this.stepLinkData && this.type === EventTypes.StepToRawData && this.enableRepeatableCopyingControl.value) {
      const rawDataRefPath = this.stepLinkData.repeatableSettings?.linkedRawDataSettings?.linkedRawDataReference?.path;

      destinationField = {
        ...destinationField,
        entityRefName: rawDataRefPath?.join(pathSeparator),
        entityType: AreaTypeEnum.rawData,
        disableEntitySelector: true
      };
    }

    if (existingDestination) {
      destinationField = {
        ...destinationField,
        entityType: destinationType,
        fieldPaths: [cloneDeep(existingDestination.destination)]
      };
    }
    this.destinationFieldManipulationInputs.push({
      value: !isUndefinedOrNull(existingDestination?.value) ? existingDestination?.value : null,
      destination: destinationField,
      fieldValueFormlyView: null
    });
    this.checkActionDataValidityAndEmit();
  }

  removeDestinationManipulation(index: number): void {
    this.destinationFieldManipulationInputs.splice(index, 1);
    this.copyActionOutputData.destinationFieldManipulations.splice(index, 1);
    this.checkActionDataValidityAndEmit();
  }

  addNewSourceToDestination(existingSourceToDestination?: SourceToDestinationWithPath): void {
    let sourceType;
    let destinationType;
    switch (this.type) {
      case EventTypes.StepToCase:
        sourceType = AreaTypeEnum.stepForm;
        destinationType = AreaTypeEnum.case;
        break;
      case EventTypes.StepToRawData:
        sourceType = AreaTypeEnum.stepForm;
        destinationType = AreaTypeEnum.rawData;
        break;
      case EventTypes.RawDataToCase:
        sourceType = AreaTypeEnum.rawData;
        destinationType = AreaTypeEnum.case;
        break;
      case EventTypes.CaseToStep:
        sourceType = AreaTypeEnum.case;
        destinationType = AreaTypeEnum.stepForm;
        break;
      default:
        break;
    }
    let sourceField: FieldPathInput = {
      fieldKey: `source${this.sourceToDestinationFieldPathInputs.length + 1}`,
      allowedAreaTypes: [sourceType]
    };
    let destinationField: FieldPathInput = {
      fieldKey: `destination${this.sourceToDestinationFieldPathInputs.length + 1}`,
      allowedAreaTypes: [destinationType]
    };
    // for repeatableStep copy mode, copying can be done FROM the repeatable step TO the linked rawData schema

    if (this.stepLinkData && this.type === EventTypes.StepToRawData && this.enableRepeatableCopyingControl.value) {
      sourceField = {
        ...sourceField,
        entityRefName: this.stepLinkData.refName,
        entityType: AreaTypeEnum.stepForm,
        disableEntitySelector: true
      };
      const rawDataRefPath = this.stepLinkData.repeatableSettings?.linkedRawDataSettings?.linkedRawDataReference?.path;

      destinationField = {
        ...destinationField,
        entityRefName: rawDataRefPath?.join(pathSeparator),
        entityType: AreaTypeEnum.rawData,
        disableEntitySelector: true
      };
    }

    if (existingSourceToDestination) {
      sourceField = {
        ...sourceField,
        entityType: sourceType,
        fieldPaths: [cloneDeep(existingSourceToDestination.source)]
      };

      const destFieldPath = cloneDeep(existingSourceToDestination.destination);

      // for repeatable copy, remove rawDataRef pathsplits from fieldPath
      if (this.stepLinkData && this.type === EventTypes.StepToRawData && this.enableRepeatableCopyingControl.value) {
        this.normalizeRawDataFieldPath(
          destFieldPath,
          this.stepLinkData.repeatableSettings?.linkedRawDataSettings?.linkedRawDataReference?.path
        );
      }

      destinationField = {
        ...destinationField,
        entityType: destinationType,
        fieldPaths: [destFieldPath]
      };
    }

    this.sourceToDestinationFieldPathInputs.push({
      source: sourceField,
      destination: destinationField
    });
    this.checkActionDataValidityAndEmit();
  }

  normalizeRawDataFieldPath(sourceFieldPath: PropertyPathExtended, rawDataRefPath: string[]): void {
    //for rawData fields, the fieldPath may include items from rawDataRefPath, the are to be removed
    rawDataRefPath.forEach((pathSplit) => {
      if (sourceFieldPath.path[0] === pathSplit) {
        sourceFieldPath.path.splice(0, 1);
      }
    });
  }

  removeSourceToDestination(index: number): void {
    this.sourceToDestinationFieldPathInputs.splice(index, 1);
    this.copyActionOutputData.sourceToDestination.splice(index, 1);
    this.checkActionDataValidityAndEmit();
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

              this.steps = [...stepDataWithRefname];
              // if (this.actionScope && this.steps?.length) ]
              this.showCopyFieldArea = true;
            })
            .catch((error) => {
              console.log(error);
            });
        } else {
          this.showCopyFieldArea = true;
        }
      });
  }

  sourcePathUpdated(fieldPathData: FieldPathOutput, index: number): void {
    if (fieldPathData) {
      if (!this.copyActionOutputData.sourceToDestination[index]) {
        this.copyActionOutputData.sourceToDestination[index] = {
          source: null,
          destination: null
        };
      }
      const currentGroup = this.copyActionOutputData.sourceToDestination[index];
      currentGroup.source = fieldPathData.fieldPaths && fieldPathData.fieldPaths[0];
      if (fieldPathData.fieldPaths && fieldPathData.fieldPaths[0]?.type)
        this.copyActionOutputData.sourceToDestination[index].source.type = fieldPathData.fieldPaths[0].type;
      this.checkActionDataValidityAndEmit();
    } else this.emitToParent();
  }

  destinationPathUpdated(fieldPathData: FieldPathOutput, index: number, isDestinationManipulation?: boolean): void {
    if (fieldPathData) {
      if (!isDestinationManipulation) {
        if (!this.copyActionOutputData.sourceToDestination[index]) {
          this.copyActionOutputData.sourceToDestination[index] = {
            source: null,
            destination: null
          };
        }
        const currentGroup = this.copyActionOutputData.sourceToDestination[index];
        currentGroup.destination = fieldPathData.fieldPaths && fieldPathData.fieldPaths[0];
        if (fieldPathData.fieldPaths && fieldPathData.fieldPaths[0]?.type)
          this.copyActionOutputData.sourceToDestination[index].destination.type = fieldPathData.fieldPaths[0].type;
        this.checkActionDataValidityAndEmit();
      } else {
        // new destinationFieldManipulations implementation

        if (!this.copyActionOutputData.destinationFieldManipulations[index]) {
          this.copyActionOutputData.destinationFieldManipulations[index] = {
            value: null,
            destination: null
          };
        }
        const currentGroup = this.copyActionOutputData.destinationFieldManipulations[index];
        const currentInputBaseFieldValue = this.destinationFieldManipulationInputs[index]?.value;

        currentGroup.destination = fieldPathData.fieldPaths && fieldPathData.fieldPaths[0];
        currentGroup.value = {
          value: null,
          type: fieldPathData.fieldPaths && fieldPathData.fieldPaths[0]?.field?.type,
          id: fieldPathData.fieldPaths && fieldPathData.fieldPaths[0]?.field?.fieldName
        };

        if (currentInputBaseFieldValue && currentGroup && currentInputBaseFieldValue?.id === currentGroup.value.id) {
          if (currentInputBaseFieldValue.type === FieldTypeIds.ListField) {
            // map the list value for UI
            currentGroup.value.value = (<ListValue>currentInputBaseFieldValue.value)?.listItemId
              ? (<ListValue>currentInputBaseFieldValue.value)?.listItemId
              : currentInputBaseFieldValue.value;
          } else {
            currentGroup.value.value = currentInputBaseFieldValue.value;
          }
        }

        this.fieldSelected(fieldPathData, index, currentGroup.value.value);
        if (fieldPathData.fieldPaths && fieldPathData?.fieldPaths[0]?.type) {
          currentGroup.destination.type = fieldPathData.fieldPaths[0].type;
          currentGroup.value.type = fieldPathData.fieldPaths[0].type;
        }
        this.checkActionDataValidityAndEmit();
      }
    } else this.emitToParent();
  }

  fieldValueUpdated(fieldValueData: BaseFieldValueType, index: number) {
    const group = this.copyActionOutputData.destinationFieldManipulations[index];
    // this.destinationFieldManipulationInputs[index].value = fieldValueData;
    if (!group) {
      this.copyActionOutputData.destinationFieldManipulations[index] = {
        value: null,
        destination: null
      };
    }
    let formattedValue = cloneDeep(fieldValueData.value);
    formattedValue = this.dynamicEntitiesService.mapFieldTypeToBaseFieldValue(group.value.type, fieldValueData.value);

    group.value.value = formattedValue;

    this.checkActionDataValidityAndEmit();
  }

  checkActionDataValidityAndEmit(): void {
    let isValid = true;
    const sourceToDestination = this.copyActionOutputData.sourceToDestination;
    const destinationManipulations = this.copyActionOutputData.destinationFieldManipulations;
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

    if (destinationManipulations.length > 0) {
      for (let index = 0; index < destinationManipulations.length; index++) {
        const currentGroup = destinationManipulations[index];
        if (!currentGroup.destination) {
          isValid = false;
          break;
        }
      }
    }

    if (!sourceToDestination.length && !destinationManipulations.length) {
      isValid = false;
    }
    this.copyActionOutputData.isValid = isValid;
    this.emitToParent();
  }

  emitToParent(): void {
    const dataAfterRemovingType = this.clearExtraData(cloneDeep(this.copyActionOutputData));

    if (this.type === EventTypes.StepToRawData) {
      dataAfterRemovingType.isCopyAsRepeatableEnabled = this.enableRepeatableCopyingControl.value;
    }

    this.outputEmitter.emit(dataAfterRemovingType);
  }

  clearExtraData(data: CopyActionData): CopyActionData {
    if (data.sourceToDestination?.length > 0) {
      data.sourceToDestination.forEach((group) => {
        if (group?.source?.type && group?.destination?.type) {
          delete group.source.type;
          delete group.destination.type;
        }
      });
    }
    if (data.destinationFieldManipulations?.length > 0) {
      data.destinationFieldManipulations.forEach((group) => {
        if (group.destination) {
          delete group.destination.type;
          delete group.destination.field;
        }
        if (group?.value?.type === FieldTypeIds.ListField) {
          if (!group?.value?.value?.hasOwnProperty('listItemId')) {
            let formattedValue = cloneDeep(group.value);
            formattedValue = this.dynamicEntitiesService.mapFieldTypeToBaseFieldValue(group.value.type, group.value.value);
            group.value.value = formattedValue;
          }
        }
      });
    }
    return data;
  }

  fieldSelected(selection: FieldPathOutput, groupIndex: number, existingValue?: any): void {
    if (selection?.fieldPaths?.length) {
      const field = selection?.fieldPaths[0].field;
      const sampleValueField = this.createSampleValueField('value', existingValue, field);

      this.destinationFieldManipulationInputs[groupIndex].fieldValueFormlyView = {
        fields: [sampleValueField],
        form: this.fb.group({}),
        model: {}
      };
    }
  }

  createSampleValueField(key: string, value: any, field: IConfigurableListItem, cssClass: string = 'col-11 mx-auto'): FormlyFieldConfig {
    const dto: FormVariableDto = {
      label: this.ts.instant('Enter Value'),
      name: key,
      type: field?.type || FieldTypeIds.StringField,
      value: value,
      required: false,
      disabled: !field || !field.type,
      valueInfo: field?.configuration,
      canResetSelection: true
    };
    const adapter = adapterToConfig(FormlyFieldAdapterFactory.createAdapter(dto), cssClass);
    return adapter;
  }

  onEnableRepeatableModeChange(event: MatCheckboxChange): void {
    if (this.sourceToDestinationFieldPathInputs.length || this.destinationFieldManipulationInputs.length) {
      if (event.checked) {
        this.confirmDestinationGroupsReset(
          this.ts.instant('Enabling "Repeatable Copy Mode" will reset the existing Field Value Groups'),
          event.checked
        );
      } else {
        this.confirmDestinationGroupsReset(
          this.ts.instant('Disabling "Repeatable Copy Mode" will reset the existing Field Value Groups'),
          event.checked
        );
      }
    }
  }

  confirmDestinationGroupsReset(message: string, isChecked: boolean): void {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      disableClose: true,
      data: <ConfirmActionData>{ title: 'Warning', message, showProceedBtn: true }
    });

    dialogRef.afterClosed().subscribe((x) => {
      if (x) {
        this.sourceToDestinationFieldPathInputs = [];
        this.destinationFieldManipulationInputs = [];
        this.copyActionOutputData.destinationFieldManipulations = [];
        this.copyActionOutputData.sourceToDestination = [];
        this.emitToParent();
      } else {
        // user cancels the dialog
        this.enableRepeatableCopyingControl.setValue(!isChecked);
      }
    });
  }

  updateEnableRepeatableCopyingControl(): void {
    if (!this.stepLinkData.repeatableSettings || !this.stepLinkData.repeatableSettings.isRepeatable) {
      this.enableRepeatableCopyingControl.setValue(false);
    } else {
      this.enableRepeatableCopyingControl.setValue((<StepToRawDataEventDto>this.actionDto).isCopyAsRepeatableEnabled);
    }
  }
}
