/**
 * global
 */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { FieldType } from '@ngx-formly/material/form-field';
import { DateTime } from 'luxon';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { LuxonDateAdapter, MAT_LUXON_DATE_ADAPTER_OPTIONS } from '@angular/material-luxon-adapter';
/**
 * project
 */
import DateTimeFormatHelper, { IDateFormat } from '@wfm/shared/dateTimeFormatHelper';
import { CustomDateTimePickerComponent } from '@wfm/shared/custom-dateTime-picker/custom-dateTime-picker.component';

/**
 * local
 */
import { DateTimeAdapterSectionEnum } from '../../date-time';

@Component({
  selector: 'app-formly-mat-date-time-picker',
  templateUrl: './formly-mat-date-time-picker.component.html',
  styleUrls: ['./formly-mat-date-time-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'standard' } },
    { provide: DateAdapter, useClass: LuxonDateAdapter, deps: [MAT_DATE_LOCALE, MAT_LUXON_DATE_ADAPTER_OPTIONS] },
    { provide: MAT_LUXON_DATE_ADAPTER_OPTIONS, useValue: DateTimeFormatHelper.getLuxonAdapterOptions() }
  ]
})
export class FormlyMatDateTimePickerComponent extends FieldType implements OnInit, OnDestroy {
  // config: IMatDatetimePickerConfig;
  @ViewChild('picker') picker: TemplateRef<any>;
  formattedDateTime: string;
  dateTimeFormats: IDateFormat;
  dateTimeStringChanged: Subject<string> = new Subject<string>();
  protected destroyed$ = new Subject<any>();

  constructor(
    private dialog: MatDialog,
    private cd: ChangeDetectorRef,

    @Inject(DateAdapter) readonly luxonAdapter: LuxonDateAdapter
  ) {
    super();
  }

  ngOnInit(): void {
    this.listenForDateTimeStringChange();
    this.dateTimeFormats = DateTimeFormatHelper.getDateTimeFormatConfig();
    const cfgKey = DateTimeAdapterSectionEnum.appFormlyMatDatePickerConfig;
    if (!this.to[cfgKey]) {
      this.to[cfgKey] = {};
    }

    if (this.formControl.value) {
      this.formControl.markAllAsTouched();
      this.setFormattedDate(this.formControl.value);
    }

    this.formControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((newValue) => {
      this.setFormattedDate(newValue);
      this.cd.detectChanges();
    });
  }

  listenForDateTimeStringChange(): void {
    this.dateTimeStringChanged.pipe(debounceTime(1000), distinctUntilChanged(), takeUntil(this.destroyed$)).subscribe((dateString) => {
      this.onManualInput(dateString);
    });
  }

  onDateTimeStringChange(dateTimeString: string): void {
    this.dateTimeStringChanged.next(dateTimeString);
  }

  /**
   * just for UI: showing the formatted date value in user's preferred format
   */
  setFormattedDate(date: Date): void {
    if (!date) {
      this.formattedDateTime = '';
    } else {
      this.formattedDateTime = DateTimeFormatHelper.formatDateTime(date);
    }
  }

  /**
   * parse manually input date string and set the field value if the parsed date is valid
   */
  onManualInput(dateString: string): void {
    const parsedDate = this.luxonAdapter.parse(dateString, this.dateTimeFormats.parse.dateInput);
    if (parsedDate && !parsedDate.invalidReason) {
      // dateString is ok
      this.formControl.setValue(parsedDate.set({ second: 0, millisecond: 0 }).toJSDate());
      this.formControl.markAllAsTouched();
    } else if (parsedDate) {
      // dateString is invalid
      this.formControl.setErrors({ dateTime: true });
      this.formControl.markAllAsTouched();
    } else {
      // dateString has been removed
      this.resetValue();
    }
  }

  openDateTimePicker(): void {
    const pickerDialog = this.dialog.open(CustomDateTimePickerComponent, {
      width: '300px',
      maxHeight: '500px',
      panelClass: []
    });

    if (this.formControl.value) {
      pickerDialog.componentInstance.selectedDateTime = DateTimeFormatHelper.parseToLuxon(this.formControl.value);
    }

    pickerDialog.afterClosed().subscribe((selectedDate: DateTime) => {
      if (selectedDate && !selectedDate.invalidReason) {
        this.formControl.setValue(selectedDate.toJSDate());
        this.formControl.markAllAsTouched();
      } else {
        this.resetValue();
      }
    });
  }

  checkForResetEvent(event: KeyboardEvent): void {
    if (event.key === 'Delete') {
      this.resetValue();
    }
  }

  resetValue(): void {
    this.formControl.patchValue(null);
    this.formControl.markAllAsTouched();
  }

  onFocusOut(): void {
    // manually mark the mat-form-field as touched to trigger validations
    this.formControl.markAllAsTouched();
  }

  ngOnDestroy(): void {
    this.destroyed$.next({});
    this.destroyed$.complete();
  }
}
