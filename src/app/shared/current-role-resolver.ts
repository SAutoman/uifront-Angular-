/**
 * global
 */
import { Injectable } from '@angular/core';

import { Resolve } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

/**
 * project
 */
import { currentSelectedRole, ApplicationState } from '../store';

/**
 * local
 */

@Injectable()
export class CurrentRoleResolver implements Resolve<Observable<boolean>> {
  private _sub$ = new Subject<boolean>();

  constructor(private store: Store<ApplicationState>) {
    this.store
      .pipe(
        takeUntil(this._sub$),
        select(currentSelectedRole),
        filter((x) => !!x)
      )
      .subscribe((_) => {
        this._sub$.next(true);
        this._sub$.complete();
      });
  }

  resolve() {
    return this._sub$.asObservable();
  }
}
