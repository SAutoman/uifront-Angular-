import { Injectable } from '@angular/core';
import { DateTimeRangeFilter, DynamicDateTimeRangeTypeEnum } from '@wfm/service-layer/models/dynamic-entity-models';

@Injectable({
  providedIn: 'root'
})
export class SearchFiltersHelperService {
  constructor() {}

  /**
   *
   * @param value
   * @returns Time span value
   */
  getDynamicDateValue(value: number): string {
    return value ? `${value}.00:00:00` : '00.00:00:00';
  }

  /**
   *
   * @param value
   * @returns Time span value with Hours & minutes
   */
  getDynamicTimeValue(value: number): string {
    const convertedValue = this.toHoursAndMinutes(value);
    return value ? `0.${convertedValue.h}:${convertedValue.m}:00` : '00.00:00:00';
  }

  /**
   *
   * @param totalMinutes
   * @returns converted value in Hours & minutes
   */
  toHoursAndMinutes(totalMinutes: number): { h: number; m: number } {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { h: hours, m: minutes };
  }

  /**
   *
   * @returns Minutes passed/left in a day from 00:00 AM - 23:59 PM
   */
  // getMinutesLimit(): { minPassed: number; minLeft: number } {
  //   const totalMinutes = 60 * 24;
  //   const date = new Date();
  //   const hrs = date.getHours();
  //   const minutesPassed = 60 * hrs + date.getMinutes();
  //   const minutesLeft = totalMinutes - minutesPassed;
  //   return {
  //     minPassed: minutesPassed,
  //     minLeft: minutesLeft
  //   };
  // }

  /**
   *
   * @param model resets from & to values
   */
  resetFromToValues<T>(model: DateTimeRangeFilter<T>): void {
    model.from = null;
    model.to = null;
  }

  /**
   *
   * @param model resets model's before and after values
   */
  resetBeforeAfterValues<T>(model: DateTimeRangeFilter<T>): void {
    model.before = null;
    model.beforeValue = null;
    model.after = null;
    model.afterValue = null;
  }

  validateRelativeRanges<T>(rangeType: DynamicDateTimeRangeTypeEnum, model: DateTimeRangeFilter<T>, before, after): void {
    this.resetBeforeAfterValues(model);
    switch (rangeType) {
      case DynamicDateTimeRangeTypeEnum.MINUTES:
        // const timeConfig = this.searchFilterHelper.getMinutesLimit();
        // const minutesPassed = timeConfig.minPassed;
        // const minutesLeft = timeConfig.minLeft;
        if (before || after) {
          if (before) {
            // if (before >= 0 && before < minutesPassed) {
            if (before >= 0) {
              model.beforeValue = this.getDynamicTimeValue(before);
              model.before = before;
              if (!after) model.afterValue = this.getDynamicTimeValue(after);
            } else {
              model.isValid = false;
            }
          }
          if (after) {
            // if (after >= 0 && after < minutesLeft) {
            if (after >= 0) {
              model.afterValue = this.getDynamicTimeValue(after);
              model.after = after;
              if (!before) model.beforeValue = this.getDynamicTimeValue(before);
            } else model.isValid = false;
          }
        } else model.isValid = false;
        break;
      case DynamicDateTimeRangeTypeEnum.DAYS:
        if (before || after) {
          if (before) {
            if (before >= 0) {
              model.beforeValue = this.getDynamicDateValue(before);
              model.before = before;
              model.isValid = true;
              if (!after) model.afterValue = this.getDynamicDateValue(after);
            } else {
              model.isValid = false;
            }
          }
          if (after) {
            if (after >= 0) {
              model.afterValue = this.getDynamicDateValue(after);
              model.after = after;
              model.isValid = true;
              if (!before) model.beforeValue = this.getDynamicDateValue(before);
            } else {
              model.isValid = false;
            }
          }
          if (before && after && (before < 0 || after < 0)) model.isValid = false;
        } else {
          model.isValid = false;
        }
        break;
      default:
        break;
    }
  }
}
