import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { EqualToFilter } from '@wfm/service-layer/models/dynamic-entity-models';
import { DecimalValidation, ValidateMaxLength } from '../dynamic-fields-validator';

@Component({
  selector: 'app-decimal-field-equal-to',
  templateUrl: './decimal-field-equal-to.component.html',
  styleUrls: ['./decimal-field-equal-to.component.scss']
})
export class DecimalFieldEqualToComponent implements OnInit, OnDestroy {
  @Input() model: EqualToFilter<number>;
  @Output() isFieldChanged: EventEmitter<boolean> = new EventEmitter();
  componentId = '0b270fec-f7da-49e1-9153-e7af9e62e054';
  equalTo: FormControl = new FormControl(null, [Validators.required, ValidateMaxLength, DecimalValidation]);
  subscription: Subscription;

  constructor() {}

  ngOnInit(): void {
    this.subscription = this.equalTo.valueChanges.subscribe(() => this.onChange());
    if (this.model) {
      this.equalTo.setValue(this.model?.value);
    }
  }

  onChange(): void {
    this.validate();
    this.isFieldChanged.emit(true);
  }

  validate(): void {
    const value = this.equalTo.value;
    if (value && this.equalTo.valid) {
      this.model.value = parseFloat(value);
      this.model.isValid = true;
    } else {
      this.model.isValid = false;
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
