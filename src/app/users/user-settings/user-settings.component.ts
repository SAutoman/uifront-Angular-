/**
 * global
 */
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { select, Store } from '@ngrx/store';
import { filter, takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

/**
 * project
 */

import { StartPage, UsersService, UserSettingsDto, Settings, appStartPage, SettingsUI } from '@wfm/service-layer';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { AuthState, loggedInState, SetUserSettingsByKeyAction } from '@wfm/store';
import { ApplicationState } from '@wfm/store/application/application.reducer';

/**
 * local
 */

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent extends TenantComponent implements OnInit {
  startPageSettingForm: FormGroup;
  componentId = '247e94ac-b8ac-4ef5-98bb-e7d88e1691e2';

  get startPage(): typeof StartPage {
    return StartPage;
  }

  @Input() userId: string;
  @Output() onChange = new EventEmitter<boolean>();
  authState: AuthState;
  startPageDb: SettingsUI;

  constructor(
    private fb: FormBuilder,
    private store: Store<ApplicationState>,
    private usersService: UsersService,
    private snackBar: MatSnackBar,
    private ts: TranslateService
  ) {
    super(store);
  }

  ngOnInit() {
    this.store
      .pipe(
        takeUntil(this.destroyed$),
        select(loggedInState),
        filter((x) => !!x)
      )
      .subscribe((x) => {
        this.authState = x;
        this.startPageDb = this.authState.userSettingsMap[appStartPage];
        this.startPageSettingForm = this.fb.group({
          startPage: [this.startPageDb ? this.startPageDb.value : StartPage.CasesList, [Validators.required]]
        });
      });
  }

  async onSubmit(defaultValue?: number): Promise<void> {
    const userSettings: Settings = {
      isUnique: true,
      fromGroup: undefined,
      fromUser: undefined,
      key: appStartPage,
      value: { appStartPage: !defaultValue ? this.startPageSettingForm.get('startPage').value : defaultValue },
      id: this.startPageDb ? this.startPageDb.id : null
    };

    const tenantId = this.authState.currentTenantSystem.tenant.tenantId;
    const cmd: UserSettingsDto = {
      id: undefined,
      settings: [userSettings],
      userId: this.userId,
      tenantId: tenantId
    };

    const userSettingsUI: SettingsUI = {
      key: appStartPage,
      value: !defaultValue ? this.startPageSettingForm.get('startPage').value : defaultValue,
      id: this.startPageDb ? this.startPageDb.id : null,
      isUnique: true
    };
    const userSettingToUpdate: { [key: string]: SettingsUI } = { [appStartPage]: userSettingsUI };

    if (this.startPageDb) {
      await this.usersService.updateUserSettings(tenantId, cmd);
      this.store.dispatch(new SetUserSettingsByKeyAction({ userSettings: userSettingToUpdate }));
    } else {
      await this.usersService.createUserSettings(tenantId, cmd);
      this.store.dispatch(new SetUserSettingsByKeyAction({ userSettings: userSettingToUpdate }));
    }
    this.onChange.emit(false);
    this.snackBar.open(this.ts.instant('User Settings Saved Successfully!'), 'CLOSE', { duration: 2000 });
  }

  userSettingsChanged(): void {
    this.onChange.emit(true);
  }
}
