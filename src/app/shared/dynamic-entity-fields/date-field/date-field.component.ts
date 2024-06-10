import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
/**
 * Angular
 */
import {
  DynamicDateTimeSearchValuesEnum,
  DynamicDateTimeRangeKeysEnum,
  PickerViewEnum,
  RangeFilter,
  DateTimeRangeFilter,
  DynamicDateTimeRangeTypeEnum
} from '@wfm/service-layer/models/dynamic-entity-models';
import DateTimeFormatHelper from '@wfm/shared/dateTimeFormatHelper';
import { IFormlyView } from '@wfm/common/models';
import { FormlyFieldAdapterFactory } from '@wfm/common/vendor/formly-field-adapter/formly-field-adapter.factory';
import { FieldTypeIds } from '@wfm/service-layer';
import { ErrorMessageGenerator, ErrorMessageTypeEnum } from '@wfm/common/error-message-generator';
/**
 * Project
 */
import { SearchFiltersHelperService } from '../search-filters-helper.service';
/**
 * Local
 */

@Component({
  selector: 'app-date-field',
  templateUrl: './date-field.component.html',
  styleUrls: ['./date-field.component.scss']
})
export class DateFieldComponent implements OnInit {
  @Input() model: DateTimeRangeFilter<Date>;
  @Input() showDynamicViewOption: boolean;
  @Output() isFieldChanged: EventEmitter<boolean> = new EventEmitter();
  componentId = '849381d1-5694-4ee2-8ed5-1a9387010d2a';

  showIncorrectDateRangeError: boolean = false;
  view: IFormlyView;
  get pickerViewEnum() {
    return PickerViewEnum;
  }

  constructor(private fb: FormBuilder, private ts: TranslateService, private searchFilterHelper: SearchFiltersHelperService) {}

  ngOnInit(): void {
    this.model.viewOption = this.model?.viewOption ? this.model.viewOption : PickerViewEnum.STATIC;
    this.model.dynamicSearchValue = this.model?.dynamicSearchValue ? this.model.dynamicSearchValue : DynamicDateTimeSearchValuesEnum.Date;
    this.initFormly(this.model);
  }

  initFormly(model: DateTimeRangeFilter<Date>): void {
    const from = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('From'),
      name: DynamicDateTimeRangeKeysEnum.FROM,
      type: FieldTypeIds.DateField,
      value: model?.from ? model?.from : null
    });
    const fromField = from.getConfig();

    const to = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('To'),
      name: DynamicDateTimeRangeKeysEnum.To,
      type: FieldTypeIds.DateField,
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
      value: model?.before ? model?.before : 0
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
      value: model?.after ? model?.after : 0
    });

    const daysAfterField = daysAfter.getConfig();
    daysAfterField.hide = true;
    daysAfterField.validators = validators;
    daysAfterField.validation = {
      messages: {
        min: ErrorMessageGenerator.get(ErrorMessageTypeEnum.min, 1)
      }
    };

    this.view = {
      fields: [fromField, toField, daysBeforeField, daysAfterField],
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
          (x) => x.key === DynamicDateTimeRangeKeysEnum.DAYS_BEFORE || x.key === DynamicDateTimeRangeKeysEnum.DAYS_AFTER
        );
        this.model.beforeValue = null;
        this.model.afterValue = null;
        this.view.form.controls?.daysBefore?.setValue(0);
        this.view.form.controls?.daysAfter?.setValue(0);
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
      this.model.viewOption === PickerViewEnum.DYNAMIC ? FieldTypeIds.DynamicDateTimeRangeField : FieldTypeIds.DateField;
    this.validate();
  }

  onChange(): void {
    this.validate(true);
    this.isFieldChanged.emit(true);
  }

  validate(fromUi?: boolean): void {
    this.showIncorrectDateRangeError = false;
    if (this.model.viewOption === PickerViewEnum.STATIC) {
      const from = fromUi ? this.view.model?.from : this.model.from;
      const to = fromUi ? this.view.model?.to : this.model.to;
      this.searchFilterHelper.resetFromToValues(this.model);
      if (from || to) {
        if (from) {
          this.model.from = this.getStaticValue(from);
        }
        if (to) {
          this.model.to = this.getStaticValue(to);
        }
        if (this.model.from && this.model.to && this.model.from > this.model.to) {
          this.model.isValid = false;
          this.showIncorrectDateRangeError = true;
        } else this.model.isValid = true;
      } else {
        this.model.isValid = false;
      }
    } else if (this.model.viewOption === PickerViewEnum.DYNAMIC) {
      const before = fromUi ? this.view.model?.daysBefore : this.model.before;
      const after = fromUi ? this.view.model?.daysAfter : this.model.after;
      this.searchFilterHelper.validateRelativeRanges(DynamicDateTimeRangeTypeEnum.DAYS, this.model, before, after);
    }
    this.isFieldChanged.emit(true);
  }

  getStaticValue(value: Date): Date {
    return DateTimeFormatHelper.getUTCJsDate(value);
  }
}
