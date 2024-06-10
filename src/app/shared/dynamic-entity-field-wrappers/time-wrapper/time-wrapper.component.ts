/**
 * global
 */
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

/**
 * project
 */

import { FieldTypeIds, SchemaFieldDto } from '@wfm/service-layer';
import { SearchType } from '@wfm/service-layer/models/dynamic-entity-models';

/**
 * local
 */

@Component({
  selector: 'app-time-wrapper',
  templateUrl: './time-wrapper.component.html',
  styleUrls: []
})
export class TimeWrapperComponent implements OnInit {
  @Input() field: SchemaFieldDto;
  @Input() showDynamicViewOption?: boolean;
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
