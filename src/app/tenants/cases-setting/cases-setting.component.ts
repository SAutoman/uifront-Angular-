import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { KeyValue } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { select, Store } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';

/**
 * Global
 */
import {
  AreaTypeEnum,
  FieldTypeIds,
  Settings,
  SettingsUI,
  TenantSettingsDto,
  TenantSettingsService,
  WorkflowSimplifiedDto
} from '@wfm/service-layer';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { AuthState, FetchTenantSettingsAction, tenantSettingsSelector, loggedInState, workflowMenuItemsSelector } from '@wfm/store';
import { CaseViewEnum } from '@wfm/workflow-state/workflow-states-list/workflow-states-list.component';
import { isIntegerValidator } from '@wfm/service-layer/helpers';
import { CaseActionsEnum } from '@wfm/workflow-state/workflow-states-grid/workflow-states-grid.component';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';
/**
 * Project
 */

/**
 * Local
 */

export const casesGroupSettingKey = 'casesGroupSetting';
export const casesActionsSettingKey = 'casesActionsSetting';
export const caseCreateDefaultScreenKey = 'caseCreateDefaultScreenSetting';
export const caseExpandGridRowKey = 'caseExpandGridRow';

interface SchemaField {
  fieldName: string;
  displayName: string;
}

export enum CardSystemFieldsEnum {
  STATUS_ID = 'statusId',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt'
}

export enum CaseProcessDefaultScreen {
  FULL_SCREEN = 0,
  SIDE_PANEL = 1
}

interface WorkflowDto {
  workflowId: string;
}

interface CasePrintPreviewVisibilitySetting extends WorkflowDto {
  hideStepFields: boolean;
  hideCaseFields: boolean;
}

interface CardGroupSetting extends WorkflowDto {
  field: string;
  limit: number;
}

interface ExtraButtonSetting extends WorkflowDto {
  actions: string[];
}

@Component({
  selector: 'app-cases-setting',
  templateUrl: './cases-setting.component.html',
  styleUrls: ['./cases-setting.component.scss']
})
export class CasesSettingComponent extends TenantComponent implements OnInit {
  @Output() caseSettingsChangeEmitter: EventEmitter<boolean> = new EventEmitter(null);

  workflowsList: WorkflowSimplifiedDto[];
  schemaFields: SchemaField[];
  cardViewSettingform: FormGroup;
  casesGroupingSetting: SettingsUI;
  tenantSettings: SettingsUI[];
  tenantAuthState: AuthState;
  settingSavedFlag: boolean = false;

  caseActionsForm: FormGroup;
  caseExtraActions: KeyValue<string, CaseActionsEnum>[];
  // caseDefaultActions: KeyValue<string, CaseActionsEnum>[];
  caseActionsSetting: SettingsUI;
  workflowSelector: FormControl;

  defaultScreenSelector: FormControl;
  defaultScreenSetting: SettingsUI;
  expandGridRowSetting: SettingsUI;
  expandGridRowSelector: FormControl;

  get caseViewEnum() {
    return CaseViewEnum;
  }

  get caseDefaultScreen() {
    return CaseProcessDefaultScreen;
  }

  constructor(
    private store: Store<any>,
    private adminSchemasService: AdminSchemasService,
    private fb: FormBuilder,
    private tenantSettingsService: TenantSettingsService,
    private snackBar: MatSnackBar,
    private ts: TranslateService,
    private errorHandlerService: ErrorHandlerService
  ) {
    super(store);
    this.store.pipe(takeUntil(this.destroyed$), select(loggedInState)).subscribe((data) => {
      if (data) {
        this.tenantAuthState = data;
      }
    });

    this.workflowSelector = new FormControl(null, Validators.required);

    this.cardViewSettingform = this.fb.group({
      field: [null, Validators.required],
      cardsLimit: [20, Validators.compose([Validators.required, Validators.min(1), isIntegerValidator()])]
    });
    this.cardViewSettingform.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((form) => {
      this.caseSettingsChangeEmitter.emit(true);
    });

    this.defaultScreenSelector = new FormControl(CaseProcessDefaultScreen.FULL_SCREEN);

    this.expandGridRowSelector = new FormControl(false);

    this.caseExtraActions = [
      {
        key: 'Edit',
        value: CaseActionsEnum.Edit
      },
      {
        key: 'Print Preview',
        value: CaseActionsEnum.CasePrintPreview
      },
      {
        key: 'Download',
        value: CaseActionsEnum.Download
      }
      // {
      //   key: 'Info',
      //   value: CaseActionsEnum.Info
      // }
    ];
    // default actions can be used later
    // this.caseDefaultActions = [
    // ];

    this.caseActionsForm = this.fb.group({
      extraActions: [[]]
      // defaultActions: [[]]
    });
    this.caseActionsForm.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((form) => {
      this.caseSettingsChangeEmitter.emit(true);
    });
  }

  ngOnInit(): void {
    this.workflowSelector.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((x) => {
      this.onWorkflowSelection(x);
      this.resetSettings();
      this.getExistingSetting(x, true);
    });

    this.store.pipe(select(workflowMenuItemsSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x?.length) {
        this.workflowsList = x.map((menuItem) => menuItem.setting);
        this.getTenantSettings();
      }
    });
  }

  resetSettings(): void {
    this.casesGroupingSetting = null;
    this.cardViewSettingform.controls.field.reset();
    this.cardViewSettingform.controls.field.markAsUntouched();

    this.caseActionsSetting = null;
    this.caseActionsForm.reset();

    this.defaultScreenSelector.reset(CaseProcessDefaultScreen.FULL_SCREEN);
    this.defaultScreenSetting = null;
    this.expandGridRowSetting = null;
  }

  getTenantSettings(): void {
    this.store.pipe(select(tenantSettingsSelector), takeUntil(this.destroyed$)).subscribe((settings) => {
      this.tenantSettings = settings;
      if (!this.workflowSelector.value) {
        this.workflowSelector.patchValue(this.workflowsList[0]?.id);
      }
      // To update settings's ID post save
      if (this.settingSavedFlag) {
        const wfId = this.workflowSelector.value;
        this.getExistingSetting(wfId, false);
        this.settingSavedFlag = false;
      }
    });
  }

  getExistingSetting(wfId: string, updateForm: boolean): void {
    this.tenantSettings?.forEach((sett) => {
      if (sett.key === `${casesGroupSettingKey}_${wfId}_${AreaTypeEnum.case}`) {
        this.casesGroupingSetting = sett;
      } else if (sett.key === `${casesActionsSettingKey}_${wfId}`) {
        this.caseActionsSetting = sett;
      } else if (sett.key === `${caseCreateDefaultScreenKey}_${wfId}`) {
        this.defaultScreenSetting = sett;
      } else if (sett.key === `${caseExpandGridRowKey}_${wfId}`) {
        this.expandGridRowSetting = sett;
      }
    });

    if (this.casesGroupingSetting && updateForm) {
      this.cardViewSettingform.patchValue({
        field: this.casesGroupingSetting?.value?.field,
        cardsLimit: this.casesGroupingSetting?.value?.limit
      });
    }

    if (this.caseActionsSetting && updateForm) {
      this.caseActionsForm.patchValue({
        extraActions: this.caseActionsSetting?.value?.actions
        // defaultActions: this.caseActionsSetting?.value?.defaultActionsToHide
      });
    }

    if (this.defaultScreenSetting && updateForm) {
      this.defaultScreenSelector.patchValue(this.defaultScreenSetting?.value?.defaultScreen);
    }

    if (this.expandGridRowSetting && updateForm) {
      this.expandGridRowSelector.patchValue(this.expandGridRowSetting?.value?.expandGridRow);
    }
  }

  async onWorkflowSelection(wfId: string): Promise<void> {
    const caseSchemaId = this.workflowsList?.find((wf) => wf.id === wfId)?.caseSchemaId;
    if (caseSchemaId) {
      const schema = await this.adminSchemasService.getSchema(this.tenant, AreaTypeEnum.case, caseSchemaId);
      this.schemaFields = schema.fields
        ?.filter(
          (f) =>
            f.type !== FieldTypeIds.ConnectorField &&
            f.type !== FieldTypeIds.LinkField &&
            f.type !== FieldTypeIds.ListOfLinksField &&
            f.type !== FieldTypeIds.MultiselectListField &&
            f.type !== FieldTypeIds.FileField &&
            f.type !== FieldTypeIds.SchemaField &&
            f.type !== FieldTypeIds.EmbededField
        )
        .map((f) => {
          return { fieldName: f.fieldName, displayName: f.displayName };
        });
      this.schemaFields = [...this.schemaFields, ...this.addSystemFields()];
    }
  }

  addSystemFields(): SchemaField[] {
    return [
      {
        fieldName: CardSystemFieldsEnum.STATUS_ID,
        displayName: 'Status'
      },
      {
        fieldName: CardSystemFieldsEnum.CREATED_AT,
        displayName: 'CreatedAt'
      },
      {
        fieldName: CardSystemFieldsEnum.UPDATED_AT,
        displayName: 'UpdatedAt'
      }
    ];
  }

  async onSubmit(): Promise<void> {
    try {
      if (this.workflowSelector.valid && this.cardViewSettingform.touched && this.cardViewSettingform.valid) {
        await this.updateCardGroupSetting();
      }
      if (this.workflowSelector.valid && this.caseActionsForm.touched && this.caseActionsForm.valid) {
        await this.updateButtonsSetting();
      }

      if (this.workflowSelector.valid && this.defaultScreenSelector.touched && this.defaultScreenSelector.valid) {
        await this.updateDefaultScreenSetting();
      }

      if (this.workflowSelector.valid && this.expandGridRowSelector.touched && this.expandGridRowSelector.valid) {
        await this.updateExpandGridRowSetting();
      }

      this.snackBar.open(this.ts.instant('Tenant Settings Saved Successfully!'), 'CLOSE', { duration: 2000 });
      this.refreshTenantSettings();
      this.settingSavedFlag = true;
      this.caseSettingsChangeEmitter.emit(false);
    } catch (error) {
      this.errorHandlerService.getAndShowErrorMsg(error);
    }
  }

  async updateCardGroupSetting(): Promise<void> {
    const formValue = this.cardViewSettingform.value;
    const selectedWorkflow = this.workflowSelector.value;
    const settings: CardGroupSetting = {
      workflowId: selectedWorkflow,
      field: formValue?.field,
      limit: formValue?.cardsLimit
    };
    const userSettings = <Settings>{
      key: `${casesGroupSettingKey}_${selectedWorkflow}_${AreaTypeEnum.case}`,
      value: settings,
      id: this.casesGroupingSetting?.id
    };
    const cmd = <TenantSettingsDto>{
      settings: [userSettings],
      tenantId: this.tenant
    };
    await this.tenantSettingsService.update(cmd);
  }

  async updateButtonsSetting(): Promise<void> {
    const selectedWorkflow = this.workflowSelector.value;
    const settings: ExtraButtonSetting = {
      workflowId: selectedWorkflow,
      actions: this.caseActionsForm.get('extraActions').value
      // defaultActionsToHide: this.caseActionsForm.get('defaultActions').value
    };
    const userSettings = <Settings>{
      key: `${casesActionsSettingKey}_${selectedWorkflow}`,
      value: settings,
      id: this.caseActionsSetting?.id
    };
    const cmd = <TenantSettingsDto>{
      settings: [userSettings],
      tenantId: this.tenant
    };
    await this.tenantSettingsService.update(cmd);
  }

  async updateDefaultScreenSetting(): Promise<void> {
    const selectedWorkflow = this.workflowSelector.value;
    const settings = {
      workflowId: selectedWorkflow,
      defaultScreen: this.defaultScreenSelector.value
    };
    const userSettings = <Settings>{
      key: `${caseCreateDefaultScreenKey}_${selectedWorkflow}`,
      value: settings,
      id: this.defaultScreenSetting?.id
    };
    const cmd = <TenantSettingsDto>{
      settings: [userSettings],
      tenantId: this.tenant
    };
    await this.tenantSettingsService.update(cmd);
  }

  async updateExpandGridRowSetting(): Promise<void> {
    const selectedWorkflow = this.workflowSelector.value;
    const settings = {
      workflowId: selectedWorkflow,
      expandGridRow: this.expandGridRowSelector.value
    };
    const userSettings = <Settings>{
      key: `${caseExpandGridRowKey}_${selectedWorkflow}`,
      value: settings,
      id: this.expandGridRowSetting?.id
    };
    const cmd = <TenantSettingsDto>{
      settings: [userSettings],
      tenantId: this.tenant
    };
    await this.tenantSettingsService.update(cmd);
  }

  refreshTenantSettings(): void {
    this.store.dispatch(
      new FetchTenantSettingsAction({ tenant: this.tenantAuthState.currentTenantSystem.tenant, userId: this.tenantAuthState.profile.id })
    );
  }
}
