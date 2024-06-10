/**
 * Global
 */
import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
/**
 * Project
 */
import { SettingsUI } from '@wfm/service-layer';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ResetAppSettingOperationMsg, SearchAppSettings } from '@wfm/store/app-settings/app-settings.actions';
import { AppSettingsState } from '@wfm/store/app-settings/app-settings.reducer';
import { getAppSettingsOperationMsgSelector, getAppSettingsSelector } from '@wfm/store/app-settings/app-settings.selectors';
import { AppSettingKeysEnum } from '@wfm/service-layer/models/app-settings';

@Component({
  selector: 'app-app-settings',
  templateUrl: './app-settings.component.html',
  styleUrls: ['./app-settings.component.scss']
})
export class AppSettingsComponent extends TenantComponent implements OnInit {
  appSettings: SettingsUI[];
  selectedSettingKey: string;

  get AppSettingsKeyEnum() {
    return AppSettingKeysEnum;
  }

  constructor(private store: Store<AppSettingsState>, private snackbar: MatSnackBar) {
    super(store);
  }

  ngOnInit(): void {
    this.store.dispatch(new SearchAppSettings({ paging: { skip: 0, take: 999 } }));
    this.store.pipe(select(getAppSettingsSelector), takeUntil(this.destroyed$)).subscribe((settings) => {
      this.appSettings = settings;
    });
    this.store.pipe(select(getAppSettingsOperationMsgSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x && x.toLocaleLowerCase().includes('success')) {
        this.snackbar.open(x, 'Ok', { duration: 3000 });
        this.store.dispatch(new ResetAppSettingOperationMsg());
        this.store.dispatch(new SearchAppSettings({ paging: { skip: 0, take: 999 } }));
      } else if (x && x.toLocaleLowerCase().includes('fail')) {
        this.store.dispatch(new ResetAppSettingOperationMsg());
      }
    });
  }
}
