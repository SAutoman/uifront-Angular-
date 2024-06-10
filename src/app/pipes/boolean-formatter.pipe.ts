/**
 * global
 */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'booleanFormatter'
})
export class BooleanFormatterPipe implements PipeTransform {
  transform(value: boolean): string {
    const formattedValue = value === true ? 'Yes' : value === false ? 'No' : '';
    return formattedValue;
  }
}
