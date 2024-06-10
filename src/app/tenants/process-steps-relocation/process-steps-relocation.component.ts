import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Settings, TenantSettingsDto, TenantSettingsService, WorkflowSimplifiedDto } from '@wfm/service-layer';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { FetchTenantSettingsAction } from '@wfm/store/auth/auth.actions';
import { AuthState } from '@wfm/store/auth/auth.reducer';
import { loggedInState, workflowMenuItemsSelector } from '@wfm/store/auth/auth.selectors';
import { WorkflowState } from '@wfm/store/workflow';
import { takeUntil } from 'rxjs/operators';

export const processStepRelocationSettingsKey = 'processStepsRelocation';

@Component({
  selector: 'app-process-steps-relocation',
  templateUrl: './process-steps-relocation.component.html',
  styleUrls: ['./process-steps-relocation.component.scss']
})
export class ProcessStepsRelocationComponent extends TenantComponent implements OnInit {
  tenantAuthState: AuthState;
  selectedWorkflow: string;
  disableRelocation: boolean = false;
  workflowsList: WorkflowSimplifiedDto[];
  settingId: string;

  constructor(
    private store: Store<WorkflowState>,
    private tenantsService: TenantSettingsService,
    private snackbar: MatSnackBar,
    private ts: TranslateService,
    private errorHandlerService: ErrorHandlerService
  ) {
    super(store);
    this.store.pipe(takeUntil(this.destroyed$), select(loggedInState)).subscribe((data) => {
      if (data) {
        this.tenantAuthState = data;
      }
    });
  }

  ngOnInit(): void {
    this.loadWorkflows();
  }

  loadWorkflows(): void {
    this.store.pipe(select(workflowMenuItemsSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x?.length) {
        this.workflowsList = x.map((menuItem) => menuItem.setting);
        this.selectedWorkflow = this.workflowsList[0].id;
        this.filterSettings();
      }
    });
  }

  filterSettings(): void {
    const currentSettings = this.tenantAuthState?.currentTenantSystem?.tenantSettings.find((x) =>
      x.key.includes(`${processStepRelocationSettingsKey}_${this.selectedWorkflow}`)
    );
    if (currentSettings) {
      this.settingId = currentSettings.id;
      this.disableRelocation = currentSettings.value.disable;
    }
  }

  async onSubmit(): Promise<void> {
    try {
      const userSettings = <Settings>{
        key: `${processStepRelocationSettingsKey}_${this.selectedWorkflow}`,
        value: { disable: this.disableRelocation },
        id: this.settingId
      };

      const cmd = <TenantSettingsDto>{
        settings: [userSettings],
        tenantId: this.tenant
      };
      await this.tenantsService.update(cmd);
      this.snackbar.open(this.ts.instant('Settings saved successfully'), 'Ok', { duration: 2000 });
      this.refreshTenantSettings();
    } catch (error) {
      this.errorHandlerService.getAndShowErrorMsg(error);
    }
  }

  refreshTenantSettings(): void {
    this.store.dispatch(
      new FetchTenantSettingsAction({ tenant: this.tenantAuthState.currentTenantSystem.tenant, userId: this.tenantAuthState.profile.id })
    );
  }

  onWorkflowChange(): void {
    this.filterSettings();
  }
}
