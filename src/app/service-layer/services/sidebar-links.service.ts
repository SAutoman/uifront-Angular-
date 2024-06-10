/**
 * global
 */
import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { filter } from 'rxjs/operators';

/**
 * project
 */
import { currentTenantName } from '@wfm/store/auth/auth.selectors';
import { nameToProperty } from '@wfm/service-layer/helpers';

/**
 * local
 */

@Injectable({
  providedIn: 'root'
})
export class SidebarLinksService {
  tenantName: string;
  resetTenant: () => void;

  constructor(private store: Store<any>) {
    this.store
      .pipe(
        select(currentTenantName),
        filter((x) => !!x)
      )
      .subscribe((data) => {
        this.tenantName = data;

        if (this.resetTenant) {
          this.resetTenant();
        }
      });
  }

  getTenantNameAsProperty(): string {
    return nameToProperty(this.tenantName);
  }
}
