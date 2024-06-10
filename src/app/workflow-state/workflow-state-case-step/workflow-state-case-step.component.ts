/**
 * global
 */
import { Component, Inject, Input, OnInit, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { filter, take, takeUntil } from 'rxjs/operators';
import { Actions, ofType } from '@ngrx/effects';
import { cloneDeep } from 'lodash-core';
import { Clipboard } from '@angular/cdk/clipboard';
import { NavigationExtras, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
/**
 * project
 */

import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store';
import {
  AreaTypeEnum,
  DynamicEntitiesService,
  DynamicEntityDto,
  SchemaDto,
  SchemaFieldDto,
  UpdateStepCommand,
  APP_CLIENT_ID,
  FieldTypeIds,
  CaseStepStatusEnum,
  WorkflowResolutionDto,
  WorkflowStateUI,
  CaseStepEntityUi,
  StepDynamicEntityPayload,
  UpdateDynamicEntityDto,
  UpdateDynamicEntityVisualSettingsDto,
  FieldVisualSettings,
  SidebarLinksService,
  ShortenerUrlService,
  EvokedAnswerSettingsEnum
} from '@wfm/service-layer';
import { BaseFieldValueType, EmbededFieldValueDto } from '@wfm/service-layer/models/FieldValueDto';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import {
  AddFlagForStepUpdatedAction,
  UpdateWorkflowStateStep,
  CreateUpdateWorkflowStateStepSuccess,
  WorkflowActionTypes,
  workflowStateSelector,
  UpdateDynamicEntityVisualSettings,
  visualSettingsUpdateError,
  ResetVisualSettingsError
} from '@wfm/store/workflow';
import { PopupAlertComponent } from '@wfm/shared/popup-alert/popup-alert.component';
import { FormlyModel } from '@wfm/common/models';
import { FieldLinkData } from '@wfm/service-layer/helpers/step-field-link-data.resolver';
import { PropertyPath } from '@wfm/service-layer/models/expressionModel';
import { convertTenantName } from '@wfm/shared/utils';
import { EvokedAnswerSettingService } from '@wfm/service-layer/services/evoked-answer-setting.service';
import { stepResolutionConfirmationSetting } from '@wfm/users/evoked-answer-settings/evoked-answer-settings.component';
import { ComputedValueTriggerEventEnum, DefaultValueTypeEnum } from '@wfm/common/field/field-default-value/FieldDefaultValues';
import { ExpressionHelperService } from '@wfm/common/form-builder-components/expression-helper.service';
import { BaseFieldConverter } from '@wfm/service-layer/helpers';
import { FormlyDataOutput } from '@wfm/common/form-builder-components/form-builder-form-preview/form-builder-form-preview.component';
/**
 * local
 */
import { SelectResolutionComponent } from './select-resolution/select-resolution.component';
import { WorkflowStateUiService } from '../workflow-state-ui.service';

interface ValueMap {
  [key: string]: any;
}

export interface LinkedRawDataDetails {
  id: string;
  item: DynamicEntityDto;
  fieldPaths: PropertyPath[];
  tenantId: string;
  schemaId: string;
}

interface DynamicEntityExtended extends DynamicEntityDto {
  schema: SchemaDto;
  rawData?: LinkedRawDataDetails;
  activeFieldPath?: PropertyPath;
}

@Component({
  selector: 'app-workflow-state-case-step',
  templateUrl: './workflow-state-case-step.component.html',
  styleUrls: ['./workflow-state-case-step.component.scss']
})
export class WorkflowStateCaseStepComponent extends TenantComponent implements OnInit, OnChanges {
  componentId = 'd336766c-aa97-455c-a90b-9f5855b8145e';
  @Input() caseStep: CaseStepEntityUi;
  @Input() workflowStateId: string;
  @Input() stepFieldData?: FieldLinkData;
  @Input() userId: string;
  @Output() deleteStepEvent: EventEmitter<CaseStepEntityUi> = new EventEmitter();

  stepDynamicEntities: DynamicEntityExtended[] = [];
  stepDynamicEntity: DynamicEntityDto;
  schema: SchemaDto;
  schemaFields$: Observable<SchemaFieldDto>;
  stepStatus: CaseStepStatusEnum;
  workflowState: WorkflowStateUI;
  // used to render the correct buttons in formPreviewer
  allowActionsFor: AreaTypeEnum = AreaTypeEnum.stepForm;
  /**
   * an object with {key:dynamicEntity.field.fieldName,  value: dynamicEntity.field}
   */
  dynamicEntityMap: ValueMap;
  resolutionOptions: WorkflowResolutionDto[];
  isAnyValueFilled: boolean;
  areFormsValid: boolean;
  areFieldsReadonly: boolean;
  disableSaveButton: boolean;
  stepFormData: FormlyDataOutput[] = [];
  /**
   *store the stepForms' validity flags,
   * cannot check directly stepForm.valid, since it can get invalid after being disabled
   */
  stepsValidity: boolean[] = [];
  allFieldsHiddenOrDisabled: boolean[] = [];
  isStepEditFlagSet: boolean;
  isLoaded = false;

  get isStepResolved(): boolean {
    return !!this.caseStep.resolution;
  }
  get isFormDisabled(): boolean {
    return !this.caseStep.rights?.canEdit;
  }
  get isResolveDisabled(): boolean {
    return !this.caseStep.rights?.canResolve;
  }
  get isReopenDisabled(): boolean {
    return !this.caseStep.rights?.canUnresolve;
  }

  get areaType() {
    return AreaTypeEnum;
  }
  constructor(
    @Inject(APP_CLIENT_ID) readonly appId: string,
    private store: Store<ApplicationState>,
    private adminSchemaService: AdminSchemasService,
    private dynamicEntityService: DynamicEntitiesService,
    private dialog: MatDialog,
    private wfStateUiService: WorkflowStateUiService,
    private snackbar: MatSnackBar,
    private actions$: Actions,
    private router: Router,
    private sidebarLinksService: SidebarLinksService,
    private clipboard: Clipboard,
    private evokeSettingService: EvokedAnswerSettingService,
    private expressionHelper: ExpressionHelperService,
    private shortenerUrlService: ShortenerUrlService,
    private ts: TranslateService
  ) {
    super(store);
  }

  async ngOnInit(): Promise<void> {
    // get the resolutions

    this.store
      .select(workflowStateSelector)
      .pipe(
        filter((wfState) => !!wfState),
        takeUntil(this.destroyed$)
      )
      .subscribe((wfState) => {
        this.workflowState = { ...wfState };
        const currentStepSchema = wfState.steps.find((step) => {
          return step.refName === this.caseStep.refName;
        });
        this.resolutionOptions = currentStepSchema?.resolutions;
      });

    if (this.caseStep?.rights?.canHighlightFields) {
      this.subscribeForHighlightsUpdateFailure();
    }
  }

  subscribeForHighlightsUpdateFailure(): void {
    this.store
      .select(visualSettingsUpdateError)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((errMessage) => {
        if (errMessage) {
          this.store.dispatch(new ResetVisualSettingsError());
        }
      });
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.caseStep?.currentValue) {
      this.isLoaded = false;
      await this.getStepSchema(this.caseStep.schemaId);
      this.getDynamicEntities();
    }
  }

  private async getStepSchema(id: string): Promise<void> {
    this.schema = await this.adminSchemaService.getSchema(this.tenant, AreaTypeEnum.stepForm, id);
  }

  private async getDynamicEntities(): Promise<void> {
    try {
      for (const item of this.caseStep.stepDynamicEntities) {
        let deItem: DynamicEntityDto;
        let schema = cloneDeep(this.schema);

        this.areFieldsReadonly = schema.fields.every((field) => field.configuration.readonly);

        if (item?.dynamicEntityId) {
          deItem = await this.dynamicEntityService.getById(
            this.tenant,
            item?.dynamicEntityId,
            this.caseStep.schemaId,
            this.areaType.stepForm
          );
          let deMap = this.getDynamicEntityMap(deItem?.fields || []);
          let highlightsMap = this.getHighlightsMap(deItem.visualSettings || []);

          schema.fields = this.populateSchemaFieldValues(schema.fields, deMap, highlightsMap, deItem);
        }

        const stepDeItem: DynamicEntityExtended = {
          ...deItem,
          schema,
          rawData: item.rawDataItem
            ? {
                id: item.rawDataItemId,
                item: item.rawDataItem,
                tenantId: this.tenant,
                schemaId: this.caseStep.rawDataSchemaId,
                fieldPaths: this.caseStep.linkedRawDataFields
              }
            : null
        };
        if (this.stepFieldData && this.stepFieldData.stepDynamicEntityId === deItem.id) {
          stepDeItem.activeFieldPath = this.stepFieldData.fieldPath;
        }

        this.stepDynamicEntities.push(stepDeItem);
      }
      this.isLoaded = true;
    } catch (error) {
      console.log(error);
    }
  }

  getHighlightsMap(deVisualSettings: FieldVisualSettings[]): ValueMap {
    let settingMap = {};
    deVisualSettings.forEach((visualSetting) => {
      const fieldPath = cloneDeep(visualSetting.fieldPath);
      this.populateVisualSettingMap(settingMap, fieldPath, visualSetting);
    });
    return settingMap;
  }

  /**
   * recursion for nested schema fields to populate highlighted prop value map
   * @param settingMap
   * @param fieldPath
   * @param visualSetting
   */
  populateVisualSettingMap(settingMap, fieldPath, visualSetting): void {
    const pathItem = fieldPath.splice(0, 1);

    if (fieldPath.length) {
      if (!settingMap.hasOwnProperty(pathItem)) {
        settingMap[pathItem] = {};
      }
      this.populateVisualSettingMap(settingMap[pathItem], fieldPath, visualSetting);
    } else {
      settingMap[pathItem] = visualSetting.isHighlighted;
    }
  }

  /**
   * create a map of {fieldName: BaseFieldValueType} pairs form dynamicEntityFields (recursion: consider the nested fields)
   * @param de
   * @returns
   */

  private getDynamicEntityMap(dynamicEntityFields: BaseFieldValueType[]): ValueMap {
    let fieldMap = {};
    dynamicEntityFields.forEach((field: BaseFieldValueType) => {
      if (field) {
        if (field.type !== FieldTypeIds.EmbededField) {
          fieldMap[field.id] = { ...field };
        } else {
          fieldMap[field.id] = { ...this.getDynamicEntityMap(<BaseFieldValueType[]>field.value) };
        }
      }
    });
    return fieldMap;
  }

  /**
   * Recursively add values to schema fields (values get from dynamic entity)
   * values added to field.configuration
   * @param fields
   * @param values
   * @returns
   */

  private populateSchemaFieldValues(
    fields: SchemaFieldDto[],
    valuesMap: ValueMap,
    highlightsMap: ValueMap,
    deItem?: DynamicEntityDto
  ): SchemaFieldDto[] {
    const fieldsCopy = [...fields];
    fieldsCopy.forEach((field) => {
      if (field.type !== FieldTypeIds.EmbededField) {
        if (valuesMap[field.fieldName]) {
          field.configuration.value = valuesMap[field.fieldName].value;
        }
        field.configuration.isHighlighted = highlightsMap[field.fieldName] || false;

        if (field.type === FieldTypeIds.ConnectorField && deItem && deItem.virtualFields) {
          field.configuration.exposedFieldsData = deItem.virtualFields.find((f) => f.fieldName === field.fieldName);
        }
      } else {
        const nestedValuesMap = valuesMap[field.fieldName] || {};
        const nestedHighlightsMap = highlightsMap[field.fieldName] || {};
        field.fields = this.populateSchemaFieldValues(field.fields, nestedValuesMap, nestedHighlightsMap);
      }
    });
    // order based on the configuration.position
    let orderedFields = fieldsCopy.sort((a, b) => a.configuration?.position - b.configuration?.position);
    return orderedFields;
  }

  disabledDrag(e): void {
    e.stopPropagation();
  }

  done(): void {
    this.wfStateUiService
      .userWantsToProceed('Update Step?', 'updating the step', this.caseStep.refName)
      .pipe(take(1))
      .subscribe(async (response: boolean) => {
        if (response) {
          if (this.resolutionOptions?.length > 1) {
            this.openStepResolutionConfirmation();
          } else {
            const existingSetting = this.evokeSettingService.checkForEvokedAnswerSetting(stepResolutionConfirmationSetting);
            const settingValue: EvokedAnswerSettingsEnum = existingSetting?.value?.setting;
            if (settingValue && settingValue === EvokedAnswerSettingsEnum.Yes) {
              this.resolveStep({ resolution: this.resolutionOptions[0]?.name });
            } else {
              this.openStepResolutionConfirmation();
            }
          }
        }
      });
  }

  openStepResolutionConfirmation(): void {
    // pass the resolutions here
    const dialogRef = this.dialog.open(SelectResolutionComponent, {
      minWidth: 300,
      panelClass: []
    });
    dialogRef.componentInstance.resolutionOptions = this.resolutionOptions;
    dialogRef.componentInstance.stepName = this.caseStep.name;

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result && result.resolution) this.resolveStep(result);
      if (result?.checked)
        this.evokeSettingService.saveUserEvokedAnswerSettings(
          EvokedAnswerSettingsEnum.Yes,
          this.userId,
          stepResolutionConfirmationSetting,
          null
        );
    });
  }

  resolveStep(result): void {
    const cmd = this.populateUpdateStepDto(result.resolution);
    this.store.dispatch(new UpdateWorkflowStateStep({ data: cmd }));
    this.listenForSaveOrDoneSuccess(WorkflowActionTypes.CreateUpdateWorkflowStateStepSuccess, 'done');
  }

  listenForSaveOrDoneSuccess(action: WorkflowActionTypes, type: string) {
    this.actions$.pipe(ofType(action), take(1)).subscribe((result: CreateUpdateWorkflowStateStepSuccess) => {
      if (result.type === action && type === 'save') {
        this.snackbar.open(this.ts.instant('The data is saved'), 'Ok', { duration: 2000 });
      } else if (result.type === action && type === 'done') {
        this.snackbar.open(this.ts.instant('The resolution is changed'), 'Ok', { duration: 2000 });
      }
    });
  }

  reopen(): void {
    this.wfStateUiService
      .userWantsToProceed('Update Step?', 'updating the step', this.caseStep.refName)
      .pipe(take(1))
      .subscribe((response: boolean) => {
        if (response) {
          const cmd = this.populateUpdateStepDto('');
          this.store.dispatch(new UpdateWorkflowStateStep({ data: cmd }));
        }
      });
  }

  /**
   * this is not a final act, just saving the progress
   * @param form
   * @returns
   */
  saveForm(): void {
    this.wfStateUiService
      .userWantsToProceed('Update Step?', 'updating the step', this.caseStep.refName)
      .pipe(take(1))
      .subscribe((response: boolean) => {
        if (response) {
          const canSave = this.stepFormData.every((formData) => this.areFormControlsValid(formData.form));
          if (canSave) {
            const cmd = this.populateUpdateStepDto('');
            this.store.dispatch(new UpdateWorkflowStateStep({ data: cmd }));
            this.listenForSaveOrDoneSuccess(WorkflowActionTypes.CreateUpdateWorkflowStateStepSuccess, 'save');
          } else {
            this.dialog.open(PopupAlertComponent, {
              data: { message: 'Cannot save: there is an invalid field' },
              minWidth: 300,
              panelClass: []
            });
            return;
          }
        }
      });
  }

  /**
   * check all the formControls of the form that have value in them, they should be valid
   * @param form
   * @returns
   */

  private areFormControlsValid(form: FormGroup): boolean {
    let areAllValid = true;
    const formKeys = Object.keys(form.controls);
    for (let i = 0; i < formKeys.length; i++) {
      const formControl = form.controls[formKeys[i]];
      if ((<FormGroup>formControl).controls) {
        const nestedForm = <FormGroup>formControl;
        areAllValid = this.areFormControlsValid(nestedForm);
        if (!areAllValid) {
          // some field is invalid, stop checking
          break;
        }
      } else if ((formControl.value || formControl.value === 0) && formControl.invalid) {
        // some field is invalid, stop checking
        areAllValid = false;
        break;
      }
    }
    return areAllValid;
  }

  removeStep(): void {
    this.deleteStepEvent.emit({ ...this.caseStep });
  }

  private populateUpdateStepDto(resolution: string): UpdateStepCommand {
    const stepDynamicEntities: StepDynamicEntityPayload[] = this.caseStep.stepDynamicEntities.map((stepDE, index) => {
      const de: UpdateDynamicEntityDto = {
        publicId: stepDE.dynamicEntityId,
        appId: this.appId,
        tenantId: this.tenant,
        schemaId: this.schema.id,
        areaType: this.schema.areaType,
        fields: this.populateDynamicEntityFields(this.stepFormData[index].model, this.schema.fields)
      };
      return <StepDynamicEntityPayload>{
        dynamicEntity: de,
        rawDataItemId: stepDE.rawDataItemId
      };
    });

    const dto: UpdateStepCommand = {
      tenantId: this.tenant,
      stepSchemaId: this.caseStep.schemaId,
      schemaId: this.workflowState.workflowId,
      workflowStateId: this.workflowStateId,
      refName: this.caseStep.refName,
      isGroup: this.caseStep.isGroup,
      stepDynamicEntities: stepDynamicEntities,
      resolution: resolution,
      visualElementId: this.caseStep.visualElementId,
      visualElements: this.workflowState.visualElements
    };
    return dto;
  }

  /**
   *
   * @param formModel: FormGroup.getRawValue (includes the disabled control values)
   * @param schemaFields
   * @returns
   */
  private populateDynamicEntityFields(formModel: FormlyModel, schemaFields: SchemaFieldDto[]): BaseFieldValueType[] {
    let fields = [];
    this.populateComputeOnSubmitValues(schemaFields, formModel);
    schemaFields.forEach((field) => {
      const key = field.fieldName;
      if (field.type !== FieldTypeIds.EmbededField) {
        let data = <BaseFieldValueType>{
          id: key,
          type: field.type
        };
        const value = this.dynamicEntityService.mapFieldTypeToBaseFieldValue(field.type, formModel[key]);
        if (value !== undefined) {
          data.value = value;
          fields.push(data);
        }
      } else {
        const embeddedFields = this.populateDynamicEntityFields(formModel[key], field.fields);
        const data = <EmbededFieldValueDto>{
          id: key,
          type: FieldTypeIds.EmbededField,
          value: embeddedFields
        };
        fields.push(data);
      }
    });

    return fields;
  }

  /**
   * populate computed values for the fields with computeTriggerEvent setting equal to OnSubmit
   */
  populateComputeOnSubmitValues(schemaFields: SchemaFieldDto[], formModel: FormlyModel) {
    const computeOnSubmitFields = schemaFields.filter((f) => {
      return (
        f.configuration?.computeDefaultValueFormula &&
        f.configuration?.defaultValueType === DefaultValueTypeEnum.computed &&
        f.configuration?.computeTriggerEvent === ComputedValueTriggerEventEnum.OnSubmit
      );
    });

    if (computeOnSubmitFields.length) {
      const fields = schemaFields.map((f) => BaseFieldConverter.toUi(f));
      computeOnSubmitFields.forEach((field) => {
        const value = this.expressionHelper.manuallyComputeFieldValue(field.fieldName, fields, formModel);
        if (value) {
          formModel[`${field.fieldName}`] = value;
        }
      });
    }
  }

  stepFormValueEmitted(stepFormData: FormlyDataOutput, index: number): void {
    if (!this.isStepEditFlagSet && !stepFormData.form.pristine) {
      this.isStepEditFlagSet = true;

      this.store.dispatch(
        new AddFlagForStepUpdatedAction({
          data: {
            refName: this.caseStep.refName
          },
          dataChanged: true
        })
      );
    }
    this.storeFormAndValidity(stepFormData, index);
    this.checkFormsValidity();
  }

  checkFormsValidity(): void {
    this.areFormsValid = this.stepsValidity.every((isItemValid) => isItemValid);
    this.disableSaveButton = this.allFieldsHiddenOrDisabled.every((allFieldsHiddenOrDisabled) => allFieldsHiddenOrDisabled);
  }

  storeFormAndValidity(stepFormData: FormlyDataOutput, index: number): void {
    this.stepFormData[index] = stepFormData;
    this.stepsValidity[index] = stepFormData.form.valid || stepFormData.form.status === 'VALID';
    this.allFieldsHiddenOrDisabled[index] = stepFormData.allFieldsHiddenOrDisabled;
  }

  stepHighlightsEmitted(highlightsModel: FormlyModel, stepDynamicEntityIndex: number): void {
    const visualSettings = [];
    // call the new separate endpoint
    this.populateVisualSettingRecursively(highlightsModel, visualSettings, []);

    const data: UpdateDynamicEntityVisualSettingsDto = {
      areaType: AreaTypeEnum.stepForm,
      tenantId: this.tenant,
      dynamicEntityId: this.caseStep.stepDynamicEntities[stepDynamicEntityIndex].dynamicEntityId,
      visualSettings
    };
    this.store.dispatch(new UpdateDynamicEntityVisualSettings({ data }));
  }

  /**
   * generate stepField link and copy to clipboard
   */
  generateFieldLink(pathEvent: PropertyPath, stepDynamicEntityIndex: number): void {
    try {
      const navigationExtras: NavigationExtras = {
        queryParams: {
          stepRefName: this.caseStep.refName,
          visualElementId: this.caseStep.visualElementId,
          stepDynamicEntityId: this.caseStep.stepDynamicEntities[stepDynamicEntityIndex].dynamicEntityId,
          fieldPath: JSON.stringify(pathEvent)
        }
      };
      let tenantName = convertTenantName(this.sidebarLinksService.tenantName);
      const route = this.router.createUrlTree(
        [`/${tenantName}`, 'workflow-states', 'update', this.workflowState.id, this.workflowState.workflowId],
        navigationExtras
      );
      const fieldLink = window.location.origin + this.router.serializeUrl(route);

      this.shortenerUrlService
        .getShortUrl(fieldLink)
        .then((result) => {
          this.clipboard.copy(result.shortUrl);
          this.snackbar.open(this.ts.instant('Field Link Copied To Clipboard!'), 'Close', { duration: 2000 });
        })
        .catch((err) => {
          this.clipboard.copy(fieldLink);
          this.snackbar.open(this.ts.instant('Field Link Copied To Clipboard!'), 'Close', { duration: 2000 });
          console.error('There is an errorin fetching short url');
        });
    } catch (error) {
      console.log(error);
    }
  }

  populateVisualSettingRecursively(highlightsModel: FormlyModel, visualSettings: any[], path?: string[]): void {
    const keys = Object.keys(highlightsModel);
    keys.forEach((key: string) => {
      path.push(key);
      let nestedModel = highlightsModel[key];
      if (typeof nestedModel === 'object' && nestedModel !== null) {
        this.populateVisualSettingRecursively(nestedModel, visualSettings, [...path]);
        path.pop();
      } else {
        visualSettings.push({
          fieldPath: [...path],
          isHighlighted: nestedModel || false
        });
        path.pop();
      }
    });
  }
}
