/**
 * global
 */
import { Injectable } from '@angular/core';
import { CellValue, CellValueDetailedType, HyperFormula, SerializedNamedExpression } from 'hyperformula';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DateTime, SystemZone, Settings as LuxonSettings } from 'luxon';
import { TranslateService } from '@ngx-translate/core';

/**
 * project
 */
import { FieldTypeIds } from '@wfm/service-layer';
import DateTimeFormatHelper from '@wfm/shared/dateTimeFormatHelper';

/**
 * local
 */

import { FormulaConfig, stopFormulaCalculationKey } from '../models/formula';

@Injectable({
  providedIn: 'root'
})
export class FormulaEngineService {
  private options;
  private systemZone: string = SystemZone.instance.name;

  constructor(private snackBar: MatSnackBar, private ts: TranslateService) {
    this.options = {
      licenseKey: 'gpl-v3'
    };
  }

  /**
   *
   * @param formulaConfig
   * @param fieldValues : {A1:value1, B1:value2, etc}
   * @param fieldType
   * @returns
   */
  evaluateFormula(formulaConfig: FormulaConfig, fieldValues: any, fieldType?: FieldTypeIds): CellValue {
    try {
      const namedExpressions: SerializedNamedExpression[] = [];
      const cellValues = [];
      formulaConfig.fields.forEach((fieldData) => {
        const value = this.getFieldValue(fieldValues, fieldData.key, fieldData.fieldType);
        cellValues.push(value);
      });
      formulaConfig.namedExpressions.forEach((namedExpression) => {
        if (namedExpression.formula && namedExpression.key) {
          let processedFormula = this.replaceRelativeRefWithAbsolute(namedExpression.formula);
          const ne = {
            name: namedExpression.key,
            expression: processedFormula
          };
          namedExpressions.push(ne);
        }
      });
      cellValues.push(`${formulaConfig.expression}`);
      // build an instance with defined options and data
      const hfInstance = HyperFormula.buildFromArray([cellValues], this.options, namedExpressions);
      const value: CellValue = hfInstance.getCellValue({ col: cellValues.length - 1, row: 0, sheet: 0 });
      const valueType: CellValueDetailedType = hfInstance.getCellValueDetailedType({ col: cellValues.length - 1, row: 0, sheet: 0 });

      let finalResult = this.processHyperformulaValue(valueType, value, fieldType);

      return finalResult;
    } catch (error) {
      this.snackBar.open(`${this.ts.instant('Formula parsing failed')}: ${error.toString()}`, 'CLOSE', {
        duration: 5000,
        verticalPosition: 'top',
        panelClass: 'text-warning'
      });
    }
  }

  /**
   * convert hyperformula value types to wfm field value types
   */
  private processHyperformulaValue(valueType: CellValueDetailedType, value: CellValue, fieldType?: FieldTypeIds): any {
    if (!this.checkFormulaValueCompatibilityWithFieldType(valueType, fieldType)) {
      return stopFormulaCalculationKey;
    }
    let finalValue;
    switch (valueType) {
      case CellValueDetailedType.NUMBER_DATE:
      case CellValueDetailedType.NUMBER_DATETIME:
        finalValue = this.parseToLuxonDate(<number>value);
        break;
      case CellValueDetailedType.NUMBER_TIME:
        if (fieldType === FieldTypeIds.TimeField) {
          // fraction of day (number) is being replaced with HH:mm string for TIme field type
          // NUMBER_TIME is a number between 0-1 as a fraction of day
          const dayInSecs = 24 * 60 * 60;
          const valueInSeconds = <number>value * dayInSecs;
          finalValue = DateTime.now().set({ hour: 0, minute: 0, second: 0 }).plus({ seconds: valueInSeconds }).toFormat('HH:mm');
          break;
        }
      default:
        finalValue = value;
        break;
    }
    if (fieldType === FieldTypeIds.StringField || fieldType === FieldTypeIds.TextareaField) {
      // stringify different valueTypes (boolean, number, date) before storing in text felds
      finalValue = finalValue.toString();
    }
    return finalValue;
  }

  private getFieldValue(fieldValues, fieldPath, fieldType: FieldTypeIds): any {
    const rawValue = fieldValues[fieldPath];
    let formattedValue;
    switch (fieldType) {
      case FieldTypeIds.DateField:
      case FieldTypeIds.DateTimeField:
        if (rawValue || rawValue === 0) {
          const localDateWithSameTime = DateTimeFormatHelper.parseToLuxon(rawValue).setZone(this.systemZone, { keepLocalTime: true });
          formattedValue = localDateWithSameTime.toJSDate();
        }
        break;
      case FieldTypeIds.TimeField:
        if (rawValue || rawValue === 0) {
          // convert "HH:mm" time field value into hyperformula NUMBER_TIME value
          formattedValue = `=TIMEVALUE("${rawValue}")`;
        }
        break;
      default:
        formattedValue = rawValue;
        break;
    }
    return formattedValue;
  }

  /**
   *   namedExpressions do not support relative cell references
   */
  replaceRelativeRefWithAbsolute(formula: string): string {
    const relativeCellRefToAbsoluteRef = function (match) {
      return `Sheet1!$${match[0]}$${match[1]}`;
    };
    const relativeRefRegex = /[a-zA-Z]{1}[0-9]{1}/g;
    const processedText = formula.replace(relativeRefRegex, relativeCellRefToAbsoluteRef);

    return processedText;
  }

  parseToLuxonDate(serial: number): DateTime {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    const fractional_day = serial - Math.floor(serial) + 0.0000001;
    let total_seconds = Math.floor(86400 * fractional_day);
    const seconds = total_seconds % 60;
    total_seconds -= seconds;
    const hours = Math.floor(total_seconds / (60 * 60));
    const minutes = Math.floor(total_seconds / 60) % 60;

    const luxonDate = DateTime.fromObject({
      year: date_info.getFullYear(),
      month: date_info.getMonth() + 1,
      day: date_info.getDate(),
      hour: hours,
      minute: minutes,
      second: seconds
    });
    // convert the result date into tenant timezone, keeping hours and minutes the same
    const dateInTenantZone = luxonDate.setZone(LuxonSettings.defaultZone, { keepLocalTime: true });

    return dateInTenantZone;
  }

  //  guard against formulaValue type and fieldType mismatch
  checkFormulaValueCompatibilityWithFieldType(valueType: CellValueDetailedType, fieldType?: FieldTypeIds): boolean {
    switch (valueType) {
      case CellValueDetailedType.NUMBER_DATE:
      case CellValueDetailedType.NUMBER_DATETIME:
        if (
          fieldType === FieldTypeIds.DateField ||
          fieldType === FieldTypeIds.DateTimeField ||
          fieldType === FieldTypeIds.StringField ||
          fieldType === FieldTypeIds.TextareaField
        ) {
          return true;
        }
        return false;
      case CellValueDetailedType.NUMBER_TIME:
        if (
          fieldType === FieldTypeIds.TimeField ||
          fieldType === FieldTypeIds.StringField ||
          fieldType === FieldTypeIds.TextareaField ||
          fieldType === FieldTypeIds.DecimalField
        ) {
          return true;
        }
        return false;
      case CellValueDetailedType.BOOLEAN:
        if (fieldType === FieldTypeIds.BoolField || fieldType === FieldTypeIds.StringField || fieldType === FieldTypeIds.TextareaField) {
          return true;
        }
        return false;
      case CellValueDetailedType.NUMBER:
      case CellValueDetailedType.NUMBER_RAW:
      case CellValueDetailedType.NUMBER_CURRENCY:
      case CellValueDetailedType.NUMBER_PERCENT:
        if (
          fieldType === FieldTypeIds.DecimalField ||
          fieldType === FieldTypeIds.IntField ||
          fieldType === FieldTypeIds.StringField ||
          fieldType === FieldTypeIds.TextareaField
        ) {
          return true;
        }
        return false;
      case CellValueDetailedType.STRING:
        if (fieldType === FieldTypeIds.StringField || fieldType === FieldTypeIds.TextareaField) {
          return true;
        }
        return false;
      case CellValueDetailedType.ERROR:
        return true;
      default:
        return false;
    }
  }
}
