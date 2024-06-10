/**
 * global
 */

import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';

/**
 * project
 */
import { SidebarLinksService } from '@wfm/service-layer/services/sidebar-links.service';
import { convertTenantName } from '@wfm/shared/utils';
import {
  AreaTypeEnum,
  DynamicEntitiesService,
  DynamicEntityDto,
  FieldTypeIds,
  keyForSchemaTitleSettings,
  SchemaDto,
  SchemasCacheService,
  SettingsUI,
  UiAreasEnum,
  WorkflowService
} from '@wfm/service-layer';
import { BaseComponent } from '@wfm/shared/base.component';
import { workflowStatesMainRoute } from '@wfm/workflow-state/workflow-state.routing.module';
import { Row } from '@wfm/shared/dynamic-entity-grid/dynamic-entity-grid.component';
import { BaseFieldValueType } from '@wfm/service-layer/models/FieldValueDto';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { tenantSettingsSelector, workflowMenuItemsSelector } from '@wfm/store';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { TitleSettingsHelperService } from '@wfm/service-layer/services/title-settings-helper-service';
import { GridSystemFieldsEnum, SystemFieldsTitleFormatter } from '@wfm/shared/dynamic-entity-grid/dynamic-grid-system-fields';
import DateTimeFormatHelper from '@wfm/shared/dateTimeFormatHelper';
import { caseCreateDefaultScreenKey, CaseProcessDefaultScreen } from '@wfm/tenants/cases-setting/cases-setting.component';
import { ChildrenItems } from '@wfm/shared/menu-items/menu-items';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';

/**
 * local
 */
interface CaseForInfo {
  name: string;
  caseId: string;
  workflowId: string;
  titleHint?: string;
}

interface CaseData {
  id: string;
  titleFields: BaseFieldValueType[];
}

interface CaseByWorkflow {
  workflowName: string;
  caseDetails: CaseForInfo[];
}

@Component({
  selector: 'app-raw-data-in-case-info-dialog',
  templateUrl: './raw-data-in-case-info-dialog.component.html',
  styleUrls: ['./raw-data-in-case-info-dialog.component.scss']
})
export class RawDataInCaseInfoDialogComponent extends BaseComponent implements OnInit {
  @Input() rawData: Row;
  @Input() tenantId: string;
  @Input() rawDataSchemaId: string;

  isLoading: boolean = true;
  titleSettingsKey = keyForSchemaTitleSettings;
  allSettings: SettingsUI[];
  caseSchema: SchemaDto;
  componentId = 'e9c9c88e-5515-4740-9f7c-54da4cdfcc47';
  casesByWorkflow: CaseByWorkflow[];

  constructor(
    private router: Router,
    private sidebarLinksService: SidebarLinksService,
    private dialogRef: MatDialogRef<RawDataInCaseInfoDialogComponent>,
    private workflowService: WorkflowService,
    private dynamicEntityService: DynamicEntitiesService,
    private store: Store<ApplicationState>,
    private schemasCacheService: SchemasCacheService,
    private adminSchemaService: AdminSchemasService,
    private titleSettingsHelperService: TitleSettingsHelperService,
    private errorHandlerService: ErrorHandlerService
  ) {
    super();
  }

  async ngOnInit(): Promise<void> {
    this.store.pipe(takeUntil(this.destroyed$), select(tenantSettingsSelector)).subscribe((tenantSettings) => {
      this.allSettings = tenantSettings;
    });

    this.store
      .select(workflowMenuItemsSelector)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((data) => {
        if (data?.length) this.getCases(data);
      });
  }

  async getCases(workflows: ChildrenItems[]): Promise<void> {
    this.casesByWorkflow = [];
    try {
      // Get Workflow schemas where raw data is referenced
      const rawDataWorkflowReferences = await this.workflowService.getRawDataWorkflows(this.tenantId, this.rawData.publicId);
      const allTitleSettings = this.allSettings?.filter((x) => x.key.includes(keyForSchemaTitleSettings));
      for (let i = 0; i < rawDataWorkflowReferences?.length; i++) {
        const wfSchema = rawDataWorkflowReferences[i];
        // Get workflow by workflowSchemaId
        const workflow = workflows.find((w) => w.setting?.id === wfSchema.workflowSchemaId);
        const cases = [];
        if (workflow) {
          // Get Workflow Settings
          const currentUiTitleSetting = this.titleSettingsHelperService.findApplicableTitleSettings(
            workflow.setting?.caseSchemaId,
            allTitleSettings,
            UiAreasEnum.caseQuickInfo
          );
          if (wfSchema.caseIds) {
            // Get All Cases By CaseIds
            const caseDetails = (
              await this.dynamicEntityService.getMany(this.tenantId, AreaTypeEnum.case, workflow.setting?.caseSchemaId, wfSchema.caseIds)
            )?.items;
            let casesWithTitleFields: CaseData[] = [];
            if (caseDetails) {
              casesWithTitleFields = caseDetails.map((caseItem) => {
                const data = {
                  titleFields: currentUiTitleSetting
                    ? this.titleSettingsHelperService.populateTitleFields(
                        caseItem.fields,
                        currentUiTitleSetting,
                        this.getSystemFields(caseItem)
                      )
                    : [],
                  id: caseItem.id
                };
                return data;
              });
            }
            for (const caseDataItem of casesWithTitleFields) {
              const caseName: string = await this.titleSettingsHelperService.populateDynamicEntityTitle(
                caseDataItem.titleFields,
                currentUiTitleSetting,
                workflow.setting?.caseSchema
              );
              cases.push({
                caseId: caseDataItem.id,
                workflowId: workflow.setting?.id,
                name: caseName,
                titleHint: this.titleSettingsHelperService.extractStringFromHTML(caseName)
              });
            }
          }
        }
        this.casesByWorkflow.push({
          workflowName: wfSchema.workflowSchemaName,
          caseDetails: cases
        });
      }
      this.isLoading = false;
    } catch (error) {
      this.errorHandlerService.getAndShowErrorMsg(error);
    }
  }

  onCaseClick(caseInfo: CaseForInfo): void {
    const setting = this.allSettings?.find((x) => x.key.includes(`${caseCreateDefaultScreenKey}_${caseInfo.workflowId}`));
    const value = setting?.value?.defaultScreen;
    if (value && value === CaseProcessDefaultScreen.SIDE_PANEL) {
      this.openCaseInList(caseInfo);
    } else {
      this.openCaseInFullScreen(caseInfo);
    }
    this.dialogRef.close();
  }

  openCaseInFullScreen(caseInfo: CaseForInfo): void {
    this.router.navigate([
      `${convertTenantName(this.sidebarLinksService.tenantName)}/${workflowStatesMainRoute}/update/${caseInfo.caseId}/${
        caseInfo.workflowId
      }`
    ]);
  }

  openCaseInList(caseInfo: CaseForInfo): void {
    this.router.navigate(
      [`${convertTenantName(this.sidebarLinksService.tenantName)}/${workflowStatesMainRoute}/list/${caseInfo.workflowId}`],
      {
        queryParams: {
          workflowStateId: caseInfo.caseId,
          isEditCase: false
        }
      }
    );
  }

  getSystemFields(data: DynamicEntityDto): SystemFieldsTitleFormatter[] {
    const statusField = {
      id: GridSystemFieldsEnum.STATUS,
      type: FieldTypeIds.StringField,
      value: data.statusId
    };
    const createdAt = {
      id: GridSystemFieldsEnum.CREATED_AT,
      type: FieldTypeIds.DateTimeField,
      value: DateTimeFormatHelper.formatDateTime(data[GridSystemFieldsEnum.CREATED_AT])
    };
    const updatedAt = {
      id: GridSystemFieldsEnum.UPDATED_AT,
      type: FieldTypeIds.DateTimeField,
      value: DateTimeFormatHelper.formatDateTime(data[GridSystemFieldsEnum.UPDATED_AT])
    };
    return [statusField, createdAt, updatedAt];
  }

  async getSchema(id: string, area: AreaTypeEnum): Promise<SchemaDto> {
    return this.schemasCacheService.get(id, 60, async () => await this.adminSchemaService.getSchema(this.tenantId, area, id));
  }
}
