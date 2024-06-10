/**
 * Global
 */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
/**
 * Project
 */
import { Settings, SettingsUI, tenantDocumentManagementSettingKey, TenantSettingsDto, TenantSettingsService } from '@wfm/service-layer';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { AuthState, ResetTenantListPageViewModel } from '@wfm/store';
/**
 * Local
 */
import { TenantViewModel } from '../tenant.model';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';

@Component({
  selector: 'app-document-management',
  templateUrl: './document-management.component.html',
  styleUrls: ['./document-management.component.scss']
})
export class DocumentManagementComponent extends TenantComponent implements OnInit, OnDestroy {
  componentId: string = '18cc3cdd-02a3-4d84-8bef-597bb4d9c7f6';
  maxFileSize: number = 10;
  documentFileSizes: number[] = [];
  tenantFileSizeForm: FormGroup;
  existingDocumentSetting: SettingsUI;
  isLoading: boolean = false;

  constructor(
    private store: Store<AuthState>,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private tenantsService: TenantSettingsService,
    private ts: TranslateService,
    private errorHandlerService: ErrorHandlerService
  ) {
    super(store);
    for (let index = 0; index < this.maxFileSize; index++) {
      this.documentFileSizes.push(index + 1);
    }
    this.tenantFileSizeForm = this.fb.group({
      tenantId: [null],
      fileSize: [this.maxFileSize]
    });
  }

  ngOnInit(): void {}

  async onTenantChange(formValue: any): Promise<void> {
    const tenantId = formValue?.tenantId?.id;
    this.isLoading = true;
    const tenantSettings = await this.fetchTenantSettingsByTenant(tenantId);
    this.isLoading = false;
    this.existingDocumentSetting = tenantSettings.find((x) => x.key === `${tenantDocumentManagementSettingKey}_${tenantId}`);
    if (this.existingDocumentSetting) {
      this.tenantFileSizeForm.controls.fileSize.setValue(this.existingDocumentSetting.value?.fileSize);
    } else this.tenantFileSizeForm.controls.fileSize.setValue(this.maxFileSize);
  }

  async fetchTenantSettingsByTenant(tenantId: string): Promise<Settings[]> {
    try {
      return (await this.tenantsService.getByTenant(tenantId)).settings;
    } catch (error) {
      console.log(error);
      this.isLoading = false;
    }
  }

  async onSubmit(formValue: any): Promise<void> {
    try {
      if (formValue?.tenantId?.id && formValue?.fileSize) {
        this.isLoading = true;
        const userSettings = <Settings>{
          key: `${tenantDocumentManagementSettingKey}_${formValue.tenantId.id}`,
          value: { fileSize: formValue.fileSize },
          id: this.existingDocumentSetting?.id || null
        };
        const cmd = <TenantSettingsDto>{
          settings: [userSettings],
          tenantId: formValue.tenantId.id
        };
        await this.tenantsService.update(cmd);
        this.isLoading = false;
        this.snackBar.open(this.ts.instant('Tenant Settings Saved Successfully!'), 'CLOSE', { duration: 2000 });
      } else this.snackBar.open(this.ts.instant('Please select a tenant'), 'Ok', { duration: 3000 });
    } catch (error) {
      this.errorHandlerService.getAndShowErrorMsg(error);
      this.isLoading = false;
    }
  }

  onTenantSelected(event: TenantViewModel): void {
    if (event) {
      this.tenantFileSizeForm.controls.tenantId.setValue(event);
    }
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.store.dispatch(new ResetTenantListPageViewModel());
  }
}
