/**
 * global
 */
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { cloneDeep } from 'lodash-core';
import { TranslateService } from '@ngx-translate/core';

/**
 * project
 */

import { EqualToFilter } from '@wfm/service-layer/models/dynamic-entity-models';

import DateTimeFormatHelper from '@wfm/shared/dateTimeFormatHelper';

import { FormBuilder } from '@angular/forms';
import { IFormlyView } from '@wfm/common/models';
import { FormlyFieldAdapterFactory } from '@wfm/common/vendor';
import { FieldTypeIds } from '@wfm/service-layer';

/**
 * local
 */

@Component({
  selector: 'app-date-time-field-equal-to',
  templateUrl: './date-time-field-equal-to.component.html',
  styleUrls: ['./date-time-field-equal-to.component.scss']
})
export class DateTimeFieldEqualToComponent implements OnInit {
  @Input() model: EqualToFilter<Date>;
  @Input() isSystem: boolean;
  @Output() isFieldChanged: EventEmitter<boolean> = new EventEmitter();
  componentId = 'f8989e2b-c75e-496c-ba9b-0914c92d599a';
  view: IFormlyView;

  constructor(private fb: FormBuilder, private ts: TranslateService) {}

  ngOnInit(): void {
    const dateValue = cloneDeep(this.model.value);
    this.validate(dateValue);
    this.initFormly(dateValue);
  }

  initFormly(dateValue: Date): void {
    const dateAdapter = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('Date'),
      name: 'date',
      type: FieldTypeIds.DateTimeField,
      value: dateValue,
      required: true
    });

    const dateField = dateAdapter.getConfig();
    this.view = {
      fields: [dateField],
      form: this.fb.group({}),
      model: {}
    };
  }

  onChange(): void {
    this.validate(this.view.model.date);
    this.isFieldChanged.emit(true);
  }

  validate(dateValue: Date): void {
    this.model.value = null;

    if (dateValue) {
      this.model.isValid = true;
      this.model.value = DateTimeFormatHelper.getUtcDateTimeWithNormalizedSeconds(dateValue);
    } else {
      this.model.isValid = false;
    }
  }
}
