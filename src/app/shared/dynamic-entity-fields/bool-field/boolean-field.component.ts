import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FieldRenderTypeEnum } from '@wfm/service-layer';
import { EqualToFilter } from '@wfm/service-layer/models/dynamic-entity-models';

@Component({
  selector: 'app-boolean-field',
  templateUrl: './boolean-field.component.html',
  styleUrls: ['./boolean-field.component.scss']
})
export class BoolFieldComponent implements OnInit {
  @Input() model: EqualToFilter<boolean>;
  @Input() renderType: FieldRenderTypeEnum;
  @Output() isFieldChanged: EventEmitter<boolean> = new EventEmitter();

  componentId = '0432fbcd-bedb-4d8f-999c-af8e3cd1741f';

  constructor() {}

  ngOnInit() {
    this.model.isValid = true;
    this.isFieldChanged.emit(true);
  }
}
