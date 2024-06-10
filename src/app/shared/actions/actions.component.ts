import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep } from 'lodash-core';
import { KeyValueView } from '@wfm/common/models';
import { AreaTypeEnum, FieldTypeIds, ProcessStepEntityDto, SchemaDto, WorkflowDto, WorkflowStatusDto } from '@wfm/service-layer';
import {
  EventAreaScopes,
  EventTypes,
  ActionScopeMap,
  ActionEventNameMap,
  BaseActionType,
  UpdateCaseStatusBasedOnStepResolutionEventDto,
  UpdateStatusBasedOnStepAddedEvent,
  UpdateRawDataBasedOnCaseEventDto,
  StepToCaseEventDto,
  RawDataToCaseEventDto,
  AutomaticAddStepsEventDto,
  DifferenceCalculationEventDto,
  WorkflowEventSubAreas,
  WorkflowSubAreaByActionMap,
  MathExpressionCalculationEvent,
  StepToRawDataEventDto,
  WebhookEventDto,
  ProcessStepEventExecutionType,
  CaseToStepEventDto,
  SendEmailActionDto,
  ProcessStepLinksEventSubArea,
  ProcessStepLinksActionSubareaNameMap,
  WorkflowActionSubareaNameMap,
  ProcessStepSubAreaByActionMap,
  AutoIncrementActionDto,
  RawDataToStepActionDto,
  BrowserActionEventDto,
  AutomaticRemoveStepsActionDto
} from '@wfm/service-layer/models/actionDto';
import { ExpressionDef, ProcessStepPath, PropertyPath, RawDataPath } from '@wfm/service-layer/models/expressionModel';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { workflowBuilderLoader, workflowProcessStepLinkList } from '@wfm/store/workflow-builder';
import { LinkData } from '@wfm/tenant-admin/workflows/create-process-step-links/create-process-step-links.component';
import { BehaviorSubject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TenantComponent } from '../tenant.component';
import { CaseToStepData } from './case-to-step-action/case-to-step-action.component';
import { MathExpressionOutput } from './math-expression-action/math-expression-action.component';
import { WebhookActionData } from './webhook-action/webhook-action.component';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { PropertyPathExtended } from './field-path-generator/FieldPathModels';
import { CopyActionData } from './copy-fields-action/copy-fields-action.component';
import { SendEmailActionData } from './send-email-action/send-email-action.component';
import { GetNotificationTopics, nfTopicsSelector } from '@wfm/store/notification-builder';
import { NotificationTopicDto } from '@wfm/service-layer/services/notification-topic.service';
import { ExpressionDefOutput } from '@wfm/tenant-admin/workflows/rules-builder/rules-builder.component';
import { AggregationActionOutput } from './aggregation-action/aggregation-action.component';
import { AutoIncrementActionData } from './auto-increment-action/auto-increment-action.component';
import { pathSeparator } from './field-path-generator/field-path-generator.component';
import {
  AggregationActionDto,
  AggregationEventType
} from '@wfm/tenant-admin/workflows/rawData-link/aggregation-validation/aggregation.model';
import { RawDataToStepData } from './raw-data-to-step-action/raw-data-to-step-action.component';
import { BrowserActionData } from './browser-action/browser-action.component';

interface SelectOptions {
  id: string;
  name: string;
  type?: FieldTypeIds;
}

interface EventExecutionTypeOption {
  label: string;
  value: ProcessStepEventExecutionType;
}

export interface DiffActionData {
  firstStep: PropertyPathExtended;
  secondStep: PropertyPathExtended;
  caseResultField?: string;
  rawdataResultField?: RawDataPath;
  stepResultField?: ProcessStepPath;
  isValid: boolean;
}

@Component({
  selector: 'app-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.scss']
})
export class ActionsComponent extends TenantComponent implements OnInit {
  @Input() actionArea: EventAreaScopes;
  @Input() subArea?: WorkflowEventSubAreas | ProcessStepLinksEventSubArea;
  @Input() workflow?: WorkflowDto;
  @Input() workflowStatuses?: WorkflowStatusDto[];
  @Input() currentProcessStep?: ProcessStepEntityDto;
  @Input() selectedCaseSchemaId: string;
  @Input() actionDto: BaseActionType;
  @Input() stepLinkData: LinkData;
  @Input() targetSchema: SchemaDto;

  selectedActionType: EventTypes;
  actionsForm: FormGroup;
  actionTypeOptions: KeyValueView<string, EventTypes>[];
  workflowSteps: Array<SelectOptions> = [];
  diffActionData: DiffActionData;
  mathExpressionActionData: MathExpressionOutput;
  webhookActionData: WebhookActionData;
  caseToStepData: CaseToStepData;
  copyActionData: CopyActionData;
  aggregationActionData: AggregationActionOutput;
  sendEmailActionData: SendEmailActionData;
  autoIncrementActionData: AutoIncrementActionData;
  rawDataToStepActionData: RawDataToStepData;
  browserActionData: BrowserActionData;
  loading$: Observable<boolean>;
  noRawDataSchema: boolean = false;
  noSteps: boolean = true;

  notificationTopics: NotificationTopicDto[];
  expressionsDef: ExpressionDef = {};
  hasRules: boolean = false;
  expressionConfig = {
    title: '',
    rules: true,
    rulesLabel: 'Field Rules (optional)',
    userRolesLabel: '',
    userGroupsLabel: '',
    buttons: false
  };
  allowedSubAreaOptions: KeyValueView<string, WorkflowEventSubAreas | ProcessStepLinksEventSubArea>[];
  eventSubAreaSubject$: BehaviorSubject<WorkflowEventSubAreas | ProcessStepLinksEventSubArea> = new BehaviorSubject(null);
  allowMultipleSubAreas: boolean;
  get eventTypes() {
    return EventTypes;
  }

  get additionalPropsGroup(): FormGroup {
    return this.actionsForm.get('additionalPropsGroup') as FormGroup;
  }

  get actionAreaTypes() {
    return EventAreaScopes;
  }

  get wfEventSubAreas() {
    return WorkflowEventSubAreas;
  }

  get aggregationEventType() {
    return AggregationEventType;
  }

  selectedFieldsForTree: string[];

  actionsAllowingMultipleTriggerType: { [key: string]: boolean };

  constructor(
    private store: Store<ApplicationState>,
    private fb: FormBuilder,
    private matdialogRef: MatDialogRef<ActionsComponent>,
    private adminSchemasService: AdminSchemasService,
    private ts: TranslateService
  ) {
    super(store);
    this.actionsAllowingMultipleTriggerType = {
      [EventTypes.OnRawDataAddedToCase]: false,
      [EventTypes.AutomaticAddSteps]: true,
      [EventTypes.RawDataToCase]: true,
      [EventTypes.StepToCase]: true,
      [EventTypes.StepToRawData]: true,
      [EventTypes.UpdateCaseStatusBasedOnStepResolution]: false,
      [EventTypes.DifferenceCalculation]: false,
      [EventTypes.UpdateStatusBasedOnStepAdded]: false,
      [EventTypes.MathExpressionCalculation]: false,
      [EventTypes.WebHook]: true,
      [EventTypes.CaseToStep]: true,
      [EventTypes.SendEmail]: false,
      [EventTypes.AutoIncrement]: true,
      [EventTypes.AggregatedRawDataToCase]: true,
      [EventTypes.RawDataToStep]: true,
      [EventTypes.BrowserAction]: true,
      [EventTypes.AutomaticRemoveSteps]: true
    };
  }

  async ngOnInit(): Promise<void> {
    this.loading$ = this.store.select(workflowBuilderLoader);
    this.initForm();
    if (this.workflow) {
      this.selectedCaseSchemaId = this.workflow.caseSchemaId;
      await this.getRawDataSchema();
      this.getProcessStepLinks();

      this.workflowStatuses = this.workflow.statuses.map((status: WorkflowStatusDto) => {
        return {
          ...status
        };
      });
    } else if (this.selectedCaseSchemaId) {
      // new workflow
      await this.getRawDataSchema();
    }
    this.getNotificationTopics();
    if (this.actionDto) {
      this.selectedActionType = this.actionDto.eventType;
      this.expressionsDef = cloneDeep(this.actionDto.expression);
      this.hasRules = this.expressionsDef?.ruleSet?.rules?.length > 0 || this.expressionsDef?.ruleSet?.systemRules?.length > 0;
      this.updateFormControls();
    }
  }

  getSubAreaLabel(subArea: ProcessStepLinksEventSubArea | WorkflowEventSubAreas): string {
    if (this.actionArea === EventAreaScopes.ProcessStepLinkScope) {
      return ProcessStepLinksActionSubareaNameMap.get(subArea as ProcessStepLinksEventSubArea)?.viewValue || '';
    } else if (this.actionArea === EventAreaScopes.WorkflowScope) {
      return WorkflowActionSubareaNameMap.get(subArea as WorkflowEventSubAreas)?.viewValue || '';
    }
  }

  getApplicableActionTypes(): void {
    this.actionTypeOptions = ActionScopeMap.get(this.actionArea).map((action) => {
      let actionFullData = ActionEventNameMap.get(action);
      return new KeyValueView(actionFullData.key, actionFullData.value, this.ts.instant(actionFullData.viewValue));
    });
    if (this.noRawDataSchema) {
      this.actionTypeOptions = this.actionTypeOptions.filter((action) => {
        return (
          action.value !== EventTypes.OnRawDataAddedToCase &&
          action.value !== EventTypes.RawDataToCase &&
          action.value !== EventTypes.StepToRawData &&
          action.value !== EventTypes.AggregatedRawDataToCase
        );
      });
    }
    if (this.noSteps) {
      this.actionTypeOptions = this.actionTypeOptions.filter((action) => {
        return (
          action.value !== EventTypes.CaseToStep &&
          action.value !== EventTypes.AutomaticAddSteps &&
          action.value !== EventTypes.StepToRawData &&
          action.value !== EventTypes.UpdateCaseStatusBasedOnStepResolution &&
          action.value !== EventTypes.UpdateStatusBasedOnStepAdded &&
          action.value !== EventTypes.RawDataToStep &&
          action.value !== EventTypes.AutomaticRemoveSteps
        );
      });
    }
    // Filter out SendEmail Action If no notification topics
    if (!this.notificationTopics?.length) {
      this.actionTypeOptions = this.actionTypeOptions.filter((x) => x.value !== EventTypes.SendEmail);
    }
  }

  async getNotificationTopics(): Promise<void> {
    this.store.dispatch(new GetNotificationTopics({ data: { skip: 0, take: 9999 } }));
    this.store.pipe(select(nfTopicsSelector), takeUntil(this.destroyed$)).subscribe((topics) => {
      this.notificationTopics = topics;
      this.getApplicableActionTypes();
    });
  }

  getProcessStepLinks(): void {
    this.store
      .select(workflowProcessStepLinkList)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((links) => {
        if (links && links.length) {
          this.noSteps = false;
          this.workflowSteps = links.map((stepLink) => {
            return {
              name: stepLink.refName,
              id: stepLink.processStepEntityId
            };
          });
        }
      });
  }

  /**
   *  getting schemas from cache
   *  get case schema,  from it get the raw data schemaId, get rawDataSchema fields
   */
  async getRawDataSchema(): Promise<void> {
    try {
      if (this.selectedCaseSchemaId) {
        const caseSchema = await this.adminSchemasService.getSchema(this.tenant, AreaTypeEnum.case, this.selectedCaseSchemaId);

        const rawDataSchemaId = caseSchema.fields.find((field) => {
          return field.type === FieldTypeIds.ListOfLinksField && field.configuration.schemaAreaType === AreaTypeEnum.rawData;
        })?.configuration?.schemaId;
        if (!rawDataSchemaId) {
          this.noRawDataSchema = true;
        }
      }
    } catch (error) {
      console.log('error getting rawData schema', error);
    }
  }

  initForm(): void {
    this.actionsForm = this.fb.group({
      type: [null, Validators.required],
      actionName: ['', Validators.required],
      subArea: [null],
      subAreaMultiple: [[]],
      additionalPropsGroup: this.fb.group({
        /**
         * AutomaticAddStepsEventDto
         */
        steps: [],

        /**
         * UpdateCaseStatusBasedOnStepResolutionEventDto
         */
        refName: [],
        schemaId: [],
        resolutions: [],
        /**
         * UpdateCaseStatusBasedOnStepResolutionEventDto/UpdateStatusBasedOnStepAdded
         */
        statusId: [],
        fieldPropertyPaths: []
      })
    });

    this.actionsForm.controls['subArea'].valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((data) => {
      this.eventSubAreaSubject$.next(data);
      if (data !== WorkflowEventSubAreas.WorkflowOnAutoIncrementField) {
        this.additionalPropsGroup.controls.fieldPropertyPaths.setValue(null);
      }
    });

    this.actionsForm.controls['subAreaMultiple'].valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((data) => {
      // this.eventSubAreaSubject$.next(data);
      if (!data?.includes(WorkflowEventSubAreas.WorkflowOnAutoIncrementField)) {
        this.additionalPropsGroup.controls.fieldPropertyPaths.setValue(null);
      }
    });

    this.actionsForm.controls['type'].valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((eventType: EventTypes) => {
      this.allowMultipleSubAreas = this.actionsAllowingMultipleTriggerType[eventType];
      this.resetActionTypeSpecificData();
      this.selectedActionType = eventType;
      this.populateSubAreas();
      try {
        if (this.allowMultipleSubAreas) {
          const value = this.allowedSubAreaOptions?.length ? [this.allowedSubAreaOptions[0].value] : [];
          this.actionsForm.get('subAreaMultiple').setValue(value);
        } else {
          const value = this.allowedSubAreaOptions?.length ? this.allowedSubAreaOptions[0].value : null;
          this.actionsForm.get('subArea').setValue(value);
        }
      } catch (error) {
        console.log(error);
      }
      this.resetAdditionalFields();
      this.applyValidations(eventType);
      if (eventType === EventTypes.UpdateCaseStatusBasedOnStepResolution) {
        this.additionalPropsGroup.patchValue({
          refName: this.stepLinkData?.refName,
          schemaId: this.currentProcessStep.schemaId
        });
      }
    });
  }

  updateFormControls(): void {
    this.allowMultipleSubAreas = this.actionsAllowingMultipleTriggerType[this.actionDto.eventType];
    this.actionsForm.patchValue({
      type: this.actionDto.eventType || null,
      actionName: this.actionDto.name || '',
      subArea: !this.allowMultipleSubAreas ? this.subArea : null,
      subAreaMultiple: this.allowMultipleSubAreas ? [this.subArea] : []
    });
    this.additionalPropsGroup.patchValue({
      steps: (<AutomaticAddStepsEventDto>this.actionDto).steps || (<AutomaticRemoveStepsActionDto>this.actionDto).refNames || [],
      refName: (<UpdateCaseStatusBasedOnStepResolutionEventDto>this.actionDto).refName || null,
      schemaId: (<UpdateCaseStatusBasedOnStepResolutionEventDto>this.actionDto).schemaId || null,
      resolutions: (<UpdateCaseStatusBasedOnStepResolutionEventDto>this.actionDto).resolutions || [],
      statusId: (<UpdateStatusBasedOnStepAddedEvent>this.actionDto).statusId || null,
      firstStep: (<DifferenceCalculationEventDto>this.actionDto).firstStep || null,
      secondStep: (<DifferenceCalculationEventDto>this.actionDto).secondStep || null,
      resultField: (<DifferenceCalculationEventDto>this.actionDto).caseResultField || null,
      fieldPropertyPaths: (<AutomaticAddStepsEventDto>this.actionDto)?.checkAutoIncrementedFieldPaths || null
    });
    if (this.isAutoIncrementSubAreaSelected()) {
      const fields = <PropertyPath[]>this.additionalPropsGroup?.value?.fieldPropertyPaths;
      this.selectedFieldsForTree = fields.map((x) => x.path?.join(pathSeparator));
    }
  }

  populateSubAreas(): void {
    this.allowedSubAreaOptions = [];
    if (this.actionArea === EventAreaScopes.WorkflowScope) {
      this.allowedSubAreaOptions = WorkflowSubAreaByActionMap[this.selectedActionType].map((item) =>
        WorkflowActionSubareaNameMap.get(item)
      );
    } else if (this.actionArea === EventAreaScopes.ProcessStepLinkScope) {
      this.allowedSubAreaOptions = ProcessStepSubAreaByActionMap[this.selectedActionType].map((item) =>
        ProcessStepLinksActionSubareaNameMap.get(item)
      );
    }
  }

  resetActionTypeSpecificData(): void {
    this.diffActionData = null;
    this.mathExpressionActionData = null;
    this.webhookActionData = null;
    this.caseToStepData = null;
    this.copyActionData = null;
    this.aggregationActionData = null;
    this.sendEmailActionData = null;
    this.autoIncrementActionData = null;
    this.rawDataToStepActionData = null;
    this.browserActionData = null;
  }

  resetAdditionalFields(): void {
    this.additionalPropsGroup.patchValue({
      refName: null,
      schemaId: null,
      steps: [],
      resolutions: [],
      statusId: null,
      firstStep: null,
      secondStep: null,
      resultField: null
    });

    for (const controlKey in this.additionalPropsGroup.controls) {
      this.additionalPropsGroup.controls[controlKey].clearValidators();
      this.additionalPropsGroup.controls[controlKey].updateValueAndValidity();
    }
  }

  onSubmit(): void {
    if (!this.actionsForm.valid) {
      return;
    }
    /**
     * based on the selected action type populate the correct payload
     */
    let dto = this.populateActionDto();
    let data = {
      actionDto: dto,
      subAreas: this.allowMultipleSubAreas ? this.actionsForm.get('subAreaMultiple').value : [this.actionsForm.get('subArea').value]
    };

    if (this.actionArea === EventAreaScopes.ProcessStepLinkScope && dto.eventType === EventTypes.StepToCase) {
      (<StepToCaseEventDto>data.actionDto).processStepEventExecutionType =
        data.subAreas[0] === ProcessStepLinksEventSubArea.OnStepResolved
          ? ProcessStepEventExecutionType.OnResolutionOnly
          : ProcessStepEventExecutionType.Always;
    }
    this.matdialogRef.close(data);
  }

  populateActionDto(): BaseActionType {
    let formValue = this.actionsForm.value;
    let additonalValues = formValue.additionalPropsGroup;
    let dto: BaseActionType = {
      id: undefined,
      name: formValue.actionName,
      eventType: formValue.type
    };
    if (this.expressionsDef) {
      dto.expression = this.expressionsDef;
    }
    switch (dto.eventType) {
      case EventTypes.UpdateCaseStatusBasedOnStepResolution:
        dto = <UpdateCaseStatusBasedOnStepResolutionEventDto>{
          ...dto,
          refName: additonalValues.refName,
          schemaId: additonalValues.schemaId,
          resolutions: additonalValues.resolutions,
          statusId: additonalValues.statusId
        };
        break;
      case EventTypes.UpdateStatusBasedOnStepAdded:
        dto = <UpdateStatusBasedOnStepAddedEvent>{
          ...dto,
          statusId: additonalValues.statusId
        };
        break;
      case EventTypes.OnRawDataAddedToCase:
        // nothing extra needed
        dto = <UpdateRawDataBasedOnCaseEventDto>{
          ...dto
        };
        break;
      case EventTypes.StepToCase:
        dto = <StepToCaseEventDto>{
          ...dto,
          ...this.copyActionData
        };
        break;
      case EventTypes.StepToRawData:
        dto = <StepToRawDataEventDto>{
          ...dto,
          ...this.copyActionData
        };
        break;
      case EventTypes.RawDataToCase:
        dto = <RawDataToCaseEventDto>{
          ...dto,
          ...this.copyActionData
        };
        break;
      case EventTypes.AutomaticAddSteps:
        dto = <AutomaticAddStepsEventDto>{
          ...dto,
          steps: additonalValues.steps,
          checkAutoIncrementedFieldPaths: additonalValues.fieldPropertyPaths
        };
        break;

      case EventTypes.AutomaticRemoveSteps:
        dto = <AutomaticRemoveStepsActionDto>{
          ...dto,
          refNames: additonalValues.steps
        };
        break;
      case EventTypes.DifferenceCalculation:
        dto = <DifferenceCalculationEventDto>{
          ...dto,
          ...this.diffActionData
        };
        break;
      case EventTypes.MathExpressionCalculation:
        dto = <MathExpressionCalculationEvent>{
          ...dto,
          ...this.mathExpressionActionData
        };
        break;
      case EventTypes.WebHook:
        dto = <WebhookEventDto>{
          ...dto,
          ...this.webhookActionData
        };
        break;
      case EventTypes.CaseToStep:
        dto = <CaseToStepEventDto>{
          ...dto,
          ...this.caseToStepData
        };
        break;
      case EventTypes.SendEmail:
        dto = <SendEmailActionDto>{
          ...dto,
          ...this.sendEmailActionData
        };
        break;
      case EventTypes.AutoIncrement:
        dto = <AutoIncrementActionDto>{
          ...dto,
          autoIncrementFieldPaths: this.autoIncrementActionData.autoIncrementFieldPaths
        };
        break;
      case EventTypes.AggregatedRawDataToCase:
        dto = <AggregationActionDto>{
          ...dto,
          ...this.aggregationActionData.data
        };
        break;
      case EventTypes.RawDataToStep:
        dto = <RawDataToStepActionDto>{
          ...dto,
          copyAggregation: this.rawDataToStepActionData.copyAggregation,
          sourceToDestinationWithPath: this.rawDataToStepActionData.sourceToDestinationWithPath
        };
        break;

      case EventTypes.BrowserAction:
        dto = <BrowserActionEventDto>{
          ...dto,
          browserActionType: this.browserActionData.browserActionType,
          actionParams: this.browserActionData.actionParams
        };
        break;
      default:
        break;
    }
    // ui prop
    delete dto['isValid'];
    return dto;
  }

  applyValidations(type: EventTypes): void {
    // based on the selected type make the respective cntrols required
    let requiredControls = [];
    switch (type) {
      case EventTypes.UpdateCaseStatusBasedOnStepResolution:
        requiredControls = ['refName', 'schemaId', 'resolutions', 'statusId'];
        break;
      case EventTypes.AutomaticAddSteps:
      case EventTypes.AutomaticRemoveSteps:
        requiredControls = ['steps'];
        break;

      case EventTypes.UpdateStatusBasedOnStepAdded:
        requiredControls = ['statusId'];
        break;
      default:
        console.log('default');
        break;
    }

    requiredControls.forEach((controlKey) => {
      this.additionalPropsGroup.controls[controlKey].setValidators(Validators.required);
      this.additionalPropsGroup.controls[controlKey].updateValueAndValidity();
    });
  }

  isFormValid(): boolean {
    if (this.diffActionData) {
      return this.actionsForm.valid && this.diffActionData.isValid;
    } else if (this.mathExpressionActionData) {
      return this.actionsForm.valid && this.mathExpressionActionData.isValid;
    } else if (this.webhookActionData) {
      return this.actionsForm.valid && this.webhookActionData.isValid;
    } else if (this.caseToStepData) {
      return this.actionsForm.valid && this.caseToStepData.isValid;
    } else if (this.copyActionData) {
      return this.actionsForm.valid && this.copyActionData.isValid;
    } else if (this.sendEmailActionData) {
      return this.actionsForm.valid && this.sendEmailActionData.isValid;
    } else if (this.autoIncrementActionData) {
      return this.actionsForm.valid && this.autoIncrementActionData.isValid;
    } else if (this.aggregationActionData) {
      return this.actionsForm.valid && this.aggregationActionData.isValid;
    } else if (this.isAutoIncrementSubAreaSelected()) {
      return !!this.additionalPropsGroup?.controls?.fieldPropertyPaths?.value?.length;
    } else if (this.rawDataToStepActionData) {
      return this.actionsForm.valid && this.rawDataToStepActionData.isValid;
    } else if (this.browserActionData) {
      return this.actionsForm.valid && this.browserActionData.isValid;
    }
    return this.actionsForm.valid;
  }

  isAutoIncrementSubAreaSelected(): boolean {
    if (this.allowMultipleSubAreas) {
      return this.actionsForm.controls?.subAreaMultiple?.value?.includes(WorkflowEventSubAreas.WorkflowOnAutoIncrementField);
    }
    return this.actionsForm.controls?.subArea?.value === WorkflowEventSubAreas.WorkflowOnAutoIncrementField;
  }

  diffActionDataUpdated(diffData: DiffActionData): void {
    this.diffActionData = cloneDeep(diffData);
  }

  mathActionDataUpdated(data: MathExpressionOutput): void {
    this.mathExpressionActionData = cloneDeep(data);
  }

  webhookActionDataUpdated(data: WebhookActionData): void {
    this.webhookActionData = cloneDeep(data);
  }

  caseToStepActionDataUpdated(data: CaseToStepData): void {
    this.caseToStepData = cloneDeep(data);
  }

  copyFieldsActionDataUpdated(data: CopyActionData): void {
    this.copyActionData = cloneDeep(data);
  }

  sendEmailActionDataUpdated(data: SendEmailActionData): void {
    this.sendEmailActionData = cloneDeep(data);
  }

  expressionUpdated(event: ExpressionDefOutput): void {
    this.expressionsDef = event.data;
  }

  aggregationActionDataUpdated(event: AggregationActionOutput): void {
    this.aggregationActionData = cloneDeep(event);
  }

  autoIncrementDataUpdated(event: AutoIncrementActionData): void {
    this.autoIncrementActionData = event;
  }

  rawDataToStepUpdated(event: RawDataToStepData): void {
    this.rawDataToStepActionData = event;
  }

  browserActionUpdated(event: BrowserActionData): void {
    this.browserActionData = event;
  }

  onFieldUpdate(event: PropertyPath[]): void {
    this.additionalPropsGroup.controls?.fieldPropertyPaths.setValue(event);
  }
}
