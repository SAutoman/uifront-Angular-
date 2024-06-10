import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store, select } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';

import { Roles, Settings, TenantSettingsDto, TenantSettingsService } from '@wfm/service-layer';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { AuthState, FetchTenantSettingsAction, SetRawDataMenuOption, loggedInState } from '@wfm/store';
import { WorkflowState } from '@wfm/store/workflow';
import { FormBuilder, FormGroup } from '@angular/forms';
import { convertFieldName } from '@wfm/service-layer/helpers';
import { TranslateService } from '@ngx-translate/core';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';

export const tenantRawDataMenuSetting = 'tenantRawDataSetting';

@Component({
  selector: 'app-tenant-raw-data-setting',
  templateUrl: './tenant-raw-data-setting.component.html',
  styleUrls: ['./tenant-raw-data-setting.component.scss']
})
export class TenantRawDataSettingComponent extends TenantComponent implements OnInit {
  tenantAuthState: AuthState;
  settingId: string = null;
  userRoles: { name: string; value: Roles }[];
  rolesForm: FormGroup;

  constructor(
    private store: Store<WorkflowState>,
    private tenantsService: TenantSettingsService,
    private snackbar: MatSnackBar,
    private fb: FormBuilder,
    private ts: TranslateService,
    private errorHandlerService: ErrorHandlerService
  ) {
    super(store);
    this.rolesForm = this.fb.group({
      tenantAdmin: [true],
      tenant: [true],
      auditor: [true],
      supplier: [true]
    });
    this.store.pipe(takeUntil(this.destroyed$), select(loggedInState)).subscribe((data) => {
      if (data) {
        this.tenantAuthState = data;
        this.filterSettings();
      }
    });
    const roles = [Roles.TenantAdmin, Roles.Tenant, Roles.Auditor, Roles.Supplier];
    this.userRoles = roles.map((role) => {
      return {
        name: Roles[role],
        value: role
      };
    });
  }

  ngOnInit(): void {}

  filterSettings(): void {
    const currentSettings = this.tenantAuthState?.currentTenantSystem?.tenantSettings.find((x) => x.key === `${tenantRawDataMenuSetting}`);
    if (currentSettings) {
      this.settingId = currentSettings.id;
      const value = currentSettings.value?.roles;
      if (value) {
        this.rolesForm.setValue({
          tenantAdmin: value?.tenantAdmin,
          tenant: value?.tenant,
          auditor: value?.auditor,
          supplier: value?.supplier
        });
      }
    }
  }

  async onSubmit(showMsg?: boolean): Promise<void> {
    const formData = this.rolesForm.value;
    const rolesData = {
      tenantAdmin: formData.tenantAdmin,
      tenant: formData.tenant,
      auditor: formData.auditor,
      supplier: formData.supplier
    };
    try {
      const userSettings = <Settings>{
        key: `${tenantRawDataMenuSetting}`,
        value: { roles: rolesData },
        id: this.settingId
      };
      const cmd = <TenantSettingsDto>{
        settings: [userSettings],
        tenantId: this.tenant
      };
      await this.tenantsService.update(cmd);
      if (showMsg) this.snackbar.open(this.ts.instant('Settings saved successfully'), 'Ok', { duration: 2000 });
      this.refreshTenantSettings();
      const currentUserRole = convertFieldName(this.tenantAuthState.currentTenantSystem.tenant.role);
      // to apply setting for current user role
      if (rolesData[currentUserRole] === true || rolesData[currentUserRole] === false) {
        this.store.dispatch(new SetRawDataMenuOption({ showRawData: rolesData[currentUserRole] }));
      }
    } catch (error) {
      this.errorHandlerService.getAndShowErrorMsg(error);
    }
  }

  refreshTenantSettings(): void {
    this.store.dispatch(
      new FetchTenantSettingsAction({ tenant: this.tenantAuthState.currentTenantSystem.tenant, userId: this.tenantAuthState.profile.id })
    );
  }
}
