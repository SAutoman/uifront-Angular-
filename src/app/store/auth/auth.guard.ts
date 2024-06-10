/**
 * global
 */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';

/**
 * project
 */
import { Roles } from '@wfm/service-layer';
import { ApplicationState } from '../application-state';

/**
 * local
 */

@Injectable()
export class AuthGuard implements CanActivate {
  selectedRole: Roles;
  private subject = new Subject<boolean>();

  constructor(private router: Router, private store: Store<ApplicationState>) {
    // this.store.pipe(
    //   takeUntil(this.destroyed$),
    //   select(currentSelectedRole),
    //   filter(role => !!role)
    // ).subscribe(role => {
    //   this.subject.next(true);
    // });
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    {
      // return this.subject.asObservable();
      return true;
    }
  }
}
