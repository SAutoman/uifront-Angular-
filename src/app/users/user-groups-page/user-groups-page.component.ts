/**
 * global
 */
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';

import { from, Observable } from 'rxjs';
import { filter, map, publishReplay, refCount, switchMap, takeUntil } from 'rxjs/operators';

/**
 * project
 */
import { BaseComponent } from '@wfm/shared/base.component';
import { currentTenantSelector } from '@wfm/store';
import { User, UsersService } from '@wfm/service-layer';
/**
 * local
 */

@Component({
  selector: 'app-user-groups-page',
  templateUrl: './user-groups-page.component.html',
  styleUrls: ['./user-groups-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UserGroupsPageComponent extends BaseComponent implements OnInit {
  /**
   * Lazy users, make request once, then return cached value
   */
  users$: Observable<User[]>;
  tenantId$: Observable<string>;
  constructor(private store: Store<any>, private usersService: UsersService) {
    super();
  }

  ngOnInit(): void {
    this.tenantId$ = this.store.select(currentTenantSelector).pipe(
      takeUntil(this.destroyed$),
      filter((x) => !!x)
    );
    // this.users$ = this.tenantId$.pipe(
    //   switchMap((tenantId) => {
    //     return from(this.usersService.searchByTenant(tenantId));
    //   }),
    //   map((x) => x.items),
    //   publishReplay(1),
    //   refCount()
    // );
  }
}
