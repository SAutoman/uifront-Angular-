import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { RangeFilter } from '@wfm/service-layer/models/dynamic-entity-models';
import { ValidateMaxLength } from '../dynamic-fields-validator';

@Component({
  selector: 'app-number-field',
  templateUrl: './number-field.component.html',
  styleUrls: ['./number-field.component.scss']
})
export class NumberFieldComponent implements OnInit, OnDestroy {
  @Input() model: RangeFilter<number>;
  @Output() isFieldChanged: EventEmitter<boolean> = new EventEmitter();
  componentId = '63a021de-3a6a-492b-b1d3-e140946e1985';

  numberFieldForm: FormGroup;
  subscription: Subscription;
  showInvalidRangeError: boolean = false;

  constructor(private fb: FormBuilder) {
    this.numberFieldForm = this.fb.group({
      from: new FormControl(null, [ValidateMaxLength]),
      to: new FormControl(null, [ValidateMaxLength])
    });
    this.subscription = this.numberFieldForm.valueChanges.subscribe((x) => {
      this.onChange();
    });
  }

  ngOnInit(): void {
    if (this.model) {
      this.numberFieldForm.patchValue({
        from: this.model?.from,
        to: this.model?.to
      });
    }
  }

  onChange(): void {
    this.validate();
    this.isFieldChanged.emit(true);
  }

  validate(): void {
    const from = this.numberFieldForm.controls.from.value;
    const to = this.numberFieldForm.controls.to.value;
    this.showInvalidRangeError = false;
    if ((from || to || from === 0 || to === 0) && this.numberFieldForm.valid) {
      this.model.from = from ? parseInt(from) : from;
      this.model.to = to ? parseInt(to) : to;
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
