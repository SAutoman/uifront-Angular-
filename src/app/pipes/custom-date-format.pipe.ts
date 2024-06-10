/**
 * global
 */
import { Pipe, PipeTransform } from '@angular/core';
import DateTimeFormatHelper from '@wfm/shared/dateTimeFormatHelper';
import { GridSystemFieldsEnum } from '@wfm/shared/dynamic-entity-grid/dynamic-grid-system-fields';

@Pipe({
  name: 'customDateFormat'
})
export class CustomDateFormatPipe implements PipeTransform {
  transform(value: Date, format: string, fieldName?: string): string {
    if (value) {
      if (format && fieldName && (fieldName === GridSystemFieldsEnum.CREATED_AT || fieldName === GridSystemFieldsEnum.UPDATED_AT)) {
        // for system dateTime fields also show the seconds
        format += ':ss';
      }

      const dateTime = DateTimeFormatHelper.parseToLuxon(value);
      return format ? dateTime?.toFormat(format) : dateTime.toFormat('D');
    }
    return null;
  }
}
