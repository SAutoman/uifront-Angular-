import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { RangeFilter } from '@wfm/service-layer/models/dynamic-entity-models';
import { DecimalValidation, ValidateMaxLength } from '../dynamic-fields-validator';

@Component({
  selector: 'app-decimal-field',
  templateUrl: './decimal-field.component.html',
  styleUrls: ['./decimal-field.component.scss']
})
export class DecimalFieldComponent implements OnInit, OnDestroy {
  @Input() model: RangeFilter<number>;
  @Output() isFieldChanged: EventEmitter<boolean> = new EventEmitter();
  componentId = '63caf507-35ee-4016-8908-c9eede353881';

  decimalFieldForm: FormGroup;
  subscription: Subscription;
  showInvalidRangeError: boolean = false;

  constructor(private fb: FormBuilder) {
    this.decimalFieldForm = this.fb.group({
      from: new FormControl(null, [ValidateMaxLength, DecimalValidation]),
      to: new FormControl(null, [ValidateMaxLength, DecimalValidation])
    });
    this.subscription = this.decimalFieldForm.valueChanges.subscribe((x) => {
      this.onChange();
    });
  }

  ngOnInit(): void {
    if (this.model) {
      this.decimalFieldForm.patchValue({
        from: this.model?.from,
        to: this.model?.to
      });
    }
    this.validate();
  }

  onChange(): void {
    this.validate();
    this.isFieldChanged.emit(true);
  }

  validate(): void {
    const from = this.decimalFieldForm.controls.from.value;
    const to = this.decimalFieldForm.controls.to.value;
    if ((from || to || from === 0 || to === 0) && this.decimalFieldForm.valid) {
      this.model.from = from ? parseFloat(from) : from;
      this.model.to = to ? parseFloat(to) : to;
      this.showInvalidRangeError = false;
      if (from > to) {
        this.model.isValid = false;
        this.showInvalidRangeError = true;
      } else this.model.isValid = true;
    } else {
      this.model.isValid = false;
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
