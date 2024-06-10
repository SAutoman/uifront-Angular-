/**
 * global
 */
import { Component, Input, EventEmitter, Output } from '@angular/core';
import { SearchType } from '@wfm/service-layer/models/SearchType';

/**
 * project
 */

/**
 * local
 */

@Component({
  selector: 'app-search-buttons',
  templateUrl: './search-buttons.component.html',
  styleUrls: ['./search-buttons.component.scss']
})
export class SearchButtonsComponent {
  @Input() allowedSearchTypes: SearchType[];
  @Input() searchTypeIn: SearchType;
  @Output() searchTypeOut: EventEmitter<SearchType> = new EventEmitter();
  componentId = 'ab465a0c-d34a-49c6-bebd-3478b393a7f4';

  get searchTypes() {
    return SearchType;
  }

  onSearchType(event) {
    this.searchTypeOut.emit(event.value);
  }
}
