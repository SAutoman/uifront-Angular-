import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MAT_SELECT_CONFIG, MatSelectChange } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Actions } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { GridDataResult } from '@progress/kendo-angular-grid';
import {
  DynamicEntityDto,
  ColumnSettings,
  Operation,
  AreaTypeEnum,
  keyForSchemaTitleSettings,
  UiAreasEnum,
  DynamicEntitiesService,
  FieldTypeIds,
  SchemaTitleSettingModel,
  SchemaDto,
  WorkflowStateCaseDto,
  UpdateStateCase,
  APP_CLIENT_ID,
  GetWorkflowByRawDataQuery,
  SettingsUI,
  EvokedAnswerSettingsEnum,
  WorkflowDto
} from '@wfm/service-layer';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { TitleSettingsHelperService } from '@wfm/service-layer/services/title-settings-helper-service';
import { GridSystemFieldsEnum, SystemFieldsTitleFormatter } from '@wfm/shared/dynamic-entity-grid/dynamic-grid-system-fields';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState, tenantSettingsSelector } from '@wfm/store';
import { UpdateWorkflowStateCase, WorkflowActionTypes } from '@wfm/store/workflow';
import { takeUntil, filter, take, distinctUntilChanged } from 'rxjs/operators';
import { cloneDeep } from 'lodash-core';
import { Observable } from 'rxjs';
import { ListOfLinkFieldValueDto } from '@wfm/service-layer/models/FieldValueDto';
import {
  CasesForRawDataReference,
  FailedOverrides,
  RawdataLinkService,
  WorkflowOverviewDto
} from '@wfm/service-layer/services/rawdata-link.service';
import { Row } from '@wfm/shared/dynamic-entity-grid/dynamic-entity-grid.component';
import { EvokedAnswerSettingService } from '@wfm/service-layer/services/evoked-answer-setting.service';
import { postCaseSaveSetting } from '@wfm/users/evoked-answer-settings/evoked-answer-settings.component';
import { CasePrintPreviewComponent } from '@wfm/workflow-state/case-print-preview/case-print-preview.component';
import { FailedRulesComponent } from '@wfm/shared/dynamic-entity-grid/failed-rules/failed-rules.component';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

interface CaseDynamicEntityInterface extends DynamicEntityDto {
  workflowStateId: string;
  title?: string;
}

export interface FailedOverrideData {
  workflowName: string;
  failedRules: FailedOverrides[];
}

interface MultipleWorkflowCase {
  workflowId: string;
  schema: WorkflowOverviewDto;
  schemaId: string;
  workflowName: string;
  disable: boolean;
}

@Component({
  selector: 'app-case-creator-wrapper',
  templateUrl: './case-creator-wrapper.component.html',
  styleUrls: ['./case-creator-wrapper.component.scss'],
  providers: [
    {
      provide: MAT_SELECT_CONFIG,
      useValue: { overlayPanelClass: 'custom-width' }
    }
  ]
})
export class CaseCreatorWrapperComponent extends TenantComponent implements OnInit {
  @ViewChild('failedRulesDialog') failedRuleTemplateRef: TemplateRef<FailedRulesComponent>;

  @Input() rawDataDeItems$: Observable<DynamicEntityDto[]>;
  @Input() selectedGridItems: GridDataResult;
  @Input() rawDataColumns: ColumnSettings[];
  @Input() userId: string;
  @Input() rawDataSchemaId: string;

  @Output() closeCreator: EventEmitter<Operation> = new EventEmitter();
  rawDataDeItems: DynamicEntityDto[];

  addToNewWorkflowMultipleSelector: FormControl;
  addToExistingWorkflowSelector: FormControl;

  addToNewWorkflows: WorkflowOverviewDto[];
  newCaseSchema: SchemaDto;
  newCaseSchemaId: string;
  newWorkflow: WorkflowOverviewDto;

  addToExistingWorkflows: CasesForRawDataReference[];
  existingCaseSchema: SchemaDto;
  existingCaseSchemaId: string;
  existingWorkflow: CasesForRawDataReference;

  addToExistingLoading: boolean;
  addToNewLoading: boolean;
  addToNewFailures: Array<FailedOverrideData> = [];
  addToExistingFailures: Array<FailedOverrideData> = [];

  caseOptions: CaseDynamicEntityInterface[];
  caseOptionsListForDisplay: CaseDynamicEntityInterface[];
  caseId: string;
  totalCasesListItems: number = 0;
  casesSearchTerm: FormControl = new FormControl(null);
  currentUiTitleSetting: SchemaTitleSettingModel;

  titleSettings: SettingsUI[];
  selectedWorkflows: MultipleWorkflowCase[] = [];
  showFailedWfDetailsKey: string = 'showFailedWfDetails';
  showWorkflowFailedDetails: boolean = false;

  get areaTypeEnum() {
    return AreaTypeEnum;
  }

  constructor(
    @Inject(APP_CLIENT_ID) readonly appId: string,
    private dynamicEntitiesService: DynamicEntitiesService,
    private snackBar: MatSnackBar,
    private store: Store<ApplicationState>,
    private action$: Actions,
    public dialog: MatDialog,
    private ts: TranslateService,
    private cd: ChangeDetectorRef,
    private titleSettingsHelperService: TitleSettingsHelperService,
    private adminSchemasService: AdminSchemasService,
    private rawdataLinkService: RawdataLinkService,
    private evokedSettingsService: EvokedAnswerSettingService
  ) {
    super(store);
    const storedData: string = localStorage.getItem(this.showFailedWfDetailsKey);
    if (storedData) this.showWorkflowFailedDetails = JSON.parse(storedData);
  }

  ngOnInit(): void {
    this.store.pipe(select(tenantSettingsSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      this.titleSettings = x?.filter((x) => x.key.includes(keyForSchemaTitleSettings));
    });
    this.initFormControls();

    this.rawDataDeItems$.pipe(distinctUntilChanged(), takeUntil(this.destroyed$)).subscribe(async (items) => {
      this.rawDataDeItems = items;
      this.newWorkflow = null;
      this.newCaseSchemaId = null;
      this.newCaseSchema = null;

      this.existingWorkflow = null;
      this.existingCaseSchemaId = null;
      this.existingCaseSchema = null;

      await Promise.all([this.queryForAddToNew(), this.queryForAddToExisting()]);
      this.cd.detectChanges();
    });
    this.casesSearchTerm.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((x: string) => {
      this.onSearch(x);
    });
  }

  initFormControls(): void {
    this.addToExistingWorkflowSelector = new FormControl();
    this.addToNewWorkflowMultipleSelector = new FormControl();

    this.addToExistingWorkflowSelector.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(async (wfId: string) => {
      if (wfId) {
        this.existingWorkflow = this.addToExistingWorkflows.find((item) => item.workflowSchemaId === wfId);
        this.existingCaseSchemaId = this.existingWorkflow['caseSchemaId'];
        this.existingCaseSchema = await this.getCaseSchemaAndSettings(this.existingCaseSchemaId);

        this.currentUiTitleSetting = this.titleSettingsHelperService.findApplicableTitleSettings(
          this.existingCaseSchemaId,
          this.titleSettings,
          UiAreasEnum.caseQuickInfo
        );

        await this.populateCaseOptions();
        this.cd.detectChanges();
      }
    });

    this.addToNewWorkflowMultipleSelector.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(async (wfIds: string[]) => {
      const existingWorkflows: MultipleWorkflowCase[] = cloneDeep(this.selectedWorkflows);
      this.selectedWorkflows = [];
      if (wfIds?.length) {
        for (let index = 0; index < wfIds.length; index++) {
          const id = wfIds[index];
          const schema = await this.getWorkflowSchemaAndSettings(id);
          const obj: MultipleWorkflowCase = {
            workflowId: id,
            schema: schema,
            schemaId: schema.caseSchemaId,
            workflowName: this.addToNewWorkflows?.find((x) => x.workflowSchemaId === id)?.name,
            disable: existingWorkflows?.length ? existingWorkflows?.find((w) => w.workflowId === id)?.disable : false
          };
          this.selectedWorkflows.push(obj);
        }
      }
    });
  }

  async getWorkflowSchemaAndSettings(wfId: string): Promise<WorkflowOverviewDto> {
    return this.addToNewWorkflows.find((wf) => wf.workflowSchemaId === wfId);
  }

  async populateCaseOptions(): Promise<void> {
    this.totalCasesListItems = (<CasesForRawDataReference>this.existingWorkflow).cases.length;

    this.caseOptions =
      (<CasesForRawDataReference>this.existingWorkflow).cases.map((caseItem: DynamicEntityDto) => {
        let caseWithFilteredFields = this.filterCaseFields(caseItem);
        let caseDE: CaseDynamicEntityInterface = {
          ...caseWithFilteredFields,
          statusId: caseItem.statusId,
          workflowStateId: caseItem.id
        };

        return caseDE;
      }) || [];
    for (const caseItem of this.caseOptions) {
      const titleFields = this.currentUiTitleSetting
        ? this.titleSettingsHelperService.populateTitleFields(caseItem.fields, this.currentUiTitleSetting, this.getSystemFields(caseItem))
        : [];
      const titleString: string = await this.titleSettingsHelperService.populateDynamicEntityTitle(
        titleFields,
        this.currentUiTitleSetting,
        this.existingCaseSchema
      );
      caseItem.title = this.titleSettingsHelperService.extractStringFromHTML(titleString.replace(/<br\s*\/?>/gi, ' '));
    }

    this.caseOptionsListForDisplay = cloneDeep(this.caseOptions);

    this.cd.detectChanges();
  }

  onSearch(term: string): void {
    if (term.trim().length > 0) {
      const casesWithFields = this.caseOptions?.filter((x) => x.fields?.length > 0);
      if (casesWithFields?.length) {
        this.caseOptionsListForDisplay = casesWithFields?.filter((x) => x.title?.toLowerCase()?.includes(term?.toLowerCase()));
      }
    } else this.caseOptionsListForDisplay = this.caseOptions;
  }

  async getCaseSchemaAndSettings(schemaId: string): Promise<SchemaDto> {
    return await this.adminSchemasService.getSchema(this.tenant, AreaTypeEnum.case, schemaId);
  }

  onCaseSelected(caseRef: MatSelectChange): void {
    this.caseId = caseRef.value;
  }

  getSystemFields(data: DynamicEntityDto): SystemFieldsTitleFormatter[] {
    const statusField = {
      id: GridSystemFieldsEnum.STATUS,
      type: FieldTypeIds.StringField,
      value: data.statusId
    };
    return [statusField];
  }

  /**
   * filter out the case fields tat hold entity ids
   * @param wfStateCase
   * @returns
   */
  filterCaseFields(wfStateCase: WorkflowStateCaseDto): WorkflowStateCaseDto {
    let filtered = {
      ...wfStateCase,
      fields: wfStateCase.fields.filter((field) => {
        return field.type !== FieldTypeIds.ListOfLinksField;
      })
    };
    return filtered;
  }

  toggleCreator(): void {
    this.closeCreator.emit();
    // this.numberOfEntitiesControl?.setValue(1);
  }

  async updateCaseRawDataItems(): Promise<void> {
    try {
      const caseDe = await this.dynamicEntitiesService.getById(
        this.tenant,
        this.caseId,
        this.existingCaseSchemaId,
        AreaTypeEnum.case,
        true
      );
      const rawDataSchema = this.existingCaseSchema.fields?.find(
        (f) =>
          f.type === FieldTypeIds.ListOfLinksField &&
          f.configuration.schemaAreaType === AreaTypeEnum.rawData &&
          this.rawDataDeItems[0].schemaId === f.configuration.schemaId
      );

      let rawDataIds: ListOfLinkFieldValueDto = {
        type: FieldTypeIds.ListOfLinksField,
        id: rawDataSchema.fieldName,
        value: []
      };
      caseDe.fields = caseDe.fields?.filter((f) => {
        if (f.type === FieldTypeIds.ListOfLinksField && f.id === rawDataSchema?.fieldName) {
          rawDataIds = cloneDeep(f);
          return false;
        }
        return true;
      });

      let idsToBeAdded = [];
      this.rawDataDeItems.forEach((row) => idsToBeAdded.push(row.id));
      if (rawDataIds.value) {
        idsToBeAdded = idsToBeAdded.concat(rawDataIds.value);
      } else {
        rawDataIds.value = idsToBeAdded;
      }
      rawDataIds.value = idsToBeAdded;
      rawDataIds.value = Array.from(new Set(rawDataIds.value));

      caseDe.fields.push(rawDataIds);

      const cmd: UpdateStateCase = {
        workflowStateId: caseDe.id,
        tenantId: this.tenant,
        caseDynamicEntity: {
          appId: this.appId,
          tenantId: this.tenant,
          schemaId: this.existingCaseSchema.id,
          areaType: AreaTypeEnum.case,
          fields: caseDe.fields
        },
        schemaId: this.existingWorkflow.workflowSchemaId
      };
      this.store.dispatch(new UpdateWorkflowStateCase({ data: cmd, workflowStateId: caseDe.id }));
      this.action$
        .pipe(
          filter((action) => action.type === WorkflowActionTypes.UpdateWorkflowStateCaseSuccess),
          take(1)
        )
        .subscribe(() => {
          this.snackBar.open(this.ts.instant('Case Updated Successfully!'), 'CLOSE', { duration: 2000 });
          this.postSaveAction(this.existingWorkflow.workflowSchemaId, caseDe.id, this.existingWorkflow.caseSchemaId);
        });
    } catch (error) {
      console.log(error);
    }
  }

  postSaveAction(wfId: string, caseId: string, caseSchemaId: string): void {
    const existingSetting: SettingsUI = this.evokedSettingsService.checkForEvokedAnswerSetting(postCaseSaveSetting);
    const settingValue: EvokedAnswerSettingsEnum = existingSetting?.value?.setting;
    this.evokedSettingsService.makePostCaseCreationAction(
      settingValue,
      existingSetting,
      postCaseSaveSetting,
      caseId,
      wfId,
      this.userId,
      null,
      caseSchemaId
    );
  }

  async getWorkflowByRawData(rows: Row[]): Promise<WorkflowOverviewDto[]> {
    const workflows = [];
    this.addToNewFailures = [];
    let ids = rows?.map((r) => r.id);
    if (ids && ids.length) {
      const query: GetWorkflowByRawDataQuery = {
        tenantId: this.tenant,
        rawDataIds: ids,
        schemaId: this.rawDataSchemaId
      };

      const data: WorkflowOverviewDto[] = await this.rawdataLinkService.checkRawDataAddToNewRules(query);
      data?.forEach((overrideDto) => {
        if (overrideDto.isMatchingRules) {
          workflows.push(overrideDto);
        } else if (overrideDto.failedOverrides?.length) {
          this.addToNewFailures.push({
            workflowName: overrideDto.name,
            failedRules: overrideDto.failedOverrides
          });
        }
      });
    }
    return workflows;
  }

  async queryForAddToNew(): Promise<void> {
    try {
      this.addToNewWorkflows = [];
      this.addToNewLoading = true;

      this.addToNewWorkflows = await this.getWorkflowByRawData(this.rawDataDeItems);
      this.addToNewLoading = false;
      if (this.addToNewWorkflows.length === 1) {
        this.selectedWorkflows = [];
        this.addToNewWorkflowMultipleSelector.setValue([]);

        await this.setSingleNewWorkflow();
      } else {
        this.syncMultipleSelection();
      }
    } catch (error) {
      this.addToNewLoading = false;
    }
  }

  async setSingleNewWorkflow(): Promise<void> {
    this.newWorkflow = null;
    const workflow = await this.getWorkflowSchemaAndSettings(this.addToNewWorkflows[0].workflowSchemaId);
    this.newWorkflow = workflow;
    this.newCaseSchemaId = workflow.caseSchemaId;
    this.cd.detectChanges();
  }

  syncMultipleSelection(): void {
    let selectedIds = this.addToNewWorkflowMultipleSelector.value || [];
    selectedIds = selectedIds.filter((selectedWfId) => this.addToNewWorkflows?.find((w) => w.workflowSchemaId === selectedWfId));
    this.addToNewWorkflowMultipleSelector.setValue(selectedIds);
  }

  async queryForAddToExisting(): Promise<void> {
    try {
      this.addToExistingWorkflows = [];
      this.addToExistingLoading = true;
      this.addToExistingFailures = [];

      let ids = this.rawDataDeItems?.map((r) => r.id);
      if (ids && ids.length) {
        const query: GetWorkflowByRawDataQuery = {
          tenantId: this.tenant,
          rawDataIds: ids,
          schemaId: this.rawDataSchemaId
        };

        const data: CasesForRawDataReference[] = await this.rawdataLinkService.checkRawDataAddToExistingCaseRules(query);
        this.addToExistingLoading = false;
        data?.forEach((overrideDto) => {
          if (overrideDto.isMatchingRules) {
            this.addToExistingWorkflows.push(overrideDto);
          } else if (overrideDto.failedOverrides?.length) {
            this.addToExistingFailures.push({
              workflowName: overrideDto.workflowSchemaName,
              failedRules: overrideDto.failedOverrides
            });
          }
        });

        if (this.addToExistingWorkflows.length === 1) {
          this.addToExistingWorkflowSelector.setValue(this.addToExistingWorkflows[0].workflowSchemaId);
        }
      }
    } catch (error) {
      this.addToExistingLoading = false;
    }
  }

  onCaseCreatedForMultipleWorkflow(event: { workflowId: string; caseId: string }): void {
    const wf = this.selectedWorkflows?.find((x) => x.workflowId === event.workflowId);
    if (wf) wf.disable = true;
    this.postSaveAction(event.workflowId, event.caseId, wf.schemaId);
    this.checkForAllCreated();
  }

  checkForAllCreated(): void {
    // If the case is created for all workflows, Close the side panel
    if (this.selectedWorkflows.every((x) => x.disable)) {
      this.toggleCreator();
    }
  }

  showCasePreview(caseId: string, existingWorkflow: CasesForRawDataReference): void {
    const workflow = <WorkflowDto>{
      caseSchemaId: existingWorkflow.caseSchemaId,
      id: existingWorkflow.workflowSchemaId
    };

    const dialogRef = this.dialog?.open(CasePrintPreviewComponent, {
      width: '50%',
      height: '600px',
      panelClass: 'print'
    });

    dialogRef.componentInstance.workflowStateId = caseId;
    dialogRef.componentInstance.workflowSchema = workflow;
  }

  showFailedRuleInDialog(): void {
    this.dialog.open(this.failedRuleTemplateRef, {
      width: '500px'
    });
  }

  close(): void {
    this.dialog.closeAll();
  }

  onToggle(event: MatSlideToggleChange): void {
    this.showWorkflowFailedDetails = event.checked;
    localStorage.setItem(this.showFailedWfDetailsKey, JSON.stringify(event.checked));
  }
}
