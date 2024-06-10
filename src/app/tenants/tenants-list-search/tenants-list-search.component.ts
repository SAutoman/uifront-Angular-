import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { takeUntil, distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { BaseComponent } from '@wfm/shared/base.component';

@Component({
  selector: 'app-tenants-list-search',
  templateUrl: './tenants-list-search.component.html',
  styleUrls: ['./tenants-list-search.component.scss']
})
export class TenantsListSearchComponent extends BaseComponent implements OnInit {
  @Output() searchTerm = new EventEmitter<string>();
  search: FormControl = new FormControl();

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.search.valueChanges
      .pipe(takeUntil(this.destroyed$), distinctUntilChanged(), debounceTime(300))
      .subscribe((x) => this.emitSearchTerm(x));
  }

  emitSearchTerm(term: string): void {
    this.searchTerm.emit(term);
  }
}
