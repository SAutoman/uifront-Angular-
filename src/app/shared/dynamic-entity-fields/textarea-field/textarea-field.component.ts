import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LikeFilter } from '@wfm/service-layer/models/dynamic-entity-models';

@Component({
  selector: 'app-textarea-field',
  templateUrl: './textarea-field.component.html',
  styleUrls: ['./textarea-field.component.scss']
})
export class TextareaFieldComponent implements OnInit {
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
    this.model.isValid = this.model.value ? true : false;
  }
}
