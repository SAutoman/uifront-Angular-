import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { DateTime } from 'luxon';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import TimeParserHelper from '../TimeParserHelper';

/**
 * input - luxon DateTime,  output luxon DateTime build based on selection
 */
@Component({
  selector: 'app-custom-dateTime-picker',
  templateUrl: './custom-dateTime-picker.component.html',
  styleUrls: ['./custom-dateTime-picker.component.scss']
})
export class CustomDateTimePickerComponent implements OnInit {
  @Input() selectedDateTime: DateTime;
  dateTimeForm: FormGroup;
  protected destroyed$ = new Subject<any>();

  get dateControlValue(): DateTime {
    return this.dateTimeForm?.get('dateControl').value;
  }

  get dateControl(): AbstractControl {
    return this.dateTimeForm?.get('dateControl');
  }

  get timeControl(): AbstractControl {
    return this.dateTimeForm?.get('timeControl');
  }

  constructor(private fb: FormBuilder, private dialogRef: MatDialogRef<CustomDateTimePickerComponent>) {}

  ngOnInit() {
    this.initForm();
    if (this.selectedDateTime) {
      this.dateControl.setValue(this.selectedDateTime.set({ hour: 0, minute: 0, second: 0, millisecond: 0 }));
      this.timeControl.setValue(`${this.selectedDateTime.toFormat('HH:mm')}`);
    }
  }

  initForm(): void {
    this.dateTimeForm = this.fb.group({
      dateControl: [DateTime.now().set({ hour: 0, minute: 0, second: 0, millisecond: 0 })],
      timeControl: [DateTime.now().toFormat('HH:mm')]
    });

    this.dateTimeForm
      .get('timeControl')
      .valueChanges.pipe(debounceTime(300), takeUntil(this.destroyed$))
      .subscribe((x: string) => {
        if (x) {
          TimeParserHelper.checkForHoursMinutes(x, this.timeControl);
        }
      });
  }

  updateSelectedDate(date: DateTime): void {
    this.dateTimeForm.get('dateControl').setValue(date);
  }

  /**
   * combine selected date and time and pass to calling component
   */
  processPickerDateTime(): void {
    const dateSelected: DateTime = this.dateControlValue;
    const timeSelected = this.timeControl.value;
    const hour = +timeSelected.split(':')[0];
    const min = +timeSelected.split(':')[1];

    const dateCombined = dateSelected.set({
      hour: hour,
      minute: min,
      second: 0,
      millisecond: 0
    });
    this.dialogRef.close(dateCombined);
  }

  ngOnDestroy(): void {
    this.destroyed$.next({});
    this.destroyed$.complete();
  }
}
