/**
 * global
 */
import { Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable } from 'rxjs';
import { cloneDeep } from 'lodash-core';
import { TranslateService } from '@ngx-translate/core';
/**
 * project
 */
import {
  AllowedGridOperations,
  APP_CLIENT_ID,
  AreaTypeEnum,
  DynamicEntitiesService,
  DynamicEntityDto,
  FieldTypeIds,
  keyForSchemaTitleSettings,
  PermissionSettings,
  SchemaDto,
  SchemaFieldDto,
  SettingsUI,
  UiAreasEnum,
  WorkflowDtoUi,
  WorkflowStateCaseFieldDto,
  WorkflowStateService,
  FileBlobData
} from '@wfm/service-layer';
import { ActionEvent, GridAction } from '@wfm/shared/dynamic-entity-grid/model/dynamic-entity-grid.model';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { refreshWorkflowStatesSelector, workflowStatesListLoadingSelector } from '@wfm/store/workflow';
import { takeUntil } from 'rxjs/operators';
import { IConfigurableListItem } from '@wfm/common/models';
import { TenantSystem } from '@wfm/store';
import { SchemaPermissionsHelper } from '@wfm/service-layer/helpers/schema-permissions.helper';
import { TitleSettingsHelperService } from '@wfm/service-layer/services/title-settings-helper-service';
import { CasePrintPreviewComponent } from '../case-print-preview/case-print-preview.component';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';

export enum CaseActionsEnum {
  CaseQuickView = 'caseQuickView',
  Process = 'process',
  Edit = 'edit',
  Info = 'info',
  Download = 'download',
  CasePrintPreview = 'casePrintPreview'
}
/**
 * local
 */

@Component({
  selector: 'app-workflow-states-grid',
  templateUrl: './workflow-states-grid.component.html',
  styleUrls: ['./workflow-states-grid.component.scss']
})
export class WorkflowStatesGridComponent extends TenantComponent implements OnInit, OnChanges {
  @Input() workflow: WorkflowDtoUi;
  @Input('tenantInfo') tenantSystem: TenantSystem;
  @Input() showRawData: boolean;
  @Input() showCreateCaseButton: boolean;
  @Input() showProcessButton: boolean;
  @Input() showEditButton: boolean = false;
  @Input() showPrintButton: boolean = false;
  @Input() showDownloadButton: boolean = false;
  @Input() showToolButtons: boolean;
  // @Input() showInfoButton: boolean = true;
  @Output() openCaseCreateDialogue: EventEmitter<string> = new EventEmitter<string>();
  schemaPermissions: PermissionSettings;
  caseSchemaId: string;
  areaType: AreaTypeEnum = AreaTypeEnum.case;
  actions: GridAction[] = [];
  rawDataAreaTypeActions: GridAction[] = [
    {
      actionId: 'showRawData',
      icon: 'info'
    }
  ];
  searchByFilters: boolean = false;
  anyRawDatasField: SchemaFieldDto;
  rawDataSchemaId: string;
  rawDataAreaType: AreaTypeEnum = AreaTypeEnum.rawData;
  rawDataDynamicEntityIds: string[] = [];
  modalConfig = { width: '800px', maxHeight: '95vh', maxWidth: '95vw', panelClass: ['info-rawdata-or-article'] };

  rawDataSchema: SchemaDto;
  schemaFields$ = new Observable<IConfigurableListItem[]>();
  allowedGridOperations: AllowedGridOperations = {
    actionsColumn: true,
    menuColumn: true,
    exportActions: true,
    infoColumn: false,
    layoutActions: true,
    crudOperations: true,
    allowSharing: true,
    allowSearching: true,
    enableMasterDetail: true,
    enableGrouping: true
  };

  reloadDataSubject: BehaviorSubject<{ isReload: boolean }> = new BehaviorSubject({ isReload: false });
  loading$: Observable<boolean>;
  isRefresh: boolean;
  dialogRef: MatDialogRef<any, any>;

  isDownloading: boolean = false;

  constructor(
    @Inject(APP_CLIENT_ID) readonly appId: string,
    private store: Store<ApplicationState>,
    private dynamicEntitiesService: DynamicEntitiesService,
    public dialog: MatDialog,
    private schemaPermissionsHelper: SchemaPermissionsHelper,
    private titleSettingsHelperService: TitleSettingsHelperService,
    private ts: TranslateService,
    private snackbar: MatSnackBar,
    private wfStateService: WorkflowStateService,
    private errorHandlerService: ErrorHandlerService
  ) {
    super(store);
  }

  ngOnInit(): void {
    this.listenForWorkflowStatesListLoading();
    this.subscribeToStore();
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes.workflow || (changes?.tenantSystem && changes?.tenantSystem.currentValue)) {
      this.caseSchemaId = this.workflow.caseSchemaId;
      await this.checkForRawDataField();
      if (this.anyRawDatasField) {
        this.allowedGridOperations.enableMasterDetail = true;
      } else {
        this.allowedGridOperations.enableMasterDetail = false;
      }
      this.schemaPermissions = await this.schemaPermissionsHelper.getSchemaPermissions(this.caseSchemaId, AreaTypeEnum.case, this.tenant);
      this.initGridActions();
    }
  }

  listenForWorkflowStatesListLoading(): void {
    this.loading$ = this.store.select(workflowStatesListLoadingSelector);
  }

  /**
   * subscribe and get data from state
   */
  subscribeToStore(): void {
    this.store
      .select(refreshWorkflowStatesSelector)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((isRefresh) => {
        this.isRefresh = isRefresh;
        if (isRefresh) {
          this.reloadDataSubject.next({ isReload: true });
        }
      });
  }

  /**
   * passing actions with ids to dynamic-entity-grid (you can distinguish event based on that ids when event is fired and emitted)
   */
  initGridActions(): void {
    this.actions = [];

    // if (this.showInfoButton) {
    //   this.actions.push({
    //     actionId: CaseActionsEnum.CaseQuickView,
    //     icon: 'info',
    //     title: 'Info'
    //   });
    // }

    if (this.showProcessButton) {
      this.actions.push({
        actionId: CaseActionsEnum.Process,
        icon: 'workflow',
        title: 'Process'
      });
    }

    if (this.schemaPermissions.edit && (!this.showProcessButton || this.showEditButton)) {
      this.actions.push({
        actionId: CaseActionsEnum.Edit,
        icon: 'edit',
        title: 'Edit'
      });
    }

    if (this.showPrintButton) {
      this.actions.push({
        actionId: CaseActionsEnum.CasePrintPreview,
        icon: 'print',
        title: 'Print'
      });
    }

    if (this.showDownloadButton) {
      this.actions.push({
        actionId: CaseActionsEnum.Download,
        icon: 'download',
        title: 'Download'
      });
    }
  }

  /**
   * actions distinguished by ids got from "initGridActions" function above
   */
  async actionEvent(event: ActionEvent): Promise<void> {
    switch (event.actionId) {
      case CaseActionsEnum.CasePrintPreview:
        this.onPrint(event.raw['publicId']);
        break;
      case CaseActionsEnum.Download:
        this.onDownload(event.raw['publicId']);
        break;
      default:
    }
  }

  onPrint(wfStateId: string): void {
    this.dialogRef = this.dialog?.open(CasePrintPreviewComponent, {
      width: '50%',
      height: '600px',
      panelClass: 'print'
    });

    this.dialogRef.componentInstance.workflowStateId = wfStateId;
    this.dialogRef.componentInstance.workflowSchema = { ...this.workflow };
  }

  async getTitleForConfirmationDialog(event: ActionEvent): Promise<string> {
    try {
      const dynamicEntity = await this.getSelectedCase(event.raw?.publicId);
      if (dynamicEntity) {
        return await this.getTitleFromCaseFieldsAndSchema(dynamicEntity, event);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getTitleFromCaseFieldsAndSchema(dynamicEntity: DynamicEntityDto, event: ActionEvent): Promise<string> {
    const caseFields = dynamicEntity?.fields ? dynamicEntity.fields : [];
    const caseTitle = await this.getTitle(caseFields, cloneDeep(this.workflow.caseSchema));
    return caseTitle || '';
  }

  async getTitle(caseFields: WorkflowStateCaseFieldDto[], caseSchema: SchemaDto): Promise<string> {
    const allTitleSettings: SettingsUI[] = this.tenantSystem?.tenantSettings.filter((x) => x.key.includes(keyForSchemaTitleSettings));
    const titleSettings = this.titleSettingsHelperService.findApplicableTitleSettings(
      this.caseSchemaId,
      allTitleSettings,
      UiAreasEnum.caseDetailTitle
    );
    const titleFields = this.titleSettingsHelperService.populateTitleFields(caseFields, titleSettings);
    const title = await this.titleSettingsHelperService.populateDynamicEntityTitle(titleFields, titleSettings, caseSchema);
    return title;
  }

  async getSelectedCase(id: string): Promise<DynamicEntityDto> {
    return await this.dynamicEntitiesService.getById(this.tenant, id, this.caseSchemaId, AreaTypeEnum.case, true);
  }

  /**
   * get raw data field from case schema
   */
  async checkForRawDataField(): Promise<void> {
    this.anyRawDatasField = this.workflow.caseSchema.fields.find((field) => {
      return field.type === FieldTypeIds.ListOfLinksField && field.configuration?.schemaAreaType === AreaTypeEnum.rawData;
    });
  }

  onOpenCaseCreateDialogue(): void {
    this.openCaseCreateDialogue.emit();
  }

  async onDownload(wfStateId: string): Promise<void> {
    try {
      this.isDownloading = true;
      this.snackbar.open(this.ts.instant('Downloading in progress...'), 'OK');
      const data = await this.wfStateService.downloadAllDocuments(this.tenant, wfStateId, this.workflow.id);
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
}
