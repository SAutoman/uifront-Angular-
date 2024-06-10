import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { select, Store } from '@ngrx/store';
import { takeUntil, filter } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
/**
 * project
 */
import { UsersService, SortingSettingEnum, SettingsUI, sortingSettingsKey, Settings, UserSettingsDto } from '@wfm/service-layer';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState, getAllUserSettingsSelector, LoadUserSettings } from '@wfm/store';

@Component({
  selector: 'app-user-sorting-settings',
  templateUrl: './user-sorting-settings.component.html',
  styleUrls: ['./user-sorting-settings.component.scss']
})
export class UserSortingSettingsComponent extends TenantComponent implements OnInit, OnDestroy {
  @Input() userId: string;
  @Output() onChange = new EventEmitter<boolean>();

  sortingSettingForm: FormGroup;
  componentId = '247e94ac-b8ac-4ef5-98bb-e7d88e1691e3';
  authUserSettings: SettingsUI[];
  existingSortSetting: SettingsUI;

  get sortingSettings(): typeof SortingSettingEnum {
    return SortingSettingEnum;
  }

  constructor(
    private fb: FormBuilder,
    private store: Store<ApplicationState>,
    private usersService: UsersService,
    private snackBar: MatSnackBar,
    private ts: TranslateService
  ) {
    super(store);
    this.sortingSettingForm = this.fb.group({
      sortSetting: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.store
      .pipe(
        takeUntil(this.destroyed$),
        select(getAllUserSettingsSelector),
        filter((x) => !!x)
      )
      .subscribe((x) => {
        this.authUserSettings = x;
        this.existingSortSetting = this.authUserSettings.find((x) => x.key === sortingSettingsKey);
        if (this.existingSortSetting) {
          const sortingFormatValue: number = this.existingSortSetting?.value?.hasOwnProperty('sortSetting')
            ? this.existingSortSetting?.value['sortSetting']
            : this.existingSortSetting?.value;
          this.sortingSettingForm.controls.sortSetting.patchValue(sortingFormatValue);
        } else this.sortingSettingForm.controls.sortSetting.setValue(SortingSettingEnum.default);
      });
  }

  userSettingsChanged(): void {
    this.onChange.emit(true);
  }

  async onSubmit(): Promise<void> {
    try {
      const userSettings: Settings = {
        isUnique: true,
        fromGroup: undefined,
        fromUser: undefined,
        key: sortingSettingsKey,
        value: { sortSetting: this.sortingSettingForm.get('sortSetting').value },
        id: this.existingSortSetting ? this.existingSortSetting.id : null
      };
      const tenantId = this.tenant;
      const cmd: UserSettingsDto = {
        id: undefined,
        settings: [userSettings],
        userId: this.userId,
        tenantId: tenantId
      };
      if (this.existingSortSetting) {
        await this.usersService.updateUserSettings(tenantId, cmd);
      } else {
        await this.usersService.createUserSettings(tenantId, cmd);
      }
      this.store.dispatch(new LoadUserSettings({ tenantId: this.tenant, userId: this.userId }));
      this.onChange.emit(false);
      this.snackBar.open(this.ts.instant('User Settings Saved Successfully!'), 'CLOSE', { duration: 2000 });
    } catch (error) {
      console.log(error);
    }
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
