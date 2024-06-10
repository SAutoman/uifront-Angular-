/**
 * Global
 */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store, select } from '@ngrx/store';
import { takeUntil, filter } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
/**
 * Project
 */
import { EvokedSettingsTitlesEnum, evokedAnswerSettingsKey, SettingsUI, UsersService, EvokedAnswerSettingsEnum } from '@wfm/service-layer';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState, getAllUserSettingsSelector, LoadUserSettings } from '@wfm/store';
import { ConfirmDialogComponent } from '@wfm/confirm-dialog/confirm-dialog.component';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';

export const postCaseSaveSetting = 'postCaseCreationSetting';
export const stepResolutionConfirmationSetting = 'stepResolutionConfirmationSetting';

@Component({
  selector: 'app-evoked-answer-settings',
  templateUrl: './evoked-answer-settings.component.html',
  styleUrls: ['./evoked-answer-settings.component.scss']
})
export class EvokedAnswerSettingsComponent extends TenantComponent implements OnInit {
  @Input() userId: string;
  @Output() onChange = new EventEmitter<boolean>();

  authUserSettings: SettingsUI[];

  settingsList: { title: string; key: string; id: string; value?: any }[] = [
    {
      title: EvokedSettingsTitlesEnum.ForPostCreateAction,
      key: postCaseSaveSetting,
      id: null
    },
    {
      title: EvokedSettingsTitlesEnum.ForStepResolutionConfirmation,
      key: stepResolutionConfirmationSetting,
      id: null
    }
  ];

  constructor(
    private ts: TranslateService,
    private store: Store<ApplicationState>,
    private dialog: MatDialog,
    private usersService: UsersService,
    private snackBar: MatSnackBar,
    private errorHandlerService: ErrorHandlerService
  ) {
    super(store);
    this.store
      .pipe(
        takeUntil(this.destroyed$),
        select(getAllUserSettingsSelector),
        filter((x) => !!x)
      )
      .subscribe((x) => {
        this.authUserSettings = x;
        this.mapSettingValues();
      });
  }

  ngOnInit(): void {}

  mapSettingValues(): void {
    let settings: SettingsUI[] = this.authUserSettings.filter((x) => x.key.includes(`${evokedAnswerSettingsKey}`));
    this.settingsList.forEach((setting) => {
      setting.id = null;
      setting.value = null;
      const tmpSetting = settings.find((s) => s.key.split('_')[1] === setting.key);
      if (tmpSetting) {
        setting.id = tmpSetting.id;
        setting.value =
          tmpSetting?.value?.setting === EvokedAnswerSettingsEnum.Yes
            ? 'Yes'
            : tmpSetting?.value?.setting === EvokedAnswerSettingsEnum.No
            ? 'No'
            : null;
      }
    });
  }

  confirmDelete(id: string): void {
    const dialog = this.dialog.open(ConfirmDialogComponent);
    dialog.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteSetting(id);
      }
    });
  }

  async deleteSetting(id: string): Promise<void> {
    const ind = this.authUserSettings.findIndex((x) => x.id === id);
    if (ind >= 0) {
      try {
        await this.usersService.deleteUserSettings(this.tenant, id);
        this.snackBar.open(this.ts.instant('Setting removed'), 'Ok', { duration: 3000 });
        this.store.dispatch(new LoadUserSettings({ tenantId: this.tenant, userId: this.userId }));
      } catch (error) {
        this.errorHandlerService.getAndShowErrorMsg(error);
      }
    }
  }

  onSettingChanged(value: boolean): void {
    this.onChange.emit(value);
  }
}
