/**
 * global
 */
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { filter, take, takeUntil } from 'rxjs/operators';

/**
 * local
 */
import { ApplicationState, tenantSettingsSelector } from '../../store';
import { applicationTheme, TenantSettingsDto, Settings, TenantSettingsService } from '../../service-layer';
import { TenantComponent } from '../../shared/tenant.component';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';
@Component({
  selector: 'app-application-theme',
  templateUrl: './application-theme.component.html',
  styleUrls: ['./application-theme.component.scss']
})
export class ApplicationThemeComponent extends TenantComponent implements OnInit {
  mobileQuery: MediaQueryList;
  green: boolean;
  blue: boolean;
  dark: boolean;
  danger: boolean;
  darkgreen: boolean;
  componentId = 'df995810-3460-4cf2-835c-568be9f9b1d7';
  settingId: string;

  @Output() themeUpdated: EventEmitter<boolean> = new EventEmitter();

  _mobileQueryListener: () => void;

  constructor(
    private tenantsService: TenantSettingsService,
    private snackBar: MatSnackBar,
    private store: Store<ApplicationState>,
    private ts: TranslateService,
    private errorHandlerService: ErrorHandlerService
  ) {
    super(store);
  }

  async ngOnInit() {
    await this.getColors();
  }

  async getColors() {
    this.store
      .pipe(
        select(tenantSettingsSelector),
        takeUntil(this.destroyed$),
        filter((x) => !!x && !!x.length),
        take(1)
      )
      .subscribe((settings) => {
        const setting = settings.filter((s) => s.key === applicationTheme);
        if (!setting.length) {
          return;
        }
        this.settingId = settings.filter((s) => s.key === applicationTheme)[0].id;
        const color = settings.filter((s) => s.key === applicationTheme)[0].value;

        if (color) {
          this.green = color.colors.green;
          this.darkgreen = color.colors.darkgreen;
          this.danger = color.colors.danger;
          this.blue = color.colors.blue;
          this.dark = color.colors.dark;
        }
      });
  }

  async onSubmit() {
    const colors = {
      green: this.green,
      blue: this.blue,
      dark: this.dark,
      danger: this.danger,
      darkgreen: this.darkgreen
    };

    const userSettings = <Settings>{
      key: applicationTheme,
      value: {
        colors: colors
      },
      id: this.settingId
    };

    const cmd = <TenantSettingsDto>{
      settings: [userSettings],
      tenantId: this.tenant
    };

    try {
      const op = await this.tenantsService.update(cmd);
      if (op?.status?.toString()?.toLowerCase() === 'success') {
        this.themeUpdated.emit(false);
        this.snackBar.open(this.ts.instant('Theme Saved Successfully!'), 'CLOSE', { duration: 2000 });
        window.location.reload();
      }
    } catch (error) {
      this.errorHandlerService.getAndShowErrorMsg(error);
    }
  }

  checkThemeChangeHandler(): void {
    this.themeUpdated.emit(true);
  }
}
