/**
 * global
 */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { cloneDeep } from 'lodash-core';
import { filter, map, take } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

/**
 * project
 */
import { AreaTypeEnum, FieldTypeIds, SchemaDto } from '@wfm/service-layer';
import { AppBarData, SharedService } from '@wfm/service-layer/services/shared.service';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import {
  GetSharedUserSettingsPerRoles,
  ResetSharedUserSettingsAction,
  rawDataMenuItemsSelector,
  workflowMenuItemsSelector
} from '@wfm/store';

/**
 * local
 */
import { TenantsSettingsEnum } from '../tenants-settings-enum';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';

@Component({
  selector: 'app-tenants-settings',
  templateUrl: './tenants-settings.component.html',
  styleUrls: ['./tenants-settings.component.scss']
})
export class TenantsSettingsComponent extends TenantComponent implements OnInit, OnDestroy {
  areaTypeRawData: AreaTypeEnum = AreaTypeEnum.rawData;
  areaTypeCases: AreaTypeEnum = AreaTypeEnum.case;
  areaTypeComment: AreaTypeEnum = AreaTypeEnum.comment;

  allSettingsEnum = TenantsSettingsEnum;

  isSchemaCreationInvalid: boolean = false;
  isTenantSettingsCardDirty: boolean = false;
  isThemeApplicationHasChanges: boolean = false;
  isProcessStepNameFormatHasChanges: boolean = false;
  searchTimePeriodHasChanges: boolean = false;
  startOfWeekHasChanges: boolean = false;
  appBarData: AppBarData = { title: 'Settings' } as AppBarData;
  activeCaseSchemas: SchemaDto[] = [];
  activeRawDataSchemas: SchemaDto[] = [];
  activeCommentSchemas: SchemaDto[] = [];
  caseGroupSettingHasChanges: boolean = false;
  printPreviewHasChanges: boolean;

  constructor(
    private store: Store<ApplicationState>,
    private sharedService: SharedService,
    private adminSchemaService: AdminSchemasService
  ) {
    super(store);
    this.sharedService.setAppBarData(this.appBarData);
  }

  ngOnInit() {
    this.getActiveSchemas();
    this.store.dispatch(new GetSharedUserSettingsPerRoles({ tenantId: this.tenant }));
  }

  /**
   * populate case and rawData schemas used in any workflow
   */
  async getActiveSchemas(): Promise<void> {
    const caseMenus$ = this.store.select(workflowMenuItemsSelector);
    const rawDataMenus$ = this.store.select(rawDataMenuItemsSelector);
    combineLatest([caseMenus$, rawDataMenus$])
      .pipe(
        filter((data) => !!data[0] && !!data[1]),
        take(1),
        map(async (menus) => {
          const wfItems = menus[0];
          for (const workflowMenu of wfItems) {
            const caseSchema = workflowMenu.setting.caseSchema;
            if (caseSchema) {
              this.activeCaseSchemas.push(<SchemaDto>cloneDeep(caseSchema));
              this.checkForActiveCommentSchema(caseSchema);
            }
          }
          const rawDataMenuItems = menus[1];
          rawDataMenuItems.forEach((rawDataMenuItem) => {
            const rawDataSchema = rawDataMenuItem.setting;
            if (rawDataSchema) {
              this.activeRawDataSchemas.push(<SchemaDto>cloneDeep(rawDataSchema));
            }
          });
        })
      )
      .subscribe();
  }

  updateSettingsStatus(event: boolean, type: TenantsSettingsEnum): void {
    switch (type) {
      case this.allSettingsEnum.schemaCreation:
        this.isSchemaCreationInvalid = event;
        break;
      case this.allSettingsEnum.settingsCard:
        this.isTenantSettingsCardDirty = event;
        break;
      case this.allSettingsEnum.applicationTheme:
        this.isThemeApplicationHasChanges = event;
        break;
      case this.allSettingsEnum.processStepNameFormat:
        this.isProcessStepNameFormatHasChanges = event;
        break;
      // case this.allSettingsEnum.searchTimePeriod:
      //   this.searchTimePeriodHasChanges = event;
      //   break;
      case this.allSettingsEnum.startOfWeekHasChanges:
        this.startOfWeekHasChanges = event;
        break;
      case this.allSettingsEnum.caseGroupChanges:
        this.caseGroupSettingHasChanges = event;
      case this.allSettingsEnum.onPrintPreviewChanges:
        this.printPreviewHasChanges = event;
      default:
        break;
    }
  }

  async checkForActiveCommentSchema(caseSchema: SchemaDto): Promise<void> {
    const commentSchema = await this.getCommentSchemaUsedInCaseSchema(caseSchema, this.tenant);
    if (commentSchema && !this.activeCommentSchemas.find((schema) => schema.id === commentSchema.id)) {
      // populating only the comment schemas used in some workflow
      this.activeCommentSchemas.push(commentSchema);
    }
  }

  async getCommentSchemaUsedInCaseSchema(caseSchema: SchemaDto, tenantId: string): Promise<SchemaDto> {
    const commentSchemaField = caseSchema.fields.find((field) => {
      return field.type === FieldTypeIds.ListOfLinksField && field.configuration.schemaAreaType === AreaTypeEnum.comment;
    });
    if (commentSchemaField && commentSchemaField.configuration?.schemaId) {
      const id = commentSchemaField.configuration.schemaId;
      const commentSchema = await this.getCachedSchema(id, AreaTypeEnum.comment, tenantId);
      return commentSchema;
    }
    return null;
  }

  async getCachedSchema(id: string, area: AreaTypeEnum, tenantId: string): Promise<SchemaDto> {
    return await this.adminSchemaService.getSchema(tenantId, area, id);
  }

  ngOnDestroy(): void {
    super.onDestroy();
    this.store.dispatch(new ResetSharedUserSettingsAction());
  }
}
