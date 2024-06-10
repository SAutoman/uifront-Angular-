import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { DateTime } from 'luxon';
/**
 * Global
 */
import { FormlyFieldAdapterFactory } from '@wfm/common/vendor/formly-field-adapter/formly-field-adapter.factory';
import { FieldTypeIds } from '@wfm/service-layer';
import {
  DynamicDateTimeSearchValuesEnum,
  DynamicDateTimeRangeKeysEnum,
  PickerViewEnum,
  DateTimeRangeFilter,
  DynamicDateTimeRangeTypeEnum
} from '@wfm/service-layer/models/dynamic-entity-models';
import { IFormlyView } from '@wfm/common/models';
import { ErrorMessageGenerator, ErrorMessageTypeEnum } from '@wfm/common/error-message-generator';
/**
 * Project
 */
import { SearchFiltersHelperService } from '../search-filters-helper.service';
/**
 * Local
 */

@Component({
  selector: 'app-time-field',
  templateUrl: './time-field.component.html',
  styleUrls: ['./time-field.component.scss']
})
export class TimeFieldComponent implements OnInit {
  @Input() model: DateTimeRangeFilter<String>;
  @Input() showDynamicViewOption?: boolean;
  @Output() isFieldChanged: EventEmitter<boolean> = new EventEmitter();
  componentId = '7854d0d6-0e2e-47a3-9dbb-9fedf1c77952';
  view: IFormlyView;

  get pickerViewEnum() {
    return PickerViewEnum;
  }

  constructor(private fb: FormBuilder, private ts: TranslateService, private searchFilterHelper: SearchFiltersHelperService) {}

  ngOnInit(): void {
    this.model.viewOption = this.model?.viewOption ? this.model.viewOption : PickerViewEnum.STATIC;
    this.model.dynamicSearchValue = this.model?.dynamicSearchValue ? this.model.dynamicSearchValue : DynamicDateTimeSearchValuesEnum.Time;
    this.initFormly(this.model);
  }

  initFormly(model: DateTimeRangeFilter<String>): void {
    const fromTime = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('From'),
      name: DynamicDateTimeRangeKeysEnum.FROM,
      type: FieldTypeIds.TimeField,
      value: model?.from && model.from !== '00:00' ? model?.from : null
    });

    const fromTimeField = fromTime.getConfig();

    const toTime = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('To'),
      name: DynamicDateTimeRangeKeysEnum.To,
      type: FieldTypeIds.TimeField,
      value: model?.to && model.to !== '00:00' ? model?.to : null
    });

    const toTimeField = toTime.getConfig();

    const validators = {
      min: (control: FormControl) => {
        return control?.value < 0 ? false : true;
      }
    };

    const timeBefore = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('Minutes Before Current Time'),
      name: DynamicDateTimeRangeKeysEnum.TIME_BEFORE,
      type: FieldTypeIds.IntField,
      value: model?.before ? model?.before : 0
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
      value: model?.after ? model?.after : 0
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
      fields: [fromTimeField, toTimeField, timeBeforeField, timeAfterField],
      form: this.fb.group({}),
      model: {}
    };
    this.onViewChange(this.model.viewOption);
  }

  onViewChange(value: PickerViewEnum): void {
    const viewFields: FormlyFieldConfig[] = this.view.fields;
    viewFields.forEach((x) => (x.hide = false));
    let fieldsToBeHidden: FormlyFieldConfig[] = [];
    switch (value) {
      case PickerViewEnum.STATIC:
        fieldsToBeHidden = viewFields.filter(
          (x) => x.key === DynamicDateTimeRangeKeysEnum.TIME_BEFORE || x.key === DynamicDateTimeRangeKeysEnum.TIME_AFTER
        );
        this.model.before = null;
        this.model.after = null;
        this.view.form.controls?.timeBefore?.setValue(0);
        this.view.form.controls?.timeAfter?.setValue(0);
        break;
      case PickerViewEnum.DYNAMIC:
        fieldsToBeHidden = viewFields.filter(
          (x) => x.key === DynamicDateTimeRangeKeysEnum.FROM || x.key === DynamicDateTimeRangeKeysEnum.To
        );
        this.model.from = null;
        this.model.to = null;
        this.view.form.controls?.from?.setValue(null);
        this.view.form.controls?.to?.setValue(null);
        break;
      default:
        break;
    }
    if (fieldsToBeHidden?.length) {
      fieldsToBeHidden.forEach((field) => (field.hide = true));
    }
    this.model.viewOption = value;
    this.model.valueType =
      this.model.viewOption === PickerViewEnum.DYNAMIC ? FieldTypeIds.DynamicDateTimeRangeField : FieldTypeIds.TimeField;
    this.validate();
  }

  onChange(): void {
    this.validate(true);
    this.isFieldChanged.emit(true);
  }

  validate(fromUi?: boolean): void {
    if (this.model.viewOption === PickerViewEnum.STATIC) {
      this.model.isValid = true;
      this.model.isValidRange = true;
      const from = fromUi ? this.view.model?.from : this.model.from;
      const to = fromUi ? this.view.model?.to : this.model.to;
      this.searchFilterHelper.resetFromToValues(this.model);
      if (from || to) {
        let fromTime: DateTime, toTime: DateTime;
        if (from) {
          fromTime = this.getStaticValue(from);
          this.model.from = from;
          if (!to) this.model.to = '00:00';
        }
        if (to) {
          toTime = this.getStaticValue(to);
          this.model.to = to;
          if (!from) this.model.from = '00:00';
        }
        if (fromTime && toTime && fromTime > toTime) {
          this.model.isValid = false;
          this.model.isValidRange = false;
        }
      } else this.model.isValid = false;
    } else if (this.model.viewOption === PickerViewEnum.DYNAMIC) {
      this.model.isValid = true;
      const before = fromUi ? this.view.model?.timeBefore : this.model.before;
      const after = fromUi ? this.view.model?.timeAfter : this.model.after;
      this.searchFilterHelper.validateRelativeRanges(DynamicDateTimeRangeTypeEnum.MINUTES, this.model, before, after);
    }
  }

  getStaticValue(value: String): DateTime {
    return DateTime.fromFormat(`${value}`, 'HH:mm');
  }
}
