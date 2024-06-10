/**
 * global
 */

import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, of } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { cloneDeep } from 'lodash-core';
/**
 * project
 */
import {
  APP_CLIENT_ID,
  AreaTypeEnum,
  DynamicEntitiesService,
  DynamicEntityDto,
  FieldTypeIds,
  FileBlobData,
  keyForSchemaTitleSettings,
  SchemaDto,
  SchemaFieldDto,
  SettingsUI,
  SidebarLinksService,
  UiAreasEnum,
  UpdateStateCase,
  VirtualFieldValueDto,
  WorkflowDto,
  WorkflowStateCaseFieldDto,
  WorkflowStateDto,
  WorkflowStateService
} from '@wfm/service-layer';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { activatedCaseFieldRulesSelector, UpdateWorkflowStateCase, workflowSelector, workflowStateSelector } from '@wfm/store/workflow';

import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { BaseFieldValueType, EmbededFieldValueDto, FieldValueDto } from '@wfm/service-layer/models/FieldValueDto';
import { FormlyModel, IConfigurableListItem } from '@wfm/common/models';
import { BaseFieldConverter } from '@wfm/service-layer/helpers';
import DateTimeFormatHelper from '@wfm/shared/dateTimeFormatHelper';
import { DynamicGridUiService } from '@wfm/service-layer/services/dynamic-grid-ui.service';
import { FormlyDataOutput } from '@wfm/common/form-builder-components/form-builder-form-preview/form-builder-form-preview.component';
import { FieldLinkRules } from '@wfm/tenant-admin/workflows/workflow-field-link/field-link.model';
/**
 * local
 */
import { convertTenantName } from '../../shared/utils';
import { WorkflowStateUiService } from '../workflow-state-ui.service';
import { TitleSettingsHelperService } from '@wfm/service-layer/services/title-settings-helper-service';
import { tenantSettingsSelector } from '@wfm/store';
import { AppBarData, ScreenType, SharedService } from '@wfm/service-layer/services/shared.service';

import { CasePrintPreviewComponent } from '../case-print-preview/case-print-preview.component';
import { MediaMatcher } from '@angular/cdk/layout';
import { GridSystemFieldsEnum, SystemFieldsTitleFormatter } from '@wfm/shared/dynamic-entity-grid/dynamic-grid-system-fields';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';
import { DynamicEntitySystemFields } from '@wfm/shared/dynamic-entity-grid/dynamic-entity-grid.component';

export interface ValueMap {
  [key: string]: any;
}

interface KeyValue {
  key: string;
  value: any;
}

export interface CaseFields {
  name: string;
  value: any;
  type?: FieldTypeIds;
}

@Component({
  selector: 'app-workflow-state-case',
  templateUrl: './workflow-state-case.component.html',
  styleUrls: ['./workflow-state-case.component.scss']
})
export class WorkflowStateCaseComponent extends TenantComponent implements OnInit, OnDestroy {
  @Input() showEditBtn: boolean;
  @Input() isSidePanel: boolean;
  @Input() lastComment: string = '';
  @Input() isEdit: boolean;
  @Input() showCaseButtons: boolean = false;
  @Output() closeEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() refresh: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() toggleActivity: EventEmitter<boolean> = new EventEmitter<boolean>();
  @ViewChild('caseUpdate') caseUpdateTemplate: TemplateRef<any>;
  appBarData: AppBarData = { title: 'Cases', type: ScreenType.CASES } as AppBarData;
  workflowState: WorkflowStateDto;
  workflow: WorkflowDto;
  dialogRef: MatDialogRef<any, any>;
  caseSchema: SchemaDto;
  caseSchemaFields$ = new Observable<IConfigurableListItem[]>();
  caseSchemaId: string;
  caseForUi: {
    title: string;
    details: KeyValue[];
  };
  caseFields: WorkflowStateCaseFieldDto[];
  caseSystemFields: DynamicEntitySystemFields;

  dynamicEntityMap: ValueMap;
  isUpdateClicked: boolean = false;
  // store the raw data ids separately and add it to updateCaseDto before api call
  listOfLinksFields: FieldValueDto<string[]>[] = [];
  caseDeId: string;
  allTitleSettings: SettingsUI[];
  userDateFormat: string;
  userDateTimeFormat: string;
  isDownloading: boolean = false;
  caseFieldRules: FieldLinkRules[] = [];
  mobileQuery: MediaQueryList;
  virtualFields: VirtualFieldValueDto<BaseFieldValueType>[];
  statusEnabled: boolean = false;

  get areaType() {
    return AreaTypeEnum;
  }

  constructor(
    @Inject(APP_CLIENT_ID) readonly appId: string,
    private store: Store<ApplicationState>,
    public dialog: MatDialog,
    private dynamicEntitiesService: DynamicEntitiesService,
    private adminSchemaService: AdminSchemasService,
    private dynamicGridUiService: DynamicGridUiService,
    private cd: ChangeDetectorRef,
    public wfStateUiService: WorkflowStateUiService,
    private router: Router,
    private sidebarLinksService: SidebarLinksService,
    private titleSettingsHelperService: TitleSettingsHelperService,
    private sharedService: SharedService,
    private wfStateService: WorkflowStateService,
    private snackbar: MatSnackBar,
    private ts: TranslateService,
    media: MediaMatcher,
    private errorHandlerService: ErrorHandlerService
  ) {
    super(store);
    this.sharedService.setAppBarData(this.appBarData);

    this.mobileQuery = media.matchMedia('(min-width: 768px)');
    this._mobileQueryListener = () => cd.detectChanges();
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);
    this.mobileQuery.onchange = (e) => {
      this.sharedService.updateMobileQuery.next(e.matches);
    };
  }

  async ngOnInit() {
    this.userDateFormat = DateTimeFormatHelper.getDateFormatConfig()?.display?.dateInput;
    this.userDateTimeFormat = DateTimeFormatHelper.getDateTimeFormatConfig()?.display?.dateInput;
    this.subscribeToStore();
  }

  closeWorkflowState() {
    this.wfStateUiService
      .userWantsToProceed('Close Case?', 'closing case editor')
      .pipe(take(1))
      .subscribe((response: boolean) => {
        if (response) {
          this.closeEvent.emit(false);
        }
      });
  }

  back() {
    let tenantName = convertTenantName(this.sidebarLinksService.tenantName);
    this.router.navigate([`/${tenantName}/workflow-states/list/${this.workflow.id}`]);
  }

  toWorkflowGrid(): void {
    let tenantName = convertTenantName(this.sidebarLinksService.tenantName);
    this.router.navigate([`/${tenantName}/workflow-states/list/${this.workflow.id}`], {
      queryParams: {
        workflowStateId: this.workflowState.id,
        isEditCase: false
      }
    });
  }

  getWorkflowState(): void {
    this.refresh.emit();
  }

  toggle() {
    this.toggleActivity.emit();
  }

  editCase(): void {
    this.isUpdateClicked = true;
    this.cd.detectChanges();
    this.openCaseUpdateDialog();
  }

  async onPrint() {
    this.dialogRef = this.dialog?.open(CasePrintPreviewComponent, {
      width: '50%',
      height: '600px',
      panelClass: 'print'
    });

    this.dialogRef.componentInstance.workflowStateId = this.workflowState.id;
    this.dialogRef.componentInstance.workflowSchema = { ...this.workflow };
  }

  async subscribeToStore(): Promise<void> {
    combineLatest([this.store.select(workflowStateSelector), this.store.select(activatedCaseFieldRulesSelector)])
      .pipe(
        filter((x) => !!x[0] && !!x[1]),
        takeUntil(this.destroyed$)
      )
      .subscribe((data) => {
        this.workflowState = cloneDeep(data[0]);
        this.caseFieldRules = cloneDeep(data[1]);
        this.store
          .select(workflowSelector)
          .pipe(
            filter((wf) => !!wf),
            take(1)
          )
          .subscribe(async (wf) => {
            this.workflow = wf;
            this.caseSchemaId = this.workflow.caseSchemaId;
            await this.getDynamicEntity();
            await this.getSchemaAndFields(this.caseSchemaId);

            this.caseFields = this.workflowState.case?.fields ? this.workflowState.case.fields : [];
            this.prepareCaseFieldsForUi();

            this.statusEnabled =
              this.workflowState.statuses?.length && this.workflowState.statuses.filter((status) => status.enabled).length > 0;
          });
      });

    this.store
      .select(tenantSettingsSelector)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((tenantSettings) => {
        this.allTitleSettings = tenantSettings.filter((x) => x.key.includes(keyForSchemaTitleSettings));
      });
  }

  /**
   * check fieldLinkRules
   * canEdit:false - field to be disabled
   * canView:false - field to be hidden
   */
  processCaseFieldThroughRules(field: SchemaFieldDto): SchemaFieldDto {
    const rule = this.caseFieldRules.find((fieldRule) => fieldRule.schemaFieldId === field.id);
    if (rule) {
      field.configuration.disabledByRule = !rule.rights.canEdit;
      field.configuration.hiddenByRyRule = !rule.rights.canView;
    }
    return field;
  }

  private async getSchemaAndFields(id: string): Promise<void> {
    this.caseSchema = await this.adminSchemaService.getSchema(this.tenant, AreaTypeEnum.case, id);
    this.caseSchema.fields = this.populateSchemaFieldValues(this.caseSchema.fields, this.dynamicEntityMap);
    this.caseSchemaFields$ = of(
      this.caseSchema.fields
        .filter((f) => {
          f = this.processCaseFieldThroughRules(f);
          if (f.type === FieldTypeIds.ListOfLinksField) {
            this.listOfLinksFields.push({
              id: f.fieldName,
              value: this.dynamicEntityMap ? this.dynamicEntityMap[f.fieldName]?.value : undefined,
              type: f.type
            });
            return false;
          }
          if (f.configuration.hiddenByRyRule) {
            return false;
          }
          return true;
        })
        ?.map((field) => BaseFieldConverter.toUi(field))
    );
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
   * @param fields
   * @param values
   * @returns
   */

  private populateSchemaFieldValues(fields: SchemaFieldDto[], valuesMap?: ValueMap): SchemaFieldDto[] {
    const fieldsCopy = [...fields];
    if (valuesMap) {
      fieldsCopy.forEach((field) => {
        if (field.type !== FieldTypeIds.EmbededField) {
          field.configuration.value = valuesMap[field.fieldName]?.value;
          if (field.type === FieldTypeIds.ConnectorField && this.virtualFields) {
            field.configuration.exposedFieldsData = this.virtualFields.find((f) => f.fieldName === field.fieldName);
          }
        } else {
          field.fields = this.populateSchemaFieldValues(field.fields, valuesMap[field.fieldName]);
        }
      });
    }
    return fieldsCopy;
  }

  async prepareCaseFieldsForUi() {
    let titleSettings = this.titleSettingsHelperService.findApplicableTitleSettings(
      this.caseSchemaId,
      this.allTitleSettings,
      UiAreasEnum.caseDetailTitle
    );

    let titleFields = this.titleSettingsHelperService.populateTitleFields(this.caseFields, titleSettings, this.getSystemFields());
    let title = await this.titleSettingsHelperService.populateDynamicEntityTitle(titleFields, titleSettings, this.caseSchema, true);
    let detailFields: KeyValue[] = [];
    for (const field of this.caseFields) {
      if (field.type !== FieldTypeIds.ListOfLinksField) {
        let fieldItem: KeyValue = {
          key: field.id,
          value: await this.dynamicGridUiService.getFormattedValue(field, this.caseSchema)
        };

        detailFields.push(fieldItem);
      }
    }
    this.caseForUi = {
      title: title,
      details: detailFields
    };
  }

  getSystemFields(): SystemFieldsTitleFormatter[] {
    const statusField = {
      id: GridSystemFieldsEnum.STATUS,
      type: FieldTypeIds.StringField,
      value: this.workflowState.currentStatus.id
    };
    const createdAt = {
      id: GridSystemFieldsEnum.CREATED_AT,
      type: FieldTypeIds.DateTimeField,
      value: DateTimeFormatHelper.formatDateTime(this.workflowState[GridSystemFieldsEnum.CREATED_AT])
    };
    const updatedAt = {
      id: GridSystemFieldsEnum.UPDATED_AT,
      type: FieldTypeIds.DateTimeField,
      value: DateTimeFormatHelper.formatDateTime(this.workflowState[GridSystemFieldsEnum.UPDATED_AT])
    };
    return [statusField, createdAt, updatedAt];
  }

  async openCaseUpdateDialog() {
    if (this.caseUpdateTemplate) {
      // const themeClass = this.kendoThemeService.theme;
      this.dialogRef = this.dialog?.open(this.caseUpdateTemplate, { width: '500px', maxHeight: '95vh', maxWidth: '95vw', panelClass: [] });
      this.dialogRef
        .afterClosed()
        .pipe(takeUntil(this.destroyed$))
        .subscribe((formlyModel: FormlyModel) => {
          this.isUpdateClicked = false;
          if (formlyModel) {
            let fieldValues = this.populateDynamicEntityFields(formlyModel, this.caseSchema.fields);
            const cmd: UpdateStateCase = {
              workflowStateId: this.workflowState.id,
              tenantId: this.tenant,
              caseDynamicEntity: {
                appId: this.appId,
                tenantId: this.tenant,
                schemaId: this.caseSchemaId,
                areaType: AreaTypeEnum.case,
                //  add list of links fields
                fields: [...fieldValues, ...this.listOfLinksFields]
              },
              schemaId: this.workflow.id
            };
            this.store.dispatch(new UpdateWorkflowStateCase({ data: cmd, workflowStateId: this.workflowState.id }));
          }
        });
    }
  }

  /**
   * @param formModel: FormGroup.getRawValue()
   * @param schemaFields
   * @returns
   */
  private populateDynamicEntityFields(formModel: any, schemaFields: SchemaFieldDto[]): BaseFieldValueType[] {
    let fields = [];
    schemaFields.forEach((field) => {
      const key = field.fieldName;
      if (formModel.hasOwnProperty(key)) {
        if (field.type !== FieldTypeIds.EmbededField) {
          let data = <BaseFieldValueType>{
            id: key,
            type: field.type
          };
          const value = this.dynamicEntitiesService.mapFieldTypeToBaseFieldValue(field.type, formModel[key]);
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
      }
    });

    return fields;
  }

  /**
   * get dynamic entity
   */
  async getDynamicEntity(): Promise<void> {
    let caseId = this.workflowState?.case?.id;
    if (caseId) {
      this.caseDeId = caseId;
      const dynamicEntity: DynamicEntityDto = await this.dynamicEntitiesService.getById(
        this.tenant,
        this.workflowState.case?.id,
        this.caseSchemaId,
        AreaTypeEnum.case
      );
      this.dynamicEntityMap = this.getDynamicEntityMap(dynamicEntity.fields);
      this.virtualFields = dynamicEntity.virtualFields;
      this.caseSystemFields = {
        statusId: dynamicEntity.statusId,
        createdAt: dynamicEntity.createdAt,
        updatedAt: dynamicEntity.updatedAt
      };
    }
  }

  onCaseFieldsUpdateEvent(data: FormlyDataOutput): void {
    // close the dialog from here
    this.dialogRef.close(data.model);
  }

  onFullScreen() {
    if (this.workflow && this.workflowState) {
      let tenantName = convertTenantName(this.sidebarLinksService.tenantName);
      this.router.navigate([`/${tenantName}/workflow-states/update/${this.workflowState.id}/${this.workflow.id}`], {
        queryParams: {
          isEditCase: this.isEdit
        }
      });
    }
  }

  async onDownload(): Promise<void> {
    try {
      this.isDownloading = true;
      this.snackbar.open(this.ts.instant('Downloading in progress...'), 'OK');
      const data = await this.wfStateService.downloadAllDocuments(this.tenant, this.workflowState.id, this.workflow.id);
      this.downloadFile(data);
    } catch (error) {
      this.isDownloading = false;
      this.snackbar.dismiss();
      this.errorHandlerService.getAndShowErrorMsg(error);
    }
  }

  downloadFile(fileData: FileBlobData) {
    this.snackbar.dismiss();
    const blob = new Blob([fileData.data]);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileData.fileName || 'documents.zip');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.isDownloading = false;
  }

  private _mobileQueryListener() {
    this.cd.detectChanges();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.mobileQuery.removeEventListener('change', this._mobileQueryListener);
  }
}
