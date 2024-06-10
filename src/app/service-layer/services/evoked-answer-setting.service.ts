/**
 * Global
 */
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { filter, takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

/**
 * Project
 */
import { SettingConfirmationPopupComponent } from '@wfm/shared/setting-confirmation-popup/setting-confirmation-popup.component';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { convertTenantName } from '@wfm/shared/utils';
import { ApplicationState, getAllUserSettingsSelector, LoadUserSettings, tenantSettingsSelector } from '@wfm/store';
import { workflowStatesMainRoute } from '@wfm/workflow-state/workflow-state.routing.module';
import { postCaseSaveSetting, stepResolutionConfirmationSetting } from '@wfm/users/evoked-answer-settings/evoked-answer-settings.component';
/**
 * Local
 */
import {
  AreaTypeEnum,
  DynamicEntityDto,
  EvokedAnswerSettingsEnum,
  evokedAnswerSettingsKey,
  EvokedSettingsTitlesEnum,
  FieldTypeIds,
  keyForSchemaTitleSettings,
  Settings,
  SettingsUI,
  UiAreasEnum,
  UserSettingsDto
} from '../models';
import { SidebarLinksService } from './sidebar-links.service';
import { UsersService } from './users.service';
import { caseCreateDefaultScreenKey, CaseProcessDefaultScreen } from '@wfm/tenants/cases-setting/cases-setting.component';
import { TitleSettingsHelperService } from './title-settings-helper-service';
import DateTimeFormatHelper from '@wfm/shared/dateTimeFormatHelper';
import { SystemFieldsTitleFormatter, GridSystemFieldsEnum } from '@wfm/shared/dynamic-entity-grid/dynamic-grid-system-fields';
import { AdminSchemasService } from './admin-schemas.service';
import { DynamicEntitiesService } from './dynamic-entities.service';

@Injectable({
  providedIn: 'root'
})
export class EvokedAnswerSettingService extends TenantComponent {
  authUserSettings: SettingsUI[];
  tenantSettings: SettingsUI[];
  allTitleSettings: SettingsUI[];

  constructor(
    private store: Store<ApplicationState>,
    private usersService: UsersService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private sidebarLinksService: SidebarLinksService,
    private router: Router,
    private ts: TranslateService,
    private titleSettingsHelperService: TitleSettingsHelperService,
    private adminSchemasService: AdminSchemasService,
    private dynamicEntityService: DynamicEntitiesService
  ) {
    super(store);
    this.store
      .pipe(
        select(getAllUserSettingsSelector),
        filter((x) => !!x),
        takeUntil(this.destroyed$)
      )
      .subscribe((x) => {
        this.authUserSettings = x;
      });

    this.store.pipe(select(tenantSettingsSelector), takeUntil(this.destroyed$)).subscribe((settings) => {
      this.tenantSettings = settings;

      this.allTitleSettings = settings ? settings.filter((x) => x.key.includes(keyForSchemaTitleSettings)) : [];
    });
  }

  async saveUserEvokedAnswerSettings(
    setting: EvokedAnswerSettingsEnum,
    userId: string,
    settingKey: string,
    existingSetting?: SettingsUI
  ): Promise<void> {
    try {
      const userSettings: Settings = {
        isUnique: true,
        fromGroup: undefined,
        fromUser: undefined,
        key: `${evokedAnswerSettingsKey}_${settingKey}`,
        value: { setting: setting },
        id: existingSetting ? existingSetting.id : null
      };
      const tenantId = this.tenant;
      const cmd: UserSettingsDto = {
        id: undefined,
        settings: [userSettings],
        userId: userId,
        tenantId: tenantId
      };
      if (existingSetting) {
        await this.usersService.updateUserSettings(tenantId, cmd);
      } else {
        await this.usersService.createUserSettings(tenantId, cmd);
      }
      this.store.dispatch(new LoadUserSettings({ tenantId: this.tenant, userId: userId }));

      this.snackBar.open(this.ts.instant('User Settings Saved Successfully!'), 'CLOSE', { duration: 2000 });
    } catch (error) {
      console.log(error);
    }
  }

  checkForEvokedAnswerSetting(settingKey: string): SettingsUI {
    const existingSetting = this.authUserSettings.find((x) => x.key === `${evokedAnswerSettingsKey}_${settingKey}`);
    return existingSetting;
  }

  async openConfirmationDialog(title: string, caseTitle?: string): Promise<{ rememberMe: boolean; proceed: boolean }> {
    const dialogRef = this.dialog.open(SettingConfirmationPopupComponent, {
      data: {
        title: 'Confirmation',
        message: title,
        dynamicMessage: caseTitle
      },
      width: '400',
      disableClose: true
    });
    return dialogRef
      .afterClosed()
      .toPromise()
      .then(async (result) => {
        return Promise.resolve(result);
      });
  }

  getDialogTitle(setting: string): string {
    switch (setting) {
      case postCaseSaveSetting:
        return EvokedSettingsTitlesEnum.ForPostCreateAction;
      case stepResolutionConfirmationSetting:
        return EvokedSettingsTitlesEnum.ForStepResolutionConfirmation;
      default:
        break;
    }
  }

  async getCaseTitle(caseSchemaId: string, deId: string): Promise<string> {
    let schema = await this.adminSchemasService.getSchema(this.tenant, AreaTypeEnum.case, caseSchemaId);
    let deItem = await this.dynamicEntityService.getById(this.tenant, deId, caseSchemaId, AreaTypeEnum.case);
    let titleSettings = this.titleSettingsHelperService.findApplicableTitleSettings(
      schema.id,
      this.allTitleSettings,
      UiAreasEnum.caseDetailTitle
    );
    if (titleSettings) {
      let titleFields = this.titleSettingsHelperService.populateTitleFields(deItem.fields, titleSettings, this.getSystemFields(deItem));
      let title = await this.titleSettingsHelperService.populateDynamicEntityTitle(titleFields, titleSettings, schema);
      return title;
    }
    return '';
  }

  async makePostCaseCreationAction(
    setting: EvokedAnswerSettingsEnum,
    existingSetting: SettingsUI,
    settingKey: string,
    workflowStateId: string,
    workflowId: string,
    userId: string,
    processStepsLength?: number,
    caseSchemaId?: string
  ): Promise<void> {
    if (!setting) {
      const title = this.getDialogTitle(settingKey);
      const caseTitle = await this.getCaseTitle(caseSchemaId, workflowStateId);
      const dialogResult = await this.openConfirmationDialog(title, caseTitle);
      if (dialogResult.rememberMe) {
        await this.saveUserEvokedAnswerSettings(
          dialogResult.proceed ? EvokedAnswerSettingsEnum.Yes : EvokedAnswerSettingsEnum.No,
          userId,
          settingKey,
          existingSetting
        );
      }
      if (dialogResult?.proceed) {
        this.navigateToCaseDetails(workflowStateId, workflowId, processStepsLength);
      }
    } else if (setting && setting === EvokedAnswerSettingsEnum.Yes) {
      this.navigateToCaseDetails(workflowStateId, workflowId, processStepsLength);
    }
  }

  navigateToCaseDetails(workflowStateId: string, workflowId: string, psLength: number): void {
    if (workflowStateId) {
      let defaultScreen: CaseProcessDefaultScreen = CaseProcessDefaultScreen.FULL_SCREEN;
      const defaultScreenSetting = this.tenantSettings?.find((sett) => sett.key === `${caseCreateDefaultScreenKey}_${workflowId}`);

      if (defaultScreenSetting?.value) {
        defaultScreen = defaultScreenSetting.value.defaultScreen;
      }

      let url;
      let queries = {
        isEditCase: psLength === 0 ? true : false
      };

      switch (defaultScreen) {
        case CaseProcessDefaultScreen.FULL_SCREEN:
          url = `${convertTenantName(
            this.sidebarLinksService.tenantName
          )}/${workflowStatesMainRoute}/update/${workflowStateId}/${workflowId}`;
          break;
        case CaseProcessDefaultScreen.SIDE_PANEL:
          url = `${convertTenantName(this.sidebarLinksService.tenantName)}/${workflowStatesMainRoute}/list/${workflowId}`;
          queries['workflowStateId'] = workflowStateId;

          break;
        default:
          break;
      }

      this.router.navigate([url], { queryParams: queries });
    }
  }

  getSystemFields(de: DynamicEntityDto): SystemFieldsTitleFormatter[] {
    const statusField = {
      id: GridSystemFieldsEnum.STATUS,
      type: FieldTypeIds.StringField,
      value: de.statusId
    };
    const createdAt = {
      id: GridSystemFieldsEnum.CREATED_AT,
      type: FieldTypeIds.DateTimeField,
      value: DateTimeFormatHelper.formatDateTime(de.createdAt)
    };
    const updatedAt = {
      id: GridSystemFieldsEnum.UPDATED_AT,
      type: FieldTypeIds.DateTimeField,
      value: DateTimeFormatHelper.formatDateTime(de.updatedAt)
    };
    return [statusField, createdAt, updatedAt];
  }
}
