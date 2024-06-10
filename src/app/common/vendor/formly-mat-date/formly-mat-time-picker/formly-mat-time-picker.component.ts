/**
 * global
 */
import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FieldType } from '@ngx-formly/material/form-field';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { DateTime } from 'luxon';

/**
 * project
 */
import { DateTimeAdapterSectionEnum } from '@wfm/common/vendor/date-time';
import TimeParserHelper from '@wfm/shared/TimeParserHelper';
/**
 * local
 */
import { IMatDatePickerConfig } from '../interface';

@Component({
  selector: 'app-formly-mat-time-picker',
  templateUrl: './formly-mat-time-picker.component.html',
  styleUrls: ['./formly-mat-time-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class FormlyMatTimePickerComponent extends FieldType implements OnInit {
  config: IMatDatePickerConfig;
  timeSubsription: Subscription;
  constructor() {
    super();
  }

  ngOnInit(): void {
    const cfgKey = DateTimeAdapterSectionEnum.appFormlyMatDatePickerConfig;
    if (!this.to[cfgKey]) {
      this.to[cfgKey] = {};
    }
    this.config = this.to[cfgKey];
    if (!this.config.enableInput) {
      this.to.disableManualInput = true;
      this.formControl.markAllAsTouched();
    }
    this.timeSubsription = this.formControl.valueChanges.pipe(debounceTime(300)).subscribe((x: string) => {
      if (x) {
        TimeParserHelper.checkForHoursMinutes(x, this.formControl);
      }
    });
  }

  checkCharCode(event: Event): boolean {
    return event['charCode'] >= 48 && event['charCode'] <= 57;
  }

  checkForResetEvent(event: KeyboardEvent): void {
    if (event.key === 'Delete') {
      this.resetValue();
    }
  }

  setTimeToNow() {
    let nowValue = DateTime.now().toFormat('HH:mm');
    this.formControl.patchValue(nowValue);
  }

  resetValue() {
    this.formControl.patchValue(null);
  }

  onTimeChangeFromPicker(time: string) {
    this.formControl.patchValue(time);
  }

  ngOnDestroy(): void {
    this.timeSubsription?.unsubscribe();
  }
}
