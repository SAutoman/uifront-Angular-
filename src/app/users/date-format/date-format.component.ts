/**
 * global
 */
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { select, Store } from '@ngrx/store';
import { filter, takeUntil } from 'rxjs/operators';
import { DateTime } from 'luxon';
import { TranslateService } from '@ngx-translate/core';

/**
 * project
 */
import { appDateFormatKey, Settings, UserSettingsDto, UsersService, DateFormat, SettingsUI } from '@wfm/service-layer';
import { ApplicationState, dateFormatSettingsSelector, StoreDateFormatSettingAction } from '@wfm/store';
import { BaseComponent } from '@wfm/shared/base.component';

/**
 * local
 */

@Component({
  selector: 'app-date-format',
  templateUrl: './date-format.component.html',
  styleUrls: ['./date-format.component.scss']
})
export class DateFormatComponent extends BaseComponent implements OnInit {
  @Input() userId: string;
  @Input() tenantId: string;
  @Output() onChange = new EventEmitter<boolean>();

  locale: string;
  isoDate: string;
  longDate: string;
  shortDate: string;
  other: string;

  dateFormatSettingForm: FormGroup;
  dateFormatDb: SettingsUI;

  componentId = '8939f993-e2e1-4295-af4f-c79f47a4b751';

  constructor(
    private formBuilder: FormBuilder,
    private usersService: UsersService,
    private snackBar: MatSnackBar,
    private store: Store<ApplicationState>,
    private ts: TranslateService
  ) {
    super();
    this.dateFormatSettingForm = this.formBuilder.group({
      dateFormat: [this.dateFormat.BrowseCultureDate, [Validators.required]]
    });
  }

  get dateFormat(): typeof DateFormat {
    return DateFormat;
  }

  async ngOnInit(): Promise<void> {
    this.store
      .pipe(
        takeUntil(this.destroyed$),
        select(dateFormatSettingsSelector),
        filter((x) => !!x)
      )
      .subscribe((s) => {
        this.dateFormatDb = s;
        this.dateFormatSettingForm.controls.dateFormat.patchValue(this.dateFormatDb.value);
      });
    this.formatPresentDate();
  }

  formatPresentDate(): void {
    // ('L');
    this.locale = DateTime.now().toFormat('D');
    // ('YYYY-MM-DD');
    this.isoDate = DateTime.now().toFormat('yyyy-MM-dd');
    // ('MMM DD YYYY');
    this.longDate = DateTime.now().toFormat('MMM dd yyyy');
    // ('MM/DD/YYYY');
    this.shortDate = DateTime.now().toFormat('MM/dd/yyyy');

    // ('DD.MM.YYYY');
    this.other = DateTime.now().toFormat('dd.MM.yyyy');
  }

  async onSubmit(): Promise<void> {
    const dateFormatSettings = <Settings>{
      key: appDateFormatKey,
      value: { [appDateFormatKey]: this.dateFormatSettingForm.get('dateFormat').value },
      id: this.dateFormatDb ? this.dateFormatDb.id : null,
      isUnique: true
    };
    const cmd = <UserSettingsDto>{
      settings: [dateFormatSettings],
      userId: this.userId,
      tenantId: this.tenantId
    };
    if (this.dateFormatDb) {
      await this.usersService.updateUserSettings(this.tenantId, cmd);
    } else {
      await this.usersService.createUserSettings(this.tenantId, cmd);
    }
    this.snackBar.open(this.ts.instant('User Settings Saved Successfully!'), 'CLOSE', { duration: 2000 });
    this.store.dispatch(new StoreDateFormatSettingAction({ tenantId: this.tenantId, userId: this.userId }));
    this.onChange.emit(false);
  }

  onDateChange(): void {
    this.onChange.emit(true);
  }
}
