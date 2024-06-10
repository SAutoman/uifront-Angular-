import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
/**
 * Global
 */
import { IFormlyView } from '@wfm/common/models';
import { FormlyFieldAdapterFactory } from '@wfm/common/vendor';
import { FieldTypeIds } from '@wfm/service-layer';
import {
  DynamicDateTimeSearchValuesEnum,
  DynamicDateTimeRangeKeysEnum,
  PickerViewEnum,
  DateTimeRangeFilter,
  DynamicDateTimeRangeTypeEnum
} from '@wfm/service-layer/models/dynamic-entity-models';
import DateTimeFormatHelper from '@wfm/shared/dateTimeFormatHelper';
import { ErrorMessageGenerator, ErrorMessageTypeEnum } from '@wfm/common/error-message-generator';
/**
 * Project
 */
import { SearchFiltersHelperService } from '../search-filters-helper.service';
/**
 * Local
 */

@Component({
  selector: 'app-date-time-field',
  templateUrl: './date-time-field.component.html',
  styleUrls: ['./date-time-field.component.scss']
})
export class DateTimeFieldComponent implements OnInit {
  @Input() model: DateTimeRangeFilter<Date>;
  @Input() isSystem: boolean;
  @Input() showDynamicViewOption?: boolean;
  @Output() isFieldChanged: EventEmitter<boolean> = new EventEmitter();
  componentId = 'a12e0b4b-ed9c-48ef-b6c2-700040899746';
  view: IFormlyView;
  showWrongDateRangeValidation: boolean = false;

  get dynamicDateTimeRangeTypeEnum() {
    return DynamicDateTimeRangeTypeEnum;
  }

  get pickerViewEnum() {
    return PickerViewEnum;
  }

  constructor(private fb: FormBuilder, private ts: TranslateService, private searchFilterHelper: SearchFiltersHelperService) {}

  ngOnInit(): void {
    this.model.viewOption = this.model?.viewOption ? this.model.viewOption : PickerViewEnum.STATIC;
    this.model.dynamicDateTimeRangeType = this.model?.dynamicDateTimeRangeType
      ? this.model.dynamicDateTimeRangeType
      : DynamicDateTimeRangeTypeEnum.DAYS;
    this.model.dynamicSearchValue = this.model?.dynamicSearchValue
      ? this.model.dynamicSearchValue
      : DynamicDateTimeSearchValuesEnum.DateTime;
    this.initFormly(this.model);
  }

  initFormly(model: DateTimeRangeFilter<Date>): void {
    const from = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('From'),
      name: DynamicDateTimeRangeKeysEnum.FROM,
      type: FieldTypeIds.DateTimeField,
      value: model?.from ? model?.from : null
    });

    const fromField = from.getConfig();

    const to = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('To'),
      name: DynamicDateTimeRangeKeysEnum.To,
      type: FieldTypeIds.DateTimeField,
      value: model?.to ? model?.to : null
    });

    const toField = to.getConfig();

    const validators = {
      min: (control: FormControl) => {
        return control?.value < 0 ? false : true;
      }
    };

    const daysBefore = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('Days Before Current Date'),
      name: DynamicDateTimeRangeKeysEnum.DAYS_BEFORE,
      type: FieldTypeIds.IntField,
      value: model?.before && this.model?.dynamicDateTimeRangeType === DynamicDateTimeRangeTypeEnum.DAYS ? model?.before : 0
    });

    const daysBeforeField = daysBefore.getConfig();
    daysBeforeField.hide = true;
    daysBeforeField.validators = validators;
    daysBeforeField.validation = {
      messages: {
        min: ErrorMessageGenerator.get(ErrorMessageTypeEnum.min, 1)
      }
    };

    const daysAfter = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('Days After Current Date'),
      name: DynamicDateTimeRangeKeysEnum.DAYS_AFTER,
      type: FieldTypeIds.IntField,
      value: model?.after && this.model?.dynamicDateTimeRangeType === DynamicDateTimeRangeTypeEnum.DAYS ? model?.after : 0
    });

    const daysAfterField = daysAfter.getConfig();
    daysAfterField.hide = true;
    daysAfterField.validators = validators;
    daysAfterField.validation = {
      messages: {
        min: ErrorMessageGenerator.get(ErrorMessageTypeEnum.min, 1)
      }
    };

    const timeBefore = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('Minutes Before Current Time'),
      name: DynamicDateTimeRangeKeysEnum.TIME_BEFORE,
      type: FieldTypeIds.IntField,
      value: model?.before && this.model?.dynamicDateTimeRangeType === DynamicDateTimeRangeTypeEnum.MINUTES ? model?.before : 0
    });

    const timeBeforeField = timeBefore.getConfig();
    timeBeforeField.hide = true;
    timeBeforeField.validators = {
      ...validators
      // maxMinutes: (control: FormControl) => {
      //   const value = control?.value;
      //   if (value && value > 0) {
      //     const minutesPassed = this.searchFilterHelper.getMinutesLimit()?.minPassed;
      //     if (value > minutesPassed) return false;
      //     else return true;
      //   }
      //   return true;
      // }
    };
    timeBeforeField.validation = {
      messages: {
        min: ErrorMessageGenerator.get(ErrorMessageTypeEnum.min, 1)
        // maxMinutes: ErrorMessageGenerator.get(ErrorMessageTypeEnum.max, this.searchFilterHelper.getMinutesLimit()?.minPassed)
      }
    };

    const timeAfter = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('Minutes After Current Time'),
      name: DynamicDateTimeRangeKeysEnum.TIME_AFTER,
      type: FieldTypeIds.IntField,
      value: model?.after && this.model?.dynamicDateTimeRangeType === DynamicDateTimeRangeTypeEnum.MINUTES ? model?.after : 0
    });

    const timeAfterField = timeAfter.getConfig();
    timeAfterField.hide = true;
    timeAfterField.validators = {
      ...validators
      // maxMinutes: (control: FormControl) => {
      //   const value = control?.value;
      //   if (value && value > 0) {
      //     const minutesLeft = this.searchFilterHelper.getMinutesLimit()?.minLeft;
      //     if (value > minutesLeft) return false;
      //     else return true;
      //   }
      //   return true;
      // }
    };
    timeAfterField.validation = {
      messages: {
        min: ErrorMessageGenerator.get(ErrorMessageTypeEnum.min, 1)
        // maxMinutes: ErrorMessageGenerator.get(ErrorMessageTypeEnum.max, this.searchFilterHelper.getMinutesLimit()?.minLeft)
      }
    };

    this.view = {
      fields: [fromField, toField, daysBeforeField, daysAfterField, timeBeforeField, timeAfterField],
      form: this.fb.group({}),
      model: {}
    };
    this.onViewChange(this.model.viewOption);
  }

  /**
   *
   * @param value On Static/Dynamic View change
   */
  onViewChange(value: PickerViewEnum): void {
    let fieldKeysTohide: string[];
    switch (value) {
      case PickerViewEnum.STATIC:
        // Hide dynamic fields
        fieldKeysTohide = [
          DynamicDateTimeRangeKeysEnum.DAYS_BEFORE,
          DynamicDateTimeRangeKeysEnum.DAYS_AFTER,
          DynamicDateTimeRangeKeysEnum.TIME_BEFORE,
          DynamicDateTimeRangeKeysEnum.TIME_AFTER
        ];
        this.hideFields(fieldKeysTohide);
        this.resetDynamicFields(true);
        break;
      case PickerViewEnum.DYNAMIC:
        // Hide Static fields
        fieldKeysTohide = [
          DynamicDateTimeRangeKeysEnum.FROM,
          DynamicDateTimeRangeKeysEnum.To,
          ...this.getAdditionalFieldsKey(this.model.dynamicDateTimeRangeType)
        ];
        this.hideFields(fieldKeysTohide);
        this.resetStaticFields();
        break;
      default:
        break;
    }
    this.model.viewOption = value;
    this.model.valueType =
      this.model.viewOption === PickerViewEnum.DYNAMIC ? FieldTypeIds.DynamicDateTimeRangeField : FieldTypeIds.DateTimeField;
    this.validate();
  }

  hideFields(keys: string[]): void {
    const viewFields: FormlyFieldConfig[] = this.view.fields;
    viewFields.forEach((x) => (x.hide = false));
    keys.forEach((key) => {
      const field = viewFields.find((field) => field.key === key);
      if (field) field.hide = true;
    });
  }

  resetStaticFields(): void {
    this.model.from = null;
    this.model.to = null;
    this.view.form?.controls?.from?.setValue(null);
    this.view.form?.controls?.to?.setValue(null);
  }

  resetDynamicFields(mainViewChanged?: boolean): void {
    this.searchFilterHelper.resetBeforeAfterValues(this.model);
    if (mainViewChanged) {
      this.view.form?.controls?.timeBefore?.setValue(0);
      this.view.form?.controls?.timeAfter?.setValue(0);
      this.view.form?.controls?.daysBefore?.setValue(0);
      this.view.form?.controls?.daysAfter?.setValue(0);
    } else if (this.model.dynamicDateTimeRangeType === DynamicDateTimeRangeTypeEnum.DAYS) {
      this.view.form?.controls?.timeBefore?.setValue(0);
      this.view.form?.controls?.timeAfter?.setValue(0);
    } else if (this.model.dynamicDateTimeRangeType === DynamicDateTimeRangeTypeEnum.MINUTES) {
      this.view.form?.controls?.daysBefore?.setValue(0);
      this.view.form?.controls?.daysAfter?.setValue(0);
    }
  }

  /**
   *
   * @param value
   * On Days/minutes view change
   */
  onSecondaryViewChange(value: DynamicDateTimeRangeTypeEnum) {
    const fieldKeysToHide = [DynamicDateTimeRangeKeysEnum.FROM, DynamicDateTimeRangeKeysEnum.To, ...this.getAdditionalFieldsKey(value)];
    this.hideFields(fieldKeysToHide);
    this.resetDynamicFields();
    this.validate();
  }

  /**
   *
   * @param value
   * @returns keys of fields based on Days/Minutes
   */
  getAdditionalFieldsKey(value: DynamicDateTimeRangeTypeEnum): string[] {
    let fieldKeysTohide: string[];
    switch (value) {
      case DynamicDateTimeRangeTypeEnum.DAYS:
        fieldKeysTohide = [DynamicDateTimeRangeKeysEnum.TIME_BEFORE, DynamicDateTimeRangeKeysEnum.TIME_AFTER];
        return fieldKeysTohide;
      case DynamicDateTimeRangeTypeEnum.MINUTES:
        fieldKeysTohide = [DynamicDateTimeRangeKeysEnum.DAYS_BEFORE, DynamicDateTimeRangeKeysEnum.DAYS_AFTER];
        return fieldKeysTohide;
      default:
        break;
    }
  }

  onChange(): void {
    this.validate(true);
    this.isFieldChanged.emit(true);
  }

  validate(fromUi?: boolean): void {
    if (this.model.viewOption === PickerViewEnum.STATIC) {
      this.showWrongDateRangeValidation = false;
      const from = fromUi ? this.view.model?.from : this.model.from;
      const to = fromUi ? this.view.model?.to : this.model.to;
      this.searchFilterHelper.resetFromToValues(this.model);
      if (from || to) {
        if (from) {
          this.model.from = this.getStaticValue(DynamicDateTimeRangeKeysEnum.FROM, from);
        }
        if (to) {
          this.model.to = this.getStaticValue(DynamicDateTimeRangeKeysEnum.To, to);
        }
        if (this.model.from && this.model.to && this.model.from > this.model.to) {
          this.model.isValid = false;
          this.showWrongDateRangeValidation = true;
        } else this.model.isValid = true;
      } else {
        this.model.isValid = false;
      }
    } else if (this.model.viewOption === PickerViewEnum.DYNAMIC) {
      this.model.isValid = true;
      if (this.model.dynamicDateTimeRangeType === DynamicDateTimeRangeTypeEnum.DAYS) {
        const before = fromUi ? this.view.model?.daysBefore : this.model.before;
        const after = fromUi ? this.view.model?.daysAfter : this.model.after;
        this.searchFilterHelper.validateRelativeRanges(DynamicDateTimeRangeTypeEnum.DAYS, this.model, before, after);
      } else if (this.model.dynamicDateTimeRangeType === DynamicDateTimeRangeTypeEnum.MINUTES) {
        const before = fromUi ? this.view.model?.timeBefore : this.model.before;
        const after = fromUi ? this.view.model?.timeAfter : this.model.after;
        this.searchFilterHelper.validateRelativeRanges(DynamicDateTimeRangeTypeEnum.MINUTES, this.model, before, after);
      }
    }
    this.isFieldChanged.emit(true);
  }

  getStaticValue(type: string, value: Date): Date {
    switch (type) {
      case DynamicDateTimeRangeKeysEnum.FROM:
        return DateTimeFormatHelper.getUtcDateTimeWithNormalizedSeconds(value);
      case DynamicDateTimeRangeKeysEnum.To:
        return DateTimeFormatHelper.getUtcDateTimeWithMaxSeconds(value);
      default:
        break;
    }
  }
}
