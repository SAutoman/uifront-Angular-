import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import {
  AreaTypeEnum,
  ConditionedProcessStepLinkOverrideDto,
  ProcessStepEntityDto,
  SchemaDto,
  WorkflowDto,
  WorkflowRightsEnum,
  WorkflowRightsNameMap,
  WorkflowStatusDto
} from '@wfm/service-layer';
import {
  ActionEventNameMap,
  BaseActionType,
  EventAreaScopes,
  EventTypes,
  ProcessStepLinksActionSubareaNameMap,
  ProcessStepLinksEventSubArea
} from '@wfm/service-layer/models/actionDto';
import { OverrideExpression } from '@wfm/service-layer/models/expressionModel';
import { ActionsComponent } from '@wfm/shared/actions/actions.component';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { LinkData } from '../create-process-step-links.component';
import { cloneDeep, sortBy } from 'lodash-core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { ExpressionConfig } from '../../rules-builder/rules-builder.component';
import { OverrideExpressionOutput } from '../../expression-builder/expression-builder.component';
import { WorkflowStateSchemaData } from '../../workflow-create/workflow-create.component';

interface RightsOption {
  name: string;
  value: WorkflowRightsEnum;
  isDisabled: boolean;
}

interface AreaActionsData {
  subArea: ProcessStepLinksEventSubArea;
  label: string;
  actions: BaseActionType[];
}

interface AllActionsByArea {
  deleteActions: BaseActionType[];
  stepAddedActions: BaseActionType[];
  resolvedActions: BaseActionType[];
  updateActions: BaseActionType[];
}

@Component({
  selector: 'app-link-override',
  templateUrl: './link-override.component.html',
  styleUrls: ['./link-override.component.scss']
})
export class LinkOverrideComponent extends TenantComponent implements OnInit {
  @Input() overrideDto: ConditionedProcessStepLinkOverrideDto;
  @Input() isDefaultOverride: boolean;
  @Input() workflow: WorkflowDto;
  @Input() processStep: ProcessStepEntityDto;
  @Input() statuses: WorkflowStatusDto[];
  @Input() linkData$: BehaviorSubject<LinkData>;
  @Input() workflowStateSchemasData: WorkflowStateSchemaData;

  @Output() overriderDataEmitter = new EventEmitter();
  overrideForm: FormGroup;
  linkData: LinkData;

  allRights: RightsOption[] = [];
  allowedRightOptions: RightsOption[] = [];
  disallowedRightOptions: RightsOption[] = [];

  isConditionVisible: boolean;
  stepSchema: SchemaDto;

  expressionConfig: ExpressionConfig = {
    title: 'Conditions',
    rules: true,
    // rulesLabel: 'When the selected rights/limitations shall be activated?',
    userRolesLabel: 'User Roles Targeted',
    userGroupsLabel: 'User Groups Targeted',
    buttons: false
  };

  expression: OverrideExpressionOutput;

  actionsByArea: AreaActionsData[] = [
    {
      subArea: ProcessStepLinksEventSubArea.OnStepDeleted,
      label: ProcessStepLinksActionSubareaNameMap.get(ProcessStepLinksEventSubArea.OnStepDeleted).viewValue,
      actions: []
    },
    {
      subArea: ProcessStepLinksEventSubArea.OnStepAdded,
      label: ProcessStepLinksActionSubareaNameMap.get(ProcessStepLinksEventSubArea.OnStepAdded).viewValue,
      actions: []
    },
    {
      subArea: ProcessStepLinksEventSubArea.OnStepResolved,
      label: ProcessStepLinksActionSubareaNameMap.get(ProcessStepLinksEventSubArea.OnStepResolved).viewValue,
      actions: []
    },
    {
      subArea: ProcessStepLinksEventSubArea.OnStepUpdated,
      label: ProcessStepLinksActionSubareaNameMap.get(ProcessStepLinksEventSubArea.OnStepUpdated).viewValue,
      actions: []
    }
  ];
  constructor(
    store: Store<ApplicationState>,
    private fb: FormBuilder,
    private matDialog: MatDialog,
    private dialogRef: MatDialogRef<LinkOverrideComponent>,
    private adminSchemasService: AdminSchemasService
  ) {
    super(store);
    this.populateRightOptions();
  }

  async ngOnInit() {
    this.linkData$.pipe(takeUntil(this.destroyed$)).subscribe((data) => {
      this.linkData = data;
      // if the step changes hence refName changes and there is a high possibility that expressions and actions will get corrupted, so we need to reset them
      this.expression = null;
    });
    this.overrideForm = this.fb.group({
      status: [],
      name: ['', !this.isDefaultOverride ? Validators.required : null],
      numberOfInstances: [1, [Validators.required, Validators.min(1), Validators.max(999)]],
      actions: [null],
      disallowedRights: [],
      rights: []
    });

    this.overrideForm.controls['disallowedRights'].valueChanges.subscribe((selectedValues: WorkflowRightsEnum[]) => {
      this.disableRightsInOppositeCollection('allowedRights', selectedValues);
    });

    this.overrideForm.controls['rights'].valueChanges.subscribe((selectedValues: WorkflowRightsEnum[]) => {
      this.disableRightsInOppositeCollection('disallowedRights', selectedValues);
    });

    if (this.processStep) {
      this.stepSchema = await this.adminSchemasService.getSchema(this.tenant, AreaTypeEnum.stepForm, this.processStep.schemaId);
    }

    if (this.overrideDto) {
      this.updateFormControls();
      this.loadActionsByAreas();
      this.expression = {
        data: cloneDeep(this.overrideDto.expression),
        isValid: true
      };
    }

    if (this.isDefaultOverride) {
      this.emitDataToParent();
      this.overrideForm.valueChanges.pipe(debounceTime(100), takeUntil(this.destroyed$)).subscribe((newData) => {
        this.emitDataToParent();
      });
    }
  }

  disableRightsInOppositeCollection(rightsToDisable: string, selectedRights: WorkflowRightsEnum[]) {
    if (rightsToDisable === 'allowedRights') {
      this.allowedRightOptions.forEach((rightOption) => {
        if (selectedRights?.indexOf(rightOption.value) >= 0) {
          rightOption.isDisabled = true;
        } else {
          rightOption.isDisabled = false;
        }
      });
    }
    if (rightsToDisable === 'disallowedRights') {
      this.disallowedRightOptions.forEach((rightOption) => {
        if (selectedRights?.indexOf(rightOption.value) >= 0) {
          rightOption.isDisabled = true;
        } else {
          rightOption.isDisabled = false;
        }
      });
    }
  }

  populateRightOptions(): void {
    const rights = [
      WorkflowRightsEnum.CanView,
      WorkflowRightsEnum.CanAdd,
      WorkflowRightsEnum.CanEdit,
      WorkflowRightsEnum.CanDelete,
      WorkflowRightsEnum.CanResolve,
      WorkflowRightsEnum.CanUnresolve,
      WorkflowRightsEnum.CanHighlightFields
    ];

    this.allRights = rights.map((x) => {
      return {
        name: WorkflowRightsNameMap.get(x).viewValue,
        value: WorkflowRightsNameMap.get(x).value,
        isDisabled: false
      };
    });

    this.allowedRightOptions = cloneDeep(this.allRights);
    this.disallowedRightOptions = cloneDeep(this.allRights);
  }

  loadActionsByAreas(): void {
    this.actionsByArea.forEach((actionData) => {
      switch (actionData.subArea) {
        case ProcessStepLinksEventSubArea.OnStepDeleted:
          actionData.actions = this.orderActions(this.overrideDto.onDeletedEvent || []);
          break;
        case ProcessStepLinksEventSubArea.OnStepAdded:
          actionData.actions = this.orderActions(this.overrideDto.onStepAddedEvent || []);
          break;
        case ProcessStepLinksEventSubArea.OnStepResolved:
          actionData.actions = this.orderActions(this.overrideDto.onProcessStepResolvedEvents || []);
          break;
        case ProcessStepLinksEventSubArea.OnStepUpdated:
          actionData.actions = this.orderActions(this.overrideDto.onStepUpdatedEvent || []);
          break;
        default:
          break;
      }
    });
  }

  updateFormControls() {
    this.overrideForm.patchValue({
      status: this.overrideDto.workflowStatusId || 'all',
      name: this.overrideDto.name || '',
      numberOfInstances: this.overrideDto.numberOfInstances,
      actions: this.overrideDto.onProcessStepResolvedEvents || null,
      disallowedRights: this.overrideDto.disallowedRights || null,
      rights: this.overrideDto.rights
    });
  }

  async openAction(action?: BaseActionType, index?: number, actionSubArea?: ProcessStepLinksEventSubArea) {
    this.stepSchema = await this.adminSchemasService.getSchema(this.tenant, AreaTypeEnum.stepForm, this.processStep.schemaId);
    const dialogRef = this.matDialog.open(ActionsComponent, {
      width: '500px'
    });
    dialogRef.componentInstance.actionArea = EventAreaScopes.ProcessStepLinkScope;
    dialogRef.componentInstance.workflow = this.workflow;
    dialogRef.componentInstance.currentProcessStep = this.processStep;
    dialogRef.componentInstance.stepLinkData = this.linkData;
    dialogRef.componentInstance.subArea = actionSubArea;
    dialogRef.componentInstance.targetSchema = this.stepSchema;
    if (action) {
      dialogRef.componentInstance.actionDto = action;
    }
    dialogRef.afterClosed().subscribe((x) => {
      if (x && x.actionDto && x.subAreas) {
        this.actionsByArea = cloneDeep(this.actionsByArea);
        for (let i = 0; i < this.actionsByArea.length; i++) {
          const actionData = this.actionsByArea[i];
          if (actionSubArea && actionSubArea === actionData.subArea && (index || index === 0)) {
            // updating existing
            actionData.actions.splice(index, 1, cloneDeep(x.actionDto));
          } else if (!actionSubArea && x.subAreas.includes(actionData.subArea)) {
            // creating a new action
            actionData.actions.push(cloneDeep(x.actionDto));
          }
          actionData.actions = this.updateActionsOrders(actionData.actions);
        }
        if (this.isDefaultOverride) {
          this.emitDataToParent();
        }
      }
    });
  }

  removeAction(subArea: ProcessStepLinksEventSubArea, actionIndex: number): void {
    for (let index = 0; index < this.actionsByArea.length; index++) {
      this.actionsByArea = cloneDeep(this.actionsByArea);
      const actionData = this.actionsByArea[index];
      if (actionData.subArea === subArea) {
        actionData.actions.splice(actionIndex, 1);
        actionData.actions = this.updateActionsOrders(actionData.actions);
        break;
      }
    }
    this.emitDataToParent();
  }

  getEventName(type: EventTypes): string {
    return ActionEventNameMap.get(type).viewValue;
  }

  updateRights(event) {
    if (event.data) {
      this.overrideForm.patchValue({
        permissions: event.data
      });
    }
  }

  toggleCondition() {
    this.isConditionVisible = !this.isConditionVisible;
  }

  emitDataToParent() {
    let data = this.prepareOverrideData();
    this.overriderDataEmitter.emit({ data: data, isLinkOverrideFormValid: this.overrideForm.valid });
  }

  prepareOverrideData(): ConditionedProcessStepLinkOverrideDto {
    let formValues = this.overrideForm.value;

    let data: ConditionedProcessStepLinkOverrideDto;
    const actionsByArea = this.getActionsByArea();
    data = {
      numberOfInstances: formValues.numberOfInstances,
      rights: formValues.rights?.length ? formValues.rights : null,
      disallowedRights: formValues.disallowedRights?.length ? formValues.disallowedRights : null,
      onDeletedEvent: actionsByArea.deleteActions || [],
      onStepAddedEvent: actionsByArea.stepAddedActions || [],
      onProcessStepResolvedEvents: actionsByArea.resolvedActions,
      onStepUpdatedEvent: actionsByArea.updateActions || []
    };

    if (!this.isDefaultOverride) {
      data = {
        ...data,
        name: formValues.name || null,
        workflowStatusId: formValues.status && formValues.status !== 'all' ? formValues.status : null,
        expression: this.expression?.data || null
      };
    }
    // remove props with null value
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const prop = data[key];
        if (!prop) {
          delete data[key];
        }
      }
    }
    if (this.overrideDto) {
      data.id = this.overrideDto.id;
    }
    return data;
  }

  getActionsByArea(): AllActionsByArea {
    let stepDeleteActions: BaseActionType[],
      stepAddedActions: BaseActionType[],
      stepResolvedActions: BaseActionType[],
      stepUpdatedActions: BaseActionType[] = [];

    this.actionsByArea.forEach((actionData) => {
      switch (actionData.subArea) {
        case ProcessStepLinksEventSubArea.OnStepDeleted:
          stepDeleteActions = this.updateActionsOrders(actionData.actions);
          break;
        case ProcessStepLinksEventSubArea.OnStepAdded:
          stepAddedActions = this.updateActionsOrders(actionData.actions);
          break;
        case ProcessStepLinksEventSubArea.OnStepResolved:
          stepResolvedActions = this.updateActionsOrders(actionData.actions);
          break;
        case ProcessStepLinksEventSubArea.OnStepUpdated:
          stepUpdatedActions = this.updateActionsOrders(actionData.actions);
          break;
        default:
          break;
      }
    });
    return {
      deleteActions: stepDeleteActions,
      stepAddedActions: stepAddedActions,
      resolvedActions: stepResolvedActions,
      updateActions: stepUpdatedActions
    };
  }

  saveAndClose() {
    if (this.overrideForm.valid) {
      let data = this.prepareOverrideData();
      if (this.dialogRef) {
        this.dialogRef.close({
          data
        });
      }
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  expressionUpdated(event: OverrideExpressionOutput): void {
    this.expression = null;
    if (event.data) {
      this.expression = cloneDeep(event);
    }
  }

  getAllowedRightsPlaceholder(): string {
    return this.isDefaultOverride ? 'Allowed Rights (applied to ALL users)' : 'Allowed Rights';
  }

  getDisallowedRightsPlaceholder(): string {
    return this.isDefaultOverride ? 'Forbidden Rights (applied to ALL users)' : 'Forbidden Rights';
  }

  onActionDrag(e: CdkDragDrop<BaseActionType[]>, actionArea: AreaActionsData): void {
    if (e.previousContainer === e.container) {
      const reorderedData: BaseActionType[] = cloneDeep(e.container.data);
      moveItemInArray(reorderedData, e.previousIndex, e.currentIndex);
      actionArea.actions = this.updateActionsOrders(reorderedData);
    }
    this.emitDataToParent();
  }

  private updateActionsOrders(items: BaseActionType[]): BaseActionType[] {
    const clonedItems = cloneDeep(items);
    clonedItems.forEach((x, idx) => {
      if (x.index !== idx) {
        x.index = idx;
      }
    });
    return clonedItems;
  }

  orderActions(actions: BaseActionType[]): BaseActionType[] {
    return sortBy(actions || [], [(x) => x.index]);
  }
}
