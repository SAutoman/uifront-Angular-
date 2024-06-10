import { Component, EventEmitter, Output } from '@angular/core';

import { SelectType } from '@wfm/obsolete-components/process-step/models';

interface IListItem {
  name: string;
  selected: boolean;
  type: SelectType;
}
@Component({
  selector: 'app-form-type-list',
  templateUrl: './form-type-list.component.html',
  styleUrls: ['./form-type-list.component.scss']
})
export class FormTypeListComponent {
  @Output() change = new EventEmitter<SelectType>();
  chips: IListItem[];
  constructor() {
    this.chips = [
      {
        name: 'Forms',
        selected: false,
        type: SelectType.Forms
      },
      {
        name: 'Fields',
        selected: false,
        type: SelectType.Fields
      },
      {
        name: 'Lists',
        selected: false,
        type: SelectType.Lists
      }
    ];
  }

  select(item: IListItem): void {
    item.selected = !item.selected;
    this.chips.forEach((x) => {
      if (x !== item) {
        x.selected = false;
      }
    });
    this.change.next(item.selected ? item.type : undefined);
  }
}
