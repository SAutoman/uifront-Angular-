import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { BaseComponent } from '@wfm/shared/base.component';
import { convertTenantName } from '@wfm/shared/utils';
import { showRawDataMenuSelector, tenantNameKey } from '@wfm/store';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { workflowStatesMainRoute, workflowStatesListRoute } from '@wfm/workflow-state/workflow-state.routing.module';
import { Observable } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RawDataMenuGuard extends BaseComponent implements CanActivate {
  constructor(private store: Store<ApplicationState>, private router: Router) {
    super();
  }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.store.pipe(
      select(showRawDataMenuSelector),
      takeUntil(this.destroyed$),
      map((rawDataMenuEnabled: boolean) => {
        const tenantName = localStorage.getItem(tenantNameKey);
        if (!rawDataMenuEnabled) {
          this.router.navigateByUrl(convertTenantName(tenantName + `/${workflowStatesMainRoute}/${workflowStatesListRoute}`));
          return false;
        }
        return true;
      })
    );
  }
}
