import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Settings, startOfWeekSettingsKey, TenantSettingsDto, TenantSettingsService } from '@wfm/service-layer';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';
import { StartOfWeekEnum } from '@wfm/shared/dateTimeFormatHelper';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState, AuthState, FetchTenantSettingsAction, loggedInState } from '@wfm/store';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-start-of-week',
  templateUrl: './start-of-week.component.html',
  styleUrls: ['./start-of-week.component.scss']
})
export class StartOfWeekComponent extends TenantComponent implements OnInit {
  @Output() formStatus: EventEmitter<boolean> = new EventEmitter();

  componentId = 'cf243f02-adf1-440c-86dc-0c381e1cbac0';
  startWeekForm: FormGroup;
  settingId: string;
  tenantAuthState: AuthState;
  get startOfWeek() {
    return StartOfWeekEnum;
  }

  constructor(
    private tenantsService: TenantSettingsService,
    private store: Store<ApplicationState>,
    private snackbar: MatSnackBar,
    private ts: TranslateService,
    private errorHandlerService: ErrorHandlerService
  ) {
    super(store);
  }

  ngOnInit(): void {
    this.startWeekForm = new FormGroup({
      startOfWeek: new FormControl(1)
    });

    this.store.pipe(takeUntil(this.destroyed$), select(loggedInState)).subscribe((data) => {
      if (data) {
        this.tenantAuthState = data;
        this.filterSettings();
      }
    });
  }

  startOfWeekUpdated(): void {
    this.formStatus.emit(true);
  }

  filterSettings(): void {
    const currentSettings = this.tenantAuthState?.currentTenantSystem?.tenantSettings.filter((x) =>
      x.key.includes(`${startOfWeekSettingsKey}`)
    );
    if (currentSettings && currentSettings[0]) {
      this.settingId = currentSettings[0].id;
      this.startWeekForm.get('startOfWeek').setValue(currentSettings[0].value.firstDayOfWeek);
    }
  }

  async onSubmit(): Promise<void> {
    try {
      const userSettings = <Settings>{
        key: `${startOfWeekSettingsKey}`,
        value: { firstDayOfWeek: this.startWeekForm.get('startOfWeek').value },
        id: this.settingId
      };

      const cmd = <TenantSettingsDto>{
        settings: [userSettings],
        tenantId: this.tenant
      };
      await this.tenantsService.update(cmd);
      this.snackbar.open(this.ts.instant('Settings saved successfully'), 'Ok', { duration: 2000 });
      // without reloading the change does not apply dynamically
      window.location.reload();

      // this.refreshTenantSettings();
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
