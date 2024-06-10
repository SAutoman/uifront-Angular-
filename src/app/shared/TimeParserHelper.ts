import { AbstractControl } from '@angular/forms';
import { DateTime } from 'luxon';

export default class TimeParserHelper {
  public static checkForHoursMinutes(time: string, control: AbstractControl): void {
    const hh = time.split(':')[0];
    const min = time.split(':')[1];
    const isColonIncluded = time.includes(':');
    if (hh?.length >= 2 && !isColonIncluded) {
      if (this.isHavingValidHours(hh)) {
        control.setValue(`${hh}:`);
      } else {
        control.setValue(null);
      }
    }
    if (hh?.length && min?.length && isColonIncluded) {
      if (!this.isHavingValidHours(hh)) {
        control.setValue(null);
      }
    }
    if (min?.length >= 2) {
      if (!this.isHavingValidMinutes(min)) {
        control.setValue(`${hh}:`);
      }
    }
    this.validateTime(time, control);
  }

  public static isHavingValidHours(hh: string): boolean {
    if (hh) {
      return !isNaN(+hh) && +hh >= 0 && +hh <= 23;
    }
  }

  public static isHavingValidMinutes(min: string): boolean {
    if (min) {
      return !isNaN(+min) && +min >= 0 && +min <= 59;
    }
  }

  public static validateTime(time: string, control: AbstractControl): void {
    if (DateTime.fromFormat(time, 'HH:mm').invalidReason) {
      control.setErrors({ time: true });
    }
  }
}
