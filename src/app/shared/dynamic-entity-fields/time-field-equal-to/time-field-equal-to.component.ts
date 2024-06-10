/**
 * global
 */
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

/**
 * project
 */

import { EqualToFilter } from '@wfm/service-layer/models/dynamic-entity-models';

/**
 * local
 */

@Component({
  selector: 'app-time-field-equal-to',
  templateUrl: './time-field-equal-to.component.html',
  styleUrls: ['./time-field-equal-to.component.scss']
})
export class TimeFieldEqualToComponent implements OnInit {
  @Input() model: EqualToFilter<String>;
  @Output() isFieldChanged: EventEmitter<boolean> = new EventEmitter();
  componentId = '6209c888-a0ef-4ace-87a0-8b9cdcb2828a';

  constructor() {}

  ngOnInit(): void {
    this.validate();
  }

  onChange(): void {
    this.validate();
    this.isFieldChanged.emit(true);
  }

  validate(): void {
    if (this.model.value) {
      this.model.isValid = true;
    } else {
      this.model.isValid = false;
    }
  }
}
