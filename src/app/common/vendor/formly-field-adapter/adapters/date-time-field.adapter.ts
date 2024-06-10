/**
 * global
 */
import { FormlyFieldConfig } from '@ngx-formly/core';
import { DateTime } from 'luxon';
import { AbstractControl } from '@angular/forms';
/**
 * project
 */
import { ErrorMessageGenerator, ErrorMessageTypeEnum } from '@wfm/common/error-message-generator';
import { DateTimeAdapterSectionEnum, DateTimeAdapterEnum } from '@wfm/common/vendor/date-time';
import { FieldTypeIds } from '@wfm/service-layer';
import DateTimeFormatHelper from '@wfm/shared/dateTimeFormatHelper';
import { DefaultValueTypeEnum, DynamicValueTypeEnum } from '@wfm/common/field/field-default-value/FieldDefaultValues';

/**
 * local
 */
import { FormVariableDto } from '../form-variable.dto';
import { FormlyFieldAdapterTypeEnum } from '../formly-field-adapter-type.enum';
import { FormlyFieldAdapter } from '../formly-field.adapter';

export class DateTimeFieldAdapter extends FormlyFieldAdapter<string> {
  private fields = {
    [FieldTypeIds.DateField]: DateTimeAdapterEnum.appFormlyMatDatePicker,
    [FieldTypeIds.TimeField]: DateTimeAdapterEnum.appFormlyMatTimePicker,
    [FieldTypeIds.DateTimeField]: DateTimeAdapterEnum.appFormlyMatDateTimePicker
  };
  private userDateFormat: string;
  private userDateTimeFormat: string;

  constructor(formVariable: FormVariableDto) {
    super(formVariable, FormlyFieldAdapterTypeEnum.dateTime);
  }

  getConfig(): FormlyFieldConfig {
    this.userDateFormat = DateTimeFormatHelper.getDateFormatConfig()?.display?.dateInput;
    this.userDateTimeFormat = DateTimeFormatHelper.getDateTimeFormatConfig()?.display?.dateInput;
    const formVariable = this.formVariable;
    const info = formVariable.valueInfo || {};
    const pickerType = info.dateTimeAdapterType || this.fields[this.formVariable.type];
    // common opts
    const templateOptions = {
      label: formVariable.label,
      required: formVariable.required,
      readonly: formVariable.readonly,
      disabled: formVariable.disabled || formVariable.readonly,
      disableButtons: formVariable.disableButtons,
      isHighlighted: formVariable.isHighlighted,
      highlightColor: formVariable.highlightColor,
      [DateTimeAdapterEnum.appFormlyMatDatePicker]: { enableInput: true },
      [DateTimeAdapterEnum.appFormlyMatTimePicker]: { enableInput: true },
      [DateTimeAdapterSectionEnum.appFormlyMatDatePickerConfig]: { enableInput: true },
      readonlySetExplicitly: formVariable.readonly
    };
    const validators = {};
    // min
    let fromDate = formVariable.min
      ? pickerType === DateTimeAdapterEnum.appFormlyMatTimePicker
        ? DateTime.fromFormat(formVariable.min, 'HH:mm').set({ second: 0, millisecond: 0 })
        : DateTimeFormatHelper.parseToLuxon(formVariable.min)?.set({ second: 0, millisecond: 0 })
      : null;
    if (fromDate !== null) {
      validators['min'] = (control: AbstractControl) => {
        let controlValue;
        if (pickerType === DateTimeAdapterEnum.appFormlyMatTimePicker) {
          controlValue = control.value && DateTime.fromFormat(control.value, 'HH:mm').set({ second: 0, millisecond: 0 });
        } else {
          controlValue = control.value && DateTimeFormatHelper.parseToLuxon(control.value)?.set({ second: 0, millisecond: 0 });
        }

        return !control.value || controlValue >= fromDate;
      };
    }
    // max
    let toDate = formVariable.max
      ? pickerType === DateTimeAdapterEnum.appFormlyMatTimePicker
        ? DateTime.fromFormat(formVariable.max, 'HH:mm').set({ second: 0, millisecond: 0 })
        : DateTimeFormatHelper.parseToLuxon(formVariable.max)?.set({ second: 0, millisecond: 0 })
      : null;
    if (toDate !== null) {
      validators['max'] = (control: AbstractControl) => {
        let controlValue;
        if (pickerType === DateTimeAdapterEnum.appFormlyMatTimePicker) {
          controlValue = control.value && DateTime.fromFormat(control.value, 'HH:mm').set({ second: 0, millisecond: 0 });
        } else {
          controlValue = control.value && DateTimeFormatHelper.parseToLuxon(control.value)?.set({ second: 0, millisecond: 0 });
        }

        return !control.value || controlValue <= toDate;
      };
    }

    let sectionName: string;
    switch (pickerType) {
      case DateTimeAdapterEnum.appFormlyMatDatePicker:
      case DateTimeAdapterEnum.appFormlyMatDateTimePicker:
      case DateTimeAdapterEnum.appFormlyMatTimePicker:
        sectionName = DateTimeAdapterSectionEnum.appFormlyMatDatePickerConfig;
        break;
      case DateTimeAdapterEnum.datepicker:
        sectionName = DateTimeAdapterSectionEnum.datepickerConfig;
        break;
    }
    if (sectionName && !info[sectionName]) {
      // need to set at minimum empty object
      info[sectionName] = {};
    }
    // setting up the default value based on the picker type
    let defaultValue;
    if (formVariable.value) {
      switch (pickerType) {
        case DateTimeAdapterEnum.appFormlyMatTimePicker:
          let dateTime = DateTime.isDateTime(formVariable.value) ? formVariable.value : DateTime.fromFormat(formVariable.value, 'HH:mm');
          if (info[sectionName].useZeroOffset) {
            dateTime = dateTime.toUTC(0);
          }
          defaultValue = dateTime.toFormat(info[sectionName].format || 'HH:mm');
          break;
        case DateTimeAdapterEnum.appFormlyMatDatePicker:
          defaultValue = DateTimeFormatHelper.parseToLuxon(formVariable.value);
          break;
        case DateTimeAdapterEnum.appFormlyMatDateTimePicker:
          defaultValue = DateTimeFormatHelper.parseToLuxon(formVariable.value);
          break;
        default:
          defaultValue = DateTimeFormatHelper.parseToLuxon(formVariable.value);
          break;
      }
    } else if (formVariable.valueInfo?.defaultValueType && formVariable.valueInfo?.defaultValueType === DefaultValueTypeEnum.dynamic) {
      // dynamic default values
      switch (formVariable.valueInfo.dynamicValue) {
        case DynamicValueTypeEnum.currentDate:
        case DynamicValueTypeEnum.currentDateTime:
          defaultValue = DateTime.now();
          break;
        case DynamicValueTypeEnum.currentTime:
          defaultValue = DateTime.now().toFormat('HH:mm');
          break;
        default:
          break;
      }
    }
    return {
      key: formVariable.name,
      type: pickerType,
      templateOptions,
      validators,
      validation: {
        messages: {
          required: ErrorMessageGenerator.get(ErrorMessageTypeEnum.required),
          min: ErrorMessageGenerator.get(ErrorMessageTypeEnum.minDate, fromDate ? this.getCorrectFormat(fromDate, pickerType) : '', 'date'),
          max: ErrorMessageGenerator.get(ErrorMessageTypeEnum.maxDate, toDate ? this.getCorrectFormat(toDate, pickerType) : '', 'date'),
          dateTime: ErrorMessageGenerator.get(ErrorMessageTypeEnum.dateTime),
          time: ErrorMessageGenerator.get(ErrorMessageTypeEnum.time)
        }
      },
      // hide: formVariable.valueInfo?.isSystemDefault,
      defaultValue
    };
  }

  getCorrectFormat(date: DateTime, pickerType: DateTimeAdapterEnum): string {
    let formatted;
    switch (pickerType) {
      case DateTimeAdapterEnum.appFormlyMatDatePicker:
        formatted = this.userDateFormat ? date.toFormat(this.userDateFormat) : date.toFormat('D');
        break;
      case DateTimeAdapterEnum.appFormlyMatDateTimePicker:
        formatted = this.userDateTimeFormat ? date.toFormat(this.userDateTimeFormat) : date.toLocaleString(DateTime.DATETIME_SHORT);
        break;
      case DateTimeAdapterEnum.appFormlyMatTimePicker:
        formatted = date.toFormat('HH:mm');
        break;
      case DateTimeAdapterEnum.datepicker:
        formatted = this.userDateFormat ? date.toFormat(this.userDateFormat) : date.toFormat('D');
        break;
      default:
        break;
    }
    return formatted;
  }
}
