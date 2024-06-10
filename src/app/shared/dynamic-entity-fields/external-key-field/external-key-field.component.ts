import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ExternalKeySearchFilter } from '@wfm/service-layer/models/dynamic-entity-models';

@Component({
  selector: 'app-external-key-field',
  templateUrl: './external-key-field.component.html',
  styleUrls: ['./external-key-field.component.scss']
})
export class ExternalKeyFieldComponent implements OnInit {
  @Input() model: ExternalKeySearchFilter;
  @Output() isFieldChanged: EventEmitter<boolean> = new EventEmitter();
  componentId = 'a5f8c711-29f1-4b57-b489-d14d082ff91b';

  constructor() {}

  ngOnInit(): void {
    this.validate();
  }

  onChange(): void {
    this.validate();
    this.isFieldChanged.emit(true);
  }

  validate(): void {
    if (this.model.value.trim()) {
      this.model.isValid = true;
    } else {
      this.model.isValid = false;
    }
  }
}
