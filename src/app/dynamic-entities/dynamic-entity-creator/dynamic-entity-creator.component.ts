/**
 * global
 */
import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { Actions } from '@ngrx/effects';
import { filter, take, takeUntil } from 'rxjs/operators';
import { FormControl, Validators } from '@angular/forms';

import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

/**
 * project
 */
import { FormlyModel, IConfigurableListItem } from '@wfm/common/models';
import {
  APP_CLIENT_ID,
  AreaTypeEnum,
  ColumnSettings,
  CreateDynamicEntityDto,
  CreateWorkflowStateCommand,
  DynamicEntitiesService,
  DynamicEntityDto,
  EvokedAnswerSettingsEnum,
  FieldTypeIds,
  Operation,
  SchemaDto,
  SchemaFieldDto,
  SettingsUI,
  UpdateDynamicEntityDto,
  VirtualFieldValueDto,
  WorkflowStateService
} from '@wfm/service-layer';
import { BaseFieldConverter } from '@wfm/service-layer/helpers';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { BaseFieldValueType, EmbededFieldValueDto } from '@wfm/service-layer/models/FieldValueDto';
import { CreateWorkflowStates, CreateWorkflowStatesSuccess, WorkflowActionTypes } from '@wfm/store/workflow';
import { cloneDeep } from 'lodash-core';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { PropertyPath } from '@wfm/service-layer/models/expressionModel';
import { EvokedAnswerSettingService } from '@wfm/service-layer/services/evoked-answer-setting.service';
import { postCaseSaveSetting } from '@wfm/users/evoked-answer-settings/evoked-answer-settings.component';
import { FormlyDataOutput } from '@wfm/common/form-builder-components/form-builder-form-preview/form-builder-form-preview.component';
import { CaseGridComponent } from '@wfm/shared/case-grid/case-grid.component';
import { Row, DynamicEntitySystemFields } from '@wfm/shared/dynamic-entity-grid/dynamic-entity-grid.component';
/**
 * local
 */
import { ApplicationState } from './../../store/application-state';
import { ValueMap } from '@wfm/workflow-state/workflow-state-case/workflow-state-case.component';
import { GridSystemFieldsEnum, SystemFieldsTitleFormatter } from '@wfm/shared/dynamic-entity-grid/dynamic-grid-system-fields';
import { tenantSettingsSelector } from '@wfm/store';
import { schemaPermissionSettingsKey } from '@wfm/tenants/manual-creation-settings-by-schema/manual-creation-settings-by-schema.component';
import { WorkflowOverviewDto } from '@wfm/service-layer/services/rawdata-link.service';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';
import { isUndefinedOrNull } from '@wfm/shared/utils';

@Component({
  selector: 'app-dynamic-entity-creator',
  templateUrl: './dynamic-entity-creator.component.html',
  styleUrls: ['./dynamic-entity-creator.component.scss']
})
export class DynamicEntityCreatorComponent extends TenantComponent implements OnInit {
  @Input() deItem?: Row;
  @Input() fields?: SchemaFieldDto[];
  @Input() allowActionsFor?: AreaTypeEnum;
  @Input() schema: SchemaDto;
  @Input() schemaId: string;
  @Input() areaTypeFromGrid: AreaTypeEnum;
  @Input() isEdit?: boolean;
  @Input() rows: DynamicEntityDto[];
  @Input() selectedGridItems?: GridDataResult;
  @Input() rawDataColumns: ColumnSettings[];
  @Input() isStepResolved: boolean;
  @Input() allowStepHighlighting: boolean;
  @Input() userId: string;
  @Input() workflow: WorkflowOverviewDto;
  @Input() isChildRawData?: boolean;
  @Input() stepDe?: DynamicEntityDto;

  /**
   * use to disable all the fields of the dynamic entity creator form
   */
  @Input() isFormDisabled: boolean;
  @Input() activeFieldPath?: PropertyPath;
  @Input() hideCreateAndProceedBtn?: boolean;
  @Output() close: EventEmitter<boolean> = new EventEmitter();
  @Output() stepFormValueEmitter: EventEmitter<FormlyDataOutput> = new EventEmitter();
  @Output() stepHighlightsEmitter: EventEmitter<FormlyModel> = new EventEmitter();
  @Output() operationEmitter: EventEmitter<Operation[]> = new EventEmitter();
  @Output() closeCreator: EventEmitter<Operation> = new EventEmitter();
  @Output() reloadComments: EventEmitter<boolean> = new EventEmitter();
  @Output() fieldPathEmitter: EventEmitter<PropertyPath> = new EventEmitter();
  @Output() caseForMultipleWorkflow: EventEmitter<{ workflowId: string; caseId: string }> = new EventEmitter();
  schemaFields$ = new Observable<IConfigurableListItem[]>();
  title: string;
  closeDialogEvent: boolean;
  isLoading: boolean = true;
  isAddClicked: boolean = false;
  pageSize: number = 100;
  pageNumber: number = 1;
  numberOfEntitiesControl: FormControl;
  virtualFields: VirtualFieldValueDto<BaseFieldValueType>[];
  systemFields: DynamicEntitySystemFields;
  get areaType() {
    return AreaTypeEnum;
  }

  hideMultiCreationButton: boolean = true;

  constructor(
    @Inject(APP_CLIENT_ID) readonly appId: string,
    private adminSchemasService: AdminSchemasService,
    private dynamicEntitiesService: DynamicEntitiesService,
    private snackBar: MatSnackBar,
    private store: Store<ApplicationState>,
    private action$: Actions,
    public dialog: MatDialog,
    private evokedSettingsService: EvokedAnswerSettingService,
    private ts: TranslateService,
    private cd: ChangeDetectorRef,
    private errorHandlerService: ErrorHandlerService,
    private wfStateService: WorkflowStateService
  ) {
    super(store);
  }

  toggleCreator() {
    this.closeCreator.emit();
    this.numberOfEntitiesControl?.setValue(1);
  }

  async ngOnInit(): Promise<void> {
    if (this.deItem) {
      this.virtualFields = this.deItem._virtualFields;
      this.systemFields = this.deItem.systemFields;
    }

    if (this.stepDe) {
      this.systemFields = {
        statusId: null,
        createdAt: this.stepDe.createdAt,
        updatedAt: this.stepDe.updatedAt
      };
    }
    this.numberOfEntitiesControl = new FormControl(1, [Validators.min(1), Validators.pattern(/^\d*$/)]);
    switch (this.areaTypeFromGrid) {
      case this.areaType.rawData:
        this.title = this.isEdit ? 'Edit' : 'Add';
        if (this.deItem && this.isEdit) {
          this.populateSchemaFieldsWithValues();
        } else {
          this.schemaFields$ = of(
            this.fields.filter((f) => f.fieldName !== GridSystemFieldsEnum.STATUS).map((field) => BaseFieldConverter.toUi(field))
          );
          this.schemaFields$.subscribe((data) =>
            data.filter((f) => f.name.toLowerCase() === 'externalkey').map((f) => (f.configuration.readonly = true))
          );
        }

        this.isLoading = false;
        break;

      case this.areaType.case:
        this.title = 'Create Case';
        await this.getSchemaAndFields(this.schemaId, AreaTypeEnum.case);
        this.isLoading = false;
        this.cd.detectChanges();
        break;

      case this.areaType.stepForm:
        this.populateFields();
        this.isLoading = false;
        break;

      case this.areaType.comment:
        if (this.deItem) {
          this.isEdit = true;
          this.populateSchemaFieldsWithValues();
        } else {
          this.populateFields();
        }
        this.isLoading = false;
        break;

      default:
        break;
    }

    this.store.pipe(select(tenantSettingsSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x?.length && this.schemaId) {
        const selectedSchemaSettings = x.find((x) =>
          x.key.includes(`${schemaPermissionSettingsKey}_${this.schemaId}_${AreaTypeEnum.rawData}`)
        );
        if (selectedSchemaSettings && !isUndefinedOrNull(selectedSchemaSettings?.value['disableMultiCreation'])) {
          this.hideMultiCreationButton = selectedSchemaSettings?.value?.disableMultiCreation;
        }
      }
    });
  }

  populateSchemaFieldsWithValues(): void {
    const schemaFields = this.populateSchemaFieldValues(this.fields, this.deItem.valueMap);
    this.schemaFields$ = of(
      schemaFields.filter((f) => f.fieldName !== GridSystemFieldsEnum.STATUS).map((field) => BaseFieldConverter.toUi(field))
    );
    this.schemaFields$.subscribe((data) =>
      data.filter((f) => f.name.toLowerCase() === 'externalkey').map((f) => (f.configuration.readonly = true))
    );
  }

  private populateSchemaFieldValues(fields: SchemaFieldDto[], valuesMap: ValueMap): SchemaFieldDto[] {
    const fieldsCopy: SchemaFieldDto[] = cloneDeep(fields);
    fieldsCopy.forEach((field) => {
      if (field.type !== FieldTypeIds.EmbededField) {
        if (valuesMap[field.fieldName]) {
          field.configuration.value = valuesMap[field.fieldName].value;
        }
        if (field.type === FieldTypeIds.ConnectorField && this.virtualFields) {
          field.configuration.exposedFieldsData = this.virtualFields.find((f) => f.fieldName === field.fieldName);
        }
      } else {
        const nestedValuesMap = valuesMap[field.fieldName] || {};
        field.fields = this.populateSchemaFieldValues(field.fields, nestedValuesMap);
      }
    });
    // order based on the configuration.position
    let orderedFields = fieldsCopy.sort((a, b) => a.configuration?.position - b.configuration?.position);
    return orderedFields;
  }

  previewCase() {
    this.dialog.open(CaseGridComponent, {
      width: '900px',
      data: { itemsWithValues: this.selectedGridItems, dataColumns: this.rawDataColumns, isDialog: true, hideDeleteBtn: true }
    });
  }

  populateFields(): void {
    this.schemaFields$ = of(this.schema?.fields?.map((field) => BaseFieldConverter.toUi(field)));
  }

  /** create/update RawData, update Comment
   * @param form
   * @returns
   */

  async onSubmit(data: FormlyDataOutput): Promise<void> {
    if (data.form.status === 'INVALID') {
      this.snackBar.open(this.ts.instant('Form is invalid!'), 'CLOSE', { duration: 3000 });
      return;
    }

    if (this.isEdit) {
      try {
        const cmd: UpdateDynamicEntityDto = {
          appId: this.appId,
          tenantId: this.tenant,
          schemaId: this.schemaId,
          areaType: this.areaTypeFromGrid,
          fields: this.populateDynamicEntityFields(data.model, this.schema.fields),
          publicId: this.deItem.publicId
        };
        const op = await this.dynamicEntitiesService.update(cmd);
        if (op.status?.toString()?.toLowerCase() === 'success') {
          this.snackBar.open(this.ts.instant('Data Edited Successfully!'), 'CLOSE', { duration: 2000 });
          if (this.areaTypeFromGrid === this.areaType.comment) {
            this.closeCreator.emit();
            this.reloadComments.emit(true);
          } else this.close.emit(this.closeDialogEvent);
        }
      } catch (error) {
        this.errorHandlerService.getAndShowErrorMsg(error);
        this.close.emit(false);
      }
    } else {
      try {
        const cmd: CreateDynamicEntityDto = {
          appId: this.appId,
          tenantId: this.tenant,
          schemaId: this.schemaId,
          areaType: this.areaTypeFromGrid,
          fields: this.populateDynamicEntityFields(data.model, this.schema.fields, true)
        };
        let createRequests = [];
        const numberOfItems = this.numberOfEntitiesControl.value || 1;
        for (let index = 1; index <= numberOfItems; index++) {
          createRequests.push(this.dynamicEntitiesService.create(cmd));
        }
        const operations = await Promise.all(createRequests);
        if (this.areaTypeFromGrid === this.areaType.comment) {
          this.operationEmitter.emit(operations);
        } else {
          if (this.isChildRawData) this.operationEmitter.emit(operations);
          else this.close.emit(this.closeDialogEvent);
        }
        if (!data.keepFormOpen) {
          this.toggleCreator();
        }
        this.snackBar.open(this.ts.instant('Data Added Successfully!'), 'CLOSE', { duration: 2000 });
      } catch (error) {
        this.errorHandlerService.getAndShowErrorMsg(error);
        this.close.emit(false);
      }
    }
  }

  closeDialog(close: boolean) {
    if (close) {
      this.closeDialogEvent = close;
    } else {
      this.close.emit(true);
    }
  }

  mapValuesToFields(field: SchemaFieldDto, row: Row): SchemaFieldDto {
    let f = { ...field };
    f.value = row[f.fieldName];

    return f;
  }

  async getSchemaAndFields(id: string, areaType: AreaTypeEnum): Promise<void> {
    this.schema = await this.adminSchemasService.getSchema(this.tenant, areaType, id);

    this.schemaFields$ = of(this.schema.fields.map((field) => BaseFieldConverter.toUi(field)));
  }

  onCaseProceed(data: FormlyDataOutput): void {
    const caseDynamicPayload: CreateDynamicEntityDto = {
      appId: this.appId,
      tenantId: this.tenant,
      areaType: this.areaTypeFromGrid,
      schemaId: this.schema.id,
      fields: this.populateDynamicEntityFields(data.model, this.schema.fields, true)
    };
    if (!data?.createForMultipleWorkflow) this.onCaseCreate(caseDynamicPayload, data.keepFormOpen);
    else this.createCaseForMultipleWorkflow(caseDynamicPayload);
  }

  /**
   * create a Case dynamic entity
   * @param form
   */

  async onCaseCreate(caseDynamicPayload: CreateDynamicEntityDto, keepOpen: boolean): Promise<void> {
    try {
      this.store.dispatch(
        new CreateWorkflowStates({
          tenantId: this.tenant,
          case: caseDynamicPayload,
          schemaId: this.workflow.workflowSchemaId
        })
      );
      this.action$
        .pipe(
          filter((action) => action.type === WorkflowActionTypes.CreateWorkflowStatesSuccess),
          take(1)
        )
        .subscribe(async (action: CreateWorkflowStatesSuccess) => {
          this.snackBar.open(this.ts.instant('Case Created Successfully!'), 'CLOSE', { duration: 2000 });
          if (!keepOpen) {
            this.closeCreator.emit();
            let wfId = action.payload?.workflowStateId;
            this.postSaveAction(wfId);
          }
        });
    } catch (error) {
      console.log(error);
    }
  }

  async createCaseForMultipleWorkflow(caseDynamicPayload: CreateDynamicEntityDto): Promise<void> {
    // Call API for creating a case
    try {
      const result = await this.createCase(caseDynamicPayload, this.workflow.workflowSchemaId);
      if (result?.status?.toString()?.toLowerCase() === 'success') {
        this.snackBar.open(this.ts.instant('Case Created Successfully'), this.ts.instant('Ok'), { duration: 3000 });
        this.caseForMultipleWorkflow.emit({ workflowId: this.workflow.workflowSchemaId, caseId: result?.targetId });
      } else {
        this.snackBar.open(result?.errorMsg, this.ts.instant('Ok'), { duration: 3000 });
      }
    } catch (error) {
      this.errorHandlerService.getAndShowErrorMsg(error);
    }
  }

  async createCase(caseData: CreateDynamicEntityDto, workflowSchemaId: string): Promise<Operation> {
    const cmd: CreateWorkflowStateCommand = {
      tenantId: caseData.tenantId,
      schemaId: workflowSchemaId,
      case: caseData
    };
    const operation = await this.wfStateService.create(cmd);
    return operation;
  }

  postSaveAction(wfId: string): void {
    let existingSetting: SettingsUI = this.evokedSettingsService.checkForEvokedAnswerSetting(postCaseSaveSetting);
    const settingValue: EvokedAnswerSettingsEnum = existingSetting?.value?.setting;
    this.evokedSettingsService.makePostCaseCreationAction(
      settingValue,
      existingSetting,
      postCaseSaveSetting,
      wfId,
      this.workflow.workflowSchemaId,
      this.userId,
      null,
      this.workflow.caseSchemaId
    );
  }

  stepFormValueEmitted(stepFormData: FormlyDataOutput): void {
    this.stepFormValueEmitter.emit(stepFormData);
  }

  onStepHighlightsEmit(event: FormlyModel): void {
    this.stepHighlightsEmitter.emit(event);
  }

  getSystemFields(data: DynamicEntityDto): SystemFieldsTitleFormatter[] {
    const statusField = {
      id: GridSystemFieldsEnum.STATUS,
      type: FieldTypeIds.StringField,
      value: data.statusId
    };
    return [statusField];
  }

  fieldPathEmitted(pathEvent: PropertyPath): void {
    this.fieldPathEmitter.emit(pathEvent);
  }

  hasError(errorName: string): boolean {
    return this.numberOfEntitiesControl.hasError(errorName);
  }

  private populateDynamicEntityFields(
    formModel: FormlyModel,
    schemaFields: SchemaFieldDto[],
    isCreateMode?: boolean
  ): BaseFieldValueType[] {
    let fields = [];
    schemaFields.forEach((field) => {
      const key = field.fieldName;

      if (this.rows && field.type === FieldTypeIds.ListOfLinksField) {
        const value: string[] =
          field.configuration.schemaAreaType === AreaTypeEnum.rawData && field.configuration.schemaId === this.rows[0].schemaId
            ? this.rows.map((row) => row.id)
            : [];
        fields.push({
          type: FieldTypeIds.ListOfLinksField,
          value: value,
          id: field.fieldName
        });
      } else if (field.type !== FieldTypeIds.EmbededField) {
        let data = <BaseFieldValueType>{
          id: key,
          type: field.type
        };
        const value = this.dynamicEntitiesService.mapFieldTypeToBaseFieldValue(field.type, formModel[key]);
        // in update mode "null" means RESET value

        if ((isCreateMode && !isUndefinedOrNull(value)) || (!isCreateMode && value !== undefined)) {
          data.value = value;
          fields.push(data);
        }
      } else {
        const embeddedFields = this.populateDynamicEntityFields(formModel[key], field.fields, isCreateMode);
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
}
