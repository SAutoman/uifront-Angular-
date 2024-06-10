/**
 * global
 */
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { takeUntil, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

/**
 * project
 */

/**
 * local
 */
import { AuthState, isSuperAdminSelector } from '../../store';
import { BaseComponent } from '../../shared/base.component';

@Injectable({
  providedIn: 'root'
})
export class SuperAdminGuard extends BaseComponent implements CanActivate {
  constructor(private store: Store<AuthState>, private router: Router) {
    super();
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.store.pipe(
      takeUntil(this.destroyed$),
      select(isSuperAdminSelector),
      map((auth) => {
        console.log('SuperAdminGuard');
        if (auth) {
          return true;
        } else {
          this.router.navigateByUrl('error/404');
          return false;
        }
      })
    );
  }
}
