import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { EqualToFilter } from '@wfm/service-layer/models/dynamic-entity-models';
import { ValidateMaxLength } from '../dynamic-fields-validator';

@Component({
  selector: 'app-number-field-equal-to',
  templateUrl: './number-field-equal-to.component.html',
  styleUrls: ['./number-field-equal-to.component.scss']
})
export class NumberFieldEqualToComponent implements OnInit, OnDestroy {
  @Input() model: EqualToFilter<number>;
  @Output() isFieldChanged: EventEmitter<boolean> = new EventEmitter();
  componentId = '07066591-e301-460a-9c45-b5825a4f3025';

  equalTo: FormControl = new FormControl(null, [ValidateMaxLength]);
  subscription: Subscription;

  constructor() {}

  ngOnInit(): void {
    this.subscription = this.equalTo.valueChanges.subscribe((x) => {
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
    if (value && this.equalTo.valid) {
      this.model.value = parseInt(value);
      this.model.isValid = true;
    } else {
      this.model.isValid = false;
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
