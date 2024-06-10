import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { AuthState, currentSelectedRole } from '@wfm/store';
import { Observable } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { TenantComponent } from './tenant.component';

@Injectable({
  providedIn: 'root'
})
export class TenantAdminGuard extends TenantComponent implements CanActivate {
  constructor(private store: Store<AuthState>, private router: Router) {
    super(store);
  }
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.store.pipe(
      takeUntil(this.destroyed$),
      select(currentSelectedRole),
      map((role) => {
        if (role) {
          if (role.toLowerCase() === 'tenantadmin') {
            return true;
          } else {
            this.router.navigateByUrl('error/404');
            return false;
          }
        } else {
          this.router.navigateByUrl('error/404');
          return false;
        }
      })
    );
  }
}
