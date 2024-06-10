import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LikeFilter } from '@wfm/service-layer/models/dynamic-entity-models';

@Component({
  selector: 'app-str-field',
  templateUrl: './str-field.component.html',
  styleUrls: ['./str-field.component.scss']
})
export class StrFieldComponent implements OnInit {
  @Input() model: LikeFilter<string>;
  @Output() isFieldChanged: EventEmitter<boolean> = new EventEmitter();
  componentId = '0a9209f7-936b-4bcd-a3ad-d0c64ae07ffb';

  constructor() {}

  ngOnInit(): void {
    this.validate();
  }

  onChange(): void {
    this.validate();
    this.isFieldChanged.emit(true);
  }

  validate(): void {
    this.model.isValid = this.model.value?.toString()?.trim()?.length ? true : false;
  }
}
