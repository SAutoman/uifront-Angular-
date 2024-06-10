/**
 * global
 */

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';

/**
 * project
 */

@Component({
  selector: 'app-formly-list-of-entities',
  templateUrl: './formly-list-of-entities.component.html',
  styleUrls: ['./formly-list-of-entities.component.scss'],
  providers: []
})
export class FormlyListOfEntitiesComponent extends FieldType implements OnInit {
  // field: FormlyFieldConfig;
  // value: string[];
  // actions: GridAction[];
  // tenantId: string;
  // gridData: GridDataResult;
  // schemaFields: SchemaFieldDto[];
  // columnsConfig: ColumnSettings[];

  constructor() {
    super();
  }

  ngOnInit() {}

  getColumnsConfig() {}

  async getRows(): Promise<void> {}

  actionClicked(dataItem: any, actionId: string) {}
}
