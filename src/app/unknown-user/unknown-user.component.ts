/**
 * global
 */
import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { takeUntil, filter } from 'rxjs/operators';

/**
 * project
 */
import { currentErrorMessage, ApplicationState } from '../store';
import { TenantComponent } from '../shared/tenant.component';

/**
 * local
 */

@Component({
  selector: 'app-unknown-user',
  templateUrl: './unknown-user.component.html',
  styleUrls: ['./unknown-user.component.scss']
})
export class UnknownUserComponent extends TenantComponent implements OnInit {
  errorMessage: string;
  componentId = '4f4e492c-59b3-46f8-a068-ec4be4beafab';

  constructor(private store: Store<ApplicationState>) {
    super(store);

    this.store
      .pipe(
        takeUntil(this.destroyed$),
        select(currentErrorMessage),
        filter((id) => !!id)
      )
      .subscribe((m) => {
        this.errorMessage = m;
      });
  }
  ngOnInit(): void {
    this.cleanCookies();
    this.cleanStorage();
    setTimeout(() => {
      this.cleanCookies();
    }, 1000);
  }

  private cleanCookies(): void {
    document.cookie.split(';').forEach((x) => {
      const eqPos = x.indexOf('=');
      const name = eqPos > -1 ? x.substr(0, eqPos) : x;
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    });
  }
  private cleanStorage(): void {
    localStorage.clear();
  }
}
