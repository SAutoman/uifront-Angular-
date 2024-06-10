/**
 * Global
 */
import { Component, Inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
/**
 * Project
 */
import { APP_CLIENT_ID, SettingsUI } from '@wfm/service-layer';
import { CreateAppSettingsDto, UpdateAppSettingsDto } from '@wfm/service-layer/models/app-settings';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { CreateAppSettingAction, UpdateAppSetting } from '@wfm/store/app-settings/app-settings.actions';
import { AppSettingsState } from '@wfm/store/app-settings/app-settings.reducer';
import { ConfirmActionComponent } from '@wfm/workflow-state/confirm-action/confirm-action.component';
/**
 * Local
 */

interface SettingsData {
  key: string;
  enabled: boolean;
  isUnique: boolean;
}

@Component({
  selector: 'app-basic-app-setting',
  templateUrl: './basic-app-setting.component.html',
  styleUrls: ['./basic-app-setting.component.scss']
})
export class BasicAppSettingComponent extends TenantComponent implements OnInit, OnChanges {
  @Input() settings: SettingsUI[];
  @Input() key: string;

  appSettingsForm: FormGroup;
  keySetting: SettingsUI;

  constructor(
    @Inject(APP_CLIENT_ID) readonly appId: string,
    private store: Store<AppSettingsState>,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    super(store);
    this.appSettingsForm = this.fb.group({
      key: [this.key],
      enabled: [],
      isUnique: [true]
    });
  }

  ngOnInit(): void {
    this.appSettingsForm.controls.key.setValue(this.key);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.settings?.currentValue) {
      const keySetting = this.settings?.find((x) => x?.key === this.key);
      if (keySetting) {
        this.keySetting = keySetting;
        this.appSettingsForm.controls.enabled.setValue(keySetting?.value?.enabled);
      }
    }
  }

  async onSubmit(): Promise<void> {
    const settingsData = this.appSettingsForm.value;
    if (this.keySetting?.id) {
      if (await this.confirmUpdateSetting()) this.updateSetting(settingsData);
    } else this.createSetting(settingsData);
  }

  async confirmUpdateSetting(): Promise<boolean> {
    const ref = this.dialog.open(ConfirmActionComponent, {
      data: {
        title: 'Warning',
        message: 'Are you sure you want to modify this App Setting? It can cause changes in application flow globally.',
        showProceedBtn: true
      }
    });
    return await ref.afterClosed().toPromise();
  }

  updateSetting(settingsData: SettingsData): void {
    const data: UpdateAppSettingsDto = {
      appId: this.appId,
      settings: [
        {
          id: this.keySetting.id,
          isUnique: settingsData?.isUnique,
          key: this.key,
          value: { enabled: settingsData?.enabled }
        }
      ]
    };
    this.store.dispatch(new UpdateAppSetting({ data: data }));
  }

  createSetting(settingsData: SettingsData): void {
    const data: CreateAppSettingsDto = {
      appId: this.appId,
      key: settingsData.key,
      settingsJson: { enabled: settingsData.enabled }
    };
    this.store.dispatch(new CreateAppSettingAction({ data: data }));
  }
}
