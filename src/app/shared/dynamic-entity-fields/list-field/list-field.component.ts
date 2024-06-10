/**
 * global
 */
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';

/**
 * project
 */
import { AuthState } from '@wfm/store/auth/auth.reducer';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ListsService, ListItemDisplayEnum } from '@wfm/service-layer';
import { ListSearchFilter } from '@wfm/service-layer/models/dynamic-entity-models';
import { KeyValue } from '@angular/common';
import { populateListOptionValue } from '@wfm/service-layer/helpers/list-item-display.helper';

/**
 * local
 */

@Component({
  selector: 'app-list-field',
  templateUrl: './list-field.component.html',
  styleUrls: ['./list-field.component.scss']
})
export class ListFieldComponent extends TenantComponent implements OnInit {
  @Input() model: ListSearchFilter<string>;
  @Input() displaySetting?: ListItemDisplayEnum;
  listItems: KeyValue<string, string>[];
  @Output() isFieldChanged: EventEmitter<boolean> = new EventEmitter();

  componentId = '9aaf6c63-b04b-4258-a08b-659c48c4a070';

  constructor(private listsService: ListsService, store: Store<AuthState>) {
    super(store);
  }

  async ngOnInit(): Promise<void> {
    const data = await this.listsService.getListItems(this.tenant, this.model.listId, this.model.parentListId);
    this.listItems = data.items.map((listItem) => {
      return {
        key: populateListOptionValue(listItem, this.displaySetting),
        value: listItem.id
      };
    });
  }

  onChange(data: { value: string[] }): void {
    this.model.isValid = true;
    this.model.items = data.value;
    this.isFieldChanged.emit(true);
  }
}
