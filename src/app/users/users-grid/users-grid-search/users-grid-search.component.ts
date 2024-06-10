/**
 * global
 */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

/**
 * project
 */
import { SearchType } from '@wfm/service-layer/models/dynamic-entity-models';
import { FieldTypeIds, IFilter } from '@wfm/service-layer';

@Component({
  selector: 'app-users-grid-search',
  templateUrl: './users-grid-search.component.html',
  styleUrls: ['./users-grid-search.component.scss']
})
export class UsersGridSearchComponent implements OnInit {
  @Input() loading: boolean = true;
  @Output() filtersEmitter: EventEmitter<IFilter[]> = new EventEmitter();
  @Output() searchClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  fields: { name: string; value: string; icon: string }[];

  btnName: string = 'Load';
  searchActive: boolean = false;
  searchForm: FormGroup;
  componentId = 'f955ee29-0a51-4a1d-8c25-88720a7be9f0';

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      name: 'filters',
      filters: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.fields = [
      { name: 'First Name', value: 'Name', icon: 'user' },
      { name: 'Last Name', value: 'LastName', icon: 'user' },
      { name: 'Email', value: 'Email', icon: 'email' },
      { name: 'Phone', value: 'Phone', icon: 'phone' }
    ];
  }

  addFilter($event: { value: { name: string; value: string; icon: string } }): void {
    const selectedValue = $event.value.value;
    const selectedName = $event.value.name;
    const selectedIcon = $event.value.icon;
    const check = this.searchForm.value.filters.find((x) => x.fieldName === selectedValue);
    if (check) {
      return;
    }

    this.filters().push(this.newFilter(selectedValue, selectedName, selectedIcon));
    this.setButtonName();
  }

  filters(): FormArray {
    return this.searchForm.get('filters') as FormArray;
  }

  newFilter(filterValue: string, filtername: string, iconName: string): FormGroup {
    return this.fb.group({
      name: filtername,
      fieldName: filterValue,
      valueType: FieldTypeIds.StringField,
      searchType: SearchType.Like,
      icon: iconName,
      value: ''
    });
  }

  removeFilter(i: number) {
    this.filters().removeAt(i);
    this.setButtonName();
  }

  setButtonName(): void {
    this.searchActive = this.searchForm.value.filters && this.searchForm.value.filters.length > 0 ? true : false;
    this.btnName = this.searchForm.value.filters && this.searchForm.value.filters.length > 0 ? 'Search' : 'Load';
  }

  onSubmit() {
    this.filtersEmitter.next(this.searchForm.value.filters);
  }
  searchCloseClicked() {
    this.searchClose.emit(false);
  }
}
