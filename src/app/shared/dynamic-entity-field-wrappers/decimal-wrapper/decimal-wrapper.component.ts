/**
 * global
 */
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

/**
 * project
 */
import { SearchType } from '@wfm/service-layer/models/dynamic-entity-models';
import { FieldTypeIds, SchemaFieldDto } from '@wfm/service-layer/';

/**
 * local
 */

@Component({
  selector: 'app-decimal-wrapper',
  templateUrl: './decimal-wrapper.component.html',
  styleUrls: []
})
export class DecimalWrapperComponent implements OnInit {
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
