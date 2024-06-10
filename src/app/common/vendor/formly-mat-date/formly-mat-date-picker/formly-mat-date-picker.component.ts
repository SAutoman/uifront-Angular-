/**
 * global
 */
import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FieldType } from '@ngx-formly/material/form-field';
/**
 * project
 */
import DateTimeFormatHelper from '@wfm/shared/dateTimeFormatHelper';
/**
 * local
 */
import { DateTimeAdapterSectionEnum } from '../../date-time';
import { IMatDatePickerConfig } from '../interface';

@Component({
  selector: 'app-formly-mat-date-picker',
  templateUrl: './formly-mat-date-picker.component.html',
  styleUrls: ['./formly-mat-date-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class FormlyMatDatePickerComponent extends FieldType implements OnInit {
  config: IMatDatePickerConfig;
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
  }

  // normalize the selected date to UTC noon
  onChange(event) {
    const dateUtc = DateTimeFormatHelper.getUTCJsDate(event.value);
    this.formControl.setValue(dateUtc, { emitEvent: true });
  }

  checkForResetEvent(event: KeyboardEvent): void {
    if (event.key === 'Delete') {
      this.resetValue();
    }
  }

  resetValue() {
    this.formControl.patchValue(null);
  }
}
