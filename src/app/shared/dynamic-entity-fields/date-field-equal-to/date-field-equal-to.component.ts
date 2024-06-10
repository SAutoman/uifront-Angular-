/**
 * global
 */
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

/**
 * project
 */

import { EqualToFilter } from '@wfm/service-layer/models/dynamic-entity-models';
import DateTimeFormatHelper from '@wfm/shared/dateTimeFormatHelper';

/**
 * local
 */

@Component({
  selector: 'app-date-field-equal-to',
  templateUrl: './date-field-equal-to.component.html',
  styleUrls: ['./date-field-equal-to.component.scss']
})
export class DateFieldEqualToComponent implements OnInit, OnDestroy {
  @Input() model: EqualToFilter<Date>;
  @Output() isFieldChanged: EventEmitter<boolean> = new EventEmitter();
  componentId = '2ce20e32-ad8e-40a7-be09-91028a41345b';

  equalTo: FormControl = new FormControl(null, Validators.required);
  subscription: Subscription;

  constructor() {}

  ngOnInit(): void {
    this.subscription = this.equalTo.valueChanges.subscribe(() => {
      this.onChange();
    });
    if (this.model) {
      this.equalTo.setValue(this.model.value);
    }
  }

  onChange(): void {
    this.validate();
    this.isFieldChanged.emit(true);
  }

  validate(): void {
    const value = this.equalTo.value;
    if (value) {
      this.model.isValid = true;
      this.model.value = DateTimeFormatHelper.parseToLuxon(value)?.toJSDate();
    } else {
      this.model.isValid = false;
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
