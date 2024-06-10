import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FieldTypeIds, SchemaFieldDto } from '@wfm/service-layer';
import { SearchType } from '@wfm/service-layer/models/dynamic-entity-models';

@Component({
  selector: 'app-number-wrapper',
  templateUrl: './number-wrapper.component.html',
  styleUrls: []
})
export class NumberWrapperComponent implements OnInit {
  @Input() field: SchemaFieldDto;
  @Output() isFieldChanged: EventEmitter<boolean> = new EventEmitter();

  get fieldTypeIds(): typeof FieldTypeIds {
    return FieldTypeIds;
  }
  get searchTypes(): typeof SearchType {
    return SearchType;
  }

  constructor() {}

  ngOnInit(): void {}

  onFieldChanged(): void {
    this.isFieldChanged.emit(true);
  }
}
