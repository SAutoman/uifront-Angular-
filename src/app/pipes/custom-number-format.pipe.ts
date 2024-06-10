/**
 * global
 */
import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { formatNumber } from '@angular/common';
import { FieldTypeIds, SchemaDto } from '@wfm/service-layer';
@Pipe({
  name: 'customNumberFormat'
})
export class CustomNumberFormatPipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) public locale: string) {}

  transform(value: number, fieldName: string, schema: SchemaDto): string {
    if (value || value === 0) {
      let formattedNumber;
      const field = schema?.fields?.find((schemaField) => schemaField.fieldName === fieldName);
      const decimalFormatSettings = field?.configuration?.numberFormatting || null;
      if (decimalFormatSettings) {
        let digitsInfo = `${decimalFormatSettings.minIntegerDigits || 1}.${decimalFormatSettings.minFractionDigits || 0}-${
          decimalFormatSettings.maxFractionDigits || 0
        }`;
        formattedNumber = formatNumber(value, this.locale, digitsInfo);
      } else {
        if (field?.type === FieldTypeIds.DecimalField) formattedNumber = formatNumber(value, this.locale);
        else formattedNumber = value;
      }
      return formattedNumber;
    }

    return null;
  }
}
