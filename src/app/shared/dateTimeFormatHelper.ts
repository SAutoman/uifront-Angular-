import { appDateFormatKey, DateFormat, Settings, SettingsUI } from '@wfm/service-layer';
import { DateTime } from 'luxon';

export enum StartOfWeekEnum {
  Sunday = 0,
  Monday = 1
}

export interface ILuxonAdapterOptions {
  firstDayOfWeek: StartOfWeekEnum;
}

export interface IDateFormat {
  parse: {
    dateInput: string | string[];
  };
  display: {
    dateInput: string;
    monthYearLabel: string;
    dateA11yLabel: string;
    monthYearA11yLabel: string;
  };
}

export const DATE_FORMAT: IDateFormat = {
  parse: {
    dateInput: 'D'
  },
  display: {
    dateInput: 'D',
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: 'DDD',
    monthYearA11yLabel: 'MMM yyyy'
  }
};

const DATE_TIME_FORMAT: IDateFormat = {
  parse: {
    dateInput: ['D HH:mm', 'D']
  },
  display: {
    dateInput: 'D HH:mm',
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: 'DDD',
    monthYearA11yLabel: 'MMMM yyyy'
  }
};

const I_LUXON_DATE_ADAPTER_OPTIONS: ILuxonAdapterOptions = {
  firstDayOfWeek: StartOfWeekEnum.Monday
};

export type DateTypeGeneric = DateTime | Date | string | number;

export default class DateTimeFormatHelper {
  public static getDateFormatConfig(): IDateFormat {
    return DATE_FORMAT;
  }
  public static getDateTimeFormatConfig(): IDateFormat {
    return DATE_TIME_FORMAT;
  }

  public static setDateFormat(format: Settings): void {
    DATE_FORMAT.display.dateInput = DateTimeFormatHelper.getDateFormat(format);
    DATE_TIME_FORMAT.display.dateInput = DateTimeFormatHelper.getDateFormat(format) + ' HH:mm';

    DATE_FORMAT.parse.dateInput = DateTimeFormatHelper.getDateFormat(format);
    DATE_TIME_FORMAT.parse.dateInput = [DateTimeFormatHelper.getDateFormat(format), DateTimeFormatHelper.getDateFormat(format) + ' HH:mm'];
  }
  public static parseToLuxon(date: DateTypeGeneric): DateTime {
    let luxonDate: DateTime;
    if (date instanceof DateTime) {
      luxonDate = date;
    } else if (date instanceof Date) {
      luxonDate = DateTime.fromJSDate(date);
    } else if (typeof date === 'string') {
      luxonDate = DateTime.fromISO(date);
    } else if (typeof date === 'number') {
      luxonDate = DateTime.fromMillis(date);
    }
    if (luxonDate && !luxonDate.invalidReason) {
      return luxonDate;
    }
    return null;
  }

  public static getUTCJsDate(date: DateTypeGeneric): Date {
    let luxonDate = DateTimeFormatHelper.parseToLuxon(date);

    let utc = luxonDate?.toUTC().toJSDate();
    return utc;
  }

  public static getUtcDateTimeWithNormalizedSeconds(date: DateTypeGeneric): Date {
    let luxonDate = DateTimeFormatHelper.parseToLuxon(date);
    let normalizedDateTime = luxonDate?.toUTC().set({ second: 0, millisecond: 0 }).toJSDate();
    return normalizedDateTime;
  }

  public static getUtcDateTimeWithMaxSeconds(date: DateTypeGeneric): Date {
    let luxonDate = DateTimeFormatHelper.parseToLuxon(date);
    let normalizedDateTime = luxonDate?.toUTC().set({ second: 59, millisecond: 999 }).toJSDate();
    return normalizedDateTime;
  }

  public static getDateFormat(dateFormatDb?: Settings): string {
    let format = DateTimeFormatHelper.getLocalFormat();

    if (dateFormatDb?.value || dateFormatDb.value === 0) {
      format = dateFormatDb.value;
    }

    switch (dateFormatDb?.value) {
      case DateFormat.BrowseCultureDate:
        return 'D';
      case DateFormat.ShortDate:
        return 'MM/dd/yyyy';
      case DateFormat.LongDate:
        return 'MMM dd yyyy';
      case DateFormat.IsoDate:
        return 'yyyy-MM-dd';
      case DateFormat.Other:
        return 'dd.MM.yyyy';
      default:
        return 'D';
    }
  }

  public static getLocalFormat(): DateFormat {
    const current = DateTime.now().toFormat('D');

    if (current.indexOf('/') > 0) {
      return DateFormat.ShortDate;
    } else if (current.indexOf('-') > 0) {
      return DateFormat.IsoDate;
    } else if (current.indexOf('.') > 0) {
      return DateFormat.Other;
    } else if (current.indexOf(' ') > 0) {
      return DateFormat.LongDate;
    } else {
      return DateFormat.ShortDate;
    }
  }

  public static formatDateBasedOnSetting(x: string | Date, dateFormatDb: SettingsUI): string {
    const date = x ? DateTimeFormatHelper.parseToLuxon(x) : DateTime.now();
    if (date) {
      const format = dateFormatDb?.value || dateFormatDb?.value?.[appDateFormatKey] || DateFormat.BrowseCultureDate;
      switch (format) {
        case DateFormat.BrowseCultureDate:
          return date.toFormat('D');
        case DateFormat.ShortDate:
          return date.toFormat('MM/dd/yyyy');
        case DateFormat.LongDate:
          return date.toFormat('MMM dd yyyy');
        case DateFormat.IsoDate:
          return date.toFormat('yyyy-MM-dd');
        case DateFormat.Other:
          return date.toFormat('dd.MM.yyyy');
        default:
          return date.toFormat('D');
      }
    }
  }

  public static formatTime(x: string | Date, is24HourFormat?: boolean): string {
    const date = x ? DateTimeFormatHelper.parseToLuxon(x) : DateTime.now();
    if (date) {
      return is24HourFormat ? date.toLocaleString(DateTime.TIME_24_SIMPLE) : date.toLocaleString(DateTime.TIME_SIMPLE);
    }
  }

  public static formatDateTime(x: Date | string): string {
    const dateTime = DateTimeFormatHelper.parseToLuxon(x);
    const dateTimeFormat = DateTimeFormatHelper.getDateTimeFormatConfig()?.display?.dateInput;
    if (dateTimeFormat) {
      return dateTime?.toFormat(dateTimeFormat);
    }
    return dateTime?.toLocaleString(DateTime.DATETIME_SHORT);
  }

  public static setFirstDayOfWeek(day: number): void {
    I_LUXON_DATE_ADAPTER_OPTIONS.firstDayOfWeek = day;
  }

  public static getLuxonAdapterOptions(): ILuxonAdapterOptions {
    return I_LUXON_DATE_ADAPTER_OPTIONS;
  }

  public static getDateFormatString(): string {
    const lang = window.navigator.language;
    const d = new Date();
    const format = new Intl.DateTimeFormat(lang, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    }).formatToParts(d);
    let formatString = '';
    const separator = format.find((x) => x.type === 'literal')?.value?.trim();
    format.forEach((f) => {
      if (f.type !== 'literal') {
        if (formatString.length) formatString += separator;
        formatString += `${this.getDatePartFormat(f.type, f.value)}`;
      }
    });
    return formatString;
  }

  static getDatePartFormat(part: string, value: string): string {
    switch (part) {
      case 'year':
        if (value.length === 4) return 'yyyy';
        else if (value.length === 2) return 'yy';
        break;
      case 'month':
        if (value.length === 2) return 'MM';
        else if (value.length === 1) return 'M';
        break;
      case 'day':
        if (value.length === 2) return 'dd';
        else if (value.length === 1) return 'd';
        break;
      default:
        break;
    }
  }
}
