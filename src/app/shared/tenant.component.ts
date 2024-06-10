/**
 * global
 */
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

/**
 * project
 */
import { currentTenantSelector } from '../store/auth/auth.selectors';

/**
 * local
 */
import { BaseComponent } from './base.component';

export class TenantComponent extends BaseComponent {
  tenant: string;
  tenantChanged: (tenant: string) => void;
  tenant$: Observable<string>;

  constructor(store: Store<any>, subscribe = true) {
    super();
    this.tenant$ = store.pipe(
      takeUntil(this.destroyed$),
      select(currentTenantSelector),
      filter((id) => !!id)
    );
    if (subscribe) {
      this.tenant$.subscribe((t) => {
        this.tenant = t;
        if (this.tenantChanged) {
          this.tenantChanged(t);
        }
      });
    }
  }
}
