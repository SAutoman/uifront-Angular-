/**
 * global
 */
import { AbstractControl } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { DateTime } from 'luxon';

/**
 * project
 */
import { ErrorMessageGenerator, ErrorMessageTypeEnum } from '@wfm/common/error-message-generator';
import { DefaultValueTypeEnum, DynamicValueTypeEnum } from '@wfm/common/field/field-default-value/FieldDefaultValues';
import DateTimeFormatHelper from '@wfm/shared/dateTimeFormatHelper';

/**
 * local
 */
import { FormVariableDto } from '../form-variable.dto';
import { FormlyFieldAdapterTypeEnum } from '../formly-field-adapter-type.enum';
import { FormlyFieldAdapter } from '../formly-field.adapter';
import { UserProfileService } from '@wfm/service-layer';
import { AppStatic } from '@wfm/app.static';

export class InputFieldAdapter extends FormlyFieldAdapter<string> {
  private userDateFormat: string;
  private userDateTimeFormat: string;
  private userProfileService: UserProfileService;

  constructor(formVariable: FormVariableDto) {
    super(formVariable, FormlyFieldAdapterTypeEnum.input);
    this.userProfileService = AppStatic.injector.get(UserProfileService);
  }

  getConfig(): FormlyFieldConfig {
    const formVariable = this.formVariable;
    this.userDateFormat = DateTimeFormatHelper.getDateFormatConfig()?.display?.dateInput;
    this.userDateTimeFormat = DateTimeFormatHelper.getDateTimeFormatConfig()?.display?.dateInput;

    const validators = {
      whiteSpace: (control: AbstractControl) => (control?.value && control?.value?.toString()?.trim()?.length === 0 ? false : true)
    };
    const templateOptions = {
      label: formVariable.label,
      type: 'input',
      required: formVariable.required,
      readonly: formVariable.readonly,
      disabled: formVariable.disabled || formVariable.readonly,
      isHighlighted: formVariable.isHighlighted,
      highlightColor: formVariable.highlightColor,
      readonlySetExplicitly: formVariable.readonly
    };

    if (formVariable.regEx) {
      templateOptions['pattern'] = formVariable.regEx;
    }

    if (formVariable.email) {
      const emailRegex = new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      validators['email'] = (control: AbstractControl) => {
        return !control.value || emailRegex.test(control.value);
      };
    }

    const minValue = this.safeNumber(formVariable.min);
    if (minValue !== null) {
      validators['min'] = (control: AbstractControl) => {
        if (control.value) {
          return minValue <= control.value?.length;
        }
        return true;
      };
      // templateOptions['minLength'] = minValue;
    }

    const maxValue = this.safeNumber(formVariable.max);
    if (maxValue !== null) {
      validators['max'] = (control: AbstractControl) => {
        if (control.value) {
          return control.value?.length <= maxValue;
        }
        return true;
      };
      // templateOptions['maxLength'] = maxValue;
    }

    let value = formVariable.value;
    if (formVariable.valueInfo?.defaultValueType && formVariable.valueInfo?.defaultValueType === DefaultValueTypeEnum.dynamic) {
      const date = DateTime.now();
      switch (formVariable.valueInfo.dynamicValue) {
        case DynamicValueTypeEnum.currentDate:
          value = this.userDateFormat ? date.toFormat(this.userDateFormat) : date.toFormat('D');
          break;
        case DynamicValueTypeEnum.currentDateTime:
          value = this.userDateTimeFormat ? date.toFormat(this.userDateTimeFormat) : date.toLocaleString(DateTime.DATETIME_SHORT);
          break;
        case DynamicValueTypeEnum.currentTime:
          value = date.toFormat('HH:mm');
          break;
        case DynamicValueTypeEnum.currentUser:
          if (this.userProfileService.userProfile?.profile) {
            value = `${this.userProfileService.userProfile.profile?.name} ${this.userProfileService.userProfile.profile.lastName}`;
          }
          break;
        default:
          break;
      }
    }

    return {
      key: formVariable.name,
      type: 'input',
      validators: validators,
      validation: {
        messages: {
          required: ErrorMessageGenerator.get(ErrorMessageTypeEnum.required),
          min: ErrorMessageGenerator.get(ErrorMessageTypeEnum.minLength, formVariable.min),
          max: ErrorMessageGenerator.get(ErrorMessageTypeEnum.maxLength, formVariable.max),
          pattern: ErrorMessageGenerator.get(ErrorMessageTypeEnum.pattern, formVariable.regEx),
          email: ErrorMessageGenerator.get(ErrorMessageTypeEnum.email),
          whiteSpace: ErrorMessageGenerator.get(ErrorMessageTypeEnum.whiteSpace)
        }
      },
      templateOptions: templateOptions,
      // hide: formVariable.valueInfo?.isSystemDefault,
      defaultValue: value
    };
  }

  private safeNumber(value: number): number | null {
    if (typeof value === 'number') {
      return value;
    }

    const out = Number.parseFloat(value);
    return Number.isNaN(out) ? null : out;
  }
}
