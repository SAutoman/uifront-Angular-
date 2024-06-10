/**
 * Global
 */
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete/autocomplete';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { startWith, map, takeUntil } from 'rxjs/operators';
/**
 * Project
 */
import { Paging } from '@wfm/service-layer';
import { currentPageSelector, FetchTenants, FetchTenantsPayload, TenantsState } from '@wfm/store';
import { TenantViewModel } from '@wfm/tenants/tenant.model';
/**
 * Local
 */
import { TenantComponent } from '../tenant.component';

@Component({
  selector: 'app-tenant-search-auto-complete',
  templateUrl: './tenant-search-auto-complete.component.html',
  styleUrls: ['./tenant-search-auto-complete.component.scss']
})
export class TenantSearchAutoCompleteComponent extends TenantComponent implements OnInit {
  @Output() tenantEmitter: EventEmitter<TenantViewModel> = new EventEmitter();

  tenantIdControl = new FormControl('');
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions: Observable<string[]>;

  allTenants: TenantViewModel[];
  filteredTenants: Observable<TenantViewModel[]>;

  constructor(private store: Store<TenantsState>) {
    super(store);
  }

  ngOnInit() {
    this.fetchAllTenants();
    this.store.pipe(select(currentPageSelector), takeUntil(this.destroyed$)).subscribe((tenantData) => {
      if (tenantData?.gridData?.data?.length > 0) {
        this.allTenants = tenantData?.gridData?.data.filter((tenant) => tenant.id && tenant.name);
        this.filteredTenants = this.tenantIdControl.valueChanges.pipe(
          startWith(''),
          map((value) => (typeof value === 'string' ? value : value.name)),
          map((name) => (name ? this._filter(name) : this.allTenants.slice()))
        );
      }
    });
  }

  displayFn(tenant: TenantViewModel): string {
    return tenant && tenant.name ? tenant.name : '';
  }

  private _filter(name: string): TenantViewModel[] {
    const filterValue = name.toLowerCase();
    return this.allTenants?.filter((option) => option.name.toLowerCase().includes(filterValue));
  }

  fetchAllTenants(): void {
    const paging = <Paging>{ skip: 0, take: 9999 };
    this.store.dispatch(new FetchTenants(<FetchTenantsPayload>{ paging }));
  }

  onTenantChange(event: MatAutocompleteSelectedEvent): void {
    this.tenantEmitter.emit(<TenantViewModel>event.option.value);
  }
}
